import type { Module, Project, CheatSheet } from './types';
import { week01 } from './modules/week01';
import { week02 } from './modules/week02';
import { week03 } from './modules/week03';
import { week04 } from './modules/week04';
import { week05 } from './modules/week05';
import { week06 } from './modules/week06';

export const modules: Module[] = [week01, week02, week03, week04, week05, week06];

export const moduleById = (id: string) => modules.find((m) => m.id === id);
export const sectionById = (moduleId: string, sectionId: string) =>
  moduleById(moduleId)?.sections.find((s) => s.id === sectionId);

export const totalSections = modules.reduce((n, m) => n + m.sections.length, 0);
export const totalMinutes = modules.reduce(
  (n, m) => n + m.sections.reduce((s, sec) => s + sec.minutes, 0),
  0,
);
export const totalQuizQuestions = modules.reduce((n, m) => n + m.quiz.length, 0);

// Every searchable entry: module sections + quiz
export interface SearchEntry {
  moduleId: string;
  moduleTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  text: string;
}

export const searchIndex: SearchEntry[] = modules.flatMap((m) => [
  { moduleId: m.id, moduleTitle: `${m.week} · ${m.title}`, text: `${m.title} ${m.tagline}` },
  ...m.sections.map((s) => ({
    moduleId: m.id,
    moduleTitle: `${m.week} · ${m.title}`,
    sectionId: s.id,
    sectionTitle: s.title,
    text: `${s.title} ${s.blocks
      .map((b) =>
        b.type === 'p' || b.type === 'lead' || b.type === 'h'
          ? b.text
          : b.type === 'callout'
            ? `${b.title} ${b.body}`
            : b.type === 'list'
              ? b.items.join(' ')
              : b.type === 'takeaways'
                ? b.items.join(' ')
                : '',
      )
      .join(' ')}`,
  })),
]);

export const projects: Project[] = [
  {
    id: 'books-api',
    title: 'Books Web Service',
    level: 'Beginner',
    hours: '4–6 hrs',
    summary: 'Build a read-only Books API with Express and MongoDB, then deploy it to Render.',
    brief: [
      'A web service that stores and returns book data. Each book record includes id, author, title, and publicationDate (ISO 8601).',
      'Endpoints: GET /books returns all books; GET /books/:id returns one book or 404.',
      'Errors never expose internals: 500 responses return { "message": "Internal server error" }.',
    ],
    tasks: [
      'Create the books collection in Atlas and seed at least 3 documents.',
      'Connect the app with src/db/connect.js and connect before listening.',
      'Implement model, controller, and router for GET /books.',
      'Implement GET /books/:id with 200/404/500 behavior.',
      'Deploy to Render with environment variables and Atlas IP whitelist.',
    ],
    testPlan: [
      'GET /books returns an array with status 200 and application/json.',
      'GET /books/b1 returns one book; GET /books/nope returns 404 with a safe message.',
      'The deployed Render URL passes the same checks.',
    ],
    moduleIds: ['w1'],
  },
  {
    id: 'books-authors-api',
    title: 'Books & Authors API',
    level: 'Intermediate',
    hours: '8–12 hrs',
    summary: 'Extend the Books API with full CRUD, an authors collection, a validated relationship, and Swagger docs.',
    brief: [
      'Books reference authors with authorId; unknown authorId is rejected with 400.',
      'Full CRUD for both collections with documented status codes.',
      'Deleting an author who still has books returns 409 Conflict.',
      'Every route is documented and testable at /api-docs, locally and deployed.',
    ],
    tasks: [
      'Write a Version 2 spec for both features with JSON examples.',
      'Create two GitHub issues with Test Plans.',
      'Implement the authors API first (model, controllers, routes, Swagger).',
      'Update books with authorId and add POST/PUT/DELETE.',
      'Regenerate swagger.json, deploy, and verify every route from the deployed /api-docs.',
    ],
    testPlan: [
      'POST /books returns 201; 400 for missing fields, duplicate id, or unknown authorId.',
      'PUT/DELETE return 404 for missing records and 204 for a successful delete.',
      'DELETE /authors/:id returns 409 while the author has books.',
      'npm run lint passes; all routes work from the deployed Swagger page.',
    ],
    moduleIds: ['w2'],
  },
  {
    id: 'kizuna-rail',
    title: 'Kizuna Rail Team Refactor',
    level: 'Intermediate',
    hours: '15–20 hrs',
    summary: 'Refactor an inherited railway booking app to Mongoose and API-driven pages — as a team.',
    brief: [
      'Kizuna Rail is a brownfield codebase: EJS pages, scattered data access, no models.',
      'Introduce schemas, models, and two route types: ejs-routes.js and api-routes.js.',
      'Feature sets: Trips, Schedules, Bookings (required); Ticket Classes, Stations (by team size).',
    ],
    tasks: [
      'Trace one request through the existing code before changing anything.',
      'Create Mongoose schemas and model functions for your assigned feature set.',
      'Add JSON API routes with Swagger documentation.',
      'Hydrate the assigned pages with fetch + <template> + textContent.',
      'Open PRs linked to issues, with walkthrough videos and verified test plans.',
    ],
    testPlan: [
      'API routes return correct status codes and JSON shapes.',
      'Hydrated pages show loading, success, and error states.',
      'Every PR receives at least one meaningful teammate review before merge.',
    ],
    moduleIds: ['w3'],
  },
  {
    id: 'secure-bookings',
    title: 'Secured Booking System',
    level: 'Advanced',
    hours: '10–14 hrs',
    summary: 'Add session authentication, roles, and bcrypt passwords to the team project — then protect every write route.',
    brief: [
      'Session-based auth with express-session and a generated SESSION_SECRET.',
      'User and Role models; passwords hashed with bcrypt; role assigned on the server.',
      'Page guards redirect to login; API guards return JSON 401/403.',
      'Update/delete UI waits for API responses and never reloads the page.',
    ],
    tasks: [
      'Configure session middleware before routes; add loadSessionUser.',
      'Build register/login/logout with createUser, findUserByEmail, verifyPassword.',
      'Write requirePageLogin/requireApiLogin/requirePageRole/requireApiRole.',
      'Protect admin routes and filter user data by ownership.',
      'Document protected routes in Swagger with 401/403 responses.',
    ],
    testPlan: [
      'Logged-out page visit redirects; logged-out API call returns 401 JSON.',
      'Customer role calling an admin route returns 403.',
      'Passwords in the database are bcrypt hashes, never plain text.',
      'In-place edit/delete updates the DOM only after a successful API response.',
    ],
    moduleIds: ['w4', 'w6'],
  },
];

export const cheatSheets: CheatSheet[] = [
  {
    id: 'cs-http-status',
    title: 'HTTP Status Codes for APIs',
    description: 'Every status code used in this course, when to return it, and the safe body to send.',
    moduleId: 'w1',
    filename: 'http-status-codes-cheatsheet.md',
    markdown: `# HTTP Status Codes — Cheat Sheet

## Success
| Code | Name | When to use |
| --- | --- | --- |
| 200 | OK | Read or update succeeded; response has a body |
| 201 | Created | POST created a new resource |
| 204 | No Content | Update/delete succeeded; no response body |

## Client errors
| Code | Name | When to use |
| --- | --- | --- |
| 400 | Bad Request | Missing/invalid input, invalid id format, unknown relationship id |
| 401 | Unauthorized | Missing or invalid authentication credentials |
| 403 | Forbidden | Authenticated but not allowed (wrong role) |
| 404 | Not Found | Valid request, but the resource does not exist |
| 409 | Conflict | Duplicate unique value; delete blocked by dependents |

## Server errors
| Code | Name | When to use |
| --- | --- | --- |
| 500 | Internal Server Error | Unexpected failure — return a safe message, log details server-side |

## Golden rules
- Invalid id format → 400. Valid id, no match → 404. Not the same thing!
- Missing credentials → 401. Wrong role → 403.
- Never return stack traces: 500 body is { "message": "Internal server error" }.
- Pick a duplicate-id rule (400 or 409) and document it in your spec.
`,
  },
  {
    id: 'cs-express-rest',
    title: 'Express REST API Patterns',
    description: 'The model–controller–router skeleton for every CRUD route, with validation and safe errors.',
    moduleId: 'w2',
    filename: 'express-rest-patterns-cheatsheet.md',
    markdown: `# Express REST API Patterns — Cheat Sheet

## CRUD mapping
| HTTP | CRUD | MongoDB driver | Mongoose |
| --- | --- | --- | --- |
| POST | Create | insertOne | Model.create(data) |
| GET | Read | find / findOne | Model.find() / findById() |
| PUT | Update | updateOne + $set | findByIdAndUpdate(id, data, { new: true, runValidators: true }) |
| DELETE | Delete | deleteOne | findByIdAndDelete(id) |

## Result objects → status codes
- insertOne → check insertedId → 201
- updateOne → matchedCount 0 → 404
- deleteOne → deletedCount 0 → 404, else 204

## Controller skeleton
\`\`\`js
const handler = async (req, res) => {
  try {
    // 1. read params/body
    // 2. validate required fields → 400
    // 3. call the model
    // 4. check the result → 404 if nothing matched
    // 5. return res.status(200).json(data)
  } catch (error) {
    console.error('route failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
\`\`\`

## Standards
- Always \`return res.status(...).json(...)\` — never fall through after a response.
- Keep handlers thin; database work lives in models.
- Copy only allowed fields from req.body into updates.
- app.use(express.json()) before any route that reads req.body.
`,
  },
  {
    id: 'cs-mongodb',
    title: 'MongoDB & Mongoose Quick Reference',
    description: 'Documents, collections, ObjectIds, relationships, schema options, and populate patterns.',
    moduleId: 'w3',
    filename: 'mongodb-mongoose-cheatsheet.md',
    markdown: `# MongoDB & Mongoose — Quick Reference

## Core vocabulary
- Document = one record (key-value pairs, like a JS object)
- Collection = a group of documents (like a table, but flexible)
- _id = unique id created automatically; ObjectId = 12-byte / 24-hex-char value

## Driver queries
\`\`\`js
await db.collection('trails').find({}).toArray();       // many
await db.collection('trails').findOne({ name: 'Pine' }); // one
ObjectId.isValid(req.params.id) // false → 400; valid but no match → 404
\`\`\`

## Schema options
required · unique (index, not required!) · default · enum · min/max · trim · timestamps: true
Duplicate unique value → error code 11000 → map to 409.

## Error mapping
ValidationError → 400 · CastError → 400 · valid id no match → 404 · else 500

## Relationships
- Embed: small, read-together data, or historical snapshots (order item price).
- Reference: shared, independently-managed data (books.authorId → authors.id).
- References do NOT auto-join: second query, $lookup, or Mongoose populate().
- populate('category', 'displayName slug') — only when the client needs it.
- Block deletes when dependents exist (409) — safest default.
`,
  },
  {
    id: 'cs-swagger',
    title: 'Swagger / OpenAPI Setup',
    description: 'Packages, generator file, comment syntax, and the troubleshooting checklist.',
    moduleId: 'w2',
    filename: 'swagger-openapi-cheatsheet.md',
    markdown: `# Swagger / OpenAPI — Cheat Sheet

## Packages
- swagger-ui-express (dependency) — serves interactive docs at /api-docs
- swagger-jsdoc (devDependency) — reads @openapi comments → swagger.json

## Workflow
1. Write @openapi YAML comments above each route (indentation matters!).
2. "swagger": "node swagger.js" in package.json scripts.
3. npm run swagger → regenerate swagger.json.
4. Commit swagger.json so Render can serve the docs.
5. app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

## Comment essentials
- Path params: /books/{id} + parameters section (in: path, required: true)
- POST/PUT: requestBody → content → application/json → schema + example
- List every status code the controller can return — including errors.
- Use components/schemas + $ref for reusable definitions.

## Troubleshooting
- Route missing → check apis list in swagger.js, regenerate, restart.
- YAML error → inconsistent indentation in comments.
- Deployed docs stale → swagger.json was not regenerated/committed.
`,
  },
  {
    id: 'cs-auth',
    title: 'Authentication & Authorization',
    description: 'OAuth flow, JWT anatomy, bcrypt, sessions, and the middleware guard library.',
    moduleId: 'w4',
    filename: 'authn-authz-cheatsheet.md',
    markdown: `# Authentication & Authorization — Cheat Sheet

## The two questions
- Authentication = WHO are you? (401 when missing/invalid)
- Authorization = WHAT may you do? (403 when authenticated but not allowed)

## OAuth authorization code flow
1. App redirects to provider (302) → 2. user signs in at provider →
3. provider redirects back with a code → 4. app exchanges code for tokens/profile →
5. app creates its own session/token.
Your app NEVER sees the provider password. Callback URLs must match exactly.

## JWT = header.payload.signature
- Payload is encoded, NOT encrypted — no secrets inside.
- Claims: sub (user id), email, role, exp (expiry).
- Client sends: Authorization: Bearer <token>
- jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }) · jwt.verify(token, JWT_SECRET)

## Sessions (browser apps)
- express-session with SESSION_SECRET (crypto.randomBytes(64).hex), in .env + Render.
- saveUninitialized: false, rolling: true, cookie maxAge.
- Register session middleware BEFORE routes; then loadSessionUser.

## Passwords
- bcrypt.hash(password, 12) on register; bcrypt.compare() on login.
- Plain text is never stored, logged, or returned.
- Server assigns the role at registration — never trust the client.

## Guard library
- requirePageLogin → redirect /login · requireApiLogin → 401 JSON
- requirePageRole('admin') → 403 page · requireApiRole('admin') → 403 JSON
- Hiding a link is NOT security — enforce on the server every time.
`,
  },
  {
    id: 'cs-frontend-apis',
    title: 'Frontend APIs & Hydration',
    description: 'fetch patterns, template hydration, event delegation, and in-place update/delete.',
    moduleId: 'w3',
    filename: 'frontend-apis-cheatsheet.md',
    markdown: `# Frontend APIs & Hydration — Cheat Sheet

## fetch fundamentals
- fetch() rejects ONLY on network failure — always check response.ok.
- const data = await response.json() parses the body.
- Show loading, success, AND error states.

## Hydration pattern
\`\`\`js
const card = template.content.cloneNode(true); // true = deep clone
card.querySelector('.name').textContent = item.name; // never innerHTML
fragment.append(card);
list.replaceChildren(fragment);
\`\`\`

## In-place update/delete
- Keep loaded items in a Map keyed by id.
- One delegated click listener on the stable container; closest('[data-action]').
- Edit: swap one card for a cloned edit form; Save sends PUT with JSON body.
- Delete: window.confirm + DELETE request.
- Update the Map ONLY from the successful API response — never reload the page.
- preventDefault() on form submit to stop the browser navigation.

## Server side of the contract
- Validate body fields, use allowed-field updates, runValidators: true.
- Protect write routes: 401 no login, 403 wrong role, 400 bad input, 404 missing.
- Confirmation dialogs are UX, not authorization.
`,
  },
  {
    id: 'cs-git-workflow',
    title: 'Git & Team Workflow',
    description: 'Issues, branches, pull requests, reviews, and merge etiquette for team projects.',
    moduleId: 'w3',
    filename: 'git-team-workflow-cheatsheet.md',
    markdown: `# Git & Team Workflow — Cheat Sheet

## The loop
1. git switch main && git pull origin main
2. git switch -c feature-name
3. Implement → test → npm run lint
4. git add . && git commit -m "Clear message" && git push origin feature-name
5. Open PR: link the issue (Closes #N), summarize changes, paste the verified Test Plan, link the walkthrough video
6. Review → merge → git switch main && git pull && git branch -d feature-name

## Good issues are
Clear · Testable · Small (one work session) · Verifiable (Test Plan checklist)

## Reviews
- Read the issue + PR description first.
- Checklist: scope, behavior, responses, data, security, docs, tests, quality.
- Two meaningful comments minimum; specific > vague.
- Outcomes: Comment / Approve / Request changes.
- Say what you ran vs. what you only read.

## Team etiquette
- Pull main before starting anything.
- Branch per feature; push fixes to the SAME branch.
- Post in the team channel when a PR is ready; respond to comments with evidence.
- Approved ≠ merged — the author merges, then everyone pulls.
- Coordinate who touches shared files (api-routes.js!) to avoid conflicts.
`,
  },
  {
    id: 'cs-pagination',
    title: 'Pagination & Scaling',
    description: 'Query parameters, validation, metadata shape, and the six pagination tests.',
    moduleId: 'w5',
    filename: 'pagination-cheatsheet.md',
    markdown: `# Pagination — Cheat Sheet

## Query parameters
page (default 1) · limit (default 10, max 50) · sort (allowlist!) · order (asc/desc)
GET /api/products?page=2&limit=10&sort=name&order=asc

## Validation
- Query params arrive as STRINGS — parse with Number(), require positive integers.
- Invalid page/limit/sort → 400 with { errors: [{ field, message }] }.
- Always enforce a maximum limit.

## Response shape
\`\`\`json
{
  "data": [],
  "pagination": {
    "page": 2, "limit": 10,
    "totalItems": 48, "totalPages": 5,
    "hasNextPage": true, "hasPreviousPage": true
  }
}
\`\`\`

## Implementation
- Model: find(filter).sort(sortOptions).skip((page-1)*limit).limit(limit) + countDocuments in Promise.all.
- Controller: parse + validate, then pass trusted options to the model.
- Swagger: document every query parameter with defaults, minimums, maximums, enums.

## Six tests
1. Page returns only \`limit\` records · 2. Page 2 differs from page 1 ·
3. Metadata present · 4. Invalid values → 400 · 5. Max limit enforced · 6. Sort changes order.
`,
  },
];
