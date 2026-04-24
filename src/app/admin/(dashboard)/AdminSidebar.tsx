'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LayoutDashboard, CalendarCheck, Car, MessageSquare, BarChart3, LogOut, Globe } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analitika', icon: BarChart3 },
  { href: '/admin/reservations', label: 'Rezervacije', icon: CalendarCheck },
  { href: '/admin/vehicles', label: 'Vozila', icon: Car },
  { href: '/admin/messages', label: 'Poruke', icon: MessageSquare },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">SV</span>
          </div>
          <div>
            <h2 className="font-bold font-[family-name:var(--font-montserrat)]">SV CARS</h2>
            <p className="text-xs text-text-muted">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
        >
          <Globe size={20} />
          <span className="font-medium">Vidi sajt</span>
        </Link>
        <div className="px-4 py-2">
          <p className="text-xs text-text-muted truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Odjavi se</span>
        </button>
      </div>
    </aside>
  );
}
