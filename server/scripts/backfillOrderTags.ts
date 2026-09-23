/**
 * One-off data backfill for the per-tag QR architecture (OrderTag model):
 *
 * 1. Sets Product.tagsPerUnit on every known product, describing how many
 *    physical tags of which size one unit of that product contains.
 * 2. For every existing Order that has a qrToken (i.e. was already assigned
 *    to a vehicle/contact under the old single-tag-per-order model), creates
 *    exactly one OrderTag row carrying over that same qrToken, vehicleId, and
 *    emergencyContactId — so pre-existing customers' QR codes and vehicle
 *    links keep resolving unchanged through the new per-tag endpoints.
 *
 * Idempotent: safe to re-run. Step 2 skips any order that already has an
 * OrderTag row (checked per-order, not just by qrToken, so a re-run after a
 * partial failure doesn't duplicate).
 *
 * Run with: npx tsx scripts/backfillOrderTags.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TagSpec = { size: string; count: number };

// Keyed by the exact Product.name values live in the database today (see
// stickerSizeForProductName in src/lib/qrSticker.ts for the size-per-name
// logic this mirrors for products that already existed before this feature).
const TAGS_PER_UNIT_BY_PRODUCT_NAME: Record<string, TagSpec[]> = {
  'Scan Connect Car Tag (Pack of 2)': [{ size: 'car', count: 2 }],
  'Scan Connect Car Tag (Single Pack)': [{ size: 'car', count: 1 }],
  'Scan Connect Bike Tag': [{ size: 'bike', count: 1 }],
  'Home & Society QR Tags': [{ size: 'bike', count: 1 }],
  'Scan Connect Bike + Helmet Tag (2+2 Combo)': [
    { size: 'bike', count: 2 },
    { size: 'helmet', count: 2 },
  ],
  'Scan Connect Bike + Helmet Tag (1+1 Combo)': [
    { size: 'bike', count: 1 },
    { size: 'helmet', count: 1 },
  ],
  'Scan Connect Transport Tag': [{ size: 'transport', count: 1 }],
};

/** Same fallback logic as stickerSizeForProductName in src/lib/qrSticker.ts, for products with no explicit entry above. */
function fallbackSize(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes('transport')) return 'transport';
  if (name.includes('car')) return 'car';
  return 'bike';
}

async function backfillTagsPerUnit() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, tagsPerUnit: true } });
  let updated = 0;
  for (const product of products) {
    if (product.tagsPerUnit !== null) continue; // already set, e.g. by a re-run or a newer product created after this script existed
    const spec = TAGS_PER_UNIT_BY_PRODUCT_NAME[product.name] ?? [{ size: fallbackSize(product.name), count: 1 }];
    await prisma.product.update({ where: { id: product.id }, data: { tagsPerUnit: spec } });
    updated++;
    console.log(`  tagsPerUnit set for "${product.name}":`, JSON.stringify(spec));
  }
  console.log(`Product.tagsPerUnit backfilled for ${updated} of ${products.length} product(s).`);
}

async function backfillOrderTagsFromLegacyOrders() {
  const orders = await prisma.order.findMany({
    where: { qrToken: { not: null } },
    include: { items: true, tags: { select: { id: true } } },
  });

  let created = 0;
  let skipped = 0;
  for (const order of orders) {
    if (order.tags.length > 0) {
      skipped++;
      continue;
    }
    const firstItem = order.items[0];
    if (!firstItem) {
      console.warn(`  Order ${order.id} has a qrToken but no items — skipping (nothing to derive a size from).`);
      skipped++;
      continue;
    }
    const product = await prisma.product.findUnique({ where: { id: firstItem.productId }, select: { name: true } });
    const size = fallbackSize(product?.name ?? '');

    await prisma.orderTag.create({
      data: {
        orderId: order.id,
        orderItemId: firstItem.id,
        size,
        sequence: 1,
        qrToken: order.qrToken!,
        vehicleId: order.vehicleId,
        emergencyContactId: order.emergencyContactId,
      },
    });
    created++;
  }
  console.log(`OrderTag backfilled for ${created} legacy order(s); ${skipped} already had tags or had no items.`);
}

async function main() {
  console.log('Backfilling Product.tagsPerUnit...');
  await backfillTagsPerUnit();
  console.log('Backfilling OrderTag from legacy Order.qrToken...');
  await backfillOrderTagsFromLegacyOrders();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
