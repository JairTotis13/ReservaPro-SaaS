export type UserRole = 'business_owner' | 'staff' | 'customer';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  monthly_price_cents: number;
  max_professionals: number;
  max_branches: number;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  working_hours: WorkingHours;
  slot_duration_minutes: number;
  whatsapp_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  stripe_account_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  [day: string]: { open: string; close: string } | null;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  business_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  professional_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_paid_cents: number | null;
  created_at: string;
  updated_at: string;
  service?: Service;
  professional?: Professional;
  business?: Business;
}

export interface BookingWithDetails extends Booking {
  service: Service;
  professional: Professional;
  business: Business;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled' | 'trialing';

export interface Subscription {
  id: string;
  business_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export type NotificationType = 'confirmation' | 'reminder_24h' | 'reminder_1h';
export type NotificationChannel = 'whatsapp' | 'email';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface NotificationLog {
  id: string;
  booking_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface TimeBlock {
  id: string;
  business_id: string;
  professional_id: string | null;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  monthly_revenue: number;
  weekly_bookings: number;
  attendance_rate: number;
  total_bookings: number;
  revenue_change_pct: number;
}

export interface BookingFormData {
  service_id: string;
  professional_id: string;
  date: Date;
  time_slot: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}
