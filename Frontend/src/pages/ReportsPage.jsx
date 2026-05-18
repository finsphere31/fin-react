import PageShell from '../components/PageShell.jsx';

export default function ReportsPage() {
  return (
    <PageShell
      title="Reports"
      description="Build professional finance reports here and connect them to the backend reporting API."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Use this page to render charts, export CSV, and generate summary files for stakeholders.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Profit report</p>
            <p className="mt-3 text-sm text-slate-600">Summary data and charts go here.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Cash flow report</p>
            <p className="mt-3 text-sm text-slate-600">Replace this placeholder with data-driven visualizations.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
