# QR Scan → Masked Call: API Flow

What happens, in order, from someone scanning a vehicle's QR tag to getting a
masked-call number to dial. All routes are defined in
`server/src/routes/qrCodes.ts` and called from `src/pages/QrLandingPage.tsx`.

## 1. Check QR status

```
GET /api/qr/:code
```

Called immediately on page load. No auth required.

**Response**
```json
{ "status": "ACTIVE" | "INACTIVE" | "DISABLED" }
```

- `INACTIVE` → show the "Activate this tag?" prompt (a different flow, not
  covered here).
- `DISABLED` → show "This QR is disabled."
- `ACTIVE` → immediately call step 2.

## 2. Get public details (no phone numbers yet)

```
GET /api/qr/:code/details
```

Called only if step 1 returned `ACTIVE`. No auth required.

**Response**
```json
{
  "owner": { "fullName": "Akshaya" },
  "vehicle": { "registration": "...", "nickname": "...", "vehicleType": "...", "brand": "...", "model": "...", "fuelType": "...", "color": "..." },
  "emergencyContacts": [{ "name": "...", "role": "..." }]
}
```

Phone numbers are deliberately withheld here — this is what renders the
scan-result card (`ScanResultCard.tsx`). Registration/plate number is fetched
but not displayed on the card.

## 3. User picks "Masked Call" and enters their own number

No API call yet — this just opens the verify form
(`CallVerifyModal` in `QrLandingPage.tsx`) asking for:
- last 4 digits of the vehicle's plate
- the scanner's own phone number (`callerPhone`)

## 4. Set up the masked call

```
POST /api/qr/:code/masked-call
```

**Request body**
```json
{
  "last4": "3456",
  "callerPhone": "9876543210",
  "target": { "kind": "owner" }
}
```
(`target` is `{ "kind": "contact", "index": 0 }` for an emergency contact instead of the owner.)

**Server does, in order:**
1. Re-validates `last4` against the vehicle's real registration (never trusts
   a client-held "already verified" result from a separate request).
2. Looks up the destination phone number for `target`.
3. Inserts a row into `MaskedCallRequest` (Prisma model) — `qrCodeId`,
   `targetKind`, `targetIndex`, `callerPhone`, timestamp. This is the audit
   log a future Knowlarity integration will read from.
4. Returns a `virtualNumber`.

**Response**
```json
{
  "virtualNumber": "9876543210",
  "isMasked": false,
  "destinationPhone": "9876543210",
  "callerPhone": "9876543210"
}
```

⚠️ **Not actually masked yet.** `virtualNumber` today is just
`destinationPhone` echoed back — there is no Knowlarity SR-number /
click-to-call call happening. `isMasked: false` marks this. The frontend
shows a 90-second countdown and a `tel:` link to `virtualNumber` regardless.

`destinationPhone` and `callerPhone` are included explicitly (not just
folded into `virtualNumber`) so both legs of the bridge are available
up front to whoever wires up Knowlarity — no extra lookup needed.

## Where Knowlarity plugs in later

Everything above stays the same. The only change needed is inside the
`POST /:code/masked-call` handler in `server/src/routes/qrCodes.ts`: instead
of returning the real number, call Knowlarity's "Get Agent" / SR-number API
to provision (or reuse) a virtual number that bridges `callerPhone` ↔ the
destination number, store that number as `virtualNumber` on the
`MaskedCallRequest` row, and return it with `isMasked: true`.


