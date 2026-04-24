import { createServerSupabaseClient } from '@/lib/supabase-server';
import { CalendarCheck, Car, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { count: totalVehicles },
    { count: totalReservations },
    { count: pendingReservations },
    { count: unreadMessages },
    { data: recentReservations },
  ] = await Promise.all([
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('reservations').select('*, vehicle:vehicles(name)').order('created_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: 'Ukupno vozila', value: totalVehicles || 0, icon: Car, href: '/admin/vehicles', color: 'text-blue-400' },
    { label: 'Sve rezervacije', value: totalReservations || 0, icon: CalendarCheck, href: '/admin/reservations', color: 'text-green-400' },
    { label: 'Na čekanju', value: pendingReservations || 0, icon: Clock, href: '/admin/reservations', color: 'text-yellow-400' },
    { label: 'Nepročitane poruke', value: unreadMessages || 0, icon: MessageSquare, href: '/admin/messages', color: 'text-accent' },
  ];

  const statusLabels: Record<string, { text: string; class: string }> = {
    pending: { text: 'Na čekanju', class: 'bg-yellow-500/10 text-yellow-400' },
    confirmed: { text: 'Potvrđena', class: 'bg-green-500/10 text-green-400' },
    completed: { text: 'Završena', class: 'bg-blue-500/10 text-blue-400' },
    cancelled: { text: 'Otkazana', class: 'bg-red-500/10 text-red-400' },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-bg-card border border-border rounded-xl p-6 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon size={24} className={stat.color} />
              <span className="text-3xl font-bold font-[family-name:var(--font-montserrat)]">{stat.value}</span>
            </div>
            <p className="text-text-secondary text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-xl">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">Zadnje rezervacije</h2>
          <Link href="/admin/reservations" className="text-accent text-sm hover:underline">
            Vidi sve →
          </Link>
        </div>
        {recentReservations && recentReservations.length > 0 ? (
          <div className="divide-y divide-border">
            {recentReservations.map((r) => {
              const status = statusLabels[r.status] || statusLabels.pending;
              return (
                <div key={r.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{r.customer_name}</p>
                    <p className="text-sm text-text-secondary">
                      {(r.vehicle as { name: string } | null)?.name || 'Nepoznato vozilo'} · {r.pickup_date} → {r.return_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.class}`}>
                      {status.text}
                    </span>
                    <span className="text-sm text-text-muted">{r.customer_phone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-text-muted">
            Nema rezervacija još.
          </div>
        )}
      </div>
    </div>
  );
}
