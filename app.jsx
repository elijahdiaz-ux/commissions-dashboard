const { useState, useMemo, useEffect } = React;

// --------- PERIOD OPTIONS ---------
const PERIOD_OPTIONS = ['May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'Q1 2026', 'YTD 2026'];
const MONTH_INDEX = { 'Jan 2026': 0, 'Feb 2026': 1, 'Mar 2026': 2, 'Apr 2026': 3, 'May 2026': 4 };

// --------- PACING CONFIG ---------
// For live tracking, update these values to current date
const CURRENT_MONTH = {
  name: 'April',
  year: 2026,
  dayOfMonth: 30,  // Current day (30 = end of month for April)
  daysInMonth: 30, // Total days in April
};

// Calculate expected pacing percentage
const EXPECTED_PACING = (CURRENT_MONTH.dayOfMonth / CURRENT_MONTH.daysInMonth) * 100;

// Get rep status based on pacing logic
const getRepStatus = (goalPct) => {
  if (goalPct === 0) return 'inactive';
  if (goalPct >= EXPECTED_PACING) return 'on-track';
  if (goalPct >= EXPECTED_PACING * 0.9) return 'at-risk'; // Within 10% of expected
  return 'behind';
};

// Get status display info
const getStatusInfo = (status) => {
  switch(status) {
    case 'on-track': return { label: 'On Track', dotClass: 'dot-on', color: 'var(--green)' };
    case 'at-risk': return { label: 'At Risk', dotClass: 'dot-risk', color: 'var(--yellow)' };
    case 'behind': return { label: 'Behind', dotClass: 'dot-behind', color: 'var(--rose)' };
    case 'inactive': return { label: 'Inactive', dotClass: 'dot-inactive', color: 'var(--text-4)' };
    default: return { label: 'Unknown', dotClass: '', color: 'var(--text-3)' };
  }
};

// --------- DATA ---------
// Values from Excel: Commissions Workbook - Dashboard sheet (April 2026)
// --------- PLAN DETAILS ---------
const PLANS = {
  A: {
    name: 'Plan A - AE Standard',
    type: 'Quarterly',
    quota: 125000,
    annualQuota: 500000,
    baseRate: 0.08,
    tiers: [
      { min: 0, max: 100, rate: 0.08, label: 'Base (0-100%)' },
      { min: 100, max: 125, rate: 0.12, label: 'Accelerator (100-125%)' },
      { min: 125, max: 150, rate: 0.16, label: 'Super (125-150%)' },
      { min: 150, max: 999, rate: 0.20, label: 'Mega (150%+)' },
    ],
    description: '8% base rate on Net New ARR with accelerators at quota milestones',
  },
  B: {
    name: 'Plan B - AE with Dead Zone',
    type: 'Quarterly',
    quota: 125000,
    annualQuota: 500000,
    deadZone: 42367,
    baseRate: 0.06,
    tiers: [
      { min: 0, max: 42367, rate: 0, label: 'Dead Zone (0%)' },
      { min: 42367, max: 125000, rate: 0.06, label: 'Base (6%)' },
      { min: 125000, max: 187500, rate: 0.12, label: 'Accelerator (100-125%)' },
      { min: 187500, max: 999999, rate: 0.16, label: 'Super (125%+)' },
    ],
    description: 'No commission until $42K dead zone cleared, then 6% base rate',
  },
  C: {
    name: 'Plan C - AM Monthly',
    type: 'Monthly',
    quota: 50000,
    annualQuota: 600000,
    baseRate: 0.017,
    kickerRate: 0.10,
    tiers: [
      { min: 0, max: 50000, rate: 0.017, label: 'Base (1.7%)' },
      { min: 50000, max: 999999, rate: 0.10, label: 'Kicker (10% over quota)' },
    ],
    description: '1.7% on Net New ARR up to quota, 10% kicker on overages',
  },
  D: {
    name: 'Plan D - SME ARR Collected',
    type: 'Monthly',
    quota: 50000,
    annualQuota: 600000,
    baseRate: 0.017,
    basis: 'ARR Collected',
    tiers: [
      { min: 0, max: 999999, rate: 0.017, label: 'Flat (1.7%)' },
    ],
    description: '1.7% flat rate on total ARR Collected (no tiers, no kicker)',
  },
  Inactive: {
    name: 'Inactive',
    type: 'N/A',
    quota: 0,
    annualQuota: 0,
    baseRate: 0,
    tiers: [],
    description: 'No active commission plan',
  },
};

const REPS = [
  { name: 'Cameron Grissom',  role: 'AM',    deals: 26, netNew: 27027, goal: 54.1, gross: 44883, commission: 459, basePay: 4167, earnings: 4626, status: 'on-track', spark: [89945, 56342, 20377, 55323, 27027], color: '#34D399', plan: 'C', monthlyDeals: [102, 102, 77, 54, 26],
    dealsList: [
      { customer: 'Alliance Missionary Church', product: '252', arr: 2070, netNew: 1387 },
      { customer: 'Amplify Church', product: '252', arr: 3073, netNew: 2378 },
      { customer: 'Amplify Church', product: 'First Look', arr: 2154, netNew: 833 },
      { customer: 'Amplify Church', product: 'Amazing Music', arr: 1500, netNew: 1500 },
      { customer: 'Austin Avenue Methodist', product: 'Amazing+', arr: 2173, netNew: 1820 },
      { customer: 'Brentwood United Methodist', product: 'Amazing Music', arr: 1500, netNew: 1500 },
      { customer: 'Compass Church', product: '252', arr: 1007, netNew: 511 },
      { customer: 'Destination Community Church', product: '252', arr: 1199, netNew: 496 },
      { customer: 'Destination Community Church', product: 'First Look', arr: 1052, netNew: 388 },
      { customer: 'Elevate City Church', product: '252', arr: 2372, netNew: 1338 },
      { customer: 'Elevate City Church', product: 'First Look', arr: 1583, netNew: 1178 },
      { customer: 'Grace Church', product: '252', arr: 3577, netNew: 2818 },
      { customer: 'Higher Vision Church', product: 'First Look', arr: 2610, netNew: 2610 },
      { customer: 'Higher Vision Church', product: '252', arr: 3577, netNew: 3577 },
      { customer: 'Lakeview Church', product: 'First Look', arr: 1955, netNew: 1545 },
      { customer: 'Lakeview Church', product: '252', arr: 2774, netNew: 1189 },
      { customer: 'Lionheart Childrens Academy', product: '252', arr: 3438, netNew: 3031 },
      { customer: 'Local Church SAV', product: 'Amazing+', arr: 4952, netNew: 3420 },
      { customer: 'Oakwood Christian Church', product: 'Amazing+', arr: 4952, netNew: 2993 },
      { customer: 'Palm Harbor United Methodist', product: '252', arr: 3073, netNew: 2050 },
      { customer: 'SOUTHSTONE CHURCH', product: 'Amazing+', arr: 3459, netNew: 3459 },
    ]
  },
  { name: 'Kaitlyn Lack',     role: 'SM AM', deals: 14, netNew: 30403, goal: 60.8,  gross: 30403, commission: 517,  basePay: 4167, earnings: 4684, status: 'on-track', spark: [14877, 44955, 54195, 49690, 30403], color: '#6BD9A4', plan: 'D', arrCollected: [14877, 44955, 54195, 49690, 30403], monthlyDeals: [14, 35, 30, 26, 14],
    dealsList: [
      { customer: 'Allentown UMC', product: '252', arr: 1199, netNew: 642 },
      { customer: 'Awaken Church', product: '252', arr: 1199, netNew: 777 },
      { customer: 'Belong Church Atlanta', product: 'Amazing+', arr: 4627, netNew: 826 },
      { customer: 'Calvary Vision Church', product: '252', arr: 557, netNew: 557 },
      { customer: 'Capital Christian Church', product: '252', arr: 2070, netNew: 1063 },
      { customer: 'Elm City Vineyard Church', product: 'Amazing+', arr: 3025, netNew: 1738 },
      { customer: 'Faith Center', product: 'Amazing+', arr: 3459, netNew: 3459 },
      { customer: 'FCC Crescent', product: '252', arr: 1199, netNew: 1199 },
      { customer: 'First Baptist Church', product: '252', arr: 1199, netNew: 1199 },
      { customer: 'Houston Church', product: 'Amazing+', arr: 4138, netNew: 1141 },
      { customer: 'Keymar Evangelical Wesley', product: 'Amazing+', arr: 2251, netNew: 681 },
      { customer: 'Midway Locust Grove UMC', product: '252', arr: 2070, netNew: 496 },
      { customer: 'Renovation Church', product: 'Amazing+', arr: 4941, netNew: 6187 },
      { customer: 'The Freedom Church', product: '252', arr: 557, netNew: 557 },
      { customer: 'TTUMC', product: '252', arr: 1199, netNew: 1199 },
      { customer: 'Waypoint', product: '252', arr: 2070, netNew: 871 },
    ]
  },
  { name: 'Chase Bryant',     role: 'AM Mgr', deals: 0, netNew: 0, goal: 0.0,   gross: 73570, commission: 0,    basePay: 0,    earnings: 0,    status: 'inactive', spark: [0, 0, 0, 0, 0], color: '#6B6F8C', plan: 'Inactive', monthlyDeals: [0, 0, 0, 0, 0],
    dealsList: [
      { customer: 'Austin Ridge Bible Church', product: 'Amazing+', arr: 0, netNew: 6719 },
      { customer: 'Central Wesleyan Church', product: 'Middle School', arr: 2441, netNew: 955 },
      { customer: 'Central Wesleyan Church', product: '252', arr: 3445, netNew: 1231 },
      { customer: 'Central Wesleyan Church', product: 'First Look', arr: 2543, netNew: 1023 },
      { customer: 'Central Wesleyan Church', product: 'High School', arr: 2441, netNew: 2625 },
      { customer: 'Christ Fellowship', product: 'First Look', arr: 2100, netNew: 1690 },
      { customer: 'Christ Fellowship', product: '252', arr: 3500, netNew: 2333 },
      { customer: 'Church360', product: 'First Look', arr: 3177, netNew: 2670 },
      { customer: 'First Baptist Church Orlando', product: 'Amazing+', arr: 16849, netNew: 13887 },
      { customer: 'Parkview Christian Church', product: 'Amazing+', arr: 3950, netNew: 1258 },
      { customer: 'The United Methodist Church', product: '252', arr: 4304, netNew: 3031 },
    ]
  },
  { name: 'Connor Krauseneck',role: 'AE',    deals: 9, netNew: 21374, goal: 51.3,  gross: 35491, commission: 1710, basePay: 5000, earnings: 6710, status: 'behind',   spark: [1569, 17920, 21781, 34517, 21374], color: '#F3C969', plan: 'A', monthlyDeals: [6, 18, 13, 15, 9],
    dealsList: [
      { customer: 'Breiel Blvd. Church of God', product: 'Amazing+', arr: 3573, netNew: 3573 },
      { customer: 'Harbor Life Church', product: 'Amazing+', arr: 2380, netNew: 2380 },
      { customer: 'Horizons Community Church', product: 'Amazing+', arr: 2251, netNew: 2251 },
      { customer: 'Kalamazoo Community Church', product: 'Amazing+', arr: 3600, netNew: 3600 },
      { customer: 'La Jolla United Methodist', product: 'Amazing+', arr: 4562, netNew: 4562 },
      { customer: 'Limitless Church', product: 'Amazing+', arr: 366, netNew: 1100 },
      { customer: 'Malibu Pacific Church', product: 'Amazing+', arr: 3312, netNew: 1512 },
      { customer: 'Multiply Church', product: 'Amazing+', arr: 1751, netNew: 1751 },
      { customer: 'Redemption Church', product: 'Amazing+', arr: 647, netNew: 647 },
      { customer: 'Rexdale Alliance Church', product: 'Amazing+', arr: 2365, netNew: 2365 },
      { customer: 'Society Church', product: 'Amazing+', arr: 2788, netNew: 2788 },
      { customer: 'Together Church', product: 'Amazing+', arr: 3785, netNew: 3835 },
      { customer: 'Voices of Faith East', product: 'Amazing+', arr: 1901, netNew: 1901 },
      { customer: 'Word Of Life Church', product: 'Amazing+', arr: 2251, netNew: 2251 },
    ]
  },
  { name: 'Caleb Gilbert',    role: 'AE',    deals: 10,  netNew: 38410, goal: 92.2,  gross: 63760, commission: 3073, basePay: 5000, earnings: 8073, status: 'on-track',   spark: [32535, 30412, 66096, 25713, 38410], color: '#E26D8E', plan: 'A', monthlyDeals: [15, 22, 26, 6, 10],
    dealsList: [
      { customer: 'Christian Tabernacle Church', product: 'Amazing+', arr: 5814, netNew: 5814 },
      { customer: 'Connect Church', product: '252', arr: 4304, netNew: 3105 },
      { customer: 'Cornerstone Church', product: 'Amazing+', arr: 14999, netNew: 14999 },
      { customer: 'Godalming Minster', product: 'Amazing+', arr: 959, netNew: 459 },
      { customer: 'Liberty Baptist Church', product: 'High School', arr: 2431, netNew: 1335 },
    ]
  },
  { name: 'Brian Carl',       role: 'AE',    deals: 9, netNew: 20524, goal: 49.3,  gross: 34070, commission: 1642, basePay: 5000, earnings: 6642, status: 'behind',   spark: [58472, 24416, 30117, 25598, 20524], color: '#F08F6A', plan: 'A', monthlyDeals: [31, 50, 29, 13, 9],
    dealsList: [
      { customer: 'Cornerstone Methodist Church', product: 'Amazing+', arr: 1039, netNew: 1920 },
      { customer: 'Frankenmuth Bible Church', product: 'Amazing+', arr: 2191, netNew: 1351 },
      { customer: 'Freshwater Community Church', product: 'Amazing+', arr: 4055, netNew: 2489 },
      { customer: 'Grace UMC', product: 'Amazing+', arr: 800, netNew: 2401 },
      { customer: 'Jesus Crew', product: 'Amazing+', arr: 475, netNew: 475 },
      { customer: 'Lifepoint Church', product: 'Amazing+', arr: 7400, netNew: 7400 },
      { customer: 'Nashville Life Church', product: 'Amazing Music', arr: 799, netNew: 799 },
      { customer: 'OneLife Church', product: 'Amazing+', arr: 4138, netNew: 1512 },
      { customer: 'SonRise Church', product: 'Amazing+', arr: 647, netNew: 647 },
      { customer: 'The Orchard Community Church', product: 'Amazing+', arr: 4380, netNew: 417 },
      { customer: 'The Vine', product: 'Amazing+', arr: 6187, netNew: 6187 },
    ]
  },
  { name: 'Elijah Diaz',      role: 'AM',    deals: 7,  netNew: 13261,  goal: 26.5,  gross: 22013, commission: 225,  basePay: 4167, earnings: 4392, status: 'behind',   spark: [44074, 35159, 16829, 9990, 13261],   color: '#6EE7B7', plan: 'C', monthlyDeals: [57, 46, 27, 7, 7],
    dealsList: [
      { customer: 'Calvary Church', product: 'First Look', arr: 664, netNew: 0 },
      { customer: 'Christ Family Church', product: 'Amazing+', arr: 2256, netNew: 1125 },
      { customer: 'Discovery Church', product: 'First Look', arr: 201, netNew: 0 },
      { customer: 'Discovery Church', product: '252', arr: 227, netNew: 0 },
      { customer: 'Encompass Church', product: 'Amazing Music', arr: 1350, netNew: 1350 },
      { customer: 'Journey Church', product: 'Amazing+', arr: 2922, netNew: 3659 },
      { customer: 'One Line Church', product: 'Amazing+', arr: 3080, netNew: 3856 },
    ]
  },
  { name: "Connor O'Brien",   role: 'AE',    deals: 13, netNew: 9696,  goal: 23.3,  gross: 16095, commission: 0,    basePay: 6681, earnings: 6681, status: 'behind',   spark: [27565, 21550, 15042, 4903, 9696],  color: '#7BD3EA', plan: 'B', monthlyDeals: [25, 32, 24, 22, 13],
    dealsList: [
      { customer: 'Blue Oaks Church', product: 'First Look', arr: 894, netNew: 337 },
      { customer: 'His Presence Church', product: '252', arr: 2070, netNew: 871 },
      { customer: 'Innisfail Alliance Church', product: 'Amazing+', arr: 488, netNew: 488 },
      { customer: 'New Life Foursquare', product: '252', arr: 1839, netNew: 1214 },
      { customer: 'Port Orange Christian Church', product: 'First Look', arr: 557, netNew: 557 },
      { customer: 'St. Mark Baptist Church', product: 'Amazing+', arr: 916, netNew: 499 },
      { customer: 'Westminster Chapel', product: 'Manual Charge', arr: 778, netNew: 778 },
    ]
  },
  { name: 'Jordy Hornbuckle', role: 'AM',    deals: 0, netNew: 0, goal: 0, gross: 0, commission: 0, basePay: 4167, earnings: 4167, status: 'inactive', spark: [0, 0, 0, 0, 0], color: '#9F7AEA', plan: 'C', monthlyDeals: [0, 0, 0, 0, 0], dealsList: [] },
  { name: 'Sean Parr',        role: 'AM',    deals: 0, netNew: 0, goal: 0, gross: 0, commission: 0, basePay: 4167, earnings: 4167, status: 'inactive', spark: [0, 0, 0, 0, 0], color: '#F687B3', plan: 'C', monthlyDeals: [0, 0, 0, 0, 0], dealsList: [] },
  { name: 'Carson Santee',    role: 'SM AM', deals: 0, netNew: 0, goal: 0, gross: 0, commission: 0, basePay: 4167, earnings: 4167, status: 'inactive', spark: [0, 0, 0, 0, 0], color: '#68D391', plan: 'D', monthlyDeals: [0, 0, 0, 0, 0], dealsList: [] },
  { name: 'Lenny Fellez',     role: 'VP',    deals: 0, netNew: 0, goal: 0, gross: 0, commission: 0, basePay: 0,    earnings: 0,    status: 'inactive', spark: [0, 0, 0, 0, 0], color: '#FC8181', plan: 'Inactive', monthlyDeals: [0, 0, 0, 0, 0], dealsList: [] },
  { name: 'Timm Horton',      role: 'Sr AM', deals: 0, netNew: 0, goal: 0, gross: 0, commission: 0, basePay: 5000, earnings: 5000, status: 'inactive', spark: [0, 0, 0, 0, 0], color: '#63B3ED', plan: 'C', monthlyDeals: [0, 0, 0, 0, 0], dealsList: [] },
];

const MONTHLY = [
  { m: 'Jan', deals: 221, gross: 524590, netNew: 305149, goal: 96.4, commission: 13253, earnings: 47435 },
  { m: 'Feb', deals: 260, gross: 497579, netNew: 246289, goal: 77.8, commission:  9071, earnings: 43253 },
  { m: 'Mar', deals: 202, gross: 479383, netNew: 198461, goal: 62.7, commission: 11896, earnings: 56374 },
  { m: 'Apr', deals: 134, gross: 361935, netNew: 218390, goal: 69.0, commission:  9263, earnings: 43445 },
  { m: 'May', deals: 88,  gross: 266715, netNew: 160695, goal: 50.8, commission:  7626, earnings: 38808 },
];

const MAY_DATA = MONTHLY[4];
const YTD = {
  deals: 905, gross: 2130203, netNew: 1128984, commission: 51109, earnings: 502770,
};

// --------- RUN RATE PROJECTION ---------
// Calculate monthly run rate and project next month
const calcRunRate = () => {
  const commissions = MONTHLY.map(m => m.commission);
  const netNewArr = MONTHLY.map(m => m.netNew);

  // Average monthly commission (run rate)
  const avgCommission = commissions.reduce((a, b) => a + b, 0) / commissions.length;

  // Trend: compare recent months to earlier months
  const recentAvg = (commissions[2] + commissions[3]) / 2; // Mar + Apr
  const earlierAvg = (commissions[0] + commissions[1]) / 2; // Jan + Feb
  const trendPct = ((recentAvg - earlierAvg) / earlierAvg) * 100;

  // Weighted projection: 60% recent average + 40% overall average
  const projectedCommission = Math.round(recentAvg * 0.6 + avgCommission * 0.4);

  // Net New ARR projection using same method
  const avgNetNew = netNewArr.reduce((a, b) => a + b, 0) / netNewArr.length;
  const recentNetNew = (netNewArr[2] + netNewArr[3]) / 2;
  const projectedNetNew = Math.round(recentNetNew * 0.6 + avgNetNew * 0.4);

  // Confidence range: +/-15%
  const projLow = Math.round(projectedCommission * 0.85);
  const projHigh = Math.round(projectedCommission * 1.15);

  return {
    avgCommission,
    projectedCommission,
    projLow,
    projHigh,
    projectedNetNew,
    trendPct,
    trendDirection: trendPct >= 0 ? 'up' : 'down',
  };
};

const PROJECTION = calcRunRate();

// May pacing config (for mid-month projections)
const MAY = {
  dayOfMonth: 26,
  daysInMonth: 31,
  // If we had current month data, we'd calculate:
  // projectedCommission = (currentCommission / dayOfMonth) * daysInMonth
  projectedCommission: PROJECTION.projectedCommission,
  projectedNetNew: PROJECTION.projectedNetNew,
  projLow: PROJECTION.projLow,
  projHigh: PROJECTION.projHigh,
  trendPct: PROJECTION.trendPct,
};

// --------- HELPERS ---------
const fmtMoney = (v, opts = {}) => {
  const { full = false } = opts;
  if (full) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (Math.abs(v) >= 1000) return '$' + (v / 1000).toFixed(v >= 100000 ? 0 : 1) + 'K';
  return '$' + v.toFixed(0);
};
const initials = (name) => name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();

// Calculate commission for a rep based on plan rules
const calcCommission = (rep, netNew) => {
  const plan = PLANS[rep.plan];
  if (!plan || rep.plan === 'Inactive') return 0;

  // Plan B: Dead zone logic - no commission until dead zone cleared
  if (rep.plan === 'B') {
    const deadZone = plan.deadZone || 0;
    if (netNew <= deadZone) return 0;
    return Math.round((netNew - deadZone) * 0.06);
  }

  // Plan C & D: 1.7% rate
  if (rep.plan === 'C' || rep.plan === 'D') {
    return Math.round(netNew * 0.017);
  }

  // Plan A: 8% rate
  return Math.round(netNew * 0.08);
};

// --------- ICONS ---------
const Icon = {
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  Reps: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15 14.5c2.5 0 6 1.7 6 5"/></svg>,
  Commission: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2v20"/><path d="M17 6H9.5C8 6 7 7 7 8.5S8 11 9.5 11h5c1.5 0 2.5 1 2.5 2.5S16 16 14.5 16H6"/></svg>,
  Reports: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/></svg>,
  Notify: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10.5 21a1.5 1.5 0 0 0 3 0"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Help: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m21 21-5-5"/></svg>,
  Cal: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  ChevD: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>,
  More: () => <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18"/></svg>,
  Coin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8"/><path d="M12 6v12M9 9h4.5a2.5 2.5 0 0 1 0 5H9M9 14h5"/></svg>,
  Target: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>,
  Spark: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 17 9 11l4 4 8-9"/><path d="M15 6h6v6"/></svg>,
  Info: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  Compare: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/><path d="M10 12h4"/></svg>,
  ArrowLeft: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  // Report type icons
  ChartBar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="10" width="4" height="10" rx="1"/><rect x="10" y="6" width="4" height="14" rx="1"/><rect x="17" y="2" width="4" height="18" rx="1"/></svg>,
  Bridge: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 18h16"/><path d="M4 18c0-4 2-6 4-6s4 2 4 6"/><path d="M12 18c0-4 2-6 4-6s4 2 4 6"/><path d="M2 18h2M20 18h2"/></svg>,
  Refresh: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Bullseye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10"/></svg>,
  Package: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M16.5 9.4l-9-5.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>,
  Wallet: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M22 10H18a2 2 0 0 0 0 4h4"/><path d="M18 12h.01"/><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>,
};

// --------- PERIOD SELECTOR ---------
function PeriodSelector({ period, setPeriod, periodOpen, setPeriodOpen }) {
  return (
    <div className="popover-wrap">
      <div className="pill" onClick={(e) => { e.stopPropagation(); setPeriodOpen(o => !o); }}>
        <span className="label">Period:</span>
        <span className="value">{period}</span>
        <Icon.ChevD/>
      </div>
      {periodOpen && (
        <div className="popover">
          {PERIOD_OPTIONS.map(p => (
            <div key={p} className={'popover-item' + (period === p ? ' active' : '')} onClick={() => { setPeriod(p); setPeriodOpen(false); }}>
              <span>{p}</span>
              <span className="check">[ok]</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --------- SPARKLINE ---------
function Sparkline({ data, width = 110, height = 32, color = '#34D399', filled = true, glow = true }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 6) - 3]);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaPath = path + ` L ${width} ${height} L 0 ${height} Z`;
  const gid = useMemo(() => 'sg' + Math.random().toString(36).slice(2, 8), []);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled && <path d={areaPath} fill={`url(#${gid})`} />}
      <path d={path} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" style={glow ? { filter: `drop-shadow(0 0 4px ${color}80)` } : {}} />
      {points.length > 0 && (() => {
        const last = points[points.length - 1];
        return <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} style={glow ? { filter: `drop-shadow(0 0 4px ${color})` } : {}} />;
      })()}
    </svg>
  );
}

// --------- ORBITAL / FORECAST VIZ ---------
function ForecastViz() {
  // Use actual commission data from MONTHLY and run rate projection
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const actual = MONTHLY.map(m => m.commission); // [13253, 9071, 11896, 9263]
  const projLow = MAY.projLow;
  const projMid = MAY.projectedCommission;
  const projHigh = MAY.projHigh;
  const W = 320, H = 220;
  const padX = 28, padTop = 30, padBot = 30;
  const allVals = [...actual, projLow, projHigh];
  const maxV = Math.max(...allVals) * 1.15;
  const minV = Math.min(...allVals) * 0.75;
  const xFor = (i) => padX + (i * (W - padX * 2)) / (months.length - 1);
  const yFor = (v) => padTop + (H - padTop - padBot) * (1 - (v - minV) / (maxV - minV));
  const actualPath = actual.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
  const projPath = `M ${xFor(3)} ${yFor(actual[3])} L ${xFor(4)} ${yFor(projMid)}`;
  const conePath = `M ${xFor(3)} ${yFor(actual[3])} L ${xFor(4)} ${yFor(projHigh)} L ${xFor(4)} ${yFor(projLow)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#34D399" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cone-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {/* Concentric orbital rings behind the May forecast dot */}
      <g transform={`translate(${xFor(4)} ${yFor(projMid)})`} opacity="0.7">
        <circle r="58" fill="url(#orb-glow)" />
        <ellipse rx="50" ry="14" fill="none" stroke="rgba(52, 211, 153,0.18)" strokeWidth="1"/>
        <ellipse rx="42" ry="11" fill="none" stroke="rgba(52, 211, 153,0.22)" strokeWidth="1" transform="rotate(-25)"/>
        <ellipse rx="34" ry="9" fill="none" stroke="rgba(52, 211, 153,0.26)" strokeWidth="1" transform="rotate(20)"/>
        <ellipse rx="26" ry="7" fill="none" stroke="rgba(52, 211, 153,0.30)" strokeWidth="1" transform="rotate(-45)"/>
        {/* Scattered particles */}
        {[...Array(28)].map((_, i) => {
          const ang = (i * 137) % 360;
          const r = 14 + (i * 7) % 46;
          const x = Math.cos(ang * Math.PI / 180) * r;
          const y = Math.sin(ang * Math.PI / 180) * r * 0.35;
          return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 1.2 : 0.7} fill="#6EE7B7" opacity={0.4 + (i % 4) * 0.15} />;
        })}
      </g>

      {/* Baseline grid */}
      <line x1={padX} x2={W - padX} y1={H - padBot + 0.5} y2={H - padBot + 0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>

      {/* Confidence cone */}
      <path d={conePath} fill="url(#cone-grad)" />

      {/* Actual line */}
      <path d={actualPath} stroke="#34D399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px #34D39980)' }}/>
      {/* Projected dashed */}
      <path d={projPath} stroke="#6EE7B7" strokeWidth="2" fill="none" strokeDasharray="4 4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px #6EE7B780)' }}/>

      {/* Dots with value labels */}
      {actual.map((v, i) => (
        <g key={i}>
          <circle cx={xFor(i)} cy={yFor(v)} r="4" fill="#0E1220" stroke="#34D399" strokeWidth="2" />
          <text
            x={xFor(i)}
            y={yFor(v) - 10}
            fontSize="9"
            fontWeight="600"
            fill="#34D399"
            textAnchor="middle"
            fontFamily="JetBrains Mono"
          >
            ${(v / 1000).toFixed(1)}K
          </text>
        </g>
      ))}
      {/* May ghost dot */}
      <circle cx={xFor(4)} cy={yFor(projMid)} r="6" fill="#6EE7B7" style={{ filter: 'drop-shadow(0 0 10px #6EE7B7)' }}/>
      <circle cx={xFor(4)} cy={yFor(projMid)} r="11" fill="none" stroke="#6EE7B7" strokeWidth="1" opacity="0.4"/>

      {/* X-axis labels */}
      {months.map((m, i) => (
        <text key={m} x={xFor(i)} y={H - 10} fontSize="10.5" fill={i === 4 ? '#6EE7B7' : '#6B6F8C'} textAnchor="middle" fontWeight="500" fontFamily="Plus Jakarta Sans">{m}</text>
      ))}

      {/* May value label */}
      <g transform={`translate(${xFor(4)} ${yFor(projMid) - 16})`}>
        <rect x="-30" y="-13" width="60" height="18" rx="5" fill="#1E2238" stroke="rgba(52, 211, 153,0.4)"/>
        <text x="0" y="-1" fontSize="10.5" fontWeight="600" fill="#6EE7B7" textAnchor="middle" fontFamily="JetBrains Mono">${(projMid / 1000).toFixed(1)}K</text>
      </g>
    </svg>
  );
}

// --------- MINI BAR CHART ---------
// --------- YTD NET NEW ARR CHART ---------
function YTDNetNewChart() {
  const data = MONTHLY.map(m => ({ label: m.m, value: m.netNew, goal: m.goal }));
  const max = Math.max(...data.map(d => d.value));
  const W = 600, H = 200;
  const padLeft = 60, padRight = 20, padTop = 20, padBot = 40;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBot;
  const barW = chartW / data.length - 16;

  // Calculate cumulative YTD
  let cumulative = 0;
  const cumulativeData = data.map(d => {
    cumulative += d.value;
    return cumulative;
  });
  const maxCumulative = Math.max(...cumulativeData);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ytd-bar-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#10B981" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="ytd-line-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F3C969"/>
          <stop offset="100%" stopColor="#FBBF24"/>
        </linearGradient>
      </defs>

      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = padTop + chartH * (1 - pct);
        const val = max * pct;
        return (
          <g key={i}>
            <line x1={padLeft} x2={W - padRight} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4"/>
            <text x={padLeft - 8} y={y + 4} fontSize="10" fill="#6B8C7C" textAnchor="end" fontFamily="JetBrains Mono">
              ${(val / 1000).toFixed(0)}K
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = padLeft + i * (chartW / data.length) + 8;
        const y = padTop + chartH - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={6}
              fill="url(#ytd-bar-grad)"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))' }}
            />
            <text x={x + barW/2} y={y - 8} fontSize="11" fill="#F1F8F4" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
              ${(d.value / 1000).toFixed(0)}K
            </text>
            <text x={x + barW/2} y={H - 12} fontSize="12" fill="#A5C7B5" textAnchor="middle" fontWeight="500">
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Cumulative line */}
      <polyline
        points={cumulativeData.map((val, i) => {
          const x = padLeft + i * (chartW / data.length) + 8 + barW/2;
          const y = padTop + chartH - (val / maxCumulative) * chartH;
          return `${x},${y}`;
        }).join(' ')}
        fill="none"
        stroke="url(#ytd-line-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 6px rgba(243, 201, 105, 0.5))' }}
      />

      {/* Cumulative dots */}
      {cumulativeData.map((val, i) => {
        const x = padLeft + i * (chartW / data.length) + 8 + barW/2;
        const y = padTop + chartH - (val / maxCumulative) * chartH;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill="#0E1A1D" stroke="#F3C969" strokeWidth="2"/>
            <text x={x} y={y - 12} fontSize="9" fill="#F3C969" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
              ${(val / 1000).toFixed(0)}K
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniBars({ data }) {
  const max = Math.max(...data.map(d => d.v));
  const W = 280, H = 70;
  const barW = (W - 12 * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="mb-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.85"/>
        </linearGradient>
        <linearGradient id="mb-grad-projection" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.03"/>
          <stop offset="100%" stopColor="#34D399" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const h = Math.max(8, (d.v / max) * (H - 22));
        const x = i * (barW + 12);
        const y = H - h - 16;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={Math.min(barW / 4, 7)} fill={d.projected ? 'url(#mb-grad-projection)' : 'url(#mb-grad)'} stroke={d.projected ? 'rgba(52, 211, 153,0.3)' : 'none'} strokeDasharray={d.projected ? '3 3' : ''}/>
            <text x={x + barW / 2} y={H - 3} fontSize="9.5" fill={d.projected ? '#6EE7B7' : '#6B6F8C'} textAnchor="middle" fontWeight="500" fontFamily="Plus Jakarta Sans">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// --------- BAR TILE ---------
function BarTile({ value, label, pct, color = 'normal' }) {
  const heightPct = Math.max(8, Math.min(100, pct));
  return (
    <div className="bar-tile">
      <div className="bar-tile-head">
        <div className="value tab">{value}</div>
        <div className="label">{label}</div>
      </div>
      <div className="bar-visual">
        <div className={'bar-capsule' + (color === 'inactive' ? ' inactive' : '')} style={{ height: heightPct + '%' }}/>
        <div className="bar-pct tab">{Math.round(pct)}%</div>
      </div>
    </div>
  );
}

// --------- ATTAINMENT BARS (SEGMENT VIZ) ---------
function AttainBars({ pct }) {
  // 5 segments, fill based on % to goal (cap 110%)
  const segments = 5;
  const filled = Math.min(segments, Math.round((pct / 100) * segments));
  let tone = 'on-track';
  if (pct === 0) tone = 'inactive';
  else if (pct >= 100) tone = 'over';
  else if (pct >= 80) tone = 'on';
  else if (pct >= 50) tone = 'on';
  else tone = 'danger';
  return (
    <div className="attain-bars">
      {[...Array(segments)].map((_, i) => (
        <span key={i} className={'attain-bar' + (i < filled ? ' ' + tone : '')}/>
      ))}
    </div>
  );
}

// --------- DRAWER ---------
function RepDrawer({ rep, onClose }) {
  if (!rep) return null;
  const monthlyEarn = [
    { label: 'Jan', v: rep.earnings * 1.05, projected: false },
    { label: 'Feb', v: rep.earnings * 0.92, projected: false },
    { label: 'Mar', v: rep.earnings * 1.18, projected: false },
    { label: 'Apr', v: rep.earnings, projected: false },
    { label: 'May ^', v: rep.earnings * 1.08, projected: true },
  ];
  // commission breakdown from actual data
  const basePay = rep.basePay || 0;
  const commissionEarned = rep.commission || 0;
  const apr = rep.earnings;
  return (
    <>
      <div className={'drawer-scrim' + (rep ? ' open' : '')} onClick={onClose}/>
      <aside className={'drawer' + (rep ? ' open' : '')}>
        <div className="drawer-head">
          <div className="avatar" style={{ background: `linear-gradient(135deg, ${rep.color}, ${rep.color}88)`, width: 44, height: 44, fontSize: 14 }}>{initials(rep.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{rep.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              <span className="role-chip" style={{ marginRight: 8 }}>{rep.role}</span>
              {getStatusInfo(getRepStatus(rep.goal)).label}
            </div>
          </div>
          <div className="drawer-close" onClick={onClose}><Icon.X/></div>
        </div>

        <div className="drawer-section">
          <h4>{CURRENT_MONTH.name} Pacing * Day {CURRENT_MONTH.dayOfMonth} of {CURRENT_MONTH.daysInMonth}</h4>
          <div className="pacing-card">
            <div className="pacing-row">
              <div className="pacing-metric">
                <div className="pacing-label">Expected Pacing</div>
                <div className="pacing-value tab">{EXPECTED_PACING.toFixed(0)}%</div>
              </div>
              <div className="pacing-metric">
                <div className="pacing-label">Actual Attainment</div>
                <div className="pacing-value tab" style={{ color: rep.goal >= EXPECTED_PACING ? 'var(--green)' : 'var(--rose)' }}>{rep.goal.toFixed(1)}%</div>
              </div>
              <div className="pacing-metric">
                <div className="pacing-label">Variance</div>
                <div className="pacing-value tab" style={{ color: rep.goal >= EXPECTED_PACING ? 'var(--green)' : 'var(--rose)' }}>
                  {rep.goal >= EXPECTED_PACING ? '+' : ''}{(rep.goal - EXPECTED_PACING).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="pacing-bar-container">
              <div className="pacing-bar-track">
                <div className="pacing-bar-expected" style={{ width: Math.min(100, EXPECTED_PACING) + '%' }}/>
                <div className="pacing-bar-actual" style={{ width: Math.min(100, rep.goal) + '%', background: rep.goal >= EXPECTED_PACING ? 'var(--green)' : 'var(--rose)' }}/>
              </div>
              <div className="pacing-bar-labels">
                <span>0%</span>
                <span>Expected: {EXPECTED_PACING.toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="pacing-status" style={{ background: getStatusInfo(getRepStatus(rep.goal)).color + '20', borderColor: getStatusInfo(getRepStatus(rep.goal)).color }}>
              <span className={'dot ' + getStatusInfo(getRepStatus(rep.goal)).dotClass} style={{ width: 10, height: 10 }}/>
              <span style={{ color: getStatusInfo(getRepStatus(rep.goal)).color, fontWeight: 600 }}>{getStatusInfo(getRepStatus(rep.goal)).label}</span>
              <span style={{ color: 'var(--text-3)', marginLeft: 8 }}>
                {getRepStatus(rep.goal) === 'on-track' && '- Meeting or exceeding expected pace'}
                {getRepStatus(rep.goal) === 'at-risk' && '- Within 10% of expected pace'}
                {getRepStatus(rep.goal) === 'behind' && '- More than 10% below expected pace'}
                {getRepStatus(rep.goal) === 'inactive' && '- No quota assigned this month'}
              </span>
            </div>
          </div>
        </div>

        <div className="drawer-section">
          <h4>April Scorecard</h4>
          <div className="scorecard-grid">
            <div className="scorecard-cell">
              <div className="lbl">Deals closed</div>
              <div className="val tab">{rep.deals}</div>
              <div className="sub">{(rep.netNew / Math.max(1, rep.deals)).toFixed(0).toLocaleString()} avg ARR</div>
            </div>
            <div className="scorecard-cell">
              <div className="lbl">Net new ARR</div>
              <div className="val tab">{fmtMoney(rep.netNew, { full: true })}</div>
              <div className="sub">{rep.goal.toFixed(1)}% to goal</div>
            </div>
            <div className="scorecard-cell">
              <div className="lbl">Gross revenue</div>
              <div className="val tab">{fmtMoney(rep.gross, { full: true })}</div>
              <div className="sub">includes renewals</div>
            </div>
            <div className="scorecard-cell">
              <div className="lbl">April earnings</div>
              <div className="val tab" style={{ color: 'var(--accent-3)' }}>{fmtMoney(rep.earnings, { full: true })}</div>
              <div className="sub">{rep.earnings > 0 ? 'commission + bonus' : 'no payout'}</div>
            </div>
          </div>
        </div>

        <div className="drawer-section">
          <h4>Earnings Trend</h4>
          <div className="trend-block">
            <MiniBars data={monthlyEarn}/>
          </div>
        </div>

        <div className="drawer-section">
          <h4>April Payout Breakdown</h4>
          <div>
            <div className="pay-strip">
              <span className="key">Base Pay</span>
              <span className="val tab">{fmtMoney(basePay, { full: true })}</span>
            </div>
            <div className="pay-strip">
              <span className="key">Commission</span>
              <span className="val tab">{fmtMoney(commissionEarned, { full: true })}</span>
            </div>
            <div className="pay-strip total">
              <span className="key">Total Earnings</span>
              <span className="val tab">{fmtMoney(apr, { full: true })}</span>
            </div>
            <div className="pay-strip">
              <span className="key">Spiff</span>
              <span className="val tab" style={{ color: 'var(--text-3)' }}>$0</span>
            </div>
          </div>
        </div>

        <div className="drawer-section">
          <h4>April Deals ({rep.monthlyDeals ? rep.monthlyDeals[3] : rep.deals})</h4>
          <div className="deals-list">
            {rep.dealsList && rep.dealsList.length > 0 ? (
              <table className="deals-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>ARR</th>
                    <th style={{ textAlign: 'right' }}>Net New</th>
                  </tr>
                </thead>
                <tbody>
                  {rep.dealsList.map((deal, idx) => (
                    <tr key={idx}>
                      <td>{deal.customer}</td>
                      <td><span className="product-chip">{deal.product}</span></td>
                      <td style={{ textAlign: 'right' }} className="tab">{fmtMoney(deal.arr, { full: true })}</td>
                      <td style={{ textAlign: 'right', color: deal.netNew > 0 ? 'var(--accent-3)' : 'var(--text-3)' }} className="tab">{fmtMoney(deal.netNew, { full: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: 'var(--text-3)', fontStyle: 'italic', padding: '12px 0' }}>No deals this month</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// --------- SIDEBAR ---------
function Sidebar({ activeTab, setActiveTab }) {
  const items = [
    ['Dashboard', Icon.Dashboard],
    ['Reps', Icon.Reps],
    ['Commissions', Icon.Commission],
    ['Reports', Icon.Reports],
    ['Notifications', Icon.Notify],
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <span/><span/><span/><span/>
        </div>
        <div className="brand-name">SALES DASH</div>
      </div>

      <nav className="nav">
        {items.map(([label, IconComp]) => (
          <div key={label} className={'nav-item' + (activeTab === label ? ' active' : '')} onClick={() => setActiveTab(label)}>
            <IconComp/>
            <span>{label}</span>
          </div>
        ))}

        <div className="nav-section">Other</div>
        <div className="nav-item"><Icon.Settings/><span>Settings</span></div>
        <div className="nav-item"><Icon.Help/><span>Help</span></div>
      </nav>

      <div className="nav-spacer"/>
      <div className="profile">
        <div className="profile-avatar">ED</div>
        <div className="profile-meta">
          <div className="profile-name">Elijah Diaz</div>
          <div className="profile-email">elijah.diaz@amazinglife.com</div>
        </div>
      </div>
    </aside>
  );
}

// --------- COMPARE VIEW ---------
function CompareView({ reps, onExit }) {
  const rep1 = reps[0];
  const rep2 = reps[1];
  const plan1 = PLANS[rep1.plan] || PLANS.Inactive;
  const plan2 = PLANS[rep2.plan] || PLANS.Inactive;
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];

  const getYTD = (rep) => {
    const ytdNetNew = rep.spark.reduce((a, b) => a + b, 0);
    const ytdDeals = rep.monthlyDeals ? rep.monthlyDeals.reduce((a, b) => a + b, 0) : rep.deals;
    const ytdAvg = ytdNetNew / 4;
    return { ytdNetNew, ytdDeals, ytdAvg };
  };

  const ytd1 = getYTD(rep1);
  const ytd2 = getYTD(rep2);

  const maxSpark = Math.max(...rep1.spark, ...rep2.spark);

  const ComparePanel = ({ rep, plan, ytd, isLeft }) => {
    const otherYtd = isLeft ? ytd2 : ytd1;
    const otherRep = isLeft ? rep2 : rep1;
    return (
      <div className={'compare-panel ' + (isLeft ? 'left' : 'right')}>
        <div className="compare-header">
          <div className="avatar" style={{ background: `linear-gradient(135deg, ${rep.color}, ${rep.color}88)`, width: 56, height: 56, fontSize: 18 }}>
            {initials(rep.name)}
          </div>
          <div>
            <h2>{rep.name}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span className="role-chip">{rep.role}</span>
              <span className="plan-chip">{plan.name.split('-')[0].trim()}</span>
            </div>
          </div>
        </div>

        <div className="compare-metrics">
          <div className={'compare-metric' + (ytd.ytdNetNew > otherYtd.ytdNetNew ? ' winning' : '')}>
            <div className="metric-value tab">{fmtMoney(ytd.ytdNetNew, { full: true })}</div>
            <div className="metric-label">YTD Net New ARR</div>
          </div>
          <div className={'compare-metric' + (ytd.ytdDeals > otherYtd.ytdDeals ? ' winning' : '')}>
            <div className="metric-value tab">{ytd.ytdDeals}</div>
            <div className="metric-label">YTD Deals</div>
          </div>
          <div className={'compare-metric' + (ytd.ytdAvg > otherYtd.ytdAvg ? ' winning' : '')}>
            <div className="metric-value tab">{fmtMoney(ytd.ytdAvg)}</div>
            <div className="metric-label">Monthly Avg</div>
          </div>
          <div className={'compare-metric' + (rep.netNew > otherRep.netNew ? ' winning' : '')}>
            <div className="metric-value tab">{fmtMoney(rep.netNew)}</div>
            <div className="metric-label">April Net New</div>
          </div>
        </div>

        <div className="compare-section">
          <h3>Compensation</h3>
          <div className="compare-plan-info">
            <div className="plan-row"><span>Plan</span><span>{plan.name}</span></div>
            <div className="plan-row"><span>Quota</span><span className="tab">{fmtMoney(plan.quota)} / {plan.type === 'Monthly' ? 'mo' : 'qtr'}</span></div>
            <div className="plan-row"><span>Base Pay</span><span className="tab">{fmtMoney(rep.basePay)} / mo</span></div>
            <div className="plan-row"><span>April Comm.</span><span className="tab" style={{ color: 'var(--accent-3)' }}>{fmtMoney(rep.commission)}</span></div>
          </div>
        </div>

        <div className="compare-section">
          <h3>Monthly Performance</h3>
          <div className="compare-monthly">
            {months.map((m, i) => (
              <div key={m} className={'compare-month-row' + (rep.spark[i] > otherRep.spark[i] ? ' winning' : '')}>
                <span className="month-label">{m}</span>
                <div className="month-bar-wrap">
                  <div className="month-bar" style={{ width: (rep.spark[i] / maxSpark * 100) + '%', background: rep.color }} />
                </div>
                <span className="month-value tab">{fmtMoney(rep.spark[i])}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="compare-section">
          <h3>YTD Trend</h3>
          <div className="trend-detail">
            <Sparkline data={rep.spark} width={280} height={70} color={rep.color} />
            <div className="trend-labels">
              {months.map((m, i) => (
                <div key={m} className="trend-point">
                  <span className="trend-month">{m}</span>
                  <span className="trend-val tab">{fmtMoney(rep.spark[i])}</span>
                </div>
              ))}
            </div>
            <div className="trend-summary">
              <div className="trend-stat">
                <span className="trend-stat-label">Peak</span>
                <span className="trend-stat-value tab">{fmtMoney(Math.max(...rep.spark))}</span>
              </div>
              <div className="trend-stat">
                <span className="trend-stat-label">Avg</span>
                <span className="trend-stat-value tab">{fmtMoney(rep.spark.reduce((a,b) => a+b, 0) / 4)}</span>
              </div>
              <div className="trend-stat">
                <span className="trend-stat-label">Growth</span>
                <span className="trend-stat-value tab" style={{ color: rep.spark[3] > rep.spark[0] ? 'var(--accent-3)' : 'var(--rose)' }}>
                  {rep.spark[0] > 0 ? ((rep.spark[3] - rep.spark[0]) / rep.spark[0] * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="main">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="back-btn" onClick={onExit}>
            <Icon.ArrowLeft />
          </button>
          <div>
            <h1 className="page-title">Rep Comparison</h1>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
              {rep1.name} vs {rep2.name}
            </div>
          </div>
        </div>
      </div>

      <div className="compare-layout">
        <ComparePanel rep={rep1} plan={plan1} ytd={ytd1} isLeft={true} />
        <div className="compare-divider">
          <div className="vs-badge">VS</div>
        </div>
        <ComparePanel rep={rep2} plan={plan2} ytd={ytd2} isLeft={false} />
      </div>
    </main>
  );
}

// --------- REPS VIEW ---------
function RepsView({ onSelectRep, period, setPeriod }) {
  const [selectedRep, setSelectedRep] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareReps, setCompareReps] = useState([]);
  const [periodOpen, setPeriodOpen] = useState(false);

  const monthIdx = MONTH_INDEX[period];

  const filteredReps = REPS.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRep = (rep) => {
    if (compareMode) {
      if (compareReps.find(r => r.name === rep.name)) {
        setCompareReps(compareReps.filter(r => r.name !== rep.name));
      } else if (compareReps.length < 2) {
        setCompareReps([...compareReps, rep]);
      }
    } else {
      setSelectedRep(rep);
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setCompareReps([]);
    if (!compareMode) setSelectedRep(null);
  };

  // Calculate YTD totals for a rep
  const getYTD = (rep) => {
    const ytdNetNew = rep.spark.reduce((a, b) => a + b, 0);
    const ytdDeals = rep.monthlyDeals ? rep.monthlyDeals.reduce((a, b) => a + b, 0) : rep.deals;
    return { ytdNetNew, ytdDeals };
  };

  // Show compare view when 2 reps selected
  if (compareReps.length === 2) {
    return <CompareView reps={compareReps} onExit={() => { setCompareMode(false); setCompareReps([]); }} />;
  }

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <h1 className="page-title">Sales Reps</h1>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
            {compareMode ? `Select ${2 - compareReps.length} rep${2 - compareReps.length !== 1 ? 's' : ''} to compare` : `${REPS.length} reps * ${REPS.filter(r => r.plan !== 'Inactive').length} active`}
          </div>
        </div>
        <div className="topbar-actions">
          <PeriodSelector period={period} setPeriod={setPeriod} periodOpen={periodOpen} setPeriodOpen={setPeriodOpen} />
          <button className={'compare-btn' + (compareMode ? ' active' : '')} onClick={toggleCompareMode}>
            <Icon.Compare />
            {compareMode ? 'Cancel' : 'Compare'}
          </button>
          <div className="search">
            <Icon.Search/>
            <input
              placeholder="Search reps..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="reps-layout">
        {/* Rep List */}
        <div className="reps-list">
          {filteredReps.map(rep => {
            const plan = PLANS[rep.plan] || PLANS.Inactive;
            const ytd = getYTD(rep);
            const isSelected = selectedRep?.name === rep.name;
            const isComparing = compareReps.find(r => r.name === rep.name);

            return (
              <div
                key={rep.name}
                className={'rep-card' + (isSelected ? ' selected' : '') + (isComparing ? ' comparing' : '') + (compareMode ? ' compare-mode' : '') + (rep.plan === 'Inactive' ? ' inactive' : '')}
                onClick={() => handleSelectRep(rep)}
              >
                <div className="rep-card-header">
                  <div className="avatar" style={{ background: `linear-gradient(135deg, ${rep.color}, ${rep.color}88)`, width: 48, height: 48 }}>
                    {initials(rep.name)}
                  </div>
                  <div className="rep-card-info">
                    <div className="rep-card-name">{rep.name}</div>
                    <div className="rep-card-role">
                      <span className="role-chip">{rep.role}</span>
                      <span className="plan-chip">{plan.name.split('-')[0].trim()}</span>
                    </div>
                  </div>
                </div>
                <div className="rep-card-stats">
                  <div className="rep-card-stat">
                    <span className="stat-value tab">{fmtMoney(monthIdx !== undefined ? rep.spark[monthIdx] : rep.netNew)}</span>
                    <span className="stat-label">{period.split(' ')[0]} Net New</span>
                  </div>
                  <div className="rep-card-stat">
                    <span className="stat-value tab">{monthIdx !== undefined && rep.monthlyDeals ? rep.monthlyDeals[monthIdx] : ytd.ytdDeals}</span>
                    <span className="stat-label">{monthIdx !== undefined ? period.split(' ')[0] + ' Deals' : 'YTD Deals'}</span>
                  </div>
                  <div className="rep-card-stat">
                    <span className="stat-value tab" style={{ color: rep.commission > 0 ? 'var(--accent-3)' : 'var(--text-3)' }}>
                      {fmtMoney(monthIdx !== undefined ? calcCommission(rep, rep.spark[monthIdx]) : rep.commission)}
                    </span>
                    <span className="stat-label">{period.split(' ')[0]} Commission</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rep Detail Panel */}
        <div className="rep-detail">
          {selectedRep ? (
            <RepDetailPanel rep={selectedRep} />
          ) : (
            <div className="rep-detail-empty">
              <Icon.Reps />
              <p>Select a rep to view details</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// --------- REP DETAIL PANEL ---------
function RepDetailPanel({ rep }) {
  const plan = PLANS[rep.plan] || PLANS.Inactive;
  const ytdNetNew = rep.spark.reduce((a, b) => a + b, 0);
  const ytdDeals = rep.monthlyDeals ? rep.monthlyDeals.reduce((a, b) => a + b, 0) : rep.deals;
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];

  return (
    <div className="rep-detail-content">
      {/* Header */}
      <div className="rep-detail-header">
        <div className="avatar" style={{ background: `linear-gradient(135deg, ${rep.color}, ${rep.color}88)`, width: 56, height: 56, fontSize: 18 }}>
          {initials(rep.name)}
        </div>
        <div>
          <h2>{rep.name}</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span className="role-chip">{rep.role}</span>
            <span className="plan-chip">{plan.name}</span>
          </div>
        </div>
      </div>

      {/* Comp Plan Details */}
      <div className="detail-section">
        <h3>Compensation Plan</h3>
        <div className="plan-details-card">
          <div className="plan-info-row">
            <span className="plan-info-label">Plan Type</span>
            <span className="plan-info-value">{plan.type}</span>
          </div>
          <div className="plan-info-row">
            <span className="plan-info-label">Quota</span>
            <span className="plan-info-value tab">{fmtMoney(plan.quota, { full: true })} / {plan.type === 'Monthly' ? 'month' : 'quarter'}</span>
          </div>
          <div className="plan-info-row">
            <span className="plan-info-label">Annual Quota</span>
            <span className="plan-info-value tab">{fmtMoney(plan.annualQuota, { full: true })}</span>
          </div>
          <div className="plan-info-row">
            <span className="plan-info-label">Base Pay</span>
            <span className="plan-info-value tab">{fmtMoney(rep.basePay, { full: true })} / month</span>
          </div>
          <div className="plan-tiers">
            <span className="plan-info-label">Commission Tiers</span>
            <div className="tier-list">
              {plan.tiers.map((tier, i) => (
                <div key={i} className="tier-row">
                  <span className="tier-label">{tier.label}</span>
                  <span className="tier-rate tab">{(tier.rate * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="plan-description">{plan.description}</p>
        </div>
      </div>

      {/* YTD Performance */}
      <div className="detail-section">
        <h3>YTD Performance</h3>
        <div className="ytd-grid">
          <div className="ytd-card">
            <div className="ytd-value tab">{fmtMoney(ytdNetNew, { full: true })}</div>
            <div className="ytd-label">Total Net New ARR</div>
          </div>
          <div className="ytd-card">
            <div className="ytd-value tab">{ytdDeals}</div>
            <div className="ytd-label">Total Deals</div>
          </div>
          <div className="ytd-card">
            <div className="ytd-value tab">{fmtMoney(ytdNetNew / 4, { full: true })}</div>
            <div className="ytd-label">Monthly Avg</div>
          </div>
          <div className="ytd-card accent">
            <div className="ytd-value tab">{fmtMoney(rep.earnings * 4, { full: true })}</div>
            <div className="ytd-label">Est. YTD Earnings</div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="monthly-breakdown">
          <div className="monthly-header">
            <span>Month</span>
            <span>Net New ARR</span>
            <span>Deals</span>
          </div>
          {months.map((m, i) => (
            <div key={m} className="monthly-row">
              <span className="month-label">{m}</span>
              <span className="month-value tab">{fmtMoney(rep.spark[i], { full: true })}</span>
              <span className="month-deals tab">{rep.monthlyDeals ? rep.monthlyDeals[i] : '-'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* April Deals */}
      <div className="detail-section">
        <h3>April Deals ({rep.monthlyDeals ? rep.monthlyDeals[3] : rep.deals})</h3>
        <div className="deals-list">
          {rep.dealsList && rep.dealsList.length > 0 ? (
            <table className="deals-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>ARR</th>
                  <th style={{ textAlign: 'right' }}>Net New</th>
                </tr>
              </thead>
              <tbody>
                {rep.dealsList.map((deal, idx) => (
                  <tr key={idx}>
                    <td>{deal.customer}</td>
                    <td><span className="product-chip">{deal.product}</span></td>
                    <td style={{ textAlign: 'right' }} className="tab">{fmtMoney(deal.arr, { full: true })}</td>
                    <td style={{ textAlign: 'right', color: deal.netNew > 0 ? 'var(--accent-3)' : 'var(--text-3)' }} className="tab">{fmtMoney(deal.netNew, { full: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: 'var(--text-3)', fontStyle: 'italic', padding: '12px 0' }}>No deals this month</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --------- COMMISSIONS VIEW (FOR LORI) ---------
function CommissionsView({ period, setPeriod }) {
  const [payoutStatus, setPayoutStatus] = useState({});
  const [periodOpen, setPeriodOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const monthIdx = MONTH_INDEX[period];
  const monthName = period.split(' ')[0]; // "Apr" from "Apr 2026"

  // Calculate totals based on selected period
  const activeReps = REPS.filter(r => r.plan !== 'Inactive');

  // Get commission for selected month using shared calculation
  const getRepCommission = (rep) => {
    if (monthIdx !== undefined && rep.spark) {
      return calcCommission(rep, rep.spark[monthIdx] || 0);
    }
    return rep.commission;
  };

  const getRepEarnings = (rep) => rep.basePay + getRepCommission(rep);

  const totalBase = activeReps.reduce((sum, r) => sum + r.basePay, 0);
  const totalCommission = activeReps.reduce((sum, r) => sum + getRepCommission(r), 0);
  const totalEarnings = activeReps.reduce((sum, r) => sum + getRepEarnings(r), 0);
  const midMonthPayout = totalBase / 2; // 50% advance

  const toggleStatus = (repName) => {
    setPayoutStatus(prev => ({
      ...prev,
      [repName]: prev[repName] === 'approved' ? 'pending' : 'approved'
    }));
  };

  const approveAll = () => {
    const allApproved = {};
    activeReps.forEach(r => allApproved[r.name] = 'approved');
    setPayoutStatus(allApproved);
  };

  const handleExportPayouts = () => {
    setExportLoading(true);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Commission Payouts - ${period}</title>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #1a1a1a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #112025; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 700; color: #112025; }
            .title { font-size: 18px; font-weight: 600; margin-top: 4px; }
            .meta { font-size: 12px; color: #666; text-align: right; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
            .summary-card { background: #f8faf9; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .summary-label { font-size: 11px; color: #666; text-transform: uppercase; }
            .summary-value { font-size: 22px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px; background: #112025; color: white; font-size: 10px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            tr:nth-child(even) { background: #f9fafb; }
            .mono { font-family: 'JetBrains Mono', monospace; }
            .approved { color: #10b981; }
            .pending { color: #f59e0b; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Amazing Life Foundation</div>
              <div class="title">Commission Payout Report - ${period}</div>
            </div>
            <div class="meta">
              <div>Generated ${new Date().toLocaleString()}</div>
              <div>Confidential</div>
            </div>
          </div>
          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Total Payroll</div>
              <div class="summary-value">${fmtMoney(totalEarnings, { full: true })}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Commission</div>
              <div class="summary-value">${fmtMoney(totalCommission, { full: true })}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Base Salary</div>
              <div class="summary-value">${fmtMoney(totalBase, { full: true })}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Active Reps</div>
              <div class="summary-value">${activeReps.length}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Rep</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Net New</th>
                <th>Commission</th>
                <th>Base</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${activeReps.map(rep => {
                const commission = getRepCommission(rep);
                const total = commission + rep.basePay;
                const netNew = monthIdx !== undefined ? rep.spark[monthIdx] : rep.netNew;
                const status = payoutStatus[rep.name] || 'pending';
                return `<tr>
                  <td style="font-weight: 500">${rep.name}</td>
                  <td>${rep.role}</td>
                  <td>Plan ${rep.plan}</td>
                  <td class="mono">${fmtMoney(netNew, { full: true })}</td>
                  <td class="mono">${fmtMoney(commission, { full: true })}</td>
                  <td class="mono">${fmtMoney(rep.basePay, { full: true })}</td>
                  <td class="mono" style="font-weight: 600">${fmtMoney(total, { full: true })}</td>
                  <td class="${status}">${status === 'approved' ? '[ok] Approved' : 'o Pending'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            Amazing Life Foundation * RevOps Dashboard * Confidential
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setExportLoading(false);
      }, 250);
    }, 300);
  };

  const getStatus = (repName) => payoutStatus[repName] || 'pending';

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <h1 className="page-title">Commission Payouts</h1>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
            {period} * {activeReps.length} active reps * awaiting approval
          </div>
        </div>
        <div className="topbar-actions">
          <PeriodSelector period={period} setPeriod={setPeriod} periodOpen={periodOpen} setPeriodOpen={setPeriodOpen} />
          <button className="approve-all-btn" onClick={approveAll}>
            <Icon.Target /> Approve All
          </button>
          <button className="export-btn" onClick={handleExportPayouts} disabled={exportLoading}>
            {exportLoading ? (
              <>
                <span className="loading-spinner" style={{ width: 14, height: 14, border: '2px solid var(--text-3)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', marginRight: 8 }}></span>
                Generating...
              </>
            ) : (
              <><Icon.Reports /> Export to PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Payout Summary Cards */}
      <div className="payout-summary">
        <div className="payout-card">
          <div className="payout-icon" style={{ background: 'rgba(52, 211, 153, 0.15)' }}>
            <Icon.Coin />
          </div>
          <div className="payout-info">
            <div className="payout-value tab">{fmtMoney(totalEarnings, { full: true })}</div>
            <div className="payout-label">Total Payroll</div>
          </div>
        </div>
        <div className="payout-card">
          <div className="payout-icon" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
            <Icon.Spark />
          </div>
          <div className="payout-info">
            <div className="payout-value tab">{fmtMoney(totalCommission, { full: true })}</div>
            <div className="payout-label">Total Commissions</div>
          </div>
        </div>
        <div className="payout-card">
          <div className="payout-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <Icon.Reps />
          </div>
          <div className="payout-info">
            <div className="payout-value tab">{fmtMoney(totalBase, { full: true })}</div>
            <div className="payout-label">Total Base Salary</div>
          </div>
        </div>
        <div className="payout-card">
          <div className="payout-icon" style={{ background: 'rgba(244, 114, 182, 0.15)' }}>
            <Icon.Cal />
          </div>
          <div className="payout-info">
            <div className="payout-value tab">{fmtMoney(midMonthPayout, { full: true })}</div>
            <div className="payout-label">Mid-Month Advance (15th)</div>
          </div>
        </div>
      </div>

      {/* Payout Table */}
      <div className="payout-section">
        <div className="section-header">
          <h2>Individual Payouts</h2>
          <div className="section-meta">
            {Object.values(payoutStatus).filter(s => s === 'approved').length} of {activeReps.length} approved
          </div>
        </div>

        <table className="payout-table">
          <thead>
            <tr>
              <th>Rep</th>
              <th>Role</th>
              <th>Plan</th>
              <th style={{ textAlign: 'right' }}>Base Salary</th>
              <th style={{ textAlign: 'right' }}>Commission</th>
              <th style={{ textAlign: 'right' }}>Total Payout</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {activeReps.map(rep => {
              const plan = PLANS[rep.plan] || PLANS.Inactive;
              const status = getStatus(rep.name);
              const commission = getRepCommission(rep);
              const earnings = getRepEarnings(rep);
              return (
                <tr key={rep.name} className={status === 'approved' ? 'approved' : ''}>
                  <td>
                    <div className="rep-cell">
                      <div className="avatar-sm" style={{ background: `linear-gradient(135deg, ${rep.color}, ${rep.color}88)` }}>
                        {initials(rep.name)}
                      </div>
                      <span>{rep.name}</span>
                    </div>
                  </td>
                  <td><span className="role-chip">{rep.role}</span></td>
                  <td><span className="plan-chip-sm">{plan.name.split('-')[0].trim()}</span></td>
                  <td style={{ textAlign: 'right' }} className="tab">{fmtMoney(rep.basePay, { full: true })}</td>
                  <td style={{ textAlign: 'right', color: 'var(--accent-3)' }} className="tab">{fmtMoney(commission, { full: true })}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }} className="tab">{fmtMoney(earnings, { full: true })}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={'status-badge ' + status}>{status === 'approved' ? 'Approved' : 'Pending'}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="approve-btn" onClick={() => toggleStatus(rep.name)}>
                      {status === 'approved' ? 'Undo' : 'Approve'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3"><strong>TOTALS</strong></td>
              <td style={{ textAlign: 'right' }} className="tab"><strong>{fmtMoney(totalBase, { full: true })}</strong></td>
              <td style={{ textAlign: 'right', color: 'var(--accent-3)' }} className="tab"><strong>{fmtMoney(totalCommission, { full: true })}</strong></td>
              <td style={{ textAlign: 'right' }} className="tab"><strong>{fmtMoney(totalEarnings, { full: true })}</strong></td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Schedule */}
      <div className="payout-section">
        <div className="section-header">
          <h2>Payment Schedule</h2>
        </div>
        <div className="schedule-grid">
          <div className="schedule-card">
            <div className="schedule-date">
              <span className="day">15</span>
              <span className="month">Apr</span>
            </div>
            <div className="schedule-info">
              <div className="schedule-title">Mid-Month Advance</div>
              <div className="schedule-amount tab">{fmtMoney(midMonthPayout, { full: true })}</div>
              <div className="schedule-desc">50% of base salary for all active reps</div>
            </div>
            <span className="schedule-status paid">Paid</span>
          </div>
          <div className="schedule-card">
            <div className="schedule-date">
              <span className="day">30</span>
              <span className="month">Apr</span>
            </div>
            <div className="schedule-info">
              <div className="schedule-title">End of Month Payout</div>
              <div className="schedule-amount tab">{fmtMoney(totalEarnings - midMonthPayout, { full: true })}</div>
              <div className="schedule-desc">Remaining base + all commissions</div>
            </div>
            <span className="schedule-status pending">Pending</span>
          </div>
        </div>
      </div>

      {/* Commission Breakdown by Plan */}
      <div className="payout-section">
        <div className="section-header">
          <h2>Commission Breakdown by Plan</h2>
        </div>
        <div className="plan-breakdown">
          {['A', 'B', 'C', 'D'].map(planKey => {
            const plan = PLANS[planKey];
            const repsOnPlan = activeReps.filter(r => r.plan === planKey);
            if (repsOnPlan.length === 0) return null;
            const planCommissions = repsOnPlan.reduce((sum, r) => sum + getRepCommission(r), 0);
            return (
              <div key={planKey} className="plan-breakdown-card">
                <div className="plan-breakdown-header">
                  <span className="plan-name">{plan.name}</span>
                  <span className="plan-total tab">{fmtMoney(planCommissions, { full: true })}</span>
                </div>
                <div className="plan-breakdown-reps">
                  {repsOnPlan.map(r => (
                    <div key={r.name} className="plan-rep-row">
                      <span>{r.name}</span>
                      <span className="tab">{fmtMoney(getRepCommission(r), { full: true })}</span>
                    </div>
                  ))}
                </div>
                <div className="plan-breakdown-meta">
                  {plan.type} * {repsOnPlan.length} rep{repsOnPlan.length > 1 ? 's' : ''} * Base rate {(plan.baseRate * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

// --------- REPORTS VIEW ---------
function ReportsView({ period, setPeriod }) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [activeReport, setActiveReport] = useState('executive');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Get period data
  const periodMonth = { 'Jan 2026': 'Jan', 'Feb 2026': 'Feb', 'Mar 2026': 'Mar', 'Apr 2026': 'Apr', 'May 2026': 'May' }[period];
  const monthIdx = MONTH_INDEX[period];
  const currentMonthData = MONTHLY.find(m => m.m === periodMonth) || MONTHLY[MONTHLY.length - 1];
  const prevMonthData = monthIdx > 0 ? MONTHLY[monthIdx - 1] : null;

  // Calculate available metrics from existing data
  const activeReps = REPS.filter(r => r.plan !== 'Inactive');
  const totalNetNew = monthIdx !== undefined
    ? REPS.reduce((sum, r) => sum + (r.spark[monthIdx] || 0), 0)
    : YTD.netNew;
  const totalDeals = monthIdx !== undefined
    ? REPS.reduce((sum, r) => sum + (r.monthlyDeals[monthIdx] || 0), 0)
    : YTD.deals;
  // Calculate commission dynamically for consistency across all tabs
  const activeReps = REPS.filter(r => r.plan !== 'Inactive');
  const totalCommission = monthIdx !== undefined
    ? activeReps.reduce((sum, r) => sum + calcCommission(r, r.spark[monthIdx] || 0), 0)
    : [0,1,2,3,4].reduce((sum, i) => sum + activeReps.reduce((s, r) => s + calcCommission(r, r.spark[i] || 0), 0), 0);
  const totalBase = activeReps.reduce((sum, r) => sum + r.basePay, 0);
  const totalEarnings = totalCommission + totalBase;

  // Calculate month-over-month changes
  const netNewChange = prevMonthData ? ((currentMonthData.netNew - prevMonthData.netNew) / prevMonthData.netNew * 100) : 0;
  const dealsChange = prevMonthData ? ((currentMonthData.deals - prevMonthData.deals) / prevMonthData.deals * 100) : 0;

  // PDF Export handler
  const handleExportPDF = (reportType) => {
    setExportLoading(true);
    setExportError(null);

    setTimeout(() => {
      try {
        // Use browser print for PDF generation
        const printContent = document.getElementById('report-content');
        if (!printContent) {
          throw new Error('Report content not found');
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ALF RevOps Report - ${reportType} - ${period}</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: 'Plus Jakarta Sans', sans-serif;
                padding: 40px;
                color: #1a1a1a;
                line-height: 1.5;
              }
              .report-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #112025;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .report-logo { font-size: 24px; font-weight: 700; color: #112025; }
              .report-title { font-size: 20px; font-weight: 600; margin-top: 4px; }
              .report-meta { font-size: 12px; color: #666; text-align: right; }
              .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
              .metric-card {
                background: #f8faf9;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
              }
              .metric-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
              .metric-value { font-size: 24px; font-weight: 700; color: #112025; font-family: 'JetBrains Mono', monospace; }
              .metric-change { font-size: 12px; margin-top: 4px; }
              .metric-change.positive { color: #10b981; }
              .metric-change.negative { color: #ef4444; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th {
                text-align: left;
                padding: 12px 16px;
                background: #112025;
                color: white;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              td {
                padding: 12px 16px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
              }
              tr:nth-child(even) { background: #f8faf9; }
              .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #112025;
                margin: 30px 0 16px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
              }
              .data-needed {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
              }
              .data-needed-title { font-weight: 600; color: #92400e; margin-bottom: 8px; }
              .data-needed-list { color: #92400e; font-size: 13px; padding-left: 20px; }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 11px;
                color: #666;
                text-align: center;
              }
              @media print {
                body { padding: 20px; }
                .metric-grid { page-break-inside: avoid; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; }
                thead { display: table-header-group; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <div class="footer">
              Generated ${new Date().toLocaleString()} * Amazing Life Foundation RevOps * Confidential
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setExportLoading(false);
        }, 250);
      } catch (err) {
        setExportError(err.message);
        setExportLoading(false);
      }
    }, 300);
  };

  // Report definitions
  const reports = [
    { id: 'executive', name: 'Executive Summary', IconComponent: Icon.ChartBar, available: true },
    { id: 'arr-bridge', name: 'ARR Movement', IconComponent: Icon.Bridge, available: true },
    { id: 'retention', name: 'Revenue Retention', IconComponent: Icon.Refresh, available: false, needs: ['Cohort data by signup month', 'Monthly recurring revenue by customer', 'Churn dates'] },
    { id: 'renewals', name: 'Renewal Forecast', IconComponent: Icon.Calendar, available: false, needs: ['Renewal dates by account', 'Contract values', 'Risk scoring data'] },
    { id: 'pipeline', name: 'Pipeline & Win Rate', IconComponent: Icon.Bullseye, available: false, needs: ['Opportunity stage data', 'Created/closed dates', 'Deal amounts by stage'] },
    { id: 'regional', name: 'Regional Performance', IconComponent: Icon.Globe, available: false, needs: ['Region assignment per account', 'LATAM vs US revenue split'] },
    { id: 'product', name: 'Product Performance', IconComponent: Icon.Package, available: true },
    { id: 'deferred', name: 'Deferred Revenue', IconComponent: Icon.Wallet, available: false, needs: ['Billing dates', 'Revenue recognition schedule', 'Deferred balance by month'] },
  ];

  // Render Executive Summary
  const renderExecutiveSummary = () => (
    <div id="report-content">
      <div className="report-header">
        <div>
          <div className="report-logo">Amazing Life Foundation</div>
          <div className="report-title">Executive Summary - {period}</div>
        </div>
        <div className="report-meta">
          <div>RevOps Dashboard</div>
          <div>Generated {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Net New ARR</div>
          <div className="metric-value">{fmtMoney(totalNetNew, { full: true })}</div>
          {prevMonthData && (
            <div className={`metric-change ${netNewChange >= 0 ? 'positive' : 'negative'}`}>
              {netNewChange >= 0 ? '+' : '-'} {Math.abs(netNewChange).toFixed(1)}% vs prior month
            </div>
          )}
        </div>
        <div className="metric-card">
          <div className="metric-label">Deals Closed</div>
          <div className="metric-value">{totalDeals}</div>
          {prevMonthData && (
            <div className={`metric-change ${dealsChange >= 0 ? 'positive' : 'negative'}`}>
              {dealsChange >= 0 ? '+' : '-'} {Math.abs(dealsChange).toFixed(1)}% vs prior month
            </div>
          )}
        </div>
        <div className="metric-card">
          <div className="metric-label">Gross Revenue</div>
          <div className="metric-value">{fmtMoney(currentMonthData?.gross || 0, { full: true })}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Commission Payout</div>
          <div className="metric-value">{fmtMoney(totalCommission, { full: true })}</div>
        </div>
      </div>

      <div className="section-title">Team Performance</div>
      <table>
        <thead>
          <tr>
            <th>Rep</th>
            <th>Role</th>
            <th>Deals</th>
            <th>Net New ARR</th>
            <th>Goal %</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activeReps.map(rep => {
            const repNetNew = monthIdx !== undefined ? rep.spark[monthIdx] : rep.spark.reduce((a,b) => a+b, 0);
            const repDeals = monthIdx !== undefined ? rep.monthlyDeals[monthIdx] : rep.monthlyDeals.reduce((a,b) => a+b, 0);
            const goalPct = rep.plan === 'D'
              ? (repNetNew / 50000) * 100
              : (repNetNew / (PLANS[rep.plan]?.quota || 50000)) * 100;
            return (
              <tr key={rep.name}>
                <td style={{ fontWeight: 500 }}>{rep.name}</td>
                <td>{rep.role}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{repDeals}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(repNetNew, { full: true })}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{goalPct.toFixed(1)}%</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                    background: goalPct >= 100 ? '#d1fae5' : goalPct >= 80 ? '#fef3c7' : '#fee2e2',
                    color: goalPct >= 100 ? '#065f46' : goalPct >= 80 ? '#92400e' : '#991b1b'
                  }}>
                    {goalPct >= 100 ? 'On Track' : goalPct >= 80 ? 'At Risk' : 'Behind'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="section-title">YTD Summary</div>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">YTD Net New ARR</div>
          <div className="metric-value">{fmtMoney(YTD.netNew, { full: true })}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">YTD Deals</div>
          <div className="metric-value">{YTD.deals}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">YTD Gross Revenue</div>
          <div className="metric-value">{fmtMoney(YTD.gross, { full: true })}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">YTD Commissions</div>
          <div className="metric-value">{fmtMoney(YTD.commission, { full: true })}</div>
        </div>
      </div>

      <div className="data-needed">
        <div className="data-needed-title">Additional Data Needed for Full Executive Report</div>
        <ul className="data-needed-list">
          <li>Net Revenue Retention (NRR) - requires cohort-level MRR data</li>
          <li>Gross Revenue Retention (GRR) - requires churn and contraction data</li>
          <li>Logo Churn Rate - requires customer count by month</li>
          <li>Pipeline Coverage - requires opportunity stage data</li>
        </ul>
      </div>
    </div>
  );

  // Render ARR Bridge
  const renderARRBridge = () => {
    // Calculate bridge components from available data
    const months = period === 'YTD 2026' ? MONTHLY : (monthIdx !== undefined ? [MONTHLY[monthIdx]] : [MONTHLY[MONTHLY.length - 1]]);

    // For single month, show the flow
    const openingARR = monthIdx > 0 ? MONTHLY.slice(0, monthIdx).reduce((sum, m) => sum + m.netNew, 0) : 0;
    const newARR = totalNetNew;
    // Note: We don't have expansion/contraction/churn data - showing what we have
    const closingARR = openingARR + newARR;

    return (
      <div id="report-content">
        <div className="report-header">
          <div>
            <div className="report-logo">Amazing Life Foundation</div>
            <div className="report-title">ARR Movement (Bridge) - {period}</div>
          </div>
          <div className="report-meta">
            <div>RevOps Dashboard</div>
            <div>Generated {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="section-title">ARR Bridge - Available Data</div>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>Opening ARR (Prior Months)</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(openingARR, { full: true })}</td>
              <td style={{ color: '#666', fontSize: 12 }}>Sum of Net New ARR from prior months in 2026</td>
            </tr>
            <tr style={{ background: '#d1fae5' }}>
              <td style={{ fontWeight: 500, color: '#065f46' }}>+ New ARR</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#065f46' }}>{fmtMoney(newARR, { full: true })}</td>
              <td style={{ color: '#065f46', fontSize: 12 }}>Net new ARR from new and existing customers</td>
            </tr>
            <tr style={{ background: '#fef3c7' }}>
              <td style={{ fontWeight: 500, color: '#92400e' }}>+ Expansion</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#92400e' }}>-</td>
              <td style={{ color: '#92400e', fontSize: 12 }}>Data needed: Upgrade/upsell amounts</td>
            </tr>
            <tr style={{ background: '#fee2e2' }}>
              <td style={{ fontWeight: 500, color: '#991b1b' }}>- Contraction</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#991b1b' }}>-</td>
              <td style={{ color: '#991b1b', fontSize: 12 }}>Data needed: Downgrade amounts</td>
            </tr>
            <tr style={{ background: '#fee2e2' }}>
              <td style={{ fontWeight: 500, color: '#991b1b' }}>- Churn</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#991b1b' }}>-</td>
              <td style={{ color: '#991b1b', fontSize: 12 }}>Data needed: Churned ARR amounts</td>
            </tr>
            <tr style={{ background: '#e0e7ff' }}>
              <td style={{ fontWeight: 600 }}>= Closing ARR</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{fmtMoney(closingARR, { full: true })}</td>
              <td style={{ fontSize: 12 }}>Partial: Missing expansion/contraction/churn</td>
            </tr>
          </tbody>
        </table>

        <div className="section-title">Monthly Net New ARR Trend</div>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Net New ARR</th>
              <th>Deals</th>
              <th>Gross Revenue</th>
              <th>MoM Change</th>
            </tr>
          </thead>
          <tbody>
            {MONTHLY.map((m, i) => {
              const prevMonth = i > 0 ? MONTHLY[i - 1] : null;
              const change = prevMonth ? ((m.netNew - prevMonth.netNew) / prevMonth.netNew * 100) : 0;
              return (
                <tr key={m.m}>
                  <td style={{ fontWeight: 500 }}>{m.m} 2026</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(m.netNew, { full: true })}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{m.deals}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(m.gross, { full: true })}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: change >= 0 ? '#065f46' : '#991b1b' }}>
                    {i > 0 ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="data-needed">
          <div className="data-needed-title">Data Needed for Complete ARR Bridge</div>
          <ul className="data-needed-list">
            <li><strong>Expansion ARR:</strong> Upsell and upgrade amounts by customer and month</li>
            <li><strong>Contraction ARR:</strong> Downgrade amounts by customer and month</li>
            <li><strong>Churned ARR:</strong> Lost revenue from canceled accounts by month</li>
            <li><strong>Opening ARR:</strong> Starting ARR balance (if not starting from zero)</li>
          </ul>
        </div>
      </div>
    );
  };

  // Render Product Performance
  const renderProductPerformance = () => {
    // Aggregate product data from deals
    const productData = {};
    REPS.forEach(rep => {
      (rep.dealsList || []).forEach(deal => {
        const product = deal.product || 'Other';
        if (!productData[product]) {
          productData[product] = { deals: 0, arr: 0, netNew: 0 };
        }
        productData[product].deals++;
        productData[product].arr += deal.arr || 0;
        productData[product].netNew += deal.netNew || 0;
      });
    });

    const products = Object.entries(productData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.netNew - a.netNew);

    const totalProductARR = products.reduce((sum, p) => sum + p.netNew, 0);

    return (
      <div id="report-content">
        <div className="report-header">
          <div>
            <div className="report-logo">Amazing Life Foundation</div>
            <div className="report-title">Product Performance - {period}</div>
          </div>
          <div className="report-meta">
            <div>RevOps Dashboard</div>
            <div>Generated {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="section-title">Product Line Performance</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Deals</th>
              <th>Total ARR</th>
              <th>Net New ARR</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.name}>
                <td style={{ fontWeight: 500 }}>{product.name}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{product.deals}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(product.arr, { full: true })}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(product.netNew, { full: true })}</td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {totalProductARR > 0 ? ((product.netNew / totalProductARR) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            ))}
            <tr style={{ background: '#e0e7ff', fontWeight: 600 }}>
              <td>Total</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{products.reduce((s, p) => s + p.deals, 0)}</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(products.reduce((s, p) => s + p.arr, 0), { full: true })}</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtMoney(totalProductARR, { full: true })}</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>100%</td>
            </tr>
          </tbody>
        </table>

        <div className="data-needed">
          <div className="data-needed-title">Data Needed for Full Product Analysis</div>
          <ul className="data-needed-list">
            <li><strong>Product Categories:</strong> Mapping of products to lines (Core Curriculum, Amazing+, VBS Seasonal)</li>
            <li><strong>Seasonality Data:</strong> Historical monthly data to show VBS seasonal patterns</li>
            <li><strong>Multi-Year Deals:</strong> Contract length and ramp deal information</li>
            <li><strong>Renewal Rates:</strong> Product-level retention and churn rates</li>
          </ul>
        </div>
      </div>
    );
  };

  // Render placeholder for unavailable reports
  const renderDataNeeded = (report) => (
    <div id="report-content">
      <div className="report-header">
        <div>
          <div className="report-logo">Amazing Life Foundation</div>
          <div className="report-title">{report.name} - Data Required</div>
        </div>
        <div className="report-meta">
          <div>RevOps Dashboard</div>
          <div>{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="data-needed" style={{ marginTop: 30 }}>
        <div className="data-needed-title">This Report Requires Additional Data</div>
        <p style={{ marginBottom: 16, color: '#92400e' }}>
          The following data sources are needed to generate the {report.name} report:
        </p>
        <ul className="data-needed-list">
          {report.needs.map((need, i) => (
            <li key={i}>{need}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 30, padding: 20, background: '#f0fdf4', border: '1px solid #10b981', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, color: '#065f46', marginBottom: 8 }}>How to Add This Data</div>
        <ol style={{ paddingLeft: 20, color: '#065f46', fontSize: 13 }}>
          <li>Export the required data from your source system (Salesforce, Zuora, etc.)</li>
          <li>Add to the Excel workbook in the appropriate sheet</li>
          <li>Run the sync script to update the dashboard</li>
          <li>This report will automatically populate once data is available</li>
        </ol>
      </div>
    </div>
  );

  // Get current report content
  const getReportContent = () => {
    const report = reports.find(r => r.id === activeReport);
    if (!report) return null;

    if (!report.available) {
      return renderDataNeeded(report);
    }

    switch (activeReport) {
      case 'executive': return renderExecutiveSummary();
      case 'arr-bridge': return renderARRBridge();
      case 'product': return renderProductPerformance();
      default: return renderDataNeeded(report);
    }
  };

  const currentReport = reports.find(r => r.id === activeReport);

  return (
    <main className="main reports-view">
      {/* Topbar */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Reports</h1>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
            Generate and export RevOps reports
          </div>
        </div>
        <div className="topbar-actions">
          <PeriodSelector period={period} setPeriod={setPeriod} periodOpen={periodOpen} setPeriodOpen={setPeriodOpen} />
          <button
            className="export-btn"
            onClick={() => handleExportPDF(activeReport)}
            disabled={exportLoading || !currentReport?.available}
            style={{ opacity: (!currentReport?.available) ? 0.5 : 1 }}
          >
            {exportLoading ? (
              <>
                <span className="loading-spinner" style={{ width: 14, height: 14, border: '2px solid var(--text-3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8 }}></span>
                Generating...
              </>
            ) : (
              <>
                <Icon.Reports /> Export to PDF
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div style={{ background: 'var(--red)', color: 'white', padding: '12px 20px', borderRadius: 8, margin: '0 0 20px 0', fontSize: 13 }}>
          Export failed: {exportError}
        </div>
      )}

      <div className="reports-layout">
        {/* Report Selector Sidebar */}
        <div className="reports-sidebar">
          <div className="reports-sidebar-title">Report Type</div>
          {reports.map(report => (
            <div
              key={report.id}
              className={`report-nav-item ${activeReport === report.id ? 'active' : ''} ${!report.available ? 'unavailable' : ''}`}
              onClick={() => setActiveReport(report.id)}
            >
              <span className="report-nav-icon"><report.IconComponent /></span>
              <span className="report-nav-name">{report.name}</span>
              {!report.available && <span className="report-nav-badge">Data Needed</span>}
            </div>
          ))}
        </div>

        {/* Report Content */}
        <div className="reports-content">
          <div className="report-preview">
            {getReportContent()}
          </div>
        </div>
      </div>
    </main>
  );
}

// --------- MAIN APP ---------
function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeRep, setActiveRep] = useState(null);
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [view, setView] = useState('By metric');
  const [forecastMonth, setForecastMonth] = useState('Jun');
  const [forecastOpen, setForecastOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('goal');
  const [sortDir, setSortDir] = useState('desc');
  const [toasts, setToasts] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest && e.target.closest('.popover-wrap')) return;
      setPeriodOpen(false); setViewOpen(false); setForecastOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pushToast = (title, sub) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, title, sub }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  };

  const handleGenerateReport = () => {
    if (reportLoading) return;
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      pushToast('Payout report generated', `${period} * ${REPS.filter(r => r.earnings > 0).length} reps * ${fmtMoney(periodData.earnings, { full: true })} * sent to elijah.diaz@amazinglife.com`);
    }, 1100);
  };

  // Resolve current period to monthly data
  const periodMonth = { 'Jan 2026': 'Jan', 'Feb 2026': 'Feb', 'Mar 2026': 'Mar', 'Apr 2026': 'Apr', 'May 2026': 'May' }[period];
  const periodData = MONTHLY.find(m => m.m === periodMonth) || MAY_DATA;
  const isYTD = period === 'YTD 2026';
  const isQ1 = period === 'Q1 2026';

  // Calculate commission dynamically from rep data for consistency
  const activeReps = REPS.filter(r => r.plan !== 'Inactive');
  const calcPeriodCommission = (monthIdx) => activeReps.reduce((sum, r) => sum + calcCommission(r, r.spark[monthIdx] || 0), 0);

  const activeData = isYTD ? {
    ...YTD,
    commission: [0,1,2,3,4].reduce((sum, i) => sum + calcPeriodCommission(i), 0),
  } : isQ1 ? {
    deals: MONTHLY.slice(0,3).reduce((s,m)=>s+m.deals,0),
    gross: MONTHLY.slice(0,3).reduce((s,m)=>s+m.gross,0),
    netNew: MONTHLY.slice(0,3).reduce((s,m)=>s+m.netNew,0),
    commission: [0,1,2].reduce((sum, i) => sum + calcPeriodCommission(i), 0),
  } : {
    ...periodData,
    commission: calcPeriodCommission(MONTH_INDEX[period]),
  };

  // KPI bar percents - bar height relative to YTD peak across months
  const peakDeals = 260, peakGross = 524590, peakNetNew = 305149, peakComm = isYTD ? YTD.commission : 13253;
  const tiles = [
    { value: activeData.deals, label: 'Deals closed', pct: (activeData.deals / (isYTD ? YTD.deals : peakDeals)) * 100, color: 'normal' },
    { value: fmtMoney(activeData.gross), label: 'Gross revenue', pct: (activeData.gross / (isYTD ? YTD.gross : peakGross)) * 100, color: 'normal' },
    { value: fmtMoney(activeData.netNew), label: 'Net new ARR', pct: (activeData.netNew / (isYTD ? YTD.netNew : peakNetNew)) * 100, color: 'normal' },
    { value: fmtMoney(activeData.commission), label: 'Commissions', pct: (activeData.commission / peakComm) * 100, color: 'normal' },
  ];

  // Helper to get rep data for selected period
  const monthIndex = { 'Jan 2026': 0, 'Feb 2026': 1, 'Mar 2026': 2, 'Apr 2026': 3, 'May 2026': 4 }[period];
  const getRepNetNew = (rep) => {
    if (monthIndex !== undefined) return rep.spark[monthIndex];
    if (period === 'Q1 2026') return rep.spark[0] + rep.spark[1] + rep.spark[2];
    if (period === 'YTD 2026') return rep.spark.reduce((a, b) => a + b, 0);
    return rep.netNew;
  };
  // Get basis for goal calculation (ARR Collected for Plan D, Net New for others)
  const getRepBasis = (rep) => {
    if (rep.plan === 'D' && rep.arrCollected) {
      if (monthIndex !== undefined) return rep.arrCollected[monthIndex];
      if (period === 'Q1 2026') return rep.arrCollected[0] + rep.arrCollected[1] + rep.arrCollected[2];
      if (period === 'YTD 2026') return rep.arrCollected.reduce((a, b) => a + b, 0);
      return rep.gross;
    }
    return getRepNetNew(rep);
  };
  // Quota logic: AMs have monthly quota $50K, AEs have quarterly quota $125K
  const getRepGoal = (rep) => {
    const basis = getRepBasis(rep);
    const isAE = rep.role === 'AE';

    if (isAE) {
      // AEs are measured quarterly - $125K quota per quarter
      const quarterlyQuota = 125000;
      if (period === 'Q1 2026') {
        // Q1 had ramp quota (50%)
        return (basis / (quarterlyQuota * 0.5)) * 100;
      }
      if (period === 'YTD 2026') {
        // Q1 (ramp) + Q2 start
        return (basis / (quarterlyQuota * 0.5 + quarterlyQuota)) * 100;
      }
      // For monthly view, show quarterly attainment (Apr is Q2)
      if (monthIndex === 3) return (basis / quarterlyQuota) * 100;
      // Q1 months use Q1 cumulative
      const q1Total = rep.spark[0] + rep.spark[1] + rep.spark[2];
      return (q1Total / (quarterlyQuota * 0.5)) * 100;
    } else {
      // AMs (including SM AM) have monthly quota $50K
      const monthlyQuota = 50000;
      if (period === 'Q1 2026') return (basis / (monthlyQuota * 3)) * 100;
      if (period === 'YTD 2026') return (basis / (monthlyQuota * 4)) * 100;
      return (basis / monthlyQuota) * 100;
    }
  };

  // Filter + sort leaderboard
  const ranked = useMemo(() => {
    let list = REPS.filter(r => !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.role.toLowerCase().includes(query.toLowerCase()));
    list = [...list].sort((a, b) => {
      let av, bv;
      if (sortKey === 'netNew') {
        av = getRepNetNew(a);
        bv = getRepNetNew(b);
      } else if (sortKey === 'goal') {
        av = getRepGoal(a);
        bv = getRepGoal(b);
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return list;
  }, [query, sortKey, sortDir, period]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  const sortInd = (key) => sortKey === key ? <span className="sort-ind">{sortDir === 'desc' ? 'v' : '^'}</span> : null;

  const avgAttain = REPS.reduce((s, r) => s + getRepGoal(r), 0) / REPS.length;
  const avgDeal = activeData.netNew / activeData.deals;

  const periodOptions = PERIOD_OPTIONS;
  const viewOptions = ['By metric', 'By rep', 'By role'];
  const forecastOptions = ['May', 'Jun', 'Jul', 'Q2 close'];

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Reps' ? (
        <RepsView onSelectRep={setActiveRep} period={period} setPeriod={setPeriod} />
      ) : activeTab === 'Commissions' ? (
        <CommissionsView period={period} setPeriod={setPeriod} />
      ) : activeTab === 'Reports' ? (
        <ReportsView period={period} setPeriod={setPeriod} />
      ) : (
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <h1 className="page-title">Commissions</h1>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
              Q2 2026 * finalized May 26 * awaiting payout approval
            </div>
          </div>
          <div className="topbar-actions">
            <div className="popover-wrap">
              <div className="pill" onClick={(e) => { e.stopPropagation(); setPeriodOpen(o => !o); setViewOpen(false); setForecastOpen(false); }}>
                <span className="label">Period:</span>
                <span className="value">{period}</span>
                <Icon.ChevD/>
              </div>
              {periodOpen && (
                <div className="popover">
                  {periodOptions.map(p => (
                    <div key={p} className={'popover-item' + (period === p ? ' active' : '')} onClick={() => { setPeriod(p); setPeriodOpen(false); }}>
                      <span>{p}</span>
                      <span className="check">[ok]</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="data-dict-btn" onClick={() => setShowMethodology(true)} title="Data Dictionary & Methodology">
              <Icon.Info /> Data Dictionary
            </button>
            <div className="search">
              <Icon.Search/>
              <input
                placeholder="Search reps, deals, accounts..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && <span style={{ cursor: 'pointer', color: 'var(--text-3)', fontSize: 11 }} onClick={() => setQuery('')}>clear</span>}
            </div>
            <div className="icon-btn" title="Calendar" onClick={() => pushToast('Calendar view', 'Switch to month-by-month calendar (coming soon)')}><Icon.Cal/></div>
          </div>
        </div>

        {/* Top row: hero card + forecast */}
        <div className="top-row">
          {/* Team Performance */}
          <section className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Team Performance</div>
                <div className="card-sub">All reps * {period}</div>
              </div>
            </div>
            <div className="card-body">
              <div className="metrics-grid">
                <div className="metric-tile">
                  <div className="metric-icon"><Icon.Target/></div>
                  <div className="metric-content">
                    <div className="metric-value tab">{activeData.deals}</div>
                    <div className="metric-label">Deals Closed</div>
                  </div>
                </div>
                <div className="metric-tile">
                  <div className="metric-icon"><Icon.Coin/></div>
                  <div className="metric-content">
                    <div className="metric-value tab">{fmtMoney(activeData.gross)}</div>
                    <div className="metric-label">Gross Revenue</div>
                  </div>
                </div>
                <div className="metric-tile highlight">
                  <div className="metric-icon"><Icon.Spark/></div>
                  <div className="metric-content">
                    <div className="metric-value tab">{fmtMoney(activeData.netNew)}</div>
                    <div className="metric-label">Net New ARR</div>
                  </div>
                </div>
                <div className="metric-tile">
                  <div className="metric-icon"><Icon.Commission/></div>
                  <div className="metric-content">
                    <div className="metric-value tab">{fmtMoney(activeData.commission)}</div>
                    <div className="metric-label">Commissions <span className="info-btn" onClick={() => setShowMethodology(true)} title="View calculation methodology"><Icon.Info/></span></div>
                  </div>
                </div>
              </div>
              <div className="metrics-secondary">
                <div className="metric-secondary-item">
                  <span className="metric-secondary-value tab">{avgAttain.toFixed(1)}%</span>
                  <span className="metric-secondary-label">Avg Attainment</span>
                </div>
                <div className="metric-secondary-item">
                  <span className="metric-secondary-value tab">{fmtMoney(avgDeal)}</span>
                  <span className="metric-secondary-label">Avg Deal Size</span>
                </div>
                <div className="metric-secondary-item">
                  <span className="metric-secondary-value tab">7/8</span>
                  <span className="metric-secondary-label">Reps Earning</span>
                </div>
              </div>

              {/* Net New ARR by Rep Bar Chart */}
              {(() => {
                // Map period to spark array index (0=Jan, 1=Feb, 2=Mar, 3=Apr, 4=May)
                const monthIndex = { 'Jan 2026': 0, 'Feb 2026': 1, 'Mar 2026': 2, 'Apr 2026': 3, 'May 2026': 4 }[period];
                const getRepNetNew = (rep) => {
                  if (monthIndex !== undefined) return rep.spark[monthIndex];
                  if (period === 'Q1 2026') return rep.spark[0] + rep.spark[1] + rep.spark[2];
                  if (period === 'YTD 2026') return rep.spark.reduce((a, b) => a + b, 0);
                  return rep.netNew;
                };
                const sortedReps = [...REPS].sort((a, b) => getRepNetNew(b) - getRepNetNew(a));
                const maxNetNew = Math.max(...sortedReps.map(r => getRepNetNew(r)));

                return (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--hairline)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px', fontWeight: 500 }}>Net New ARR by Rep</div>
                    {sortedReps.map((rep) => {
                      const repNetNew = getRepNetNew(rep);
                      const pct = (repNetNew / maxNetNew) * 100;
                      return (
                        <div key={rep.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div style={{ width: '70px', fontSize: '12px', color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rep.name.split(' ')[0]}
                          </div>
                          <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: pct + '%', height: '100%', background: rep.color, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                          </div>
                          <div className="tab" style={{ width: '55px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                            {fmtMoney(repNetNew)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Forecast panel */}
          <section className="card forecast">
            <div className="forecast-head">
              <div className="forecast-title">May <span className="accent">Projection</span></div>
              <div className="info-btn" onClick={() => setShowMethodology(true)} title="How is this calculated?">
                <Icon.Info />
              </div>
            </div>
            <div className="orbit-viz">
              <ForecastViz/>
            </div>
            <div className="forecast-meta">
              <div className="forecast-meta-left">
                <div className="forecast-label tab">Run Rate: {fmtMoney(MAY.projectedCommission)}</div>
                <div className="forecast-sub">
                  {MAY.trendPct >= 0 ? '+' : '-'} {Math.abs(MAY.trendPct).toFixed(0)}% vs prior months * Range: {fmtMoney(MAY.projLow)} - {fmtMoney(MAY.projHigh)}
                </div>
              </div>
              <div className="popover-wrap">
                <div className="chip-select" onClick={(e) => { e.stopPropagation(); setForecastOpen(o => !o); setPeriodOpen(false); setViewOpen(false); }}>{forecastMonth} <Icon.ChevD/></div>
                {forecastOpen && (
                  <div className="popover" style={{ right: 0, minWidth: 140 }}>
                    {forecastOptions.map(f => (
                      <div key={f} className={'popover-item' + (forecastMonth === f ? ' active' : '')} onClick={() => { setForecastMonth(f); setForecastOpen(false); }}>
                        <span>{f}</span>
                        <span className="check">[ok]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mini-chart">
              <div className="mini-chart-label">Commission * YTD + Projection</div>
              <MiniBars data={[
                { label: 'Jan', v: MONTHLY[0].commission, projected: false },
                { label: 'Feb', v: MONTHLY[1].commission, projected: false },
                { label: 'Mar', v: MONTHLY[2].commission, projected: false },
                { label: 'Apr', v: MONTHLY[3].commission, projected: false },
                { label: 'May', v: MAY.projectedCommission, projected: true },
              ]}/>
              <button className="cta-pill" onClick={handleGenerateReport} disabled={reportLoading}>
                {reportLoading ? 'Generating...' : 'Generate payout report'}
              </button>
            </div>
          </section>
        </div>

        {/* YTD Net New ARR Chart */}
        <section className="card">
          <div className="card-head">
            <div>
              <div className="card-title">YTD Net New ARR</div>
              <div className="card-sub">Monthly performance with cumulative trend line</div>
            </div>
            <div className="ytd-legend">
              <span className="legend-item"><span className="legend-bar"></span>Monthly Net New</span>
              <span className="legend-item"><span className="legend-line"></span>Cumulative YTD</span>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <YTDNetNewChart/>
            <div className="ytd-summary">
              <div className="ytd-stat">
                <div className="ytd-stat-label">YTD Total</div>
                <div className="ytd-stat-value tab">{fmtMoney(YTD.netNew, { full: true })}</div>
              </div>
              <div className="ytd-stat">
                <div className="ytd-stat-label">Monthly Avg</div>
                <div className="ytd-stat-value tab">{fmtMoney(YTD.netNew / 4, { full: true })}</div>
              </div>
              <div className="ytd-stat">
                <div className="ytd-stat-label">Best Month</div>
                <div className="ytd-stat-value tab">Jan * $305K</div>
              </div>
              <div className="ytd-stat">
                <div className="ytd-stat-label">Trend</div>
                <div className="ytd-stat-value" style={{ color: 'var(--rose)' }}>- Declining</div>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section className="card leaderboard">
          <div className="lb-head">
            <div>
              <div className="card-title">Rep Leaderboard {query && <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, marginLeft: 8 }}>* {ranked.length} match{ranked.length !== 1 ? 'es' : ''}</span>}</div>
              <div className="card-sub">Sorted by {sortKey === 'goal' ? 'attainment' : sortKey === 'earnings' ? 'earnings' : sortKey === 'netNew' ? 'net new ARR' : sortKey === 'deals' ? 'deals' : 'value'} * click a row to view scorecard</div>
            </div>
            <a className="see-all" onClick={() => pushToast('All reps view', 'Opening full rep roster...')}>See all reps -></a>
          </div>

          <table className="lb-table">
            <thead>
              <tr>
                <th></th>
                <th>Rep</th>
                <th>Role</th>
                <th className="sortable" onClick={() => handleSort('goal')}>Attainment{sortInd('goal')}</th>
                <th className="sortable" onClick={() => handleSort('netNew')}>Net new ARR{sortInd('netNew')}</th>
                <th className="sortable" onClick={() => handleSort('deals')}>Deals{sortInd('deals')}</th>
                <th>4-mo trend</th>
                <th className="sortable" onClick={() => handleSort('commission')}>Commission{sortInd('commission')}</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((rep, i) => (
                <tr key={rep.name} className="row" onClick={() => setActiveRep(rep)}>
                  <td className="rank-col tab">#{i + 1}</td>
                  <td className="rep-col">
                    <div className="rep-cell">
                      <div className="avatar" style={{ background: `linear-gradient(135deg, ${rep.color}, ${rep.color}88)` }}>
                        {initials(rep.name)}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{rep.name}</div>
                    </div>
                  </td>
                  <td><span className="role-chip">{rep.role}</span></td>
                  <td className="attain-col">
                    <div className="attain-cell">
                      <AttainBars pct={getRepGoal(rep)}/>
                      <div className="attain-val tab">{getRepGoal(rep).toFixed(1)}%</div>
                    </div>
                  </td>
                  <td className="row-money tab money-col">{fmtMoney(getRepNetNew(rep), { full: true })}</td>
                  <td className="tab">{rep.deals}</td>
                  <td className="spark-cell">
                    <Sparkline data={rep.spark} color={rep.color} width={110} height={32}/>
                  </td>
                  <td className="row-money tab money-col" style={{ color: rep.commission > 0 ? 'var(--text)' : 'var(--text-3)' }}>
                    {fmtMoney(rep.commission, { full: true })}
                  </td>
                  <td>
                    <span className="status-pill">
                      <span className={'dot ' + getStatusInfo(getRepStatus(getRepGoal(rep))).dotClass}/>
                      {getStatusInfo(getRepStatus(getRepGoal(rep))).label}
                    </span>
                  </td>
                  <td className="row-actions"><Icon.More/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      )}

      <RepDrawer rep={activeRep} onClose={() => setActiveRep(null)}/>

      {/* Data Dictionary & Methodology Modal */}
      {showMethodology && (
        <>
          <div className="modal-scrim" onClick={() => setShowMethodology(false)} />
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Data Dictionary & Methodology</h3>
              <div className="modal-close" onClick={() => setShowMethodology(false)}><Icon.X /></div>
            </div>
            <div className="modal-body">
              {/* Data Sources */}
              <div className="method-section">
                <h4>Data Sources</h4>
                <table className="data-dict-table">
                  <thead>
                    <tr><th>Source</th><th>Location</th><th>Update Frequency</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Primary Workbook</strong></td>
                      <td><code>Commissions Workbook - Elijah's Copy for Payouts for Lori.xlsx</code></td>
                      <td>Manual sync or daily 5pm auto-sync</td>
                    </tr>
                    <tr>
                      <td><strong>Rep Performance</strong></td>
                      <td>Individual rep sheets (e.g., "Cameron Grissom", "Brian Carl")</td>
                      <td>Row 15 = Deals, Row 16 = Net New ARR</td>
                    </tr>
                    <tr>
                      <td><strong>Settings & Roster</strong></td>
                      <td>Settings sheet, Rows 15-30</td>
                      <td>Name, Role, Quota, Base Pay</td>
                    </tr>
                    <tr>
                      <td><strong>Dashboard Totals</strong></td>
                      <td>Dashboard sheet</td>
                      <td>Aggregated monthly totals</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Metric Definitions */}
              <div className="method-section">
                <h4>Metric Definitions</h4>
                <table className="data-dict-table">
                  <thead>
                    <tr><th>Metric</th><th>Definition</th><th>Formula / Source</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Net New ARR</strong></td>
                      <td>New annual recurring revenue from new and existing customers</td>
                      <td><code>Sum of rep.spark[monthIndex]</code> for all active reps</td>
                    </tr>
                    <tr>
                      <td><strong>Deals Closed</strong></td>
                      <td>Count of closed-won opportunities</td>
                      <td><code>Sum of rep.monthlyDeals[monthIndex]</code></td>
                    </tr>
                    <tr>
                      <td><strong>Gross Revenue</strong></td>
                      <td>Total contract value of closed deals</td>
                      <td>From Excel Dashboard sheet</td>
                    </tr>
                    <tr>
                      <td><strong>Commission</strong></td>
                      <td>Variable compensation based on Net New ARR and plan</td>
                      <td><code>calcCommission(rep, netNew)</code> - see rates below</td>
                    </tr>
                    <tr>
                      <td><strong>Base Pay</strong></td>
                      <td>Fixed monthly salary component</td>
                      <td>From Settings sheet Column E</td>
                    </tr>
                    <tr>
                      <td><strong>Total Earnings</strong></td>
                      <td>Total monthly compensation</td>
                      <td><code>Commission + Base Pay</code></td>
                    </tr>
                    <tr>
                      <td><strong>Goal %</strong></td>
                      <td>Progress toward monthly quota</td>
                      <td><code>(Net New ARR / Monthly Quota) x 100</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Commission Plans */}
              <div className="method-section">
                <h4>Commission Plan Rates</h4>
                <table className="data-dict-table">
                  <thead>
                    <tr><th>Plan</th><th>Role</th><th>Base Rate</th><th>Special Rules</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Plan A</strong></td>
                      <td>AE Standard</td>
                      <td>8%</td>
                      <td>Accelerators at 100%, 125%, 150% of quota</td>
                    </tr>
                    <tr>
                      <td><strong>Plan B</strong></td>
                      <td>AE with Dead Zone</td>
                      <td>6%</td>
                      <td><strong>$0 commission until $42,367 cleared</strong>, then 6% on amount above</td>
                    </tr>
                    <tr>
                      <td><strong>Plan C</strong></td>
                      <td>AM Monthly</td>
                      <td>1.7%</td>
                      <td>10% kicker on amounts over $50K quota</td>
                    </tr>
                    <tr>
                      <td><strong>Plan D</strong></td>
                      <td>SME ARR Collected</td>
                      <td>1.7%</td>
                      <td>Flat rate on ARR Collected (no tiers)</td>
                    </tr>
                  </tbody>
                </table>
                <div className="formula-box" style={{ marginTop: 12 }}>
                  <code>
                    Plan A: commission = netNew * 0.08<br/>
                    Plan B: commission = (netNew {'>'} $42,367) ? (netNew - $42,367) * 0.06 : $0<br/>
                    Plan C/D: commission = netNew * 0.017
                  </code>
                </div>
              </div>

              {/* Current Period Values */}
              <div className="method-section">
                <h4>Current Period: {period}</h4>
                <div className="method-grid">
                  <div className="method-stat">
                    <span className="method-label">Net New ARR</span>
                    <span className="method-value tab">{fmtMoney(activeData.netNew, { full: true })}</span>
                  </div>
                  <div className="method-stat">
                    <span className="method-label">Deals Closed</span>
                    <span className="method-value tab">{activeData.deals}</span>
                  </div>
                  <div className="method-stat">
                    <span className="method-label">Total Commission</span>
                    <span className="method-value tab">{fmtMoney(activeData.commission, { full: true })}</span>
                  </div>
                  <div className="method-stat">
                    <span className="method-label">Active Reps</span>
                    <span className="method-value tab">{activeReps.length}</span>
                  </div>
                </div>
              </div>

              {/* Run Rate Methodology */}
              <div className="method-section">
                <h4>Run Rate Projection</h4>
                <p>Projects future performance using weighted historical average:</p>
                <div className="formula-box">
                  <code>Projected = (Recent 2-Month Avg x 60%) + (Overall Avg x 40%)</code>
                </div>
                <div className="method-grid" style={{ marginTop: 12 }}>
                  <div className="method-stat highlight">
                    <span className="method-label">Recent Avg (Mar+Apr)</span>
                    <span className="method-value tab">{fmtMoney((MONTHLY[2].commission + MONTHLY[3].commission) / 2, { full: true })}</span>
                  </div>
                  <div className="method-stat accent">
                    <span className="method-label">Projected Commission</span>
                    <span className="method-value tab">{fmtMoney(MAY.projectedCommission, { full: true })}</span>
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="method-section">
                <h4>Audit Trail</h4>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
                  All values can be traced back to the source Excel workbook. The sync script logs every update to <code>sync_log.txt</code>.
                  Commission calculations use the shared <code>calcCommission()</code> function ensuring consistency across all dashboard tabs.
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>
                  Last sync: Check <code>/Users/elijah/Desktop/Sales Dash Automation/sync_log.txt</code>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div className="check-circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l4.5 4.5L19 7"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="toast-title">{t.title}</div>
              {t.sub && <div className="toast-sub">{t.sub}</div>}
            </div>
            <div className="toast-close" onClick={() => setToasts(arr => arr.filter(x => x.id !== t.id))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
