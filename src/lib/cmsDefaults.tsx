import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * The original text of the website's built-in pages (Terms, Shipping, Refund)
 * as Markdown, so the admin editor can open them with their current wording
 * instead of an empty box. Built from the very same data the pages render, so
 * it can't drift from what visitors see today.
 */

const inline = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').replace(/\s+/g, ' ');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  const inner = Array.from(el.childNodes).map(inline).join('');
  switch (el.tagName) {
    case 'STRONG':
    case 'B':
      return inner.trim() ? `**${inner.trim()}**` : '';
    case 'EM':
    case 'I':
      return inner.trim() ? `*${inner.trim()}*` : '';
    case 'A': {
      const href = el.getAttribute('href') ?? '';
      return href ? `[${inner.trim()}](${href})` : inner;
    }
    case 'BR':
      return '  \n';
    default:
      return inner;
  }
};

const block = (el: Element, depth = 0): string => {
  const tag = el.tagName;
  if (/^H[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${inline(el).trim()}\n\n`;
  if (tag === 'UL' || tag === 'OL') {
    const items = Array.from(el.children).filter((c) => c.tagName === 'LI');
    return (
      items
        .map((li, i) => {
          const bullet = tag === 'OL' ? `${i + 1}.` : '-';
          const text = Array.from(li.childNodes)
            .filter((n) => !(n.nodeType === Node.ELEMENT_NODE && /^(UL|OL)$/.test((n as Element).tagName)))
            .map(inline)
            .join('')
            .trim();
          const nested = Array.from(li.children)
            .filter((c) => /^(UL|OL)$/.test(c.tagName))
            .map((c) => block(c, depth + 1).trimEnd())
            .join('\n');
          return `${'  '.repeat(depth)}${bullet} ${text}${nested ? `\n${nested}` : ''}`;
        })
        .join('\n') + (depth === 0 ? '\n\n' : '')
    );
  }
  if (tag === 'P') return `${inline(el).trim()}\n\n`;
  // Wrappers (div, section, fragments rendered as spans…): descend.
  const kids = Array.from(el.children);
  if (kids.length) return kids.map((k) => block(k, depth)).join('');
  const text = inline(el).trim();
  return text ? `${text}\n\n` : '';
};

const htmlToMarkdown = (html: string): string => {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  return Array.from(doc.body.firstElementChild!.children).map((c) => block(c)).join('').replace(/\n{3,}/g, '\n\n').trim();
};

interface PolicyModule {
  POLICY_INTRO: string;
  POLICY_OUTRO: string;
  POLICY_SECTIONS: { title: string; body: React.ReactNode }[];
}

const LOADERS: Record<string, () => Promise<PolicyModule>> = {
  terms: () => import('../pages/TermsAndConditionsPage'),
  'shipping-policy': () => import('../pages/ShippingPolicyPage'),
  'refund-returns': () => import('../pages/RefundReturnsPage'),
};

/** The built-in page's current text as Markdown, or null when `slug` has no built-in version. */
export async function defaultPageMarkdown(slug: string): Promise<string | null> {
  const load = LOADERS[slug];
  if (!load) return null;
  const mod = await load();
  const body = renderToStaticMarkup(
    <>
      {mod.POLICY_SECTIONS.map((s) => (
        <div key={s.title}>
          <h2>{s.title}</h2>
          {s.body}
        </div>
      ))}
    </>,
  );
  return `*Last updated: August 2026*\n\n${mod.POLICY_INTRO}\n\n${htmlToMarkdown(body)}\n\n${mod.POLICY_OUTRO}\n`;
}
