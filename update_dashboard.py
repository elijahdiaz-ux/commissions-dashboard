#!/usr/bin/env python3
"""
Commission Dashboard Auto-Updater
Reads data from Excel workbook and updates the GitHub Pages dashboard.

Usage:
    python3 update_dashboard.py                    # Update and push
    python3 update_dashboard.py --preview          # Update locally only (no push)
    python3 update_dashboard.py --excel /path/to/file.xlsx  # Use different Excel file
"""

import subprocess
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Install dependencies if needed
def install_deps():
    try:
        import pandas
        import openpyxl
    except ImportError:
        print("Installing required packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "openpyxl", "-q"])

install_deps()

import pandas as pd

# Default Excel file path
DEFAULT_EXCEL = Path.home() / "Desktop" / "Commissions Workbook  Elijah's Copy for Payouts for Lori.xlsx"

def read_dashboard_data(excel_path):
    """Read data from the Dashboard sheet of the Excel workbook."""
    print(f"Reading data from: {excel_path}")

    xlsx = pd.ExcelFile(excel_path)
    df = pd.read_excel(xlsx, sheet_name='Dashboard', header=None)

    # Extract key metrics (row 6)
    metrics = {
        'current_month_deals': int(df.iloc[6, 1]),
        'team_total_arr': float(df.iloc[6, 3]),
        'net_new_arr': float(df.iloc[6, 5]),
        'pct_to_goal': float(df.iloc[6, 7]) * 100,
        'total_net_new_incl_unassigned': float(df.iloc[6, 9]),
        'total_earnings': float(df.iloc[6, 11]),
        'amazing_plus_deals': int(df.iloc[6, 13]) if pd.notna(df.iloc[6, 13]) else 0,
    }

    # Extract monthly data (rows 10-22)
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly_data = []
    for i, month in enumerate(months):
        col = i + 1
        deals = df.iloc[10, col] if pd.notna(df.iloc[10, col]) else 0
        if deals == 0 and i > 3:  # Skip future months with no data
            continue
        monthly_data.append({
            'month': month,
            'deals': int(deals) if pd.notna(deals) else 0,
            'gross_revenue': float(df.iloc[11, col]) if pd.notna(df.iloc[11, col]) else 0,
            'net_new_arr': float(df.iloc[12, col]) if pd.notna(df.iloc[12, col]) else 0,
            'pct_to_goal': float(df.iloc[15, col]) * 100 if pd.notna(df.iloc[15, col]) else 0,
            'commission': float(df.iloc[19, col]) if pd.notna(df.iloc[19, col]) else 0,
            'total_earnings': float(df.iloc[22, col]) if pd.notna(df.iloc[22, col]) else 0,
        })

    # YTD totals
    ytd = {
        'deals': int(df.iloc[10, 13]) if pd.notna(df.iloc[10, 13]) else 0,
        'gross_revenue': float(df.iloc[11, 13]) if pd.notna(df.iloc[11, 13]) else 0,
        'net_new_arr': float(df.iloc[12, 13]) if pd.notna(df.iloc[12, 13]) else 0,
        'commission': float(df.iloc[19, 13]) if pd.notna(df.iloc[19, 13]) else 0,
        'total_earnings': float(df.iloc[22, 13]) if pd.notna(df.iloc[22, 13]) else 0,
    }

    # Extract rep scorecards
    # Row 29-39: Brian Carl, Caleb Gilbert, Cameron Grissom, Chase Bryant
    # Row 42-52: Connor Krauseneck, Connor O'Brien, Elijah Diaz, Kaitlyn Lack

    reps = []

    # First row of reps - value columns are offset by 1 from label columns
    # Brian Carl: col 2, Caleb Gilbert: col 6, Cameron Grissom: col 10, Chase Bryant: col 14
    rep_configs_row1 = [
        (2, 'Brian Carl', 'AE'),
        (6, 'Caleb Gilbert', 'AE'),
        (10, 'Cameron Grissom', 'AM'),
        (14, 'Chase Bryant', 'AE'),
    ]

    for col, name, role in rep_configs_row1:
        try:
            net_new = float(df.iloc[30, col]) if pd.notna(df.iloc[30, col]) else 0
            goal = float(df.iloc[31, col]) * 100 if pd.notna(df.iloc[31, col]) else 0
            deals = int(df.iloc[32, col]) if pd.notna(df.iloc[32, col]) else 0
            gross = float(df.iloc[36, col]) if pd.notna(df.iloc[36, col]) else 0
            earnings = float(df.iloc[39, col]) if pd.notna(df.iloc[39, col]) else 0

            status = 'on-track' if goal >= 90 else 'inactive' if goal == 0 else 'behind'

            reps.append({
                'name': name,
                'role': role,
                'deals': deals,
                'netNew': net_new,
                'goal': round(goal, 1),
                'gross': gross,
                'earnings': earnings,
                'status': status
            })
        except Exception as e:
            print(f"Warning: Could not read data for {name}: {e}")

    # Second row of reps - value columns offset by 1
    rep_configs_row2 = [
        (2, 'Connor Krauseneck', 'AE'),
        (6, "Connor O'Brien", 'AE'),
        (10, 'Elijah Diaz', 'AM'),
        (14, 'Kaitlyn Lack', 'SM AM'),
    ]

    for col, name, role in rep_configs_row2:
        try:
            net_new = float(df.iloc[43, col]) if pd.notna(df.iloc[43, col]) else 0
            goal = float(df.iloc[44, col]) * 100 if pd.notna(df.iloc[44, col]) else 0
            deals = int(df.iloc[45, col]) if pd.notna(df.iloc[45, col]) else 0
            gross = float(df.iloc[49, col]) if pd.notna(df.iloc[49, col]) else 0
            earnings = float(df.iloc[52, col]) if pd.notna(df.iloc[52, col]) else 0

            status = 'on-track' if goal >= 90 else 'inactive' if goal == 0 else 'behind'

            reps.append({
                'name': name,
                'role': role,
                'deals': deals,
                'netNew': net_new,
                'goal': round(goal, 1),
                'gross': gross,
                'earnings': earnings,
                'status': status
            })
        except Exception as e:
            print(f"Warning: Could not read data for {name}: {e}")

    # Get filter info from row 3
    quarter = df.iloc[3, 3] if pd.notna(df.iloc[3, 3]) else 'Q2'
    month_num = int(df.iloc[3, 4]) if pd.notna(df.iloc[3, 4]) else 4
    month_names = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']
    current_month = month_names[month_num] if month_num < len(month_names) else 'April'

    return {
        'metrics': metrics,
        'monthly': monthly_data,
        'ytd': ytd,
        'reps': reps,
        'quarter': quarter,
        'current_month': current_month,
        'updated': datetime.now().strftime('%B %d, %Y at %I:%M %p')
    }


def generate_html(data):
    """Generate the dashboard HTML with the extracted data."""

    # Format rep data for JavaScript
    rep_js = ',\n            '.join([
        f"{{ name: '{r['name']}', role: '{r['role']}', deals: {r['deals']}, netNew: {r['netNew']:.0f}, goal: {r['goal']}, gross: {r['gross']:.0f}, earnings: {r['earnings']:.0f}, status: '{r['status']}' }}"
        for r in data['reps']
    ])

    # Generate monthly rows
    monthly_rows = '\n'.join([
        f"""                <tr{' style="background: #334155;"' if m['month'] == data['current_month'][:3] else ''}>
                    <td>{'<strong>' if m['month'] == data['current_month'][:3] else ''}{m['month']}{'</strong>' if m['month'] == data['current_month'][:3] else ''}</td>
                    <td>{'<strong>' if m['month'] == data['current_month'][:3] else ''}{m['deals']}{'</strong>' if m['month'] == data['current_month'][:3] else ''}</td>
                    <td>{'<strong>' if m['month'] == data['current_month'][:3] else ''}${m['gross_revenue']:,.0f}{'</strong>' if m['month'] == data['current_month'][:3] else ''}</td>
                    <td>{'<strong>' if m['month'] == data['current_month'][:3] else ''}${m['net_new_arr']:,.0f}{'</strong>' if m['month'] == data['current_month'][:3] else ''}</td>
                    <td>{'<strong>' if m['month'] == data['current_month'][:3] else ''}{m['pct_to_goal']:.1f}%{'</strong>' if m['month'] == data['current_month'][:3] else ''}</td>
                    <td>{'<strong>' if m['month'] == data['current_month'][:3] else ''}${m['commission']:,.0f}{'</strong>' if m['month'] == data['current_month'][:3] else ''}</td>
                    <td>{'<strong>' if m['month'] == data['current_month'][:3] else ''}${m['total_earnings']:,.0f}{'</strong>' if m['month'] == data['current_month'][:3] else ''}</td>
                </tr>"""
        for m in data['monthly']
    ])

    # Get unique roles for filter
    roles = sorted(set(r['role'] for r in data['reps']))
    role_options = '\n                '.join([f'<option value="{r}">{r}</option>' for r in roles])

    # Get rep names for filter
    rep_options = '\n                '.join([f'<option value="{r["name"]}">{r["name"]}</option>' for r in sorted(data['reps'], key=lambda x: x['name'])])

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Performance Dashboard | {data['current_month']} 2026</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; padding: 24px; }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .header h1 {{ font-size: 28px; font-weight: 600; color: #f8fafc; margin-bottom: 8px; }}
        .header .subtitle {{ color: #94a3b8; font-size: 14px; }}
        .header .last-updated {{ color: #64748b; font-size: 12px; margin-top: 4px; }}
        .filters-bar {{ display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; background: #1e293b; padding: 16px 20px; border-radius: 12px; border: 1px solid #334155; }}
        .filter-group {{ display: flex; flex-direction: column; gap: 6px; }}
        .filter-label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600; }}
        .filter-select {{ background: #334155; border: 1px solid #475569; color: #f8fafc; padding: 10px 14px; border-radius: 8px; font-size: 14px; min-width: 180px; cursor: pointer; }}
        .filter-select:hover {{ border-color: #6366f1; }}
        .filter-select:focus {{ outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }}
        .reset-btn {{ background: #475569; border: none; color: #f8fafc; padding: 10px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; margin-left: auto; transition: background 0.2s; }}
        .reset-btn:hover {{ background: #6366f1; }}
        .active-filters {{ display: flex; gap: 8px; align-items: center; margin-left: 16px; }}
        .filter-tag {{ background: #6366f1; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 6px; }}
        .filter-tag .remove {{ cursor: pointer; opacity: 0.7; }}
        .filter-tag .remove:hover {{ opacity: 1; }}
        .metrics-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }}
        .metric-card {{ background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 20px; border: 1px solid #334155; transition: transform 0.2s, box-shadow 0.2s; }}
        .metric-card:hover {{ transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); }}
        .metric-card.highlight {{ background: linear-gradient(135deg, #065f46 0%, #047857 100%); border-color: #10b981; }}
        .metric-label {{ font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }}
        .metric-value {{ font-size: 28px; font-weight: 700; color: #f8fafc; }}
        .metric-subtext {{ font-size: 12px; color: #64748b; margin-top: 4px; }}
        .charts-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 32px; }}
        .chart-card {{ background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; }}
        .chart-card h3 {{ font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #f8fafc; }}
        .chart-container {{ position: relative; height: 300px; }}
        .table-card {{ background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; overflow-x: auto; }}
        .table-card h3 {{ font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #f8fafc; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid #334155; }}
        th {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600; }}
        td {{ font-size: 14px; color: #e2e8f0; }}
        tr:hover {{ background: #334155; }}
        .status-badge {{ display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }}
        .status-on-track {{ background: #065f46; color: #34d399; }}
        .status-behind {{ background: #7c2d12; color: #fdba74; }}
        .status-inactive {{ background: #374151; color: #9ca3af; }}
        .progress-bar {{ width: 100%; height: 8px; background: #334155; border-radius: 4px; overflow: hidden; }}
        .progress-fill {{ height: 100%; border-radius: 4px; transition: width 0.3s ease; }}
        .progress-green {{ background: linear-gradient(90deg, #10b981, #34d399); }}
        .progress-yellow {{ background: linear-gradient(90deg, #f59e0b, #fbbf24); }}
        .progress-red {{ background: linear-gradient(90deg, #ef4444, #f87171); }}
        .no-data {{ text-align: center; padding: 40px; color: #64748b; font-style: italic; }}
        @media (max-width: 768px) {{ .charts-grid {{ grid-template-columns: 1fr; }} .metrics-grid {{ grid-template-columns: repeat(2, 1fr); }} .filters-bar {{ flex-direction: column; align-items: stretch; }} .reset-btn {{ margin-left: 0; margin-top: 8px; }} }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Sales Performance Dashboard</h1>
        <div class="subtitle">{data['quarter']} 2026 | {data['current_month']} Performance</div>
        <div class="last-updated">Last updated: {data['updated']}</div>
    </div>

    <div class="filters-bar">
        <div class="filter-group">
            <label class="filter-label">Role / Team</label>
            <select id="roleFilter" class="filter-select" onchange="applyFilters()">
                <option value="all">All Roles</option>
                {role_options}
            </select>
        </div>
        <div class="filter-group">
            <label class="filter-label">Rep</label>
            <select id="repFilter" class="filter-select" onchange="applyFilters()">
                <option value="all">All Reps</option>
                {rep_options}
            </select>
        </div>
        <div id="activeFilters" class="active-filters"></div>
        <button class="reset-btn" onclick="resetFilters()">Reset Filters</button>
    </div>

    <div class="metrics-grid">
        <div class="metric-card"><div class="metric-label">Deals</div><div class="metric-value" id="metricDeals">{data['metrics']['current_month_deals']}</div><div class="metric-subtext">Current Selection</div></div>
        <div class="metric-card"><div class="metric-label">Gross Revenue</div><div class="metric-value" id="metricGross">${data['metrics']['team_total_arr']/1000:.1f}K</div><div class="metric-subtext">Total ARR</div></div>
        <div class="metric-card"><div class="metric-label">Net New ARR</div><div class="metric-value" id="metricNetNew">${data['metrics']['net_new_arr']/1000:.1f}K</div><div class="metric-subtext">Current Selection</div></div>
        <div class="metric-card highlight"><div class="metric-label">Avg % to Goal</div><div class="metric-value" id="metricGoal">{data['metrics']['pct_to_goal']:.1f}%</div><div class="metric-subtext">Monthly Target</div></div>
        <div class="metric-card"><div class="metric-label">Total Earnings</div><div class="metric-value" id="metricEarnings">${data['metrics']['total_earnings']/1000:.1f}K</div><div class="metric-subtext">{data['current_month']} Commissions</div></div>
        <div class="metric-card"><div class="metric-label">Rep Count</div><div class="metric-value" id="metricRepCount">{len(data['reps'])}</div><div class="metric-subtext">In Selection</div></div>
    </div>

    <div class="charts-grid">
        <div class="chart-card"><h3>Net New ARR by Rep</h3><div class="chart-container"><canvas id="repArrChart"></canvas></div></div>
        <div class="chart-card"><h3>Attainment % by Rep</h3><div class="chart-container"><canvas id="attainmentChart"></canvas></div></div>
        <div class="chart-card"><h3>Deals by Rep</h3><div class="chart-container"><canvas id="dealsChart"></canvas></div></div>
        <div class="chart-card"><h3>Earnings by Rep</h3><div class="chart-container"><canvas id="earningsChart"></canvas></div></div>
    </div>

    <div class="table-card">
        <h3>Rep Scorecards - {data['current_month']} 2026</h3>
        <table id="repTable"><thead><tr><th>Rep</th><th>Role</th><th>Deals</th><th>Net New ARR</th><th>% to Goal</th><th>Progress</th><th>Gross Revenue</th><th>{data['current_month']} Earnings</th><th>Status</th></tr></thead><tbody id="repTableBody"></tbody></table>
        <div id="noDataMessage" class="no-data" style="display: none;">No reps match the selected filters.</div>
    </div>

    <div class="table-card" style="margin-top: 24px;">
        <h3>Monthly Performance Breakdown - YTD 2026 (Team Total)</h3>
        <table>
            <thead><tr><th>Month</th><th>Deals</th><th>Gross Revenue</th><th>Net New ARR</th><th>% to Goal</th><th>Commission</th><th>Total Earnings</th></tr></thead>
            <tbody>
{monthly_rows}
                <tr style="background: #1e3a5f;">
                    <td><strong>YTD Total</strong></td>
                    <td><strong>{data['ytd']['deals']}</strong></td>
                    <td><strong>${data['ytd']['gross_revenue']:,.0f}</strong></td>
                    <td><strong>${data['ytd']['net_new_arr']:,.0f}</strong></td>
                    <td><strong>—</strong></td>
                    <td><strong>${data['ytd']['commission']:,.0f}</strong></td>
                    <td><strong>${data['ytd']['total_earnings']:,.0f}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <script>
        const repData = [
            {rep_js}
        ];
        let repArrChart, attainmentChart, dealsChart, earningsChart;
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = '#334155';
        document.addEventListener('DOMContentLoaded', function() {{ initCharts(); applyFilters(); }});
        function getFilteredData() {{ const roleFilter = document.getElementById('roleFilter').value; const repFilter = document.getElementById('repFilter').value; return repData.filter(rep => {{ const roleMatch = roleFilter === 'all' || rep.role === roleFilter; const repMatch = repFilter === 'all' || rep.name === repFilter; return roleMatch && repMatch; }}); }}
        function applyFilters() {{ const filtered = getFilteredData(); updateMetrics(filtered); updateTable(filtered); updateCharts(filtered); updateActiveFilters(); }}
        function resetFilters() {{ document.getElementById('roleFilter').value = 'all'; document.getElementById('repFilter').value = 'all'; applyFilters(); }}
        function updateActiveFilters() {{ const roleFilter = document.getElementById('roleFilter').value; const repFilter = document.getElementById('repFilter').value; const container = document.getElementById('activeFilters'); container.innerHTML = ''; if (roleFilter !== 'all') {{ container.innerHTML += `<span class="filter-tag">${{roleFilter}} <span class="remove" onclick="document.getElementById('roleFilter').value='all';applyFilters();">×</span></span>`; }} if (repFilter !== 'all') {{ container.innerHTML += `<span class="filter-tag">${{repFilter}} <span class="remove" onclick="document.getElementById('repFilter').value='all';applyFilters();">×</span></span>`; }} }}
        function updateMetrics(data) {{ const totalDeals = data.reduce((sum, r) => sum + r.deals, 0); const totalGross = data.reduce((sum, r) => sum + r.gross, 0); const totalNetNew = data.reduce((sum, r) => sum + r.netNew, 0); const totalEarnings = data.reduce((sum, r) => sum + r.earnings, 0); const avgGoal = data.length > 0 ? data.reduce((sum, r) => sum + r.goal, 0) / data.length : 0; document.getElementById('metricDeals').textContent = totalDeals; document.getElementById('metricGross').textContent = '$' + (totalGross / 1000).toFixed(1) + 'K'; document.getElementById('metricNetNew').textContent = '$' + (totalNetNew / 1000).toFixed(1) + 'K'; document.getElementById('metricGoal').textContent = avgGoal.toFixed(1) + '%'; document.getElementById('metricEarnings').textContent = '$' + (totalEarnings / 1000).toFixed(1) + 'K'; document.getElementById('metricRepCount').textContent = data.length; }}
        function updateTable(data) {{ const tbody = document.getElementById('repTableBody'); const noData = document.getElementById('noDataMessage'); if (data.length === 0) {{ tbody.innerHTML = ''; noData.style.display = 'block'; return; }} noData.style.display = 'none'; const sorted = [...data].sort((a, b) => b.netNew - a.netNew); tbody.innerHTML = sorted.map(rep => {{ const progressClass = rep.goal >= 90 ? 'progress-green' : rep.goal >= 50 ? 'progress-yellow' : 'progress-red'; const statusClass = rep.status === 'on-track' ? 'status-on-track' : rep.status === 'inactive' ? 'status-inactive' : 'status-behind'; const statusText = rep.status === 'on-track' ? 'On Track' : rep.status === 'inactive' ? 'Inactive' : 'Behind'; return `<tr><td>${{rep.name}}</td><td>${{rep.role}}</td><td>${{rep.deals}}</td><td>${{rep.netNew.toLocaleString()}}</td><td>${{rep.goal}}%</td><td><div class="progress-bar"><div class="progress-fill ${{progressClass}}" style="width: ${{Math.min(rep.goal, 100)}}%"></div></div></td><td>${{rep.gross.toLocaleString()}}</td><td>${{rep.earnings.toLocaleString()}}</td><td><span class="status-badge ${{statusClass}}">${{statusText}}</span></td></tr>`; }}).join(''); }}
        function initCharts() {{ repArrChart = new Chart(document.getElementById('repArrChart'), {{ type: 'bar', data: {{ labels: [], datasets: [{{ label: 'Net New ARR', data: [], backgroundColor: [], borderRadius: 6 }}] }}, options: {{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: {{ legend: {{ display: false }} }}, scales: {{ x: {{ beginAtZero: true, ticks: {{ callback: v => '$' + (v / 1000) + 'K' }} }} }} }} }}); attainmentChart = new Chart(document.getElementById('attainmentChart'), {{ type: 'bar', data: {{ labels: [], datasets: [{{ label: '% to Goal', data: [], backgroundColor: [], borderRadius: 6 }}] }}, options: {{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: {{ legend: {{ display: false }} }}, scales: {{ x: {{ beginAtZero: true, max: 120, ticks: {{ callback: v => v + '%' }} }} }} }} }}); dealsChart = new Chart(document.getElementById('dealsChart'), {{ type: 'bar', data: {{ labels: [], datasets: [{{ label: 'Deals', data: [], backgroundColor: '#6366f1', borderRadius: 6 }}] }}, options: {{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: {{ legend: {{ display: false }} }}, scales: {{ x: {{ beginAtZero: true }} }} }} }}); earningsChart = new Chart(document.getElementById('earningsChart'), {{ type: 'bar', data: {{ labels: [], datasets: [{{ label: 'Earnings', data: [], backgroundColor: '#10b981', borderRadius: 6 }}] }}, options: {{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: {{ legend: {{ display: false }} }}, scales: {{ x: {{ beginAtZero: true, ticks: {{ callback: v => '$' + (v / 1000) + 'K' }} }} }} }} }}); }}
        function updateCharts(data) {{ const sorted = [...data].sort((a, b) => b.netNew - a.netNew); const labels = sorted.map(r => r.name.split(' ')[0] + ' ' + r.name.split(' ')[1][0] + '.'); const arrColors = sorted.map(r => r.goal >= 90 ? '#10b981' : r.goal >= 50 ? '#f59e0b' : '#ef4444'); repArrChart.data.labels = labels; repArrChart.data.datasets[0].data = sorted.map(r => r.netNew); repArrChart.data.datasets[0].backgroundColor = arrColors; repArrChart.update(); attainmentChart.data.labels = labels; attainmentChart.data.datasets[0].data = sorted.map(r => r.goal); attainmentChart.data.datasets[0].backgroundColor = arrColors; attainmentChart.update(); dealsChart.data.labels = labels; dealsChart.data.datasets[0].data = sorted.map(r => r.deals); dealsChart.update(); earningsChart.data.labels = labels; earningsChart.data.datasets[0].data = sorted.map(r => r.earnings); earningsChart.update(); }}
    </script>
</body>
</html>'''

    return html


def main():
    parser = argparse.ArgumentParser(description='Update commission dashboard from Excel')
    parser.add_argument('--preview', action='store_true', help='Preview only, do not push to GitHub')
    parser.add_argument('--excel', type=str, default=str(DEFAULT_EXCEL), help='Path to Excel file')
    args = parser.parse_args()

    excel_path = Path(args.excel)
    if not excel_path.exists():
        print(f"Error: Excel file not found: {excel_path}")
        sys.exit(1)

    # Read data
    data = read_dashboard_data(excel_path)
    print(f"Found {len(data['reps'])} reps, {len(data['monthly'])} months of data")

    # Generate HTML
    html = generate_html(data)

    # Write HTML
    script_dir = Path(__file__).parent
    html_path = script_dir / 'index.html'
    html_path.write_text(html)
    print(f"Dashboard updated: {html_path}")

    if args.preview:
        print("Preview mode - opening in browser...")
        subprocess.run(['open', str(html_path)])
    else:
        # Git commit and push
        print("Committing and pushing to GitHub...")
        subprocess.run(['git', 'add', 'index.html'], cwd=script_dir)
        subprocess.run(['git', 'commit', '-m', f'Update dashboard data - {datetime.now().strftime("%Y-%m-%d %H:%M")}'], cwd=script_dir)
        subprocess.run(['git', 'push'], cwd=script_dir)
        print("Done! Dashboard will update at: https://elijahdiaz-ux.github.io/commissions-dashboard/")


if __name__ == '__main__':
    main()
