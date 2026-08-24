import React, { useEffect, useState } from 'react';
import { Download, Printer, X, Search, FileArchive } from 'lucide-react';
import { api, downloadFile } from '../../lib/api';
import { auth } from '../../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export type StickerLang = 'en' | 'hi';
export type StickerSize = 'bike' | 'car';

// Physical label sizes at 300 DPI. Car keeps the bike's 8:5 aspect ratio, doubled.
const STICKER_DIMENSIONS_PX: Record<StickerSize, { width: number; height: number }> = {
  bike: { width: 1200, height: 750 }, // 4in x 2.5in
  car: { width: 2400, height: 1500 }, // 8in x 5in
};

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
    subline: 'SCAN USING PHONE CAMERA, GOOGLE LENS OR ANY QR SCANNER APP. VISIT SCANCONNECT.CO.IN FOR MORE INFO',
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
  const fontSize = fitFontSize(ctx, 'SCAN CONNECT', maxWidth, maxWidth * 0.22, '700', wordmarkFontFamily);
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
  const subtitleText = 'CONNECTING SOLUTION';
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
    // CircleParkingOff
    stroke: '#D6272C',
    paths: [
      'M12.656 7H13a3 3 0 0 1 2.984 3.307',
      'M13 13H9',
      'M19.071 19.071A1 1 0 0 1 4.93 4.93',
      'm2 2 20 20',
      'M8.357 2.687a10 10 0 0 1 12.956 12.956',
      'M9 17V9',
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
  ...LUCIDE_ICON_PATHS.map(
    (icon) => (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => drawLucideIcon(ctx, icon, cx, cy, s),
  ),
  drawSosBadge,
];

/**
 * Composites the bare server-generated QR PNG into a print-ready two-panel
 * vehicle tag: left panel carries the Scan Connect logo and instructions,
 * right panel (brand yellow) carries the QR code plus emergency/parking icons.
 * Sized in real device pixels at 300 DPI for the requested physical label size.
 */
async function drawBrandedQrCanvas(
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

  const wordmarkMaxWidth = leftWidth - pad * 2;
  const wordmarkHeight = drawWordmark(ctx, pad, pad, wordmarkMaxWidth);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F0F0F';
  const headlineTextColor = '#000000';
  const headlineMaxWidth = leftWidth - pad * 2;
  const sublineFontSizeFitted = Math.round(height * 0.05 * 0.6);
  const headlineTop = pad + wordmarkHeight * 1.6;
  // Reserve room below the headline for the subline's *actual* wrapped line
  // count (not a hardcoded guess) so a long subline can never be pushed off
  // the bottom of the canvas by an oversized headline.
  ctx.font = `normal ${sublineFontSizeFitted}px sans-serif`;
  const sublineLineCount = wrapText(ctx, text.subline, headlineMaxWidth).length;
  const headlineMaxHeight = height - headlineTop - pad - sublineFontSizeFitted * 1.35 * sublineLineCount;

  const headlineFontFamily = "'Poppins', sans-serif";
  let headlineFontSize = Math.round(height * 0.11);
  let headlineLines: { text: string; startWordIndex: number; wordCount: number }[] = [];
  let headlineLineHeight = 0;
  while (headlineFontSize > 10) {
    ctx.font = `800 ${headlineFontSize}px ${headlineFontFamily}`;
    headlineLines = wrapTextWithWordIndex(ctx, text.headline, headlineMaxWidth);
    headlineLineHeight = headlineFontSize * 1.15;
    if (headlineLines.length * headlineLineHeight <= headlineMaxHeight) break;
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

  ctx.font = `normal ${sublineFontSizeFitted}px sans-serif`;
  ctx.fillStyle = '#5F5E5E';
  const sublineLines = wrapText(ctx, text.subline, headlineMaxWidth);
  let sublineY = headlineY + sublineFontSizeFitted * 0.7;
  for (const line of sublineLines) {
    ctx.fillText(line, pad, sublineY);
    sublineY += sublineFontSizeFitted * 1.35;
  }

  // Right panel — brand yellow background with QR code + icon row.
  ctx.fillStyle = STICKER_YELLOW;
  ctx.fillRect(leftWidth, 0, rightWidth, height);

  const qrBoxSize = Math.min(rightWidth - pad * 2, height * 0.58);
  const qrX = leftWidth + (rightWidth - qrBoxSize) / 2;
  const qrY = pad * 0.8;
  const qrFramePad = qrBoxSize * 0.06;
  const qrFrameRadius = qrBoxSize * 0.06;

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

  const iconRowY = qrY + qrBoxSize + qrFramePad * 2 + pad * 0.9;
  const iconSize = height * 0.075;
  const iconGap = rightWidth / (STICKER_ICONS.length + 1);
  STICKER_ICONS.forEach((draw, i) => {
    const cx = leftWidth + iconGap * (i + 1);
    draw(ctx, cx, iconRowY, iconSize);
  });

  ctx.fillStyle = '#1B1C1C';
  ctx.textAlign = 'center';
  const captionMaxWidth = rightWidth - pad;
  const captionFontSize = Math.round(height * 0.03);
  ctx.font = `bold ${captionFontSize}px sans-serif`;
  const captionLines = wrapText(ctx, text.iconCaption, captionMaxWidth);
  let captionY = iconRowY + iconSize * 1.5;
  for (const line of captionLines) {
    ctx.fillText(line, leftWidth + rightWidth / 2, captionY);
    captionY += captionFontSize * 1.3;
  }

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to render PNG'))), 'image/png');
  });
}

/**
 * The QR PNG endpoint requires a Bearer token, which a plain <img src> can't
 * send, so this fetches the image as an authenticated blob and renders it via
 * an object URL instead.
 *
 * `onReady` reports back once this tile's final image (branded or not) is
 * actually painted, so callers that trigger window.print() can wait for every
 * tile to finish — otherwise the browser can snapshot the page mid-render and
 * capture some tiles before their branding has been composited in.
 */
const AuthedQrImage: React.FC<{
  id: string;
  alt: string;
  className?: string;
  branded?: boolean;
  lang?: StickerLang;
  size?: StickerSize;
  onReady?: () => void;
}> = ({ id, alt, className, branded, lang = 'en', size = 'bike', onReady }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    auth.currentUser?.getIdToken().then(async (idToken) => {
      const res = await fetch(`${API_BASE_URL}/api/admin/qr-codes/${id}/qr.png`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      });
      const rawBlob = await res.blob();
      const blob = branded ? await canvasToBlob(await drawBrandedQrCanvas(rawBlob, { lang, size })) : rawBlob;
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, branded, lang, size]);

  if (!src) {
    return <div className={`${className ?? ''} bg-neutral-100 animate-pulse`} />;
  }
  return <img src={src} alt={alt} className={className} onLoad={onReady} />;
};

interface QrCodeRow {
  id: string;
  code: string;
  status: 'INACTIVE' | 'ACTIVE';
  batchId: string;
  batchName: string;
  createdAt: string;
  activatedAt: string | null;
  vehicle: {
    registration: string;
    nickname: string | null;
    user: { fullName: string; email: string };
  } | null;
}

interface BatchSummary {
  batchId: string;
  batchName: string;
  batchCreatedAt: string;
  total: number;
  activated: number;
}

function buildFilterParams(filters: {
  statusFilter: string;
  batchFilter: string;
  nameFilter: string;
  dateFrom: string;
  dateTo: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.statusFilter) params.set('status', filters.statusFilter);
  if (filters.batchFilter) params.set('batchId', filters.batchFilter);
  if (filters.nameFilter) params.set('name', filters.nameFilter);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  return params;
}

export const AdminQrCodes: React.FC = () => {
  const [codes, setCodes] = useState<QrCodeRow[] | null>(null);
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [batchName, setBatchName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [error, setError] = useState('');
  const [printBatchId, setPrintBatchId] = useState<string | null>(null);
  const [printCodes, setPrintCodes] = useState<QrCodeRow[] | null>(null);
  const [readyTileCount, setReadyTileCount] = useState(0);
  const [stickerLang, setStickerLang] = useState<StickerLang>('en');
  const [stickerSize, setStickerSize] = useState<StickerSize>('bike');

  const load = () => {
    const params = buildFilterParams({ statusFilter, batchFilter, nameFilter, dateFrom, dateTo });
    api
      .get<{ codes: QrCodeRow[]; total: number; batches: BatchSummary[] }>(`/api/admin/qr-codes?${params}`)
      .then((res) => {
        setCodes(res.codes);
        setTotal(res.total);
        setBatches(res.batches);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load QR codes'));
  };

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, batchFilter, nameFilter, dateFrom, dateTo]);

  const handleGenerate = async () => {
    if (!batchName.trim()) {
      setError('Please enter a name for this batch.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const res = await api.post<{ batchId: string; quantity: number }>('/api/admin/qr-codes/bulk', {
        quantity,
        name: batchName.trim(),
      });
      setBatchFilter(res.batchId);
      setBatchName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate batch');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBrandedQrPng = async (id: string, code: string) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/qr-codes/${id}/qr.png`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      });
      const rawBlob = await res.blob();
      const canvas = await drawBrandedQrCanvas(rawBlob, { lang: stickerLang, size: stickerSize });
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${code}-${stickerSize}-${stickerLang}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PNG');
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    setError('');
    try {
      const params = buildFilterParams({ statusFilter, batchFilter, nameFilter, dateFrom, dateTo });
      await downloadFile(`/api/admin/qr-codes/download.zip?${params}`, `qr-codes-${Date.now()}.zip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download ZIP');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const openPrintView = async (batchId: string) => {
    setPrintBatchId(batchId);
    setReadyTileCount(0);
    const params = new URLSearchParams({ batchId, pageSize: '5000' });
    const res = await api.get<{ codes: QrCodeRow[] }>(`/api/admin/qr-codes?${params}`);
    setPrintCodes(res.codes);
  };

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">QR Code Management</h1>
      </div>

      {/* Sticker language & vehicle size — applies to all branded downloads/prints below */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-wrap items-end gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Sticker Language</label>
          <div className="flex rounded-md overflow-hidden border border-white/10">
            {(['en', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setStickerLang(l)}
                className={`h-10 px-4 text-xs font-bold uppercase cursor-pointer ${
                  stickerLang === l ? 'bg-amber-400 text-neutral-950' : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {l === 'en' ? 'English' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Sticker Size</label>
          <div className="flex rounded-md overflow-hidden border border-white/10">
            {(['bike', 'car'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStickerSize(s)}
                className={`h-10 px-4 text-xs font-bold uppercase cursor-pointer ${
                  stickerSize === s ? 'bg-amber-400 text-neutral-950' : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {s === 'bike' ? 'Bike (4×2.5in)' : 'Car (8×5in)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk generate */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Batch Name</label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g. Mall Parking Lot A"
            className="w-56 h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Quantity</label>
          <input
            type="number"
            min={1}
            max={5000}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))}
            className="w-32 h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-10 px-5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wide rounded-md disabled:opacity-60 cursor-pointer"
        >
          {isGenerating ? 'Generating...' : 'Generate Batch'}
        </button>
        <span className="text-white/40 text-xs">Max 5000 per batch.</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-white/40 uppercase">Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search batch name"
              className="pl-9 pr-3 h-10 bg-white/10 border border-white/10 text-white text-sm rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer"
        >
          <option value="" className="bg-neutral-900 text-white">All statuses</option>
          <option value="INACTIVE" className="bg-neutral-900 text-white">Inactive</option>
          <option value="ACTIVE" className="bg-neutral-900 text-white">Active</option>
        </select>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer max-w-xs"
        >
          <option value="" className="bg-neutral-900 text-white">All batches</option>
          {batches.map((b) => (
            <option key={b.batchId} value={b.batchId} className="bg-neutral-900 text-white">
              {b.batchName} — {new Date(b.batchCreatedAt).toLocaleDateString()} — {b.activated}/{b.total} activated
            </option>
          ))}
        </select>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-white/40 uppercase">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer [color-scheme:dark]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-white/40 uppercase">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer [color-scheme:dark]"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
            className="h-10 px-3 text-white/50 hover:text-white text-xs font-bold cursor-pointer"
          >
            Clear dates
          </button>
        )}
        <button
          onClick={handleDownloadZip}
          disabled={isDownloadingZip || total === 0}
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-amber-400/15 hover:bg-amber-400/25 text-amber-400 text-xs font-bold rounded-md cursor-pointer disabled:opacity-50"
          title="Download every QR code matching the current filters as a ZIP of PNGs"
        >
          <FileArchive className="w-3.5 h-3.5" /> {isDownloadingZip ? 'Zipping...' : `Download ZIP (${total})`}
        </button>
        {batchFilter && (
          <>
            <button
              onClick={() => downloadFile(`/api/admin/qr-codes/${batchFilter}/download.csv`, `qr-batch-${batchFilter.slice(0, 8)}.csv`)}
              className="inline-flex items-center gap-1.5 h-10 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
            <button
              onClick={() => openPrintView(batchFilter)}
              className="inline-flex items-center gap-1.5 h-10 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Batch
            </button>
          </>
        )}
      </div>

      {/* Table */}
      {!codes ? (
        <div className="text-white/60">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="text-white/60">No QR codes found.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vehicle Owner</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Activated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-mono">{c.code}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        c.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/50 bg-white/5'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.vehicle ? (
                      <>
                        <div className="text-white/80">{c.vehicle.user.fullName}</div>
                        <div className="text-white/40 text-xs">
                          {c.vehicle.nickname || c.vehicle.registration}
                        </div>
                      </>
                    ) : (
                      <span className="text-white/30">— unclaimed —</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70 text-xs">{c.batchName}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {c.activatedAt ? (
                      new Date(c.activatedAt).toLocaleString()
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => downloadBrandedQrPng(c.id, c.code)}
                      className="p-1.5 text-white/50 hover:text-amber-400 cursor-pointer inline-block"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-white/30 text-xs">{total} total codes</p>

      {/* Print modal */}
      {printBatchId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 print:bg-white print:p-0">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 print:max-h-none print:rounded-none print:shadow-none">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h2 className="font-black text-lg text-neutral-900">Print QR Batch</h2>
              <div className="flex items-center gap-3">
                {printCodes && readyTileCount < printCodes.length && (
                  <span className="text-xs text-neutral-500">
                    Preparing {readyTileCount}/{printCodes.length}...
                  </span>
                )}
                <button
                  onClick={() => window.print()}
                  disabled={!printCodes || readyTileCount < printCodes.length}
                  className="px-4 py-2 bg-amber-400 text-neutral-950 font-bold text-xs rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Print
                </button>
                <button
                  onClick={() => {
                    setPrintBatchId(null);
                    setPrintCodes(null);
                  }}
                  className="p-2 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {!printCodes ? (
              <p className="text-neutral-500 text-sm">Loading codes...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {printCodes.map((c, index) => {
                  // 3 columns x 4 rows = 12 wide (8:5) tiles per printed page.
                  const isLastOnPage = (index + 1) % 12 === 0 && index !== printCodes.length - 1;
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col items-center gap-1 p-2 border border-neutral-200 rounded-lg print:break-inside-avoid ${
                        isLastOnPage ? 'print:break-after-page' : ''
                      }`}
                    >
                      <AuthedQrImage
                        id={c.id}
                        alt={c.code}
                        className="w-full h-auto"
                        branded
                        lang={stickerLang}
                        size={stickerSize}
                        onReady={() => setReadyTileCount((prev) => prev + 1)}
                      />
                      <span className="text-[10px] font-mono text-neutral-700">{c.code}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
