import PageShell from '../components/PageShell.jsx';

export default function MasterGroupsPage() {
  return (
    <PageShell
      title="Master Groups"
      description="Group and classify accounts, transactions, or customer segments with a dedicated master data page."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">This page makes it easy to add, edit, and remove group-level definitions without changing app navigation.</p>
      </div>
    </PageShell>
  );
}
