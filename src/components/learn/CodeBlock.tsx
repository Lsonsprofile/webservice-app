import { useMemo, useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";

type Lang = "js" | "json" | "http" | "bash" | "html";

interface Token {
  text: string;
  cls?: string;
}

// Tiny tokenizer — enough for teaching snippets without a heavy dependency.
function tokenize(code: string, lang: Lang): Token[] {
  const patterns: [RegExp, string][] =
    lang === "json"
      ? [
          [/("(?:[^"\\]|\\.)*")(\s*:)/, "key"],
          [/"(?:[^"\\]|\\.)*"/, "str"],
          [/\b(?:true|false|null)\b/, "kw"],
          [/-?\b\d+(?:\.\d+)?\b/, "num"],
        ]
      : lang === "http"
        ? [
            [/^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/, "kw"],
            [/\bHTTP\/[\d.]+\b/, "num"],
            [/^[\w-]+(?=:)/, "key"],
            [/\b(?:1|2|3|4|5)\d{2}\b/, "num"],
            [/"(?:[^"\\]|\\.)*"/, "str"],
          ]
        : lang === "bash"
          ? [
              [/#[^\n]*/, "com"],
              [/"(?:[^"\\]|\\.)*"/, "str"],
              [/'(?:[^'\\]|\\.)*'/, "str"],
              [/\$\w+/, "num"],
              [/^(?:npm|npx|node|git|cd|curl)\b/, "kw"],
            ]
          : lang === "html"
            ? [
                [/<!--[\s\S]*?-->/, "com"],
                [/<\/?[\w-]+/, "kw"],
                [/\/?>/, "kw"],
                [/[\w-]+(?==")/, "key"],
                [/"(?:[^"\\]|\\.)*"/, "str"],
              ]
            : [
                // js
                [/\/\/[^\n]*|\/\*[\s\S]*?\*\//, "com"],
                [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/, "str"],
                [
                  /\b(?:const|let|var|function|return|if|else|for|while|import|export|from|default|async|await|new|try|catch|throw|class|extends|switch|case|break|of|in|typeof|instanceof)\b/,
                  "kw",
                ],
                [/\b(?:true|false|null|undefined|this)\b/, "num"],
                [/\b\d+(?:\.\d+)?\b/, "num"],
                [/\b[A-Za-z_$][\w$]*(?=\()/, "fn"],
              ];

  const tokens: Token[] = [];
  let rest = code;
  while (rest.length > 0) {
    let earliest: { idx: number; len: number; cls: string } | null = null;
    for (const [re, cls] of patterns) {
      const m = re.exec(rest);
      if (m && (earliest === null || m.index < earliest.idx)) {
        earliest = { idx: m.index, len: m[0].length, cls };
      }
    }
    if (!earliest) {
      tokens.push({ text: rest });
      break;
    }
    if (earliest.idx > 0) tokens.push({ text: rest.slice(0, earliest.idx) });
    tokens.push({ text: rest.slice(earliest.idx, earliest.idx + earliest.len), cls: earliest.cls });
    rest = rest.slice(earliest.idx + earliest.len);
  }
  return tokens;
}

const clsColor: Record<string, string> = {
  kw: "text-[#7aa2f7]",
  str: "text-[#9ece6a]",
  num: "text-[#ff9e64]",
  com: "text-[#565f89] italic",
  fn: "text-[#7dcfff]",
  key: "text-[#bb9af7]",
};

const langLabel: Record<Lang, string> = {
  js: "JavaScript",
  json: "JSON",
  http: "HTTP",
  bash: "Terminal",
  html: "HTML",
};

export function CodeBlock({
  code,
  lang,
  title,
}: {
  code: string;
  lang: Lang;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => tokenize(code, lang), [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <figure className="group/code overflow-hidden rounded-xl border border-border bg-code-bg shadow-sm">
      <figcaption className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <FileCode2 className="h-4 w-4 text-cyan-300" aria-hidden />
        <span className="flex-1 truncate text-xs font-medium text-slate-300">
          {title ?? langLabel[lang]}
        </span>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
        </button>
      </figcaption>
      <pre className="code-scroll overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-200">
        <code>
          {tokens.map((t, i) =>
            t.cls ? (
              <span key={i} className={clsColor[t.cls]}>
                {t.text}
              </span>
            ) : (
              <span key={i}>{t.text}</span>
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}
