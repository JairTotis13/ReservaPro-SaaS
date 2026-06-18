'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CalendarCheck,
  Percent,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { getMonthlyMetrics, getTodayBookings, getYearlyActivity } from '@/lib/booking-engine';
import type { DashboardMetrics, BookingWithDetails } from '@/lib/types';
import { formatCurrency, formatTime, getMonthName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface ActivityData {
  date: string;
  count: number;
}

interface MonthlyChartData {
  month: string;
  bookings: number;
  revenue: number;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="card-dark p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-200">{label}</span>
        <div className="flex size-9 items-center justify-center rounded-lg bg-gold-500/10">
          <Icon className="size-4 text-gold-500" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trendUp ? 'text-success' : 'text-danger'
            )}
          >
            {trendUp ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function SkeletonMetricCard() {
  return (
    <div className="card-dark p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="shimmer h-4 w-24 rounded" />
        <div className="shimmer size-9 rounded-lg" />
      </div>
      <div className="shimmer h-8 w-28 rounded" />
    </div>
  );
}

function BookingRow({
  booking,
  onConfirm,
  onCancel,
}: {
  booking: BookingWithDetails;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const statusBadge = {
    pending: 'badge badge-warning',
    confirmed: 'badge badge-success',
    cancelled: 'badge badge-danger',
    completed: 'badge badge-info',
    no_show: 'badge badge-danger',
  } as const;

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado',
    no_show: 'No asistió',
  };

  return (
    <tr className="border-b border-dark-500 hover:bg-dark-700/50 transition-colors">
      <td className="py-3 px-4 text-sm text-white font-mono">
        {formatTime(booking.start_time)}
      </td>
      <td className="py-3 px-4 text-sm text-white">
        {booking.customer_name}
      </td>
      <td className="py-3 px-4 text-sm text-dark-200">
        {booking.service?.name ?? '-'}
      </td>
      <td className="py-3 px-4 text-sm text-dark-200">
        {booking.professional?.name ?? '-'}
      </td>
      <td className="py-3 px-4">
        <span className={statusBadge[booking.status]}>
          {statusLabels[booking.status] ?? booking.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onConfirm(booking.id)}
                className="flex size-8 items-center justify-center rounded-md bg-success/15 text-success hover:bg-success/30 transition-colors"
                title="Confirmar"
              >
                <Check className="size-4" />
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                className="flex size-8 items-center justify-center rounded-md bg-danger/15 text-danger hover:bg-danger/30 transition-colors"
                title="Cancelar"
              >
                <X className="size-4" />
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onCancel(booking.id)}
              className="flex size-8 items-center justify-center rounded-md bg-danger/15 text-danger hover:bg-danger/30 transition-colors"
              title="Cancelar"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [todayBookings, setTodayBookings] = useState<BookingWithDetails[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

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
    }
    init();
  }, []);

  const fetchData = useCallback(async (bid: string) => {
    setLoading(true);
    setError(null);
    try {
      const [m, today, yearly] = await Promise.all([
        getMonthlyMetrics(bid),
        getTodayBookings(bid),
        getYearlyActivity(bid, new Date().getFullYear()),
      ]);
      setMetrics(m);
      setTodayBookings(today);
      setActivityData(yearly);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (businessId) {
      fetchData(businessId);
    }
  }, [businessId, fetchData]);

  const handleConfirm = async (bookingId: string) => {
    if (!businessId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('business_id', businessId);

    if (!error) {
      setTodayBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'confirmed' as const } : b
        )
      );
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!businessId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('business_id', businessId);

    if (!error) {
      setTodayBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        )
      );
    }
  };

  const chartData: MonthlyChartData[] = (() => {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: getMonthName(i).slice(0, 3),
      bookings: 0,
      revenue: 0,
    }));

    for (const activity of activityData) {
      const monthIdx = new Date(activity.date).getMonth();
      months[monthIdx].bookings += activity.count;
      months[monthIdx].revenue += activity.count * 1000;
    }

    return months;
  })();

  const activityByDay: Record<string, number> = {};
  for (const item of activityData) {
    activityByDay[item.date] = item.count;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-sm text-dark-200 mt-1">
          Resumen de tu negocio y turnos del día
        </p>
      </div>

      {error && (
        <div className="card-dark border-danger/50 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </>
        ) : metrics ? (
          <>
            <MetricCard
              icon={DollarSign}
              label="Ingresos del Mes"
              value={formatCurrency(metrics.monthly_revenue)}
              trend={`${metrics.revenue_change_pct >= 0 ? '+' : ''}${metrics.revenue_change_pct}%`}
              trendUp={metrics.revenue_change_pct >= 0}
            />
            <MetricCard
              icon={CalendarCheck}
              label="Turnos esta Semana"
              value={String(metrics.weekly_bookings)}
            />
            <MetricCard
              icon={Percent}
              label="Tasa de Asistencia"
              value={`${metrics.attendance_rate}%`}
            />
            <MetricCard
              icon={ClipboardList}
              label="Turnos Totales"
              value={String(metrics.total_bookings)}
            />
          </>
        ) : null}
      </div>

      <div className="card-dark">
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div>
            <h3 className="text-lg font-semibold text-white">Turnos de Hoy</h3>
            <p className="text-sm text-dark-200 mt-1">
              {loading
                ? 'Cargando...'
                : `${todayBookings.length} turno${todayBookings.length !== 1 ? 's' : ''} programado${todayBookings.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/dashboard/agenda"
            className="flex items-center gap-1 text-sm text-gold-500 hover:text-gold-400 transition-colors"
          >
            Ver todos
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="shimmer h-12 rounded-lg" />
              ))}
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark-200">
              <CalendarCheck className="size-12 mb-3 opacity-50" />
              <p className="text-sm">No hay turnos programados para hoy</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-500">
                    <th className="py-2.5 px-4 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="py-2.5 px-4 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="py-2.5 px-4 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="py-2.5 px-4 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                      Profesional
                    </th>
                    <th className="py-2.5 px-4 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="py-2.5 px-4 text-left text-xs font-medium text-dark-200 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card-dark">
        <div className="px-6 pt-6 pb-0">
          <h3 className="text-lg font-semibold text-white">
            Actividad Anual
          </h3>
          <p className="text-sm text-dark-200 mt-1">
            Turnos y facturación mensual
          </p>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="shimmer h-72 rounded-lg" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(51,51,51,0.5)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={{ stroke: '#333' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v > 0 ? `$${Math.round(v / 1000)}k` : ''
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#E5E5E5',
                      fontSize: '13px',
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="bookings"
                    fill="#D4AF37"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    name="Turnos"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    name="Ingresos"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card-dark">
        <div className="px-6 pt-6 pb-0">
          <h3 className="text-lg font-semibold text-white">
            Actividad Diaria (GitHub Style)
          </h3>
          <p className="text-sm text-dark-200 mt-1">
            Turnos por día en el último año
          </p>
        </div>
        <div className="px-6 py-5 overflow-x-auto">
          {loading ? (
            <div className="shimmer h-32 rounded-lg" />
          ) : (
            <ActivityGrid data={activityByDay} />
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityGrid({ data }: { data: Record<string, number> }) {
  const today = new Date();
  const days: { date: string; count: number }[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: data[key] ?? 0 });
  }

  const weeks: typeof days[] = [];
  for (let w = 0; w < 53; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  function getColor(count: number): string {
    if (count === 0) return 'bg-dark-500';
    if (count <= 2) return 'bg-gold-500/30';
    if (count <= 5) return 'bg-gold-500/60';
    return 'bg-gold-500';
  }

  const monthLabels: { label: string; index: number }[] = [];
  for (let w = 0; w < weeks.length; w++) {
    const firstDay = weeks[w]?.[0];
    if (firstDay) {
      const d = new Date(firstDay.date);
      if (d.getDate() <= 7) {
        monthLabels.push({
          label: new Date(firstDay.date).toLocaleDateString('en-US', { month: 'short' }),
          index: w,
        });
      }
    }
  }

  return (
    <div className="flex gap-1">
      <div className="flex flex-col gap-[3px] pt-5">
        {['', 'Lun', '', 'Mié', '', 'Vie', ''].map((label, i) => (
          <div
            key={i}
            className="h-[12px] text-[10px] text-dark-300 leading-[12px]"
          >
            {label}
          </div>
        ))}
      </div>
      <div>
        <div className="flex gap-[3px] mb-1">
          {monthLabels.map((m) => (
            <div
              key={m.label}
              className="text-[10px] text-dark-300"
              style={{ marginLeft: m.index === 0 ? 0 : `calc(${m.index} * 15px + ${m.index - 1} * 3px - ${monthLabels.findIndex(l => l.label === m.label) * (15 + 3)}px)`, position: 'relative', left: 0 }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`activity-cell ${getColor(day.count)}`}
                  title={`${day.date}: ${day.count} turno${day.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
