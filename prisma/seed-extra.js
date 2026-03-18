const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Agregando productos faltantes...');

  // ── Nuevas categorías ─────────────────────────────────────────
  const catCharcuteria = await prisma.category.upsert({
    where: { slug: 'charcuteria' },
    update: {},
    create: { name: 'Charcutería', slug: 'charcuteria', color: '#8B4513', icon: '🥩', order: 5 },
  });

  const catQuesos = await prisma.category.upsert({
    where: { slug: 'quesos' },
    update: {},
    create: { name: 'Quesos', slug: 'quesos', color: '#DAA520', icon: '🧀', order: 6 },
  });

  const catEmbutidos = await prisma.category.findUnique({ where: { slug: 'embutidos' } });

  if (!catEmbutidos) {
    console.error('No se encontró la categoría Embutidos');
    return;
  }

  // ── Productos Charcutería (filas 84-87) ───────────────────────
  const productosCharcuteria = [
    { name: 'ASADURA',                 price: 3.65,  order: 40 },
    { name: 'TOCINETA AHUMADA',        price: 16.00, order: 41 },
    { name: 'HUESO AHUMADO',           price: 6.65,  order: 42 },
    { name: 'RECORTE DE CHARCUTERIA',  price: 8.00,  order: 43 },
  ];

  for (const p of productosCharcuteria) {
    await prisma.product.upsert({
      where: { id: p.order },
      update: { price: p.price, name: p.name },
      create: { ...p, categoryId: catCharcuteria.id, active: true },
    });
  }

  // ── Productos Quesos (filas 88-94) ────────────────────────────
  const productosQuesos = [
    { name: 'QUESO DURO',                   price: 7.50,  order: 50 },
    { name: 'QUESO RALLADO',                price: 7.50,  order: 51 },
    { name: 'QUESO PAISA',                  price: 11.00, order: 52 },
    { name: 'QUESO AMARILLO',               price: 13.00, order: 53 },
    { name: 'QUESO MOZARELLA ARTESANAL',    price: 9.50,  order: 54 },
    { name: 'QUESO MOZARELLA VIMELAC',      price: 9.80,  order: 55 },
    { name: 'QUESO GUAYANES',               price: 7.50,  order: 56 },
  ];

  for (const p of productosQuesos) {
    await prisma.product.upsert({
      where: { id: p.order },
      update: { price: p.price, name: p.name },
      create: { ...p, categoryId: catQuesos.id, active: true },
    });
  }

  // ── Productos Embutidos adicionales (filas 95-104) ────────────
  const productosEmbutidosExtra = [
    { name: 'SALCHICHA POLLO',                    price: 4.20,  order: 60 },
    { name: 'SALCHICHA AHUMADA',                  price: 5.10,  order: 61 },
    { name: 'CHORIZO AHUMADO',                    price: 9.80,  order: 62 },
    { name: 'MORTADELA PUNTA MONTE P/REBANAR',    price: 6.45,  order: 63 },
    { name: 'JAMON ESPALDA',                      price: 8.00,  order: 64 },
    { name: 'JAMON PECHUGA PAVO MILLENIUM',       price: 10.10, order: 65 },
    { name: 'JAMON PECHUGA POLLO',                price: 9.00,  order: 66 },
    { name: 'JAMON DE PIERNA',                    price: 9.00,  order: 67 },
    { name: 'JAMON AHUMADO',                      price: 8.40,  order: 68 },
    { name: 'MORTADELA EXTRA PARA REBANAR',       price: 7.15,  order: 69 },
  ];

  for (const p of productosEmbutidosExtra) {
    await prisma.product.upsert({
      where: { id: p.order },
      update: { price: p.price, name: p.name },
      create: { ...p, categoryId: catEmbutidos.id, active: true },
    });
  }

  // ── Verificar total ───────────────────────────────────────────
  const total = await prisma.product.count();
  const cats  = await prisma.category.count();
  console.log(`✅ Listo! Total: ${total} productos en ${cats} categorías`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
