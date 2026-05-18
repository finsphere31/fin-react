import PageShell from '../components/PageShell.jsx';
import { Activity, Briefcase, Users, Wallet } from 'lucide-react';

const metrics = [
  { label: 'Revenue', value: '$16.4K', icon: Wallet, trend: '+18%' },
  { label: 'Customers', value: '428', icon: Users, trend: '+7%' },
  { label: 'Transactions', value: '1,248', icon: Activity, trend: '+12%' },
  { label: 'Agents', value: '24', icon: Briefcase, trend: '+3%' },
];

export default function DashboardPage() {
  return (
    <PageShell
      title="Dashboard"
      description="View the high-level performance stats for your company and navigate to every page from a professional layout."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{metric.value}</p>
                </div>
                <div className="rounded-3xl bg-indigo-50 p-3 text-indigo-600">
                  <Icon size={24} />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">Growth {metric.trend} vs last period.</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Latest activity</h3>
          <p className="mt-3 text-sm text-slate-600">Everything is organized into reusable pages so you can extend components without rewriting the full UI.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-900">New customer onboarded</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">New accounts are now tracked in the customers page and sync with your backend service.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-900">Transaction summary ready</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Ready</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">The modular page design makes it easy to add filters, charts, or export actions later.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Getting started</h3>
          <ul className="mt-6 space-y-4 text-sm text-slate-600">
            <li className="rounded-3xl bg-slate-50 p-4">1. Update the API base URL in <code className="rounded-md bg-slate-100 px-2 py-1">src/services/api.js</code>.</li>
            <li className="rounded-3xl bg-slate-50 p-4">2. Build new pages in <code className="rounded-md bg-slate-100 px-2 py-1">src/pages/</code>.</li>
            <li className="rounded-3xl bg-slate-50 p-4">3. Add backend routes to <code className="rounded-md bg-slate-100 px-2 py-1">Backend/src/routes/</code>.</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
