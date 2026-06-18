-- ============================================================
-- RESERVAPRO - Script de RESET completo
-- Ejecutar en Supabase SQL Editor para empezar desde cero
-- ============================================================

-- 1. ELIMINAR TODO (orden inverso por dependencias)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_booking;
DROP FUNCTION IF EXISTS public.confirm_booking;
DROP FUNCTION IF EXISTS public.get_available_slots;

DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.time_blocks CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.availability CASCADE;
DROP TABLE IF EXISTS public.professionals CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. PERFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'business_owner' CHECK (role IN ('business_owner', 'staff', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'role', 'business_owner'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. PLANES
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  monthly_price_cents INTEGER NOT NULL,
  max_professionals INTEGER NOT NULL,
  max_branches INTEGER NOT NULL DEFAULT 1,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.subscription_plans (name, display_name, monthly_price_cents, max_professionals, max_branches, features) VALUES
  ('basic', 'Plan Básico', 299900, 1, 1, '["Agenda de turnos","Reservas básicas","Notificaciones por email"]'::jsonb),
  ('pro', 'Plan Pro', 599900, 5, 1, '["Agenda de turnos","Reservas básicas","Notificaciones WhatsApp","Integración Stripe propia","Hasta 5 profesionales"]'::jsonb),
  ('premium', 'Plan Premium', 999900, 999999, 10, '["Agenda de turnos","Reservas avanzadas","Notificaciones WhatsApp","Integración Stripe propia","Profesionales ilimitados","Reportes avanzados","Multi-sucursal","Soporte prioritario"]'::jsonb);

-- 5. NEGOCIOS
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  working_hours JSONB NOT NULL DEFAULT '{"monday":{"open":"09:00","close":"18:00"},"tuesday":{"open":"09:00","close":"18:00"},"wednesday":{"open":"09:00","close":"18:00"},"thursday":{"open":"09:00","close":"18:00"},"friday":{"open":"09:00","close":"18:00"},"saturday":null,"sunday":null}'::jsonb,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  whatsapp_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  stripe_account_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SERVICIOS
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_cents INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#D4AF37',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROFESIONALES
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  color TEXT DEFAULT '#D4AF37',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DISPONIBILIDAD
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(professional_id, day_of_week, start_time, end_time)
);

-- 9. RESERVAS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  service_id UUID NOT NULL REFERENCES public.services(id),
  professional_id UUID REFERENCES public.professionals(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_bookings_no_double_book ON public.bookings (professional_id, start_time) WHERE status NOT IN ('cancelled');
CREATE INDEX idx_bookings_business_id ON public.bookings(business_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);

-- 10. BLOQUEOS
CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SUSCRIPCIONES
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICACIONES
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder_24h', 'reminder_1h')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIONES PL/pgSQL
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_booking(
  p_business_id UUID,
  p_service_id UUID,
  p_professional_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_amount_paid_cents INTEGER,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_available BOOLEAN;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.professionals WHERE id = p_professional_id AND is_active = true AND business_id = p_business_id) THEN
    RAISE EXCEPTION 'El profesional no está disponible';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE id = p_service_id AND is_active = true AND business_id = p_business_id) THEN
    RAISE EXCEPTION 'El servicio no está disponible';
  END IF;

  IF p_start_time <= NOW() THEN
    RAISE EXCEPTION 'No se puede reservar un turno en el pasado';
  END IF;

  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.professional_id = p_professional_id AND b.status NOT IN ('cancelled') AND b.start_time < p_end_time AND b.end_time > p_start_time
    UNION ALL
    SELECT 1 FROM public.time_blocks tb
    WHERE (tb.professional_id = p_professional_id OR tb.business_id = p_business_id) AND tb.start_time < p_end_time AND tb.end_time > p_start_time
  ) INTO v_available;

  IF NOT v_available THEN
    RAISE EXCEPTION 'El horario ya no está disponible (conflicto de reserva)';
  END IF;

  INSERT INTO public.bookings (business_id, service_id, professional_id, customer_name, customer_email, customer_phone, start_time, end_time, status, stripe_session_id, stripe_payment_intent_id, amount_paid_cents, notes)
  VALUES (p_business_id, p_service_id, p_professional_id, p_customer_name, p_customer_email, p_customer_phone, p_start_time, p_end_time, 'pending', p_stripe_session_id, p_stripe_payment_intent_id, p_amount_paid_cents, p_notes)
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_id UUID, p_stripe_payment_intent_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.bookings SET status = 'confirmed', stripe_payment_intent_id = p_stripe_payment_intent_id, updated_at = NOW()
  WHERE id = p_booking_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró la reserva o ya fue procesada';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_professional_id UUID, p_service_id UUID, p_date DATE
)
RETURNS TABLE (slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ) AS $$
DECLARE
  v_business_id UUID;
  v_duration_minutes INTEGER;
  v_day_of_week INTEGER;
  v_business_tz TEXT;
  v_open TIME;
  v_close TIME;
  v_slot TIMESTAMPTZ;
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
BEGIN
  SELECT s.business_id, s.duration_minutes INTO v_business_id, v_duration_minutes FROM public.services s WHERE s.id = p_service_id;
  SELECT b.timezone INTO v_business_tz FROM public.businesses b WHERE b.id = v_business_id;
  v_day_of_week := EXTRACT(DOW FROM p_date);

  SELECT a.start_time, a.end_time INTO v_open, v_close
  FROM public.availability a WHERE a.professional_id = p_professional_id AND a.day_of_week = v_day_of_week LIMIT 1;

  IF v_open IS NULL THEN RETURN; END IF;

  v_day_start := (p_date + v_open) AT TIME ZONE v_business_tz AT TIME ZONE 'UTC';
  v_day_end := (p_date + v_close) AT TIME ZONE v_business_tz AT TIME ZONE 'UTC';
  v_slot := v_day_start;

  WHILE v_slot + (v_duration_minutes || ' minutes')::INTERVAL <= v_day_end LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.bookings b WHERE b.professional_id = p_professional_id AND b.status NOT IN ('cancelled') AND b.start_time < v_slot + (v_duration_minutes || ' minutes')::INTERVAL AND b.end_time > v_slot
    ) AND NOT EXISTS (
      SELECT 1 FROM public.time_blocks tb WHERE (tb.professional_id = p_professional_id OR tb.business_id = v_business_id) AND tb.start_time < v_slot + (v_duration_minutes || ' minutes')::INTERVAL AND tb.end_time > v_slot
    ) AND v_slot > NOW() THEN
      slot_start := v_slot; slot_end := v_slot + (v_duration_minutes || ' minutes')::INTERVAL;
      RETURN NEXT;
    END IF;
    v_slot := v_slot + (v_duration_minutes || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owners manage their business" ON public.businesses FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Public view active businesses" ON public.businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Owners manage services" ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = services.business_id AND b.owner_id = auth.uid()));
CREATE POLICY "Public view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Owners manage professionals" ON public.professionals FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = professionals.business_id AND b.owner_id = auth.uid()));
CREATE POLICY "Public view active professionals" ON public.professionals FOR SELECT USING (is_active = true);
CREATE POLICY "Owners manage availability" ON public.availability FOR ALL USING (EXISTS (SELECT 1 FROM public.professionals p JOIN public.businesses b ON b.id = p.business_id WHERE p.id = availability.professional_id AND b.owner_id = auth.uid()));
CREATE POLICY "Owners manage bookings" ON public.bookings FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = bookings.business_id AND b.owner_id = auth.uid()));
CREATE POLICY "Professionals view their bookings" ON public.bookings FOR SELECT USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Owners view subscriptions" ON public.subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = subscriptions.business_id AND b.owner_id = auth.uid()));
CREATE POLICY "Owners view notification logs" ON public.notification_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings bk JOIN public.businesses b ON b.id = bk.business_id WHERE bk.id = notification_logs.booking_id AND b.owner_id = auth.uid()));
CREATE POLICY "Owners manage time blocks" ON public.time_blocks FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = time_blocks.business_id AND b.owner_id = auth.uid()));
