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

profileRouter.delete('/emergency-contacts/:id', async (req, res) => {
  const contact = await prisma.emergencyContact.findUnique({ where: { id: req.params.id } });
  if (!contact || contact.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  await prisma.emergencyContact.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
