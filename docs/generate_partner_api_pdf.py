# -*- coding: utf-8 -*-
"""
Regenerates docs/ScanConnect_Partner_API.pdf.

The real partner API key is never hardcoded here (a previous version of this
script did — that key should be treated as compromised and rotated). Set it
via the PARTNER_API_KEY environment variable before running, or the PDF will
show a placeholder:

    PARTNER_API_KEY=your_real_key python docs/generate_partner_api_pdf.py
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Preformatted, PageBreak
)
from reportlab.lib.enums import TA_LEFT

API_KEY = os.environ.get("PARTNER_API_KEY", "<ask ScanConnect engineering for this value>")
BASE_URL = "https://scanconnect.co.in"

styles = getSampleStyleSheet()
title_style = ParagraphStyle('TitleCustom', parent=styles['Title'], fontSize=20, spaceAfter=4)
subtitle_style = ParagraphStyle('SubtitleCustom', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#5F5E5E'), spaceAfter=18)
h2 = ParagraphStyle('H2Custom', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#1B1C1C'), spaceBefore=18, spaceAfter=8)
h3 = ParagraphStyle('H3Custom', parent=styles['Heading3'], fontSize=11.5, textColor=colors.HexColor('#1B1C1C'), spaceBefore=10, spaceAfter=4)
body = ParagraphStyle('BodyCustom', parent=styles['Normal'], fontSize=10, leading=15, alignment=TA_LEFT)
note = ParagraphStyle('NoteCustom', parent=styles['Normal'], fontSize=9.5, leading=14, textColor=colors.HexColor('#736B00'), backColor=colors.HexColor('#FFFBEA'), borderColor=colors.HexColor('#E6D400'), borderWidth=1, borderPadding=8, spaceBefore=6, spaceAfter=6)
code_style = ParagraphStyle('CodeCustom', parent=styles['Code'], fontSize=9, leading=13, backColor=colors.HexColor('#F5F3F3'), borderPadding=8, fontName='Courier')

doc = SimpleDocTemplate(
    "docs/ScanConnect_Partner_API.pdf",
    pagesize=letter,
    topMargin=0.75*inch, bottomMargin=0.75*inch, leftMargin=0.8*inch, rightMargin=0.8*inch,
)

story = []

def endpoint_table(method, url):
    return Table(
        [["Method", method], ["URL", url]],
        colWidths=[1.1*inch, 5*inch],
        style=TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F3F3')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1B1C1C')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E2E2')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ]),
    )

# ---------------------------------------------------------------- Cover ----
story.append(Paragraph("ScanConnect Partner API", title_style))
story.append(Paragraph("Knowlarity Integration Guide", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E4E2E2')))
story.append(Spacer(1, 14))

story.append(Paragraph("Overview", h2))
story.append(Paragraph(
    "Two server-to-server endpoints make up this integration: <b>Get Destination Number</b> "
    "(Knowlarity calls us, before bridging a call, to find out who a caller should be connected to) "
    "and <b>Push Call Log</b> (Knowlarity calls us, after a call ends, to hand over the CDR). "
    "Both are authenticated the same way and both use E.164 phone numbers "
    "(<b>+91</b> followed by the 10-digit mobile number, e.g. <b>+919458594043</b>) for every phone "
    "number field, in requests and responses alike.",
    body,
))
story.append(Spacer(1, 8))

story.append(Paragraph("Authentication", h2))
story.append(Paragraph(
    "Both endpoints are authenticated with the same shared API key &mdash; not a user login token. "
    "Send it as a request header on every call:",
    body,
))
story.append(Spacer(1, 4))
story.append(Preformatted(f"X-API-Key: {API_KEY}", code_style))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Keep this key confidential &mdash; treat it like a password. If it is ever exposed publicly, "
    "let us know and we will issue a new one.",
    note,
))

# ------------------------------------------------- Get Destination Number --
story.append(Paragraph("1. Get Destination Number", h2))
story.append(Paragraph(
    "Resolves a caller's phone number to the number they should be bridged to &mdash; the vehicle "
    "owner or emergency contact a ScanConnect QR-tag scan most recently requested to be connected with.",
    body,
))
story.append(Spacer(1, 6))
story.append(endpoint_table("POST", f"{BASE_URL}/api/qr/partner/get-destination-number"))
story.append(Spacer(1, 10))

story.append(Paragraph("Request", h3))
story.append(Preformatted(
    "Content-Type: application/json\n"
    f"X-API-Key: {API_KEY}\n\n"
    '{\n'
    '  "caller_number": "+919458594043"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "<b>caller_number</b> (string, required) &mdash; the phone number placing the call, in E.164 "
    "(<b>+91XXXXXXXXXX</b>). Plain 10-digit input is also accepted for backward compatibility; only "
    "the last 10 digits are matched either way. All numbers in the response are always returned in "
    "E.164, regardless of the input format.",
    body,
))
story.append(Spacer(1, 8))

story.append(Paragraph("Response &mdash; 200 OK (match found)", h3))
story.append(Preformatted(
    '{\n'
    '  "caller_number": "+919458594043",\n'
    '  "destination_number": "+919392530430"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 6))
story.append(Paragraph("Response &mdash; 404 Not Found", h3))
story.append(Preformatted(
    '{\n'
    '  "error": "No pending call request found for this caller_number"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "A destination number is only available once the caller has scanned a live ScanConnect QR tag "
    "and completed the app's own verify-and-call flow first (or is one of the pre-seeded test numbers below).",
    note,
))
story.append(Spacer(1, 6))
story.append(Paragraph("Example (cURL)", h3))
story.append(Preformatted(
    f'curl -X POST {BASE_URL}/api/qr/partner/get-destination-number \\\n'
    f'  -H "Content-Type: application/json" \\\n'
    f'  -H "X-API-Key: {API_KEY}" \\\n'
    '  -d \'{"caller_number":"+919458594043"}\'',
    code_style,
))

story.append(Paragraph("Whitelisted Test Numbers", h3))
story.append(Table(
    [["Caller Number", "Destination Number"],
     ["+919458594043", "+919392530430"],
     ["+919555511329", "+919392530430"],
     ["+919711374160", "+919392530430"]],
    colWidths=[3*inch, 3*inch],
    style=TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FFED00')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E2E2')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]),
))

story.append(PageBreak())

# -------------------------------------------------------- Push Call Log ----
story.append(Paragraph("2. Push Call Log", h2))
story.append(Paragraph(
    "Called once a bridged call ends, to hand over the call detail record (CDR) &mdash; duration, "
    "final status, start/end times, and Knowlarity's own call id. This is a push from Knowlarity's "
    "side; ScanConnect does not poll for call logs.",
    body,
))
story.append(Spacer(1, 6))
story.append(endpoint_table("POST", f"{BASE_URL}/api/qr/partner/call-logs"))
story.append(Spacer(1, 10))

story.append(Paragraph("Request", h3))
story.append(Preformatted(
    "Content-Type: application/json\n"
    f"X-API-Key: {API_KEY}\n\n"
    '{\n'
    '  "provider_call_id": "kw_9f8a2c11",\n'
    '  "caller_number": "+919458594043",\n'
    '  "destination_number": "+919392530430",\n'
    '  "status": "completed",\n'
    '  "duration_seconds": 87,\n'
    '  "started_at": "2026-09-18T11:42:03Z",\n'
    '  "ended_at": "2026-09-18T11:43:30Z"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 6))
story.append(Table(
    [
        ["Field", "Type", "Required", "Notes"],
        ["provider_call_id", "string", "Yes", "Knowlarity's own call/session id. Used as the idempotency key — resending the same id updates the existing log instead of duplicating it."],
        ["caller_number", "string", "Yes", "E.164 preferred; plain 10-digit accepted."],
        ["destination_number", "string", "Yes", "E.164 preferred; plain 10-digit accepted."],
        ["status", "string", "Yes", "e.g. completed, failed, no-answer, busy — any value is stored as-is."],
        ["duration_seconds", "integer", "No", "Call duration in seconds."],
        ["started_at", "ISO 8601", "No", "Call start timestamp, UTC."],
        ["ended_at", "ISO 8601", "No", "Call end timestamp, UTC."],
    ],
    colWidths=[1.5*inch, 0.8*inch, 0.8*inch, 2.9*inch],
    style=TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FFED00')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E2E2')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]),
))
story.append(Spacer(1, 8))

story.append(Paragraph("Response &mdash; 201 Created", h3))
story.append(Preformatted(
    '{\n'
    '  "received": true,\n'
    '  "call_log_id": "6f2b1e0a-....-....-............"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 6))
story.append(Paragraph("Example (cURL)", h3))
story.append(Preformatted(
    f'curl -X POST {BASE_URL}/api/qr/partner/call-logs \\\n'
    f'  -H "Content-Type: application/json" \\\n'
    f'  -H "X-API-Key: {API_KEY}" \\\n'
    '  -d \'{"provider_call_id":"kw_9f8a2c11","caller_number":"+919458594043",'
    '"destination_number":"+919392530430","status":"completed","duration_seconds":87}\'',
    code_style,
))
story.append(Spacer(1, 8))

story.append(Paragraph("Where and how this is stored", h2))
story.append(Paragraph(
    "Every push is written to a dedicated <b>CallLog</b> table in ScanConnect's own PostgreSQL "
    "database (not a third-party log store) &mdash; one row per call, keyed by <b>provider_call_id</b> "
    "so re-delivery of the same webhook is safe. Columns: caller number, destination number, status, "
    "duration, start/end timestamps, and the complete original JSON payload (kept as-received, for "
    "audit/debugging even if new fields are added later). When the caller number matches a recent "
    "in-app masked-call request, the log is also linked to that request for reporting; unmatched calls "
    "are still stored in full.",
    body,
))

story.append(Paragraph("Contact", h2))
story.append(Paragraph("For integration questions, reach out to the ScanConnect engineering team directly.", body))

doc.build(story)
print("PDF generated: docs/ScanConnect_Partner_API.pdf")
