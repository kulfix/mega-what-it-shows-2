<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem in the ticket, each with its count and the ticket it now has. Causes come from the desk's
  // own groupByCause; the reports the desk read as a one-day move (desk-notes.json) get their own row instead.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const moved = $derived(merged.filter((r) => notes.oneDayMove.includes(r.id)));
  const rows = $derived.by(() => {
    const byCause = groupByCause(
      merged.filter((r) => !notes.oneDayMove.includes(r.id)),
      tenantOf,
    ).map((g) => ({ problem: g.cause as string, reports: g.reports }));
    return moved.length ? [...byCause, { problem: 'one-day', reports: moved }] : byCause;
  });
  const counted = $derived(rows.reduce((n, r) => n + r.reports.length, 0));
  const tenants = (rs: Report[]) => new Set(rs.map((r) => r.tenant)).size;
  const seen = (rs: Report[]) => {
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return `${days[0]} → ${days[days.length - 1]}`;
  };
  const issue = (url: string) => `#${url.split('/').pop()}`;
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong>
  {rows.length === 1 ? 'problem' : 'problems'} · each report in one of them
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      {@const url = tickets[r.problem]}
      <tr>
        <td><code>{r.problem}</code></td>
        <td><strong>{r.reports.length}</strong></td>
        <td>{tenants(r.reports)}</td>
        <td>{seen(r.reports)}</td>
        <td>{#if url}<a href={url}>{issue(url)}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  The rows add up to {counted} of {merged.length}. The desk's own CauseTable files the {moved.length} one-day
  reports under <code>parser</code> by tenant and footnotes them; here they have their row and their ticket.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
