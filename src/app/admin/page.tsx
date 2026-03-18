'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Tag, Monitor, Megaphone, TrendingUp, ExternalLink, Activity } from 'lucide-react';

interface Stats {
  products: number;
  categories: number;
  screens: number;
  promotions: number;
  activeProducts: number;
  activePromotions: number;
}

interface Screen {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  displayMode: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/screens').then((r) => r.json()),
      fetch('/api/promotions').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ]).then(([products, categories, screensData, promotions, settingsData]) => {
      setStats({
        products: products.length,
        categories: categories.length,
        screens: screensData.length,
        promotions: promotions.length,
        activeProducts: products.filter((p: { active: boolean }) => p.active).length,
        activePromotions: promotions.filter((p: { active: boolean }) => p.active).length,
      });
      setScreens(screensData);
      setSettings(settingsData);
    });
  }, []);

  const statCards = [
    { label: 'Productos', value: stats?.products ?? '—', sub: `${stats?.activeProducts ?? 0} activos`, icon: Package, color: 'text-orange-400', bg: 'bg-orange-400/10', href: '/admin/products' },
    { label: 'Categorías', value: stats?.categories ?? '—', sub: 'grupos de productos', icon: Tag, color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/admin/categories' },
    { label: 'Pantallas TV', value: stats?.screens ?? '—', sub: 'televisores configurados', icon: Monitor, color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/admin/screens' },
    { label: 'Promociones', value: stats?.promotions ?? '—', sub: `${stats?.activePromotions ?? 0} activas`, icon: Megaphone, color: 'text-red-400', bg: 'bg-red-400/10', href: '/admin/promotions' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-white">
            {settings.business_name || 'Frigorifico El Toro 2026 C.A'}
          </h1>
          <p className="text-white/40 mt-1">{settings.business_tagline || 'Panel de administración'}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <Activity size={12} className="text-green-400" />
          <span className="text-xs text-green-400 font-medium">Sistema activo</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <TrendingUp size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
            <p className="text-3xl font-black text-white">{card.value}</p>
            <p className="text-sm font-semibold text-white/70 mt-0.5">{card.label}</p>
            <p className="text-xs text-white/30 mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* TV Screens */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Monitor size={18} className="text-red-400" />
          Pantallas TV activas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screens.map((screen) => (
            <div key={screen.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${screen.active ? 'bg-green-400' : 'bg-red-400'}`} />
                  <p className="font-semibold text-white">{screen.name}</p>
                </div>
                <p className="text-xs text-white/40 ml-4">
                  Modo: <span className="capitalize">{screen.displayMode}</span> · /tv/{screen.slug}
                </p>
              </div>
              <a
                href={`/tv/${screen.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          ))}
          {screens.length === 0 && (
            <div className="col-span-3 py-12 text-center text-white/30">
              <Monitor size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay pantallas configuradas</p>
              <Link href="/admin/screens" className="text-red-400 text-sm hover:underline mt-2 inline-block">
                Crear primera pantalla →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nuevo Producto', href: '/admin/products', color: 'bg-orange-600/20 border-orange-600/30 text-orange-400' },
          { label: 'Nueva Categoría', href: '/admin/categories', color: 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400' },
          { label: 'Nueva Pantalla', href: '/admin/screens', color: 'bg-blue-600/20 border-blue-600/30 text-blue-400' },
          { label: 'Nueva Promoción', href: '/admin/promotions', color: 'bg-red-600/20 border-red-600/30 text-red-400' },
        ].map((link) => (
          <Link key={link.label} href={link.href}
            className={`p-4 rounded-xl border text-center text-sm font-semibold transition-all hover:scale-105 ${link.color}`}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
