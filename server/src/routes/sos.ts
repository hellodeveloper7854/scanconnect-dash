import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const sosRouter = Router();

const createSosSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

sosRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createSosSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const alert = await prisma.sosAlert.create({
    data: {
      userId: req.user!.id,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    },
  });

  res.status(201).json({ alert });
});

sosRouter.get('/mine', requireAuth, async (req, res) => {
  const alerts = await prisma.sosAlert.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ alerts });
});
