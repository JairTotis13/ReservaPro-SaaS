'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Scissors,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  businessName: string;
  userProfile: Profile | null;
}

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: Home },
  { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/servicios', label: 'Servicios', icon: Scissors },
  { href: '/dashboard/profesionales', label: 'Profesionales', icon: Users },
  { href: '/dashboard/suscripcion', label: 'Suscripción', icon: CreditCard },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export function DashboardSidebar({ businessName, userProfile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-dark-800 border-r border-dark-500">
      <div className="flex h-16 items-center gap-3 border-b border-dark-500 px-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gold-500/15">
          <span className="text-sm font-bold text-gold-500">RP</span>
        </div>
        <span className="text-sm font-semibold text-white truncate">
          {businessName}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500'
                  : 'text-dark-100 hover:bg-dark-600 hover:text-white border-l-2 border-transparent'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-dark-500 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-dark-600 text-xs font-medium text-gold-500 uppercase">
            {userProfile?.full_name?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {userProfile?.full_name ?? 'Usuario'}
            </p>
            <p className="text-xs text-dark-200 truncate">
              {userProfile?.role === 'business_owner' ? 'Propietario' : 'Staff'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-200 hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 rounded-lg bg-dark-700 p-2 text-dark-100 hover:text-white lg:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <aside className="hidden lg:flex lg:w-64 lg:shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
