import { useState } from "react";
import { Link } from "react-router";
import { Check, Copy, Download, FileText } from "lucide-react";
import { cheatSheets, moduleById } from "@/content";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResourcesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const download = (id: string) => {
    const sheet = cheatSheets.find((c) => c.id === id);
    if (!sheet) return;
    const blob = new Blob([sheet.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sheet.filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${sheet.filename} downloaded`);
  };

  const copy = async (id: string) => {
    const sheet = cheatSheets.find((c) => c.id === id);
    if (!sheet) return;
    try {
      await navigator.clipboard.writeText(sheet.markdown);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Resources & Cheat Sheets</h1>
        <p className="max-w-2xl text-muted-foreground">
          Condensed revision notes generated from the course material — download
          them as Markdown, or copy straight into your own notes.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {cheatSheets.map((sheet) => {
          const mod = moduleById(sheet.moduleId);
          return (
            <article
              key={sheet.id}
              id={sheet.id}
              className="flex scroll-mt-24 flex-col rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: `hsl(${mod?.hue ?? 233} 70% 45%)` }}
                  aria-hidden
                >
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display font-semibold leading-snug">{sheet.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {mod ? `${mod.week} · ` : ""}
                    {sheet.filename}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{sheet.description}</p>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => download(sheet.id)} className="min-h-11 flex-1 gap-2" size="sm">
                  <Download className="h-4 w-4" aria-hidden /> Download .md
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 gap-2"
                  onClick={() => copy(sheet.id)}
                  aria-label={`Copy ${sheet.title} to clipboard`}
                >
                  {copiedId === sheet.id ? (
                    <Check className="h-4 w-4 text-emerald-500" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden />
                  )}
                  Copy
                </Button>
                {mod && (
                  <Button asChild variant="ghost" size="sm" className="min-h-11">
                    <Link to={`/topics/${mod.id}`}>Module</Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Tip: cheat sheets are plain Markdown — drop them into Obsidian, Notion,
        VS Code, or print them for offline revision.
      </p>
    </div>
  );
}
