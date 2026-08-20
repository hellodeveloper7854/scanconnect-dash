import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Public, unauthenticated by design: the "Become a reseller" form is a
 * lead-gen form open to any site visitor, signed in or not.
 */
export const resellersRouter = Router();

const createResellerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

resellersRouter.post('/', async (req, res) => {
  const parsed = createResellerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const reseller = await prisma.reseller.create({ data: parsed.data });
  res.status(201).json({ reseller });
});
