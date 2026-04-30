'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createReservation } from '@/lib/actions';

interface VehicleReservationProps {
  vehicleId: string;
  vehicleName: string;
  priceDaily: number;
  priceWeekly: number | null;
}

interface BookedRange {
  pickup_date: string;
  return_date: string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function isDateInRange(dateStr: string, ranges: BookedRange[]) {
  for (const range of ranges) {
    if (dateStr >= range.pickup_date && dateStr <= range.return_date) {
      return true;
    }
  }
  return false;
}

function hasOverlap(pickup: string, returnD: string, ranges: BookedRange[]) {
  for (const range of ranges) {
    if (pickup <= range.return_date && returnD >= range.pickup_date) {
      return true;
    }
  }
  return false;
}

const MONTHS_HR = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
const DAYS_HR = ['Pon', 'Uto', 'Sri', 'Cet', 'Pet', 'Sub', 'Ned'];

export default function VehicleReservation({ vehicleId, vehicleName, priceDaily, priceWeekly }: VehicleReservationProps) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDate(today), [today]);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [pickupDate, setPickupDate] = useState<string | null>(null);
  const [returnDate, setReturnDate] = useState<string | null>(null);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/availability?vehicleId=${vehicleId}`)
      .then(r => r.json())
      .then(data => setBookedRanges(data.reservations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    const diff = new Date(returnDate).getTime() - new Date(pickupDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [pickupDate, returnDate]);

  const totalPrice = useMemo(() => {
    if (!rentalDays) return 0;
    const rate = priceWeekly && rentalDays >= 7 ? priceWeekly : priceDaily;
    return rate * rentalDays;
  }, [rentalDays, priceDaily, priceWeekly]);

  const handleDateClick = useCallback((dateStr: string) => {
    if (dateStr < todayStr) return;
    if (isDateInRange(dateStr, bookedRanges)) return;

    if (!pickupDate || (pickupDate && returnDate)) {
      setPickupDate(dateStr);
      setReturnDate(null);
    } else {
      if (dateStr < pickupDate) {
        setPickupDate(dateStr);
        setReturnDate(null);
      } else if (dateStr === pickupDate) {
        setPickupDate(null);
      } else {
        if (hasOverlap(pickupDate, dateStr, bookedRanges)) {
          setPickupDate(dateStr);
          setReturnDate(null);
        } else {
          setReturnDate(dateStr);
        }
      }
    }
  }, [pickupDate, returnDate, bookedRanges, todayStr]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const canGoPrev = currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pickupDate || !returnDate || !name.trim() || !phone.trim()) return;

    setSubmitting(true);
    setError('');

    const result = await createReservation({
      vehicleId,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || undefined,
      pickupDate,
      returnDate,
      pickupLocation: 'Mostar',
      returnLocation: 'Mostar',
      notes: notes.trim() || undefined,
      totalPrice,
    });

    setSubmitting(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-8 text-center border border-accent/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
          className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle size={32} className="text-accent" />
        </motion.div>
        <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-xl mb-2">Rezervacija poslana!</h3>
        <p className="text-text-secondary text-sm mb-1">{vehicleName}</p>
        <p className="text-text-secondary text-sm">{pickupDate} — {returnDate}</p>
        <p className="text-accent font-bold text-lg mt-3">{totalPrice} KM</p>
        <p className="text-text-muted text-xs mt-4">Kontaktiracemo vas uskoro za potvrdu.</p>
      </motion.div>
    );
  }

  return (
    <div className="glass rounded-xl border border-border/30 overflow-hidden">
      <div className="p-6 border-b border-border/30">
        <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-lg tracking-wider">REZERVISI VOZILO</h2>
        <p className="text-text-secondary text-sm mt-1">Odaberite datume na kalendaru</p>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : (
          <>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                disabled={!canGoPrev}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
                {MONTHS_HR[currentMonth]} {currentYear}
              </span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-card transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_HR.map(d => (
                <div key={d} className="text-center text-text-muted text-xs py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />;

                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isPast = dateStr < todayStr;
                const isBooked = isDateInRange(dateStr, bookedRanges);
                const isPickup = dateStr === pickupDate;
                const isReturn = dateStr === returnDate;
                const isInRange = pickupDate && returnDate && dateStr > pickupDate && dateStr < returnDate;
                const isToday = dateStr === todayStr;
                const isDisabled = isPast || isBooked;

                let className = 'relative w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer ';

                if (isDisabled) {
                  className += isBooked
                    ? 'bg-red-500/15 text-red-400 cursor-not-allowed line-through'
                    : 'text-text-muted/40 cursor-not-allowed';
                } else if (isPickup || isReturn) {
                  className += 'bg-accent text-white font-bold';
                } else if (isInRange) {
                  className += 'bg-accent/20 text-accent';
                } else {
                  className += 'hover:bg-bg-card text-text-primary';
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => !isDisabled && handleDateClick(dateStr)}
                    disabled={isDisabled}
                    className={className}
                  >
                    {day}
                    {isToday && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-accent" /> Odabrano
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500/15 border border-red-400/30" /> Zauzeto
              </span>
            </div>
          </>
        )}

        {/* Selected dates summary */}
        <AnimatePresence>
          {pickupDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-lg bg-bg-card border border-border/50"
            >
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-text-muted">Preuzimanje:</span>
                  <span className="ml-2 font-medium">{pickupDate}</span>
                </div>
                {returnDate && (
                  <div>
                    <span className="text-text-muted">Vracanje:</span>
                    <span className="ml-2 font-medium">{returnDate}</span>
                  </div>
                )}
              </div>
              {returnDate && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                  <span className="text-text-secondary text-sm">{rentalDays} {rentalDays === 1 ? 'dan' : 'dana'}</span>
                  <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xl">{totalPrice} KM</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reservation Form */}
      <AnimatePresence>
        {pickupDate && returnDate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="border-t border-border/30 p-6 space-y-4"
          >
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Ime i prezime *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
                placeholder="Vase ime"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Telefon *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
                  placeholder="+387..."
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
                  placeholder="opciono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Napomena</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-bg-primary/80 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none transition-all resize-none focus:shadow-[0_0_0_3px_rgba(232,90,43,0.1)]"
                placeholder="Posebni zahtjevi..."
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-accent text-white px-8 py-3.5 rounded-lg text-sm font-bold tracking-wider hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  SLANJE...
                </>
              ) : (
                <>
                  POSALJI REZERVACIJU
                  <Send size={14} />
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
