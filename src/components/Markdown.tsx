import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Renders admin-written Markdown with the site's typography. Raw HTML in the
 * text is not rendered (react-markdown's default), and links that aren't
 * http(s), mailto, tel or site-relative are dropped, so editors can format
 * freely without being able to inject scripts.
 */
/** react-markdown passes its syntax-tree `node` to every component; it must not reach the DOM. */
const clean = <T extends { node?: unknown }>(props: T) => {
  const { node: _node, ...rest } = props;
  return rest;
};

const safeUrl = (url: string) => (/^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : '');

export const Markdown: React.FC<{ children: string; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-neutral-700 leading-relaxed space-y-4 ${className}`}>
    <ReactMarkdown
      urlTransform={safeUrl}
      components={{
        h1: (p) => <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-8 first:mt-0" {...clean(p)} />,
        h2: (p) => <h2 className="text-2xl font-extrabold text-neutral-900 mt-8" {...clean(p)} />,
        h3: (p) => <h3 className="text-xl font-bold text-neutral-900 mt-6" {...clean(p)} />,
        h4: (p) => <h4 className="text-base font-bold text-neutral-900 mt-4" {...clean(p)} />,
        p: (p) => <p className="text-base" {...clean(p)} />,
        ul: (p) => <ul className="list-disc pl-6 space-y-1.5" {...clean(p)} />,
        ol: (p) => <ol className="list-decimal pl-6 space-y-1.5" {...clean(p)} />,
        a: (props) => {
          const { href, ...p } = clean(props);
          return (
          <a
            href={href}
            className="text-[#B58500] font-semibold underline hover:text-[#8a6600]"
            {...(href && /^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            {...p}
          />
          );
        },
        blockquote: (p) => <blockquote className="border-l-4 border-[#FFED00] bg-neutral-50 px-4 py-2 text-neutral-600" {...clean(p)} />,
        hr: () => <hr className="border-neutral-200 my-6" />,
        strong: (p) => <strong className="font-bold text-neutral-900" {...clean(p)} />,
        code: (p) => <code className="bg-neutral-100 rounded px-1.5 py-0.5 text-sm font-mono" {...clean(p)} />,
        img: ({ src, alt }) => (
          <img src={typeof src === 'string' && /^https:\/\//i.test(src) ? src : undefined} alt={alt ?? ''} className="max-w-full rounded-lg" />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);
