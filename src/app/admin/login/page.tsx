'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type LoginMode = 'admin' | 'radnik';

export default function AdminLoginPage() {
  const [mode, setMode] = useState<LoginMode>('admin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const loginEmail = mode === 'radnik'
      ? `${username.toLowerCase().replace(/\s+/g, '')}@staff.internal`
      : email;

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      setError(
        mode === 'radnik'
          ? 'Pogrešno korisničko ime ili lozinka'
          : 'Pogrešan email ili lozinka'
      );
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">SV</span>
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-montserrat)]">
            {mode === 'admin' ? 'Admin Panel' : 'Radnik Panel'}
          </h1>
          <p className="text-text-secondary mt-1">Prijavite se za pristup</p>
        </div>

        <div className="flex bg-bg-card border border-border rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('admin'); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'admin' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => { setMode('radnik'); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'radnik' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Radnik
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'admin' ? (
            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg focus:outline-none focus:border-accent text-text-primary"
                placeholder="admin@svcars.ba"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-text-secondary mb-1">Korisničko ime</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg focus:outline-none focus:border-accent text-text-primary"
                placeholder="korisnicko_ime"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1">Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-lg focus:outline-none focus:border-accent text-text-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Prijava...' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  );
}
