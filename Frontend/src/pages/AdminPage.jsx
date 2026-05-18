import PageShell from '../components/PageShell.jsx';

export default function AdminPage() {
  return (
    <PageShell
      title="Admin Panel"
      description="This page is the central hub for tenant administration and high-level configuration."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Separate administration workflows from the standard user experience. This page is a great place for company, agent, and permission controls.</p>
      </div>
    </PageShell>
  );
}
