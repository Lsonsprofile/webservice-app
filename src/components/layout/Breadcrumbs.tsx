import { Fragment } from "react";
import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { moduleById, sectionById } from "@/content";

const pageNames: Record<string, string> = {
  learn: "Learning Path",
  topics: "Topics",
  projects: "Projects",
  quizzes: "Quizzes",
  resources: "Resources",
};

type Crumb = { label: string; to?: string };

export function Breadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Home", to: "/" }];

  if (parts[0] === "topics") {
    crumbs.push({ label: "Topics", to: "/topics" });
    const mod = parts[1] ? moduleById(parts[1]) : undefined;
    if (mod) {
      crumbs.push({ label: mod.title, to: `/topics/${mod.id}` });
      const sec = parts[2] ? sectionById(mod.id, parts[2]) : undefined;
      if (sec) crumbs.push({ label: sec.title });
    }
  } else if (parts[0] === "quiz" && parts[1]) {
    crumbs.push({ label: "Quizzes", to: "/quizzes" });
    const mod = moduleById(parts[1]);
    crumbs.push({ label: mod ? `${mod.title} Quiz` : "Quiz" });
  } else {
    crumbs.push({ label: pageNames[parts[0]] ?? "Page" });
  }

  return (
    <Breadcrumb aria-label="Breadcrumb" className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={`${c.label}-${i}`}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className={i > 1 ? "hidden sm:list-item" : ""}>
                {last || !c.to ? (
                  <BreadcrumbPage className="max-w-40 truncate sm:max-w-xs">
                    {c.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={c.to} className="max-w-32 truncate sm:max-w-48">
                      {c.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
