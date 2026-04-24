'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LayoutDashboard, CalendarCheck, Car, MessageSquare, BarChart3, LogOut, Globe, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analitika', icon: BarChart3 },
  { href: '/admin/reservations', label: 'Rezervacije', icon: CalendarCheck },
  { href: '/admin/vehicles', label: 'Vozila', icon: Car },
  { href: '/admin/messages', label: 'Poruke', icon: MessageSquare },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-bg-card border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">SV</span>
          </div>
          <span className="font-bold text-sm font-[family-name:var(--font-montserrat)]">SV CARS</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
    </>
  );
}
