export default function PageShell({ title, description, children, actions }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Page</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </header>
      <section className="space-y-6">{children}</section>
    </div>
  );
}
