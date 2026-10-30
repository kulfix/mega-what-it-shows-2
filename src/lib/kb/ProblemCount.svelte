<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { problemRows, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // A count inside a sentence: the reports of one problem in the ticket, counted as ProblemTable counts them.
  let { ticket, problem }: { ticket: number; problem: Problem } = $props();

  const n = $derived(
    problemRows(reports as Report[], ticket, tenantOf, notes.oneDayMove).rows.find((r) => r.problem === problem)?.reports.length ?? 0,
  );
</script>

<strong>{n}</strong>
