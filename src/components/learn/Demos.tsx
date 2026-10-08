import { useMemo, useState } from "react";
import { Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import type { DemoName } from "@/content/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ---------------- shared bits ---------------- */

function DemoShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03]">
      <header className="flex items-center gap-2 border-b border-primary/20 bg-primary/[0.06] px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="ml-auto rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
          Interactive
        </span>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

const statusColor = (code: number) =>
  code < 300
    ? "text-emerald-500"
    : code < 500
      ? "text-amber-500"
      : "text-red-500";

/* ---------------- 1. API simulator ---------------- */

type Book = { id: string; title: string; author: string; publicationDate: string };
const initialBooks: Book[] = [
  { id: "b1", title: "Dune", author: "Frank Herbert", publicationDate: "1965-08-01" },
  { id: "b2", title: "The Hobbit", author: "J.R.R. Tolkien", publicationDate: "1937-09-21" },
  { id: "b3", title: "Clean Code", author: "Robert C. Martin", publicationDate: "2008-08-01" },
];

function ApiSimulator() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [path, setPath] = useState("/books");
  const [body, setBody] = useState(
    '{\n  "id": "b4",\n  "title": "Neuromancer",\n  "author": "William Gibson",\n  "publicationDate": "1984-07-01"\n}',
  );
  const [response, setResponse] = useState<{ status: number; json: string } | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const run = () => {
    const match = path.match(/^\/books(?:\/([\w-]+))?\/?$/);
    let status = 500;
    let payload: unknown = { message: "Internal server error" };
    if (!match) {
      status = 404;
      payload = { message: `Route ${path} not found` };
    } else {
      const id = match[1];
      if (method === "GET") {
        if (!id) {
          status = 200;
          payload = books;
        } else {
          const found = books.find((b) => b.id === id);
          status = found ? 200 : 404;
          payload = found ?? { message: "Book not found" };
        }
      } else if (method === "POST") {
        try {
          const data = JSON.parse(body) as Partial<Book>;
          if (!data.id || !data.title || !data.author || !data.publicationDate) {
            status = 400;
            payload = { message: "id, title, author and publicationDate are required" };
          } else if (books.some((b) => b.id === data.id)) {
            status = 409;
            payload = { message: `A book with id '${data.id}' already exists` };
          } else {
            const book = data as Book;
            setBooks((bs) => [...bs, book]);
            status = 201;
            payload = book;
          }
        } catch {
          status = 400;
          payload = { message: "Request body must be valid JSON" };
        }
      } else if (method === "PUT") {
        if (!id) {
          status = 400;
          payload = { message: "PUT requires an id: /books/:id" };
        } else {
          try {
            const data = JSON.parse(body) as Partial<Book>;
            const idx = books.findIndex((b) => b.id === id);
            if (idx === -1) {
              status = 404;
              payload = { message: "Book not found" };
            } else {
              const updated = { ...books[idx], ...data, id };
              setBooks((bs) => bs.map((b) => (b.id === id ? updated : b)));
              status = 200;
              payload = updated;
            }
          } catch {
            status = 400;
            payload = { message: "Request body must be valid JSON" };
          }
        }
      } else if (method === "DELETE") {
        if (!id) {
          status = 400;
          payload = { message: "DELETE requires an id: /books/:id" };
        } else if (!books.some((b) => b.id === id)) {
          status = 404;
          payload = { message: "Book not found" };
        } else {
          setBooks((bs) => bs.filter((b) => b.id !== id));
          status = 204;
          payload = null;
        }
      }
    }
    const json = payload === null ? "(no body — 204 No Content)" : JSON.stringify(payload, null, 2);
    setResponse({ status, json });
    setLog((l) => [`${method} ${path} → ${status}`, ...l].slice(0, 5));
  };

  const methodColor: Record<string, string> = {
    GET: "text-cyan-500",
    POST: "text-emerald-500",
    PUT: "text-amber-500",
    DELETE: "text-red-500",
  };

  return (
    <DemoShell
      title="Books API Simulator"
      description="Send real CRUD requests against an in-browser Express-style API. Try a duplicate POST to see a 409."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="HTTP method">
            {(["GET", "POST", "PUT", "DELETE"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMethod(m);
                  if (m === "GET" && path === "/books") setPath("/books");
                }}
                aria-pressed={method === m}
                className={cn(
                  "min-h-11 rounded-lg border px-3.5 font-code text-xs font-bold transition-colors",
                  method === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Route</span>
            <select
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-card px-3 font-code text-sm focus:outline-2 focus:outline-primary"
            >
              <option value="/books">/books</option>
              <option value="/books/b1">/books/b1</option>
              <option value="/books/b99">/books/b99 (not found)</option>
            </select>
          </label>
          {(method === "POST" || method === "PUT") && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                JSON body
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-code-bg p-3 font-code text-xs text-slate-200 focus:outline-2 focus:outline-primary"
              />
            </label>
          )}
          <div className="flex gap-2">
            <Button onClick={run} className="min-h-11 gap-2">
              <Play className="h-4 w-4" aria-hidden /> Send request
            </Button>
            <Button
              variant="outline"
              className="min-h-11 gap-2"
              onClick={() => {
                setBooks(initialBooks);
                setResponse(null);
                setLog([]);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Reset data
            </Button>
          </div>
          {log.length > 0 && (
            <ol className="space-y-1 font-code text-[11px] text-muted-foreground" aria-label="Request log">
              {log.map((entry, i) => (
                <li key={`${entry}-${i}`}>{entry}</li>
              ))}
            </ol>
          )}
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-code-bg p-3">
            <p className="mb-2 font-code text-[11px] text-slate-400">
              <span className={methodColor[method]}>{method}</span> {path} HTTP/1.1
            </p>
            {response ? (
              <>
                <p className={cn("mb-2 font-code text-sm font-bold", statusColor(response.status))}>
                  HTTP/1.1 {response.status}{" "}
                  {response.status === 200
                    ? "OK"
                    : response.status === 201
                      ? "Created"
                      : response.status === 204
                        ? "No Content"
                        : response.status === 400
                          ? "Bad Request"
                          : response.status === 404
                            ? "Not Found"
                            : response.status === 409
                              ? "Conflict"
                              : "Error"}
                </p>
                <pre className="code-scroll max-h-52 overflow-auto font-code text-xs leading-relaxed text-slate-200">
                  {response.json}
                </pre>
              </>
            ) : (
              <p className="font-code text-xs text-slate-500">
                // response will appear here
              </p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Database · books collection ({books.length} docs)
            </p>
            <ul className="space-y-1 font-code text-[11px]">
              {books.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <span className="text-primary">{b.id}</span>
                  <span className="truncate text-muted-foreground">
                    {b.title} — {b.author}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

/* ---------------- 2. Status code explorer ---------------- */

const statusCodes = [
  { code: 200, name: "OK", desc: "The request worked. GET and PUT successes return 200 with the data in the body.", when: "GET /books, PUT /books/:id", hue: 150 },
  { code: 201, name: "Created", desc: "A new resource was created. Return it with the created record in the body.", when: "POST /books", hue: 150 },
  { code: 204, name: "No Content", desc: "Success, but there is nothing to send back. The body must be empty.", when: "DELETE /books/:id", hue: 150 },
  { code: 400, name: "Bad Request", desc: "The client sent invalid data — missing fields, wrong types, or malformed JSON.", when: "POST with missing title", hue: 38 },
  { code: 401, name: "Unauthorized", desc: "No valid credentials. The user is not logged in (or the token/session is invalid).", when: "Route guarded by requireAuth", hue: 38 },
  { code: 403, name: "Forbidden", desc: "Logged in, but not allowed. Authentication succeeded; authorization failed.", when: "Non-admin calls an admin route", hue: 38 },
  { code: 404, name: "Not Found", desc: "The id or route does not exist. Check before reading, updating, or deleting.", when: "GET /books/b99", hue: 38 },
  { code: 409, name: "Conflict", desc: "The request clashes with existing state — e.g. a duplicate id, or deleting an author who still has books.", when: "Duplicate id on POST", hue: 38 },
  { code: 500, name: "Internal Server Error", desc: "Something broke on the server. Never leak internals — return { message: 'Internal server error' }.", when: "Unhandled exception in a controller", hue: 0 },
];

function StatusExplorer() {
  const [active, setActive] = useState(statusCodes[0]);
  return (
    <DemoShell
      title="HTTP Status Code Explorer"
      description="Pick a code to see exactly when your API should return it."
    >
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Status codes">
        {statusCodes.map((s) => (
          <button
            key={s.code}
            type="button"
            role="tab"
            aria-selected={active.code === s.code}
            onClick={() => setActive(s)}
            className={cn(
              "min-h-11 rounded-lg border px-3 font-code text-sm font-bold transition-colors",
              active.code === s.code
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50",
              active.code !== s.code && statusColor(s.code),
            )}
          >
            {s.code}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        className="mt-4 rounded-xl border border-border bg-card p-5 animate-fade-up"
        key={active.code}
      >
        <p className={cn("font-display text-2xl font-bold", statusColor(active.code))}>
          {active.code} · {active.name}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{active.desc}</p>
        <p className="mt-3 inline-flex rounded-md bg-muted px-2.5 py-1 font-code text-xs">
          Typical use: {active.when}
        </p>
      </div>
    </DemoShell>
  );
}

/* ---------------- 3. JWT lab ---------------- */

function base64url(obj: object) {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function JwtLab() {
  const [sub, setSub] = useState("user-42");
  const [role, setRole] = useState("student");
  const [showPayload, setShowPayload] = useState(true);

  const header = { alg: "HS256", typ: "JWT" };
  const payload = useMemo(
    () => ({ sub, email: `${sub}@example.dev`, role, exp: 1893456000 }),
    [sub, role],
  );
  const token = `${base64url(header)}.${base64url(payload)}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

  return (
    <DemoShell
      title="JWT Lab"
      description="Edit the claims and watch the token change. Notice: the middle part is readable by anyone — encoded, not encrypted."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              sub (subject — who is this?)
            </span>
            <input
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-card px-3 font-code text-sm focus:outline-2 focus:outline-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-card px-3 font-code text-sm focus:outline-2 focus:outline-primary"
            >
              <option value="student">student</option>
              <option value="ta">ta</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3">
            <input
              type="checkbox"
              checked={showPayload}
              onChange={(e) => setShowPayload(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            <span className="text-xs">
              Decode the payload (anyone can do this — no secret needed)
            </span>
          </label>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-code-bg p-3 font-code text-xs leading-loose break-all">
            <span className="text-[#f7768e]">{token.split(".")[0]}</span>
            <span className="text-slate-500">.</span>
            <span className="text-[#bb9af7]">{token.split(".")[1]}</span>
            <span className="text-slate-500">.</span>
            <span className="text-[#7dcfff]">{token.split(".")[2]}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-[11px] font-code sm:grid-cols-3">
            <div className="rounded-lg border border-[#f7768e]/40 bg-[#f7768e]/10 p-2">
              <p className="font-bold text-[#f7768e]">Header</p>
              <p className="text-muted-foreground">alg + typ</p>
            </div>
            <div className="rounded-lg border border-[#bb9af7]/40 bg-[#bb9af7]/10 p-2">
              <p className="font-bold text-[#bb9af7]">Payload</p>
              <p className="text-muted-foreground">sub · email · role · exp</p>
            </div>
            <div className="rounded-lg border border-[#7dcfff]/40 bg-[#7dcfff]/10 p-2">
              <p className="font-bold text-[#7dcfff]">Signature</p>
              <p className="text-muted-foreground">HMAC(payload, secret)</p>
            </div>
          </div>
          {showPayload && (
            <pre className="animate-fade-up rounded-lg border border-border bg-card p-3 font-code text-xs leading-relaxed">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </DemoShell>
  );
}

/* ---------------- 4. Pagination lab ---------------- */

const allItems = Array.from({ length: 48 }, (_, i) => ({
  id: `b${i + 1}`,
  title: `Book ${String(i + 1).padStart(2, "0")}`,
}));

function PaginationLab() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / limit);
  const safePage = Math.min(page, totalPages);
  const items = allItems.slice((safePage - 1) * limit, safePage * limit);

  return (
    <DemoShell
      title="Pagination Lab"
      description="Change page size and navigate — watch skip/limit and the metadata object stay in sync."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                limit (max 50)
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-11 rounded-lg border border-border bg-card px-3 font-code text-sm focus:outline-2 focus:outline-primary"
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <span className="min-w-20 text-center font-code text-sm">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 font-code text-xs"
              >
                <span className="text-primary">{it.id}</span>
                <span className="text-muted-foreground">{it.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-code-bg p-3 font-code text-xs leading-relaxed text-slate-200">
            <p className="text-[#7aa2f7]">// MongoDB query</p>
            <p>
              .skip(<span className="text-[#ff9e64]">{(safePage - 1) * limit}</span>)
              .limit(<span className="text-[#ff9e64]">{limit}</span>)
            </p>
            <p className="mt-1 text-slate-500">
              // skip = (page − 1) × limit
            </p>
          </div>
          <pre className="rounded-lg border border-border bg-card p-3 font-code text-xs leading-relaxed">
{JSON.stringify(
  {
    page: safePage,
    limit,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  },
  null,
  2,
)}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}

export function Demo({ name }: { name: DemoName }) {
  switch (name) {
    case "api-simulator":
      return <ApiSimulator />;
    case "status-explorer":
      return <StatusExplorer />;
    case "jwt-lab":
      return <JwtLab />;
    case "pagination-lab":
      return <PaginationLab />;
    default:
      return null;
  }
}
