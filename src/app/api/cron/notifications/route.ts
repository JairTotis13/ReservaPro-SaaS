import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  sendReminderEmail,
  sendReminderWhatsApp,
} from '@/lib/notifications';
import type { BookingWithDetails, NotificationType } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  let notificationsSent = 0;

  try {
    const reminderWindows: { type: 'reminder_24h' | 'reminder_1h'; hours: number }[] = [
      { type: 'reminder_24h', hours: 24 },
      { type: 'reminder_1h', hours: 1 },
    ];

    for (const window of reminderWindows) {
      const targetStart = new Date(now.getTime() + window.hours * 60 * 60 * 1000);
      const targetStartMin = new Date(targetStart.getTime() - 5 * 60 * 1000);
      const targetStartMax = new Date(targetStart.getTime() + 5 * 60 * 1000);

      const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          service:services(*),
          professional:professionals(*),
          business:businesses(*)
        `)
        .eq('status', 'confirmed')
        .gte('start_time', targetStartMin.toISOString())
        .lte('start_time', targetStartMax.toISOString());

      if (error || !bookings) {
        console.error('Error fetching bookings for notifications:', error);
        continue;
      }

      for (const booking of bookings as unknown as BookingWithDetails[]) {
        const { data: alreadySent } = await supabaseAdmin
          .from('notification_logs')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('type', window.type)
          .eq('status', 'sent')
          .limit(1);

        if (alreadySent && alreadySent.length > 0) {
          continue;
        }

        try {
          await sendReminderEmail(booking, window.type);
          await logNotification(booking.id, window.type, 'email', 'sent');
          notificationsSent++;
        } catch (err) {
          await logNotification(
            booking.id,
            window.type,
            'email',
            'failed',
            err instanceof Error ? err.message : 'Unknown error'
          );
        }

        try {
          await sendReminderWhatsApp(booking, window.type);
          await logNotification(booking.id, window.type, 'whatsapp', 'sent');
          notificationsSent++;
        } catch (err) {
          await logNotification(
            booking.id,
            window.type,
            'whatsapp',
            'failed',
            err instanceof Error ? err.message : 'Unknown error'
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      notifications_sent: notificationsSent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}

async function logNotification(
  bookingId: string,
  type: NotificationType,
  channel: 'email' | 'whatsapp',
  status: 'sent' | 'failed',
  errorMessage?: string
): Promise<void> {
  await supabaseAdmin.from('notification_logs').insert({
    booking_id: bookingId,
    type,
    channel,
    status,
    error_message: errorMessage ?? null,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
  });
}
