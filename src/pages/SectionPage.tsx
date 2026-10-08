import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock3, Undo2 } from "lucide-react";
import { moduleById, modules, sectionById } from "@/content";
import { useProgress } from "@/lib/progress";
import { BlockRenderer } from "@/components/learn/BlockRenderer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotFound from "./NotFound";

// Flatten all sections in course order for prev/next navigation
const ordered = modules.flatMap((m) =>
  m.sections.map((s) => ({ moduleId: m.id, moduleTitle: m.title, hue: m.hue, ...s })),
);

export default function SectionPage() {
  const { moduleId, sectionId } = useParams<{ moduleId: string; sectionId: string }>();
  const mod = moduleId ? moduleById(moduleId) : undefined;
  const section = moduleId && sectionId ? sectionById(moduleId, sectionId) : undefined;
  const { isSectionComplete, toggleSection, isPersistent } = useProgress();

  const index = ordered.findIndex((s) => s.moduleId === moduleId && s.id === sectionId);
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

  // Auto table of contents from heading blocks
  const toc = useMemo(
    () =>
      (section?.blocks ?? [])
        .filter((b) => b.type === "h")
        .map((b) => ({
          text: (b as { text: string }).text,
          id: (b as { text: string }).text.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        })),
    [section],
  );

  // Related topics: other sections in this module + sections of related modules
  const related = useMemo(() => {
    if (!mod || !section) return [];
    const inModule = mod.sections
      .filter((s) => s.id !== section.id)
      .slice(0, 2)
      .map((s) => ({ moduleId: mod.id, section: s }));
    const others = mod.related
      .flatMap((id) => moduleById(id)?.sections.slice(0, 1).map((s) => ({ moduleId: id, section: s })) ?? [])
      .slice(0, 2);
    return [...inModule, ...others];
  }, [mod, section]);

  if (!mod || !section) return <NotFound />;

  const done = isSectionComplete(section.id);

  const onToggle = () => {
    toggleSection(mod.id, section.id);
    if (!done) {
      toast.success(
        isPersistent
          ? "Lesson marked complete — saved to your account."
          : "Lesson marked complete for this session. Sign in to save it.",
      );
    }
  };

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Link
              to={`/topics/${mod.id}`}
              className="hue-badge rounded-full border px-2.5 py-1 transition-opacity hover:opacity-80"
              style={{ "--hue": mod.hue } as React.CSSProperties}
            >
              {mod.week} · {mod.title}
            </Link>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden /> {section.minutes} min
            </span>
            {done && (
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Completed
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {section.title}
          </h1>
        </header>

        <BlockRenderer blocks={section.blocks} />

        {/* Mark complete */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
          {done ? (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden />
              <p className="font-medium">You've completed this lesson. Nicely done.</p>
              <Button variant="outline" className="min-h-11 gap-2" onClick={onToggle}>
                <Undo2 className="h-4 w-4" aria-hidden /> Mark as not done
              </Button>
            </>
          ) : (
            <>
              <Circle className="h-10 w-10 text-muted-foreground" aria-hidden />
              <p className="font-medium">Finished reading? Mark this lesson complete.</p>
              <Button className="min-h-11 gap-2" onClick={onToggle}>
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Mark lesson complete
              </Button>
            </>
          )}
        </div>

        {/* Prev / next */}
        <nav aria-label="Lesson" className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              to={`/topics/${prev.moduleId}/${prev.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1" aria-hidden />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Previous</span>
                <span className="block truncate font-medium">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={`/topics/${next.moduleId}/${next.id}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/50"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Next</span>
                <span className="block truncate font-medium">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          ) : (
            <Link
              to={`/quiz/${mod.id}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 text-right transition-colors hover:bg-primary/10"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Module complete</span>
                <span className="block truncate font-medium text-primary">Take the {mod.title} quiz</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          )}
        </nav>

        {/* Related topics */}
        {related.length > 0 && (
          <section aria-labelledby="related-topics">
            <h2 id="related-topics" className="font-display text-lg font-semibold">
              Related topics
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.map(({ moduleId: mid, section: s }) => (
                <Link
                  key={`${mid}/${s.id}`}
                  to={`/topics/${mid}/${s.id}`}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                >
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" aria-hidden /> {s.minutes} min
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Right rail: on this page */}
      {toc.length > 1 && (
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 xl:block" aria-label="On this page">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            On this page
          </p>
          <ul className="mt-3 space-y-2 border-l border-border">
            {toc.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {t.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
