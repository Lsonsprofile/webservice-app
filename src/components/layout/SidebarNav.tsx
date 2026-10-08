import { Link, NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Route as RouteIcon,
  Layers,
  FolderKanban,
  ListChecks,
  FileDown,
  CheckCircle2,
  Circle,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { modules } from "@/content";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

const topLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learning Path", icon: RouteIcon },
  { to: "/topics", label: "All Topics", icon: Layers },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/quizzes", label: "Quizzes", icon: ListChecks },
  { to: "/resources", label: "Resources", icon: FileDown },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { isSectionComplete } = useProgress();
  const activeModuleId = location.pathname.startsWith("/topics/")
    ? location.pathname.split("/")[2]
    : undefined;
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(modules.map((m) => [m.id, m.id === activeModuleId])),
  );

  const toggleModule = (id: string) =>
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 pt-5 pb-4"
        aria-label="Web Services Academy home"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-display text-[15px] font-semibold leading-tight text-sidebar-foreground">
          Web Services
          <span className="block text-[11px] font-medium tracking-[0.18em] text-sidebar-foreground/60 uppercase">
            Academy
          </span>
        </span>
      </Link>

      <ScrollArea className="flex-1 px-3">
        <nav aria-label="Primary" className="space-y-1 pb-2">
          {topLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-primary-foreground shadow-inner",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="px-3 pt-4 pb-2 text-[11px] font-semibold tracking-[0.18em] text-sidebar-foreground/45 uppercase">
          Course Modules
        </p>
        <div className="space-y-1 pb-6">
          {modules.map((m) => {
            const open = openModules[m.id] ?? false;
            return (
              <Collapsible key={m.id} open={open}>
                <div
                  className={cn(
                    "rounded-lg",
                    activeModuleId === m.id && "bg-sidebar-accent/60",
                  )}
                >
                  <div className="flex items-center">
                    <Link
                      to={`/topics/${m.id}`}
                      onClick={onNavigate}
                      className="flex min-h-11 flex-1 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                        style={{ backgroundColor: `hsl(${m.hue} 70% 45%)` }}
                        aria-hidden
                      >
                        {m.id.replace("w", "")}
                      </span>
                      <span className="truncate">{m.title}</span>
                    </Link>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleModule(m.id)}
                        aria-label={`${open ? "Collapse" : "Expand"} ${m.title} sections`}
                        aria-expanded={open}
                        className="mr-1 flex h-11 w-8 items-center justify-center rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            open && "rotate-180",
                          )}
                          aria-hidden
                        />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <ul className="mt-0.5 space-y-0.5 pb-2 pl-[42px] pr-2">
                      {m.sections.map((s) => {
                        const to = `/topics/${m.id}/${s.id}`;
                        const active = location.pathname === to;
                        const done = isSectionComplete(s.id);
                        return (
                          <li key={s.id}>
                            <Link
                              to={to}
                              onClick={onNavigate}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                active &&
                                  "bg-sidebar-accent font-medium text-sidebar-primary-foreground",
                              )}
                            >
                              {done ? (
                                <CheckCircle2
                                  className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                                  aria-label="Completed"
                                />
                              ) : (
                                <Circle
                                  className="h-3.5 w-3.5 shrink-0 opacity-40"
                                  aria-hidden
                                />
                              )}
                              <span className="truncate">{s.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-[11px] leading-relaxed text-sidebar-foreground/45">
          Based on the CSE 341 Web Services course — rebuilt as an interactive
          learning platform.
        </p>
      </div>
    </div>
  );
}
