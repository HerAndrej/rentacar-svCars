'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import {
  DollarSign, TrendingUp, CalendarCheck, Car, Users,
  ArrowUpRight, ArrowDownRight, BarChart3, Download,
} from 'lucide-react';
import { downloadCSV } from '@/lib/export-csv';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

type Period = '7d' | '30d' | '90d' | '365d' | 'all';
type Reservation = {
  id: string;
  status: string;
  source: string;
  total_price: number | null;
  pickup_date: string;
  return_date: string;
  created_at: string;
  vehicle: { name: string; category: string } | null;
};

const periodLabels: Record<Period, string> = {
  '7d': '7 dana',
  '30d': '30 dana',
  '90d': '90 dana',
  '365d': 'Godina',
  all: 'Sve',
};

const sourceLabels: Record<string, string> = {
  website: 'Web stranica',
  instagram_dm: 'Instagram DM',
  whatsapp: 'WhatsApp',
  phone: 'Telefon',
};

const statusLabels: Record<string, { text: string; class: string }> = {
  pending: { text: 'Na čekanju', class: 'bg-yellow-500/10 text-yellow-400' },
  confirmed: { text: 'Potvrđena', class: 'bg-green-500/10 text-green-400' },
  completed: { text: 'Završena', class: 'bg-blue-500/10 text-blue-400' },
  cancelled: { text: 'Otkazana', class: 'bg-red-500/10 text-red-400' },
};

export default function AnalyticsPage() {
  const { role } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');
  const supabase = createClient();

  useEffect(() => {
    if (role === 'radnik') {
      router.push('/admin');
    }
  }, [role, router]);

  if (role === 'radnik') return null;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data } = await supabase
      .from('reservations')
      .select('id, status, source, total_price, pickup_date, return_date, created_at, vehicle:vehicles(name, category)')
      .order('created_at', { ascending: false });
    const mapped = (data || []).map((r) => ({
      ...r,
      vehicle: Array.isArray(r.vehicle) ? r.vehicle[0] || null : r.vehicle,
    }));
    setReservations(mapped);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (period === 'all') return reservations;
    const days = parseInt(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return reservations.filter((r) => new Date(r.created_at) >= cutoff);
  }, [reservations, period]);

  const prevFiltered = useMemo(() => {
    if (period === 'all') return [];
    const days = parseInt(period);
    const cutoffStart = new Date();
    cutoffStart.setDate(cutoffStart.getDate() - days * 2);
    const cutoffEnd = new Date();
    cutoffEnd.setDate(cutoffEnd.getDate() - days);
    return reservations.filter(
      (r) => new Date(r.created_at) >= cutoffStart && new Date(r.created_at) < cutoffEnd
    );
  }, [reservations, period]);

  const stats = useMemo(() => {
    const earned = filtered
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.total_price || 0), 0);
    const prevEarned = prevFiltered
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.total_price || 0), 0);

    const completed = filtered.filter((r) => r.status === 'completed');
    const total = filtered.length;
    const prevTotal = prevFiltered.length;
    const cancelled = filtered.filter((r) => r.status === 'cancelled').length;

    const avgValue = completed.length > 0
      ? Math.round(completed.reduce((s, r) => s + (r.total_price || 0), 0) / completed.length)
      : 0;

    const totalDays = completed.reduce((sum, r) => {
      const diff = Math.ceil(
        (new Date(r.return_date).getTime() - new Date(r.pickup_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + diff;
    }, 0);
    const avgDays = completed.length > 0 ? (totalDays / completed.length).toFixed(1) : '0';

    const revenueChange = prevEarned > 0 ? Math.round(((earned - prevEarned) / prevEarned) * 100) : 0;
    const bookingChange = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;

    return { earned, total, completed: completed.length, cancelled, avgValue, avgDays, revenueChange, bookingChange };
  }, [filtered, prevFiltered]);

  const sourceBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    filtered.filter((r) => r.status !== 'cancelled').forEach((r) => {
      if (!map[r.source]) map[r.source] = { count: 0, revenue: 0 };
      map[r.source].count++;
      map[r.source].revenue += r.total_price || 0;
    });
    return Object.entries(map)
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  const vehicleBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    filtered.filter((r) => r.status !== 'cancelled' && r.vehicle).forEach((r) => {
      const name = r.vehicle!.name;
      if (!map[name]) map[name] = { count: 0, revenue: 0 };
      map[name].count++;
      map[name].revenue += r.total_price || 0;
    });
    return Object.entries(map)
      .map(([vehicle, data]) => ({ vehicle, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => {
      map[r.status] = (map[r.status] || 0) + 1;
    });
    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    reservations
      .filter((r) => r.status !== 'cancelled')
      .forEach((r) => {
        const month = r.created_at.substring(0, 7);
        map[month] = (map[month] || 0) + (r.total_price || 0);
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('hr-HR', { month: 'short', year: '2-digit' }),
        revenue,
      }));
  }, [reservations]);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  if (loading) {
    return (
      <div className="text-center py-20 text-text-muted">Učitavanje analitike...</div>
    );
  }

  function exportAnalytics() {
    const headers = ['Datum', 'Kupac', 'Vozilo', 'Izvor', 'Status', 'Cijena (KM)', 'Preuzimanje', 'Povrat'];
    const rows = filtered.map((r) => [
      new Date(r.created_at).toLocaleDateString('hr-HR'),
      '',
      r.vehicle?.name || '',
      sourceLabels[r.source] || r.source,
      statusLabels[r.status]?.text || r.status,
      String(r.total_price || 0),
      r.pickup_date,
      r.return_date,
    ]);
    downloadCSV(`analitika-${period}`, headers, rows);
  }

  function exportSummary() {
    const headers = ['Metrika', 'Vrijednost'];
    const rows = [
      ['Period', periodLabels[period]],
      ['Ukupna zarada (KM)', String(stats.earned)],
      ['Ukupno rezervacija', String(stats.total)],
      ['Završene', String(stats.completed)],
      ['Otkazane', String(stats.cancelled)],
      ['Prosječna vrijednost (KM)', String(stats.avgValue)],
      ['Prosječno trajanje (dana)', String(stats.avgDays)],
      ['Stopa završetka (%)', String(stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0)],
      ['Stopa otkazivanja (%)', String(stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0)],
      ...sourceBreakdown.map((s) => [`Izvor: ${sourceLabels[s.source] || s.source}`, `${s.revenue} KM (${s.count}x)`]),
      ...vehicleBreakdown.map((v) => [`Vozilo: ${v.vehicle}`, `${v.revenue} KM (${v.count}x)`]),
    ];
    downloadCSV(`izvjestaj-${period}`, headers, rows);
  }

  function ChangeIndicator({ value }: { value: number }) {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(value)}%
      </span>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)]">Analitika</h1>
          <div className="flex gap-1">
            <button
              onClick={exportAnalytics}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-bg-card border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
              title="Export podataka"
            >
              <Download size={14} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={exportSummary}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-bg-card border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
              title="Export izvještaja"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Izvještaj</span>
            </button>
          </div>
        </div>
        <div className="flex gap-1 bg-bg-card border border-border rounded-lg p-1 overflow-x-auto">
          {(Object.entries(periodLabels) as [Period, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                period === key
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI kartice */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-1">
            <DollarSign size={18} className="text-green-400" />
            <ChangeIndicator value={stats.revenueChange} />
          </div>
          <p className="text-xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] mt-2 sm:mt-3">{stats.earned.toLocaleString()} <span className="text-sm sm:text-lg text-text-secondary">KM</span></p>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Ukupna zarada</p>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-1">
            <CalendarCheck size={18} className="text-blue-400" />
            <ChangeIndicator value={stats.bookingChange} />
          </div>
          <p className="text-xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] mt-2 sm:mt-3">{stats.total}</p>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Ukupno rezervacija</p>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
          <TrendingUp size={18} className="text-accent" />
          <p className="text-xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] mt-2 sm:mt-3">{stats.avgValue} <span className="text-sm sm:text-lg text-text-secondary">KM</span></p>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Prosječna vrijednost</p>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
          <Car size={18} className="text-purple-400" />
          <p className="text-xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] mt-2 sm:mt-3">{stats.avgDays} <span className="text-sm sm:text-lg text-text-secondary">dana</span></p>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Prosječno trajanje</p>
        </div>
      </div>

      {/* Grafikon prihoda po mjesecima */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <BarChart3 size={20} className="text-accent" />
          <h2 className="text-base sm:text-lg font-bold font-[family-name:var(--font-montserrat)]">Prihod po mjesecima</h2>
        </div>
        <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-48">
          {monthlyRevenue.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-text-secondary font-medium">{m.revenue.toLocaleString()}</span>
              <div
                className="w-full bg-accent/80 rounded-t-md hover:bg-accent transition-colors"
                style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-xs text-text-muted">{m.month}</span>
            </div>
          ))}
          {monthlyRevenue.length === 0 && (
            <div className="w-full text-center text-text-muted py-12">Nema podataka</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
        {/* Izvor rezervacija */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-[family-name:var(--font-montserrat)] mb-4">
            <Users size={18} className="inline mr-2 text-text-secondary" />
            Po izvoru
          </h2>
          {sourceBreakdown.length === 0 ? (
            <p className="text-text-muted text-sm">Nema podataka</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map((s) => {
                const totalRev = sourceBreakdown.reduce((sum, x) => sum + x.revenue, 0);
                const pct = totalRev > 0 ? Math.round((s.revenue / totalRev) * 100) : 0;
                return (
                  <div key={s.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{sourceLabels[s.source] || s.source}</span>
                      <span className="text-sm text-text-secondary">{s.revenue.toLocaleString()} KM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status raspodjela */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-[family-name:var(--font-montserrat)] mb-4">
            <CalendarCheck size={18} className="inline mr-2 text-text-secondary" />
            Po statusu
          </h2>
          {statusBreakdown.length === 0 ? (
            <p className="text-text-muted text-sm">Nema podataka</p>
          ) : (
            <div className="space-y-3">
              {statusBreakdown.map((s) => {
                const label = statusLabels[s.status] || { text: s.status, class: '' };
                const pct = filtered.length > 0 ? Math.round((s.count / filtered.length) * 100) : 0;
                return (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${label.class}`}>
                        {label.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{s.count}</span>
                      <span className="text-xs text-text-muted w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top vozila */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-[family-name:var(--font-montserrat)] mb-4">
            <Car size={18} className="inline mr-2 text-text-secondary" />
            Top vozila
          </h2>
          {vehicleBreakdown.length === 0 ? (
            <p className="text-text-muted text-sm">Nema podataka</p>
          ) : (
            <div className="space-y-3">
              {vehicleBreakdown.slice(0, 5).map((v, i) => (
                <div key={v.vehicle} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-5">{i + 1}.</span>
                    <span className="text-sm font-medium truncate max-w-[140px]">{v.vehicle}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{v.revenue.toLocaleString()} KM</span>
                    <span className="text-xs text-text-muted ml-2">({v.count}x)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stopa konverzije/otkazivanja */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 text-center">
          <p className="text-2xl sm:text-4xl font-bold font-[family-name:var(--font-montserrat)] text-green-400">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </p>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 sm:mt-2">Završetak</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 text-center">
          <p className="text-2xl sm:text-4xl font-bold font-[family-name:var(--font-montserrat)] text-red-400">
            {stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0}%
          </p>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 sm:mt-2">Otkazivanje</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 text-center">
          <p className="text-2xl sm:text-4xl font-bold font-[family-name:var(--font-montserrat)] text-accent">
            {stats.total > 0 ? Math.round(stats.earned / Math.max(stats.completed, 1)) : 0}
          </p>
          <p className="text-text-secondary text-xs sm:text-sm mt-1 sm:mt-2">KM/završena</p>
        </div>
      </div>
    </div>
  );
}
