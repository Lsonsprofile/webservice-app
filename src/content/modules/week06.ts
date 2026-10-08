import type { Module } from '../types';

export const week06: Module = {
  id: 'w6',
  week: 'Week 06',
  title: 'Security Essentials & XSS',
  tagline: 'Protect your API and your users: escape output, sanitize input, use CSP, and understand the three types of cross-site scripting.',
  level: 'Advanced',
  hue: 20,
  related: ['w4', 'w3'],
  sections: [
    {
      id: 'xss-and-prevention',
      title: 'Cross-Site Scripting (XSS) & Prevention',
      minutes: 30,
      blocks: [
        { type: 'lead', text: 'Cross-site scripting (XSS) happens when attacker-controlled content is treated as code in a victim\'s browser. Web services make this a frontend concern too: any API value rendered with innerHTML can become an attack vector.' },
        { type: 'h', text: 'The three types of XSS' },
        { type: 'table', headers: ['Type', 'Description', 'Example impact'], rows: [
          ['Stored XSS', 'Malicious code is permanently stored on the server (e.g. in a database or comment).', 'Every visitor to that page runs the script.'],
          ['Reflected XSS', 'Code is embedded in a URL or form and reflected back in the response.', 'The attack works when a victim clicks a crafted link.'],
          ['DOM-based XSS', 'The vulnerability exists in client-side JavaScript manipulating the DOM.', 'The script runs entirely in the browser without server involvement.'],
        ]},
        { type: 'callout', variant: 'danger', title: 'Why API-driven pages must care', body: 'When you render API data with innerHTML, a stored value like a product name containing <script> or an <img onerror=...> payload executes in every visitor\'s browser. This is why the hydration pattern from Week 03 uses textContent — it never parses API text as markup.' },
        { type: 'code', title: 'unsafe vs. safe rendering', lang: 'js', code: `// UNSAFE — API text is parsed as HTML\ncard.innerHTML = \`<h3>\${product.name}</h3>\`;\n\n// SAFE — API text stays text\ncard.querySelector('.product-name').textContent = product.name;` },
        { type: 'h', text: 'Prevention' },
        { type: 'list', style: 'check', items: [
          'Escape user input before rendering it in HTML — or better, render with textContent so there is nothing to escape.',
          'Use a Content Security Policy (CSP) to restrict which scripts can run.',
          'Validate and sanitize all data coming from users before storing or re-serving it.',
          'Never return raw database errors or stack traces to clients — error details can leak internals.',
        ]},
        { type: 'h', text: 'The broader security checklist for APIs' },
        { type: 'list', style: 'check', items: [
          'Never commit secrets, client secrets, private keys, or token signing secrets to GitHub.',
          'Store secrets in environment variables; use HTTPS in deployed environments.',
          'Do not return raw token verification errors or stack traces to clients.',
          'Check both authentication and authorization when a route changes sensitive data.',
          'Hash passwords with bcrypt — plain-text passwords are never stored, logged, or returned.',
          'Use an allowlist for client-supplied values like sort fields.',
        ]},
        { type: 'qa', title: 'Check your understanding', items: [
          { q: 'Which XSS type lives in the database?', a: 'Stored XSS — the malicious code is permanently stored on the server and runs for every visitor who views the affected content.' },
          { q: 'Which XSS type requires no server involvement?', a: 'DOM-based XSS — the vulnerability exists entirely in client-side JavaScript manipulating the DOM.' },
          { q: 'What single rendering habit prevents most DOM-based XSS in hydrated pages?', a: 'Setting values with textContent instead of building HTML strings with innerHTML.' },
        ]},
        { type: 'takeaways', items: [
          'Stored, reflected, and DOM-based XSS differ in where the payload lives — all execute in the victim\'s browser.',
          'textContent over innerHTML for API data; CSP as a second layer of defense.',
          'Validate and sanitize user data on the way in; escape on the way out.',
          'Safe error messages are a security feature, not just politeness.',
        ]},
        { type: 'exercise', title: 'Mini-exercise: hunt the injection', level: 'Core', steps: [
          'Write a product document whose name field contains <img src=x onerror=alert(1)>.',
          'Render it once with innerHTML and once with textContent — observe the difference.',
          'Search your project for innerHTML usages and classify each as safe (trusted markup) or risky (API data).',
          'Draft one CSP header rule that would block inline scripts, and note what legitimate code it might break.',
        ]},
      ],
    },
  ],
  quiz: [
    { q: 'Stored XSS means…', options: ['The payload lives only in a URL', 'Malicious code is permanently stored on the server and runs for every visitor', 'The attack needs no browser', 'The script is signed'], answer: 1, explain: 'Stored XSS persists in a database or comment and affects all viewers of that content.' },
    { q: 'The safest way to render API text into the page is…', options: ['innerHTML', 'textContent', 'eval()', 'document.write()'], answer: 1, explain: 'textContent never parses the value as markup, so injected tags stay inert text.' },
    { q: 'A Content Security Policy…', options: ['Encrypts the database', 'Restricts which scripts can run in the page', 'Hashes passwords', 'Blocks 404 responses'], answer: 1, explain: 'CSP limits script sources, reducing the damage an injected payload can do.' },
    { q: 'Why avoid returning stack traces to API clients?', options: ['They are slow', 'They leak internal details attackers can use', 'They break JSON', 'They use too much memory'], answer: 1, explain: 'Log details on the server; return safe messages to clients.' },
  ],
};
