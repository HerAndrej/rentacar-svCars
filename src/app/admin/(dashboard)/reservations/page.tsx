'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Reservation } from '@/types';
import { Phone, Mail, Calendar, MapPin, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/export-csv';

const statusOptions = [
  { value: 'pending', label: 'Na čekanju', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'confirmed', label: 'Potvrđena', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'completed', label: 'Završena', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'cancelled', label: 'Otkazana', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

const sourceLabels: Record<string, string> = {
  website: 'Web',
  instagram_dm: 'Instagram',
  whatsapp: 'WhatsApp',
  phone: 'Telefon',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<(Reservation & { vehicle?: { name: string } })[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadReservations();
  }, [filter]);

  async function loadReservations() {
    setLoading(true);
    let query = supabase
      .from('reservations')
      .select('*, vehicle:vehicles(name)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setReservations(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('reservations').update({ status }).eq('id', id);
    loadReservations();
  }

  function exportReservations() {
    const headers = ['Ime', 'Telefon', 'Email', 'Vozilo', 'Izvor', 'Status', 'Preuzimanje', 'Povrat', 'Lokacija preuzimanja', 'Lokacija povrata', 'Cijena (KM)', 'Napomena', 'Datum kreiranja'];
    const rows = reservations.map((r) => [
      r.customer_name,
      r.customer_phone,
      r.customer_email || '',
      r.vehicle?.name || '',
      sourceLabels[r.source] || r.source,
      statusOptions.find((s) => s.value === r.status)?.label || r.status,
      r.pickup_date,
      r.return_date,
      r.pickup_location,
      r.return_location,
      String(r.total_price || ''),
      r.notes || '',
      new Date(r.created_at).toLocaleDateString('hr-HR'),
    ]);
    const suffix = filter === 'all' ? 'sve' : filter;
    downloadCSV(`rezervacije-${suffix}`, headers, rows);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)]">Rezervacije</h1>
        <button
          onClick={exportReservations}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-bg-card border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: 'all', label: 'Sve' }, ...statusOptions].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filter === opt.value
                ? 'bg-accent text-white'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Učitavanje...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 text-text-muted bg-bg-card border border-border rounded-xl">
          Nema rezervacija.
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const currentStatus = statusOptions.find((s) => s.value === r.status) || statusOptions[0];
            return (
              <div key={r.id} className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">{r.customer_name}</h3>
                    <p className="text-accent font-medium text-sm">
                      {r.vehicle?.name || 'Vozilo nije odabrano'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-bg-card-hover text-text-muted">
                      {sourceLabels[r.source] || r.source}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${currentStatus.class}`}>
                      {currentStatus.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Phone size={14} />
                    <span>{r.customer_phone}</span>
                  </div>
                  {r.customer_email && (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Mail size={14} />
                      <span>{r.customer_email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calendar size={14} />
                    <span>{r.pickup_date} → {r.return_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <MapPin size={14} />
                    <span>{r.pickup_location} → {r.return_location}</span>
                  </div>
                </div>

                {r.notes && (
                  <p className="text-sm text-text-muted bg-bg-primary rounded-lg p-3 mb-4">{r.notes}</p>
                )}

                {r.total_price && (
                  <p className="text-sm font-semibold mb-4">Cijena: {r.total_price} KM</p>
                )}

                <div className="flex gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateStatus(r.id, opt.value)}
                      disabled={r.status === opt.value}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        r.status === opt.value
                          ? opt.class + ' cursor-default'
                          : 'border-border text-text-muted hover:text-text-primary hover:border-border-light'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
