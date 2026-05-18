import PageShell from '../components/PageShell.jsx';

export default function AdjustmentsPage() {
  return (
    <PageShell
      title="Adjustments"
      description="Record financial adjustments with a dedicated workflow that keeps transaction logic separate from the core dashboard."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">This page can be extended with edit forms, approval flows, and audit logs for business controls.</p>
      </div>
    </PageShell>
  );
}
