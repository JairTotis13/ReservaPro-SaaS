import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createCheckoutSession } from '@/lib/stripe';
import { createBooking } from '@/lib/booking-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      service_id,
      professional_id,
      customer_name,
      customer_email,
      customer_phone,
      start_time,
      end_time,
      amount,
      notes,
    } = body;

    if (!business_id || !service_id || !professional_id || !customer_name || !customer_email || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!customer_email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const amountCents = Math.round(Number(amount ?? 0));
    if (isNaN(amountCents) || amountCents < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      businessId: business_id,
      serviceId: service_id,
      professionalId: professional_id,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone ?? null,
      startTime: start_time,
      endTime: end_time,
      notes: notes ?? null,
    });

    const successUrl = `${request.nextUrl.origin}/booking/${business_id}/success?booking_id=${booking.id}`;
    const cancelUrl = `${request.nextUrl.origin}/booking/${business_id}?cancelled=true`;

    const session = await createCheckoutSession({
      amountCents: amountCents > 0 ? amountCents : 0,
      bookingId: booking.id,
      businessId: business_id,
      customerEmail: customer_email,
      customerName: customer_name,
      successUrl,
      cancelUrl,
    });

    if (session.id) {
      await supabaseAdmin
        .from('bookings')
        .update({
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
