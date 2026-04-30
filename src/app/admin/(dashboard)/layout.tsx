import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserRole } from '@/lib/auth-utils';
import AdminSidebar from './AdminSidebar';
import { AuthProvider } from './AuthContext';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const role = getUserRole(user);
  let displayName = user.email || '';

  if (role === 'radnik') {
    const { data: profile } = await supabase
      .from('staff_profiles')
      .select('display_name, is_active')
      .eq('id', user.id)
      .single();

    if (!profile?.is_active) {
      redirect('/admin/login');
    }

    displayName = profile?.display_name || 'Radnik';
  }

  return (
    <AuthProvider value={{ role, userId: user.id, displayName }}>
      <div className="flex min-h-screen">
        <AdminSidebar userEmail={user.email || ''} role={role} displayName={displayName} />
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
