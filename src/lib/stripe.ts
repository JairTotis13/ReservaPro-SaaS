import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
});

export interface CreateCheckoutSessionParams {
  amountCents: number;
  currency?: string;
  bookingId: string;
  businessId: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const {
    amountCents,
    currency = 'usd',
    bookingId,
    businessId,
    customerEmail,
    customerName,
    successUrl,
    cancelUrl,
    metadata = {},
  } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: 'Reserva de Cita',
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      booking_id: bookingId,
      business_id: businessId,
      customer_name: customerName,
      ...metadata,
    },
  });

  return session;
}

export interface CreateSubscriptionParams {
  priceId: string;
  businessId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createSubscription(params: CreateSubscriptionParams) {
  const { priceId, businessId, customerEmail, successUrl, cancelUrl, metadata = {} } = params;

  const customers = await stripe.customers.list({
    email: customerEmail,
    limit: 1,
  });

  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: { business_id: businessId },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      business_id: businessId,
      ...metadata,
    },
  });

  return session;
}

export async function cancelSubscription(stripeSubscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
  return subscription;
}

export async function getSubscription(stripeSubscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  return subscription;
}
