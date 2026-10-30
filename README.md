# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## This copy

The kb export above, plus one signed page: what the reports merged into #4471 show.

- The page: `src/routes/kb/incidents/4471-problems/+page.svx`. Its table of problems and tickets comes from
  `src/lib/kb/ProblemTable.svelte`, which counts with the desk's own `groupByCause` and `readAs` (`causes.ts`, `desk-notes.json`).
- The page as the desk sees it: `build/kb/incidents/4471-problems/index.html` (the whole kb is built into `build/`).
- The tickets: one issue per problem in this repo, linked from the page.

Build with Node 22 and pnpm: `pnpm install && pnpm build` writes `build/`. The export carries only `src/`, so
`package.json`, `svelte.config.js`, `vite.config.js`, `src/app.html` and `src/routes/+layout.ts` are added to build it.
