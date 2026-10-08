import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, FileDown, FolderKanban, Layers, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { searchIndex, projects, cheatSheets } from "@/content";

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sections = useMemo(
    () => searchIndex.filter((e) => e.sectionId),
    [],
  );
  const moduleEntries = useMemo(
    () => searchIndex.filter((e) => !e.sectionId),
    [],
  );

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search topics (Ctrl+K)"
        className="h-10 w-10 justify-center gap-2 px-0 text-muted-foreground sm:w-56 sm:justify-start sm:px-3"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Search topics…</span>
        <span className="ml-auto hidden sm:inline">
          <Kbd>⌘K</Kbd>
        </span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search lessons, quizzes, projects, cheat sheets…" />
        <CommandList>
          <CommandEmpty>No results found. Try a different keyword.</CommandEmpty>
          <CommandGroup heading="Lessons">
            {sections.map((e) => (
              <CommandItem
                key={`${e.moduleId}/${e.sectionId}`}
                value={`${e.sectionTitle} ${e.moduleTitle} ${e.text}`}
                onSelect={() => go(`/topics/${e.moduleId}/${e.sectionId}`)}
              >
                <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span className="flex flex-col">
                  <span>{e.sectionTitle}</span>
                  <span className="text-xs text-muted-foreground">
                    {e.moduleTitle}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Modules">
            {moduleEntries.map((e) => (
              <CommandItem
                key={e.moduleId}
                value={`${e.moduleTitle} ${e.text}`}
                onSelect={() => go(`/topics/${e.moduleId}`)}
              >
                <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
                {e.moduleTitle}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.title} ${p.summary}`}
                onSelect={() => go(`/projects#${p.id}`)}
              >
                <FolderKanban className="h-4 w-4 text-muted-foreground" aria-hidden />
                {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Cheat sheets">
            {cheatSheets.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.title} ${c.description}`}
                onSelect={() => go(`/resources#${c.id}`)}
              >
                <FileDown className="h-4 w-4 text-muted-foreground" aria-hidden />
                {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
