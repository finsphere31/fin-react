import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/40">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Page not found</p>
        <h1 className="mt-4 text-5xl font-semibold text-slate-900">404</h1>
        <p className="mt-4 text-lg text-slate-600">The page you’re looking for doesn’t exist or has been moved.</p>
        <Link to="/dashboard" className="mt-8 inline-flex rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
