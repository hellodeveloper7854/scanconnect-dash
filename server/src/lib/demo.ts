/**
 * QR scan analytics has no backing table — it's aggregate reporting data,
 * not something admins add/edit as individual records. Everything else that
 * used to live here (QR codes, stickers, IVR numbers, plans, coupons, etc.)
 * now has a real Prisma model with full CRUD; see adminDemo.ts.
 */
export const demoQrScanAnalytics = {
  daily: [12, 18, 9, 22, 30, 15, 20],
  weekly: [98, 112, 87, 134],
  monthly: [420, 465, 512],
  byDevice: { mobile: 72, desktop: 21, tablet: 7 },
  byLocation: [
    { city: 'Mumbai', scans: 210 },
    { city: 'Bengaluru', scans: 165 },
    { city: 'Delhi', scans: 140 },
  ],
};
