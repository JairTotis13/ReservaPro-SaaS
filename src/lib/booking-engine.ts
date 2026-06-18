import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Booking, BookingWithDetails, DashboardMetrics } from '@/lib/types';

export interface AvailableSlot {
  start: string;
  end: string;
}

export async function getAvailableSlots(
  professionalId: string,
  serviceId: string,
  date: string
): Promise<AvailableSlot[]> {
  const { data, error } = await supabaseAdmin.rpc('get_available_slots', {
    p_professional_id: professionalId,
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) {
    console.error('Error fetching available slots:', error);
    return [];
  }

  if (!data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((slot) => ({
    start: slot.slot_start as string,
    end: slot.slot_end as string,
  }));
}

export interface CreateBookingParams {
  businessId: string;
  serviceId: string;
  professionalId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export async function createBooking(params: CreateBookingParams): Promise<Booking> {
  const { data, error } = await supabaseAdmin.rpc('create_booking', {
    p_business_id: params.businessId,
    p_service_id: params.serviceId,
    p_professional_id: params.professionalId,
    p_customer_name: params.customerName,
    p_customer_email: params.customerEmail,
    p_customer_phone: params.customerPhone ?? null,
    p_start_time: params.startTime,
    p_end_time: params.endTime,
    p_amount_paid_cents: 0,
    p_notes: params.notes ?? null,
  });

  if (error) {
    console.error('Error creating booking:', error);
    throw new Error(error.message);
  }

  return data as unknown as Booking;
}

export async function confirmBooking(
  bookingId: string,
  paymentIntentId: string
): Promise<Booking> {
  const { data, error } = await supabaseAdmin.rpc('confirm_booking', {
    p_booking_id: bookingId,
    p_stripe_payment_intent_id: paymentIntentId,
  });

  if (error) {
    console.error('Error confirming booking:', error);
    throw new Error(error.message);
  }

  return data as unknown as Booking;
}

export interface BookingFilters {
  date?: string;
  status?: string;
  professionalId?: string;
  serviceId?: string;
  limit?: number;
  offset?: number;
}

export async function getBusinessBookings(
  businessId: string,
  filters: BookingFilters = {}
): Promise<BookingWithDetails[]> {
  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      service:services(*),
      professional:professionals(*),
      business:businesses(*)
    `)
    .eq('business_id', businessId)
    .order('start_time', { ascending: true });

  if (filters.date) {
    const startOfDay = `${filters.date}T00:00:00`;
    const endOfDay = `${filters.date}T23:59:59`;
    query = query.gte('start_time', startOfDay).lte('start_time', endOfDay);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.professionalId) {
    query = query.eq('professional_id', filters.professionalId);
  }

  if (filters.serviceId) {
    query = query.eq('service_id', filters.serviceId);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 100) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching business bookings:', error);
    return [];
  }

  return (data as unknown as BookingWithDetails[]) ?? [];
}

export async function getTodayBookings(businessId: string): Promise<BookingWithDetails[]> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  return getBusinessBookings(businessId, { date: dateStr });
}

export async function getMonthlyMetrics(businessId: string): Promise<DashboardMetrics> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const { data: monthlyBookings, error: monthlyError } = await supabaseAdmin
    .from('bookings')
    .select('amount_paid_cents, status')
    .eq('business_id', businessId)
    .gte('start_time', startOfMonth);

  if (monthlyError || !monthlyBookings) {
    console.error('Error fetching monthly bookings:', monthlyError);
    return {
      monthly_revenue: 0,
      weekly_bookings: 0,
      attendance_rate: 0,
      total_bookings: 0,
      revenue_change_pct: 0,
    };
  }

  const { data: monthlyPaymentBookings, error: paymentError } = await supabaseAdmin
    .from('bookings')
    .select('amount_paid_cents')
    .eq('business_id', businessId)
    .gte('start_time', startOfMonth)
    .not('amount_paid_cents', 'is', null);

  const { data: lastMonthPaymentBookings } = await supabaseAdmin
    .from('bookings')
    .select('amount_paid_cents')
    .eq('business_id', businessId)
    .gte('start_time', startOfLastMonth)
    .lte('start_time', endOfLastMonth)
    .not('amount_paid_cents', 'is', null);

  const { data: weeklyBookings, error: weeklyError } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('business_id', businessId)
    .gte('start_time', startOfWeek.toISOString());

  if (weeklyError) {
    console.error('Error fetching weekly bookings:', weeklyError);
  }

  const { data: totalBookings, error: totalError } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('business_id', businessId);

  if (totalError) {
    console.error('Error fetching total bookings:', totalError);
  }

  const monthlyRevenue = (monthlyPaymentBookings ?? []).reduce(
    (sum, b) => sum + (b.amount_paid_cents ?? 0),
    0
  );

  const lastMonthRevenue = (lastMonthPaymentBookings ?? []).reduce(
    (sum, b) => sum + (b.amount_paid_cents ?? 0),
    0
  );

  const completedCount = (monthlyBookings ?? []).filter(
    (b) => b.status === 'completed'
  ).length;
  const noShowCount = (monthlyBookings ?? []).filter(
    (b) => b.status === 'no_show'
  ).length;
  const attendanceRate =
    completedCount + noShowCount > 0
      ? Math.round((completedCount / (completedCount + noShowCount)) * 100)
      : 0;

  const revenueChangePct =
    lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : monthlyRevenue > 0
        ? 100
        : 0;

  return {
    monthly_revenue: monthlyRevenue,
    weekly_bookings: (weeklyBookings ?? []).length,
    attendance_rate: attendanceRate,
    total_bookings: (totalBookings ?? []).length,
    revenue_change_pct: revenueChangePct,
  };
}

export async function getYearlyActivity(
  businessId: string,
  year: number
): Promise<{ date: string; count: number }[]> {
  const startOfYear = new Date(year, 0, 1).toISOString();
  const endOfYear = new Date(year + 1, 0, 1).toISOString();

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('start_time')
    .eq('business_id', businessId)
    .gte('start_time', startOfYear)
    .lt('start_time', endOfYear);

  if (error || !data) {
    console.error('Error fetching yearly activity:', error);
    return [];
  }

  const counts: Record<string, number> = {};

  for (const booking of data) {
    const dateKey = (booking.start_time as string).split('T')[0];
    counts[dateKey] = (counts[dateKey] ?? 0) + 1;
  }

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}
