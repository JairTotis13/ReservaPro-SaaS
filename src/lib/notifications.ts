import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { BookingWithDetails, NotificationChannel, NotificationStatus, NotificationType } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function buildEmailHtml(booking: BookingWithDetails, type: 'confirmation' | 'reminder_24h' | 'reminder_1h'): string {
  const serviceName = booking.service?.name ?? 'Servicio';
  const professionalName = booking.professional?.name ?? 'Profesional';
  const businessName = booking.business?.name ?? 'Negocio';
  const date = formatDate(booking.start_time);
  const time = formatTime(booking.start_time);
  const accentColor = '#D4AF37';

  const titles: Record<string, string> = {
    confirmation: 'Cita Confirmada',
    reminder_24h: 'Recordatorio de Cita - Mañana',
    reminder_1h: 'Recordatorio de Cita - En 1 hora',
  };

  const messages: Record<string, string> = {
    confirmation: `Tu cita ha sido confirmada. A continuación los detalles:`,
    reminder_24h: `Te recordamos que tienes una cita programada para mañana.`,
    reminder_1h: `Te recordamos que tu cita comienza en aproximadamente 1 hora.`,
  };

  return `
    <div style="max-width:600px;margin:0 auto;background:#1a1a2e;color:#e0e0e0;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif">
      <div style="background:${accentColor};padding:24px;text-align:center">
        <h1 style="color:#1a1a2e;margin:0;font-size:22px">${businessName}</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:${accentColor};margin-top:0">${titles[type]}</h2>
        <p>Hola ${booking.customer_name},</p>
        <p>${messages[type]}</p>
        <div style="background:#16213e;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #333">
          <p style="margin:4px 0"><strong style="color:${accentColor}">Servicio:</strong> ${serviceName}</p>
          <p style="margin:4px 0"><strong style="color:${accentColor}">Profesional:</strong> ${professionalName}</p>
          <p style="margin:4px 0"><strong style="color:${accentColor}">Fecha:</strong> ${date}</p>
          <p style="margin:4px 0"><strong style="color:${accentColor}">Hora:</strong> ${time}</p>
        </div>
      </div>
      <div style="background:#0f3460;padding:16px;text-align:center;font-size:12px;color:#888">
        <p>© ${new Date().getFullYear()} ${businessName} - ReservaPro</p>
      </div>
    </div>
  `;
}

export async function sendConfirmationEmail(booking: BookingWithDetails): Promise<void> {
  if (!resend || !booking.business?.email_notifications_enabled) return;

  try {
    await resend.emails.send({
      from: `${booking.business.name} <noreply@reservapro.app>`,
      to: booking.customer_email,
      subject: `Cita Confirmada - ${booking.business.name}`,
      html: buildEmailHtml(booking, 'confirmation'),
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}

export async function sendReminderEmail(
  booking: BookingWithDetails,
  type: 'reminder_24h' | 'reminder_1h'
): Promise<void> {
  if (!resend || !booking.business?.email_notifications_enabled) return;

  try {
    await resend.emails.send({
      from: `${booking.business.name} <noreply@reservapro.app>`,
      to: booking.customer_email,
      subject: `Recordatorio de Cita - ${booking.business.name}`,
      html: buildEmailHtml(booking, type),
    });
  } catch (error) {
    console.error(`Failed to send ${type} email:`, error);
    throw error;
  }
}

export async function sendConfirmationWhatsApp(booking: BookingWithDetails): Promise<void> {
  if (!booking.customer_phone || !booking.business?.whatsapp_notifications_enabled) return;

  // Placeholder for Twilio WhatsApp API integration
  const serviceName = booking.service?.name ?? 'Servicio';
  const professionalName = booking.professional?.name ?? 'Profesional';
  const date = formatDate(booking.start_time);
  const time = formatTime(booking.start_time);

  const message = `*${booking.business?.name}*\n\n` +
    `Tu cita ha sido confirmada:\n` +
    `Servicio: ${serviceName}\n` +
    `Profesional: ${professionalName}\n` +
    `Fecha: ${date}\n` +
    `Hora: ${time}`;

  console.log(`[WhatsApp Placeholder] To: ${booking.customer_phone} | Message: ${message}`);
}

export async function sendReminderWhatsApp(
  booking: BookingWithDetails,
  type: 'reminder_24h' | 'reminder_1h'
): Promise<void> {
  if (!booking.customer_phone || !booking.business?.whatsapp_notifications_enabled) return;

  const serviceName = booking.service?.name ?? 'Servicio';
  const professionalName = booking.professional?.name ?? 'Profesional';
  const date = formatDate(booking.start_time);
  const time = formatTime(booking.start_time);
  const prefix = type === 'reminder_24h' ? 'mañana' : 'en 1 hora';

  const message = `*${booking.business?.name}*\n\n` +
    `Recordatorio: tienes una cita ${prefix}:\n` +
    `Servicio: ${serviceName}\n` +
    `Profesional: ${professionalName}\n` +
    `Fecha: ${date}\n` +
    `Hora: ${time}`;

  console.log(`[WhatsApp Placeholder] To: ${booking.customer_phone} | Message: ${message}`);
}

export async function processPendingNotifications(): Promise<void> {
  const now = new Date().toISOString();

  const { data: bookingsWithDetails, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      service:services(*),
      professional:professionals(*),
      business:businesses(*)
    `)
    .eq('status', 'confirmed')
    .gte('start_time', now);

  if (error || !bookingsWithDetails) {
    console.error('Error fetching bookings for notifications:', error);
    return;
  }

  for (const booking of bookingsWithDetails as unknown as BookingWithDetails[]) {
    const startTime = new Date(booking.start_time);
    const diffMs = startTime.getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 24 && diffHours > 1) {
      await sendNotification(booking, 'reminder_24h');
    } else if (diffHours <= 1 && diffHours > 0) {
      await sendNotification(booking, 'reminder_1h');
    }
  }
}

async function sendNotification(booking: BookingWithDetails, type: NotificationType): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from('notification_logs')
    .select('id')
    .eq('booking_id', booking.id)
    .eq('type', type)
    .eq('status', 'sent')
    .limit(1);

  if (existing && existing.length > 0) return;

  const channels: NotificationChannel[] = ['email', 'whatsapp'];

  for (const channel of channels) {
    try {
      if (channel === 'email') {
        if (type === 'confirmation') {
          await sendConfirmationEmail(booking);
        } else {
          await sendReminderEmail(booking, type);
        }
      } else {
        if (type === 'confirmation') {
          await sendConfirmationWhatsApp(booking);
        } else {
          await sendReminderWhatsApp(booking, type);
        }
      }

      await logNotification(supabaseAdmin, {
        booking_id: booking.id,
        type,
        channel,
        status: 'sent',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await logNotification(supabaseAdmin, {
        booking_id: booking.id,
        type,
        channel,
        status: 'failed',
        error_message: errorMessage,
      });
    }
  }
}

export async function logNotification(
  client: typeof supabaseAdmin,
  params: {
    booking_id: string;
    type: NotificationType;
    channel: NotificationChannel;
    status: NotificationStatus;
    error_message?: string;
  }
): Promise<void> {
  const { error } = await client.from('notification_logs').insert({
    booking_id: params.booking_id,
    type: params.type,
    channel: params.channel,
    status: params.status,
    error_message: params.error_message ?? null,
  });

  if (error) {
    console.error('Error logging notification:', error);
  }
}
