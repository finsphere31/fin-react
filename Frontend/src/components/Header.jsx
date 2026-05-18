import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100">
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fin React</p>
            <h1 className="text-sm font-semibold text-slate-900">Modern finance management</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
            {user?.name || 'Guest User'}
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
