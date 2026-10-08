import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, Clock3, Search } from "lucide-react";
import { modules } from "@/content";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Filter = "all" | "todo" | "done";

export default function TopicsPage() {
  const { completedSectionIds } = useProgress();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [level, setLevel] = useState<string>("all");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.flatMap((m) =>
      m.sections
        .filter((s) => {
          const done = completedSectionIds.has(s.id);
          if (filter === "todo" && done) return false;
          if (filter === "done" && !done) return false;
          if (level !== "all" && m.level !== level) return false;
          if (q && !`${s.title} ${m.title}`.toLowerCase().includes(q)) return false;
          return true;
        })
        .map((s) => ({ module: m, section: s, done: completedSectionIds.has(s.id) })),
    );
  }, [query, filter, level, completedSectionIds]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">All Topics</h1>
        <p className="text-muted-foreground">
          Every lesson in the course, searchable and filterable.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <span className="sr-only">Filter topics by keyword</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by keyword…"
            className="h-11 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm focus:outline-2 focus:outline-primary"
          />
        </label>
        <div className="flex gap-1.5" role="group" aria-label="Completion filter">
          {(["all", "todo", "done"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "min-h-11 rounded-lg border px-3.5 text-sm font-medium capitalize",
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
              )}
            >
              {f === "todo" ? "To do" : f}
            </button>
          ))}
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Filter by level"
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm focus:outline-2 focus:outline-primary"
        >
          <option value="all">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {entries.length} topic{entries.length === 1 ? "" : "s"}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {entries.map(({ module: m, section: s, done }) => (
          <li key={s.id}>
            <Link
              to={`/topics/${m.id}/${s.id}`}
              className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                style={{ backgroundColor: `hsl(${m.hue} 70% 45%)` }}
                aria-hidden
              >
                {m.id.replace("w", "")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">
                  {m.week} · {m.level}
                </span>
                <span className="mt-0.5 block font-medium leading-snug">{s.title}</span>
                <span className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" aria-hidden />
                    {s.minutes} min
                  </span>
                  {done && (
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Done
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
