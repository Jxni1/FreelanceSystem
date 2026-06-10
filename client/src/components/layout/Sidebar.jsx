import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Briefcase,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart2,
  Search,
  Send,
  Wallet,
  User,
  Shield,
  Tag,
  Settings,
  ScrollText,
  Cpu,
  Eye,
  Flag,
  Banknote,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useProfileContext } from '../../context/ProfileContext';
import { DEMO_NAV_BADGES } from '../../data/dashboardDemoData';
import { Avatar } from '../ui/Avatar';

const NAV = {
  client: {
    settingsTo: '/profile/edit',
    sections: [
      {
        label: 'Workspace',
        items: [
          { label: 'Dashboard', icon: LayoutGrid, to: '/home', end: true },
          { label: 'My job posts', icon: Briefcase, to: '/projects', badgeKey: 'jobPosts' },
          { label: 'Proposals', icon: Send, to: '/proposals', badgeKey: 'proposals' },
          { label: 'Find talent', icon: Users, to: '/freelancers' },
          { label: 'Contracts', icon: FileText, to: '/contracts' },
          { label: 'Messages', icon: MessageSquare, to: '/inbox', badgeKey: 'inbox' },
          { label: 'Review', icon: Briefcase, to: '/reviews' },
        ],
      },
      {
        label: 'Account',
        items: [
          { label: 'Billing', icon: CreditCard, to: '/spending' },
          { label: 'Reports', icon: BarChart2, disabled: true },
        ],
      },
    ],
  },

  freelancer: {
    settingsTo: '/profile/edit',
    sections: [
      {
        label: 'Workspace',
        items: [
          { label: 'Dashboard', icon: LayoutGrid, to: '/home', end: true },
          { label: 'Find work', icon: Search, to: '/discover' },
          { label: 'My proposals', icon: Send, to: '/my-work', badgeKey: 'proposals' },
          { label: 'Contracts', icon: FileText, to: '/contracts' },
          { label: 'Messages', icon: MessageSquare, to: '/inbox', badgeKey: 'inbox' },
        ],
      },
      {
        label: 'Account',
        items: [
          { label: 'Earnings', icon: Wallet, to: '/payouts' },
          { label: 'My profile', icon: User, to: '/profile' },
        ],
      },
    ],
  },

  admin: {
    settingsTo: '/admin/settings',
    sections: [
      {
        label: 'Overview',
        items: [
          { label: 'Dashboard', icon: LayoutGrid, to: '/admin', end: true },
          { label: 'Moderation', icon: Shield, to: '/admin/reports', badgeKey: 'moderation' },
        ],
      },
      {
        label: 'Manage',
        items: [
          { label: 'Job posts', icon: Briefcase, to: '/admin/projects' },
          { label: 'Users', icon: Users, to: '/admin/users' },
          { label: 'Contracts', icon: FileText, to: '/admin/contracts' },
          { label: 'Categories', icon: Tag, to: '/admin/categories' },
          { label: 'Audit logs', icon: ScrollText, to: '/admin/audit-logs' },
          { label: 'ML model', icon: Cpu, to: '/admin/ai-test' },
          { label: 'Protected views', icon: Eye, to: '/admin/protected-views' },
          { label: 'Disputes', icon: Flag, disabled: true, badgeKey: 'disputes' },
          { label: 'Payouts', icon: Banknote, disabled: true },
          { label: 'Skills', icon: Tag, to: '/admin/skills' },
        ],
      },
    ],
  },
};

function CountBadge({ value }) {
  if (!value) return null;

  return (
    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1.5 text-xs font-bold text-white">
      {value > 99 ? '99+' : value}
    </span>
  );
}

function NavRow({ item, badges, onNavigate }) {
  const { icon: Icon, label, badgeKey, disabled, to, end } = item;
  const badge = badgeKey ? badges[badgeKey] : 0;

  if (disabled) {
    return (
      <div
        className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400"
        aria-disabled="true"
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
        <CountBadge value={badge} />
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-800'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-5 w-5 shrink-0 ${isActive ? 'text-brand-700' : 'text-slate-400'}`}
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
          <CountBadge value={badge} />
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ open = false, onClose, inboxUnread = 0 }) {
  const { logout } = useAuth();
  const { isAdmin, isFreelancer } = useAuthorization();
  const { profile } = useProfileContext();

  const role = isAdmin ? 'admin' : isFreelancer ? 'freelancer' : 'client';
  const config = NAV[role];

  const badges = {
    inbox: inboxUnread,
    jobPosts: DEMO_NAV_BADGES.clientJobPosts,
    proposals: isFreelancer ? DEMO_NAV_BADGES.freelancerProposals : undefined,
    moderation: DEMO_NAV_BADGES.adminModeration,
    disputes: DEMO_NAV_BADGES.adminDisputes,
  };

  const fullName = profile ? `${profile.name ?? ''} ${profile.surname ?? ''}`.trim() : '';
  const displayName = fullName || profile?.username || 'Your account';

  const subtitle =
    role === 'admin'
      ? 'Trust & Safety'
      : role === 'freelancer'
        ? profile?.freelancerProfile?.experienceLevel
          ? `${profile.freelancerProfile.experienceLevel} freelancer`
          : 'Freelancer'
        : profile?.clientProfile?.industry || 'Client';

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-base font-bold text-white">
            K
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">Knack</span>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {config.sections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <p className="px-3 font-schibsted text-xs font-semibold uppercase tracking-wider text-muted">
                {section.label}
              </p>

              {section.items.map((item, index) => (
                <NavRow
                  key={`${section.label}-${item.to ?? item.label}-${index}`}
                  item={item}
                  badges={badges}
                  onNavigate={onClose}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-3 py-3">
          <NavLink
            to={config.settingsTo}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')
            }
          >
            <Settings className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <span>Settings</span>
          </NavLink>

          <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2">
            <Avatar name={displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{subtitle}</p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;