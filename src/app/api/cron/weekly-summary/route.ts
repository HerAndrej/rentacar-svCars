import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';
import { weeklyReportEmail } from '@/lib/email/templates';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekStart = oneWeekAgo.toISOString();

  const [reservationsResult, messagesResult] = await Promise.all([
    supabase
      .from('reservations')
      .select('id, status, source, total_price, created_at')
      .gte('created_at', weekStart),
    supabase
      .from('contact_messages')
      .select('id')
      .gte('created_at', weekStart),
  ]);

  const reservations = reservationsResult.data || [];
  const messages = messagesResult.data || [];

  const stats = {
    totalReservations: reservations.length,
    pendingCount: reservations.filter((r) => r.status === 'pending').length,
    confirmedCount: reservations.filter((r) => r.status === 'confirmed').length,
    cancelledCount: reservations.filter((r) => r.status === 'cancelled').length,
    completedCount: reservations.filter((r) => r.status === 'completed').length,
    totalRevenue: reservations
      .filter((r) => r.status !== 'cancelled' && r.total_price)
      .reduce((sum, r) => sum + (r.total_price || 0), 0),
    bySource: {
      website: reservations.filter((r) => r.source === 'website').length,
      instagram_dm: reservations.filter((r) => r.source === 'instagram_dm').length,
      whatsapp: reservations.filter((r) => r.source === 'whatsapp').length,
      phone: reservations.filter((r) => r.source === 'phone').length,
    },
    contactMessages: messages.length,
    weekStart: oneWeekAgo.toLocaleDateString('hr-HR'),
    weekEnd: new Date().toLocaleDateString('hr-HR'),
  };

  const { subject, html } = weeklyReportEmail(stats);
  await sendEmail({ to: adminEmail, subject, html });

  return NextResponse.json({ success: true, stats });
}
