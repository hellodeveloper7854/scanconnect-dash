import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bold, ExternalLink, Heading2, Italic, Link2, List, ListOrdered, Pencil, Plus, Trash2, Quote } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Markdown } from '../../components/Markdown';

interface PageRow {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  isSystem: boolean;
  hasContent: boolean;
  updatedAt: string;
}

interface PageFull {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
  published: boolean;
  isSystem: boolean;
}

interface PageForm {
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  published: boolean;
}

const inputCls =
  'w-full bg-neutral-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]';

const errorText = (err: unknown): string => {
  if (err instanceof ApiError) {
    const d = err.details as { error?: { fieldErrors?: Record<string, string[]> } } | undefined;
    const first = d?.error?.fieldErrors && Object.values(d.error.fieldErrors).flat()[0];
    return first || err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
};

/** The address a page has on the website: built-in pages keep their own address, custom pages live under /p/. */
const SYSTEM_PATHS: Record<string, string> = {
  terms: '/terms',
  'shipping-policy': '/shipping-policy',
  'refund-returns': '/refund-returns',
};
const publicPath = (p: { slug: string; isSystem: boolean }) => (p.isSystem ? SYSTEM_PATHS[p.slug] ?? `/p/${p.slug}` : `/p/${p.slug}`);

/** Status as a visitor would experience it. */
const statusOf = (p: PageRow): { label: string; style: string; note: string } => {
  if (p.published && p.hasContent) return { label: 'Published', style: 'text-emerald-300 bg-emerald-300/10', note: 'Showing your content' };
  if (p.isSystem) return { label: 'Built-in text', style: 'text-sky-300 bg-sky-300/10', note: 'Showing the website’s original text' };
  return { label: 'Draft', style: 'text-amber-300 bg-amber-300/10', note: 'Not visible on the website' };
};

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

// ------------------------------------------------------------------ editor

const PageEditor: React.FC<{ id: string | null; onClose: (saved?: string) => void }> = ({ id, onClose }) => {
  const [loaded, setLoaded] = useState(id === null);
  const [meta, setMeta] = useState<{ isSystem: boolean }>({ isSystem: false });
  const [form, setForm] = useState<PageForm>({ slug: '', title: '', content: '', metaDescription: '', published: false });
  const [original, setOriginal] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id === null) return;
    api
      .get<{ page: PageFull }>(`/api/admin/content/pages/${id}`)
      .then(({ page }) => {
        const f = { slug: page.slug, title: page.title, content: page.content, metaDescription: page.metaDescription ?? '', published: page.published };
        setForm(f);
        setOriginal(JSON.stringify(f));
        setMeta({ isSystem: page.isSystem });
        setLoaded(true);
      })
      .catch((err) => setError(errorText(err)));
  }, [id]);

  const dirty = JSON.stringify(form) !== original;
  const set = (patch: Partial<PageForm>) => setForm((f) => ({ ...f, ...patch }));

  const back = () => {
    if (dirty && !confirm('You have unsaved changes. Leave without saving?')) return;
    onClose();
  };

  /** Wraps the selected text (or inserts a placeholder) with Markdown marks. */
  const wrap = (before: string, after = before, placeholder = 'text') => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e) || placeholder;
    set({ content: value.slice(0, s) + before + selected + after + value.slice(e) });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  /** Prefixes each selected line (headings, lists, quotes). */
  const prefixLines = (prefix: (i: number) => string) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const start = value.lastIndexOf('\n', s - 1) + 1;
    const end = e + (value.indexOf('\n', e) === -1 ? value.length - e : value.indexOf('\n', e) - e);
    const block = value.slice(start, end) || 'Text';
    const replaced = block
      .split('\n')
      .map((line, i) => prefix(i) + line)
      .join('\n');
    set({ content: value.slice(0, start) + replaced + value.slice(end) });
    requestAnimationFrame(() => el.focus());
  };

  const save = async (publish?: boolean) => {
    const title = form.title.trim();
    if (title.length < 2) return setError('Enter a title.');
    if (id === null && form.slug.trim().length < 2) return setError('Enter a URL name for the page.');
    const wantPublished = publish ?? form.published;
    if (wantPublished && !form.content.trim()) return setError('Add some content before publishing.');

    setSaving(true);
    setError('');
    try {
      const body = { title, content: form.content, metaDescription: form.metaDescription.trim(), published: wantPublished };
      if (id) await api.patch(`/api/admin/content/pages/${id}`, body);
      else await api.post('/api/admin/content/pages', { ...body, slug: form.slug.trim() });
      onClose(wantPublished ? 'Page saved and published.' : 'Page saved.');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="p-4 md:p-8 text-white/60">{error || 'Loading page…'}</div>;

  const path = publicPath({ slug: form.slug, isSystem: meta.isSystem });

  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={back} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> All pages
        </button>
        <div className="flex items-center gap-2">
          {id && (
            <a href={path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white border border-white/15 rounded-lg px-3 py-2">
              <ExternalLink className="w-4 h-4" /> View on site
            </a>
          )}
          <button onClick={() => save(false)} disabled={saving} className="text-sm text-white border border-white/20 rounded-lg px-4 py-2 disabled:opacity-60">
            {form.published ? 'Save & unpublish' : 'Save draft'}
          </button>
          <button onClick={() => save(true)} disabled={saving} className="bg-[#FFED00] text-black font-bold text-sm px-5 py-2 rounded-lg disabled:opacity-60">
            {saving ? 'Saving…' : form.published ? 'Save & keep published' : 'Publish'}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-black text-white uppercase tracking-wide">{id ? 'Edit page' : 'New page'}</h1>

      {meta.isSystem && (
        <div className="rounded-xl border border-sky-300/20 bg-sky-300/5 p-4 text-sm text-sky-100/80">
          This is a built-in page. Until you publish content here, the website keeps showing its original text. Publish to replace it with
          what you write below; unpublish to go back to the original.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-white/60">Title</span>
          <input
            className={inputCls}
            value={form.title}
            maxLength={150}
            onChange={(e) => {
              const title = e.target.value;
              set({ title, ...(id === null && !slugTouched ? { slug: slugify(title) } : {}) });
            }}
            placeholder="e.g. Cookie Policy"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-white/60">Page address</span>
          <div className="flex items-center">
            <span className="bg-white/5 border border-white/15 border-r-0 rounded-l-lg px-3 py-2 text-sm text-white/40">
              {meta.isSystem ? '' : '/p/'}
            </span>
            <input
              className={`${inputCls} ${meta.isSystem ? '' : 'rounded-l-none'} ${id !== null ? 'opacity-60' : ''}`}
              value={meta.isSystem ? path : form.slug}
              disabled={id !== null}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: e.target.value.toLowerCase() });
              }}
              placeholder="cookie-policy"
            />
          </div>
          <span className="text-[11px] text-white/30">
            {id !== null ? 'The address is fixed once a page exists, so links to it keep working.' : 'Lowercase letters, numbers and hyphens.'}
          </span>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-white/60">Search description (optional)</span>
        <input
          className={inputCls}
          value={form.metaDescription}
          maxLength={300}
          onChange={(e) => set({ metaDescription: e.target.value })}
          placeholder="One or two sentences shown by search engines"
        />
        <span className="text-[11px] text-white/30">{form.metaDescription.length}/300</span>
      </label>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-white/60">Content</span>
          <div className="flex items-center gap-1">
            {[
              { icon: Bold, label: 'Bold', run: () => wrap('**') },
              { icon: Italic, label: 'Italic', run: () => wrap('*') },
              { icon: Heading2, label: 'Heading', run: () => prefixLines(() => '## ') },
              { icon: List, label: 'Bullet list', run: () => prefixLines(() => '- ') },
              { icon: ListOrdered, label: 'Numbered list', run: () => prefixLines((i) => `${i + 1}. `) },
              { icon: Quote, label: 'Quote', run: () => prefixLines(() => '> ') },
              { icon: Link2, label: 'Link', run: () => wrap('[', '](https://)', 'link text') },
            ].map(({ icon: Icon, label, run }) => (
              <button key={label} type="button" onClick={run} title={label} aria-label={label} className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10">
                <Icon className="w-4 h-4" />
              </button>
            ))}
            <button type="button" onClick={() => setShowHelp((v) => !v)} className="ml-2 text-xs text-white/50 hover:text-white underline">
              Formatting help
            </button>
            <button type="button" onClick={() => setShowPreview((v) => !v)} className="ml-2 text-xs text-white/50 hover:text-white underline">
              {showPreview ? 'Hide preview' : 'Show preview'}
            </button>
          </div>
        </div>
        {showHelp && (
          <pre className="bg-neutral-900 border border-white/10 rounded-lg p-3 text-xs text-white/60 whitespace-pre-wrap">
{`# Big heading        ## Section heading        ### Smaller heading
**bold**   *italic*   [link text](https://example.com)   [email us](mailto:support@scanconnect.co.in)
- bullet item        1. numbered item        > a highlighted note
A blank line starts a new paragraph. Raw HTML is not used.`}
          </pre>
        )}
        <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
          <textarea
            ref={area}
            className={`${inputCls} font-mono min-h-[420px]`}
            value={form.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder="Write the page here. Use the buttons above to format it."
          />
          {showPreview && (
            <div className="bg-white rounded-lg p-5 min-h-[420px] max-h-[640px] overflow-y-auto">
              {form.content.trim() ? <Markdown>{form.content}</Markdown> : <p className="text-neutral-400 text-sm">The preview appears here as you type.</p>}
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {dirty && <p className="text-xs text-amber-300">You have unsaved changes.</p>}
    </div>
  );
};

// ------------------------------------------------------------------ list

/**
 * CMS Pages: the website's text pages. Built-in pages (Terms, Shipping, Refund) keep their original
 * text until you publish content for them here; you can also create your own pages, which live at
 * /p/<address> on the website. Content is written in simple Markdown with a formatting toolbar.
 */
export const AdminCms: React.FC = () => {
  const [pages, setPages] = useState<PageRow[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [toast, setToast] = useState('');

  const load = () =>
    api
      .get<{ pages: PageRow[] }>('/api/admin/content/pages')
      .then((res) => setPages(res.pages))
      .catch((err) => setLoadError(errorText(err)));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const remove = async (p: PageRow) => {
    if (!confirm(`Delete the page "${p.title}"?\n\nIts address (${publicPath(p)}) will stop working. This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/content/pages/${p.id}`);
      setToast('Page deleted.');
      await load();
    } catch (err) {
      setToast(errorText(err));
    }
  };

  if (editing) {
    return (
      <PageEditor
        id={editing.id}
        onClose={(message) => {
          setEditing(null);
          if (message) setToast(message);
          load();
        }}
      />
    );
  }

  if (loadError && !pages) return <div className="p-4 md:p-8 text-rose-400">{loadError}</div>;
  if (!pages) return <div className="p-4 md:p-8 text-white/60">Loading pages…</div>;

  const builtIn = pages.filter((p) => p.isSystem);
  const custom = pages.filter((p) => !p.isSystem);

  const table = (rows: PageRow[], empty: string) =>
    rows.length === 0 ? (
      <div className="border border-dashed border-white/15 rounded-xl p-8 text-center text-white/50 text-sm">{empty}</div>
    ) : (
      <div className="overflow-x-auto border border-white/10 rounded-xl">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const status = statusOf(p);
              return (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-semibold">{p.title}</td>
                  <td className="px-4 py-3">
                    <a href={publicPath(p)} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white font-mono text-xs inline-flex items-center gap-1">
                      {publicPath(p)} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${status.style}`}>{status.label}</span>
                    <div className="text-[11px] text-white/35 mt-1">{status.note}</div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{new Date(p.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing({ id: p.id })} className="p-2 text-white/50 hover:text-white" title="Edit" aria-label={`Edit ${p.title}`}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!p.isSystem && (
                      <button onClick={() => remove(p)} className="p-2 text-white/50 hover:text-rose-400" title="Delete" aria-label={`Delete ${p.title}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">CMS Pages</h1>
          <p className="text-sm text-white/50 mt-1">Edit the website&apos;s text pages, or add new ones. Changes appear on the site within a minute.</p>
        </div>
        <button onClick={() => setEditing({ id: null })} className="flex items-center gap-1.5 bg-[#FFED00] text-black font-bold text-sm px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> New page
        </button>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">Website pages</h2>
          <p className="text-xs text-white/40">These pages already exist on the site. Publish content here to replace their original text.</p>
        </div>
        {table(builtIn, 'No built-in pages found.')}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">Your pages</h2>
          <p className="text-xs text-white/40">Pages you create. Each one lives at /p/&lt;address&gt; and you can link to it from banners.</p>
        </div>
        {table(custom, 'You haven’t created any pages yet.')}
      </section>

      {toast && (
        <div role="status" className="fixed bottom-6 right-6 bg-neutral-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl border border-white/10">
          {toast}
        </div>
      )}
    </div>
  );
};
