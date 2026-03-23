'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import type { TVScreenData, Product, Category, Promotion, Template, PromoSlide } from '@/types';
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
  const borderColor = `${template?.primaryColor || '#ff4500'}33`;
  const titleColor  = template?.titleColor || '#ffffff';
  const subColor    = template?.secondaryColor || '#d4ac0d';

  // ── top-right: large logo right, title+subtitle centered, compact height ──
  if (logoPos === 'top-right') {
    return (
      <div className="relative flex items-center px-10 py-3"
        style={{ borderBottom: `2px solid ${borderColor}`, minHeight: 90 }}>
        {/* Title block — absolute center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-4xl font-black tracking-widest uppercase leading-none"
            style={{ color: titleColor }}>
            {settings.business_name || 'FRIGORIFICO EL TORO 2026 C.A'}
          </h1>
          {settings.business_tagline && (
            <p className="text-base tracking-wider mt-1 opacity-70"
              style={{ color: subColor }}>
              {settings.business_tagline}
            </p>
          )}
        </div>
        {/* Logo — right side, large */}
        {settings.logo_path && (
          <div className="relative ml-auto flex-shrink-0" style={{ width: 80, height: 80 }}>
            <Image src={settings.logo_path} alt="Logo" fill className="object-contain" unoptimized />
          </div>
        )}
      </div>
    );
  }

  // ── top-center: logo above title, centered ────────────────────────────────
  if (logoPos === 'top-center') {
    return (
      <div className="flex flex-col items-center px-12 py-5"
        style={{ borderBottom: `2px solid ${borderColor}` }}>
        {settings.logo_path && (
          <div className="relative w-16 h-16 mb-2">
            <Image src={settings.logo_path} alt="Logo" fill className="object-contain" unoptimized />
          </div>
        )}
        <h1 className="text-4xl font-black tracking-widest uppercase"
          style={{ color: titleColor }}>
          {settings.business_name || 'FRIGORIFICO EL TORO 2026 C.A'}
        </h1>
        {settings.business_tagline && (
          <p className="text-lg tracking-wider mt-1 opacity-70"
            style={{ color: subColor }}>
            {settings.business_tagline}
          </p>
        )}
      </div>
    );
  }

  // ── top-left (default): logo left, price unit right ───────────────────────
  return (
    <div className="flex items-center justify-between px-12 py-6"
      style={{ borderBottom: `2px solid ${borderColor}` }}>
      <div className="flex items-center gap-6">
        {settings.logo_path && (
          <div className="relative w-20 h-20">
            <Image src={settings.logo_path} alt="Logo" fill className="object-contain" unoptimized />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-black tracking-widest uppercase"
            style={{ color: titleColor }}>
            {settings.business_name || 'FRIGORIFICO EL TORO 2026 C.A'}
          </h1>
          {settings.business_tagline && (
            <p className="text-lg tracking-wider mt-1 opacity-70"
              style={{ color: subColor }}>
              {settings.business_tagline}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold uppercase tracking-widest"
          style={{ color: subColor }}>
          {settings.price_unit || '$/KG'}
        </p>
      </div>
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
  const pages = chunkArray(allProducts, template?.itemsPerPage || 8);

  useEffect(() => {
    if (pages.length <= 1) return;
    const interval = setInterval(() => {
      setPageIndex((i) => (i + 1) % pages.length);
    }, (screen.rotationInterval || 8) * 1000);
    return () => clearInterval(interval);
  }, [pages.length, screen.rotationInterval]);

  if (pages.length === 0) return null;
  const page = pages[pageIndex];

  // Density levels based on items per page — never change font sizes
  const ipp = template?.itemsPerPage || 8;
  // normal ≤8 | compact 9-14 | ultra 15+
  const density = ipp <= 8 ? 'normal' : ipp <= 14 ? 'compact' : 'ultra';

  const densityStyles = {
    normal:  { cardPx: 'px-6', gridGap: 'gap-3',   wrapperPb: 'pb-4', cardPy: 12 },
    compact: { cardPx: 'px-4', gridGap: 'gap-1.5', wrapperPb: 'pb-2', cardPy: 6  },
    ultra:   { cardPx: 'px-4', gridGap: 'gap-1',   wrapperPb: 'pb-1', cardPy: 3  },
  }[density];

  const showMeta = density === 'normal';

  // Pad page with null slots so the grid always has ipp items → constant row height
  type PageItem = (Product & { _categoryName?: string; _categoryColor?: string | null; _categoryIcon?: string | null }) | null;
  const paddedPage: PageItem[] = [...page];
  while (paddedPage.length < ipp) paddedPage.push(null);

  return (
    <div className={`flex-1 overflow-hidden px-8 ${densityStyles.wrapperPb}`}>
      <div className={`grid grid-cols-2 ${densityStyles.gridGap} h-full`}>
        {paddedPage.map((p, idx) =>
          p === null ? (
            // Ghost row — invisible but occupies the same space as a real row
            <div key={`ghost-${idx}`}
              className={`flex items-center ${densityStyles.cardPx} rounded-xl`}
              style={{ paddingTop: densityStyles.cardPy, paddingBottom: densityStyles.cardPy, opacity: 0, pointerEvents: 'none' }}>
              <div className="flex-shrink-0 mr-4" style={{ width: 64, height: 64 }} />
              <div className="h-8 flex-1" />
            </div>
          ) : (
          <div key={p.id}
            className={`flex items-center ${densityStyles.cardPx} rounded-xl border border-white/10 animate-fade-in`}
            style={{ background: 'rgba(255,255,255,0.04)', paddingTop: densityStyles.cardPy, paddingBottom: densityStyles.cardPy }}>
            {/* Product logo — fixed width on the left */}
            <div className="flex-shrink-0 mr-4 rounded-lg overflow-hidden"
              style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.06)', border: `1px solid ${p._categoryColor || template?.primaryColor || '#ff4500'}44` }}>
              {p.image ? (
                <Image src={p.image} alt={p.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">
                  {p._categoryIcon || '🥩'}
                </div>
              )}
            </div>
            {/* Name */}
            <div className="flex-1 min-w-0">
              {showMeta && (
                <p className="text-xs uppercase tracking-widest mb-0.5 opacity-60"
                  style={{ color: p._categoryColor || template?.secondaryColor || '#d4ac0d' }}>
                  {p._categoryName}
                </p>
              )}
              <p className="text-3xl font-black uppercase leading-none truncate"
                style={{ color: template?.titleColor || '#ffffff' }}>
                {p.name}
              </p>
            </div>
            {/* Price */}
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
          )
        )}
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

// ─── Promo Individual Layout ──────────────────────────────────────────────────
// Shows ONE product at a time: big image + big title + big price, with logo badge in corner.
// No header, no overlay, no banner. Full-screen immersive layout.

function PromoIndividualLayout({ data }: { data: TVScreenData }) {
  const { promoSlides, screen, settings } = data;
  const [index, setIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const activeSlides = promoSlides.filter((s) => s.active);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % activeSlides.length);
        setFadeIn(true);
      }, 400);
    }, (screen.rotationInterval || 8) * 1000);
    return () => clearInterval(interval);
  }, [activeSlides.length, screen.rotationInterval]);

  if (activeSlides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-4xl opacity-30">Sin ofertas configuradas</p>
      </div>
    );
  }

  const slide = activeSlides[index] || activeSlides[0];
  const logoPath = settings.logo_path;

  return (
    <div className="relative overflow-hidden" style={{ background: 'transparent', height: '100%', width: '100%' }}>
      {/* Background image — NO color mask/overlay */}
      {slide.bgImage && (
        <div className="absolute inset-0 z-0">
          <Image src={slide.bgImage} alt="" fill className="object-cover" unoptimized />
        </div>
      )}

      {/* Subtle radial glow behind product area */}
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse 50% 60% at 65% 55%, ${slide.accentColor}18 0%, transparent 70%)`,
      }} />

      {/* Main content — fade transition */}
      <div
        className="relative z-10 flex h-full"
        style={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'scale(1)' : 'scale(0.97)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        {/* Title — top-left area */}
        <div className="absolute z-10" style={{ top: 40, left: 60 }}>
          <div
            className="inline-block px-14 py-5 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}cc)`,
              boxShadow: `0 8px 32px ${slide.accentColor}44`,
            }}
          >
            <h2
              className="font-black uppercase tracking-wide leading-tight text-center"
              style={{
                fontSize: 72,
                color: slide.titleColor || '#ffffff',
                textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
              }}
            >
              {slide.title}
            </h2>
          </div>
        </div>

        {/* Price circle — center-left, shifted right and up */}
        {slide.price && (
          <div className="absolute z-10" style={{ top: 'calc(15% + 120px)', left: 'calc(25% - 80px)', transform: 'translateX(-50%)' }}>
            <div
              className="relative flex flex-col items-center justify-center rounded-full"
              style={{
                width: 500,
                height: 500,
                background: `radial-gradient(circle, ${slide.bgColor}ee 0%, ${slide.bgColor}cc 50%, ${slide.accentColor}33 100%)`,
                border: `8px solid ${slide.accentColor}`,
                boxShadow: `0 0 60px ${slide.accentColor}44, inset 0 0 40px rgba(0,0,0,0.15)`,
                padding: 50,
              }}
            >
              <span className="text-3xl font-bold opacity-70" style={{ color: slide.priceColor }}>
                {settings.currency_symbol || '$'}
              </span>
              <span
                className="font-black leading-none"
                style={{
                  fontSize: 150,
                  color: slide.priceColor || '#ffdd00',
                  textShadow: `0 0 30px ${slide.priceColor}66, 0 4px 12px rgba(0,0,0,0.3)`,
                }}
              >
                {formatPrice(slide.price)}
              </span>
              <span className="text-2xl font-bold uppercase opacity-60 mt-2" style={{ color: slide.priceColor }}>
                {slide.priceUnit || '$/kg'}
              </span>
            </div>
          </div>
        )}

        {/* Right side — Product image, absolutely positioned */}
        <div className="absolute z-10 flex items-center justify-center"
          style={{ top: 'calc(10% - 30px)', right: 40, width: 750, height: '85%' }}>
          {slide.productImage ? (
            <div className="relative" style={{ width: 700, height: 700 }}>
              <Image
                src={slide.productImage}
                alt={slide.title}
                fill
                className="object-contain"
                style={{ filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))' }}
                unoptimized
              />
            </div>
          ) : (
            <div className="w-96 h-96 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: `3px solid ${slide.accentColor}33` }}>
              <span className="text-9xl opacity-30">🥩</span>
            </div>
          )}
        </div>
      </div>

      {/* Logo — large, bottom-left, 10% hidden left and 10% hidden bottom (90% visible) */}
      {logoPath && (
        <div
          className="absolute z-20"
          style={{
            bottom: 2,
            left: 2,
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: `6px solid ${slide.accentColor}`,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            boxShadow: `0 0 30px ${slide.accentColor}44, 0 6px 24px rgba(0,0,0,0.5)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div className="relative" style={{ width: 230, height: 230 }}>
            <Image src={logoPath} alt="Logo" fill className="object-contain" unoptimized />
          </div>
        </div>
      )}

      {/* Slide indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 right-16 z-20 flex gap-3">
          {activeSlides.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? 40 : 12,
                height: 12,
                background: i === index ? slide.accentColor : 'rgba(255,255,255,0.3)',
                boxShadow: i === index ? `0 0 10px ${slide.accentColor}66` : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  const [viewportH, setViewportH] = useState(1080);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsHint, setShowFsHint] = useState(true);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Hide hint after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowFsHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

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

  // Scale TV canvas to fill full width without distortion
  useEffect(() => {
    function updateScale() {
      setScale(window.innerWidth / 1920);
      setViewportH(window.innerHeight);
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
    socket.on('promoSlides:updated', () => fetchData());
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

  // Canvas scaled height in real pixels — center vertically if screen is taller than 16:9
  const scaledHeight = 1080 * scale;
  const topOffset = Math.max(0, (viewportH - scaledHeight) / 2);

  // Background covers the full real screen (wrapper)
  const wrapperStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: template?.bgColor || '#0d0d0d',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
  if (template?.bgImage) wrapperStyle.backgroundImage = `url(${template.bgImage})`;

  // Overlay also covers the full real screen
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: template?.overlayColor || 'rgba(0,0,0,0.6)',
    zIndex: 1,
    pointerEvents: 'none',
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const displayMode = data.screen.displayMode;

  return (
    <div className="tv-wrapper" style={wrapperStyle} onDoubleClick={toggleFullscreen}>
      {/* Full-screen overlay — hidden for promo-individual */}
      {displayMode !== 'promo-individual' && <div style={overlayStyle} />}

      {/* Fullscreen button */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12, padding: '10px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#fff', fontSize: 14, fontWeight: 700,
            backdropFilter: 'blur(8px)',
            transition: 'opacity 0.3s',
            opacity: showFsHint ? 1 : 0.15,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = showFsHint ? '1' : '0.15')}
          title="Pantalla completa"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
          {showFsHint && <span>Pantalla completa</span>}
        </button>
      )}

      {/* Scaled 1920×1080 canvas — fills full width, centered vertically */}
      <div
        ref={scaleRef}
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: topOffset,
          left: 0,
          zIndex: 2,
        }}
      >
        {/* Content */}
        <div style={contentStyle}>
          {displayMode !== 'promo-individual' && <TVHeader settings={settings} template={template} />}

          {displayMode === 'list' && <ListLayout data={data} />}
          {displayMode === 'carousel' && <CarouselLayout data={data} />}
          {displayMode === 'promotion' && <PromotionLayout data={data} />}
          {displayMode === 'mixed' && <MixedLayout data={data} />}
          {displayMode === 'promo-individual' && <PromoIndividualLayout data={data} />}

          {displayMode !== 'promo-individual' && <TVBanner template={template} settings={settings} />}
        </div>
      </div>
    </div>
  );
}
