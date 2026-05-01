'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '../AuthContext';
import type { StaffProfile } from '@/types';
import { Plus, UserCheck, UserX, KeyRound, X } from 'lucide-react';

export default function RadniciPage() {
  const { role } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [workers, setWorkers] = useState<(StaffProfile & { reservation_count: number; total_revenue: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '',
    display_name: '',
    password: '',
  });

  useEffect(() => {
    if (role === 'radnik') {
      router.push('/admin');
      return;
    }
    loadWorkers();
  }, [role, router]);

  if (role === 'radnik') return null;

  async function loadWorkers() {
    setLoading(true);

    const { data: profiles } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('role', 'radnik')
      .order('created_at', { ascending: false });

    if (!profiles) {
      setWorkers([]);
      setLoading(false);
      return;
    }

    const workerIds = profiles.map((p) => p.id);

    let counts: Record<string, number> = {};
    let revenues: Record<string, number> = {};
    if (workerIds.length > 0) {
      const { data: reservations } = await supabase
        .from('reservations')
        .select('created_by_staff, total_price, status')
        .in('created_by_staff', workerIds);

      if (reservations) {
        for (const r of reservations) {
          if (r.created_by_staff) {
            counts[r.created_by_staff] = (counts[r.created_by_staff] || 0) + 1;
            if (r.status !== 'cancelled') {
              revenues[r.created_by_staff] = (revenues[r.created_by_staff] || 0) + (r.total_price || 0);
            }
          }
        }
      }
    }

    setWorkers(
      profiles.map((p) => ({
        ...p,
        reservation_count: counts[p.id] || 0,
        total_revenue: revenues[p.id] || 0,
      }))
    );
    setLoading(false);
  }

  async function handleCreateWorker(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.display_name || !form.password) return;
    setSaving(true);
    setError('');

    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Greška pri kreiranju');
      setSaving(false);
      return;
    }

    setShowForm(false);
    setForm({ username: '', display_name: '', password: '' });
    setSaving(false);
    loadWorkers();
  }

  async function toggleActive(id: string, currentActive: boolean) {
    await fetch('/api/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !currentActive }),
    });
    loadWorkers();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetPasswordId || !newPassword) return;
    setSaving(true);
    setError('');

    const res = await fetch('/api/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resetPasswordId, password: newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Greška');
      setSaving(false);
      return;
    }

    setResetPasswordId(null);
    setNewPassword('');
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)]">Radnici</h1>
        <button
          onClick={() => { setShowForm(true); setError(''); }}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Dodaj radnika</span>
          <span className="sm:hidden">Dodaj</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Učitavanje...</div>
      ) : workers.length === 0 ? (
        <div className="text-center py-12 text-text-muted bg-bg-card border border-border rounded-xl">
          Nema radnika. Dodajte prvog radnika.
        </div>
      ) : (
        <div className="space-y-4">
          {workers.map((w) => (
            <div key={w.id} className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-base sm:text-lg font-semibold">{w.display_name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    w.is_active
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {w.is_active ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Korisničko ime: <span className="font-medium text-text-primary">{w.username}</span>
                </p>
                <p className="text-sm text-text-secondary">
                  Rezervacija: <span className="font-medium text-text-primary">{w.reservation_count}</span>
                  {' · '}
                  Zarada: <span className="font-medium text-green-400">{w.total_revenue.toLocaleString()} KM</span>
                  {' · '}
                  Dodan: {new Date(w.created_at).toLocaleDateString('hr-HR')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setResetPasswordId(w.id); setNewPassword(''); setError(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-card-hover border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
                  title="Resetuj lozinku"
                >
                  <KeyRound size={14} />
                  <span className="hidden sm:inline">Lozinka</span>
                </button>
                <button
                  onClick={() => toggleActive(w.id, w.is_active)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    w.is_active
                      ? 'text-red-400 border-red-500/20 hover:bg-red-500/10'
                      : 'text-green-400 border-green-500/20 hover:bg-green-500/10'
                  }`}
                >
                  {w.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                  <span className="hidden sm:inline">{w.is_active ? 'Deaktiviraj' : 'Aktiviraj'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Worker Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-bg-primary border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">Novi radnik</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:text-accent transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-text-secondary mb-1">Korisničko ime *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                  placeholder="npr. marko"
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Ime i prezime *</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
                  required
                  placeholder="npr. Marko Markić"
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Lozinka *</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  placeholder="Najmanje 6 znakova"
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors text-sm font-bold disabled:opacity-50"
                >
                  {saving ? 'Kreiranje...' : 'Kreiraj radnika'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-bg-primary border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">Resetuj lozinku</h2>
              <button onClick={() => setResetPasswordId(null)} className="p-1 hover:text-accent transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-text-secondary mb-1">Nova lozinka *</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Najmanje 6 znakova"
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors text-sm font-bold disabled:opacity-50"
                >
                  {saving ? 'Spremam...' : 'Spremi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
