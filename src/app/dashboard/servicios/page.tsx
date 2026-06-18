'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Scissors,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Service } from '@/lib/types';
import { cn } from '@/lib/utils';
import { serviceSchema } from '@/lib/validations';

const DEFAULT_COLORS = [
  '#D4AF37',
  '#3B82F6',
  '#22C55E',
  '#EF4444',
  '#8B5CF6',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
];

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formPrice, setFormPrice] = useState('0');
  const [formColor, setFormColor] = useState(DEFAULT_COLORS[0]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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

  const fetchServices = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    setServices((data as Service[]) ?? []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormDuration('30');
    setFormPrice('0');
    setFormColor(DEFAULT_COLORS[0]);
    setFormErrors({});
    setEditingService(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setFormName(s.name);
    setFormDescription(s.description ?? '');
    setFormDuration(String(s.duration_minutes));
    setFormPrice(String(s.price_cents));
    setFormColor(s.color);
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = async () => {
    const parseResult = serviceSchema.safeParse({
      name: formName,
      description: formDescription,
      duration_minutes: Number(formDuration),
      price_cents: Number(formPrice),
      color: formColor,
    });

    if (!parseResult.success) {
      const errs: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const key = issue.path[0] as string;
        errs[key] = issue.message;
      }
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    const supabase = createClient();

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update({
          name: formName,
          description: formDescription || null,
          duration_minutes: Number(formDuration),
          price_cents: Number(formPrice),
          color: formColor,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingService.id)
        .eq('business_id', businessId as string);

      if (error) {
        setFormErrors({ submit: error.message });
        setSaving(false);
        return;
      }

      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: formName,
                description: formDescription || null,
                duration_minutes: Number(formDuration),
                price_cents: Number(formPrice),
                color: formColor,
              }
            : s
        )
      );
    } else {
      const { data, error } = await supabase
        .from('services')
        .insert({
          business_id: businessId as string,
          name: formName,
          description: formDescription || null,
          duration_minutes: Number(formDuration),
          price_cents: Number(formPrice),
          color: formColor,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        setFormErrors({ submit: error.message });
        setSaving(false);
        return;
      }

      setServices((prev) => [...prev, data as Service]);
    }

    setSaving(false);
    closeForm();
  };

  const handleToggle = async (service: Service) => {
    const newActive = !service.is_active;
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, is_active: newActive } : s
      )
    );

    const supabase = createClient();
    await supabase
      .from('services')
      .update({ is_active: newActive, updated_at: new Date().toISOString() })
      .eq('id', service.id);
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`¿Eliminar el servicio "${service.name}"?`)) return;

    setServices((prev) => prev.filter((s) => s.id !== service.id));
    const supabase = createClient();
    await supabase
      .from('services')
      .delete()
      .eq('id', service.id)
      .eq('business_id', businessId as string);
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  const formatPrice = (cents: number) => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-sm text-dark-200 mt-1">
            Gestiona los servicios que ofreces
          </p>
        </div>
        <button onClick={openCreate} className="btn-gold rounded-lg px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
          <Plus className="size-4" />
          Nuevo Servicio
        </button>
      </div>

      {showForm && (
        <div className="card-dark p-6 space-y-4 animate-fade-in">
          <h3 className="text-base font-semibold text-white">
            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-200 mb-1.5">Nombre</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="input-dark"
                placeholder="Ej: Corte de cabello"
              />
              {formErrors.name && (
                <p className="text-xs text-danger mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-dark-200 mb-1.5">Duración (minutos)</label>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="input-dark"
                min={5}
                max={480}
              />
              {formErrors.duration_minutes && (
                <p className="text-xs text-danger mt-1">{formErrors.duration_minutes}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-dark-200 mb-1.5">Precio (centavos)</label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="input-dark"
                min={0}
                placeholder="Ej: 2500 = $25.00"
              />
              {formErrors.price_cents && (
                <p className="text-xs text-danger mt-1">{formErrors.price_cents}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-dark-200 mb-1.5">Color</label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={cn(
                      'size-8 rounded-full border-2 transition-all',
                      formColor === c
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-dark-200 mb-1.5">Descripción</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="input-dark resize-none min-h-[80px]"
                placeholder="Descripción opcional del servicio"
              />
            </div>
          </div>
          {formErrors.submit && (
            <p className="text-sm text-danger">{formErrors.submit}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={closeForm}
              className="rounded-lg border border-dark-400 px-4 py-2 text-sm text-dark-100 hover:bg-dark-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-20 rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card-dark flex flex-col items-center justify-center py-16 text-dark-200">
          <Scissors className="size-14 mb-4 opacity-40" />
          <p className="text-base font-medium text-dark-100">No hay servicios creados</p>
          <p className="text-sm mt-1">Crea tu primer servicio para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={cn(
                'card-dark p-4 flex items-center gap-4 transition-opacity',
                !service.is_active && 'opacity-50'
              )}
            >
              <div
                className="size-10 rounded-lg shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${service.color}20` }}
              >
                <Scissors
                  className="size-5"
                  style={{ color: service.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-white truncate">
                    {service.name}
                  </p>
                  {!service.is_active && (
                    <span className="badge badge-warning text-[10px]">Inactivo</span>
                  )}
                </div>
                {service.description && (
                  <p className="text-xs text-dark-200 mt-0.5 truncate">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-dark-200">
                    {formatDuration(service.duration_minutes)}
                  </span>
                  <span className="text-xs text-dark-200">·</span>
                  <span className="text-xs text-gold-500 font-medium">
                    {formatPrice(service.price_cents)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(service)}
                  className="p-1.5 rounded-md hover:bg-dark-500 transition-colors"
                  title={service.is_active ? 'Desactivar' : 'Activar'}
                >
                  {service.is_active ? (
                    <ToggleRight className="size-5 text-success" />
                  ) : (
                    <ToggleLeft className="size-5 text-dark-300" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(service)}
                  className="p-1.5 rounded-md hover:bg-dark-500 transition-colors text-dark-200 hover:text-white"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  className="p-1.5 rounded-md hover:bg-danger/10 transition-colors text-dark-200 hover:text-danger"
                  title="Eliminar"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
