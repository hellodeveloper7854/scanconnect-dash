import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './lib/env.js';
import { authRouter } from './routes/auth.js';
import { ordersRouter, razorpayWebhookHandler } from './routes/orders.js';
import { adminRouter } from './routes/admin.js';
import { adminDemoRouter } from './routes/adminDemo.js';
import { profileRouter } from './routes/profile.js';
import { reviewsRouter } from './routes/reviews.js';
import { sosRouter } from './routes/sos.js';
import { orderContactRouter } from './routes/orderContact.js';

const app = express();

// Helmet's default Cross-Origin-Resource-Policy (same-origin) blocks the
// frontend (a different origin/port) from loading images like the QR PNGs
// via <img src>, so relax it to allow cross-origin reads of our own assets.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));

// Razorpay webhook needs the raw request body for HMAC signature verification,
// so it's handled standalone here, before the JSON body parser touches the stream.
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);

app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/demo', adminDemoRouter);
app.use('/api/profile', profileRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/sos', sosRouter);
app.use('/api/order-contact', orderContactRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
