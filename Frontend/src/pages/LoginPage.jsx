import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingButton from '../components/LoadingButton.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [connectionTested, setConnectionTested] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, testing, success, failed

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      console.log('[LoginPage] Testing backend connection...');
      const response = await fetch('http://localhost:4000/health');
      if (response.ok) {
        const data = await response.json();
        console.log('[LoginPage] Backend connection successful:', data);
        setConnectionStatus('success');
        setConnectionTested(true);
      } else {
        console.error('[LoginPage] Backend returned:', response.status);
        setConnectionStatus('failed');
      }
    } catch (err) {
      console.error('[LoginPage] Backend connection failed:', err.message);
      setConnectionStatus('failed');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      console.log('[LoginPage] Submitting login...');
      await login(form);
      console.log('[LoginPage] Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unable to sign in';
      setError(`${errorMsg}. Make sure backend is running on http://localhost:4000`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Welcome back</p>
          <h1 className="text-3xl font-semibold text-slate-900">Sign in to your workspace</h1>
          <p className="text-sm text-slate-600">Professional structure with separated pages and services.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <LoadingButton
            type="submit"
            loadingText="Signing in..."
            successMessage="Logged in successfully"
            className="w-full"
            disabled={isLoading}
          >
            Sign in
          </LoadingButton>
        </form>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Demo login</p>
            <p className="mt-2">Use any email and password for now. The backend accepts all login requests.</p>
          </div>

          <button
            type="button"
            onClick={testConnection}
            className={`w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${
              connectionStatus === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : connectionStatus === 'failed'
                  ? 'border border-rose-200 bg-rose-50 text-rose-700'
                  : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            disabled={connectionStatus === 'testing'}
          >
            {connectionStatus === 'testing' && 'Testing connection...'}
            {connectionStatus === 'idle' && '✓ Test Backend Connection'}
            {connectionStatus === 'success' && '✓ Backend is running'}
            {connectionStatus === 'failed' && '✗ Backend is not responding'}
          </button>
        </div>
      </div>
    </div>
  );
}
