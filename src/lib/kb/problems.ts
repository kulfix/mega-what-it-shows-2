// The problems a merged ticket holds, counted the desk's way: every report under its cause (causes.ts), and the
// reports the desk read as a one-day move (desk-notes.json) on a row of their own as well. Those stay counted
// where they're filed too, as readAs says.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'unplaced' | 'one-day';

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // For the one-day row: where the desk files these reports, cause → count.
  filedAs?: Record<string, number>;
};

const tally = (rs: Report[], key: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});

function row(problem: Problem, rs: Report[]): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    channels: tally(rs, (r) => r.channel),
    taggedAs: tally(rs, (r) => r.meta.intakeTag),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function problemRows(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; rows: ProblemRow[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const rows: ProblemRow[] = groupByCause(merged, tenantOf).map((g) => row(g.cause, g.reports));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const filedIn = (r: Report) => rows.find((x) => x.reports.includes(r))?.problem ?? 'unplaced';
    rows.push({ ...row('one-day', moved), filedAs: tally(moved, filedIn) });
  }
  return { merged, rows };
}
