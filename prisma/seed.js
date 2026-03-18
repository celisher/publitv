const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Categories ────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'res' },
      update: {},
      create: { name: 'Res', slug: 'res', color: '#c0392b', icon: '🥩', order: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'pollo' },
      update: {},
      create: { name: 'Pollo', slug: 'pollo', color: '#e67e22', icon: '🍗', order: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'cochino' },
      update: {},
      create: { name: 'Cochino', slug: 'cochino', color: '#d35400', icon: '🐷', order: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'embutidos' },
      update: {},
      create: { name: 'Embutidos', slug: 'embutidos', color: '#8e44ad', icon: '🌭', order: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'promociones' },
      update: {},
      create: { name: 'Promociones', slug: 'promociones', color: '#d4ac0d', icon: '⭐', order: 5 },
    }),
  ]);

  const [catRes, catPollo, catCochino, catEmbutidos] = categories;

  // ── Products (Res) ────────────────────────────────────────────
  const productsRes = [
    { name: 'CARNE PRIMERA', price: 10.90, order: 1 },
    { name: 'CARNE ESPECIAL', price: 11.90, order: 2 },
    { name: 'COSTILLA DE RES / LAGARTO', price: 6.50, order: 3 },
    { name: 'SOLOMO / PUNTA TRASERA', price: 12.00, order: 4 },
    { name: 'LOMITO', price: 18.00, order: 5 },
  ];

  for (const p of productsRes) {
    await prisma.product.upsert({
      where: { id: p.order },
      update: { price: p.price },
      create: { ...p, categoryId: catRes.id, active: true },
    });
  }

  // ── Products (Pollo) ─────────────────────────────────────────
  const productsPollo = [
    { name: 'POLLO ENTERO', price: 2.90, order: 10 },
    { name: 'POLLO PICADO', price: 3.40, order: 11 },
    { name: 'PECHUGA', price: 3.90, order: 12 },
    { name: 'ALITAS', price: 4.30, order: 13 },
    { name: 'MUSLO', price: 3.50, order: 14 },
    { name: 'HÍGADO DE POLLO', price: 1.80, order: 15 },
    { name: 'PATA DE POLLO', price: 2.40, order: 16 },
  ];

  for (const p of productsPollo) {
    await prisma.product.upsert({
      where: { id: p.order },
      update: { price: p.price },
      create: { ...p, categoryId: catPollo.id, active: true },
    });
  }

  // ── Products (Cochino) ────────────────────────────────────────
  const productsCochino = [
    { name: 'COCHINO', price: 6.00, order: 20 },
    { name: 'PATA DE CERDO', price: 4.85, order: 21 },
    { name: 'RECORTE DE COCHINO', price: 5.00, order: 22 },
  ];

  for (const p of productsCochino) {
    await prisma.product.upsert({
      where: { id: p.order },
      update: { price: p.price },
      create: { ...p, categoryId: catCochino.id, active: true },
    });
  }

  // ── Products (Embutidos) ─────────────────────────────────────
  const productsEmbutidos = [
    { name: 'CHULETA AHUMADA', price: 10.50, order: 30 },
    { name: 'RECORTE CHULETA AHUMADA', price: 10.00, order: 31 },
    { name: 'PASTA DE CHORIZO', price: 4.00, order: 32 },
    { name: 'MORCILLA', price: 4.55, order: 33 },
    { name: 'CHINCHURRIA', price: 3.40, order: 34 },
  ];

  for (const p of productsEmbutidos) {
    await prisma.product.upsert({
      where: { id: p.order },
      update: { price: p.price },
      create: { ...p, categoryId: catEmbutidos.id, active: true },
    });
  }

  // ── Templates ─────────────────────────────────────────────────
  const templateBrasas = await prisma.template.upsert({
    where: { slug: 'brasas-premium' },
    update: {},
    create: {
      name: 'Brasas Premium',
      slug: 'brasas-premium',
      description: 'Fondo oscuro con efecto de brasas y chispas, ideal para carnicería premium',
      bgColor: '#0d0d0d',
      overlayColor: 'rgba(0,0,0,0.55)',
      primaryColor: '#ff4500',
      secondaryColor: '#d4ac0d',
      priceColor: '#ff4500',
      titleColor: '#ffffff',
      fontStyle: 'bold',
      titleSize: '4xl',
      priceSize: '3xl',
      layout: 'grid',
      logoPosition: 'top-left',
      showBanner: true,
      bannerText: 'PRECIOS POR KILO • FRIGORIFICO EL TORO 2026 C.A',
      bannerBgColor: '#c0392b',
      active: true,
    },
  });

  const templateNegra = await prisma.template.upsert({
    where: { slug: 'negra-elegante' },
    update: {},
    create: {
      name: 'Negra Elegante',
      slug: 'negra-elegante',
      description: 'Minimalista negro premium con acentos dorados',
      bgColor: '#0a0a0a',
      overlayColor: 'rgba(0,0,0,0.7)',
      primaryColor: '#d4ac0d',
      secondaryColor: '#c0392b',
      priceColor: '#d4ac0d',
      titleColor: '#ffffff',
      fontStyle: 'bold',
      titleSize: '4xl',
      priceSize: '3xl',
      layout: 'list',
      logoPosition: 'top-center',
      showBanner: true,
      bannerText: 'CALIDAD GARANTIZADA • FRIGORIFICO EL TORO 2026 C.A',
      bannerBgColor: '#1a1a1a',
      active: true,
    },
  });

  const templatePromo = await prisma.template.upsert({
    where: { slug: 'promo-roja' },
    update: {},
    create: {
      name: 'Promoción Roja',
      slug: 'promo-roja',
      description: 'Diseño intenso rojo para pantallas de promociones',
      bgColor: '#1a0000',
      overlayColor: 'rgba(192,57,43,0.3)',
      primaryColor: '#ff0000',
      secondaryColor: '#ffffff',
      priceColor: '#ffffff',
      titleColor: '#ff4500',
      fontStyle: 'bold',
      titleSize: '5xl',
      priceSize: '4xl',
      layout: 'promotion',
      logoPosition: 'top-right',
      showBanner: true,
      bannerText: '¡OFERTAS ESPECIALES DEL DÍA!',
      bannerBgColor: '#c0392b',
      active: true,
    },
  });

  // ── Screens ───────────────────────────────────────────────────
  const screenMain = await prisma.screen.upsert({
    where: { slug: 'tv-principal' },
    update: {},
    create: {
      name: 'TV Principal',
      slug: 'tv-principal',
      active: true,
      templateId: templateBrasas.id,
      displayMode: 'carousel',
      rotationInterval: 8,
      showPrices: true,
      categories: JSON.stringify([catRes.id, catPollo.id, catCochino.id, catEmbutidos.id]),
    },
  });

  await prisma.screen.upsert({
    where: { slug: 'tv-caja' },
    update: {},
    create: {
      name: 'TV Caja',
      slug: 'tv-caja',
      active: true,
      templateId: templateNegra.id,
      displayMode: 'list',
      rotationInterval: 10,
      showPrices: true,
      categories: JSON.stringify([catRes.id, catPollo.id]),
    },
  });

  await prisma.screen.upsert({
    where: { slug: 'tv-promociones' },
    update: {},
    create: {
      name: 'TV Promociones',
      slug: 'tv-promociones',
      active: true,
      templateId: templatePromo.id,
      displayMode: 'mixed',
      rotationInterval: 6,
      showPrices: true,
      categories: JSON.stringify([catRes.id, catPollo.id, catCochino.id, catEmbutidos.id]),
    },
  });

  // ── Promotions ────────────────────────────────────────────────
  const promo1 = await prisma.promotion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: '¡OFERTA ESPECIAL!',
      subtitle: 'CARNE PRIMERA solo $9,90/kg este fin de semana',
      type: 'fullscreen',
      active: true,
      priority: 10,
      bgColor: '#c0392b',
      textColor: '#ffffff',
    },
  });

  await prisma.screenPromotion.upsert({
    where: { screenId_promotionId: { screenId: screenMain.id, promotionId: promo1.id } },
    update: {},
    create: { screenId: screenMain.id, promotionId: promo1.id, order: 1 },
  });

  // ── App Settings ──────────────────────────────────────────────
  const settings = [
    { key: 'business_name', value: 'Frigorifico El Toro 2026 C.A' },
    { key: 'business_tagline', value: 'Calidad y Frescura Garantizada' },
    { key: 'business_phone', value: '+58 000-000-0000' },
    { key: 'price_unit', value: '$/kg' },
    { key: 'currency_symbol', value: '$' },
    { key: 'logo_path', value: '/logo.png' },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
