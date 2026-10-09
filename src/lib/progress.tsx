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
  /** true only when a signed-in user has a database-backed account */
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
  const { user } = useAuth();

  const isPersistent = user !== null && user.id !== null;
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set());
  const [localQuiz, setLocalQuiz] = useState<Record<string, QuizBest>>({});

  const progressQuery = trpc.progress.mine.useQuery(undefined, {
    enabled: isPersistent,
    retry: false,
  });
  const quizQuery = trpc.progress.myQuizResults.useQuery(undefined, {
    enabled: isPersistent,
    retry: false,
  });

  const completeMutation = trpc.progress.completeSection.useMutation();
  const resetMutation = trpc.progress.resetSection.useMutation();
  const quizMutation = trpc.progress.submitQuiz.useMutation();

  const completedSectionIds = useMemo(() => {
    if (isPersistent) {
      return new Set((progressQuery.data ?? []).map(r => r.sectionId));
    }
    return localCompleted;
  }, [isPersistent, progressQuery.data, localCompleted]);

  const quizBestByModule = useMemo(() => {
    if (isPersistent) {
      const map: Record<string, QuizBest> = {};
      for (const r of quizQuery.data ?? []) {
        map[r.moduleId] = { score: r.score, totalQuestions: r.totalQuestions };
      }
      return map;
    }
    return localQuiz;
  }, [isPersistent, quizQuery.data, localQuiz]);

  const isSectionComplete = useCallback(
    (sectionId: string) => completedSectionIds.has(sectionId),
    [completedSectionIds]
  );

  const completedCountForModule = useCallback(
    (_moduleId: string, sectionIds: string[]) =>
      sectionIds.filter(id => completedSectionIds.has(id)).length,
    [completedSectionIds]
  );

  const toggleSection = useCallback(
    (moduleId: string, sectionId: string) => {
      const isDone = completedSectionIds.has(sectionId);
      if (isPersistent) {
        if (isDone) resetMutation.mutate({ sectionId });
        else completeMutation.mutate({ moduleId, sectionId });
      } else {
        setLocalCompleted(prev => {
          const next = new Set(prev);
          if (next.has(sectionId)) next.delete(sectionId);
          else next.add(sectionId);
          return next;
        });
      }
    },
    [isPersistent, completedSectionIds, completeMutation, resetMutation]
  );

  const submitQuiz = useCallback(
    (moduleId: string, score: number, totalQuestions: number) => {
      if (isPersistent) {
        quizMutation.mutate({ moduleId, score, totalQuestions });
      } else {
        setLocalQuiz(prev => {
          const prevBest = prev[moduleId];
          if (prevBest && prevBest.score >= score) return prev;
          return { ...prev, [moduleId]: { score, totalQuestions } };
        });
      }
    },
    [isPersistent, quizMutation]
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      isLoading: isPersistent && progressQuery.isLoading,
      isPersistent,
      completedSectionIds,
      isSectionComplete,
      completedCountForModule,
      toggleSection,
      quizBestByModule,
      submitQuiz,
    }),
    [
      isPersistent,
      progressQuery.isLoading,
      completedSectionIds,
      isSectionComplete,
      completedCountForModule,
      toggleSection,
      quizBestByModule,
      submitQuiz,
    ]
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
