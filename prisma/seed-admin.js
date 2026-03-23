const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@eltoro2026.com' },
    update: {},
    create: {
      email: 'admin@eltoro2026.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      active: true,
    },
  });

  console.log(`✅ Admin user created: ${user.email}`);
  console.log(`   Password: admin123`);
  console.log(`   ⚠️  Cambia la contraseña después del primer login`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
