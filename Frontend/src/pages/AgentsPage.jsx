import PageShell from '../components/PageShell.jsx';

export default function AgentsPage() {
  return (
    <PageShell
      title="Agents"
      description="Manage agent profiles, assign accounts, and keep internal operations clean and maintainable."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Start by splitting agent management into create/update forms, assignment panels, and summary cards.</p>
        <div className="mt-8 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Agent list placeholder</p>
            <p className="mt-2 text-sm text-slate-600">You can replace this section with a real list view and actions such as edit, deactivate, or assign customers.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Agent count</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">24</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Assigned accounts</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">112</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
