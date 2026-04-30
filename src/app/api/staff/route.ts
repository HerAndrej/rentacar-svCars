import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (user.user_metadata?.role === 'radnik') return null;
  return user;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Nemate pristup' }, { status: 403 });
  }

  const { username, display_name, password } = await request.json();

  if (!username || !display_name || !password) {
    return NextResponse.json({ error: 'Sva polja su obavezna' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Lozinka mora imati najmanje 6 znakova' }, { status: 400 });
  }

  const email = `${username.toLowerCase().replace(/\s+/g, '')}@staff.internal`;

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'radnik' },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Korisničko ime već postoji' }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { error: profileError } = await supabaseAdmin.from('staff_profiles').insert({
    id: authUser.user.id,
    username: username.toLowerCase().replace(/\s+/g, ''),
    display_name,
    role: 'radnik',
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: 'Greška pri kreiranju profila' }, { status: 500 });
  }

  return NextResponse.json({ id: authUser.user.id });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Nemate pristup' }, { status: 403 });
  }

  const { id, is_active, password, display_name } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan' }, { status: 400 });
  }

  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: 'Lozinka mora imati najmanje 6 znakova' }, { status: 400 });
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (typeof is_active === 'boolean') updates.is_active = is_active;
  if (display_name) updates.display_name = display_name;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabaseAdmin.from('staff_profiles').update(updates).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
