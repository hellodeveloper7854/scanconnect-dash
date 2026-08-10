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

  await prisma.demoQrCode.createMany({
    data: [
      { vehicleNickname: 'My Sedan', status: 'ACTIVE', scans: 128 },
      { vehicleNickname: 'Office Van', status: 'ACTIVE', scans: 54 },
      { vehicleNickname: 'Old Scooter', status: 'DEACTIVATED', scans: 9 },
    ],
    skipDuplicates: true,
  });

  await prisma.demoStickerOrder.createMany({
    data: [
      { vehicleNickname: 'My Sedan', status: 'DELIVERED', trackingId: 'TRK-88213' },
      { vehicleNickname: 'Office Van', status: 'SHIPPED', trackingId: 'TRK-91004' },
    ],
    skipDuplicates: true,
  });

  await prisma.demoIvrNumber.createMany({
    data: [
      { virtualNumber: '+91 8888800001', assignedTo: 'My Sedan', status: 'ACTIVE' },
      { virtualNumber: '+91 8888800002', assignedTo: 'Office Van', status: 'ACTIVE' },
    ],
    skipDuplicates: true,
  });

  await prisma.demoCallLog.createMany({
    data: [
      { fromLabel: 'Masked Caller', toLabel: 'My Sedan Owner', duration: 45, status: 'COMPLETED' },
      { fromLabel: 'Masked Caller', toLabel: 'Office Van Owner', duration: 0, status: 'MISSED' },
    ],
    skipDuplicates: true,
  });

  await prisma.demoSubscriptionPlan.createMany({
    data: [
      { name: 'Free', priceInPaise: 0, durationDays: 365, features: ['1 vehicle', 'Basic QR'] },
      {
        name: 'Premium',
        priceInPaise: 99900,
        durationDays: 365,
        features: ['Unlimited vehicles', 'Anonymous calling', 'Priority support'],
      },
    ],
    skipDuplicates: true,
  });

  await prisma.demoCoupon.createMany({
    data: [
      { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, usageLimit: 500, usedCount: 128, expiresAt: new Date('2026-12-31') },
      { code: 'FLAT100', type: 'FIXED', value: 100, usageLimit: 200, usedCount: 47, expiresAt: new Date('2026-10-31') },
    ],
    skipDuplicates: true,
  });

  await prisma.demoNotificationCampaign.createMany({
    data: [
      { title: 'Monsoon Offer', audience: 'ALL_USERS', status: 'SENT', sentAt: new Date('2026-07-01') },
      { title: 'Renewal Reminder', audience: 'EXPIRING_SUBSCRIPTIONS', status: 'SCHEDULED' },
    ],
    skipDuplicates: true,
  });

  await prisma.demoCmsPage.createMany({
    data: [
      { title: 'Home', slug: 'home' },
      { title: 'About Us', slug: 'about' },
      { title: 'FAQs', slug: 'faq' },
      { title: 'Privacy Policy', slug: 'privacy' },
    ],
    skipDuplicates: true,
  });

  await prisma.demoBanner.createMany({
    data: [
      { title: 'Monsoon Sale - 20% Off Stickers', placement: 'HOMEPAGE', active: true },
      { title: 'Refer & Earn', placement: 'DASHBOARD', active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.demoFaq.createMany({
    data: [
      { category: 'Getting Started', question: 'How do I register my vehicle?', answer: 'Go to Vehicles > Add Vehicle and fill in the details.' },
      { category: 'Billing', question: 'How do I cancel my subscription?', answer: 'Go to Subscription > Cancel Plan.' },
    ],
    skipDuplicates: true,
  });

  await prisma.demoAuditLog.createMany({
    data: [
      { actor: 'admin@scanconnect.com', action: 'SUSPENDED_USER', target: 'user_123' },
      { actor: 'admin@scanconnect.com', action: 'UPDATED_ORDER_STATUS', target: 'order_456' },
    ],
    skipDuplicates: true,
  });

  await prisma.demoSystemConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
