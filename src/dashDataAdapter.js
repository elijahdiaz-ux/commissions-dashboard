// Adapter: dashData.json (REVAMP workbook Export-tab pipeline) → the exact constant
// shapes the components consume (REPS / MONTHLY / YTD / PERIOD_OPTIONS / MONTH_INDEX).
// Component code never reads dashData directly — everything funnels through here, so a
// schema change in the pipeline is a one-file fix.

// ── Static presentation maps (not in the JSON by design) ────────────────────
// Base pay + roster windows mirror Settings ▸ tblReps in the REVAMP workbook.
// Refresh here if a rep's base or start/end month changes (see automation README).
const ROSTER = {
  'Brian Carl':        { base: 5000, start: 1, end: 12, role: 'AE' },
  'Caleb Gilbert':     { base: 5000, start: 1, end: 12, role: 'AE' },
  'Connor Krauseneck': { base: 5000, start: 1, end: 12, role: 'AE' },
  "Connor O'Brien":    { base: 6681, start: 1, end: 12, role: 'AE' },
  'Cameron Grissom':   { base: 4167, start: 1, end: 12, role: 'AM' },
  'Elijah Diaz':       { base: 4167, start: 1, end: 6,  role: 'AM' },
  'Jordy Hornbuckle':  { base: 4167, start: 1, end: 4,  role: 'AM' },
  'Sean Parr':         { base: 4167, start: 1, end: 12, role: 'AM' },
  'Kaitlyn Lack':      { base: 4167, start: 1, end: 12, role: 'SM AM' },
  'Carson Santee':     { base: 4167, start: 1, end: 12, role: 'SM AM' },
  'Timm Horton':       { base: 5000, start: 1, end: 12, role: 'Sr AM' },
  'Chase Bryant':      { base: 0,    start: 1, end: 12, role: 'AM Mgr' },
  'Lenny Fellez':      { base: 0,    start: 1, end: 12, role: 'VP' },
};

const REP_COLORS = {
  'Cameron Grissom': '#34D399', 'Kaitlyn Lack': '#6BD9A4', 'Chase Bryant': '#6B6F8C',
  'Connor Krauseneck': '#F3C969', 'Caleb Gilbert': '#E26D8E', 'Brian Carl': '#F08F6A',
  'Elijah Diaz': '#6EE7B7', "Connor O'Brien": '#7BD3EA', 'Sean Parr': '#F687B3',
  'Carson Santee': '#68D391', 'Lenny Fellez': '#FC8181', 'Timm Horton': '#63B3ED',
  'Jordy Hornbuckle': '#B794F4',
};
const FALLBACK_COLORS = ['#9F7AEA', '#4FD1C5', '#F6AD55', '#FC8181', '#63B3ED'];

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

const planLetter = (plan) => {
  const m = /^Plan\s+([A-Z])$/i.exec((plan || '').trim());
  return m ? m[1].toUpperCase() : 'Inactive';
};

export function buildConstants(dashData) {
  const dm = dashData.dataMonth;               // 1-based latest month with data
  const year = dashData.fiscalYear;
  const months = dashData.team.monthly.slice(0, dm); // actual months only

  // ── Period selector ──
  const labels = months.map((b) => `${b.name} ${year}`);
  const PERIOD_OPTIONS = [...labels].reverse();
  if (dm >= 3) PERIOD_OPTIONS.push(`Q1 ${year}`);
  PERIOD_OPTIONS.push(`YTD ${year}`);
  const MONTH_INDEX = Object.fromEntries(labels.map((l, i) => [l, i]));

  // ── Header stamp + pacing ──
  const gen = new Date(dashData.generatedAt);
  const LAST_UPDATED = gen.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'America/Chicago',
  }).replace(/, (\d{4}),/, ', $1 ·') + ' CST';
  const daysInDm = new Date(year, dm, 0).getDate();
  const CURRENT_MONTH = {
    name: MONTH_FULL[dm - 1],
    year,
    dayOfMonth: (gen.getMonth() + 1 === dm && gen.getFullYear() === year)
      ? gen.getDate() : daysInDm,
    daysInMonth: daysInDm,
  };

  // ── Reps (sellers from the engine + leadership placeholder rows) ──
  let fallbackIdx = 0;
  const repFromEngine = (r) => {
    const info = ROSTER[r.name] || {};
    const isPlanD = planLetter(r.plan) === 'D';
    const mo = r.monthly.slice(0, dm);
    const spark = mo.map((b) => Math.round(isPlanD ? b.gross : b.netNew));
    const cur = mo[dm - 1];
    const commission = Math.round(cur.commission || 0);
    const active = (info.start ?? 1) <= dm && dm <= (info.end ?? 12);
    const basePay = active ? (info.base ?? 0) : 0;
    return {
      name: r.name,
      role: info.role || r.team,
      deals: cur.deals,
      netNew: Math.round(cur.netNew),
      goal: Math.round((cur.attainment || 0) * 1000) / 10,
      gross: Math.round(cur.gross),
      commission,
      basePay,
      earnings: basePay + commission,
      status: 'on-track', // recomputed live by getRepStatus everywhere it matters
      spark,
      color: REP_COLORS[r.name] ||
        FALLBACK_COLORS[(fallbackIdx++) % FALLBACK_COLORS.length],
      plan: planLetter(r.plan),
      monthlyDeals: mo.map((b) => b.deals),
      commissionByMonth: mo.map((b) => Math.round(b.commission || 0)),
      dealsList: [], // subscription detail reads live from qaData
    };
  };

  const leaderRow = (name) => ({
    name,
    role: (ROSTER[name] || {}).role || 'Leader',
    deals: 0, netNew: 0, goal: 0, gross: 0, commission: 0, basePay: 0, earnings: 0,
    status: 'inactive',
    spark: Array(dm).fill(0),
    color: REP_COLORS[name] || '#6B6F8C',
    plan: 'Inactive',
    monthlyDeals: Array(dm).fill(0),
    commissionByMonth: Array(dm).fill(0),
    dealsList: [],
  });

  const REPS = [
    ...dashData.reps.map(repFromEngine),
    ...dashData.leadership.map((l) => leaderRow(l.name)),
  ];

  // ── Team monthly + YTD (sales view: sellers only, matching the old headline) ──
  const sellersMonth = (m) => dashData.reps.map((r) => r.monthly[m]);
  const baseForMonth = (m) => dashData.reps.reduce((sum, r) => {
    const info = ROSTER[r.name] || {};
    return sum + (((info.start ?? 1) <= m + 1 && m + 1 <= (info.end ?? 12))
      ? (info.base ?? 0) : 0);
  }, 0);

  const MONTHLY = months.map((b, m) => {
    const rows = sellersMonth(m);
    const commission = Math.round(rows.reduce((a, r) => a + (r.commission || 0), 0));
    return {
      m: b.name,
      deals: b.salesDeals,
      gross: Math.round(rows.reduce((a, r) => a + (r.gross || 0), 0)),
      netNew: Math.round(b.salesNetNew),
      goal: Math.round((b.salesAttainment || 0) * 1000) / 10,
      commission,
      earnings: commission + baseForMonth(m),
    };
  });

  const ytdCommission = Math.round(
    dashData.reps.reduce((a, r) => a + (r.ytd.commission || 0), 0));
  const ytdBase = MONTHLY.reduce((a, _b, m) => a + baseForMonth(m), 0);
  const YTD = {
    deals: dashData.team.ytd.salesDeals,
    gross: Math.round(dashData.reps.reduce((a, r) => a + (r.ytd.gross || 0), 0)),
    netNew: Math.round(dashData.team.ytd.salesNetNew),
    commission: ytdCommission,
    earnings: ytdCommission + ytdBase,
  };

  return { LAST_UPDATED, PERIOD_OPTIONS, MONTH_INDEX, CURRENT_MONTH, REPS, MONTHLY, YTD };
}
