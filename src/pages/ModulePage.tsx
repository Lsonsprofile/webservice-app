import { Link, useParams } from "react-router";
import { ArrowRight, CheckCircle2, Clock3, ListChecks, PlayCircle } from "lucide-react";
import { moduleById, modules } from "@/content";
import { useProgress } from "@/lib/progress";
import { Progress } from "@/components/ui/progress";
import NotFound from "./NotFound";

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const mod = moduleId ? moduleById(moduleId) : undefined;
  const { completedSectionIds, quizBestByModule } = useProgress();

  if (!mod) return <NotFound />;

  const doneInMod = mod.sections.filter((s) => completedSectionIds.has(s.id)).length;
  const pct = Math.round((doneInMod / mod.sections.length) * 100);
  const minutes = mod.sections.reduce((a, s) => a + s.minutes, 0);
  const quiz = quizBestByModule[mod.id];
  const relatedModules = mod.related
    .map((id) => modules.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <header
        className="relative overflow-hidden rounded-2xl p-6 text-white sm:p-8"
        style={{
          background: `linear-gradient(135deg, hsl(${mod.hue} 60% 18%) 0%, hsl(${mod.hue} 55% 28%) 60%, hsl(${mod.hue} 50% 16%) 100%)`,
        }}
      >
        <div className="bg-grid-pattern absolute inset-0 opacity-60" aria-hidden />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1">{mod.week}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{mod.level}</span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
              <Clock3 className="h-3.5 w-3.5" aria-hidden /> {minutes} min total
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {mod.title}
          </h1>
          <p className="max-w-2xl text-sm text-white/80 sm:text-base">{mod.tagline}</p>
          <div className="flex max-w-md items-center gap-3 pt-1">
            <Progress value={pct} className="h-2 flex-1 bg-white/20" aria-label={`${pct}% of this module complete`} />
            <span className="text-sm font-semibold">{pct}%</span>
          </div>
        </div>
      </header>

      <section aria-labelledby="lessons">
        <h2 id="lessons" className="font-display text-xl font-semibold">
          Lessons in this module
        </h2>
        <ol className="mt-4 space-y-2.5">
          {mod.sections.map((s, i) => {
            const done = completedSectionIds.has(s.id);
            return (
              <li key={s.id}>
                <Link
                  to={`/topics/${mod.id}/${s.id}`}
                  className="group flex min-h-11 items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-white"
                    style={{ backgroundColor: `hsl(${mod.hue} 70% 45%)` }}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium group-hover:text-primary">{s.title}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3 w-3" aria-hidden /> {s.minutes} min read
                    </span>
                  </span>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Completed" />
                  ) : (
                    <PlayCircle className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" aria-hidden />
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5" aria-labelledby="quiz-cta">
        <ListChecks className="h-6 w-6 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="quiz-cta" className="font-display font-semibold">
            Check your understanding
          </h2>
          <p className="text-sm text-muted-foreground">
            {quiz
              ? `Best score so far: ${quiz.score}/${quiz.totalQuestions}. Retake any time — only your best score is kept.`
              : `${mod.quiz.length} questions on everything in this module.`}
          </p>
        </div>
        <Link
          to={`/quiz/${mod.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {quiz ? "Retake quiz" : "Take the quiz"} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {relatedModules.length > 0 && (
        <section aria-labelledby="related">
          <h2 id="related" className="font-display text-xl font-semibold">
            Related modules
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {relatedModules.map((m) => (
              <Link
                key={m!.id}
                to={`/topics/${m!.id}`}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <span className="text-xs font-semibold text-muted-foreground">{m!.week}</span>
                <p className="mt-1 font-medium">{m!.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{m!.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
