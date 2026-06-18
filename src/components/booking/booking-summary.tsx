'use client';

import { cn, formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { Clock, Calendar, User, DollarSign } from 'lucide-react';
import type { Service, Professional } from '@/lib/types';

interface BookingSummaryProps {
  service: Service | null;
  professional: Professional | null;
  date: Date | null;
  timeSlot: string | null;
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className={cn(
          'size-9 rounded-lg flex items-center justify-center shrink-0',
          highlight ? 'bg-gold-500/15' : 'bg-dark-500',
        )}
      >
        <Icon
          className={cn(
            'size-4',
            highlight ? 'text-gold-400' : 'text-dark-300',
          )}
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-dark-200">{label}</span>
        <span
          className={cn(
            'text-sm font-semibold truncate',
            highlight ? 'text-gold-300' : 'text-white',
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function BookingSummary({ service, professional, date, timeSlot }: BookingSummaryProps) {
  if (!service) {
    return (
      <div className="card-dark p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-dark-200">Selecciona un servicio para ver el resumen.</p>
      </div>
    );
  }

  return (
    <div className="card-dark p-6 space-y-1 animate-fade-in">
      <h3 className="text-base font-semibold text-white mb-3">Resumen de la reserva</h3>

      <SummaryRow
        icon={Clock}
        label="Servicio"
        value={`${service.name} (${service.duration_minutes} min)`}
      />

      {professional && (
        <SummaryRow
          icon={User}
          label="Profesional"
          value={professional.name}
        />
      )}

      {date && (
        <SummaryRow
          icon={Calendar}
          label="Fecha"
          value={formatDate(date)}
        />
      )}

      {timeSlot && date && (
        <SummaryRow
          icon={Clock}
          label="Horario"
          value={`${formatTime(`2000-01-01T${timeSlot}:00`)}`}
        />
      )}

      <div className="pt-3 mt-3 border-t border-dark-500">
        <SummaryRow
          icon={DollarSign}
          label="Total"
          value={formatCurrency(service.price_cents)}
          highlight
        />
      </div>
    </div>
  );
}
