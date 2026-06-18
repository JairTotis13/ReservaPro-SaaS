'use client';

import { cn, formatTime } from '@/lib/utils';
import { Clock } from 'lucide-react';
import type { AvailableSlot } from '@/lib/booking-engine';

interface TimeSlotsProps {
  slots: AvailableSlot[];
  selected: string | null;
  onSelect: (slotStart: string) => void;
  loading: boolean;
}

function SkeletonSlot() {
  return (
    <div className="h-12 rounded-xl shimmer" />
  );
}

export function TimeSlots({ slots, selected, onSelect, loading }: TimeSlotsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonSlot key={i} />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-500 flex items-center justify-center mb-4">
          <Clock className="size-8 text-dark-200" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">Sin horarios disponibles</h3>
        <p className="text-sm text-dark-100">No se encontraron turnos para esta fecha. Probá con otro dia.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in">
      {slots.map((slot) => {
        const isSelected = selected === slot.start;

        return (
          <button
            key={slot.start}
            type="button"
            onClick={() => onSelect(slot.start)}
            className={cn(
              'relative flex items-center justify-center h-12 px-4 rounded-xl text-sm font-medium transition-all duration-200',
              isSelected
                ? 'bg-gold-500 text-dark-900 shadow-[0_4px_16px_rgba(212,175,55,0.3)]'
                : 'bg-dark-700 border border-dark-400 text-white hover:border-dark-300 hover:bg-dark-600',
            )}
          >
            {formatTime(`2000-01-01T${slot.start}:00`)}
          </button>
        );
      })}
    </div>
  );
}
