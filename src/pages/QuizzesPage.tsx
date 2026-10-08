import { Link } from "react-router";
import { ListChecks, Trophy } from "lucide-react";
import { modules } from "@/content";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export default function QuizzesPage() {
  const { quizBestByModule, completedSectionIds } = useProgress();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Quizzes</h1>
        <p className="max-w-2xl text-muted-foreground">
          One quiz per module. You need 70% to pass; only your best score is
          kept{/* */}. Finish the lessons first — every question comes straight
          from them.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => {
          const best = quizBestByModule[m.id];
          const pct = best ? Math.round((best.score / best.totalQuestions) * 100) : null;
          const passed = pct !== null && pct >= 70;
          const lessonsDone = m.sections.filter((s) => completedSectionIds.has(s.id)).length;
          return (
            <div
              key={m.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="hue-badge rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ "--hue": m.hue } as React.CSSProperties}
                >
                  {m.week}
                </span>
                {passed && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Trophy className="h-3 w-3" aria-hidden /> Passed
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold">{m.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {m.quiz.length} questions · {lessonsDone}/{m.sections.length} lessons completed
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  to={`/quiz/${m.id}`}
                  className={cn(
                    "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold",
                    best
                      ? "border border-border hover:bg-muted"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <ListChecks className="h-4 w-4" aria-hidden />
                  {best ? "Retake quiz" : "Start quiz"}
                </Link>
                {best && (
                  <span
                    className={cn(
                      "font-display text-lg font-bold",
                      passed ? "text-emerald-500" : "text-amber-500",
                    )}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
