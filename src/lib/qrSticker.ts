export type StickerLang = 'en' | 'hi';
export type StickerSize = 'bike' | 'car';

// Physical label sizes at 300 DPI. Car keeps the bike's 8:5 aspect ratio, doubled.
export const STICKER_DIMENSIONS_PX: Record<StickerSize, { width: number; height: number }> = {
  bike: { width: 1200, height: 750 }, // 4in x 2.5in
  car: { width: 2400, height: 1500 }, // 8in x 5in
};

/**
 * Maps a vehicle's `vehicleType` (free-text field, one of the VEHICLE_TYPES
 * options: Car, Bike, Scooter, Truck, Bus, Other) to the sticker size that
 * matches what a customer would have actually bought for that vehicle —
 * larger vehicles get the bigger car-size tag, everything two-wheeled or
 * unset falls back to the bike-size tag.
 */
export function stickerSizeForVehicleType(vehicleType: string | null | undefined): StickerSize {
  const carLikeTypes = new Set(['Car', 'Truck', 'Bus']);
  return vehicleType && carLikeTypes.has(vehicleType) ? 'car' : 'bike';
}

/**
 * Maps a purchased product's name (e.g. "Scan Connect Car Tag (Pack of 2)",
 * "Scan Connect Bike Tag") to the sticker size that matches what was actually
 * bought, so an order's QR download reflects the product's real physical tag
 * size instead of always defaulting to one size.
 */
export function stickerSizeForProductName(productName: string | null | undefined): StickerSize {
  return productName?.toLowerCase().includes('car') ? 'car' : 'bike';
}

const STICKER_TEXT: Record<StickerLang, {
  headline: string;
  /** 0-based word index where the headline's underline begins; runs to the last word. */
  headlineUnderlineFrom: number;
  subline: string;
  iconCaption: string;
}> = {
  en: {
    headline: 'Scan to connect with the vehicle owner',
    headlineUnderlineFrom: 2, // underlines "connect with the vehicle owner"
    subline: 'SCAN USING PHONE CAMERA, GOOGLE LENS OR ANY QR SCANNER APP. VISIT SCANCONNECT.CO.IN FOR MORE',
    iconCaption: 'Wrong Parking, Emergency Contact, any issue with the vehicle, Scan the QR',
  },
  hi: {
    headline: 'वाहन मालिक से संपर्क करने के लिए कोड स्कैन करें।',
    headlineUnderlineFrom: 3, // underlines "संपर्क करने के लिए कोड स्कैन करें।"
    subline: 'फ़ोन कैमरा, गूगल लेंस या किसी भी QR स्कैनर ऐप से स्कैन करें। अधिक जानकारी के लिए SCANCONNECT.CO.IN पर जाएं।',
    iconCaption: 'गलत पार्किंग, आपातकालीन संपर्क, वाहन संबंधी कोई भी समस्या, QR स्कैन करें',
  },
};

const STICKER_YELLOW = '#FFED00';

/**
 * Draws the "SCAN CONNECT" wordmark as text (no logo image) with a
 * "CONNECTING SOLUTION" subtitle beneath it, so the sticker doesn't depend on
 * loading/decoding an external image asset. "CONNECT" is black text with a
 * rough brand-yellow marker-stroke drawn behind it for emphasis. Returns the
 * total rendered height so callers can lay out the headline beneath it.
 */
function drawWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, maxWidth: number): number {
  const wordmarkFontFamily = "'Roboto Condensed', sans-serif";
  const fontSize = fitFontSize(ctx, 'SCAN CONNECT', maxWidth, maxWidth * 0.34, '700', wordmarkFontFamily);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const scanText = 'SCAN ';
  const connectText = 'CONNECT';
  const baselineY = y + fontSize * 0.85;

  ctx.font = `700 ${fontSize}px ${wordmarkFontFamily}`;
  const scanWidth = ctx.measureText(scanText).width;
  const connectWidth = ctx.measureText(connectText).width;

  // Rough yellow zigzag marker-stroke behind "CONNECT", drawn as a thick
  // hand-drawn-style zigzag ribbon rather than a clean box, for emphasis.
  ctx.save();
  const strokeX = x + scanWidth - fontSize * 0.05;
  const strokeY = baselineY - fontSize * 0.42;
  const strokeW = connectWidth + fontSize * 0.1;
  const strokeAmplitude = fontSize * 0.13;
  const zigzagCount = 6;
  ctx.strokeStyle = STICKER_YELLOW;
  ctx.lineWidth = fontSize * 0.32;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= zigzagCount; i++) {
    const px = strokeX + (strokeW / zigzagCount) * i;
    const py = strokeY + (i % 2 === 0 ? -strokeAmplitude : strokeAmplitude);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();

  ctx.font = `700 ${fontSize}px ${wordmarkFontFamily}`;
  ctx.fillStyle = '#0F0F0F';
  ctx.fillText(scanText, x, baselineY);
  ctx.fillText(connectText, x + scanWidth, baselineY);

  const subtitleFontSize = Math.round(fontSize * 0.32);
  const subtitleY = baselineY + subtitleFontSize * 1.4;
  ctx.font = `500 ${subtitleFontSize}px ${wordmarkFontFamily}`;
  ctx.fillStyle = '#0F0F0F';
  // Letter-spaced manually since canvas has no tracking/letter-spacing property;
  // total width is measured first so the whole line can be centered under the wordmark.
  const subtitleText = 'CONNECTING SOLUTIONS';
  const subtitleLetterGap = subtitleFontSize * 0.12;
  let subtitleTotalWidth = -subtitleLetterGap;
  for (const ch of subtitleText) {
    subtitleTotalWidth += ctx.measureText(ch).width + subtitleLetterGap;
  }
  const wordmarkTotalWidth = scanWidth + connectWidth;
  let cursorX = x + (wordmarkTotalWidth - subtitleTotalWidth) / 2;
  for (const ch of subtitleText) {
    ctx.fillText(ch, cursorX, subtitleY);
    cursorX += ctx.measureText(ch).width + subtitleLetterGap;
  }

  return subtitleY - y;
}

/** Shrinks the font size until `text` fits within `maxWidth` (single line), returning the fitted size. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startFontSize: number,
  fontWeight: string,
  fontFamily = 'sans-serif',
): number {
  let fontSize = startFontSize;
  do {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    fontSize -= 1;
  } while (ctx.measureText(text).width > maxWidth && fontSize > 8);
  return fontSize + 1;
}

/** Wraps `text` to fit within `maxWidth` at the given font, splitting on spaces; returns each line. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  return wrapTextWithWordIndex(ctx, text, maxWidth).map((line) => line.text);
}

/** Same wrapping as `wrapText`, but each line also reports the word-index range it covers (for partial-headline underlining). */
function wrapTextWithWordIndex(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): { text: string; startWordIndex: number; wordCount: number }[] {
  const words = text.split(' ');
  const lines: { text: string; startWordIndex: number; wordCount: number }[] = [];
  let current = '';
  let lineStartIndex = 0;
  let wordCountInLine = 0;
  words.forEach((word, i) => {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push({ text: current, startWordIndex: lineStartIndex, wordCount: wordCountInLine });
      current = word;
      lineStartIndex = i;
      wordCountInLine = 1;
    } else {
      current = attempt;
      wordCountInLine += 1;
    }
  });
  if (current) lines.push({ text: current, startWordIndex: lineStartIndex, wordCount: wordCountInLine });
  return lines;
}

// Raw path data straight from lucide-react (24x24 viewBox, stroke-based icons),
// so the sticker's icons are pixel-faithful to the ones used across the rest
// of the app instead of hand-drawn approximations.
const LUCIDE_ICON_PATHS: { paths: string[]; stroke: string }[] = [
  {
    // Siren
    stroke: '#1B1C1C',
    paths: [
      'M7 18v-6a5 5 0 1 1 10 0v6',
      'M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z',
      'M21 12h1',
      'M18.5 4.5 18 5',
      'M2 12h1',
      'M12 2v1',
      'm4.929 4.929.707.707',
      'M12 12v6',
    ],
  },
  {
    // TriangleAlert
    stroke: '#1B1C1C',
    paths: [
      'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
      'M12 9v4',
      'M12 17h.01',
    ],
  },
  {
    // Phone
    stroke: '#1B1C1C',
    paths: [
      'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
    ],
  },
];

/** Draws a filled red circular "SOS" badge (matching the 🆘 emoji style), rather than a stroked lucide icon. */
function drawSosBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.save();
  ctx.fillStyle = '#D6272C';
  ctx.beginPath();
  ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.round(s * 0.42)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SOS', cx, cy + s * 0.02);
  ctx.restore();
}

/** Draws a white-filled "No Parking" badge with a red circle border — a bold black "P" with a red diagonal slash through it, matching the standard no-parking road-sign style. */
function drawNoParkingBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#D6272C';
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.stroke();

  ctx.fillStyle = '#1B1C1C';
  ctx.font = `800 ${Math.round(s * 0.52)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', cx, cy + s * 0.02);

  const slashR = s * 0.44;
  const angle = -Math.PI / 4;
  ctx.strokeStyle = '#D6272C';
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + slashR * Math.cos(angle), cy + slashR * Math.sin(angle));
  ctx.lineTo(cx - slashR * Math.cos(angle), cy - slashR * Math.sin(angle));
  ctx.stroke();
  ctx.restore();
}

/** Draws one lucide-react icon (by its raw 24x24 path data) centered at (cx, cy), scaled to size `s`. */
function drawLucideIcon(
  ctx: CanvasRenderingContext2D,
  icon: { paths: string[]; stroke: string },
  cx: number,
  cy: number,
  s: number,
) {
  ctx.save();
  ctx.translate(cx - s / 2, cy - s / 2);
  ctx.scale(s / 24, s / 24);
  ctx.strokeStyle = icon.stroke;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const d of icon.paths) {
    ctx.stroke(new Path2D(d));
  }
  ctx.restore();
}

const STICKER_ICONS: ((ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => void)[] = [
  (ctx, cx, cy, s) => drawLucideIcon(ctx, LUCIDE_ICON_PATHS[0], cx, cy, s), // Siren
  drawNoParkingBadge,
  (ctx, cx, cy, s) => drawLucideIcon(ctx, LUCIDE_ICON_PATHS[1], cx, cy, s), // TriangleAlert
  (ctx, cx, cy, s) => drawLucideIcon(ctx, LUCIDE_ICON_PATHS[2], cx, cy, s), // Phone
  drawSosBadge,
];

/**
 * Composites a bare QR PNG into a print-ready two-panel vehicle tag: left
 * panel carries the Scan Connect wordmark and instructions, right panel
 * (brand yellow) carries the QR code plus emergency/parking icons. Sized in
 * real device pixels at 300 DPI for the requested physical label size.
 *
 * This is the single source of truth for sticker branding — every QR
 * download surface (admin single/ZIP download, admin print, user dashboard
 * vehicle/order QR download) should render through this function so a design
 * change here doesn't need to be repeated in multiple places.
 */
export async function drawBrandedQrCanvas(
  qrBlob: Blob,
  opts: { lang: StickerLang; size: StickerSize } = { lang: 'en', size: 'bike' },
): Promise<HTMLCanvasElement> {
  const [qrImage] = await Promise.all([
    createImageBitmap(qrBlob),
    document.fonts.load("800 100px 'Poppins'"),
    document.fonts.load("700 100px 'Roboto Condensed'"),
    document.fonts.load("500 100px 'Roboto Condensed'"),
  ]);
  const { width, height } = STICKER_DIMENSIONS_PX[opts.size];
  const text = STICKER_TEXT[opts.lang];

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const pad = Math.round(height * 0.07);
  const leftWidth = Math.round(width * 0.52);
  const rightWidth = width - leftWidth;

  // Left panel — white background with the "SCAN CONNECT" wordmark + instructions.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, leftWidth, height);

  // Wider than the headline/subline's text column (which stays inset by `pad` on both sides for
  // alignment) — the wordmark alone is allowed to run closer to the panel's right edge so growing
  // its font size ratio actually has room to take effect instead of being re-shrunk straight back
  // down to fit the narrower column.
  const wordmarkMaxWidth = leftWidth - pad * 1.3;
  const wordmarkHeight = drawWordmark(ctx, pad, pad, wordmarkMaxWidth);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F0F0F';
  const headlineTextColor = '#000000';
  const headlineMaxWidth = leftWidth - pad * 2;
  const sublineFontSizeFitted = Math.round(height * 0.05 * 0.72);
  const headlineTop = pad + wordmarkHeight * 1.35;
  // Reserve room below the headline for the subline's *actual* wrapped line
  // count at its full/preferred font size (not shrunk), with extra breathing
  // room added, so the subline always renders at full size instead of being
  // squeezed smaller to fit whatever space the headline happened to leave.
  ctx.font = `normal ${sublineFontSizeFitted}px sans-serif`;
  const sublineLineCount = wrapText(ctx, text.subline, headlineMaxWidth).length;
  const headlineMaxHeight =
    height - headlineTop - pad - sublineFontSizeFitted * 1.35 * sublineLineCount - sublineFontSizeFitted * 0.3;

  const headlineFontFamily = "'Poppins', sans-serif";
  // Devanagari matras (vowel signs stacked above/below the base letter) need more vertical
  // clearance than Latin text at the same line-height multiplier, or consecutive lines overlap.
  const headlineLineHeightMult = opts.lang === 'hi' ? 1.4 : 1.15;
  let headlineFontSize = Math.round(height * 0.15);
  let headlineLines: { text: string; startWordIndex: number; wordCount: number }[] = [];
  let headlineLineHeight = 0;
  while (headlineFontSize > 10) {
    ctx.font = `800 ${headlineFontSize}px ${headlineFontFamily}`;
    headlineLines = wrapTextWithWordIndex(ctx, text.headline, headlineMaxWidth);
    headlineLineHeight = headlineFontSize * headlineLineHeightMult;
    // Matches the true consumed height: headlineY starts at `headlineLineHeight * 0.85` past
    // headlineTop, then advances by `headlineLineHeight` once per line (including the last) —
    // so the block is (lines + 0.85) line-heights tall, not just `lines`.
    if ((headlineLines.length + 0.85) * headlineLineHeight <= headlineMaxHeight) break;
    headlineFontSize -= 2;
  }
  ctx.font = `800 ${headlineFontSize}px ${headlineFontFamily}`;
  ctx.fillStyle = headlineTextColor;
  let headlineY = headlineTop + headlineLineHeight * 0.85;
  const underlineFrom = text.headlineUnderlineFrom;
  for (const line of headlineLines) {
    ctx.fillText(line.text, pad, headlineY);

    const lineEndWordIndex = line.startWordIndex + line.wordCount;
    if (lineEndWordIndex > underlineFrom) {
      const underlineStartInLine = Math.max(0, underlineFrom - line.startWordIndex);
      const words = line.text.split(' ');
      const beforeUnderline = words.slice(0, underlineStartInLine).join(' ');
      const underlinedPart = words.slice(underlineStartInLine).join(' ');
      const startX = pad + (beforeUnderline ? ctx.measureText(beforeUnderline + ' ').width : 0);
      const underlineWidth = ctx.measureText(underlinedPart).width;
      const underlineY = headlineY + headlineFontSize * 0.12;
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(startX + underlineWidth, underlineY);
      ctx.lineWidth = Math.max(2, headlineFontSize * 0.05);
      ctx.strokeStyle = headlineTextColor;
      ctx.stroke();
    }

    headlineY += headlineLineHeight;
  }

  // Fit the subline into whatever vertical space is actually left below the
  // headline (not the earlier estimate) — shrinking the font if needed —
  // so it can never render past the sticker's bottom edge regardless of how
  // many lines a given language wraps to (Hindi text is visibly wider per
  // character than English at the same pixel size, so it wraps to more lines
  // and was previously getting clipped off the bottom of the canvas).
  const sublineAvailableHeight = height - pad - headlineY;
  let sublineFontSize = sublineFontSizeFitted;
  let sublineLines = wrapText(ctx, text.subline, headlineMaxWidth);
  while (sublineFontSize > 8) {
    ctx.font = `normal ${sublineFontSize}px sans-serif`;
    sublineLines = wrapText(ctx, text.subline, headlineMaxWidth);
    if (sublineLines.length * sublineFontSize * 1.35 <= sublineAvailableHeight) break;
    sublineFontSize -= 1;
  }
  ctx.font = `normal ${sublineFontSize}px sans-serif`;
  ctx.fillStyle = '#5F5E5E';
  // Anchored from the bottom edge (last line's baseline sits `pad` above the panel's bottom edge,
  // matching the `pad` margin used on the top/left/right sides) rather than flowing immediately
  // below the headline, so the bottom white margin doesn't end up larger than the other three sides
  // whenever the headline doesn't use its full reserved height.
  const sublineBlockHeight = (sublineLines.length - 1) * sublineFontSize * 1.35;
  let sublineY = Math.max(headlineY + sublineFontSize * 0.7, height - pad - sublineBlockHeight);
  for (const line of sublineLines) {
    ctx.fillText(line, pad, sublineY);
    sublineY += sublineFontSize * 1.35;
  }

  // Right panel — brand yellow background with QR code + icon row.
  ctx.fillStyle = STICKER_YELLOW;
  ctx.fillRect(leftWidth, 0, rightWidth, height);

  // Sized so the white frame's outer edge sits `pad` from the right panel's left/right edges —
  // the same margin used everywhere else — keeping the yellow gap equal on all sides, including the top.
  const qrOuterSize = rightWidth - pad * 2;
  const qrFramePad = qrOuterSize * 0.012;
  const qrBoxSize = qrOuterSize - qrFramePad * 2;
  const qrX = leftWidth + pad + qrFramePad;
  const qrY = pad + qrFramePad;
  const qrFrameRadius = qrOuterSize * 0.05;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrX - qrFramePad, qrY - qrFramePad, qrBoxSize + qrFramePad * 2, qrBoxSize + qrFramePad * 2, qrFrameRadius);
  ctx.fill();

  ctx.strokeStyle = '#1B1C1C';
  ctx.lineWidth = Math.max(3, qrBoxSize * 0.015);
  ctx.beginPath();
  ctx.roundRect(qrX - qrFramePad, qrY - qrFramePad, qrBoxSize + qrFramePad * 2, qrBoxSize + qrFramePad * 2, qrFrameRadius);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, qrFrameRadius * 0.6);
  ctx.clip();
  ctx.drawImage(qrImage, qrX, qrY, qrBoxSize, qrBoxSize);
  ctx.restore();
  qrImage.close();

  const iconSize = height * 0.085;
  const iconGap = rightWidth / (STICKER_ICONS.length + 1);

  ctx.textAlign = 'center';
  const captionMaxWidth = rightWidth - pad;
  // Matches the left panel's footer subline size (`sublineFontSizeFitted`) so both footer texts render at the same size.
  const captionFontSize = sublineFontSizeFitted;
  ctx.font = `bold ${captionFontSize}px sans-serif`;
  const captionLines = wrapText(ctx, text.iconCaption, captionMaxWidth);

  // Anchored from the bottom edge (last caption line's descender sits `pad` above the panel's
  // bottom edge) rather than stacked down from the QR/icons, so the bottom yellow margin always
  // matches the `pad` margin used on the top/left/right sides instead of drifting with content height.
  const captionBlockHeight = (captionLines.length - 1) * captionFontSize * 1.3;
  const firstCaptionY = height - pad - captionBlockHeight;
  const iconRowY = firstCaptionY - iconSize * 1.5;

  STICKER_ICONS.forEach((draw, i) => {
    const cx = leftWidth + iconGap * (i + 1);
    draw(ctx, cx, iconRowY, iconSize);
  });

  ctx.fillStyle = '#1B1C1C';
  let captionY = firstCaptionY;
  for (const line of captionLines) {
    ctx.fillText(line, leftWidth + rightWidth / 2, captionY);
    captionY += captionFontSize * 1.3;
  }

  return canvas;
}

/** Converts a canvas to a PNG Blob via the async canvas.toBlob API. */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to render PNG'))), 'image/png');
  });
}

/** Fetches a bare QR PNG from `url` (with an optional bearer token) and composites it into a branded sticker PNG blob. */
export async function fetchBrandedQrPngBlob(
  url: string,
  idToken: string | undefined,
  opts: { lang: StickerLang; size: StickerSize },
): Promise<Blob> {
  const res = await fetch(url, { headers: idToken ? { Authorization: `Bearer ${idToken}` } : {} });
  const rawBlob = await res.blob();
  const canvas = await drawBrandedQrCanvas(rawBlob, opts);
  return canvasToBlob(canvas);
}

/** Triggers a browser download of `blob` as `filename`. */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
