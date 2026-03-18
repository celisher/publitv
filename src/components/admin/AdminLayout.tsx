'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Monitor, Palette,
  Megaphone, Settings, Menu, X, ChevronRight, Tv
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tag },
  { href: '/admin/screens', label: 'Pantallas TV', icon: Monitor },
  { href: '/admin/templates', label: 'Plantillas', icon: Palette },
  { href: '/admin/promotions', label: 'Promociones', icon: Megaphone },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col bg-[#111111] border-r border-white/10 transition-all duration-300 z-20',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <Tv size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-black text-sm uppercase tracking-wider text-white leading-tight">
                El Toro 2026
              </p>
              <p className="text-xs text-white/40">Panel Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-150 group relative',
                  isActive
                    ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {sidebarOpen && isActive && (
                  <ChevronRight size={14} className="ml-auto text-red-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center p-4 border-t border-white/10 text-white/40 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111111] flex-shrink-0">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">
              {navItems.find((n) => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label || 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/tv/tv-principal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-medium hover:bg-red-600/30 transition-colors"
            >
              <Tv size={14} />
              Vista TV
            </a>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
