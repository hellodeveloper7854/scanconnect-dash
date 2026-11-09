import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { contactPhoneSchema, fullNameSchema, normalizeRegistration, registrationSchema, vehicleTextSchema } from '../lib/validation.js';

export const profileRouter = Router();

/** Whether this user already has a vehicle with the same plate (ignoring case, spaces and hyphens). */
export async function hasVehicleWithRegistration(userId: string, registration: string, exceptId?: string) {
  const wanted = normalizeRegistration(registration);
  const vehicles = await prisma.vehicle.findMany({
    where: { userId, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { registration: true },
  });
  return vehicles.some((v) => normalizeRegistration(v.registration) === wanted);
}
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
  name: fullNameSchema,
  role: z.string().max(120).optional(),
  phone: contactPhoneSchema,
  email: z.string().email().optional(),
  isPrimary: z.boolean().optional(),
  // The owner confirms this person agreed to receive WhatsApp alerts (SOS with location).
  whatsappOptIn: z.boolean().optional(),
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
      whatsappOptIn: parsed.data.whatsappOptIn === true,
      whatsappOptInAt: parsed.data.whatsappOptIn === true ? new Date() : null,
    },
  });

  res.status(201).json({ contact });
});

const updateContactSchema = z.object({
  name: fullNameSchema.optional(),
  role: z.string().max(120).optional(),
  phone: contactPhoneSchema.optional(),
  // '' or null clears the email.
  email: z.union([z.string().email(), z.literal(''), z.null()]).optional(),
  isPrimary: z.boolean().optional(),
  whatsappOptIn: z.boolean().optional(),
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

  // Consent belongs to a person at a number: a changed number needs it confirmed again.
  const numberChanged = parsed.data.phone !== undefined && parsed.data.phone !== existing.phone;
  const optIn = parsed.data.whatsappOptIn ?? (numberChanged ? false : existing.whatsappOptIn);

  const contact = await prisma.emergencyContact.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.email === '' ? { email: null } : {}),
      whatsappOptIn: optIn,
      whatsappOptInAt: optIn ? (existing.whatsappOptIn && !numberChanged ? existing.whatsappOptInAt : new Date()) : null,
    },
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
    include: { qrCodeRecord: { select: { code: true } } },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });

  res.json({ vehicles });
});

const createVehicleSchema = z.object({
  registration: registrationSchema,
  nickname: z.string().max(60).optional(),
  vehicleType: z.string().max(40).optional(),
  brand: vehicleTextSchema.optional(),
  model: vehicleTextSchema.optional(),
  fuelType: z.string().max(30).optional(),
  color: z.string().max(30).optional(),
  isPrimary: z.boolean().optional(),
});

profileRouter.post('/vehicles', async (req, res) => {
  const parsed = createVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  if (await hasVehicleWithRegistration(req.user!.id, parsed.data.registration)) {
    return res.status(409).json({ error: 'Vehicle already exists: you have already added a vehicle with this registration number.' });
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
  registration: registrationSchema.optional(),
  nickname: z.string().max(60).optional(),
  vehicleType: z.string().max(40).optional(),
  brand: vehicleTextSchema.optional(),
  model: vehicleTextSchema.optional(),
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

  if (
    parsed.data.registration &&
    (await hasVehicleWithRegistration(req.user!.id, parsed.data.registration, req.params.id))
  ) {
    return res.status(409).json({ error: 'Vehicle already exists: you have already added a vehicle with this registration number.' });
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

  await prisma.$transaction([
    prisma.qrCode.updateMany({
      where: { vehicleId: req.params.id },
      data: { vehicleId: null, status: 'INACTIVE', activatedAt: null },
    }),
    prisma.vehicle.delete({ where: { id: req.params.id } }),
  ]);
  res.json({ ok: true });
});
