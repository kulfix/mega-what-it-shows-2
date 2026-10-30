<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // Every problem in the ticket with its count and its ticket. Counted as the desk counts (CauseTable's
  // groupByCause, as exported); the reports the desk read as a one-day move get a row of their own as well,
  // and stay counted where the desk files them.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const moved = $derived(merged.filter((r) => notes.oneDayMove.includes(r.id)));
  const filedIn = $derived(groups.filter((g) => readAs(g, notes.oneDayMove)).map((g) => g.cause));
  const rows = $derived([
    ...groups.map((g) => ({ problem: g.cause as string, reports: g.reports })),
    ...(moved.length ? [{ problem: 'one-day', reports: moved }] : []),
  ]);
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
  {rows.length === 1 ? 'problem' : 'problems'}
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

{#if moved.length}
  <p class="note">
    The {moved.length} <code>one-day</code> reports are also counted under <code>{filedIn.join(', ')}</code>, where the
    desk files them by tenant.
  </p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
