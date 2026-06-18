'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
}

interface BookingStepperProps {
  currentStep: number;
  steps: Step[];
}

export function BookingStepper({ currentStep, steps }: BookingStepperProps) {
  return (
    <nav aria-label="Progreso de la reserva" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={cn(
                'relative flex items-center',
                !isLast && 'flex-1',
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'relative flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                    isCompleted && 'bg-gold-500 text-dark-900',
                    isCurrent && 'bg-gold-500 text-dark-900 shadow-[0_0_16px_rgba(212,175,55,0.4)]',
                    !isCompleted && !isCurrent && 'bg-dark-500 text-dark-200',
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap transition-colors duration-300',
                    isCompleted && 'text-gold-400',
                    isCurrent && 'text-gold-400',
                    !isCompleted && !isCurrent && 'text-dark-300',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 mx-2 mb-5">
                  <div
                    className={cn(
                      'h-0.5 rounded-full transition-all duration-500',
                      isCompleted ? 'bg-gold-500' : 'bg-dark-500',
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
