import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Flame,
  ListChecks,
  Sparkles,
  FolderKanban,
} from "lucide-react";
import { modules, totalMinutes, totalSections, projects } from "@/content";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";

function ProgressRing({ pct, size = 148 }: { pct: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${pct}% of the course completed`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(233 84% 60%)" />
            <stop offset="100%" stopColor="hsl(190 95% 46%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold">{pct}%</span>
        <span className="text-xs text-muted-foreground">complete</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { completedSectionIds, quizBestByModule, isPersistent } = useProgress();
  const { user } = useAuth();

  const done = completedSectionIds.size;
  const pct = totalSections === 0 ? 0 : Math.round((done / totalSections) * 100);

  // Next recommended section = first incomplete in module order
  const next = (() => {
    for (const m of modules) {
      for (const s of m.sections) {
        if (!completedSectionIds.has(s.id)) return { module: m, section: s };
      }
    }
    return null;
  })();

  const minutesDone = modules.reduce(
    (n, m) =>
      n +
      m.sections
        .filter((s) => completedSectionIds.has(s.id))
        .reduce((a, s) => a + s.minutes, 0),
    0,
  );

  const quizzesPassed = Object.values(quizBestByModule).filter(
    (q) => q.totalQuestions > 0 && q.score / q.totalQuestions >= 0.7,
  ).length;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="hero-glow bg-grid-pattern relative overflow-hidden rounded-2xl text-white">
        <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
              {user ? `Welcome back, ${user.name ?? "learner"}` : "Interactive learning platform"}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Learn Web Services from
              <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Beginner to Builder
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Master REST APIs, Express, MongoDB, Swagger, authentication and
              pagination through {totalSections} hands-on lessons, interactive
              demos, {projects.length} portfolio projects and downloadable
              cheat sheets.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to={next ? `/topics/${next.module.id}/${next.section.id}` : "/learn"}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-400 px-5 font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-white"
              >
                {done === 0 ? "Start learning" : next ? "Continue learning" : "Review the path"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/topics"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-5 font-medium text-white/90 transition-colors hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4" aria-hidden /> Browse topics
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center lg:pr-4">
            <img
              src="/hero-illustration.png"
              alt="Illustration of a web API ecosystem: servers, JSON panels, a database, and a security shield connected by data streams"
              width={1536}
              height={1024}
              className="animate-float-slow hidden w-72 rounded-xl shadow-2xl shadow-cyan-500/20 ring-1 ring-white/15 sm:block lg:w-80"
            />
            <div className="sm:absolute sm:-bottom-6 sm:-left-8 sm:rounded-2xl sm:bg-slate-950/80 sm:p-3 sm:shadow-xl sm:backdrop-blur">
              <ProgressRing pct={pct} size={128} />
            </div>
          </div>
        </div>
      </section>

      {!isPersistent && done > 0 && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          You're browsing as a guest — progress is kept only for this session.{" "}
          <Link to="/login" className="font-semibold underline underline-offset-2">
            Sign in
          </Link>{" "}
          to save it to your account.
        </p>
      )}

      {/* Stats */}
      <section aria-label="Your stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: BookOpen, label: "Lessons done", value: `${done}/${totalSections}` },
          { icon: Clock3, label: "Time invested", value: `${Math.round(minutesDone / 60 * 10) / 10}h`, sub: `of ${Math.round(totalMinutes / 60)}h` },
          { icon: ListChecks, label: "Quizzes passed", value: `${quizzesPassed}/${modules.length}` },
          { icon: Flame, label: "Current module", value: next ? next.module.week : "Done 🎉" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <Icon className="h-4 w-4 text-primary" aria-hidden />
            <p className="mt-2 font-display text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">
              {label}
              {sub ? ` · ${sub}` : ""}
            </p>
          </div>
        ))}
      </section>

      {/* Up next */}
      {next && (
        <section aria-labelledby="up-next" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="up-next" className="font-display text-lg font-semibold">
            Up next for you
          </h2>
          <Link
            to={`/topics/${next.module.id}/${next.section.id}`}
            className="group mt-3 flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white"
              style={{ backgroundColor: `hsl(${next.module.hue} 70% 45%)` }}
              aria-hidden
            >
              {next.module.id.replace("w", "")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {next.module.week} · {next.module.title}
              </p>
              <p className="truncate font-medium">{next.section.title}</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {next.section.minutes} min
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </section>
      )}

      {/* Module cards */}
      <section aria-labelledby="explore">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="explore" className="font-display text-lg font-semibold">
            Explore the modules
          </h2>
          <Link to="/learn" className="text-sm font-medium text-primary hover:underline">
            Full learning path →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const doneInMod = m.sections.filter((s) => completedSectionIds.has(s.id)).length;
            const modPct = Math.round((doneInMod / m.sections.length) * 100);
            const minutes = m.sections.reduce((a, s) => a + s.minutes, 0);
            return (
              <Link
                key={m.id}
                to={`/topics/${m.id}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                style={{ "--hue": m.hue } as React.CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <span className="hue-badge rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
                    {m.week}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">{m.level}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-primary">
                  {m.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.tagline}</p>
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{doneInMod}/{m.sections.length} lessons</span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" aria-hidden />
                      {minutes} min
                    </span>
                  </div>
                  <Progress value={modPct} className="h-1.5" aria-label={`${m.title}: ${modPct}% complete`} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Projects teaser */}
      <section aria-labelledby="projects-teaser" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 id="projects-teaser" className="flex items-center gap-2 font-display text-lg font-semibold">
            <FolderKanban className="h-5 w-5 text-primary" aria-hidden /> Portfolio projects
          </h2>
          <Link to="/projects" className="text-sm font-medium text-primary hover:underline">
            All projects →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {projects.slice(0, 2).map((p) => (
            <Link
              key={p.id}
              to={`/projects#${p.id}`}
              className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                  {p.level}
                </span>
                <span className="text-xs text-muted-foreground">{p.hours}</span>
              </div>
              <p className="mt-2 font-medium">{p.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
