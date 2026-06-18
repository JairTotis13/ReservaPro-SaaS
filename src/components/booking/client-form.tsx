'use client';

import { cn } from '@/lib/utils';
import { bookingSchema } from '@/lib/validations';
import { User, Mail, Phone } from 'lucide-react';
import type { BookingFormData } from '@/lib/types';
import { z } from 'zod';

const customerSchema = z.object({
  customer_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  customer_email: z.string().email('Correo electronico invalido'),
  customer_phone: z.string().optional().or(z.literal('')),
});

interface ClientFormProps {
  formData: Partial<BookingFormData>;
  onChange: (data: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
}

export function ClientForm({ formData, onChange, errors }: ClientFormProps) {
  const validateField = (field: string, value: string): string => {
    const data = {
      customer_name: field === 'customer_name' ? value : (formData.customer_name ?? ''),
      customer_email: field === 'customer_email' ? value : (formData.customer_email ?? ''),
      customer_phone: field === 'customer_phone' ? value : (formData.customer_phone ?? ''),
    };

    const result = customerSchema.safeParse(data);

    if (!result.success) {
      const issue = result.error.issues.find(
        (issue) => issue.path[0] === field,
      );
      return issue?.message ?? '';
    }

    return '';
  };

  const handleChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-100 mb-1.5">
          Nombre completo
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <User className="size-4 text-dark-300" />
          </span>
          <input
            type="text"
            value={formData.customer_name ?? ''}
            onChange={(e) => handleChange('customer_name', e.target.value)}
            placeholder="Tu nombre"
            className={cn(
              'input-dark pl-10',
              errors.customer_name && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
            )}
          />
        </div>
        {errors.customer_name && (
          <p className="mt-1.5 text-xs text-danger">{errors.customer_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-100 mb-1.5">
          Correo electronico
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="size-4 text-dark-300" />
          </span>
          <input
            type="email"
            value={formData.customer_email ?? ''}
            onChange={(e) => handleChange('customer_email', e.target.value)}
            placeholder="tu@email.com"
            className={cn(
              'input-dark pl-10',
              errors.customer_email && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
            )}
          />
        </div>
        {errors.customer_email && (
          <p className="mt-1.5 text-xs text-danger">{errors.customer_email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-100 mb-1.5">
          Telefono (opcional)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone className="size-4 text-dark-300" />
          </span>
          <input
            type="tel"
            value={formData.customer_phone ?? ''}
            onChange={(e) => handleChange('customer_phone', e.target.value)}
            placeholder="+54 11 1234-5678"
            className={cn(
              'input-dark pl-10',
              errors.customer_phone && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
            )}
          />
        </div>
        {errors.customer_phone && (
          <p className="mt-1.5 text-xs text-danger">{errors.customer_phone}</p>
        )}
      </div>
    </div>
  );
}
