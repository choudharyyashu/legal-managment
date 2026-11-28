import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || 'Login failed. Please verify credentials.');
      }

      localStorage.setItem('clientPortalToken', data.data.token);
      localStorage.setItem('clientPortalUser', JSON.stringify(data.data.client));
      navigate('/portal/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-amber-400 tracking-wide">
            HEUGLY & BLUDWORTH
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">
            Attorneys at Law • Client Portal
          </p>
        </div>

        <div className="mt-8 bg-slate-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-700">
          <h2 className="text-lg font-medium text-white mb-4 text-center">
            Client Secure Access
          </h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            Log in to view your legal matters, exchange messages with your attorney, upload documents, and review invoices.
          </p>

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Client Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Portal Access Code / PIN (Optional)
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="••••••"
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Authenticating...' : 'Sign In to Client Portal'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-700 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Need assistance? Contact our Salt Lake City office at{' '}
              <span className="text-amber-400">(801) 532-7300</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ClientLogin;
