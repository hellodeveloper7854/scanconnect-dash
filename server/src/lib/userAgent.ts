/** Coarse device facts from a user-agent string — enough for analytics, never identifying. */
export interface DeviceInfo {
  device: 'mobile' | 'tablet' | 'desktop';
  os: string | null;
  isBot: boolean;
}

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|monitor|uptime|curl|wget|python-requests|headless/i;

export function parseUserAgent(ua: string | undefined): DeviceInfo {
  const s = ua ?? '';
  if (!s || BOT.test(s)) return { device: 'desktop', os: null, isBot: true };
  const device = /ipad|tablet|android(?!.*mobile)/i.test(s) ? 'tablet' : /mobi|iphone|ipod|android/i.test(s) ? 'mobile' : 'desktop';
  const os = /android/i.test(s) ? 'Android' : /iphone|ipad|ipod/i.test(s) ? 'iOS' : /windows/i.test(s) ? 'Windows' : /mac os x|macintosh/i.test(s) ? 'macOS' : /linux/i.test(s) ? 'Linux' : null;
  return { device, os, isBot: false };
}
