// Types for the Supabase Database schema
// This is a basic type definition. For production, generate types using:
// npx supabase gen types typescript --linked > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          timezone: string;
          working_hours: Json;
          slot_duration_minutes: number;
          whatsapp_notifications_enabled: boolean;
          email_notifications_enabled: boolean;
          stripe_account_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          timezone?: string;
          working_hours?: Json;
          slot_duration_minutes?: number;
          whatsapp_notifications_enabled?: boolean;
          email_notifications_enabled?: boolean;
          stripe_account_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          timezone?: string;
          working_hours?: Json;
          slot_duration_minutes?: number;
          whatsapp_notifications_enabled?: boolean;
          email_notifications_enabled?: boolean;
          stripe_account_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
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
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          price_cents?: number;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price_cents?: number;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      professionals: {
        Row: {
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
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      availability: {
        Row: {
          id: string;
          professional_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          professional_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          business_id: string;
          service_id: string;
          professional_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          start_time: string;
          end_time: string;
          status: string;
          notes: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          amount_paid_cents: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          service_id: string;
          professional_id?: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          start_time: string;
          end_time: string;
          status?: string;
          notes?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_paid_cents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          service_id?: string;
          professional_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          start_time?: string;
          end_time?: string;
          status?: string;
          notes?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_paid_cents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      time_blocks: {
        Row: {
          id: string;
          business_id: string;
          professional_id: string | null;
          start_time: string;
          end_time: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          professional_id?: string | null;
          start_time: string;
          end_time: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          professional_id?: string | null;
          start_time?: string;
          end_time?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          monthly_price_cents: number;
          max_professionals: number;
          max_branches: number;
          features: Json;
          stripe_price_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          monthly_price_cents: number;
          max_professionals?: number;
          max_branches?: number;
          features?: Json;
          stripe_price_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          monthly_price_cents?: number;
          max_professionals?: number;
          max_branches?: number;
          features?: Json;
          stripe_price_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          business_id: string;
          plan_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          plan_id: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          plan_id?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          id: string;
          booking_id: string;
          type: string;
          channel: string;
          status: string;
          sent_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          type: string;
          channel: string;
          status?: string;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          type?: string;
          channel?: string;
          status?: string;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking: {
        Args: {
          p_business_id: string;
          p_service_id: string;
          p_professional_id: string;
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string | null;
          p_start_time: string;
          p_end_time: string;
          p_amount_paid_cents: number;
          p_stripe_session_id?: string;
          p_stripe_payment_intent_id?: string;
          p_notes?: string | null;
        };
        Returns: string;
      };
      confirm_booking: {
        Args: {
          p_booking_id: string;
          p_stripe_payment_intent_id: string;
        };
        Returns: void;
      };
      get_available_slots: {
        Args: {
          p_professional_id: string;
          p_service_id: string;
          p_date: string;
        };
        Returns: {
          slot_start: string;
          slot_end: string;
        }[];
      };
    };
  };
}
