'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Calendar, Users, Settings, Fuel, Check, X as XIcon,
  Search, ArrowRight, MapPin, Phone, User, Mail, FileText,
  ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { createClient } from '@/lib/supabase';
import type { Vehicle, VehicleCategory } from '@/types';

interface VehicleWithAvailability extends Vehicle {
  available: boolean;
  reservedBy?: string;
  reservationDates?: string;
}

const categories: { key: VehicleCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Sve' },
  { key: 'economy', label: 'Ekonomična' },
  { key: 'compact', label: 'Kompaktna' },
  { key: 'suv', label: 'SUV' },
  { key: 'premium', label: 'Premium' },
  { key: 'van', label: 'Van' },
  { key: 'quad', label: 'Quad' },
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function daysBetween(a: string, b: string) {
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('hr', { day: '2-digit', month: '2-digit' });
}

export default function DostupnostPage() {
  const { role, userId, displayName } = useAuth();
  const supabase = createClient();

  const [pickup, setPickup] = useState(getToday());
  const [returnDate, setReturnDate] = useState(getTomorrow());
  const [vehicles, setVehicles] = useState<VehicleWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<VehicleCategory | 'all'>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [bookingVehicle, setBookingVehicle] = useState<VehicleWithAvailability | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const { data: allVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      const { data: reservations } = await supabase
        .from('reservations')
        .select('vehicle_id, pickup_date, return_date, status, customer_name')
        .in('status', ['pending', 'confirmed'])
        .lte('pickup_date', returnDate)
        .gte('return_date', pickup);

      const reservationMap = new Map<string, { name: string; dates: string }>();
      (reservations || []).forEach(r => {
        if (r.vehicle_id) {
          reservationMap.set(r.vehicle_id, {
            name: r.customer_name,
            dates: `${formatDate(r.pickup_date)} - ${formatDate(r.return_date)}`,
          });
        }
      });

      const result = (allVehicles || []).map(v => ({
        ...v,
        available: !reservationMap.has(v.id),
        reservedBy: reservationMap.get(v.id)?.name,
        reservationDates: reservationMap.get(v.id)?.dates,
      }));

      setVehicles(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [pickup, returnDate, supabase]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const filtered = vehicles.filter(v => {
    if (category !== 'all' && v.category !== category) return false;
    if (showOnlyAvailable && !v.available) return false;
    return true;
  });

  const availableCount = vehicles.filter(v => v.available).length;
  const totalCount = vehicles.length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-montserrat)] font-bold text-2xl sm:text-3xl">
          Dostupnost vozila
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Provjerite slobodna vozila i kreirajte rezervaciju.
        </p>
      </div>

      {/* Date Picker */}
      <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-text-secondary text-xs mb-1.5 font-medium">
              <Calendar size={12} className="inline mr-1 text-accent" />
              Preuzimanje
            </label>
            <input
              type="date"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                if (e.target.value >= returnDate) {
                  const next = new Date(e.target.value);
                  next.setDate(next.getDate() + 1);
                  setReturnDate(next.toISOString().split('T')[0]);
                }
              }}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-text-secondary text-xs mb-1.5 font-medium">
              <Calendar size={12} className="inline mr-1 text-accent" />
              Vraćanje
            </label>
            <input
              type="date"
              value={returnDate}
              min={pickup}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={fetchAvailability}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap text-sm"
          >
            <Search size={16} />
            PRETRAŽI
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border text-sm">
            <span className="text-text-secondary">
              {daysBetween(pickup, returnDate)} {daysBetween(pickup, returnDate) === 1 ? 'dan' : 'dana'}
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="text-green-400 font-bold">{availableCount}</span>
              <span className="text-text-secondary"> / {totalCount} slobodno</span>
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="accent-accent w-3.5 h-3.5"
                />
                <span className="text-xs">Samo slobodna</span>
              </label>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 text-xs ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1.5 text-xs ${viewMode === 'list' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Lista
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat.key
                ? 'bg-accent text-white'
                : 'bg-bg-card border border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-accent" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((vehicle) => (
            <VehicleAvailCard
              key={vehicle.id}
              vehicle={vehicle}
              days={daysBetween(pickup, returnDate)}
              onBook={() => setBookingVehicle(vehicle)}
              isAdmin={role === 'admin'}
            />
          ))}
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary text-left">
                  <th className="px-4 py-3 font-medium">Vozilo</th>
                  <th className="px-4 py-3 font-medium">Kategorija</th>
                  <th className="px-4 py-3 font-medium">Cijena/dan</th>
                  <th className="px-4 py-3 font-medium">Ukupno</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => {
                  const days = daysBetween(pickup, returnDate);
                  const total = vehicle.price_weekly && days >= 7
                    ? vehicle.price_weekly * days
                    : vehicle.price_daily * days;
                  return (
                    <tr key={vehicle.id} className={`border-b border-border/50 ${!vehicle.available ? 'opacity-50' : 'hover:bg-bg-card-hover'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {vehicle.images[0] && (
                            <div className="relative w-12 h-8 rounded overflow-hidden flex-shrink-0">
                              <Image src={vehicle.images[0]} alt={vehicle.name} fill className="object-cover" sizes="48px" />
                            </div>
                          )}
                          <span className="font-medium">{vehicle.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded uppercase font-medium">
                          {vehicle.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-accent font-bold">{vehicle.price_daily} KM</td>
                      <td className="px-4 py-3 text-text-secondary">{total} KM</td>
                      <td className="px-4 py-3">
                        {vehicle.available ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                            <Check size={12} /> Slobodno
                          </span>
                        ) : (
                          <div>
                            <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                              <XIcon size={12} /> Zauzeto
                            </span>
                            {role === 'admin' && vehicle.reservedBy && (
                              <span className="text-text-muted text-[10px]">{vehicle.reservedBy} ({vehicle.reservationDates})</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {vehicle.available && (
                          <button
                            onClick={() => setBookingVehicle(vehicle)}
                            className="text-accent hover:text-accent-hover text-xs font-bold"
                          >
                            REZERVIŠI
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-secondary">Nema vozila za prikaz.</p>
        </div>
      )}

      {/* Booking Modal */}
      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          pickup={pickup}
          returnDate={returnDate}
          staffId={userId}
          staffName={displayName}
          isAdmin={role === 'admin'}
          onClose={() => setBookingVehicle(null)}
          onSuccess={() => {
            setBookingVehicle(null);
            fetchAvailability();
          }}
        />
      )}
    </div>
  );
}

function VehicleAvailCard({
  vehicle,
  days,
  onBook,
  isAdmin,
}: {
  vehicle: VehicleWithAvailability;
  days: number;
  onBook: () => void;
  isAdmin: boolean;
}) {
  const transmissionLabel = vehicle.transmission === 'automatic' ? 'Auto' : 'Manual';
  const fuelLabel = vehicle.fuel === 'diesel' ? 'Dizel' : vehicle.fuel === 'petrol' ? 'Benzin' : 'Hybrid';
  const totalPrice = vehicle.price_weekly && days >= 7
    ? vehicle.price_weekly * days
    : vehicle.price_daily * days;

  return (
    <div className={`bg-bg-card border rounded-xl overflow-hidden transition-all duration-200 ${
      vehicle.available ? 'border-border hover:border-accent/40' : 'border-border/50 opacity-55'
    }`}>
      {/* Image */}
      <div className="relative aspect-[16/9] bg-bg-secondary overflow-hidden">
        {vehicle.images[0] ? (
          <Image
            src={vehicle.images[0]}
            alt={vehicle.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-text-muted text-xs">{vehicle.name}</p>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded">
            {vehicle.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          {vehicle.available ? (
            <span className="flex items-center gap-1 bg-green-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded">
              <Check size={10} /> SLOBODNO
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-red-500/80 text-white text-[10px] font-bold px-2.5 py-1 rounded">
              <XIcon size={10} /> ZAUZETO
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-base mb-2">
          {vehicle.name}
        </h3>

        <div className="flex items-center gap-3 mb-3 text-text-secondary text-xs">
          {vehicle.specs.seats && (
            <span className="flex items-center gap-1">
              <Users size={12} className="text-accent" /> {vehicle.specs.seats}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Settings size={12} className="text-accent" /> {transmissionLabel}
          </span>
          <span className="flex items-center gap-1">
            <Fuel size={12} className="text-accent" /> {fuelLabel}
          </span>
        </div>

        {/* Reservation info for booked vehicles */}
        {!vehicle.available && isAdmin && vehicle.reservedBy && (
          <div className="mb-3 bg-red-500/10 rounded-lg px-3 py-2 text-xs">
            <span className="text-red-400">{vehicle.reservedBy}</span>
            <span className="text-text-muted ml-1">({vehicle.reservationDates})</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-lg">
              {vehicle.price_daily} <span className="text-xs font-normal text-text-secondary">KM/dan</span>
            </p>
            {days > 1 && (
              <p className="text-text-muted text-[11px]">
                Ukupno: <span className="text-text-secondary">{totalPrice} KM</span>
              </p>
            )}
          </div>
          {vehicle.available ? (
            <button
              onClick={onBook}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              REZERVIŠI <ArrowRight size={12} />
            </button>
          ) : (
            <span className="text-text-muted text-xs">Zauzeto</span>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingModal({
  vehicle,
  pickup,
  returnDate,
  staffId,
  staffName,
  isAdmin,
  onClose,
  onSuccess,
}: {
  vehicle: VehicleWithAvailability;
  pickup: string;
  returnDate: string;
  staffId: string;
  staffName: string;
  isAdmin: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    pickupLocation: 'Mostar',
    returnLocation: 'Mostar',
    notes: '',
    source: 'phone' as 'phone' | 'website' | 'instagram_dm' | 'whatsapp',
    status: 'confirmed' as 'pending' | 'confirmed',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const days = daysBetween(pickup, returnDate);
  const totalPrice = vehicle.price_weekly && days >= 7
    ? vehicle.price_weekly * days
    : vehicle.price_daily * days;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await supabase.from('reservations').insert({
        vehicle_id: vehicle.id,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        pickup_date: pickup,
        return_date: returnDate,
        pickup_location: form.pickupLocation,
        return_location: form.returnLocation,
        notes: form.notes || null,
        source: form.source,
        status: form.status,
        total_price: totalPrice,
        created_by_staff: staffId,
      });

      if (dbError) throw new Error(dbError.message);
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri kreiranju');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-bg-card border-b border-border px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-lg">
              Nova rezervacija
            </h2>
            <p className="text-text-secondary text-sm">{vehicle.name}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1">
            <XIcon size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-400" />
            </div>
            <h3 className="font-bold text-lg mb-1">Rezervacija kreirana!</h3>
            <p className="text-text-secondary text-sm">Vraćam se na pregled...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Summary */}
            <div className="bg-bg-primary rounded-lg p-3 flex items-center gap-3">
              {vehicle.images[0] && (
                <div className="relative w-14 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src={vehicle.images[0]} alt={vehicle.name} fill className="object-cover" sizes="56px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{vehicle.name}</p>
                <div className="flex gap-3 text-text-muted text-[11px] mt-0.5">
                  <span>{formatDate(pickup)} → {formatDate(returnDate)}</span>
                  <span>{days}d</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-accent font-[family-name:var(--font-montserrat)] font-bold">{totalPrice} KM</p>
                <p className="text-text-muted text-[10px]">{vehicle.price_daily} KM/dan</p>
              </div>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-text-secondary text-xs mb-1">
                  <User size={10} className="inline mr-1" /> Ime i prezime *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  placeholder="Ime kupca"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1">
                  <Phone size={10} className="inline mr-1" /> Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  placeholder="+387 6X XXX XXX"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1">
                  <Mail size={10} className="inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Source & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-secondary text-xs mb-1">Izvor</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value as typeof form.source })}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="phone">Telefon</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram_dm">Instagram</option>
                  <option value="website">Web</option>
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="confirmed">Potvrđeno</option>
                  <option value="pending">Na čekanju</option>
                </select>
              </div>
            </div>

            {/* Expandable */}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-text-secondary text-xs hover:text-text-primary transition-colors"
            >
              {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Lokacija i napomena
            </button>

            {showDetails && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-secondary text-[10px] mb-1">
                      <MapPin size={9} className="inline mr-0.5" /> Preuzimanje
                    </label>
                    <input
                      type="text"
                      value={form.pickupLocation}
                      onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary text-[10px] mb-1">
                      <MapPin size={9} className="inline mr-0.5" /> Vraćanje
                    </label>
                    <input
                      type="text"
                      value={form.returnLocation}
                      onChange={(e) => setForm({ ...form, returnLocation: e.target.value })}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-text-secondary text-[10px] mb-1">
                    <FileText size={9} className="inline mr-0.5" /> Napomena
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Staff info */}
            <p className="text-text-muted text-[11px]">
              Kreira: <span className="text-text-secondary">{staffName}</span>
            </p>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>KREIRAJ REZERVACIJU</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
