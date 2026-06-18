'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createBookingAction, getAvailableSlotsAction } from '@/lib/actions';
import { cn, calculateEndTime, getUTCFromLocal } from '@/lib/utils';
import { bookingSchema } from '@/lib/validations';
import { ServiceSelector } from '@/components/booking/service-selector';
import { ProfessionalSelector } from '@/components/booking/professional-selector';
import { DatePicker } from '@/components/booking/date-picker';
import { TimeSlots } from '@/components/booking/time-slots';
import { ClientForm } from '@/components/booking/client-form';
import { BookingSummary } from '@/components/booking/booking-summary';
import { BookingStepper } from '@/components/booking/booking-stepper';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import type { Business, Service, Professional } from '@/lib/types';
import type { AvailableSlot } from '@/lib/booking-engine';
import type { BookingFormData } from '@/lib/types';

const STEPS = [
  { label: 'Servicio' },
  { label: 'Fecha/Hora' },
  { label: 'Datos' },
  { label: 'Pago' },
];

function getDayKey(day: number): string {
  const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return keys[day] ?? '';
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ business_slug: string }>;
}) {
  const [businessSlug, setBusinessSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setBusinessSlug(p.business_slug));
  }, [params]);

  const [step, setStep] = useState(1);

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessSlug) return;
    const slug = businessSlug as string;

    async function fetchData() {
      setInitialLoading(true);

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (businessError || !businessData) {
        setInitialLoading(false);
        return;
      }

      const typedBusiness = businessData as unknown as Business;

      const [servicesRes, professionalsRes] = await Promise.all([
        supabase
          .from('services')
          .select('*')
          .eq('business_id', typedBusiness.id)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('professionals')
          .select('*')
          .eq('business_id', typedBusiness.id)
          .eq('is_active', true)
          .order('name'),
      ]);

      setBusiness(typedBusiness);
      setServices((servicesRes.data as unknown as Service[]) ?? []);
      setProfessionals((professionalsRes.data as unknown as Professional[]) ?? []);
      setInitialLoading(false);
    }

    fetchData();
  }, [businessSlug]);

  useEffect(() => {
    if (professionals.length === 1) {
      setSelectedProfessionalId(professionals[0].id);
    }
  }, [professionals]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const selectedProfessional = useMemo(
    () => professionals.find((p) => p.id === selectedProfessionalId) ?? null,
    [professionals, selectedProfessionalId],
  );

  const availableDays = useMemo(() => {
    if (!business) return [];

    const workingHours = business.working_hours;
    const days: number[] = [];

    for (let d = 0; d < 7; d++) {
      const key = getDayKey(d);
      if (workingHours[key] && workingHours[key] !== null) {
        days.push(d);
      }
    }

    return days;
  }, [business]);

  const selectedSlot = useMemo(() => {
    if (!selectedTimeSlot) return null;
    return availableSlots.find((s) => s.start === selectedTimeSlot) ?? null;
  }, [availableSlots, selectedTimeSlot]);

  useEffect(() => {
    if (!selectedProfessionalId || !selectedServiceId || !selectedDate) {
      setAvailableSlots([]);
      setSelectedTimeSlot(null);
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSelectedTimeSlot(null);

      const dateStr = selectedDate.toISOString().split('T')[0];

      try {
        const slots = await getAvailableSlotsAction(
          selectedProfessionalId,
          selectedServiceId,
          dateStr,
        );
        setAvailableSlots(slots);
      } catch {
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedProfessionalId, selectedServiceId, selectedDate]);

  const validateStep3 = useCallback((): boolean => {
    const currentData = {
      customer_name: formData.customer_name ?? '',
      customer_email: formData.customer_email ?? '',
      customer_phone: formData.customer_phone ?? '',
    };

    const result = bookingSchema.pick({
      customer_name: true,
      customer_email: true,
      customer_phone: true,
    }).safeParse(currentData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    return true;
  }, [formData]);

  const handleNext = () => {
    if (step === 1 && !selectedServiceId) return;
    if (step === 2 && (!selectedProfessionalId || !selectedTimeSlot)) return;

    if (step === 3) {
      if (!validateStep3()) return;
    }

    if (step < 4) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!business || !selectedService || !selectedProfessional || !selectedSlot || !selectedDate) {
      return;
    }

    if (!validateStep3()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const localStart = new Date(`${dateStr}T${selectedSlot.start}:00`);
      const localEnd = new Date(`${dateStr}T${selectedSlot.end}:00`);

      const startUTC = getUTCFromLocal(localStart, business.timezone);
      const endUTC = getUTCFromLocal(localEnd, business.timezone);

      const customerName = (formData.customer_name ?? '').trim();
      const customerEmail = (formData.customer_email ?? '').trim();
      const customerPhone = (formData.customer_phone ?? '').trim() || undefined;

      const booking = await createBookingAction({
        businessId: business.id,
        serviceId: selectedService.id,
        professionalId: selectedProfessional.id,
        customerName,
        customerEmail,
        customerPhone,
        startTime: startUTC,
        endTime: endUTC,
      });

      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          service_id: selectedService.id,
          professional_id: selectedProfessional.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone ?? '',
          start_time: startUTC,
          end_time: endUTC,
          amount: selectedService.price_cents,
          booking_id: booking.id,
        }),
      });

      if (!checkoutRes.ok) {
        const errBody = await checkoutRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error ?? 'Error al crear la sesion de pago');
      }

      const { url } = (await checkoutRes.json()) as { url: string };

      if (!url) {
        throw new Error('No se pudo crear la sesion de pago');
      }

      window.location.href = url;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ocurrio un error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 text-gold-500 animate-spin" />
          <p className="text-sm text-dark-200">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-dark-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-dark-300">!</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Negocio no disponible</h2>
          <p className="text-sm text-dark-200">
            No se pudo cargar la informacion del negocio. Intenta de nuevo mas tarde.
          </p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-dark-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-dark-300">!</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Sin servicios disponibles</h2>
          <p className="text-sm text-dark-200">
            Este negocio no tiene servicios activos en este momento. Vuelve a intentarlo mas tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <BookingStepper currentStep={step} steps={STEPS} />
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Selecciona un servicio</h2>
            <p className="text-sm text-dark-200">Elige el servicio que queres reservar.</p>
          </div>
          <ServiceSelector
            services={services}
            selected={selectedServiceId}
            onSelect={setSelectedServiceId}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Elegi fecha y horario</h2>
            <p className="text-sm text-dark-200">Selecciona cuando queres tu turno.</p>
          </div>

          <ProfessionalSelector
            professionals={professionals}
            selected={selectedProfessionalId}
            onSelect={(id) => {
              setSelectedProfessionalId(id);
              setSelectedTimeSlot(null);
              setAvailableSlots([]);
            }}
          />

          {selectedProfessionalId && (
            <>
              <div className="card-dark p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Selecciona una fecha</h3>
                <DatePicker
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTimeSlot(null);
                  }}
                  availableDays={availableDays}
                  timezone={business.timezone}
                />
              </div>

              {selectedDate && (
                <div className="card-dark p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Horarios disponibles</h3>
                  <TimeSlots
                    slots={availableSlots}
                    selected={selectedTimeSlot}
                    onSelect={setSelectedTimeSlot}
                    loading={slotsLoading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Tus datos</h2>
            <p className="text-sm text-dark-200">Completa la informacion para confirmar la reserva.</p>
          </div>

          <div className="card-dark p-4 sm:p-6">
            <ClientForm
              formData={formData}
              onChange={(data) => {
                setFormData((prev) => ({ ...prev, ...data }));
                if (Object.keys(formErrors).length > 0) {
                  setFormErrors({});
                }
              }}
              errors={formErrors}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Confirmar y pagar</h2>
            <p className="text-sm text-dark-200">Revisa los detalles antes de confirmar tu reserva.</p>
          </div>

          <BookingSummary
            service={selectedService}
            professional={selectedProfessional}
            date={selectedDate ?? null}
            timeSlot={selectedTimeSlot}
          />

          {submitError && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30">
              <p className="text-sm text-danger">{submitError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2',
              'btn-gold',
              submitting && 'opacity-70 pointer-events-none',
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Reservar y Pagar'
            )}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-500/50">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            disabled={submitting}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium text-dark-200 hover:text-white hover:bg-dark-600 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="size-4" />
            Anterior
          </button>
        ) : (
          <div />
        )}

        {step < 4 && (
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedServiceId) ||
              (step === 2 && (!selectedProfessionalId || !selectedTimeSlot)) ||
              submitting
            }
            className={cn(
              'inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold transition-all duration-200',
              'btn-gold',
              'disabled:opacity-50 disabled:pointer-events-none',
            )}
          >
            Siguiente
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
