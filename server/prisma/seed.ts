import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { name: 'QR Sticker - Standard', description: 'Weatherproof vinyl QR sticker', priceInPaise: 29900 },
      { name: 'QR Sticker - Premium', description: 'Metal-finish QR sticker', priceInPaise: 49900 },
      { name: 'Annual Subscription', description: 'Anonymous calling + number masking, 1 year', priceInPaise: 99900 },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
