import PageShell from '../components/PageShell.jsx';

export default function TransactionsPage() {
  return (
    <PageShell
      title="Transactions"
      description="Track your ledger entries, review transaction history, and export data for reporting."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">A professional transaction page helps separate concerns: filters, table, and action tools should each live in their own component.</p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200 bg-white hover:bg-slate-50">
                <td className="px-6 py-4">2026-05-18</td>
                <td className="px-6 py-4">TXN-12345</td>
                <td className="px-6 py-4">$2,400.00</td>
                <td className="px-6 py-4">Settled</td>
              </tr>
              <tr className="border-t border-slate-200 bg-white hover:bg-slate-50">
                <td className="px-6 py-4">2026-05-17</td>
                <td className="px-6 py-4">TXN-12344</td>
                <td className="px-6 py-4">$530.00</td>
                <td className="px-6 py-4">Pending</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
