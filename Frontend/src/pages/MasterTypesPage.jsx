import PageShell from '../components/PageShell.jsx';

export default function MasterTypesPage() {
  return (
    <PageShell
      title="Master Types"
      description="Create and manage account types or transaction categories in one place."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Use this page to keep every master data object in a modular format for future upgrades.</p>
      </div>
    </PageShell>
  );
}
