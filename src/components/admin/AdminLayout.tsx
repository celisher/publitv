'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Monitor, Palette,
  Megaphone, Flame, Settings, Menu, X, ChevronRight, Tv, LogOut, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tag },
  { href: '/admin/screens', label: 'Pantallas TV', icon: Monitor },
  { href: '/admin/templates', label: 'Plantillas', icon: Palette },
  { href: '/admin/promotions', label: 'Promociones', icon: Megaphone },
  { href: '/admin/promo-slides', label: 'Ofertas', icon: Flame },
  { href: '/admin/settings', label: 'Ajustes', icon: Settings },
];

// Bottom nav shows only the 5 most-used items on mobile
const bottomNavItems = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Precios', icon: Package },
  { href: '/admin/promotions', label: 'Promos', icon: Megaphone },
  { href: '/admin/screens', label: 'Pantallas', icon: Monitor },
  { href: '/admin/settings', label: 'Ajustes', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user) setUserName(data.user.name); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const currentLabel = navItems.find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href)
  )?.label || 'Admin';

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={cn(
        'hidden md:flex flex-col bg-[#111111] border-r border-white/10 transition-all duration-300 z-20',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <Tv size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-black text-sm uppercase tracking-wider text-white leading-tight">El Toro 2026</p>
              <p className="text-xs text-white/40">Panel Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-150',
                  isActive ? 'bg-red-600/20 text-red-400 border border-red-600/30' : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                {sidebarOpen && isActive && <ChevronRight size={14} className="ml-auto text-red-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User & Toggle */}
        <div className="border-t border-white/10">
          {sidebarOpen && userName && (
            <div className="flex items-center gap-2 px-4 py-3 text-white/50">
              <User size={14} />
              <span className="text-xs font-medium truncate">{userName}</span>
            </div>
          )}
          <div className="flex items-center">
            <button onClick={handleLogout}
              title="Cerrar sesión"
              className={cn(
                'flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors',
                sidebarOpen ? 'px-4 py-3 flex-1' : 'p-4 justify-center flex-1'
              )}>
              <LogOut size={18} />
              {sidebarOpen && <span className="text-xs font-medium">Salir</span>}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-4 text-white/40 hover:text-white transition-colors">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          {/* Drawer */}
          <aside className="relative z-50 w-72 flex flex-col bg-[#111111] border-r border-white/10 h-full">
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <Tv size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-wider text-white leading-tight">El Toro 2026</p>
                  <p className="text-xs text-white/40">Panel Admin</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl transition-all',
                      isActive ? 'bg-red-600/20 text-red-400 border border-red-600/30' : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <item.icon size={22} className="flex-shrink-0" />
                    <span className="font-semibold text-base">{item.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto text-red-400" />}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10 space-y-2">
              <a href="/tv/tv-principal" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-red-600/20 border border-red-600/30 text-red-400 font-semibold text-sm">
                <Tv size={18} />
                Ver pantalla TV
              </a>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 font-semibold text-sm hover:text-red-400 hover:border-red-600/30 transition-colors">
                <LogOut size={18} />
                Cerrar sesión
              </button>
              {userName && (
                <p className="text-center text-xs text-white/30 pt-1">
                  <User size={12} className="inline mr-1" />{userName}
                </p>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-white/10 bg-[#111111] flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <Menu size={22} />
            </button>
            <div>
              <p className="text-sm font-bold text-white md:hidden">{currentLabel}</p>
              <p className="hidden md:block text-xs text-white/40 uppercase tracking-wider">{currentLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/tv/tv-principal" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-colors">
              <Tv size={14} />
              <span className="hidden sm:inline">Vista TV</span>
            </a>
            <button onClick={handleLogout}
              title="Cerrar sesión"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs font-semibold hover:text-red-400 hover:border-red-600/30 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for the bottom nav */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111111] border-t border-white/10 flex items-stretch">
        {bottomNavItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
                isActive ? 'text-red-400' : 'text-white/40 hover:text-white/70'
              )}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && <div className="absolute bottom-0 w-8 h-0.5 bg-red-500 rounded-t-full" />}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
