// ---------- Content model for the learning platform ----------

export type DiagramName =
  | 'request-flow'
  | 'ssr-vs-api'
  | 'crud-map'
  | 'mvc'
  | 'embed-vs-ref'
  | 'swagger-flow'
  | 'oauth-flow'
  | 'jwt-structure'
  | 'auth-guard'
  | 'pagination';

export type DemoName =
  | 'api-simulator'
  | 'status-explorer'
  | 'jwt-lab'
  | 'pagination-lab';

export type Block =
  | { type: 'lead'; text: string }
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'code'; title?: string; lang: 'js' | 'json' | 'http' | 'bash' | 'html'; code: string }
  | { type: 'table'; title?: string; headers: string[]; rows: string[][] }
  | { type: 'list'; style: 'check' | 'cross' | 'steps' | 'plain'; items: string[] }
  | { type: 'callout'; variant: 'tip' | 'warn' | 'danger' | 'info' | 'realworld'; title: string; body: string }
  | { type: 'diagram'; name: DiagramName; caption?: string }
  | { type: 'demo'; name: DemoName }
  | { type: 'qa'; title?: string; items: { q: string; a: string }[] }
  | { type: 'takeaways'; items: string[] }
  | { type: 'exercise'; title: string; level: 'Warm-up' | 'Core' | 'Stretch'; steps: string[] };

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Section {
  id: string;
  title: string;
  minutes: number;
  blocks: Block[];
}

export interface Module {
  id: string;
  week: string;
  title: string;
  tagline: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  hue: number; // theme hue for the module
  sections: Section[];
  quiz: QuizQuestion[];
  related: string[]; // module ids
}

export interface CheatSheet {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  filename: string;
  markdown: string;
}

export interface Project {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  hours: string;
  summary: string;
  brief: string[];
  tasks: string[];
  testPlan: string[];
  moduleIds: string[];
}
