import { Link } from "react-router";
import { CheckCircle2, Circle, Clock3, Lock, PlayCircle } from "lucide-react";
import { modules, totalMinutes } from "@/content";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export default function LearningPathPage() {
  const { completedSectionIds, quizBestByModule } = useProgress();

  // A module "unlocks" when the previous module's sections are all done.
  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    const prev = modules[index - 1];
    return prev.sections.every((s) => completedSectionIds.has(s.id));
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Your Learning Path</h1>
        <p className="max-w-2xl text-muted-foreground">
          Six modules, sequenced from your very first Express server to
          production-grade authentication and pagination — about{" "}
          {Math.round(totalMinutes / 60)} hours of focused learning. Finish a
          module's lessons to unlock the next.
        </p>
      </header>

      <ol className="relative space-y-6 before:absolute before:top-4 before:bottom-4 before:left-[27px] before:w-0.5 before:bg-border sm:before:left-[31px]">
        {modules.map((m, i) => {
          const unlocked = isUnlocked(i);
          const doneInMod = m.sections.filter((s) => completedSectionIds.has(s.id)).length;
          const complete = doneInMod === m.sections.length;
          const quiz = quizBestByModule[m.id];
          const minutes = m.sections.reduce((a, s) => a + s.minutes, 0);
          return (
            <li key={m.id} className="relative flex gap-4 sm:gap-5">
              <span
                className={cn(
                  "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 font-display text-lg font-bold sm:h-16 sm:w-16",
                  complete
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : unlocked
                      ? "bg-card text-white"
                      : "border-border bg-muted text-muted-foreground",
                )}
                style={
                  !complete && unlocked
                    ? { backgroundColor: `hsl(${m.hue} 70% 45%)`, borderColor: `hsl(${m.hue} 70% 45%)` }
                    : undefined
                }
                aria-hidden
              >
                {complete ? <CheckCircle2 className="h-7 w-7" /> : i + 1}
              </span>
              <div
                className={cn(
                  "flex-1 rounded-2xl border border-border bg-card p-5",
                  !unlocked && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold hue-badge"
                    style={{ "--hue": m.hue } as React.CSSProperties}
                  >
                    {m.week}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {m.level}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden />
                    {minutes} min
                  </span>
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold">{m.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{m.tagline}</p>

                <ul className="mt-4 space-y-1.5">
                  {m.sections.map((s) => {
                    const done = completedSectionIds.has(s.id);
                    return (
                      <li key={s.id}>
                        <Link
                          to={`/topics/${m.id}/${s.id}`}
                          className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Completed" />
                          ) : unlocked ? (
                            <PlayCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                          ) : (
                            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          )}
                          <span className="flex-1">{s.title}</span>
                          <span className="text-xs text-muted-foreground">{s.minutes} min</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <Link
                    to={unlocked ? `/topics/${m.id}` : "#"}
                    aria-disabled={!unlocked}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold",
                      unlocked
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "pointer-events-none bg-muted text-muted-foreground",
                    )}
                  >
                    {unlocked ? (
                      complete ? "Review module" : doneInMod > 0 ? "Continue" : "Start module"
                    ) : (
                      <>
                        <Lock className="h-4 w-4" aria-hidden /> Locked
                      </>
                    )}
                  </Link>
                  <Link
                    to={`/quiz/${m.id}`}
                    className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
                  >
                    {quiz
                      ? `Quiz best: ${quiz.score}/${quiz.totalQuestions}`
                      : `Take the quiz (${m.quiz.length} questions)`}
                  </Link>
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Circle className="h-2 w-2 fill-current" aria-hidden />
                    {doneInMod}/{m.sections.length} lessons done
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
