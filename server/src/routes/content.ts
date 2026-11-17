import express, { Router } from 'express';
import { imageSize } from 'image-size';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

/**
 * Website content managed from the admin panel: FAQs, banners and CMS pages.
 *   /api/content        public, read-only, cached briefly (what the website renders)
 *   /api/admin/content  admin CRUD (the Content section of the dashboard)
 */
/** Express 4 doesn't catch rejected promises from async handlers: forward them so a database error becomes a 500, not a hang or a crash. */
const safe =
  (fn: (req: import('express').Request, res: import('express').Response) => Promise<unknown>): import('express').RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export const contentRouter = Router();
export const adminContentRouter = Router();

const PLACEMENTS = ['TOP_BAR', 'HOMEPAGE', 'SHOP'] as const;

/** Public responses may be cached for a minute: edits show up on the site almost immediately. */
const cacheBriefly = (res: import('express').Response) => res.setHeader('Cache-Control', 'public, max-age=60');

// ===================================================================== public

contentRouter.get('/faqs', safe(async (_req, res) => {
  const faqs = await prisma.faq.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, category: true, question: true, answer: true },
  });
  cacheBriefly(res);
  res.json({ faqs });
}));

contentRouter.get('/banners', safe(async (req, res) => {
  const placement = typeof req.query.placement === 'string' ? req.query.placement.toUpperCase() : undefined;
  if (placement && !(PLACEMENTS as readonly string[]).includes(placement)) {
    return res.status(400).json({ error: 'Unknown banner placement' });
  }
  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: {
      active: true,
      ...(placement ? { placement } : {}),
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, message: true, ctaLabel: true, linkUrl: true, imageUrl: true, placement: true },
  });
  cacheBriefly(res);
  res.json({ banners });
}));

contentRouter.get('/pages/:slug', safe(async (req, res) => {
  const page = await prisma.cmsPage.findUnique({ where: { slug: req.params.slug.toLowerCase() } });
  // An unpublished page, or a built-in page with no content yet, doesn't exist as far as the site is
  // concerned: built-in pages then keep showing their original text.
  if (!page || !page.published || !page.content.trim()) {
    return res.status(404).json({ error: 'Page not found' });
  }
  cacheBriefly(res);
  res.json({
    page: {
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaDescription: page.metaDescription,
      updatedAt: page.updatedAt,
    },
  });
}));

// ===================================================================== admin

adminContentRouter.use(requireAuth, requireAdmin);

const reorderSchema = z.object({ ids: z.array(z.string().uuid()).min(1).max(500) });

// ---- FAQs

const faqSchema = z.object({
  category: z.string().trim().min(2, 'Category is required').max(60),
  question: z.string().trim().min(5, 'Enter the question').max(300),
  answer: z.string().trim().min(5, 'Enter the answer').max(5000),
  published: z.boolean().default(true),
});

adminContentRouter.get('/faqs', safe(async (_req, res) => {
  const faqs = await prisma.faq.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  res.json({ faqs });
}));

adminContentRouter.post('/faqs', safe(async (req, res) => {
  const parsed = faqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const last = await prisma.faq.aggregate({ _max: { sortOrder: true } });
  const { category, question, answer, published } = parsed.data;
  const faq = await prisma.faq.create({
    data: { category, question, answer, published, sortOrder: (last._max.sortOrder ?? 0) + 10 },
  });
  res.status(201).json({ faq });
}));

adminContentRouter.patch('/faqs/:id', safe(async (req, res) => {
  const parsed = faqSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = await prisma.faq.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'FAQ not found' });
  const faq = await prisma.faq.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ faq });
}));

adminContentRouter.delete('/faqs/:id', safe(async (req, res) => {
  const existing = await prisma.faq.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'FAQ not found' });
  await prisma.faq.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

/** Saves a new order: `ids` lists FAQs in the order they should appear. */
adminContentRouter.post('/faqs/reorder', safe(async (req, res) => {
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction(
    parsed.data.ids.map((id, index) => prisma.faq.update({ where: { id }, data: { sortOrder: (index + 1) * 10 } })),
  );
  res.json({ ok: true });
}));

// ---- Banners

/** A link must be a site-relative path or an http(s) URL (never javascript: or data:). */
const linkSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || /^\/(?!\/)/.test(v) || /^https?:\/\//i.test(v), {
    message: 'Link must start with / (a page on this site) or https://',
  });

const imageSchema = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === '' || /^https:\/\//i.test(v), { message: 'Image URL must start with https://' });

const bannerSchema = z
  .object({
    title: z.string().trim().min(2, 'Enter a title').max(120),
    message: z.string().trim().max(300).default(''),
    ctaLabel: z.string().trim().max(40).default(''),
    linkUrl: linkSchema.default(''),
    imageUrl: imageSchema.default(''),
    placement: z.enum(PLACEMENTS),
    active: z.boolean().default(true),
    startsAt: z.coerce.date().nullable().optional(),
    endsAt: z.coerce.date().nullable().optional(),
  })
  .refine((b) => !b.startsAt || !b.endsAt || b.startsAt < b.endsAt, {
    message: 'The end date must be after the start date',
    path: ['endsAt'],
  })
  .refine((b) => !b.ctaLabel || b.linkUrl, { message: 'Add a link for the button', path: ['linkUrl'] });

const bannerData = (b: z.infer<typeof bannerSchema>) => ({
  title: b.title,
  message: b.message,
  ctaLabel: b.ctaLabel || null,
  linkUrl: b.linkUrl || null,
  imageUrl: b.imageUrl || null,
  placement: b.placement,
  active: b.active,
  startsAt: b.startsAt ?? null,
  endsAt: b.endsAt ?? null,
});

adminContentRouter.get('/banners', safe(async (_req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  res.json({ banners });
}));

adminContentRouter.post('/banners', safe(async (req, res) => {
  const parsed = bannerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const last = await prisma.banner.aggregate({ where: { placement: parsed.data.placement }, _max: { sortOrder: true } });
  const banner = await prisma.banner.create({
    data: { ...bannerData(parsed.data), sortOrder: (last._max.sortOrder ?? 0) + 10 },
  });
  res.status(201).json({ banner });
}));

adminContentRouter.patch('/banners/:id', safe(async (req, res) => {
  const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Banner not found' });
  // The editor always sends the whole banner, so validate it as a whole.
  const parsed = bannerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: bannerData(parsed.data) });
  res.json({ banner });
}));

/** Quick on/off from the list, without resending the whole banner. */
adminContentRouter.patch('/banners/:id/active', safe(async (req, res) => {
  const parsed = z.object({ active: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Banner not found' });
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: { active: parsed.data.active } });
  res.json({ banner });
}));

adminContentRouter.delete('/banners/:id', safe(async (req, res) => {
  const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Banner not found' });
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

adminContentRouter.post('/banners/reorder', safe(async (req, res) => {
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await prisma.$transaction(
    parsed.data.ids.map((id, index) => prisma.banner.update({ where: { id }, data: { sortOrder: (index + 1) * 10 } })),
  );
  res.json({ ok: true });
}));

// ---- CMS pages

// Paths the website itself uses; a custom page can't take them over (it is served at /p/<slug> anyway).
const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'register', 'p', 'blog', 'shop', 'support', 'faq']);

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Enter a URL name')
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only (e.g. cookie-policy)')
  .refine((s) => !RESERVED_SLUGS.has(s), { message: 'That URL name is reserved' });

const pageSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  content: z.string().max(100_000).default(''),
  metaDescription: z.string().trim().max(300).default(''),
  published: z.boolean().default(false),
});

adminContentRouter.get('/pages', safe(async (_req, res) => {
  const pages = await prisma.cmsPage.findMany({
    orderBy: [{ isSystem: 'desc' }, { title: 'asc' }],
    // The list doesn't need every page's full text.
    select: { id: true, slug: true, title: true, published: true, isSystem: true, updatedAt: true, content: true },
  });
  res.json({
    pages: pages.map(({ content, ...p }) => ({ ...p, hasContent: content.trim().length > 0 })),
  });
}));

adminContentRouter.get('/pages/:id', safe(async (req, res) => {
  const page = await prisma.cmsPage.findUnique({ where: { id: req.params.id } });
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json({ page });
}));

adminContentRouter.post('/pages', safe(async (req, res) => {
  const parsed = pageSchema.extend({ slug: slugSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  if (await prisma.cmsPage.findUnique({ where: { slug: parsed.data.slug } })) {
    return res.status(409).json({ error: 'A page with this URL name already exists' });
  }
  if (parsed.data.published && !parsed.data.content.trim()) {
    return res.status(400).json({ error: 'Add some content before publishing' });
  }
  const { slug, title, content, published, metaDescription } = parsed.data;
  const page = await prisma.cmsPage.create({
    data: { slug, title, content, published, metaDescription: metaDescription || null },
  });
  res.status(201).json({ page });
}));

adminContentRouter.patch('/pages/:id', safe(async (req, res) => {
  const parsed = pageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = await prisma.cmsPage.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Page not found' });
  if (parsed.data.published && !parsed.data.content.trim()) {
    return res.status(400).json({ error: 'Add some content before publishing' });
  }
  // The URL name is fixed once a page exists (links to it would break) - and always for built-in pages.
  const page = await prisma.cmsPage.update({
    where: { id: req.params.id },
    data: { ...parsed.data, metaDescription: parsed.data.metaDescription || null },
  });
  res.json({ page });
}));

adminContentRouter.delete('/pages/:id', safe(async (req, res) => {
  const existing = await prisma.cmsPage.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Page not found' });
  if (existing.isSystem) {
    return res.status(409).json({
      error: 'Built-in pages cannot be deleted. Unpublish it to go back to the website\'s original text.',
    });
  }
  await prisma.cmsPage.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));


// ============================================================ page content
// Editable text and images for the main website pages. Rows exist only for
// fields an admin has changed; the website falls back to its built-in default
// for everything else, so an empty table means "show the defaults".

const SITE_PAGES = ['home', 'how-it-works', 'shop', 'about', 'qr-scan', 'contact'] as const;
const KEY_RE = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const MAX_VALUE = 5000;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function detectImage(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

const imageUrl = (id: string) => `/api/content/images/${id}`;

async function loadSitePage(page: string) {
  const rows = await prisma.siteContent.findMany({
    where: { page },
    include: { image: { select: { id: true, width: true, height: true, sizeBytes: true, fileName: true } } },
  });
  const values: Record<string, string> = {};
  const images: Record<string, { id: string; url: string; width: number; height: number; sizeBytes: number; fileName: string }> = {};
  for (const r of rows) {
    if (r.image) images[r.key] = { ...r.image, url: imageUrl(r.image.id) };
    else if (r.value !== null) values[r.key] = r.value;
  }
  return { values, images };
}

contentRouter.get('/site/:page', safe(async (req, res) => {
  const page = req.params.page;
  if (!(SITE_PAGES as readonly string[]).includes(page)) return res.status(404).json({ error: 'Unknown page' });
  const data = await loadSitePage(page);
  cacheBriefly(res);
  res.json(data);
}));

contentRouter.get('/images/:id', safe(async (req, res) => {
  const img = await prisma.siteImage.findUnique({ where: { id: req.params.id } });
  if (!img) return res.status(404).json({ error: 'Not found' });
  // A replaced image gets a new id, so the bytes behind one URL never change.
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Type', img.mimeType);
  res.setHeader('Content-Length', String(img.data.length));
  res.end(img.data);
}));

adminContentRouter.get('/site/:page', requireAuth, requireAdmin, safe(async (req, res) => {
  const page = req.params.page;
  if (!(SITE_PAGES as readonly string[]).includes(page)) return res.status(404).json({ error: 'Unknown page' });
  res.json(await loadSitePage(page));
}));

const sitePutSchema = z.object({
  // key -> new text, or null to go back to the default
  values: z.record(z.string().nullable()).default({}),
  // key -> uploaded image id, or null to go back to the default
  images: z.record(z.string().uuid().nullable()).default({}),
});

adminContentRouter.put('/site/:page', requireAuth, requireAdmin, safe(async (req, res) => {
  const page = req.params.page;
  if (!(SITE_PAGES as readonly string[]).includes(page)) return res.status(404).json({ error: 'Unknown page' });
  const parsed = sitePutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid content payload' });
  const { values, images } = parsed.data;

  const keys = [...Object.keys(values), ...Object.keys(images)];
  if (keys.length > 300) return res.status(400).json({ error: 'Too many fields in one save' });
  if (keys.some((k) => !KEY_RE.test(k))) return res.status(400).json({ error: 'Invalid field key' });
  for (const [k, v] of Object.entries(values)) {
    if (v !== null && v.length > MAX_VALUE) return res.status(400).json({ error: `"${k}" is too long (max ${MAX_VALUE} characters)` });
  }
  const imageIds = Object.values(images).filter((v): v is string => v !== null);
  if (imageIds.length) {
    const found = await prisma.siteImage.count({ where: { id: { in: imageIds } } });
    if (found !== new Set(imageIds).size) return res.status(400).json({ error: 'An uploaded image no longer exists. Upload it again.' });
  }

  const ops = [];
  for (const [key, v] of Object.entries(values)) {
    const trimmed = v === null ? null : v.trim();
    if (trimmed === null || trimmed === '') {
      ops.push(prisma.siteContent.deleteMany({ where: { page, key } }));
    } else {
      ops.push(prisma.siteContent.upsert({
        where: { page_key: { page, key } },
        create: { page, key, value: trimmed },
        update: { value: trimmed, imageId: null },
      }));
    }
  }
  for (const [key, id] of Object.entries(images)) {
    if (id === null) {
      ops.push(prisma.siteContent.deleteMany({ where: { page, key } }));
    } else {
      ops.push(prisma.siteContent.upsert({
        where: { page_key: { page, key } },
        create: { page, key, imageId: id },
        update: { imageId: id, value: null },
      }));
    }
  }
  await prisma.$transaction(ops);

  // Drop images nothing points to any more. The one-hour grace keeps a file
  // another admin has uploaded but not saved yet.
  await prisma.siteImage.deleteMany({
    where: { usedBy: { none: {} }, createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
  });

  res.json(await loadSitePage(page));
}));

adminContentRouter.post(
  '/images',
  requireAuth,
  requireAdmin,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream'], limit: MAX_IMAGE_BYTES }),
  safe(async (req, res) => {
    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) return res.status(400).json({ error: 'Send the image as the request body.' });
    const mimeType = detectImage(body);
    if (!mimeType) return res.status(400).json({ error: 'Only JPEG, PNG or WebP images are supported.' });
    let width = 0;
    let height = 0;
    try {
      const dim = imageSize(body);
      width = dim.width ?? 0;
      height = dim.height ?? 0;
    } catch {
      return res.status(400).json({ error: 'Could not read this image. Try exporting it again.' });
    }
    if (!width || !height) return res.status(400).json({ error: 'Could not read this image. Try exporting it again.' });
    const rawName = typeof req.query.name === 'string' ? req.query.name : 'image';
    const fileName = rawName.replace(/[^\w.\- ]/g, '_').slice(0, 120) || 'image';
    const img = await prisma.siteImage.create({
      data: { fileName, mimeType, sizeBytes: body.length, width, height, data: body },
      select: { id: true, width: true, height: true, sizeBytes: true, fileName: true },
    });
    res.status(201).json({ ...img, url: imageUrl(img.id) });
  }),
);
