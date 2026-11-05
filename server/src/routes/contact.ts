import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { fullNameSchema, isDummyPhone } from '../lib/validation.js';

/**
 * Public, unauthenticated by design: the Contact Us form is open to any site
 * visitor, signed in or not.
 */
export const contactRouter = Router();

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

const createContactRequestSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .regex(NAME_PATTERN, 'Enter a valid full name (letters only)').pipe(fullNameSchema),
  email: z.string({ required_error: 'Email is required' }).trim().email('Enter a valid email address'),
  // Required so the team can always reach the sender by phone as well as email.
  phone: z
    .string({ required_error: 'Mobile number is required', invalid_type_error: 'Mobile number is required' })
    .trim()
    .min(1, 'Mobile number is required')
    .regex(PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number')
    .refine((v) => !isDummyPhone(v), { message: 'Enter a real mobile number' }),
  // At least 5 characters and some real words, so "1234" can't go out as an email subject.
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .refine((v) => (v.match(/[A-Za-z]/g) ?? []).length >= 3, {
      message: 'Enter a meaningful subject (use words, not just numbers or symbols)',
    }),
  message: z.string({ required_error: 'Message is required' }).trim().min(10, 'Message must be at least 10 characters'),
});

contactRouter.post('/', async (req, res) => {
  const parsed = createContactRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { fullName, email, phone, subject, message } = parsed.data;
  const contactRequest = await prisma.contactRequest.create({
    data: { fullName, email, phone, subject, message },
  });
  res.status(201).json({ contactRequest });
});
