# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Preformatted
)
from reportlab.lib.enums import TA_LEFT

API_KEY = "ef45e00af0c4af6c534508931abc9d2278325904daaa8ee2"
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
    "docs/ScanConnect_Partner_API_GetDestinationNumber.pdf",
    pagesize=letter,
    topMargin=0.75*inch, bottomMargin=0.75*inch, leftMargin=0.8*inch, rightMargin=0.8*inch,
)

story = []

story.append(Paragraph("ScanConnect Partner API", title_style))
story.append(Paragraph("Get Destination Number &mdash; Integration Guide", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E4E2E2')))
story.append(Spacer(1, 14))

story.append(Paragraph("Purpose", h2))
story.append(Paragraph(
    "This endpoint lets Knowlarity's IVR / masked-calling system resolve a caller's phone number "
    "(<b>caller_number</b>) to the correct destination number (<b>destination_number</b>) to bridge the "
    "call to &mdash; the vehicle owner or emergency contact a ScanConnect QR-tag scan most recently requested "
    "to be connected with.",
    body,
))
story.append(Spacer(1, 8))

story.append(Paragraph("Endpoint", h2))
story.append(Table(
    [["Method", "POST"], ["URL", f"{BASE_URL}/api/qr/partner/get-destination-number"]],
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
))
story.append(Spacer(1, 10))

story.append(Paragraph("Authentication", h2))
story.append(Paragraph(
    "This is a server-to-server call, authenticated with a shared API key &mdash; not a user login token. "
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

story.append(Paragraph("Request", h2))
story.append(Paragraph("<b>Headers</b>", h3))
story.append(Preformatted(
    "Content-Type: application/json\n"
    f"X-API-Key: {API_KEY}",
    code_style,
))
story.append(Spacer(1, 6))
story.append(Paragraph("<b>Body (JSON)</b>", h3))
story.append(Preformatted(
    '{\n'
    '  "caller_number": "+91XXXXXXXXXX"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "<b>caller_number</b> (string, required) &mdash; the phone number placing the call. Both plain "
    "10-digit and +91-prefixed formats are accepted; the last 10 digits are matched.",
    body,
))

story.append(Paragraph("Response", h2))
story.append(Paragraph("<b>200 OK &mdash; match found</b>", h3))
story.append(Preformatted(
    '{\n'
    '  "caller_number": "9458594043",\n'
    '  "destination_number": "9392530430"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 6))
story.append(Paragraph("<b>404 Not Found &mdash; no request on file for this caller_number</b>", h3))
story.append(Preformatted(
    '{\n'
    '  "error": "No pending call request found for this caller_number"\n'
    '}',
    code_style,
))
story.append(Spacer(1, 6))
story.append(Paragraph("<b>401 Unauthorized &mdash; missing/invalid API key</b>", h3))
story.append(Preformatted(
    '{\n'
    '  "error": "Invalid or missing API key"\n'
    '}',
    code_style,
))

story.append(Paragraph("Example (cURL)", h2))
story.append(Preformatted(
    f'curl -X POST {BASE_URL}/api/qr/partner/get-destination-number \\\n'
    f'  -H "Content-Type: application/json" \\\n'
    f'  -H "X-API-Key: {API_KEY}" \\\n'
    '  -d \'{"caller_number":"9458594043"}\'',
    code_style,
))

story.append(Paragraph("Whitelisted Test Numbers", h2))
story.append(Paragraph(
    "The following caller_number values are pre-seeded on our end and will return a valid "
    "destination_number for testing:",
    body,
))
story.append(Spacer(1, 4))
story.append(Table(
    [["Caller Number", "Destination Number"],
     ["9458594043", "9392530430"],
     ["9555511329", "9392530430"],
     ["9711374160", "9392530430"]],
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
story.append(Spacer(1, 10))
story.append(Paragraph(
    "Note: for callers outside this test list, a destination_number is only available once that caller "
    "has scanned a live ScanConnect QR tag and completed the app's own verify-and-call flow first.",
    note,
))

story.append(Paragraph("Contact", h2))
story.append(Paragraph("For integration questions, reach out to the ScanConnect engineering team directly.", body))

doc.build(story)
print("PDF generated.")
