'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { businessSchema } from '@/lib/validations';

const TIMEZONES = [
  'America/Argentina/Buenos_Aires',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Caracas',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Europe/London',
  'Europe/Paris',
  'UTC',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [timezone, setTimezone] = useState('America/Argentina/Buenos_Aires');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const result = businessSchema.safeParse({ name, slug, timezone });
    if (!result.success) {
      const formatted: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (!formatted[field]) formatted[field] = err.message;
      });
      setFieldErrors(formatted);
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      setError('No authenticated user found');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('businesses').insert({
      owner_id: userId,
      name,
      slug,
      timezone,
    });

    if (insertError) {
      if (insertError.message.includes('duplicate') || insertError.code === '23505') {
        setError('That URL slug is already taken. Choose a different business name.');
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to <span className="text-gold-gradient">ReservaPro</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Let&apos;s set up your business to get started.
          </p>
        </div>

        <div className="card-dark p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-1.5">
                Business Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="input-dark"
                placeholder="e.g. Barbería Style"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-danger">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-dark-200 mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center gap-1">
                <span className="text-dark-300 text-sm">reservapro.com/</span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-dark flex-1"
                  placeholder="barberia-style"
                />
              </div>
              {fieldErrors.slug && (
                <p className="mt-1 text-sm text-danger">{fieldErrors.slug}</p>
              )}
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-dark-200 mb-1.5">
                Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input-dark"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              {fieldErrors.timezone && (
                <p className="mt-1 text-sm text-danger">{fieldErrors.timezone}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-2.5 rounded-lg text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create My Business'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
