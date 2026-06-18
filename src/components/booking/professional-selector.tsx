'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import type { Professional } from '@/lib/types';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selected: string | null;
  onSelect: (professionalId: string) => void;
}

export function ProfessionalSelector({ professionals, selected, onSelect }: ProfessionalSelectorProps) {
  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-500 flex items-center justify-center mb-4">
          <User className="size-8 text-dark-200" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">No hay profesionales disponibles</h3>
        <p className="text-sm text-dark-100">No hay profesionales activos en este negocio.</p>
      </div>
    );
  }

  if (professionals.length === 1) {
    return (
      <div className="p-4 rounded-xl card-dark border-gold-500/30 flex items-center gap-4 animate-fade-in">
        <div
          className="size-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${professionals[0].color || '#D4AF37'}20` }}
        >
          <User className="size-5" style={{ color: professionals[0].color || '#D4AF37' }} />
        </div>
        <div>
          <p className="text-sm text-dark-200">Profesional asignado</p>
          <p className="text-base font-semibold text-white">{professionals[0].name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <label className="block text-sm font-medium text-dark-100 mb-2">
        Seleccioná un profesional
      </label>
      <div className="relative">
        <select
          value={selected ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm transition-all duration-200',
            'bg-dark-700 border border-dark-400 text-white',
            'focus:border-gold-500 focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]',
            'hover:border-dark-300',
          )}
        >
          <option value="" disabled className="bg-dark-700 text-dark-200">
            Elegí un profesional
          </option>
          {professionals.map((pro) => (
            <option key={pro.id} value={pro.id} className="bg-dark-700 text-white">
              {pro.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="size-4 text-dark-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
