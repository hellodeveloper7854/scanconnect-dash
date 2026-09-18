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

## Partner-facing endpoints (Knowlarity ⇄ ScanConnect)

Two server-to-server routes, both in `server/src/routes/qrCodes.ts`, both
gated by `requirePartnerApiKey` (shared `X-API-Key` header, not a Firebase
user token). Full request/response reference:
`docs/ScanConnect_Partner_API.pdf` (regenerate with
`docs/generate_partner_api_pdf.py`).

**Phone number format:** every phone number in both requests and responses
is E.164 — `+91` followed by the 10-digit mobile number, e.g.
`+919458594043`. Plain 10-digit input is still accepted (only the last 10
digits are matched), but responses are always E.164. Conversion lives in
`server/src/lib/phone.ts` (`toE164India`, `last10Digits`) — nothing else in
the codebase should format a `+91` number by hand.

### `POST /api/qr/partner/get-destination-number`

Knowlarity → ScanConnect, before bridging a call. Resolves `caller_number` to
the number to connect them to, by matching against the most recent
`MaskedCallRequest` row for that caller (created by the app's own
scan → verify → call flow above).

```json
// Request
{ "caller_number": "+919458594043" }

// 200 response
{ "caller_number": "+919458594043", "destination_number": "+919392530430" }
```

### `POST /api/qr/partner/call-logs`

Knowlarity → ScanConnect, after a call ends — pushes the CDR (call detail
record). This is a push, not something ScanConnect polls for.

```json
// Request
{
  "provider_call_id": "kw_9f8a2c11",
  "caller_number": "+919458594043",
  "destination_number": "+919392530430",
  "status": "completed",
  "duration_seconds": 87,
  "started_at": "2026-09-18T11:42:03Z",
  "ended_at": "2026-09-18T11:43:30Z"
}

// 201 response
{ "received": true, "call_log_id": "6f2b1e0a-..." }
```

`provider_call_id` is the idempotency key — pushing the same id again
updates the existing row (`upsert`) instead of creating a duplicate.

**Storage:** every push is written to the `CallLog` table in ScanConnect's
own Postgres database (`server/prisma/schema.prisma`) — one row per call:
`callerNumber`, `destinationNumber`, `providerCallId` (unique), `status`,
`durationSeconds`, `startedAt`, `endedAt`, plus `rawPayload` (the full
original JSON, kept as-received for audit/debugging). When `caller_number`
matches a recent `MaskedCallRequest`, the row is linked to it
(`maskedCallRequestId`) for reporting; unmatched calls are still stored in
full with that field left null.

