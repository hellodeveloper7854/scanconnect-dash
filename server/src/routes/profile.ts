import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const profileRouter = Router();
profileRouter.use(requireAuth);

const DEFAULT_PREFERENCES = {
  systemLanguage: 'English (United Kingdom)',
  emailDigests: true,
  smsCriticalAlerts: true,
  inAppPush: false,
  timeFormat: '24',
};

profileRouter.get('/preferences', async (req, res) => {
  const preferences = await prisma.userPreferences.findUnique({ where: { userId: req.user!.id } });
  res.json({ preferences: preferences ?? { ...DEFAULT_PREFERENCES, userId: req.user!.id } });
});

const preferencesSchema = z.object({
  systemLanguage: z.string().min(1).max(60).optional(),
  emailDigests: z.boolean().optional(),
  smsCriticalAlerts: z.boolean().optional(),
  inAppPush: z.boolean().optional(),
  timeFormat: z.enum(['24', '12']).optional(),
});

profileRouter.patch('/preferences', async (req, res) => {
  const parsed = preferencesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const preferences = await prisma.userPreferences.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id, ...DEFAULT_PREFERENCES, ...parsed.data },
    update: parsed.data,
  });

  res.json({ preferences });
});

profileRouter.get('/emergency-contacts', async (req, res) => {
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  res.json({ contacts });
});

const createContactSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(120).optional(),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional(),
  isPrimary: z.boolean().optional(),
});

profileRouter.post('/emergency-contacts', async (req, res) => {
  const parsed = createContactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  if (parsed.data.isPrimary) {
    await prisma.emergencyContact.updateMany({
      where: { userId: req.user!.id, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const contact = await prisma.emergencyContact.create({
    data: {
      userId: req.user!.id,
      name: parsed.data.name,
      role: parsed.data.role,
      phone: parsed.data.phone,
      email: parsed.data.email,
      isPrimary: parsed.data.isPrimary,
    },
  });

  res.status(201).json({ contact });
});

const updateContactSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: z.string().max(120).optional(),
  phone: z.string().min(6).max(20).optional(),
  email: z.string().email().optional(),
  isPrimary: z.boolean().optional(),
});

profileRouter.patch('/emergency-contacts/:id', async (req, res) => {
  const parsed = updateContactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.emergencyContact.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  if (parsed.data.isPrimary) {
    await prisma.emergencyContact.updateMany({
      where: { userId: req.user!.id, isPrimary: true, id: { not: req.params.id } },
      data: { isPrimary: false },
    });
  }

  const contact = await prisma.emergencyContact.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  res.json({ contact });
});

profileRouter.delete('/emergency-contacts/:id', async (req, res) => {
  const contact = await prisma.emergencyContact.findUnique({ where: { id: req.params.id } });
  if (!contact || contact.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  await prisma.emergencyContact.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

profileRouter.get('/vehicles', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const vehicleType = typeof req.query.vehicleType === 'string' ? req.query.vehicleType : undefined;

  const vehicles = await prisma.vehicle.findMany({
    where: {
      userId: req.user!.id,
      ...(vehicleType ? { vehicleType } : {}),
      ...(search
        ? {
            OR: [
              { registration: { contains: search, mode: 'insensitive' as const } },
              { nickname: { contains: search, mode: 'insensitive' as const } },
              { brand: { contains: search, mode: 'insensitive' as const } },
              { model: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });

  res.json({ vehicles });
});

const createVehicleSchema = z.object({
  registration: z.string().min(1).max(30),
  nickname: z.string().max(60).optional(),
  vehicleType: z.string().max(40).optional(),
  brand: z.string().max(60).optional(),
  model: z.string().max(60).optional(),
  fuelType: z.string().max(30).optional(),
  color: z.string().max(30).optional(),
  isPrimary: z.boolean().optional(),
});

profileRouter.post('/vehicles', async (req, res) => {
  const parsed = createVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  if (parsed.data.isPrimary) {
    await prisma.vehicle.updateMany({
      where: { userId: req.user!.id, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: req.user!.id,
        registration: parsed.data.registration,
        nickname: parsed.data.nickname,
        vehicleType: parsed.data.vehicleType,
        brand: parsed.data.brand,
        model: parsed.data.model,
        fuelType: parsed.data.fuelType,
        color: parsed.data.color,
        isPrimary: parsed.data.isPrimary,
      },
    });
    res.status(201).json({ vehicle });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return res.status(409).json({ error: 'A vehicle with this registration already exists' });
    }
    throw err;
  }
});

const updateVehicleSchema = z.object({
  registration: z.string().min(1).max(30).optional(),
  nickname: z.string().max(60).optional(),
  vehicleType: z.string().max(40).optional(),
  brand: z.string().max(60).optional(),
  model: z.string().max(60).optional(),
  fuelType: z.string().max(30).optional(),
  color: z.string().max(30).optional(),
  isPrimary: z.boolean().optional(),
});

profileRouter.patch('/vehicles/:id', async (req, res) => {
  const parsed = updateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  if (parsed.data.isPrimary) {
    await prisma.vehicle.updateMany({
      where: { userId: req.user!.id, isPrimary: true, id: { not: req.params.id } },
      data: { isPrimary: false },
    });
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  res.json({ vehicle });
});

profileRouter.delete('/vehicles/:id', async (req, res) => {
  const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  await prisma.vehicle.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
