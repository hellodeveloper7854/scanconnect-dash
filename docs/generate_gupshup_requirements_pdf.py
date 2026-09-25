# -*- coding: utf-8 -*-
"""
Generates docs/ScanConnect_Gupshup_Requirements.pdf.

A requirements checklist for integrating Gupshup's WhatsApp Business API,
listing what ScanConnect needs from the Gupshup team/account to replace the
current placeholder wa.me deep-link flow with real WhatsApp Business
messaging (and eventually masked/virtual-number calling).

Run: python docs/generate_gupshup_requirements_pdf.py
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT

styles = getSampleStyleSheet()
title_style = ParagraphStyle('TitleCustom', parent=styles['Title'], fontSize=20, spaceAfter=4)
subtitle_style = ParagraphStyle('SubtitleCustom', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#5F5E5E'), spaceAfter=18)
h2 = ParagraphStyle('H2Custom', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#1B1C1C'), spaceBefore=18, spaceAfter=8)
h3 = ParagraphStyle('H3Custom', parent=styles['Heading3'], fontSize=11.5, textColor=colors.HexColor('#1B1C1C'), spaceBefore=10, spaceAfter=4)
body = ParagraphStyle('BodyCustom', parent=styles['Normal'], fontSize=10, leading=15, alignment=TA_LEFT)
small = ParagraphStyle('SmallCustom', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#5F5E5E'))
note = ParagraphStyle('NoteCustom', parent=styles['Normal'], fontSize=9.5, leading=14, textColor=colors.HexColor('#736B00'), backColor=colors.HexColor('#FFFBEA'), borderColor=colors.HexColor('#E6D400'), borderWidth=1, borderPadding=8, spaceBefore=6, spaceAfter=6)
li_style = ParagraphStyle('LIStyle', parent=body, spaceAfter=4)

doc = SimpleDocTemplate(
    "docs/ScanConnect_Gupshup_Requirements.pdf",
    pagesize=letter,
    topMargin=0.75*inch, bottomMargin=0.75*inch, leftMargin=0.8*inch, rightMargin=0.8*inch,
)

story = []

def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(item, li_style), leftIndent=6) for item in items],
        bulletType='bullet', start='•', leftIndent=14, spaceBefore=2, spaceAfter=6,
    )

cell_style = ParagraphStyle('CellStyle', parent=body, fontSize=9.5, leading=13)
header_cell_style = ParagraphStyle('HeaderCellStyle', parent=cell_style, textColor=colors.HexColor('#FFED00'), fontName='Helvetica-Bold')

def simple_table(rows, col_widths):
    wrapped_rows = [[Paragraph(cell, header_cell_style) for cell in rows[0]]]
    for row in rows[1:]:
        wrapped_rows.append([Paragraph(cell, cell_style) for cell in row])
    return Table(
        wrapped_rows,
        colWidths=col_widths,
        style=TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9.5),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B1C1C')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#FFED00')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E2E2')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FAFAF9')]),
        ]),
    )

# ---------------------------------------------------------------- Cover ----
story.append(Paragraph("ScanConnect &times; Gupshup", title_style))
story.append(Paragraph("WhatsApp Business API Integration &mdash; Requirements Checklist", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E4E2E2')))
story.append(Spacer(1, 14))

story.append(Paragraph("Why we need this", h2))
story.append(Paragraph(
    "ScanConnect's QR tags let someone who scans a vehicle's sticker message the owner or an "
    "emergency contact without ever seeing their real phone number. Today that \"Message\" button "
    "opens a plain <font face='Courier'>wa.me</font> deep link straight to the owner's real WhatsApp "
    "number &mdash; a placeholder we put in so the flow works end-to-end while the real integration "
    "is pending. We want to replace it with Gupshup's WhatsApp Business API so messages are sent "
    "through our own WhatsApp Business number, with the vehicle owner's number never exposed to the "
    "person scanning the tag, and the owner able to see who's contacting them and why before replying.",
    body,
))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Separately, ScanConnect also has a masked-calling flow (voice) still pending a telephony "
    "provider &mdash; that piece is being scoped independently (currently pointed at Knowlarity) and "
    "is <b>not</b> what this document is asking Gupshup to provide, though we've noted at the end "
    "where Gupshup's own voice/masking products might overlap, in case combining both into one "
    "vendor relationship is worth discussing.",
    body,
))

# ------------------------------------------------------- Current state ----
story.append(Paragraph("Where we are today (for context)", h2))
story.append(Paragraph(
    "So the requirements below make sense, here's what already exists on our side:",
    body,
))
story.append(bullets([
    "The \"Message\" button, after the scanner verifies the last 4 digits of the vehicle's plate, "
    "opens <font face='Courier'>wa.me/&lt;real number&gt;?text=&lt;reason&gt;</font> directly in a new tab &mdash; "
    "this is the exact call site Gupshup's API would replace.",
    "We already collect a structured \"reason for contact\" (e.g. \"The car is in no parking\", "
    "\"The car is getting towed\") before the message is sent &mdash; this maps naturally to a "
    "WhatsApp message template's variable fields.",
    "We have one existing in-app notification system (a database row + bell icon in our dashboard) "
    "that fires when someone tries to contact an owner. No email or SMS sending exists yet. A "
    "Gupshup-sent WhatsApp message would be a new, additional channel alongside this.",
    "We have one existing pattern for a third-party server-to-server credential (a single shared "
    "API-key header, currently used for an unrelated telephony partner) that any Gupshup credentials "
    "would follow the same shape as.",
    "We do not yet have any webhook endpoint for inbound WhatsApp messages or delivery-status "
    "callbacks &mdash; that would be new.",
]))

# ------------------------------------------------------- What we need -----
story.append(Paragraph("What we need from the Gupshup team", h2))

story.append(Paragraph("1. Account &amp; WhatsApp Business number setup", h3))
story.append(bullets([
    "A Gupshup Partner/Enterprise account provisioned for ScanConnect (or confirmation of which "
    "existing account to use, if one already exists).",
    "A dedicated WhatsApp Business phone number registered to ScanConnect's Meta Business "
    "Manager/WABA &mdash; confirmation of whether we provide a new number or migrate an existing one, "
    "and whether that number can currently receive an SMS/voice call for the one-time verification step.",
    "Confirmation of Meta Business Verification status/requirements for our account, and the "
    "messaging-volume tier (unverified numbers are capped at 250 business-initiated conversations "
    "per rolling 24 hours) &mdash; we need to know if our expected volume needs verification before launch.",
    "Display name approval for the WhatsApp Business profile (business name, logo, category) that "
    "will show to vehicle owners when they receive a message.",
]))

story.append(Paragraph("2. API credentials &amp; environment details", h3))
story.append(bullets([
    "API key / access token for sending messages (production and, if available, a sandbox/staging "
    "key for our dev environment).",
    "App ID / Source (WABA) number ID that identifies our registered number in API calls.",
    "Base API URL / region endpoint we should send requests to.",
    "Confirmation of rate limits (messages per second, per day) for our tier, so we can size our "
    "queue/retry logic correctly.",
]))

story.append(Paragraph("3. Message template approval", h3))
story.append(Paragraph(
    "WhatsApp requires pre-approved templates for any business-initiated message (i.e. any message "
    "that isn't a reply within an existing 24-hour customer-service window &mdash; which is our exact "
    "case, since the vehicle owner hasn't messaged us first). We need Gupshup's help submitting and "
    "getting these approved by Meta:",
    body,
))
story.append(bullets([
    "A template for the initial contact notification, with variables for: the reason selected "
    "(e.g. \"The car is in no parking\"), the vehicle's masked plate number, and a way for the owner "
    "to respond/call back without the sender's number being exposed either.",
    "Guidance on Meta's template category rules (utility vs. marketing) so this qualifies as a "
    "utility message and isn't rate-limited or filtered as promotional.",
    "Expected turnaround time for template approval, so we can plan a launch date.",
]))

story.append(Paragraph("4. Webhook / callback setup", h3))
story.append(bullets([
    "The exact webhook payload shape Gupshup will POST to us for delivery status (sent/delivered/read/failed) "
    "and for inbound replies from the vehicle owner, so we can build a matching receiver endpoint.",
    "The authentication mechanism for that webhook (signature header, shared secret, IP allow-list, "
    "or similar) &mdash; we currently use HMAC signature verification for our one other signed webhook "
    "(payments) and would follow the same pattern if Gupshup supports it.",
    "Confirmation of what a public HTTPS endpoint needs to look like on our side (timeout limits, "
    "expected response codes, retry/backoff behavior on Gupshup's end if our endpoint is briefly down).",
]))

story.append(Paragraph("5. Compliance &amp; opt-in", h3))
story.append(bullets([
    "Guidance on WhatsApp's opt-in requirements as they apply to us: the vehicle owner registers "
    "their own number with ScanConnect (not the person scanning the tag), so we need to confirm "
    "whether owner registration itself counts as sufficient opt-in for business-initiated utility "
    "messages, or if an explicit additional opt-in step is required.",
    "Any data-retention or data-residency requirements tied to the account's chosen storage region, "
    "since we store the owner's real phone number in our own database regardless of the messaging "
    "channel.",
]))

story.append(Paragraph("6. Cost &amp; commercials", h3))
story.append(bullets([
    "Per-conversation / per-message pricing for utility-category templates in India (our primary "
    "market), and whether pricing differs for the masked-calling/voice product if we explore that later.",
    "Minimum commitment, billing cycle, and wallet/credit top-up mechanism.",
]))

# ------------------------------------------------------------- Table -----
story.append(Paragraph("Summary: assets we're asking Gupshup to provide", h2))
story.append(simple_table(
    [
        ["Item", "Needed for"],
        ["Provisioned account + registered WhatsApp Business number", "Sending messages from our own brand, not a generic number"],
        ["API key / access token (prod + sandbox)", "Authenticating our server's API calls"],
        ["WABA / source number ID", "Identifying our number in every API request"],
        ["Approved message template(s)", "Legally sending the first, business-initiated message to an owner"],
        ["Webhook payload spec + auth mechanism", "Building our delivery-status and inbound-reply receiver"],
        ["Rate limits for our tier", "Sizing our send queue and retry logic"],
        ["Pricing sheet + billing setup", "Budgeting and finance sign-off before launch"],
    ],
    col_widths=[2.6*inch, 3.5*inch],
))

story.append(Spacer(1, 10))
story.append(Paragraph(
    "Note: masked/virtual-number voice calling is a separate, independently-scoped piece of work "
    "(see \"Why we need this\" above). If Gupshup's own voice or number-masking product is a fit, "
    "we'd want that scoped as a distinct follow-up, not bundled into this WhatsApp messaging request.",
    note,
))

doc.build(story)
print("Wrote docs/ScanConnect_Gupshup_Requirements.pdf")
