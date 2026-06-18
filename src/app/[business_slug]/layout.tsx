import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import type { Business } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export default async function BusinessBookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ business_slug: string }>;
}) {
  const { business_slug } = await params;

  const { data: business, error } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('slug', business_slug)
    .eq('is_active', true)
    .single();

  if (error || !business) {
    notFound();
  }

  const typedBusiness = business as unknown as Business;

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-dark-500/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 min-w-0">
              {typedBusiness.logo_url ? (
                <div className="relative size-8 rounded-lg overflow-hidden shrink-0 bg-dark-600">
                  <Image
                    src={typedBusiness.logo_url}
                    alt={typedBusiness.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="size-8 rounded-lg bg-gold-500/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gold-400">
                    {typedBusiness.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-base font-semibold text-white truncate">
                {typedBusiness.name}
              </span>
            </div>

            <Link
              href="/"
              className="text-xs text-dark-300 hover:text-gold-400 transition-colors"
            >
              ReservaPro
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="py-6 border-t border-dark-500/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-xs text-dark-300">
            Powered by{' '}
            <span className="text-gold-500 font-semibold">ReservaPro</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
