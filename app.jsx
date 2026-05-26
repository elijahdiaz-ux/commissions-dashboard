const { useState, useMemo, useEffect } = React;

// ───────── DATA ─────────
// Values from Excel: Commissions Workbook - Dashboard sheet (April 2026)
const REPS = [
  { name: 'Cameron Grissom',  role: 'AM',    deals: 54, netNew: 55323, goal: 110.6, gross: 85412, commission: 1382, basePay: 4167, earnings: 5549, status: 'on-track', spark: [11200, 18400, 32800, 55323], color: '#34D399',
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
  { name: 'Kaitlyn Lack',     role: 'SM AM', deals: 26, netNew: 48814, goal: 97.6,  gross: 48814, commission: 845,  basePay: 4167, earnings: 5012, status: 'on-track', spark: [22400, 31100, 38200, 48814], color: '#6BD9A4',
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
  { name: 'Chase Bryant',     role: 'AE',    deals: 12, netNew: 37422, goal: 0.0,   gross: 73570, commission: 0,    basePay: 0,    earnings: 0,    status: 'inactive', spark: [42100, 38800, 35400, 37422], color: '#6B6F8C',
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
  { name: 'Connor Krauseneck',role: 'AE',    deals: 15, netNew: 34517, goal: 82.8,  gross: 39426, commission: 2761, basePay: 5000, earnings: 7761, status: 'behind',   spark: [28200, 30100, 32400, 34517], color: '#F3C969',
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
  { name: 'Caleb Gilbert',    role: 'AE',    deals: 6,  netNew: 25713, goal: 61.7,  gross: 34429, commission: 2057, basePay: 5000, earnings: 7057, status: 'behind',   spark: [9100, 14400, 21200, 25713], color: '#E26D8E',
    dealsList: [
      { customer: 'Christian Tabernacle Church', product: 'Amazing+', arr: 5814, netNew: 5814 },
      { customer: 'Connect Church', product: '252', arr: 4304, netNew: 3105 },
      { customer: 'Cornerstone Church', product: 'Amazing+', arr: 14999, netNew: 14999 },
      { customer: 'Godalming Minster', product: 'Amazing+', arr: 959, netNew: 459 },
      { customer: 'Liberty Baptist Church', product: 'High School', arr: 2431, netNew: 1335 },
    ]
  },
  { name: 'Brian Carl',       role: 'AE',    deals: 13, netNew: 25598, goal: 61.4,  gross: 46178, commission: 2048, basePay: 5000, earnings: 7048, status: 'behind',   spark: [38100, 31200, 28400, 25598], color: '#F08F6A',
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
  { name: 'Elijah Diaz',      role: 'AM',    deals: 7,  netNew: 9990,  goal: 20.0,  gross: 12782, commission: 170,  basePay: 4167, earnings: 4337, status: 'behind',   spark: [14200, 11100, 8400, 9990],   color: '#6EE7B7',
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
  { name: "Connor O'Brien",   role: 'AE',    deals: 22, netNew: 4903,  goal: 11.8,  gross: 20449, commission: 0,    basePay: 6681, earnings: 6681, status: 'behind',   spark: [22100, 18400, 12200, 4903],  color: '#7BD3EA',
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
];

const MONTHLY = [
  { m: 'Jan', deals: 221, gross: 524590, netNew: 305149, goal: 96.4, commission: 13253, earnings: 47435 },
  { m: 'Feb', deals: 260, gross: 497579, netNew: 246289, goal: 77.8, commission:  9071, earnings: 43253 },
  { m: 'Mar', deals: 202, gross: 479383, netNew: 198461, goal: 62.7, commission: 11896, earnings: 56374 },
  { m: 'Apr', deals: 134, gross: 361935, netNew: 218390, goal: 69.0, commission:  9263, earnings: 43445 },
];

const APR = MONTHLY[3];
const YTD = {
  deals: 817, gross: 1863488, netNew: 968289, commission: 43483, earnings: 463962,
};
// May pacing: day 26 of 31; assume linear pacing from current run rate
const MAY = {
  dayOfMonth: 26,
  daysInMonth: 31,
  earningsToDate: 38420,
  projectedEarnings: 48200,
  projectedAttainment: 74.2,
  goal: 65000,
};

// ───────── HELPERS ─────────
const fmtMoney = (v, opts = {}) => {
  const { full = false } = opts;
  if (full) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (Math.abs(v) >= 1000) return '$' + (v / 1000).toFixed(v >= 100000 ? 0 : 1) + 'K';
  return '$' + v.toFixed(0);
};
const initials = (name) => name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();

// ───────── ICONS ─────────
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
};

// ───────── SPARKLINE ─────────
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

// ───────── ORBITAL / FORECAST VIZ ─────────
function ForecastViz() {
  // forecast trajectory: Jan→Apr actual, May projected (dashed) with confidence cone
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const actual = [47435, 43253, 56374, 43445];
  const projLow = 41500, projMid = 48200, projHigh = 54900;
  const W = 320, H = 220;
  const padX = 28, padTop = 30, padBot = 30;
  const allVals = [...actual, projLow, projHigh];
  const maxV = Math.max(...allVals) * 1.05;
  const minV = Math.min(...allVals) * 0.85;
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

      {/* Dots */}
      {actual.map((v, i) => (
        <g key={i}>
          <circle cx={xFor(i)} cy={yFor(v)} r="3.2" fill="#0E1220" stroke="#34D399" strokeWidth="1.8" />
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
        <text x="0" y="-1" fontSize="10.5" fontWeight="600" fill="#6EE7B7" textAnchor="middle" fontFamily="JetBrains Mono">$48.2K</text>
      </g>
    </svg>
  );
}

// ───────── MINI BAR CHART ─────────
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

// ───────── BAR TILE ─────────
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

// ───────── ATTAINMENT BARS (SEGMENT VIZ) ─────────
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

// ───────── DRAWER ─────────
function RepDrawer({ rep, onClose }) {
  if (!rep) return null;
  const monthlyEarn = [
    { label: 'Jan', v: rep.earnings * 1.05, projected: false },
    { label: 'Feb', v: rep.earnings * 0.92, projected: false },
    { label: 'Mar', v: rep.earnings * 1.18, projected: false },
    { label: 'Apr', v: rep.earnings, projected: false },
    { label: 'May ▴', v: rep.earnings * 1.08, projected: true },
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
              {rep.status === 'on-track' ? 'On track' : rep.status === 'inactive' ? 'Inactive' : 'Behind quota'}
            </div>
          </div>
          <div className="drawer-close" onClick={onClose}><Icon.X/></div>
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
          <h4>April Deals ({rep.dealsList?.length || 0})</h4>
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

// ───────── SIDEBAR ─────────
function Sidebar() {
  const [active, setActive] = useState('Dashboard');
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
          <div key={label} className={'nav-item' + (active === label ? ' active' : '')} onClick={() => setActive(label)}>
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
          <div className="profile-email">finance@oneflow.com</div>
        </div>
      </div>
    </aside>
  );
}

// ───────── MAIN APP ─────────
function App() {
  const [activeRep, setActiveRep] = useState(null);
  const [period, setPeriod] = useState('Apr 2026');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [view, setView] = useState('By metric');
  const [forecastMonth, setForecastMonth] = useState('May');
  const [forecastOpen, setForecastOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('goal');
  const [sortDir, setSortDir] = useState('desc');
  const [toasts, setToasts] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

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
      pushToast('Payout report generated', `April 2026 · ${REPS.filter(r => r.earnings > 0).length} reps · ${fmtMoney(APR.earnings, { full: true })} · sent to finance@oneflow.com`);
    }, 1100);
  };

  // Resolve current period to monthly data
  const periodMonth = { 'Jan 2026': 'Jan', 'Feb 2026': 'Feb', 'Mar 2026': 'Mar', 'Apr 2026': 'Apr' }[period];
  const periodData = MONTHLY.find(m => m.m === periodMonth) || APR;
  const isYTD = period === 'YTD 2026';
  const isQ1 = period === 'Q1 2026';
  const activeData = isYTD ? YTD : isQ1 ? {
    deals: MONTHLY.slice(0,3).reduce((s,m)=>s+m.deals,0),
    gross: MONTHLY.slice(0,3).reduce((s,m)=>s+m.gross,0),
    netNew: MONTHLY.slice(0,3).reduce((s,m)=>s+m.netNew,0),
    earnings: MONTHLY.slice(0,3).reduce((s,m)=>s+m.earnings,0),
  } : periodData;

  // KPI bar percents — bar height relative to YTD peak across months
  const peakDeals = 260, peakGross = 524590, peakNetNew = 305149, peakEarn = isYTD ? YTD.earnings : 56374;
  const tiles = [
    { value: activeData.deals, label: 'Deals closed', pct: (activeData.deals / (isYTD ? YTD.deals : peakDeals)) * 100, color: 'normal' },
    { value: fmtMoney(activeData.gross), label: 'Gross revenue', pct: (activeData.gross / (isYTD ? YTD.gross : peakGross)) * 100, color: 'normal' },
    { value: fmtMoney(activeData.netNew), label: 'Net new ARR', pct: (activeData.netNew / (isYTD ? YTD.netNew : peakNetNew)) * 100, color: 'normal' },
    { value: fmtMoney(activeData.earnings), label: 'Commissions paid', pct: (activeData.earnings / peakEarn) * 100, color: 'normal' },
  ];

  // Filter + sort leaderboard
  const ranked = useMemo(() => {
    let list = REPS.filter(r => !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.role.toLowerCase().includes(query.toLowerCase()));
    list = [...list].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return list;
  }, [query, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  const sortInd = (key) => sortKey === key ? <span className="sort-ind">{sortDir === 'desc' ? '▼' : '▲'}</span> : null;

  const avgAttain = REPS.reduce((s, r) => s + r.goal, 0) / REPS.length;
  const avgDeal = APR.netNew / APR.deals;

  const periodOptions = ['Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'Q1 2026', 'YTD 2026'];
  const viewOptions = ['By metric', 'By rep', 'By role'];
  const forecastOptions = ['May', 'Jun', 'Jul', 'Q2 close'];

  return (
    <div className="app">
      <Sidebar/>

      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <h1 className="page-title">Commissions</h1>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
              Q2 2026 · finalized May 26 · awaiting payout approval
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
                      <span className="check">✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          {/* Hero card with bars */}
          <section className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Team Performance</div>
                <div className="card-sub">All reps · {period}</div>
              </div>
              <div className="popover-wrap">
                <div className="pill" onClick={(e) => { e.stopPropagation(); setViewOpen(o => !o); setPeriodOpen(false); setForecastOpen(false); }}>
                  <span className="label">View:</span>
                  <span className="value">{view}</span>
                  <Icon.ChevD/>
                </div>
                {viewOpen && (
                  <div className="popover">
                    {viewOptions.map(v => (
                      <div key={v} className={'popover-item' + (view === v ? ' active' : '')} onClick={() => { setView(v); setViewOpen(false); }}>
                        <span>{v}</span>
                        <span className="check">✓</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="card-body">
              <div className="bars-row">
                {tiles.map((t, i) => <BarTile key={i} {...t}/>)}
              </div>
              <div className="bar-divider"/>
              <div className="submetrics">
                <div className="submetric">
                  <div className="sm-value tab">{avgAttain.toFixed(1)}%</div>
                  <div className="sm-label">
                    <span className="dot sm-dot-purple">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
                    </span>
                    Avg attainment to quota
                  </div>
                  <div className="more"><Icon.More/></div>
                </div>
                <div className="submetric">
                  <div className="sm-value tab">{fmtMoney(avgDeal)}</div>
                  <div className="sm-label">
                    <span className="dot sm-dot-yellow">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                    </span>
                    Avg deal size
                  </div>
                  <div className="more"><Icon.More/></div>
                </div>
                <div className="submetric">
                  <div className="sm-value tab">7 <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-3)' }}>/ 8 active</span></div>
                  <div className="sm-label">
                    <span className="dot sm-dot-green">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4 4 10-10"/></svg>
                    </span>
                    Reps earning
                  </div>
                  <div className="more"><Icon.More/></div>
                </div>
              </div>
            </div>
          </section>

          {/* Forecast panel */}
          <section className="card forecast">
            <div className="forecast-head">
              <div className="forecast-title">May <span className="accent">Pacing</span></div>
            </div>
            <div className="orbit-viz">
              <ForecastViz/>
            </div>
            <div className="forecast-meta">
              <div className="forecast-meta-left">
                <div className="forecast-label tab">Day {MAY.dayOfMonth} / {MAY.daysInMonth}</div>
                <div className="forecast-sub">Tracking +11% vs April · 74% to team quota</div>
              </div>
              <div className="popover-wrap">
                <div className="chip-select" onClick={(e) => { e.stopPropagation(); setForecastOpen(o => !o); setPeriodOpen(false); setViewOpen(false); }}>{forecastMonth} <Icon.ChevD/></div>
                {forecastOpen && (
                  <div className="popover" style={{ right: 0, minWidth: 140 }}>
                    {forecastOptions.map(f => (
                      <div key={f} className={'popover-item' + (forecastMonth === f ? ' active' : '')} onClick={() => { setForecastMonth(f); setForecastOpen(false); }}>
                        <span>{f}</span>
                        <span className="check">✓</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mini-chart">
              <div className="mini-chart-label">Commissions payout · YTD</div>
              <MiniBars data={[
                { label: 'Jan', v: 47435, projected: false },
                { label: 'Feb', v: 43253, projected: false },
                { label: 'Mar', v: 56374, projected: false },
                { label: 'Apr', v: 43445, projected: false },
                { label: 'May', v: 48200, projected: true },
              ]}/>
              <button className="cta-pill" onClick={handleGenerateReport} disabled={reportLoading}>
                {reportLoading ? 'Generating…' : 'Generate payout report'}
              </button>
            </div>
          </section>
        </div>

        {/* Leaderboard */}
        <section className="card leaderboard">
          <div className="lb-head">
            <div>
              <div className="card-title">Rep Leaderboard {query && <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, marginLeft: 8 }}>· {ranked.length} match{ranked.length !== 1 ? 'es' : ''}</span>}</div>
              <div className="card-sub">Sorted by {sortKey === 'goal' ? 'attainment' : sortKey === 'earnings' ? 'earnings' : sortKey === 'netNew' ? 'net new ARR' : sortKey === 'deals' ? 'deals' : 'value'} · click a row to view scorecard</div>
            </div>
            <a className="see-all" onClick={() => pushToast('All reps view', 'Opening full rep roster…')}>See all reps →</a>
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
                <th className="sortable" onClick={() => handleSort('earnings')}>Apr earnings{sortInd('earnings')}</th>
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
                      <AttainBars pct={rep.goal}/>
                      <div className="attain-val tab">{rep.goal.toFixed(1)}%</div>
                    </div>
                  </td>
                  <td className="row-money tab money-col">{fmtMoney(rep.netNew, { full: true })}</td>
                  <td className="tab">{rep.deals}</td>
                  <td className="spark-cell">
                    <Sparkline data={rep.spark} color={rep.color} width={110} height={32}/>
                  </td>
                  <td className="row-money tab money-col" style={{ color: rep.earnings > 0 ? 'var(--text)' : 'var(--text-3)' }}>
                    {fmtMoney(rep.earnings, { full: true })}
                  </td>
                  <td>
                    <span className="status-pill">
                      <span className={'dot ' + (rep.status === 'on-track' ? 'dot-on' : rep.status === 'inactive' ? 'dot-inactive' : 'dot-behind')}/>
                      {rep.status === 'on-track' ? 'On track' : rep.status === 'inactive' ? 'Inactive' : 'Behind'}
                    </span>
                  </td>
                  <td className="row-actions"><Icon.More/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      <RepDrawer rep={activeRep} onClose={() => setActiveRep(null)}/>

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
