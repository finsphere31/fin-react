import PageShell from '../components/PageShell.jsx';

export default function MasterAccountsPage() {
  return (
    <PageShell
      title="Master Accounts"
      description="Use the master data section to manage core account types and system-wide categories."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Build reusable master data components and keep the data layer separate from page rendering.</p>
      </div>
    </PageShell>
  );
}
