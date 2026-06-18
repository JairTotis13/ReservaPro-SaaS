import { redirect } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase/server';
import type { Profile, Business } from '@/lib/types';
import { DashboardSidebar } from './sidebar';
import { DashboardHeader } from './header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1);

  const business: Business | null = (businesses?.[0] as Business | undefined) ?? null;

  if (!business) {
    redirect('/onboarding');
  }

  const typedProfile = profile as Profile | null;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <DashboardSidebar
        businessName={business.name}
        userProfile={typedProfile}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          businessName={business.name}
          userProfile={typedProfile}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
