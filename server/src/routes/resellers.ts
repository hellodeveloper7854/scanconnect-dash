import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Public, unauthenticated by design: the "Become a reseller" form is a
 * lead-gen form open to any site visitor, signed in or not.
 */
export const resellersRouter = Router();

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

const createResellerSchema = z.object({
  name: z.string().trim().regex(NAME_PATTERN, 'Enter a valid full name (letters only)'),
  email: z.string().trim().email(),
  phone: z.string().trim().regex(PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number'),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

resellersRouter.post('/', async (req, res) => {
  const parsed = createResellerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { name, email, phone, address, notes } = parsed.data;
  const reseller = await prisma.reseller.create({ data: { name, email, phone, address, notes } });
  res.status(201).json({ reseller });
});
