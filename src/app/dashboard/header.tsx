'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  businessName: string;
  userProfile: Profile | null;
}

export function DashboardHeader({ businessName, userProfile }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-dark-500 bg-dark-800/80 backdrop-blur-sm px-6">
      <div className="lg:hidden" />
      <h2 className="text-sm font-medium text-dark-200 hidden lg:block">
        {businessName}
      </h2>

      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-dark-600 transition-colors"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-gold-500/15 text-xs font-medium text-gold-500 uppercase">
              {userProfile?.full_name?.charAt(0) ?? 'U'}
            </div>
            <ChevronDown className="size-4 text-dark-200" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-dark-500 bg-dark-700 shadow-xl animate-fade-in">
              <div className="p-3 border-b border-dark-500">
                <p className="text-sm font-medium text-white">
                  {userProfile?.full_name ?? 'Usuario'}
                </p>
                <p className="text-xs text-dark-200">
                  {userProfile?.role === 'business_owner' ? 'Propietario' : 'Staff'}
                </p>
              </div>
              <div className="p-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-dark-200 hover:bg-danger/10 hover:text-danger transition-colors"
                >
                  <LogOut className="size-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
