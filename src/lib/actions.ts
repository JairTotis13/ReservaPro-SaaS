'use server';

import { createBooking, getAvailableSlots } from '@/lib/booking-engine';

interface CreateBookingActionParams {
  businessId: string;
  serviceId: string;
  professionalId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startTime: string;
  endTime: string;
}

export async function createBookingAction(params: CreateBookingActionParams) {
  const booking = await createBooking({
    businessId: params.businessId,
    serviceId: params.serviceId,
    professionalId: params.professionalId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    startTime: params.startTime,
    endTime: params.endTime,
  });

  return booking;
}

export async function getAvailableSlotsAction(
  professionalId: string,
  serviceId: string,
  date: string,
) {
  return getAvailableSlots(professionalId, serviceId, date);
}
