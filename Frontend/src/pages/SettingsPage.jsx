import PageShell from '../components/PageShell.jsx';
import LoadingButton from '../components/LoadingButton.jsx';

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Configure your company profile, API integrations, and user settings in a maintainable layout."
      actions={<LoadingButton onClick={() => {}} successMessage="Settings saved">Save changes</LoadingButton>}
    >
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Company profile</h3>
            <p className="mt-2 text-sm text-slate-600">Update your company name, timezone, and contact details from this section.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Application settings</h3>
            <p className="mt-2 text-sm text-slate-600">Create modular form components for each settings area to keep the page easy to extend.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
