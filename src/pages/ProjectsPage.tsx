import { Link } from "react-router";
import { ClipboardCheck, Clock3, FolderKanban, ListTodo, ScrollText } from "lucide-react";
import { moduleById, projects } from "@/content";
import { cn } from "@/lib/utils";

const levelStyle: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-primary/15 text-primary",
  Advanced: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Portfolio Projects</h1>
        <p className="max-w-2xl text-muted-foreground">
          Real builds taken from the course assignments. Each one ships with a
          spec, a task breakdown, and a test plan — build them to prove the
          skills.
        </p>
      </header>

      <div className="space-y-6">
        {projects.map((p) => (
          <article
            key={p.id}
            id={p.id}
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" aria-hidden />
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", levelStyle[p.level])}>
                {p.level}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" aria-hidden /> {p.hours}
              </span>
              <span className="ml-auto flex flex-wrap gap-1.5">
                {p.moduleIds.map((mid) => {
                  const m = moduleById(mid);
                  return m ? (
                    <Link
                      key={mid}
                      to={`/topics/${mid}`}
                      className="hue-badge rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-opacity hover:opacity-80"
                      style={{ "--hue": m.hue } as React.CSSProperties}
                    >
                      {m.week}
                    </Link>
                  ) : null;
                })}
              </span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold">{p.title}</h2>
            <p className="mt-1 text-muted-foreground">{p.summary}</p>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <section aria-label={`${p.title} brief`}>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <ScrollText className="h-4 w-4 text-primary" aria-hidden /> Brief
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
                  {p.brief.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary" aria-hidden>•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
              <section aria-label={`${p.title} tasks`}>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <ListTodo className="h-4 w-4 text-primary" aria-hidden /> Tasks
                </h3>
                <ol className="mt-2 space-y-1.5 text-sm text-foreground/85">
                  {p.tasks.map((t, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="font-code text-xs font-bold text-muted-foreground" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
              </section>
              <section aria-label={`${p.title} test plan`}>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <ClipboardCheck className="h-4 w-4 text-primary" aria-hidden /> Test plan
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
                  {p.testPlan.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500" aria-hidden>✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
