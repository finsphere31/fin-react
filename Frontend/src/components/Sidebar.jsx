import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  Briefcase,
  ShieldCheck,
  Settings,
  FolderTree,
  Activity,
  BarChart3,
} from 'lucide-react';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Transactions', to: '/transactions', icon: FileText },
  { label: 'Agents', to: '/agents', icon: Briefcase },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Logs', to: '/logs', icon: Activity },
  { label: 'Master Data', to: '/master/accounts', icon: FolderTree },
  { label: 'Admin', to: '/admin', icon: ShieldCheck },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col gap-6 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Navigation</p>
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Pro structure</p>
          <p className="mt-2 leading-6">Easy-to-edit pages, clean routes, and reusable UI components for fast iteration.</p>
        </div>
      </div>
    </aside>
  );
}
