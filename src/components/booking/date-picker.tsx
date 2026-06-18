'use client';

import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { isBefore, startOfDay, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
  availableDays: number[];
  timezone: string;
}

export function DatePicker({ selectedDate, onSelect, availableDays }: DatePickerProps) {
  const today = startOfDay(new Date());
  const hasNoAvailableDays = availableDays.length === 0;

  if (hasNoAvailableDays) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-500 flex items-center justify-center mb-4">
          <svg className="size-8 text-dark-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-1">Sin horarios configurados</h3>
        <p className="text-sm text-dark-100">Este negocio no tiene dias de atencion configurados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          if (date) onSelect(date);
        }}
        locale={es}
        weekStartsOn={1}
        numberOfMonths={1}
        disabled={[
          { before: today },
          (date) => !availableDays.includes(getDay(date)),
        ]}
        modifiers={{
          available: (date) =>
            availableDays.includes(getDay(date)) && !isBefore(startOfDay(date), today),
        }}
        modifiersStyles={{
          available: {
            background: 'rgba(212, 175, 55, 0.12)',
            borderRadius: '9999px',
          },
        }}
        className="rdp-custom-dark"
        classNames={{
          root: 'p-0',
          months: 'flex flex-col',
          month: 'flex flex-col',
          month_caption: 'flex items-center justify-between py-2 px-1 relative',
          caption_label: 'text-sm font-semibold text-white',
          nav: 'flex items-center gap-1',
          button_previous: cn(
            'size-8 flex items-center justify-center rounded-lg text-dark-200',
            'hover:bg-dark-500 hover:text-white transition-colors',
          ),
          button_next: cn(
            'size-8 flex items-center justify-center rounded-lg text-dark-200',
            'hover:bg-dark-500 hover:text-white transition-colors',
          ),
          month_grid: 'w-full',
          weekdays: 'flex',
          weekday: 'size-10 flex items-center justify-center text-xs font-medium text-dark-300 uppercase',
          weeks: 'flex flex-col gap-1',
          week: 'flex w-full',
          day: cn(
            'size-10 text-center text-sm p-0 relative',
            '[&:has([aria-selected])]:[&>button]:bg-gold-500 [&:has([aria-selected])]:[&>button]:text-dark-900',
          ),
          day_button: cn(
            'size-10 flex items-center justify-center rounded-full text-sm font-normal',
            'text-white hover:bg-dark-500 transition-colors',
          ),
          today: 'font-bold text-gold-400',
          selected: cn(
            '!bg-gold-500 !text-dark-900 font-semibold',
            'hover:!bg-gold-400',
          ),
          disabled: '!text-dark-300 !pointer-events-none',
          outside: '!text-dark-300',
          range_middle: 'text-white',
          hidden: 'invisible',
        }}
        components={{
          Chevron: ({ orientation }) => {
            return (
              <svg
                className={cn(
                  'size-4',
                  orientation === 'left' ? '' : 'rotate-180',
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            );
          },
        }}
      />

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-500 w-full justify-center">
        <div className="flex items-center gap-2 text-xs text-dark-200">
          <span className="size-3 rounded-full bg-gold-500/20" />
          Disponible
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-200">
          <span className="size-3 rounded-full bg-gold-500" />
          Seleccionado
        </div>
      </div>
    </div>
  );
}
