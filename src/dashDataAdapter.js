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
  "Connor O'Brien":    { base: 6681, start: 1, end: 7,  role: 'AE' }, // Departed — paid through Jul 2026
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
    // spark = TRUE net new for every rep (it feeds every "Net New ARR" display).
    // Plan D attainment is measured on ARR Collected, so that basis rides in
    // basisSpark instead — repAttainment reads it; charts never do. (2026-08-03:
    // Plan D gross used to ride in spark and showed as "net new" on the rep charts.)
    const spark = mo.map((b) => Math.round(b.netNew));
    const basisSpark = isPlanD ? mo.map((b) => Math.round(b.gross)) : spark;
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
      basisSpark,
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

  // ── Team monthly + YTD — ALL-IN engine numbers (sales reps + online store +
  // leadership comp), matching the workbook Dashboard/Payouts QA. The sales-only
  // split lives in CHANNEL below so the headline is always reconcilable. ──
  const baseForMonth = (m) => dashData.reps.reduce((sum, r) => {
    const info = ROSTER[r.name] || {};
    return sum + (((info.start ?? 1) <= m + 1 && m + 1 <= (info.end ?? 12))
      ? (info.base ?? 0) : 0);
  }, 0);

  // Team performance is SALES-TEAM ONLY (user decisions 2026-08-03): the Limio
  // online store is excluded from netNew, deals, AND gross. Its numbers remain
  // visible via CHANNEL (the split strip). Commission needs no exclusion — the
  // house channel earns none (engine emits 0). salesDeals comes straight from the
  // engine; sales gross = team gross − online gross (same identity the engine
  // uses for salesDeals: 433 − 115 = 318 ✓).
  const online = dashData.onlineStore || {};
  const onlineMonthly = online.monthly || [];
  // Commission is summed from the SELLER rows only — team.monthly[].commission
  // includes Chase/Lenny leadership comp, which the user excluded from Team
  // Performance (2026-08-03). Leadership comp stays visible in LEADERSHIP and
  // the payroll (PAYOUT) numbers remain the full engine payouts.
  const salesCommission = (m) => dashData.reps.reduce(
    (sum, r) => sum + (r.monthly[m]?.commission || 0), 0);
  const MONTHLY = months.map((b, m) => {
    const commission = Math.round(salesCommission(m));
    return {
      m: b.name,
      deals: b.salesDeals ?? b.deals,
      gross: Math.round((b.gross || 0) - (onlineMonthly[m]?.gross || 0)),
      netNew: Math.round(b.salesNetNew || 0),
      goal: Math.round((b.salesAttainment || 0) * 1000) / 10,
      commission,
      earnings: commission + baseForMonth(m),
    };
  });

  const teamYtd = dashData.team.ytd || {};
  const ytdCommission = MONTHLY.reduce((a, b) => a + b.commission, 0); // sellers only
  const ytdBase = MONTHLY.reduce((a, _b, m) => a + baseForMonth(m), 0);
  const YTD = {
    deals: teamYtd.salesDeals ?? teamYtd.deals ?? 0, // sales team only — no Limio
    gross: MONTHLY.reduce((a, b) => a + b.gross, 0), // sums the online-excluded months
    netNew: Math.round(teamYtd.salesNetNew || 0),    // sales team only — no Limio
    commission: ytdCommission,
    earnings: ytdCommission + ytdBase,
  };

  // ── CFO-layer exports (all guarded — an older dashData.json must not crash) ──
  const CHANNEL = {
    ytd: {
      sales: Math.round(teamYtd.salesNetNew || 0),
      salesDeals: teamYtd.salesDeals ?? 0,
      online: Math.round(online.ytdNetNew || 0),
      onlineDeals: online.ytdDeals ?? 0,
      onlineName: online.name || 'Online Store',
    },
    monthly: months.map((b, m) => ({
      sales: Math.round(b.salesNetNew || 0),
      salesDeals: b.salesDeals ?? 0,
      online: Math.round(onlineMonthly[m]?.netNew || 0),
      onlineDeals: onlineMonthly[m]?.deals ?? 0,
    })),
  };

  const payout = dashData.payout || {};
  const am = (payout.activityMonth || dm) - 1; // activity-month index for payout rows
  const teamAm = dashData.team.monthly[am] || {};
  const PAYOUT = {
    ...payout,
    totalPayout: teamAm.totalPayout ?? null,       // mid-month advances + EOM, all reps
    eomTotal: teamAm.eomPayout ?? null,
    midMonthTotal: (teamAm.totalPayout != null && teamAm.eomPayout != null)
      ? Math.round((teamAm.totalPayout - teamAm.eomPayout) * 100) / 100 : null,
    perRep: dashData.reps.map((r) => ({
      name: r.name,
      totalPayout: r.monthly[am]?.totalPayout ?? null,
      eomPayout: r.monthly[am]?.eomPayout ?? null,
    })),
  };

  const LEADERSHIP = (dashData.leadership || []).map((l) => ({
    name: l.name,
    ytdComp: Math.round((l.ytdComp || 0) * 100) / 100,
    role: (ROSTER[l.name] || {}).role || 'Leader',
    color: REP_COLORS[l.name] || '#6B6F8C',
  }));

  const TEAM_QUOTA = {
    monthly: months.map((b) => b.quota || 0),
    ytd: teamYtd.quota || 0,
    ytdAttainment: teamYtd.salesAttainment ?? teamYtd.attainment ?? null, // sales basis
  };

  const COVERAGE = dashData.coverageThrough || null;
  const PRIOR_YEAR = dashData.priorYearBookArr || null;

  return {
    LAST_UPDATED, PERIOD_OPTIONS, MONTH_INDEX, CURRENT_MONTH, REPS, MONTHLY, YTD,
    PAYOUT, CHANNEL, LEADERSHIP, TEAM_QUOTA, COVERAGE, PRIOR_YEAR,
  };
}
