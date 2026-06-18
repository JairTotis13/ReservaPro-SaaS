'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { Clock, Check } from 'lucide-react';
import type { Service } from '@/lib/types';

interface ServiceSelectorProps {
  services: Service[];
  selected: string | null;
  onSelect: (serviceId: string) => void;
}

export function ServiceSelector({ services, selected, onSelect }: ServiceSelectorProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-500 flex items-center justify-center mb-4">
          <Clock className="size-8 text-dark-200" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">No hay servicios disponibles</h3>
        <p className="text-sm text-dark-100">Este negocio no tiene servicios configurados actualmente.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
      {services.map((service) => {
        const isSelected = selected === service.id;

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            className={cn(
              'relative flex flex-col items-start gap-3 p-5 rounded-xl border text-left transition-all duration-200',
              'card-dark',
              isSelected
                ? 'border-gold-500 shadow-[0_0_0_1px_rgba(212,175,55,0.5),0_4px_20px_rgba(212,175,55,0.15)]'
                : 'hover:border-dark-300',
            )}
          >
            {isSelected && (
              <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-gold-500">
                <Check className="size-3.5 text-dark-900" strokeWidth={3} />
              </span>
            )}

            <div
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: service.color || '#D4AF37' }}
            />

            <div className="flex flex-col gap-1 min-w-0 w-full">
              <span
                className={cn(
                  'text-base font-semibold truncate',
                  isSelected ? 'text-gold-300' : 'text-white',
                )}
              >
                {service.name}
              </span>

              {service.description && (
                <p className="text-sm text-dark-100 line-clamp-2">{service.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4 mt-auto pt-1">
              <span className="flex items-center gap-1.5 text-xs text-dark-200">
                <Clock className="size-3.5" />
                {service.duration_minutes} min
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-gold-400' : 'text-gold-300',
                )}
              >
                {formatCurrency(service.price_cents)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
