import type { Block } from "@/content/types";
import { CodeBlock } from "./CodeBlock";
import { Diagram } from "./Diagram";
import { Demo } from "./Demos";
import {
  Lightbulb,
  AlertTriangle,
  OctagonAlert,
  Info,
  Globe2,
  CircleCheck,
  CircleX,
  Sparkles,
  Dumbbell,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const calloutStyle = {
  tip: { icon: Lightbulb, cls: "border-emerald-500/40 bg-emerald-500/[0.07]", iconCls: "text-emerald-500", label: "Tip" },
  warn: { icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-500/[0.07]", iconCls: "text-amber-500", label: "Common mistake" },
  danger: { icon: OctagonAlert, cls: "border-red-500/40 bg-red-500/[0.07]", iconCls: "text-red-500", label: "Watch out" },
  info: { icon: Info, cls: "border-primary/40 bg-primary/[0.07]", iconCls: "text-primary", label: "Note" },
  realworld: { icon: Globe2, cls: "border-cyan-500/40 bg-cyan-500/[0.07]", iconCls: "text-cyan-500", label: "Real world" },
} as const;

// Render inline `code` in paragraph text
function Inline({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded bg-muted px-1.5 py-0.5 font-code text-[0.85em] text-primary"
          >
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "lead":
      return (
        <p className="text-lg leading-relaxed text-muted-foreground">
          <Inline text={block.text} />
        </p>
      );
    case "h":
      return (
        <h3
          id={block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="scroll-mt-24 pt-4 font-display text-xl font-semibold tracking-tight"
        >
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p className="leading-relaxed text-foreground/90">
          <Inline text={block.text} />
        </p>
      );
    case "code":
      return <CodeBlock code={block.code} lang={block.lang} title={block.title} />;
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-border">
          {block.title ? (
            <p className="border-b border-border bg-muted/50 px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {block.title}
            </p>
          ) : null}
          <table className="w-full min-w-lg text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {block.headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2.5 text-left font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/60 last:border-0 even:bg-muted/20"
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 align-top text-foreground/85">
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "list": {
      const icon = {
        check: <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />,
        cross: <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />,
        steps: null,
        plain: null,
      }[block.style];
      if (block.style === "steps") {
        return (
          <ol className="space-y-2.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed text-foreground/90">
                  <Inline text={item} />
                </span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className={cn("space-y-2.5", block.style === "plain" && "list-disc pl-5")}>
          {block.items.map((item, i) => (
            <li key={i} className={cn("leading-relaxed text-foreground/90", icon && "flex gap-2.5")}>
              {icon}
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    }
    case "callout": {
      const s = calloutStyle[block.variant];
      const Icon = s.icon;
      return (
        <aside className={cn("flex gap-3 rounded-xl border p-4", s.cls)}>
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", s.iconCls)} aria-hidden />
          <div>
            <p className="text-sm font-semibold">
              <span className={cn("mr-1.5 text-[10px] font-bold tracking-wider uppercase", s.iconCls)}>
                {s.label}
              </span>
              {block.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85">
              <Inline text={block.body} />
            </p>
          </div>
        </aside>
      );
    }
    case "diagram":
      return <Diagram name={block.name} caption={block.caption} />;
    case "demo":
      return <Demo name={block.name} />;
    case "qa":
      return (
        <div className="rounded-xl border border-border bg-card/60 p-2">
          {block.title ? (
            <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {block.title}
            </p>
          ) : null}
          <Accordion type="single" collapsible>
            {block.items.map((item, i) => (
              <AccordionItem key={i} value={`qa-${i}`} className="border-border/60 px-3">
                <AccordionTrigger className="min-h-11 py-3 text-left text-sm font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  <Inline text={item.a} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    case "takeaways":
      return (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-accent/[0.06] p-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold tracking-wide text-primary uppercase">
            <Sparkles className="h-4 w-4" aria-hidden /> Key takeaways
          </p>
          <ul className="mt-3 space-y-2.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <Inline text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "exercise": {
      const levelColor = {
        "Warm-up": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        Core: "bg-primary/15 text-primary",
        Stretch: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
      }[block.level];
      return (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Dumbbell className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="font-display font-semibold">{block.title}</p>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase", levelColor)}>
              {block.level}
            </span>
          </div>
          <ol className="mt-3 space-y-2">
            {block.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                <span className="font-code text-xs font-bold text-muted-foreground" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <Inline text={step} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      );
    }
    default:
      return null;
  }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}
