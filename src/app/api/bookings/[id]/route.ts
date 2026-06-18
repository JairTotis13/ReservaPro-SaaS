import { NextRequest, NextResponse } from 'next/server';
import { createClient, getUser } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['confirm', 'cancel', 'complete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be confirm, cancel, or complete' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: businessData } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    const businessId = (businessData as { id: string }[] | null)?.[0]?.id;
    if (!businessId) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', bookingId)
      .eq('business_id', businessId)
      .single();

    const currentBooking = booking as { id: string; status: string } | null;

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const statusMap: Record<string, string> = {
      confirm: 'confirmed',
      cancel: 'cancelled',
      complete: 'completed',
    };

    const newStatus = statusMap[action];

    if (action === 'confirm' && currentBooking.status === 'confirmed') {
      return NextResponse.json(
        { error: 'Booking is already confirmed' },
        { status: 409 }
      );
    }

    if (action === 'cancel' && currentBooking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 409 }
      );
    }

    if (newStatus === currentBooking.status) {
      return NextResponse.json(
        { error: `Booking is already ${newStatus}` },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('business_id', businessId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      status: newStatus,
    });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
