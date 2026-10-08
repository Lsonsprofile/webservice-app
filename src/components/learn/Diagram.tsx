import type { ReactNode } from "react";
import type { DiagramName } from "@/content/types";

/**
 * Hand-drawn SVG teaching diagrams. Each renders on its own dark panel so it
 * reads identically in light and dark themes. All include <title> for a11y.
 */

const C = {
  panel: "hsl(228 55% 10%)",
  border: "hsl(228 30% 24%)",
  box: "hsl(228 45% 16%)",
  blue: "hsl(233 84% 62%)",
  cyan: "hsl(190 90% 50%)",
  green: "hsl(150 70% 45%)",
  amber: "hsl(38 92% 55%)",
  red: "hsl(0 75% 60%)",
  violet: "hsl(262 80% 68%)",
  text: "hsl(220 30% 92%)",
  dim: "hsl(220 15% 62%)",
};

function Box({
  x,
  y,
  w,
  h = 44,
  label,
  sub,
  fill = C.box,
  stroke = C.border,
  textFill = C.text,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  sub?: string;
  fill?: string;
  stroke?: string;
  textFill?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill={fill} stroke={stroke} strokeWidth={1.4} />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textFill}
        fontSize={12.5}
        fontWeight={600}
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
      {sub ? (
        <text
          x={x + w / 2}
          y={y + h / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={C.dim}
          fontSize={10}
          fontFamily="'JetBrains Mono', monospace"
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
  color = C.cyan,
  dashed,
  labelAbove = true,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  color?: string;
  dashed?: boolean;
  labelAbove?: boolean;
}) {
  const id = `ah-${color.replace(/[^a-z0-9]/gi, "")}`;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <defs>
        <marker id={id} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.6}
        strokeDasharray={dashed ? "5 4" : undefined}
        markerEnd={`url(#${id})`}
      />
      {label ? (
        <text
          x={midX}
          y={labelAbove ? midY - 6 : midY + 14}
          textAnchor="middle"
          fill={color}
          fontSize={10.5}
          fontFamily="'JetBrains Mono', monospace"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

function Panel({
  title,
  caption,
  height,
  children,
}: {
  title: string;
  caption?: string;
  height: number;
  children: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border shadow-sm">
      <svg
        viewBox={`0 0 640 ${height}`}
        role="img"
        aria-label={title}
        className="block w-full"
        style={{ background: C.panel }}
      >
        <title>{title}</title>
        {children}
      </svg>
      {caption ? (
        <figcaption className="border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function RequestFlow() {
  return (
    <Panel
      title="Anatomy of an API request and response"
      caption="A client sends an HTTP request; the web service routes it, runs logic, talks to the database, and returns a status code plus a JSON body."
      height={210}
    >
      <Box x={20} y={70} w={110} label="Client" sub="browser / app" stroke={C.blue} />
      <Box x={190} y={70} w={120} label="Express Router" sub="GET /books/:id" stroke={C.cyan} />
      <Box x={370} y={70} w={110} label="Controller" sub="getBookById()" stroke={C.violet} />
      <Box x={520} y={70} w={100} label="MongoDB" sub="books" stroke={C.green} />
      <Arrow x1={130} y1={92} x2={186} y2={92} label="request" />
      <Arrow x1={310} y1={92} x2={366} y2={92} />
      <Arrow x1={480} y1={92} x2={516} y2={92} />
      <Arrow x1={520} y1={150} x2={134} y2={150} label="200 OK + JSON" color={C.green} labelAbove={false} />
      <text x={20} y={30} fill={C.dim} fontSize={11} fontFamily="'JetBrains Mono', monospace">
        GET /books/b1  →  200 OK  {"{ id, title, author }"}
      </text>
    </Panel>
  );
}

function SsrVsApi() {
  return (
    <Panel
      title="Server-rendered pages vs data APIs"
      caption="A traditional server returns finished HTML. A web service returns raw data (JSON) that any frontend — or another service — can render."
      height={240}
    >
      <text x={30} y={30} fill={C.amber} fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif">
        Server-side rendering
      </text>
      <Box x={30} y={46} w={100} label="Browser" />
      <Box x={220} y={46} w={130} label="Server + EJS" sub="builds HTML" stroke={C.amber} />
      <Arrow x1={130} y1={68} x2={216} y2={68} label="GET /page" color={C.amber} />
      <Arrow x1={220} y1={100} x2={134} y2={100} label="HTML page" color={C.amber} labelAbove={false} />

      <text x={30} y={156} fill={C.cyan} fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif">
        Web service (API)
      </text>
      <Box x={30} y={172} w={100} label="Any client" sub="web / mobile" />
      <Box x={220} y={172} w={130} label="API server" sub="JSON only" stroke={C.cyan} />
      <Box x={430} y={172} w={180} label="Frontend renders UI" sub="fetch + template" stroke={C.violet} />
      <Arrow x1={130} y1={194} x2={216} y2={194} label="GET /api/trips" />
      <Arrow x1={220} y1={206} x2={134} y2={206} label="JSON data" color={C.green} labelAbove={false} />
      <Arrow x1={350} y1={194} x2={426} y2={194} color={C.violet} />
    </Panel>
  );
}

function CrudMap() {
  const rows: [string, string, string][] = [
    ["Create", "POST /books", "insertOne()"],
    ["Read", "GET /books/:id", "findOne()"],
    ["Update", "PUT /books/:id", "updateOne() + $set"],
    ["Delete", "DELETE /books/:id", "deleteOne()"],
  ];
  return (
    <Panel
      title="CRUD maps to HTTP methods and MongoDB calls"
      caption="Every CRUD operation pairs one HTTP method + route with one MongoDB driver call."
      height={230}
    >
      {["CRUD", "HTTP route", "MongoDB driver"].map((h, i) => (
        <text
          key={h}
          x={[70, 260, 480][i]}
          y={34}
          textAnchor="middle"
          fill={C.dim}
          fontSize={11}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
        >
          {h.toUpperCase()}
        </text>
      ))}
      {rows.map(([crud, http, mongo], i) => {
        const y = 50 + i * 42;
        const color = [C.green, C.cyan, C.amber, C.red][i];
        return (
          <g key={crud}>
            <Box x={20} y={y} w={100} h={32} label={crud} stroke={color} />
            <Box x={170} y={y} w={180} h={32} label={http} stroke={C.border} textFill={C.cyan} />
            <Box x={390} y={y} w={200} h={32} label={mongo} stroke={C.border} textFill={C.green} />
            <Arrow x1={120} y1={y + 16} x2={166} y2={y + 16} color={C.dim} />
            <Arrow x1={350} y1={y + 16} x2={386} y2={y + 16} color={C.dim} />
          </g>
        );
      })}
    </Panel>
  );
}

function Mvc() {
  return (
    <Panel
      title="Model–View–Controller in a web service"
      caption="Routes accept requests, controllers hold the logic, models own the data. In an API the 'view' is the JSON response."
      height={220}
    >
      <Box x={20} y={80} w={100} label="Client" />
      <Box x={170} y={30} w={120} label="Router" sub="routes/books.js" stroke={C.cyan} />
      <Box x={170} y={130} w={120} label="Controller" sub="booksController" stroke={C.violet} />
      <Box x={350} y={130} w={110} label="Model" sub="db access" stroke={C.green} />
      <Box x={510} y={130} w={110} label="MongoDB" stroke={C.green} />
      <Arrow x1={120} y1={92} x2={166} y2={56} label="request" />
      <Arrow x1={230} y1={74} x2={230} y2={126} color={C.dim} />
      <Arrow x1={290} y1={152} x2={346} y2={152} />
      <Arrow x1={460} y1={152} x2={506} y2={152} />
      <Arrow x1={170} y1={166} x2={64} y2={124} label="JSON view" color={C.green} dashed />
    </Panel>
  );
}

function EmbedVsRef() {
  return (
    <Panel
      title="Embedding vs referencing related data"
      caption="Embed small, owned data inside the document; reference independent entities by id and join with $lookup when needed."
      height={230}
    >
      <text x={30} y={30} fill={C.green} fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif">Embed</text>
      <rect x={30} y={44} width={250} height={150} rx={10} fill={C.box} stroke={C.green} strokeWidth={1.4} />
      <text x={46} y={70} fill={C.text} fontSize={12} fontFamily="'JetBrains Mono', monospace">book {"{"}</text>
      <text x={62} y={92} fill={C.dim} fontSize={11} fontFamily="'JetBrains Mono', monospace">title: "Dune",</text>
      <rect x={62} y={102} width={190} height={56} rx={7} fill="hsl(150 45% 14%)" stroke={C.green} strokeWidth={1} />
      <text x={74} y={124} fill={C.green} fontSize={10.5} fontFamily="'JetBrains Mono', monospace">reviews: [ {"{…}"}, {"{…}"} ]</text>
      <text x={74} y={144} fill={C.dim} fontSize={10} fontFamily="Inter, sans-serif">lives inside the book</text>
      <text x={46} y={180} fill={C.text} fontSize={12} fontFamily="'JetBrains Mono', monospace">{"}"}</text>

      <text x={360} y={30} fill={C.cyan} fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif">Reference</text>
      <Box x={360} y={44} w={120} h={52} label="books" sub="authorId: a1" stroke={C.cyan} />
      <Box x={360} y={140} w={120} h={52} label="authors" sub="_id: a1" stroke={C.violet} />
      <Arrow x1={420} y1={96} x2={420} y2={136} label="$lookup join" />
      <text x={500} y={120} fill={C.dim} fontSize={10.5} fontFamily="Inter, sans-serif">
        two collections,
      </text>
      <text x={500} y={136} fill={C.dim} fontSize={10.5} fontFamily="Inter, sans-serif">
        joined on demand
      </text>
    </Panel>
  );
}

function SwaggerFlow() {
  return (
    <Panel
      title="How Swagger docs are generated"
      caption="@openapi comments above your routes are compiled into swagger.json, which swagger-ui-express renders as an interactive docs page."
      height={190}
    >
      <Box x={20} y={60} w={150} label="@openapi comments" sub="above each route" stroke={C.violet} />
      <Box x={230} y={60} w={140} label="swagger.js" sub="swagger-jsdoc" stroke={C.blue} />
      <Box x={430} y={60} w={90} label="swagger.json" stroke={C.amber} />
      <Box x={430} y={128} w={190} h={40} label="/api-docs interactive page" sub="swagger-ui-express" stroke={C.cyan} />
      <Arrow x1={170} y1={82} x2={226} y2={82} />
      <Arrow x1={370} y1={82} x2={426} y2={82} label="generate" />
      <Arrow x1={475} y1={104} x2={475} y2={124} color={C.amber} />
      <text x={230} y={40} fill={C.dim} fontSize={11} fontFamily="'JetBrains Mono', monospace">
        npm run swagger  →  regenerates after every route change
      </text>
    </Panel>
  );
}

function OauthFlow() {
  return (
    <Panel
      title="OAuth 2.0 authorization code flow"
      caption="The app never sees the user's password: the provider authenticates, returns a code, and the server exchanges it for a token."
      height={250}
    >
      <Box x={40} y={30} w={110} label="User" sub="browser" />
      <Box x={270} y={30} w={120} label="Your app" sub="client" stroke={C.cyan} />
      <Box x={490} y={30} w={120} label="OAuth provider" sub="e.g. Google" stroke={C.violet} />
      {[
        ["1 · clicks “Sign in”", 150, 56, 266, 56, C.text],
        ["2 · redirect to provider", 390, 56, 486, 56, C.cyan],
        ["3 · user logs in & approves", 550, 74, 550, 118, C.violet],
        ["4 · redirect back with ?code", 486, 130, 394, 130, C.green],
        ["5 · exchange code → token", 390, 170, 486, 170, C.amber],
        ["6 · access token", 486, 206, 394, 206, C.green],
        ["7 · session created", 266, 206, 154, 206, C.blue],
      ].map(([label, x1, y1, x2, y2, color]) => (
        <Arrow
          key={label as string}
          x1={x1 as number}
          y1={y1 as number}
          x2={x2 as number}
          y2={y2 as number}
          label={label as string}
          color={color as string}
          labelAbove={false}
        />
      ))}
    </Panel>
  );
}

function JwtStructure() {
  return (
    <Panel
      title="Anatomy of a JSON Web Token"
      caption="Three base64url parts joined by dots. The payload is readable by anyone — encoded, not encrypted — so never put secrets inside."
      height={190}
    >
      <text x={40} y={52} fill={C.red} fontSize={13} fontFamily="'JetBrains Mono', monospace">eyJhbGciOiJIUzI1NiIs…</text>
      <text x={212} y={52} fill={C.dim} fontSize={13} fontFamily="'JetBrains Mono', monospace">.</text>
      <text x={228} y={52} fill={C.violet} fontSize={13} fontFamily="'JetBrains Mono', monospace">eyJzdWIiOiIxMjMiLCJlb…</text>
      <text x={442} y={52} fill={C.dim} fontSize={13} fontFamily="'JetBrains Mono', monospace">.</text>
      <text x={458} y={52} fill={C.cyan} fontSize={13} fontFamily="'JetBrains Mono', monospace">SflKxwRJSMeKKF2QT4…</text>
      <Arrow x1={120} y1={62} x2={120} y2={96} color={C.red} dashed />
      <Arrow x1={330} y1={62} x2={330} y2={96} color={C.violet} dashed />
      <Arrow x1={520} y1={62} x2={520} y2={96} color={C.cyan} dashed />
      <Box x={40} y={100} w={160} h={56} label="Header" sub='{ "alg": "HS256" }' stroke={C.red} />
      <Box x={240} y={100} w={180} h={56} label="Payload" sub="sub · email · role · exp" stroke={C.violet} />
      <Box x={460} y={100} w={150} h={56} label="Signature" sub="HMAC + secret" stroke={C.cyan} />
    </Panel>
  );
}

function AuthGuard() {
  return (
    <Panel
      title="Authentication vs authorization guard chain"
      caption="requireAuth answers 'who are you?' (401 if unknown); requireRole answers 'may you do this?' (403 if not). Both run before the controller."
      height={200}
    >
      <Box x={20} y={70} w={100} label="Request" sub="+ session/JWT" />
      <Box x={180} y={70} w={130} label="requireAuth" sub="logged in?" stroke={C.amber} />
      <Box x={360} y={70} w={130} label="requireRole" sub="role allowed?" stroke={C.violet} />
      <Box x={540} y={70} w={80} label="Controller" stroke={C.green} />
      <Arrow x1={120} y1={92} x2={176} y2={92} />
      <Arrow x1={310} y1={92} x2={356} y2={92} />
      <Arrow x1={490} y1={92} x2={536} y2={92} />
      <Arrow x1={245} y1={114} x2={245} y2={156} color={C.red} dashed />
      <text x={255} y={170} fill={C.red} fontSize={11} fontFamily="'JetBrains Mono', monospace">401 Unauthorized</text>
      <Arrow x1={425} y1={114} x2={425} y2={156} color={C.red} dashed />
      <text x={435} y={170} fill={C.red} fontSize={11} fontFamily="'JetBrains Mono', monospace">403 Forbidden</text>
    </Panel>
  );
}

function PaginationDiagram() {
  return (
    <Panel
      title="Offset pagination with skip and limit"
      caption="page and limit become skip((page−1)·limit).limit(limit); a parallel countDocuments produces the metadata clients render as page controls."
      height={220}
    >
      <text x={30} y={34} fill={C.dim} fontSize={11} fontFamily="'JetBrains Mono', monospace">
        GET /books?page=2&limit=3&sort=title
      </text>
      {Array.from({ length: 10 }, (_, i) => {
        const inPage = i >= 3 && i < 6;
        return (
          <rect
            key={i}
            x={30 + i * 58}
            y={56}
            width={48}
            height={40}
            rx={7}
            fill={inPage ? "hsl(190 60% 18%)" : C.box}
            stroke={inPage ? C.cyan : C.border}
            strokeWidth={1.4}
          />
        );
      })}
      {Array.from({ length: 10 }, (_, i) => (
        <text
          key={i}
          x={54 + i * 58}
          y={80}
          textAnchor="middle"
          fill={i >= 3 && i < 6 ? C.cyan : C.dim}
          fontSize={10.5}
          fontFamily="'JetBrains Mono', monospace"
        >
          b{i + 1}
        </text>
      ))}
      <Arrow x1={80} y1={120} x2={196} y2={120} color={C.red} label="skip 3" labelAbove={false} />
      <Arrow x1={210} y1={140} x2={326} y2={140} color={C.cyan} label="limit 3 → page 2" labelAbove={false} />
      <Box x={390} y={120} w={220} h={56} label="metadata" sub="totalItems · totalPages · hasNext" stroke={C.green} />
      <Arrow x1={380} y1={96} x2={430} y2={116} color={C.dim} dashed />
    </Panel>
  );
}

export function Diagram({ name, caption }: { name: DiagramName; caption?: string }) {
  void caption; // captions are already embedded in each Panel
  switch (name) {
    case "request-flow":
      return <RequestFlow />;
    case "ssr-vs-api":
      return <SsrVsApi />;
    case "crud-map":
      return <CrudMap />;
    case "mvc":
      return <Mvc />;
    case "embed-vs-ref":
      return <EmbedVsRef />;
    case "swagger-flow":
      return <SwaggerFlow />;
    case "oauth-flow":
      return <OauthFlow />;
    case "jwt-structure":
      return <JwtStructure />;
    case "auth-guard":
      return <AuthGuard />;
    case "pagination":
      return <PaginationDiagram />;
    default:
      return null;
  }
}
