import React, { useEffect, useState } from 'react';
import { API_BASE_URL, withAppEnv } from './api';
import { fetchSiteContent, type SiteContentOverrides } from './content';
import { defaultsFor, getPage } from './siteContentRegistry';

/**
 * Editable page content. Returns the built-in default for every field on the
 * first render, then the admin's saved version once it arrives, so the page
 * never waits on the network and never goes blank if the request fails.
 */
export interface SiteContent {
  /** Text for a field. */
  t: (key: string) => string;
  /** Text split into lines (for fields where Enter makes a new line). */
  lines: (key: string) => string[];
  /** Text with **highlighted** words wrapped in a span with `highlightClass`. */
  rich: (key: string, highlightClass: string) => React.ReactNode;
  /** Image URL for a field. */
  img: (key: string) => string;
  /** A safe link target for a url field ('' when the saved value isn't a usable link). */
  link: (key: string) => string;
}

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

export const richText = (value: string, highlightClass: string): React.ReactNode => {
  const parts = value.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <span key={i} className={highlightClass}>{part}</span> : <React.Fragment key={i}>{part}</React.Fragment>,
  );
};

export function useSiteContent(pageId: string): SiteContent {
  const [overrides, setOverrides] = useState<SiteContentOverrides | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSiteContent(pageId).then((data) => {
      if (alive && data) setOverrides(data);
    });
    return () => {
      alive = false;
    };
  }, [pageId]);

  const defaults = defaultsFor(pageId);
  const t = (key: string): string => overrides?.values[key] ?? defaults[key] ?? '';
  return {
    t,
    lines: (key) => t(key).split(/\r?\n/),
    rich: (key, cls) => richText(t(key), cls),
    img: (key) => {
      const saved = overrides?.images[key];
      return saved ? withAppEnv(`${API_BASE_URL}${saved.url}`) : defaults[key] ?? '';
    },
    link: (key) => {
      const v = t(key);
      return SAFE_LINK.test(v) ? v : defaults[key] ?? '';
    },
  };
}


/** Lines of text separated by <br />. */
export const withBreaks = (lines: string[]): React.ReactNode =>
  lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));
