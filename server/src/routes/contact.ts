import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Public, unauthenticated by design: the Contact Us form is open to any site
 * visitor, signed in or not.
 */
export const contactRouter = Router();

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

const createContactRequestSchema = z.object({
  fullName: z.string().trim().regex(NAME_PATTERN, 'Enter a valid full name (letters only)'),
  email: z.string().trim().email(),
  phone: z.union([z.string().trim().regex(PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number'), z.literal('')]).optional(),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
});

contactRouter.post('/', async (req, res) => {
  const parsed = createContactRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { fullName, email, phone, subject, message } = parsed.data;
  const contactRequest = await prisma.contactRequest.create({
    data: { fullName, email, phone: phone || undefined, subject, message },
  });
  res.status(201).json({ contactRequest });
});
