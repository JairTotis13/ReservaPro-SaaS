import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { confirmBooking } from '@/lib/booking-engine';
import {
  sendConfirmationEmail,
  sendConfirmationWhatsApp,
} from '@/lib/notifications';
import type { BookingWithDetails } from '@/lib/types';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? '';

        if (!bookingId) {
          console.error('No booking_id in session metadata');
          break;
        }

        const confirmedBooking = await confirmBooking(bookingId, paymentIntentId);

        const { data: bookingWithDetails } = await supabaseAdmin
          .from('bookings')
          .select('*, service:services(*), professional:professionals(*), business:businesses(*)')
          .eq('id', bookingId)
          .single();

        if (bookingWithDetails) {
          const details = bookingWithDetails as unknown as BookingWithDetails;

          try {
            await sendConfirmationEmail(details);
          } catch (emailErr) {
            console.error('Failed to send confirmation email:', emailErr);
          }

          try {
            await sendConfirmationWhatsApp(details);
          } catch (waErr) {
            console.error('Failed to send confirmation WhatsApp:', waErr);
          }
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer.id;

        const statusMap: Record<string, string> = {
          active: 'active',
          past_due: 'past_due',
          unpaid: 'past_due',
          canceled: 'cancelled',
          incomplete: 'inactive',
          incomplete_expired: 'inactive',
          trialing: 'trialing',
        };

        const mappedStatus = statusMap[stripeSub.status] ?? 'inactive';

        const rawSub = stripeSub as unknown as Record<string, unknown>;
        const periodStart = rawSub.current_period_start as number | null;
        const periodEnd = rawSub.current_period_end as number | null;

        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: mappedStatus,
            stripe_subscription_id: stripeSub.id,
            stripe_customer_id: customerId,
            current_period_start: periodStart
              ? new Date(periodStart * 1000).toISOString()
              : null,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSub.id);

        if (subError) {
          const { data: businesses } = await supabaseAdmin
            .from('businesses')
            .select('id')
            .eq('stripe_account_id', customerId)
            .limit(1);

          const businessId = businesses?.[0]?.id;

          if (businessId) {
            const { data: existingSub } = await supabaseAdmin
              .from('subscriptions')
              .select('id')
              .eq('stripe_subscription_id', stripeSub.id)
              .limit(1);

            if (existingSub?.length === 0 && event.type === 'customer.subscription.created') {
              const { data: plan } = await supabaseAdmin
                .from('subscription_plans')
                .select('id')
                .eq('stripe_price_id', stripeSub.items.data[0]?.price?.id as string)
                .limit(1);

              const planId = plan?.[0]?.id;
              await supabaseAdmin.from('subscriptions').insert({
                business_id: businessId,
                plan_id: planId as string,
                stripe_subscription_id: stripeSub.id,
                stripe_customer_id: customerId,
                status: mappedStatus,
                current_period_start: periodStart
                  ? new Date(periodStart * 1000).toISOString()
                  : null,
                current_period_end: periodEnd
                  ? new Date(periodEnd * 1000).toISOString()
                  : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
