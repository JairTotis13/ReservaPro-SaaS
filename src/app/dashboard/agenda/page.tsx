'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  X as XIcon,
} from 'lucide-react';
import { getBusinessBookings, getTodayBookings } from '@/lib/booking-engine';
import type { BookingWithDetails, Professional, BookingStatus } from '@/lib/types';
import { formatDate, formatTime, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'cancelled', label: 'Cancelados' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [professionalFilter, setProfessionalFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [updating, setUpdating] = useState(false);

  const weekDays = getWeekDays(currentDate);
  const todayStr = new Date().toISOString().split('T')[0];

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      const bid = businesses?.[0]?.id;
      if (!bid) return;
      setBusinessId(bid);

      const { data: profs } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', bid)
        .eq('is_active', true);

      setProfessionals((profs as Professional[]) ?? []);
    }
    init();
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    const all: BookingWithDetails[] = [];
    const current = new Date(weekStart);
    while (current <= weekEnd) {
      const dateStr = current.toISOString().split('T')[0];
      const dayBookings = await getBusinessBookings(businessId, {
        date: dateStr,
        professionalId: professionalFilter !== 'all' ? professionalFilter : undefined,
      });
      all.push(...dayBookings);
      current.setDate(current.getDate() + 1);
    }
    setBookings(all);
    setLoading(false);
  }, [businessId, weekDays, professionalFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((b) =>
    statusFilter === 'all' ? true : b.status === statusFilter
  );

  function getBookingsForDay(date: Date): BookingWithDetails[] {
    const dateStr = date.toISOString().split('T')[0];
    return filteredBookings.filter((b) => b.start_time.startsWith(dateStr));
  }

  function getBookingStyle(booking: BookingWithDetails, dayDate: string) {
    const startHour = new Date(booking.start_time).getHours();
    const startMin = new Date(booking.start_time).getMinutes();
    const endHour = new Date(booking.end_time).getHours();
    const endMin = new Date(booking.end_time).getMinutes();
    const top = startHour * 48 + (startMin / 60) * 48;
    const height = Math.max(
      (endHour * 48 + (endMin / 60) * 48) - top,
      24
    );
    const color = booking.service?.color ?? '#D4AF37';

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: color,
      opacity: booking.status === 'cancelled' ? 0.4 : 0.85,
    };
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    if (!businessId || updating) return;
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('business_id', businessId);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
    setUpdating(false);
  };

  const statusCounts = {
    all: filteredBookings.length,
    pending: filteredBookings.filter((b) => b.status === 'pending').length,
    confirmed: filteredBookings.filter((b) => b.status === 'confirmed').length,
    cancelled: filteredBookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-sm text-dark-200 mt-1">Vista semanal de turnos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="flex items-center gap-1.5 rounded-lg border border-dark-400 px-3 py-2 text-sm text-dark-100 hover:bg-dark-600 hover:text-white transition-colors"
          >
            <CalendarIcon className="size-4" />
            Hoy
          </button>
          <div className="flex items-center rounded-lg border border-dark-400 bg-dark-700">
            <button
              onClick={prevWeek}
              className="p-1.5 text-dark-200 hover:text-white transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 text-sm text-white font-medium min-w-[160px] text-center">
              {formatDate(weekDays[0], { month: 'short', day: 'numeric' })} -{' '}
              {formatDate(weekDays[6], { month: 'short', day: 'numeric' })}
            </span>
            <button
              onClick={nextWeek}
              className="p-1.5 text-dark-200 hover:text-white transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_TABS.map((tab) => (
          <div
            key={tab.key}
            className="card-dark p-3 text-center"
          >
            <p className="text-xs text-dark-200 uppercase">{tab.label}</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {statusCounts[tab.key as keyof typeof statusCounts] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                statusFilter === tab.key
                  ? 'bg-gold-500/15 text-gold-500 border border-gold-500/30'
                  : 'bg-dark-600 text-dark-200 border border-dark-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={professionalFilter}
          onChange={(e) => setProfessionalFilter(e.target.value)}
          className="input-dark w-auto"
        >
          <option value="all">Todos los profesionales</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card-dark overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-dark-500">
              <div className="p-2" />
              {weekDays.map((day) => {
                const isToday = day.toISOString().split('T')[0] === todayStr;
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'p-2 text-center border-l border-dark-500',
                      isToday && 'bg-gold-500/10'
                    )}
                  >
                    <p className="text-[11px] text-dark-300 uppercase">
                      {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </p>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        isToday ? 'text-gold-500' : 'text-white'
                      )}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              className="grid grid-cols-[60px_repeat(7,1fr)]"
              style={{ minHeight: `${24 * 48}px` }}
            >
              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full text-right pr-2"
                    style={{ top: `${hour * 48}px` }}
                  >
                    <span className="text-[10px] text-dark-300 -mt-2 block">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIdx) => {
                const dayStr = day.toISOString().split('T')[0];
                const dayBookings = getBookingsForDay(day);
                return (
                  <div
                    key={dayStr}
                    className="relative border-l border-dark-500"
                  >
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="absolute inset-x-0 border-t border-dark-500/30"
                        style={{ top: `${hour * 48}px`, height: '1px' }}
                      />
                    ))}
                    {dayBookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="absolute inset-x-px rounded px-1.5 py-0.5 cursor-pointer hover:brightness-110 transition-all text-left overflow-hidden group"
                        style={getBookingStyle(booking, dayStr)}
                      >
                        <p className="text-[10px] font-medium text-white truncate leading-tight">
                          {formatTime(booking.start_time)}
                        </p>
                        <p className="text-[10px] text-white/80 truncate leading-tight">
                          {booking.customer_name}
                        </p>
                        <p className="text-[10px] text-white/70 truncate leading-tight">
                          {booking.service?.name}
                        </p>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSelectedBooking(null)}
          />
          <div className="relative w-full max-w-md card-dark mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-dark-500">
              <h3 className="text-lg font-semibold text-white">
                Detalles del Turno
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-dark-200 hover:text-white transition-colors"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'badge',
                    selectedBooking.status === 'confirmed'
                      ? 'badge-success'
                      : selectedBooking.status === 'pending'
                        ? 'badge-warning'
                        : selectedBooking.status === 'cancelled'
                          ? 'badge-danger'
                          : 'badge-info'
                  )}
                >
                  {selectedBooking.status === 'confirmed'
                    ? 'Confirmado'
                    : selectedBooking.status === 'pending'
                      ? 'Pendiente'
                      : selectedBooking.status === 'cancelled'
                        ? 'Cancelado'
                        : selectedBooking.status === 'completed'
                          ? 'Completado'
                          : 'No asistió'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="size-4 text-gold-500 shrink-0" />
                  <span className="text-white">{selectedBooking.customer_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-gold-500 shrink-0" />
                  <span className="text-dark-100">{selectedBooking.customer_email}</span>
                </div>
                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-gold-500 shrink-0" />
                    <span className="text-dark-100">{selectedBooking.customer_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="size-4 text-gold-500 shrink-0" />
                  <span className="text-white">
                    {formatDate(selectedBooking.start_time)} {formatTime(selectedBooking.start_time)} -{' '}
                    {formatTime(selectedBooking.end_time)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4 text-gold-500 shrink-0" />
                  <span className="text-dark-100">
                    {selectedBooking.service?.name} con{' '}
                    {selectedBooking.professional?.name}
                  </span>
                </div>
              </div>

              {selectedBooking.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                    disabled={updating}
                    className="btn-gold flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold"
                  >
                    {updating ? 'Actualizando...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                    disabled={updating}
                    className="flex-1 rounded-lg border border-danger/30 text-danger px-4 py-2.5 text-sm font-semibold hover:bg-danger/10 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {selectedBooking.status === 'confirmed' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                    disabled={updating}
                    className="btn-gold flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold"
                  >
                    Marcar Completado
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                    disabled={updating}
                    className="flex-1 rounded-lg border border-danger/30 text-danger px-4 py-2.5 text-sm font-semibold hover:bg-danger/10 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
