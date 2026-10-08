import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export type QuizBest = { score: number; totalQuestions: number };

type ProgressContextValue = {
  /** true while the server copy of progress is loading */
  isLoading: boolean;
  /** signed-in users persist to the database; guests get session-only state */
  isPersistent: boolean;
  completedSectionIds: Set<string>;
  isSectionComplete: (sectionId: string) => boolean;
  completedCountForModule: (moduleId: string, sectionIds: string[]) => number;
  toggleSection: (moduleId: string, sectionId: string) => void;
  quizBestByModule: Record<string, QuizBest>;
  submitQuiz: (moduleId: string, score: number, totalQuestions: number) => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Session-only fallback for guests (explicitly not persistent).
  const [guestCompleted, setGuestCompleted] = useState<Set<string>>(new Set());
  const [guestQuiz, setGuestQuiz] = useState<Record<string, QuizBest>>({});

  const progressQuery = trpc.progress.mine.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const quizQuery = trpc.progress.myQuizResults.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const completeMutation = trpc.progress.completeSection.useMutation({
    onSuccess: () => utils.progress.mine.invalidate(),
  });
  const resetMutation = trpc.progress.resetSection.useMutation({
    onSuccess: () => utils.progress.mine.invalidate(),
  });
  const quizMutation = trpc.progress.submitQuiz.useMutation({
    onSuccess: () => utils.progress.myQuizResults.invalidate(),
  });

  const completedSectionIds = useMemo(() => {
    if (isAuthenticated) {
      return new Set((progressQuery.data ?? []).map((r) => r.sectionId));
    }
    return guestCompleted;
  }, [isAuthenticated, progressQuery.data, guestCompleted]);

  const quizBestByModule = useMemo(() => {
    if (isAuthenticated) {
      const map: Record<string, QuizBest> = {};
      for (const r of quizQuery.data ?? []) {
        map[r.moduleId] = { score: r.score, totalQuestions: r.totalQuestions };
      }
      return map;
    }
    return guestQuiz;
  }, [isAuthenticated, quizQuery.data, guestQuiz]);

  const isSectionComplete = useCallback(
    (sectionId: string) => completedSectionIds.has(sectionId),
    [completedSectionIds],
  );

  const completedCountForModule = useCallback(
    (_moduleId: string, sectionIds: string[]) =>
      sectionIds.filter((id) => completedSectionIds.has(id)).length,
    [completedSectionIds],
  );

  const toggleSection = useCallback(
    (moduleId: string, sectionId: string) => {
      const isDone = completedSectionIds.has(sectionId);
      if (isAuthenticated) {
        if (isDone) resetMutation.mutate({ sectionId });
        else completeMutation.mutate({ moduleId, sectionId });
      } else {
        setGuestCompleted((prev) => {
          const next = new Set(prev);
          if (next.has(sectionId)) next.delete(sectionId);
          else next.add(sectionId);
          return next;
        });
      }
    },
    [isAuthenticated, completedSectionIds, completeMutation, resetMutation],
  );

  const submitQuiz = useCallback(
    (moduleId: string, score: number, totalQuestions: number) => {
      if (isAuthenticated) {
        quizMutation.mutate({ moduleId, score, totalQuestions });
      } else {
        setGuestQuiz((prev) => {
          const prevBest = prev[moduleId];
          if (prevBest && prevBest.score >= score) return prev;
          return { ...prev, [moduleId]: { score, totalQuestions } };
        });
      }
    },
    [isAuthenticated, quizMutation],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      isLoading: isAuthenticated && progressQuery.isLoading,
      isPersistent: isAuthenticated,
      completedSectionIds,
      isSectionComplete,
      completedCountForModule,
      toggleSection,
      quizBestByModule,
      submitQuiz,
    }),
    [
      isAuthenticated,
      progressQuery.isLoading,
      completedSectionIds,
      isSectionComplete,
      completedCountForModule,
      toggleSection,
      quizBestByModule,
      submitQuiz,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
