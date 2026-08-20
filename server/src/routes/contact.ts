import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Public, unauthenticated by design: the Contact Us form is open to any site
 * visitor, signed in or not.
 */
export const contactRouter = Router();

const createContactRequestSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
});

contactRouter.post('/', async (req, res) => {
  const parsed = createContactRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const contactRequest = await prisma.contactRequest.create({ data: parsed.data });
  res.status(201).json({ contactRequest });
});
