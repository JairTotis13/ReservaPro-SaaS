import { z } from 'zod';

export const bookingSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().optional().or(z.literal('')),
  service_id: z.string().uuid('Invalid service ID'),
  professional_id: z.string().uuid('Invalid professional ID'),
  date: z.string().min(1, 'Date is required'),
  time_slot: z.string().min(1, 'Time slot is required'),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const businessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  timezone: z.string().min(1, 'Timezone is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export type BusinessInput = z.infer<typeof businessSchema>;

export const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  duration_minutes: z.number().int('Duration must be a whole number').min(5, 'Minimum duration is 5 minutes').max(480, 'Maximum duration is 480 minutes'),
  price_cents: z.number().int('Price must be a whole number').min(0, 'Price cannot be negative'),
  color: z.string().optional().or(z.literal('')),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const professionalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;
