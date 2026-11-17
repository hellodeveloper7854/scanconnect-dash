import { API_BASE_URL, appEnvHeaders } from './api';

/**
 * Public website content (FAQs, banners, CMS pages) as managed in the admin
 * panel's Content section. Read-only; every call fails soft (returns null) so
 * a content hiccup can never break the page around it.
 */

export type BannerPlacement = 'TOP_BAR' | 'HOMEPAGE' | 'SHOP';

export interface SiteBanner {
  id: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
  placement: BannerPlacement;
}

export interface SiteFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface SitePage {
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
  updatedAt: string;
}

const cache = new Map<string, Promise<unknown>>();

/** GET with a small in-memory cache, so repeated renders and navigation don't refetch. Resolves null on any failure. */
function getCached<T>(path: string): Promise<T | null> {
  let hit = cache.get(path) as Promise<T | null> | undefined;
  if (!hit) {
    hit = fetch(`${API_BASE_URL}${path}`, { headers: appEnvHeaders(), signal: AbortSignal.timeout(5000) })
      .then((res) => (res.ok ? (res.json() as Promise<T>) : null))
      .catch(() => null);
    cache.set(path, hit);
    // Don't remember failures, so the next visit tries again.
    hit.then((value) => {
      if (value === null) cache.delete(path);
    });
    // Everything else is remembered for a minute at most.
    setTimeout(() => cache.delete(path), 60_000);
  }
  return hit;
}

export const fetchFaqs = async (): Promise<SiteFaq[] | null> =>
  (await getCached<{ faqs: SiteFaq[] }>('/api/content/faqs'))?.faqs ?? null;

export const fetchBanners = async (placement: BannerPlacement): Promise<SiteBanner[]> =>
  (await getCached<{ banners: SiteBanner[] }>(`/api/content/banners?placement=${placement}`))?.banners ?? [];

/** The published page for `slug`, or null when there is none (or the request failed). */
export const fetchCmsPage = async (slug: string): Promise<SitePage | null> =>
  (await getCached<{ page: SitePage }>(`/api/content/pages/${encodeURIComponent(slug)}`))?.page ?? null;

export interface SiteContentOverrides {
  values: Record<string, string>;
  images: Record<string, { id: string; url: string; width: number; height: number }>;
}

/** Saved overrides for a page's editable text/images (empty when nothing was changed, null when the request failed). */
export const fetchSiteContent = (page: string): Promise<SiteContentOverrides | null> =>
  getCached<SiteContentOverrides>(`/api/content/site/${encodeURIComponent(page)}`);
