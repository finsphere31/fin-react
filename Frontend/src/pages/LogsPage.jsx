import PageShell from '../components/PageShell.jsx';

export default function LogsPage() {
  return (
    <PageShell
      title="Logs"
      description="Review audit trails, system events, and operational activity from one maintainable page."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Add filters and table components here to deliver a full logging experience without changing page structure.</p>
      </div>
    </PageShell>
  );
}
