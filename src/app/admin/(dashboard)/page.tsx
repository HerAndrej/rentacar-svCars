import { createServerSupabaseClient } from '@/lib/supabase-server';
import { CalendarCheck, Car, MessageSquare, Clock, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: totalVehicles },
    { count: totalReservations },
    { count: pendingReservations },
    { count: unreadMessages },
    { data: recentReservations },
    { data: allReservations },
  ] = await Promise.all([
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('reservations').select('*, vehicle:vehicles(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('reservations').select('total_price, status, created_at'),
  ]);

  const monthRevenue = (allReservations || [])
    .filter((r) => r.status !== 'cancelled' && new Date(r.created_at) >= thirtyDaysAgo)
    .reduce((sum, r) => sum + (r.total_price || 0), 0);

  const totalRevenue = (allReservations || [])
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + (r.total_price || 0), 0);

  const stats = [
    { label: 'Zarada (30 dana)', value: `${monthRevenue.toLocaleString()} KM`, icon: DollarSign, href: '/admin/analytics', color: 'text-green-400' },
    { label: 'Ukupna zarada', value: `${totalRevenue.toLocaleString()} KM`, icon: TrendingUp, href: '/admin/analytics', color: 'text-accent' },
    { label: 'Na čekanju', value: String(pendingReservations || 0), icon: Clock, href: '/admin/reservations', color: 'text-yellow-400' },
    { label: 'Nepročitane poruke', value: String(unreadMessages || 0), icon: MessageSquare, href: '/admin/messages', color: 'text-blue-400' },
  ];

  const secondaryStats = [
    { label: 'Ukupno vozila', value: totalVehicles || 0, icon: Car, href: '/admin/vehicles' },
    { label: 'Sve rezervacije', value: totalReservations || 0, icon: CalendarCheck, href: '/admin/reservations' },
  ];

  const statusLabels: Record<string, { text: string; class: string }> = {
    pending: { text: 'Na čekanju', class: 'bg-yellow-500/10 text-yellow-400' },
    confirmed: { text: 'Potvrđena', class: 'bg-green-500/10 text-green-400' },
    completed: { text: 'Završena', class: 'bg-blue-500/10 text-blue-400' },
    cancelled: { text: 'Otkazana', class: 'bg-red-500/10 text-red-400' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)]">Dashboard</h1>
        <Link href="/admin/analytics" className="text-accent text-sm hover:underline font-medium">
          Analitike →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-lg sm:text-2xl font-bold font-[family-name:var(--font-montserrat)]">{stat.value}</p>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-10">
        {secondaryStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors flex items-center gap-4"
          >
            <stat.icon size={20} className="text-text-muted" />
            <div>
              <span className="text-xl font-bold font-[family-name:var(--font-montserrat)]">{stat.value}</span>
              <span className="text-text-secondary text-sm ml-2">{stat.label}</span>
            </div>
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
                    {r.total_price && (
                      <span className="text-sm font-semibold">{r.total_price} KM</span>
                    )}
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.class}`}>
                      {status.text}
                    </span>
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
