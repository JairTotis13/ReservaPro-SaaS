import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(parsed)} ${formatTime(parsed)}`;
}

export function getLocalDateFromUTC(utcDate: string, timezone: string): Date {
  const utc = new Date(utcDate);
  const offset = getTimezoneOffset(timezone, utc);
  return new Date(utc.getTime() + offset);
}

export function getUTCFromLocal(localDate: Date, timezone: string): string {
  const offset = getTimezoneOffset(timezone, localDate);
  return new Date(localDate.getTime() - offset).toISOString();
}

function getTimezoneOffset(timezone: string, date: Date): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = date.toLocaleString('en-US', { timeZone: timezone });
  const utcParsed = new Date(utcStr);
  const tzParsed = new Date(tzStr);
  return tzParsed.getTime() - utcParsed.getTime();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] ?? '';
}

export type PriceDisplay = { amount: string; cents: number };

export function formatPrice(cents: number): PriceDisplay {
  return {
    amount: formatCurrency(cents),
    cents,
  };
}
