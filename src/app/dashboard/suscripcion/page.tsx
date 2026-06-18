'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createSubscription, cancelSubscription } from '@/lib/stripe';
import type { Subscription, Business, SubscriptionPlan } from '@/lib/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export default function SuscripcionPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [professionalsCount, setProfessionalsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .limit(1);

    const b = (businesses?.[0] as Business) ?? null;
    if (!b) return;
    setBusiness(b);

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('business_id', b.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const sub = (subs?.[0] as unknown as Subscription) ?? null;
    setSubscription(sub);
    setPlan(sub?.plan ?? null);

    const { data: allPlans } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('monthly_price_cents', { ascending: true });

    setPlans((allPlans as SubscriptionPlan[]) ?? []);

    const { count } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', b.id);

    setProfessionalsCount(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = async (selectedPlan: SubscriptionPlan) => {
    if (!business || !selectedPlan.stripe_price_id) return;
    setActionLoading(true);

    try {
      const session = await createSubscription({
        priceId: selectedPlan.stripe_price_id,
        businessId: business.id,
        customerEmail: business.email ?? '',
        successUrl: `${window.location.origin}/dashboard/suscripcion?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/suscripcion?cancelled=true`,
      });

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription?.stripe_subscription_id) return;
    setActionLoading(true);

    try {
      await cancelSubscription(subscription.stripe_subscription_id);
      await fetchData();
      setShowCancelModal(false);
    } catch (err) {
      console.error('Error canceling subscription:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const statusLabel: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    past_due: 'Pago pendiente',
    cancelled: 'Cancelado',
    trialing: 'Período de prueba',
  };

  const statusBadge: Record<string, string> = {
    active: 'badge badge-success',
    inactive: 'badge badge-danger',
    past_due: 'badge badge-warning',
    cancelled: 'badge badge-danger',
    trialing: 'badge badge-info',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer h-8 w-56 rounded" />
        <div className="shimmer h-64 rounded-xl" />
        <div className="shimmer h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Suscripción</h1>
        <p className="text-sm text-dark-200 mt-1">
          Administra tu plan y facturación
        </p>
      </div>

      {subscription && plan && (
        <div className="card-dark p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gold-500/15">
              <CreditCard className="size-6 text-gold-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {plan.display_name || plan.name}
              </h3>
              <span className={statusBadge[subscription.status] ?? 'badge badge-info'}>
                {statusLabel[subscription.status] ?? subscription.status}
              </span>
            </div>
          </div>

          {subscription.current_period_start && subscription.current_period_end && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-dark-200 uppercase">Período actual</p>
                <p className="text-sm text-white">
                  {formatDate(subscription.current_period_start)} -{' '}
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
              <div>
                <p className="text-xs text-dark-200 uppercase">Precio mensual</p>
                <p className="text-sm text-gold-500 font-semibold">
                  {formatCurrency(plan.monthly_price_cents)}/mes
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-dark-500 pt-4">
            <p className="text-xs text-dark-200 uppercase mb-2">Uso actual</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-100">Profesionales</span>
                  <span className="text-white">
                    {professionalsCount} / {plan.max_professionals}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-dark-500 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold-500 transition-all"
                    style={{
                      width: `${Math.min(
                        (professionalsCount / plan.max_professionals) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-500 pt-4">
            <p className="text-xs text-dark-200 uppercase mb-3">Características del plan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.features?.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-success shrink-0" />
                  <span className="text-dark-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {subscription.status === 'active' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="rounded-lg border border-danger/30 text-danger px-4 py-2.5 text-sm font-medium hover:bg-danger/10 transition-colors"
              >
                Cancelar suscripción
              </button>
            )}
            {subscription.stripe_subscription_id && (
              <a
                href={`https://billing.stripe.com/p/login/test`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-dark-400 text-dark-100 px-4 py-2.5 text-sm font-medium hover:bg-dark-600 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink className="size-4" />
                Portal de facturación
              </a>
            )}
          </div>
        </div>
      )}

      {!subscription && (
        <div className="card-dark p-6 text-center space-y-3">
          <CreditCard className="size-12 text-dark-300 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Sin plan activo
            </h3>
            <p className="text-sm text-dark-200 mt-1">
              Elige un plan para comenzar
            </p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Planes Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrentPlan = subscription?.plan_id === p.id;
            return (
              <div
                key={p.id}
                className={cn(
                  'card-dark p-5 flex flex-col relative overflow-hidden',
                  isCurrentPlan && 'ring-1 ring-gold-500'
                )}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-gold-500 text-dark-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Actual
                  </div>
                )}
                <h4 className="text-base font-semibold text-white">
                  {p.display_name || p.name}
                </h4>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-bold text-white">
                    {formatCurrency(p.monthly_price_cents)}
                  </span>
                  <span className="text-sm text-dark-200">/mes</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-success shrink-0" />
                      <span className="text-dark-100">{f}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-success shrink-0" />
                    <span className="text-dark-100">
                      Hasta {p.max_professionals} profesionales
                    </span>
                  </li>
                </ul>
                {isCurrentPlan ? (
                  <div className="rounded-lg bg-dark-700 py-2.5 text-center text-sm text-dark-200 font-medium">
                    Plan actual
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(p)}
                    disabled={actionLoading || !p.stripe_price_id}
                    className={cn(
                      'btn-gold rounded-lg px-4 py-2.5 text-sm font-semibold w-full flex items-center justify-center gap-2',
                      (!p.stripe_price_id) && 'opacity-50 pointer-events-none'
                    )}
                  >
                    {actionLoading && <Loader2 className="size-4 animate-spin" />}
                    {subscription ? 'Cambiar plan' : 'Comenzar'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative w-full max-w-md card-dark mx-4 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-danger/15">
                <AlertCircle className="size-5 text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Cancelar suscripción
              </h3>
            </div>
            <p className="text-sm text-dark-200 mb-6">
              ¿Estás seguro de que quieres cancelar tu suscripción? Perderás el
              acceso a las funcionalidades premium al final del período actual.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-lg border border-dark-400 px-4 py-2.5 text-sm text-dark-100 hover:bg-dark-600 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="rounded-lg bg-danger/15 text-danger border border-danger/30 px-4 py-2.5 text-sm font-medium hover:bg-danger/25 transition-colors flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="size-4 animate-spin" />}
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
