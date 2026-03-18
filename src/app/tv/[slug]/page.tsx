'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import type { TVScreenData, Product, Category, Promotion, Template } from '@/types';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Converts 0-100 intensity to a CSS text-shadow glow string
function priceGlow(color: string, intensity: number): string {
  if (intensity === 0) return 'none';
  const i = intensity / 100;
  const r1 = Math.round(8 * i);
  const r2 = Math.round(20 * i);
  const r3 = Math.round(40 * i);
  return `0 0 ${r1}px ${color}, 0 0 ${r2}px ${color}, 0 0 ${r3}px ${color}`;
}

function groupByCategory(products: Product[], categories: Category[]) {
  return categories.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.products.length > 0);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ─── TV Components ───────────────────────────────────────────────────────────

function TVHeader({ settings, template }: { settings: Record<string, string>; template: Template | null }) {
  const logoPos = template?.logoPosition || 'top-left';
  const isCenter = logoPos === 'top-center';

  return (
    <div className={`flex items-center px-12 py-6 ${isCenter ? 'justify-center' : 'justify-between'}`}
      style={{ borderBottom: `2px solid ${template?.primaryColor || '#ff4500'}33` }}>
      <div className={`flex items-center gap-6 ${isCenter ? 'flex-col' : ''}`}>
        {settings.logo_path && (
          <div className="relative w-20 h-20">
            <Image src={settings.logo_path} alt="Logo" fill className="object-contain" unoptimized />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-black tracking-widest uppercase"
            style={{ color: template?.titleColor || '#ffffff' }}>
            {settings.business_name || 'FRIGORIFICO EL TORO 2026 C.A'}
          </h1>
          {settings.business_tagline && (
            <p className="text-lg tracking-wider mt-1 opacity-70"
              style={{ color: template?.secondaryColor || '#d4ac0d' }}>
              {settings.business_tagline}
            </p>
          )}
        </div>
      </div>
      {!isCenter && (
        <div className="text-right">
          <p className="text-2xl font-bold uppercase tracking-widest"
            style={{ color: template?.secondaryColor || '#d4ac0d' }}>
            {settings.price_unit || '$/KG'}
          </p>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, template, showPrice }: {
  product: Product; template: Template | null; showPrice: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-white/5 hover:bg-white/3 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {product.image && (
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2"
            style={{ borderColor: template?.primaryColor || '#ff4500' }}>
            <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-2xl font-black uppercase tracking-wide truncate leading-tight"
            style={{ color: template?.titleColor || '#ffffff' }}>
            {product.name}
          </p>
          {product.description && (
            <p className="text-sm opacity-60 truncate mt-0.5" style={{ color: template?.titleColor || '#ffffff' }}>
              {product.description}
            </p>
          )}
        </div>
      </div>
      {showPrice && (
        <div className="flex-shrink-0 ml-4 text-right">
          <span className="text-4xl font-black tabular-nums"
            style={{
              color: template?.priceColor || '#ff4500',
              textShadow: priceGlow(template?.priceColor || '#ff4500', template?.priceGlowIntensity ?? 40),
            }}>
            ${formatPrice(product.price)}
          </span>
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, products, template, showPrice }: {
  category: Category; products: Product[]; template: Template | null; showPrice: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 px-4 py-2 mb-1"
        style={{ borderLeft: `4px solid ${category.color || template?.primaryColor || '#ff4500'}` }}>
        {category.icon && <span className="text-2xl">{category.icon}</span>}
        <h2 className="text-2xl font-black uppercase tracking-widest"
          style={{ color: template?.secondaryColor || '#d4ac0d' }}>
          {category.name}
        </h2>
      </div>
      {products.map((p) => (
        <ProductRow key={p.id} product={p} template={template} showPrice={showPrice} />
      ))}
    </div>
  );
}

function ListLayout({ data }: { data: TVScreenData }) {
  const { products, categories, template, screen } = data;
  const groups = groupByCategory(products, categories);

  return (
    <div className="flex-1 overflow-hidden px-8 pb-4">
      <div className="grid grid-cols-2 gap-6 h-full">
        {groups.map((g) => (
          <CategorySection
            key={g.category.id}
            category={g.category}
            products={g.products}
            template={template}
            showPrice={screen.showPrices}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselLayout({ data }: { data: TVScreenData }) {
  const { products, categories, template, screen } = data;
  const [pageIndex, setPageIndex] = useState(0);
  const groups = groupByCategory(products, categories);
  const allProducts = groups.flatMap((g) =>
    g.products.map((p) => ({ ...p, _categoryName: g.category.name, _categoryColor: g.category.color, _categoryIcon: g.category.icon }))
  );
  const pages = chunkArray(allProducts, 8);

  useEffect(() => {
    if (pages.length <= 1) return;
    const interval = setInterval(() => {
      setPageIndex((i) => (i + 1) % pages.length);
    }, (screen.rotationInterval || 8) * 1000);
    return () => clearInterval(interval);
  }, [pages.length, screen.rotationInterval]);

  if (pages.length === 0) return null;
  const page = pages[pageIndex];

  return (
    <div className="flex-1 overflow-hidden px-8 pb-4">
      <div className="grid grid-cols-2 gap-3 h-full">
        {page.map((p: Product & { _categoryName?: string; _categoryColor?: string | null; _categoryIcon?: string | null }) => (
          <div key={p.id} className="flex items-center justify-between px-6 py-4 rounded-xl border border-white/10 animate-fade-in"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest mb-1 opacity-60"
                style={{ color: p._categoryColor || template?.secondaryColor || '#d4ac0d' }}>
                {p._categoryIcon} {p._categoryName}
              </p>
              <p className="text-3xl font-black uppercase leading-tight"
                style={{ color: template?.titleColor || '#ffffff' }}>
                {p.name}
              </p>
              {p.description && (
                <p className="text-sm opacity-50 mt-1">{p.description}</p>
              )}
            </div>
            {screen.showPrices && (
              <div className="flex-shrink-0 ml-4">
                <span className="text-5xl font-black tabular-nums"
                  style={{
                    color: template?.priceColor || '#ff4500',
                    textShadow: priceGlow(template?.priceColor || '#ff4500', template?.priceGlowIntensity ?? 40),
                  }}>
                  ${formatPrice(p.price)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {pages.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {pages.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === pageIndex ? 'w-8' : 'opacity-30'}`}
              style={{ background: template?.primaryColor || '#ff4500' }} />
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionSlide({ promotion, template }: { promotion: Promotion; template: Template | null }) {
  return (
    <div className="flex-1 flex items-center justify-center px-20 animate-fade-in"
      style={{ background: promotion.bgColor ? `${promotion.bgColor}22` : undefined }}>
      <div className="text-center max-w-5xl">
        {promotion.image ? (
          <div className="relative w-full h-[500px] mb-8 rounded-2xl overflow-hidden">
            <Image src={promotion.image} alt={promotion.title} fill className="object-contain" unoptimized />
          </div>
        ) : null}
        <h2 className="text-8xl font-black uppercase leading-none mb-6"
          style={{ color: promotion.textColor || template?.primaryColor || '#ff4500', textShadow: `0 0 40px ${promotion.textColor || template?.primaryColor || '#ff4500'}66` }}>
          {promotion.title}
        </h2>
        {promotion.subtitle && (
          <p className="text-4xl font-bold opacity-90" style={{ color: promotion.textColor || template?.titleColor || '#ffffff' }}>
            {promotion.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function MixedLayout({ data }: { data: TVScreenData }) {
  const { promotions, template, screen } = data;
  const [mode, setMode] = useState<'prices' | 'promo'>('prices');
  const [promoIndex, setPromoIndex] = useState(0);
  const activePromos = promotions.filter((p) => p.active);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'prices' && activePromos.length > 0) {
        setMode('promo');
        setPromoIndex(0);
      } else if (mode === 'promo') {
        if (promoIndex < activePromos.length - 1) {
          setPromoIndex((i) => i + 1);
        } else {
          setMode('prices');
        }
      }
    }, (screen.rotationInterval || 8) * 1000);
    return () => clearInterval(interval);
  }, [mode, promoIndex, activePromos.length, screen.rotationInterval]);

  if (mode === 'promo' && activePromos[promoIndex]) {
    return <PromotionSlide promotion={activePromos[promoIndex]} template={template} />;
  }

  return <CarouselLayout data={data} />;
}

function PromotionLayout({ data }: { data: TVScreenData }) {
  const { promotions, template, screen } = data;
  const [index, setIndex] = useState(0);
  const activePromos = promotions.filter((p) => p.active);

  useEffect(() => {
    if (activePromos.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % activePromos.length);
    }, (screen.rotationInterval || 8) * 1000);
    return () => clearInterval(interval);
  }, [activePromos.length, screen.rotationInterval]);

  if (!activePromos[index]) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-4xl opacity-30">Sin promociones activas</p>
      </div>
    );
  }

  return <PromotionSlide promotion={activePromos[index]} template={template} />;
}

function TVBanner({ template, settings }: { template: Template | null; settings: Record<string, string> }) {
  if (!template?.showBanner) return null;
  const text = template.bannerText || settings.business_name || '';
  return (
    <div className="w-full py-3 px-8 flex items-center overflow-hidden"
      style={{ background: template.bannerBgColor || '#c0392b' }}>
      <div className="animate-marquee-static flex items-center gap-8">
        <span className="text-lg font-black uppercase tracking-widest text-white whitespace-nowrap">
          ★ {text} ★
        </span>
        <span className="text-lg font-bold uppercase tracking-wide text-white/80 whitespace-nowrap">
          {settings.business_phone && `📞 ${settings.business_phone}`}
        </span>
      </div>
    </div>
  );
}

// ─── Main TV Page ─────────────────────────────────────────────────────────────

export default function TVPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<TVScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/tv/${slug}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error loading screen');
        return;
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError('Connection error');
    }
  }, [slug]);

  // Scale TV canvas to viewport
  useEffect(() => {
    function updateScale() {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.io real-time connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-screen', slug);
    });

    socket.on('screen:update', () => fetchData());
    socket.on('products:updated', () => fetchData());
    socket.on('categories:updated', () => fetchData());
    socket.on('promotions:updated', () => fetchData());
    socket.on('settings:updated', () => fetchData());
    socket.on('templates:updated', () => fetchData());

    return () => { socket.disconnect(); };
  }, [slug, fetchData]);

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-6xl mb-4">⚠️</p>
          <p className="text-4xl text-red-500 font-bold">{error}</p>
          <p className="text-xl text-white/50 mt-4">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-2xl text-white/50">Cargando pantalla...</p>
        </div>
      </div>
    );
  }

  const { template, settings } = data;

  // Build background style from template
  const bgStyle: React.CSSProperties = {
    backgroundColor: template?.bgColor || '#0d0d0d',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
  if (template?.bgImage) bgStyle.backgroundImage = `url(${template.bgImage})`;

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: template?.overlayColor || 'rgba(0,0,0,0.6)',
    zIndex: 1,
  };

  const contentStyle: React.CSSProperties = { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' };

  const displayMode = data.screen.displayMode;

  return (
    <div className="tv-wrapper" style={{ background: '#000' }}>
      <div
        ref={scaleRef}
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          overflow: 'hidden',
          position: 'relative',
          ...bgStyle,
        }}
      >
        {/* Overlay */}
        <div style={overlayStyle} />

        {/* Content */}
        <div style={contentStyle}>
          <TVHeader settings={settings} template={template} />

          {displayMode === 'list' && <ListLayout data={data} />}
          {displayMode === 'carousel' && <CarouselLayout data={data} />}
          {displayMode === 'promotion' && <PromotionLayout data={data} />}
          {displayMode === 'mixed' && <MixedLayout data={data} />}

          <TVBanner template={template} settings={settings} />
        </div>
      </div>
    </div>
  );
}
