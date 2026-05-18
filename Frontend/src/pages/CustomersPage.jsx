import PageShell from '../components/PageShell.jsx';

export default function CustomersPage() {
  return (
    <PageShell
      title="Customers"
      description="Manage your customer list, review account status, and keep the database in good shape."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">This page is intentionally scaffolded for quick customization. Replace the placeholder table with a paginated customer list, search filters, and action buttons.</p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200 bg-white hover:bg-slate-50">
                <td className="px-6 py-4">Alex Johnson</td>
                <td className="px-6 py-4">alex@finreact.com</td>
                <td className="px-6 py-4">Active</td>
                <td className="px-6 py-4 text-slate-500">Edit / View</td>
              </tr>
              <tr className="border-t border-slate-200 bg-white hover:bg-slate-50">
                <td className="px-6 py-4">Ava Morgan</td>
                <td className="px-6 py-4">ava@finreact.com</td>
                <td className="px-6 py-4">Pending</td>
                <td className="px-6 py-4 text-slate-500">Edit / View</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
