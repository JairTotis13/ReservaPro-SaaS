'use client';

import { useEffect, useState, useCallback } from 'react';
import { Settings, Save, Loader2, Bell, Mail, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Business, WorkingHours } from '@/lib/types';
import { cn } from '@/lib/utils';

const DAY_NAMES_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '10:00', close: '14:00' },
  sunday: null,
};

const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Bogota',
  'America/Argentina/Buenos_Aires',
  'America/Santiago',
  'Europe/Madrid',
  'Europe/London',
  'Europe/Paris',
  'UTC',
];

export default function ConfiguracionPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTimezone, setFormTimezone] = useState('UTC');
  const [formSlotDuration, setFormSlotDuration] = useState('30');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);

  const fetchBusiness = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .limit(1);

    const b = (businesses?.[0] as Business) ?? null;
    if (!b) return;

    setBusiness(b);
    setFormName(b.name);
    setFormSlug(b.slug);
    setFormEmail(b.email ?? '');
    setFormPhone(b.phone ?? '');
    setFormAddress(b.address ?? '');
    setFormTimezone(b.timezone);
    setFormSlotDuration(String(b.slot_duration_minutes));
    setWhatsappEnabled(b.whatsapp_notifications_enabled);
    setEmailEnabled(b.email_notifications_enabled);
    setWorkingHours(b.working_hours ?? DEFAULT_WORKING_HOURS);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from('businesses')
      .update({
        name: formName,
        slug: formSlug,
        email: formEmail || null,
        phone: formPhone || null,
        address: formAddress || null,
        timezone: formTimezone,
        slot_duration_minutes: Number(formSlotDuration),
        whatsapp_notifications_enabled: whatsappEnabled,
        email_notifications_enabled: emailEnabled,
        working_hours: workingHours,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  const updateWorkingHours = (
    day: string,
    field: 'open' | 'close' | 'enabled',
    value: string | boolean
  ) => {
    setWorkingHours((prev) => {
      const next = { ...prev };
      if (field === 'enabled') {
        if (value) {
          next[day] = { open: '09:00', close: '18:00' };
        } else {
          next[day] = null;
        }
      } else if (next[day]) {
        next[day] = { ...next[day], [field]: value };
      } else {
        next[day] = { open: '09:00', close: '18:00', [field]: value };
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="shimmer h-8 w-48 rounded" />
        <div className="shimmer h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-sm text-dark-200 mt-1">
          Administra los ajustes de tu negocio
        </p>
      </div>

      <div className="card-dark p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="size-5 text-gold-500" />
          Información del Negocio
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-dark-200 mb-1.5">Nombre</label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input-dark"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-1.5">Slug (URL)</label>
            <input
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              className="input-dark"
              placeholder="mi-negocio"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-1.5">Email</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="input-dark"
              placeholder="contacto@negocio.com"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-1.5">Teléfono</label>
            <input
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="input-dark"
              placeholder="+54 11 1234-5678"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-dark-200 mb-1.5">Dirección</label>
            <input
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="input-dark"
              placeholder="Dirección del negocio"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-1.5">Zona Horaria</label>
            <select
              value={formTimezone}
              onChange={(e) => setFormTimezone(e.target.value)}
              className="input-dark"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark-200 mb-1.5">
              Duración del Slot (minutos)
            </label>
            <select
              value={formSlotDuration}
              onChange={(e) => setFormSlotDuration(e.target.value)}
              className="input-dark"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-dark p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="size-5 text-gold-500" />
          Horarios de Trabajo
        </h3>
        <div className="space-y-3">
          {DAY_KEYS.map((key, idx) => {
            const day = workingHours[key];
            const isEnabled = day !== null;
            return (
              <div
                key={key}
                className={cn(
                  'flex items-center gap-4 flex-wrap',
                  !isEnabled && 'opacity-50'
                )}
              >
                <div className="w-28">
                  <span className="text-sm text-white">{DAY_NAMES_ES[idx]}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) =>
                      updateWorkingHours(key, 'enabled', e.target.checked)
                    }
                    className="size-4 rounded accent-gold-500"
                  />
                  <span className="text-xs text-dark-200">
                    {isEnabled ? 'Abierto' : 'Cerrado'}
                  </span>
                </label>
                {isEnabled && (
                  <>
                    <input
                      type="time"
                      value={day?.open ?? '09:00'}
                      onChange={(e) =>
                        updateWorkingHours(key, 'open', e.target.value)
                      }
                      className="input-dark w-32 text-sm"
                    />
                    <span className="text-dark-300 text-sm">a</span>
                    <input
                      type="time"
                      value={day?.close ?? '18:00'}
                      onChange={(e) =>
                        updateWorkingHours(key, 'close', e.target.value)
                      }
                      className="input-dark w-32 text-sm"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-dark p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="size-5 text-gold-500" />
          Notificaciones
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg bg-dark-700 cursor-pointer hover:bg-dark-600 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-dark-200" />
              <div>
                <p className="text-sm font-medium text-white">
                  Notificaciones por Email
                </p>
                <p className="text-xs text-dark-200 mt-0.5">
                  Envía confirmaciones y recordatorios por correo
                </p>
              </div>
            </div>
            <div
              onClick={(e) => {
                e.preventDefault();
                setEmailEnabled(!emailEnabled);
              }}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
                emailEnabled ? 'bg-gold-500' : 'bg-dark-400'
              )}
            >
              <span
                className={cn(
                  'inline-block size-5 rounded-full bg-white transition-transform mt-0.5',
                  emailEnabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                )}
              />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg bg-dark-700 cursor-pointer hover:bg-dark-600 transition-colors">
            <div className="flex items-center gap-3">
              <svg
                className="size-5 text-dark-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.498 14.382c-.373-.706-.334-1.456-.028-2.098.49-1.03 1.59-1.96 2.26-2.798.75-.94.92-2.06.44-3.04-.51-1.04-1.58-1.6-2.68-1.4-1.08.2-2.04 1.04-2.42 2.12-.39 1.1-.3 2.34.24 3.46.46.96 1.18 1.78 1.98 2.42.8.64 1.74 1.08 2.74 1.2" />
                <path d="M6.502 14.382c.373-.706.334-1.456.028-2.098-.49-1.03-1.59-1.96-2.26-2.798-.75-.94-.92-2.06-.44-3.04.51-1.04 1.58-1.6 2.68-1.4 1.08.2 2.04 1.04 2.42 2.12.39 1.1.3 2.34-.24 3.46-.46.96-1.18 1.78-1.98 2.42-.8.64-1.74 1.08-2.74 1.2" />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">
                  Notificaciones por WhatsApp
                </p>
                <p className="text-xs text-dark-200 mt-0.5">
                  Envía confirmaciones y recordatorios por WhatsApp
                </p>
              </div>
            </div>
            <div
              onClick={(e) => {
                e.preventDefault();
                setWhatsappEnabled(!whatsappEnabled);
              }}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
                whatsappEnabled ? 'bg-gold-500' : 'bg-dark-400'
              )}
            >
              <span
                className={cn(
                  'inline-block size-5 rounded-full bg-white transition-transform mt-0.5',
                  whatsappEnabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                )}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold rounded-lg px-6 py-3 text-sm font-semibold flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Guardar Cambios
        </button>
        {saved && (
          <span className="text-sm text-success animate-fade-in">
            Cambios guardados correctamente
          </span>
        )}
      </div>
    </div>
  );
}
