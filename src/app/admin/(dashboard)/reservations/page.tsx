'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Reservation } from '@/types';
import { Phone, Mail, Calendar, MapPin, Download, Plus, Pencil, Check, X, User, UserCheck } from 'lucide-react';
import { downloadCSV } from '@/lib/export-csv';
import { useAuth } from '../AuthContext';
import ReservationFormModal from './ReservationFormModal';

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
  const { role, userId } = useAuth();
  const [reservations, setReservations] = useState<(Reservation & { vehicle?: { name: string }; staff_profile?: { display_name: string }; handler_profile?: { display_name: string } })[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState('');
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
    const reservationData = (data || []) as (Reservation & { vehicle?: { name: string }; staff_profile?: { display_name: string }; handler_profile?: { display_name: string } })[];

    if (reservationData.length > 0) {
      const allStaffIds = [
        ...new Set([
          ...reservationData.map((r) => r.created_by_staff).filter(Boolean),
          ...reservationData.map((r) => r.handled_by_staff).filter(Boolean),
        ]),
      ] as string[];

      if (allStaffIds.length > 0) {
        const { data: profiles } = await supabase
          .from('staff_profiles')
          .select('id, display_name')
          .in('id', allStaffIds);

        const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name]));
        for (const r of reservationData) {
          if (r.created_by_staff && profileMap.has(r.created_by_staff)) {
            r.staff_profile = { display_name: profileMap.get(r.created_by_staff)! };
          }
          if (r.handled_by_staff && profileMap.has(r.handled_by_staff)) {
            r.handler_profile = { display_name: profileMap.get(r.handled_by_staff)! };
          }
        }
      }
    }

    setReservations(reservationData);
    setLoading(false);
  }

  async function handleReservation(id: string) {
    await supabase.from('reservations').update({ handled_by_staff: userId }).eq('id', id);
    loadReservations();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('reservations').update({ status }).eq('id', id);
    loadReservations();
  }

  async function savePrice(id: string) {
    const price = priceValue ? parseFloat(priceValue) : null;
    await supabase.from('reservations').update({ total_price: price }).eq('id', id);
    setEditingPrice(null);
    loadReservations();
  }

  function startEditPrice(id: string, currentPrice: number | undefined) {
    setEditingPrice(id);
    setPriceValue(currentPrice ? String(currentPrice) : '');
  }

  function exportReservations() {
    const headers = ['Ime', 'Telefon', 'Email', 'Vozilo', 'Izvor', 'Status', 'Preuzimanje', 'Povrat', 'Lokacija preuzimanja', 'Lokacija povrata', 'Cijena (KM)', 'Kreirao', 'Obradio', 'Napomena', 'Datum kreiranja'];
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
      r.staff_profile?.display_name || '',
      r.handler_profile?.display_name || '',
      r.notes || '',
      new Date(r.created_at).toLocaleDateString('hr-HR'),
    ]);
    const suffix = filter === 'all' ? 'sve' : filter;
    downloadCSV(`rezervacije-${suffix}`, headers, rows);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)]">
          {role === 'radnik' ? 'Moje rezervacije' : 'Rezervacije'}
        </h1>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={exportReservations}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-bg-card border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Dodaj rezervaciju</span>
            <span className="sm:hidden">Dodaj</span>
          </button>
        </div>
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
            const staffName = (r as { staff_profile?: { display_name: string } | null }).staff_profile?.display_name;
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

                {(staffName || r.handler_profile?.display_name || (!r.handled_by_staff && r.source !== 'phone')) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary mb-4">
                    {staffName && (
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>Kreirao: <span className="font-medium text-text-primary">{staffName}</span></span>
                      </div>
                    )}
                    {r.handler_profile?.display_name ? (
                      <div className="flex items-center gap-1.5">
                        <UserCheck size={14} className="text-green-400" />
                        <span>Obradio: <span className="font-medium text-green-400">{r.handler_profile.display_name}</span></span>
                      </div>
                    ) : !r.handled_by_staff ? (
                      <button
                        onClick={() => handleReservation(r.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                      >
                        <UserCheck size={12} />
                        Preuzmi
                      </button>
                    ) : null}
                  </div>
                )}

                {r.notes && (
                  <p className="text-sm text-text-muted bg-bg-primary rounded-lg p-3 mb-4">{r.notes}</p>
                )}

                {role === 'admin' && (
                  <div className="flex items-center gap-4 mb-4">
                    {editingPrice === r.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={priceValue}
                          onChange={(e) => setPriceValue(e.target.value)}
                          placeholder="Cijena"
                          className="w-28 bg-bg-primary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') savePrice(r.id);
                            if (e.key === 'Escape') setEditingPrice(null);
                          }}
                        />
                        <span className="text-sm text-text-muted">KM</span>
                        <button onClick={() => savePrice(r.id)} className="p-1 text-green-400 hover:text-green-300">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingPrice(null)} className="p-1 text-text-muted hover:text-text-primary">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditPrice(r.id, r.total_price)}
                        className="flex items-center gap-1.5 text-sm group"
                      >
                        <span className="font-semibold">
                          {r.total_price ? `${r.total_price} KM` : 'Bez cijene'}
                        </span>
                        <Pencil size={12} className="text-text-muted group-hover:text-accent transition-colors" />
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
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

      {showForm && (
        <ReservationFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadReservations();
          }}
        />
      )}
    </div>
  );
}
