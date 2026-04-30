'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { X } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface Vehicle {
  id: string;
  name: string;
  price_daily: number;
}

const sourceOptions = [
  { value: 'phone', label: 'Telefon' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram_dm', label: 'Instagram' },
  { value: 'website', label: 'Web' },
];

export default function ReservationFormModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { role, userId } = useAuth();
  const supabase = createClient();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    vehicle_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    pickup_date: '',
    return_date: '',
    pickup_location: 'Mostar',
    return_location: 'Mostar',
    source: 'phone',
    status: 'confirmed',
    total_price: '',
    notes: '',
  });

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('id, name, price_daily')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setVehicles(data || []));
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicle_id);
  const days =
    form.pickup_date && form.return_date
      ? Math.max(1, Math.ceil((new Date(form.return_date).getTime() - new Date(form.pickup_date).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
  const suggestedPrice = role === 'admin' && selectedVehicle?.price_daily && days > 0
    ? selectedVehicle.price_daily * days
    : 0;

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone || !form.pickup_date || !form.return_date) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      vehicle_id: form.vehicle_id || null,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email || null,
      pickup_date: form.pickup_date,
      return_date: form.return_date,
      pickup_location: form.pickup_location,
      return_location: form.return_location || form.pickup_location,
      source: form.source,
      status: form.status,
      notes: form.notes || null,
      created_by_staff: userId || null,
    };

    if (role === 'admin') {
      payload.total_price = form.total_price ? parseFloat(form.total_price) : null;
    }

    const { error } = await supabase.from('reservations').insert(payload);

    if (!error) onSaved();
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-bg-primary border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-bg-primary z-10">
          <h2 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">Nova rezervacija</h2>
          <button onClick={onClose} className="p-1 hover:text-accent transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Ime kupca *</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => update('customer_name', e.target.value)}
                required
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Telefon *</label>
              <input
                type="text"
                value={form.customer_phone}
                onChange={(e) => update('customer_phone', e.target.value)}
                required
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={form.customer_email}
              onChange={(e) => update('customer_email', e.target.value)}
              className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Vozilo</label>
            <select
              value={form.vehicle_id}
              onChange={(e) => update('vehicle_id', e.target.value)}
              className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">— Bez vozila —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}{role === 'admin' && v.price_daily ? ` (${v.price_daily} KM/dan)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Preuzimanje *</label>
              <input
                type="date"
                value={form.pickup_date}
                onChange={(e) => update('pickup_date', e.target.value)}
                required
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Povrat *</label>
              <input
                type="date"
                value={form.return_date}
                onChange={(e) => update('return_date', e.target.value)}
                required
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Lokacija preuzimanja</label>
              <input
                type="text"
                value={form.pickup_location}
                onChange={(e) => update('pickup_location', e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Lokacija povrata</label>
              <input
                type="text"
                value={form.return_location}
                onChange={(e) => update('return_location', e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Izvor</label>
              <select
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                {sourceOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                <option value="pending">Na čekanju</option>
                <option value="confirmed">Potvrđena</option>
                <option value="completed">Završena</option>
              </select>
            </div>
          </div>

          {role === 'admin' && (
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Cijena (KM)
                {suggestedPrice > 0 && (
                  <button
                    type="button"
                    onClick={() => update('total_price', String(suggestedPrice))}
                    className="ml-2 text-accent hover:underline"
                  >
                    Predložena: {suggestedPrice} KM ({days} dana × {selectedVehicle?.price_daily} KM)
                  </button>
                )}
              </label>
              <input
                type="number"
                value={form.total_price}
                onChange={(e) => update('total_price', e.target.value)}
                placeholder="Custom cijena ili ostavi prazno"
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-text-secondary mb-1">Napomena</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={2}
              className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors text-sm font-bold disabled:opacity-50"
            >
              {saving ? 'Spremam...' : 'Spremi rezervaciju'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
