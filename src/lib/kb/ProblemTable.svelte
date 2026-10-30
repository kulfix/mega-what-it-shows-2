<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { problemRows, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem in the ticket, each with the ticket it now has.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const t = $derived(problemRows(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const issue = (url: string) => url.replace(/^https:\/\/github\.com\//, '');
</script>

<p class="sum">
  <strong>{t.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{t.rows.length}</strong>
  {t.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>tagged as</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each t.rows as r (r.problem)}
      {@const url = tickets[r.problem]}
      <tr class:open={!url}>
        <td><code>{r.problem}</code></td>
        <td>{r.reports.length}</td>
        <td>{r.tenants}</td>
        <td class="small">{list(r.channels)}</td>
        <td class="small">{list(r.taggedAs)}</td>
        <td class="small">{r.firstSeen} → {r.lastSeen}</td>
        <td>{#if url}<a href={url}>{issue(url)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each t.rows.filter((r) => r.filedAs) as r (r.problem)}
  <p class="note">
    The {r.reports.length} <code>{r.problem}</code> reports are also counted where the desk files them by tenant:
    {list(r.filedAs ?? {})}.
  </p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
</style>
