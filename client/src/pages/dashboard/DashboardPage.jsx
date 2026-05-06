import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const STAT_CARDS = [
  {
    label: 'Active projects',
    value: '3',
    hint: '+1 this week',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Open contracts',
    value: '2',
    hint: '1 awaiting approval',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    label: 'Unread messages',
    value: '5',
    hint: 'Respond to freelancers',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
];

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="px-6 py-8 max-w-7xl mx-auto text-slate-100">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Client Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Plan projects, review freelancers, and keep everything in one cozy place.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">All systems operational</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Small stats row */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-sm shadow-slate-900/40"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {s.label}
                </p>
                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.color}`}>
                  Live
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-50 tabular-nums">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{s.hint}</p>
            </div>
          ))}
        </section>

        {/* Main cards */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Projects */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 shadow-md shadow-slate-900/60">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-500/10 blur-2xl" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300 text-xl">
                    📦
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-50">
                      Projects
                    </h3>
                    <p className="text-xs text-slate-400">
                      Plan work and track progress.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                  Client view
                </span>
              </div>

              <p className="text-sm text-slate-300">
                Create new project briefs, invite freelancers, and keep an eye on timelines from one place.
              </p>

              <Link
                to="/projects"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
              >
                Go to Projects
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Contracts */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 shadow-md shadow-slate-900/60">
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300 text-xl">
                    📄
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-50">
                      Contracts
                    </h3>
                    <p className="text-xs text-slate-400">
                      Keep agreements clear and tidy.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                  Overview
                </span>
              </div>

              <p className="text-sm text-slate-300">
                Review contract details, check statuses, and approve work milestones with confidence.
              </p>

              <Link
                to="/admin/contracts"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
              >
                Go to Contracts
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Profile */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 shadow-md shadow-slate-900/60">
            <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 text-xl">
                  👤
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-50">
                    Profile
                  </h3>
                  <p className="text-xs text-slate-400">
                    Keep your details up to date.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300">
                Update your name, company info, and preferences so freelancers get a clear picture of who you are.
              </p>

              <Link
                to="/profile"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                View Profile
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Skills / Suggestions */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-md shadow-slate-900/60 md:col-span-2 lg:col-span-1">
            <div className="relative p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 text-xl">
                  🎯
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-50">
                    Skills & matches
                  </h3>
                  <p className="text-xs text-slate-400">
                    Explore skills and refine your brief.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300">
                Browse platform skills, refine what you are looking for, and help us match you with the right freelancers.
              </p>

              <Link
                to="/admin/skills"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
              >
                Explore Skills
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}