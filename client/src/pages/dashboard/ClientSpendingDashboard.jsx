import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, FileCheck, Clock, ArrowLeft } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useContracts } from '../../hooks/useContracts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLOR = {
  Active:     '#0d9488',
  InProgress: '#0ea5e9',
  Completed:  '#6366f1',
  Terminated: '#f43f5e',
  Pending:    '#f59e0b',
};

const fmt = (n) =>
  '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function ClientSpendingDashboard() {
  const { contracts, fetchContracts, isLoading } = useContracts();

  useEffect(() => {
    fetchContracts({ page: 1, pageSize: 200 });
  }, [fetchContracts]);

  const stats = useMemo(() => {
    const items = contracts.items;
    const total     = items.reduce((s, c) => s + (c.agreedPrice ?? 0), 0);
    const completed = items.filter(c => c.status === 'Completed').reduce((s, c) => s + (c.agreedPrice ?? 0), 0);
    const active    = items.filter(c => c.status === 'Active' || c.status === 'InProgress').reduce((s, c) => s + (c.agreedPrice ?? 0), 0);
    const avg       = items.length ? total / items.length : 0;
    return { total, completed, active, avg, count: items.length };
  }, [contracts.items]);

  const monthlyData = useMemo(() => {
    const map = {};
    contracts.items.forEach(c => {
      const d = c.start_Date ? new Date(c.start_Date) : null;
      if (!d || isNaN(d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, amount: 0, sort: d.getTime() };
      map[key].amount += c.agreedPrice ?? 0;
    });
    return Object.values(map).sort((a, b) => a.sort - b.sort).slice(-7);
  }, [contracts.items]);

  const statusData = useMemo(() => {
    const map = {};
    contracts.items.forEach(c => {
      const s = c.status ?? 'Unknown';
      map[s] = (map[s] ?? 0) + (c.agreedPrice ?? 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [contracts.items]);

  const topFreelancers = useMemo(() => {
    const map = {};
    contracts.items.forEach(c => {
      const name = c.freelancerName ?? 'Unknown';
      map[name] = (map[name] ?? 0) + (c.agreedPrice ?? 0);
    });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [contracts.items]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900">Spending Dashboard</h1>
            <p className="text-[11px] text-slate-400">Lifetime · all contracts</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Spent',      value: fmt(stats.total),     Icon: DollarSign,  color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
            { label: 'Completed Value',  value: fmt(stats.completed), Icon: FileCheck,   color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
            { label: 'In Progress',      value: fmt(stats.active),    Icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
            { label: 'Avg per Contract', value: fmt(stats.avg),       Icon: TrendingUp,  color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200' },
          ].map(({ label, value, Icon, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white border ${border}`}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{stats.count} contract{stats.count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Monthly spend bar chart */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">Monthly Spend</h2>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">No contract data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthlyData} barSize={32} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                    width={42}
                  />
                  <Tooltip
                    formatter={v => [`$${Number(v).toLocaleString()}`, 'Spent']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* By status donut */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">By Status</h2>
            {statusData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={statusData} dataKey="value"
                    cx="50%" cy="45%"
                    innerRadius={52} outerRadius={78}
                    paddingAngle={3}
                  >
                    {statusData.map(entry => (
                      <Cell key={entry.name} fill={STATUS_COLOR[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle" iconSize={7}
                    formatter={v => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>}
                  />
                  <Tooltip
                    formatter={v => [`$${Number(v).toLocaleString()}`, 'Spent']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top freelancers by spend */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">Top Freelancers by Spend</h2>
          {topFreelancers.length === 0 ? (
            <p className="text-sm text-slate-400">No contracts yet.</p>
          ) : (
            <div className="space-y-4">
              {topFreelancers.map((f, i) => {
                const pct = stats.total > 0 ? (f.amount / stats.total) * 100 : 0;
                return (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="w-5 text-[11px] font-bold text-slate-300 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-700 truncate">{f.name}</span>
                        <span className="font-bold text-teal-600 ml-2 flex-shrink-0">{fmt(f.amount)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 w-9 text-right flex-shrink-0">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contracts table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">All Contracts</h2>
            <span className="text-[11px] text-slate-400">{stats.count} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left font-semibold">Project</th>
                  <th className="px-5 py-3 text-left font-semibold">Freelancer</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Start</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {contracts.items.slice(0, 10).map(c => (
                  <tr key={c.contractID} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800 max-w-[160px] truncate">{c.projectTitle || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{c.freelancerName || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        c.status === 'Completed'   ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : c.status === 'Active' || c.status === 'InProgress' ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : c.status === 'Terminated' ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {c.start_Date ? new Date(c.start_Date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-teal-600">{fmt(c.agreedPrice ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contracts.items.length > 10 && (
            <div className="px-5 py-3 border-t border-slate-100 text-center">
              <Link to="/contracts" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                View all {contracts.items.length} contracts →
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}