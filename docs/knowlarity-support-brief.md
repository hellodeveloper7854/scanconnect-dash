# ScanConnect × Knowlarity — Masked Calling: Integration Brief & Open Questions

Prepared to help Knowlarity support diagnose why inbound calls to our SR numbers
do not connect. Replace `<YOUR-API-DOMAIN>` with the live ScanConnect API host
before sharing. Do **not** paste real API keys into this document — share the
`X-API-Key` value with Knowlarity privately.

## 1. What we are building

ScanConnect puts a QR sticker on a vehicle. Anyone who scans it can reach the
vehicle owner (or an emergency contact) **without either side seeing the
other's phone number**.

1. The scanner opens the QR page and enters their own mobile number.
2. Our server returns one of our Knowlarity SR numbers (the "masked number").
3. The scanner dials that SR number **from the mobile number they entered**.
4. Knowlarity asks our server who to connect that caller to, then bridges the call.
5. After the call ends, Knowlarity pushes the call detail record (CDR) to us.

We do **not** use the `makecall` (click-to-call) API. The scanner dials in
(inbound); Knowlarity bridges to the owner (outbound leg).

## 2. Numbers on our account

From `GET /Basic/v1/account/numbers/`:

| Number | number_type | cli_type | Role |
|---|---|---|---|
| +917026054141 | 1 | NONE | SR number |
| +917026155788 | 1 | NONE | SR number |
| +917026166767 | 1 | NONE | SR number |
| +917026166883 | 1 | NONE | SR number |
| +917026177553 | 1 | NONE | SR number |
| +918035387434 | 0 | OUTGOING | CLI (outbound caller ID only) |

We also saw `+918047252001` as `ivr_number` (and `+918044901127` as
`display_number`) in a call-log push on 2026-09-23. Our server stored it, so
that test reached our call-logs endpoint.

## 3. What we need Knowlarity to configure

For **each SR number we hand out** (all five `+917026…` numbers, or whichever
you tell us are valid):

- An inbound call flow that, when the number is dialled, calls our
  **get-destination-number** URL with the caller's number (section 4), and
  bridges the call to the `destination_number` we return.
- Call-log (CDR) push to our **call-logs** URL (section 5).

## 4. Endpoint 1 — resolve destination (Knowlarity → us)

```
POST https://<YOUR-API-DOMAIN>/api/qr/partner/get-destination-number
Content-Type: application/json
X-API-Key: <shared secret — provided separately>
```

Request:
```json
{ "caller_number": "+919458594043" }
```

Success (200):
```json
{ "caller_number": "+919458594043", "destination_number": "+919392530430" }
```

Errors:

| Status | Meaning |
|---|---|
| 401 | `X-API-Key` header missing or wrong |
| 404 | No recent masked-call request from this `caller_number` (the scanner dialled from a different number than the one they entered, or never started a request) |
| 400 | `caller_number` missing/invalid |

Notes:
- All numbers are E.164 (`+91XXXXXXXXXX`). We match on the last 10 digits, so a
  leading `+91`, `91`, or `0` on `caller_number` is fine.
- The lookup uses the caller's most recent request, created seconds earlier on
  our QR page, so it must be called at the moment the inbound call arrives.

## 5. Endpoint 2 — call log push (Knowlarity → us)

```
POST https://<YOUR-API-DOMAIN>/api/qr/partner/call-logs
Content-Type: application/json
```

No API key required; any JSON body is accepted and stored. Returns `201`
`{ "received": true, "call_log_id": "..." }`.

## 6. What we observe today (2026-10-08)

- Our QR page works: it creates a masked-call request and shows the SR number
  to the scanner (verified in our database — requests created with
  `+917026054141` at 11:59 and 12:26 UTC, and `+918047252001` at 12:39 UTC).
- When the number is dialled from the mobile number entered on the page, **the
  call does not connect** (caller hears: _<describe exactly what you hear>_).
- Our server has received **no** `get-destination-number` request and **no**
  call-log push for these attempts. The latest call-log we hold is from
  2026-09-30. So the call is not reaching our webhook.

## 7. Questions for Knowlarity

1. Is each of the five `+917026…` numbers **active for inbound calls**? Which
   call flow / IVR / application is attached to each? If none, please attach
   the same flow that handles `+918047252001`.
2. Is `+918047252001` an inbound SR number or an outbound-only IVR/display
   number? Which numbers should scanners dial?
3. For a call we placed at **<date/time IST>** from **<scanner number>** to
   **<SR number>**, what do your logs show? Was our `get-destination-number`
   URL called, and what was our response?
4. What URL and `X-API-Key` header value are saved on your side for this
   webhook? Please confirm it matches the URL in section 4 exactly.
5. Does your flow apply a DND / NDNC check on the bridged outbound leg to the
   owner? These are user-initiated service calls — can the check be disabled
   or the numbers categorised as transactional?
6. Do you need any additional fields from us (response format, timeouts)? Our
   endpoint normally answers in well under a second.

## 8. How you can test our side independently

After a masked-call request has been made from our QR page for caller
`+91XXXXXXXXXX`:

```bash
curl -X POST https://<YOUR-API-DOMAIN>/api/qr/partner/get-destination-number \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <shared secret>" \
  -d '{"caller_number":"+91XXXXXXXXXX"}'
```

A `200` with a `destination_number` confirms our side is working.
