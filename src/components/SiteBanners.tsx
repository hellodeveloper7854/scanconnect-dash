import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchBanners, type BannerPlacement, type SiteBanner } from '../lib/content';

const DISMISSED_KEY = 'sc_dismissed_banners';

const readDismissed = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
};

/** Opens site-relative links in the same tab and external ones in a new tab. */
const linkProps = (url: string) =>
  /^https?:/i.test(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

/**
 * The banners an admin has switched on for `placement` (managed under Content →
 * Banners in the admin panel). Renders nothing while loading, when there are none,
 * or when the request fails, so it can sit on any page. A visitor can dismiss a
 * banner for the rest of their visit.
 */
export const SiteBanners: React.FC<{ placement: BannerPlacement }> = ({ placement }) => {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);

  useEffect(() => {
    let alive = true;
    fetchBanners(placement).then((list) => alive && setBanners(list));
    return () => {
      alive = false;
    };
  }, [placement]);

  const visible = banners.filter((b) => !dismissed.includes(b.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Private mode: the banner just comes back on reload.
    }
  };

  if (placement === 'TOP_BAR') {
    return (
      <div className="bg-[#1B1C1C] text-white">
        {visible.map((b) => (
          <div key={b.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3 text-xs sm:text-sm">
            <span className="text-center">
              <span className="font-bold">{b.title}</span>
              {b.message && <span className="text-white/80"> — {b.message}</span>}
              {b.linkUrl && b.ctaLabel && (
                <a href={b.linkUrl} {...linkProps(b.linkUrl)} className="ml-2 font-bold text-[#FFED00] underline whitespace-nowrap">
                  {b.ctaLabel}
                </a>
              )}
            </span>
            <button onClick={() => dismiss(b.id)} aria-label="Dismiss announcement" className="shrink-0 text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-3">
      {visible.map((b) => (
        <div key={b.id} className="relative overflow-hidden rounded-2xl bg-[#FFED00] text-[#1B1C1C] shadow-sm flex flex-col sm:flex-row sm:items-center">
          {b.imageUrl && <img src={b.imageUrl} alt="" className="w-full sm:w-56 h-36 sm:h-full object-cover" loading="lazy" />}
          <div className="flex-1 p-5 pr-12">
            <p className="text-lg sm:text-xl font-black leading-tight">{b.title}</p>
            {b.message && <p className="text-sm mt-1 text-[#1B1C1C]/80">{b.message}</p>}
            {b.linkUrl && b.ctaLabel && (
              <a
                href={b.linkUrl}
                {...linkProps(b.linkUrl)}
                className="inline-block mt-3 bg-[#1B1C1C] text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-black"
              >
                {b.ctaLabel}
              </a>
            )}
          </div>
          <button onClick={() => dismiss(b.id)} aria-label="Dismiss banner" className="absolute top-3 right-3 text-[#1B1C1C]/60 hover:text-[#1B1C1C]">
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};
