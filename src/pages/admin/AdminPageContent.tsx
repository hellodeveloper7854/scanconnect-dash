import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ExternalLink, ImagePlus, Loader2, RotateCcw, Save, Search, X,
} from 'lucide-react';
import { api, ApiError, API_BASE_URL, withAppEnv } from '../../lib/api';
import { MAX_IMAGE_MB, PAGES, type FieldDef, type PageDef, type SectionDef } from '../../lib/siteContentRegistry';

interface SavedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  fileName: string;
}
interface PageData {
  values: Record<string, string>;
  images: Record<string, SavedImage>;
}

const inputCls =
  'w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00] focus:ring-1 focus:ring-[#FFED00]/40 transition-colors';
const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

const imgSrc = (url: string) => withAppEnv(`${API_BASE_URL}${url}`);
const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);
const errorText = (err: unknown) =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong. Please try again.';

/** Reads an image file's pixel size in the browser so problems can be flagged. */
const readDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('This file could not be read as an image.'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

const imageWarnings = (field: FieldDef, width: number, height: number): string[] => {
  const spec = field.image;
  if (!spec) return [];
  const out: string[] = [];
  const want = spec.width / spec.height;
  if (Math.abs(width / height - want) / want > 0.15) {
    out.push(`Shape differs from the recommended ${spec.width}×${spec.height}, so it will be cropped on the page.`);
  }
  if (width < spec.width * 0.6) {
    out.push(`Smaller than recommended (${width}px wide vs ${spec.width}px); it may look blurry.`);
  }
  return out;
};

// ---------------------------------------------------------------- grouping
// Fields like "steps.1.title" / "steps.1.desc" belong together on one card, and
// plain numbered lists ("trust.1", "trust.2", …) read best as a compact grid.

type Block =
  | { kind: 'field'; f: FieldDef }
  | { kind: 'group'; id: string; title: string; fields: FieldDef[] }
  | { kind: 'list'; title: string; fields: FieldDef[] };

const shortLabel = (f: FieldDef) => (f.label.includes(' — ') ? f.label.split(' — ').slice(1).join(' — ') : f.label);
const groupTitle = (f: FieldDef) => (f.label.includes(' — ') ? f.label.split(' — ')[0] : f.label);

function buildBlocks(fields: FieldDef[]): Block[] {
  const blocks: Block[] = [];
  const groups = new Map<string, Extract<Block, { kind: 'group' }>>();
  for (const f of fields) {
    const m = /^(.+?)\.(\d+)(?:\.(.+))?$/.exec(f.key);
    if (!m) {
      blocks.push({ kind: 'field', f });
      continue;
    }
    const id = `${m[1]}.${m[2]}`;
    let g = groups.get(id);
    if (!g) {
      g = { kind: 'group', id, title: groupTitle(f), fields: [] };
      groups.set(id, g);
      blocks.push(g);
    }
    g.fields.push(f);
  }
  // Merge runs of one-field groups (plain numbered lines) into one list block.
  const merged: Block[] = [];
  for (const b of blocks) {
    const isLine = b.kind === 'group' && b.fields.length === 1 && /^(.+?)\.\d+$/.test(b.fields[0].key);
    const prev = merged[merged.length - 1];
    if (isLine && b.kind === 'group') {
      const prefix = b.fields[0].key.replace(/\.\d+$/, '');
      if (prev && prev.kind === 'list' && prev.fields[0].key.replace(/\.\d+$/, '') === prefix) {
        prev.fields.push(b.fields[0]);
      } else {
        merged.push({ kind: 'list', title: '', fields: [b.fields[0]] });
      }
    } else {
      merged.push(b);
    }
  }
  return merged;
}

// ---------------------------------------------------------------- component

export const AdminPageContent: React.FC = () => {
  const [pageId, setPageId] = useState(PAGES[0].id);
  const page: PageDef = PAGES.find((p) => p.id === pageId) ?? PAGES[0];

  const [saved, setSaved] = useState<PageData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [pics, setPics] = useState<Record<string, SavedImage | null>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<Record<string, { error?: string; warnings?: string[] }>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');

  const fields = useMemo(() => page.sections.flatMap((s) => s.fields), [page]);

  const adopt = (data: PageData) => {
    setSaved(data);
    const t: Record<string, string> = {};
    const p: Record<string, SavedImage | null> = {};
    for (const f of fields) {
      if (f.type === 'image') p[f.key] = data.images[f.key] ?? null;
      else t[f.key] = data.values[f.key] ?? f.default;
    }
    setTexts(t);
    setPics(p);
  };

  useEffect(() => {
    setSaved(null);
    setLoadError('');
    setSaveError('');
    setUploadNote({});
    setQuery('');
    setOpen({ [page.sections[0].id]: true });
    let alive = true;
    api
      .get<PageData>(`/api/admin/content/site/${page.id}`)
      .then((data) => alive && adopt(data))
      .catch((err) => alive && setLoadError(errorText(err)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const isEdited = (f: FieldDef) => (f.type === 'image' ? !!pics[f.key] : texts[f.key] !== undefined && texts[f.key] !== f.default);
  const isUnsaved = (f: FieldDef) =>
    !!saved &&
    (f.type === 'image'
      ? (pics[f.key]?.id ?? null) !== (saved.images[f.key]?.id ?? null)
      : texts[f.key] !== (saved.values[f.key] ?? f.default));

  const changedTextKeys = fields.filter((f) => f.type !== 'image' && isUnsaved(f)).map((f) => f.key);
  const changedImageKeys = fields.filter((f) => f.type === 'image' && isUnsaved(f)).map((f) => f.key);
  const dirtyCount = changedTextKeys.length + changedImageKeys.length;
  const editedTotal = fields.filter(isEdited).length;

  useEffect(() => {
    if (!dirtyCount) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyCount]);

  const switchPage = (id: string) => {
    if (id === pageId) return;
    if (dirtyCount && !window.confirm('You have unsaved changes on this page. Discard them?')) return;
    setPageId(id);
  };

  const badLinks = fields.filter((f) => f.type === 'url' && texts[f.key]?.trim() && !SAFE_LINK.test(texts[f.key].trim()));

  const save = async () => {
    if (badLinks.length) {
      setSaveError(`Fix the link${badLinks.length > 1 ? 's' : ''}: ${badLinks.map((f) => f.label).join(', ')} (must start with https://, mailto:, tel: or /).`);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const values: Record<string, string | null> = {};
      for (const key of changedTextKeys) {
        const f = fields.find((x) => x.key === key)!;
        const v = texts[key].trim();
        values[key] = v === '' || v === f.default ? null : v;
      }
      const images: Record<string, string | null> = {};
      for (const key of changedImageKeys) images[key] = pics[key]?.id ?? null;
      adopt(await api.put<PageData>(`/api/admin/content/site/${page.id}`, { values, images }));
      setToast('Saved. The website shows the new content within a minute.');
    } catch (err) {
      setSaveError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const discard = () => saved && adopt(saved);

  const upload = async (field: FieldDef, file: File) => {
    setUploadNote((n) => ({ ...n, [field.key]: {} }));
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setUploadNote((n) => ({ ...n, [field.key]: { error: 'Use a JPG, PNG or WebP image.' } }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setUploadNote((n) => ({ ...n, [field.key]: { error: `That file is ${kb(file.size)}. The limit is ${MAX_IMAGE_MB} MB — compress it (for example at squoosh.app) and try again.` } }));
      return;
    }
    setUploading(field.key);
    try {
      const dims = await readDimensions(file);
      const img = await api.upload<SavedImage>(`/api/admin/content/images?name=${encodeURIComponent(file.name)}`, file);
      setPics((p) => ({ ...p, [field.key]: img }));
      setUploadNote((n) => ({ ...n, [field.key]: { warnings: imageWarnings(field, dims.width, dims.height) } }));
    } catch (err) {
      setUploadNote((n) => ({ ...n, [field.key]: { error: errorText(err) } }));
    } finally {
      setUploading(null);
    }
  };

  const reset = (f: FieldDef) =>
    f.type === 'image' ? setPics((p) => ({ ...p, [f.key]: null })) : setTexts((t) => ({ ...t, [f.key]: f.default }));

  // ----- search
  const q = query.trim().toLowerCase();
  const matches = (f: FieldDef) =>
    !q || f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q) || (texts[f.key] ?? '').toLowerCase().includes(q);

  const sectionStats = (s: SectionDef) => ({
    total: s.fields.length,
    edited: s.fields.filter(isEdited).length,
    unsaved: s.fields.filter(isUnsaved).length,
    hits: s.fields.filter(matches).length,
  });

  const visibleSections = page.sections.filter((s) => !q || s.fields.some(matches));
  const isOpen = (id: string) => (q ? true : !!open[id]);
  const jump = (id: string) => {
    setOpen((o) => ({ ...o, [id]: true }));
    setTimeout(() => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  // ----- field rendering
  const renderField = (f: FieldDef, opts: { label?: string } = {}) => {
    const edited = isEdited(f);
    const unsaved = isUnsaved(f);
    const note = uploadNote[f.key];
    const current = pics[f.key];
    const value = texts[f.key] ?? '';
    const urlBad = f.type === 'url' && value.trim() && !SAFE_LINK.test(value.trim());
    return (
      <div key={f.key} className="space-y-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-white/60 min-w-0">
            <span
              title={unsaved ? 'Unsaved change' : edited ? 'Edited' : 'Default wording'}
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${unsaved ? 'bg-sky-400' : edited ? 'bg-[#FFED00]' : 'bg-white/15'}`}
            />
            <span className="truncate">{opts.label ?? f.label}</span>
          </label>
          {edited && (
            <button
              type="button"
              onClick={() => reset(f)}
              className="inline-flex items-center gap-1 text-[11px] text-white/45 hover:text-white shrink-0"
              title="Go back to the original"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {f.type === 'image' ? (
          <ImageField
            field={f}
            src={current ? imgSrc(current.url) : f.default}
            info={current ? `${current.width}×${current.height}px · ${kb(current.sizeBytes)} · ${current.fileName}` : 'Original image'}
            busy={uploading === f.key}
            onPick={(file) => upload(f, file)}
          />
        ) : f.type === 'longtext' ? (
          <div className="relative">
            <textarea
              className={`${inputCls} resize-y leading-relaxed`}
              rows={Math.min(7, Math.max(2, Math.ceil(value.length / 70)))}
              value={value}
              maxLength={f.maxLength}
              onChange={(e) => setTexts((t) => ({ ...t, [f.key]: e.target.value }))}
            />
            {f.maxLength && value.length > f.maxLength * 0.8 && (
              <span className="absolute bottom-1.5 right-2.5 text-[10px] text-white/35">{value.length}/{f.maxLength}</span>
            )}
          </div>
        ) : (
          <input
            className={`${inputCls} ${urlBad ? '!border-rose-500' : ''}`}
            value={value}
            maxLength={f.maxLength}
            onChange={(e) => setTexts((t) => ({ ...t, [f.key]: e.target.value }))}
          />
        )}

        {urlBad && <p className="text-xs text-rose-300">Links must start with https://, mailto:, tel: or /</p>}
        {f.hint && <p className="text-[11px] text-white/35 leading-snug">{f.hint}</p>}
        {note?.error && <p className="text-xs text-rose-300">{note.error}</p>}
        {note?.warnings?.map((w) => (
          <p key={w} className="text-xs text-amber-300 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {w}
          </p>
        ))}
      </div>
    );
  };

  const renderBlocks = (section: SectionDef) => {
    const blocks = buildBlocks(section.fields.filter(matches));
    const singles = blocks.filter((b): b is Extract<Block, { kind: 'field' }> => b.kind === 'field');
    const rest = blocks.filter((b) => b.kind !== 'field');
    return (
      <div className="space-y-5">
        {singles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            {singles.map(({ f }) => (
              <div key={f.key} className={f.type === 'longtext' || f.type === 'image' ? 'md:col-span-2' : ''}>
                {renderField(f)}
              </div>
            ))}
          </div>
        )}
        {rest.map((b, i) =>
          b.kind === 'list' ? (
            <div key={`list-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              {b.fields.map((f) => renderField(f))}
            </div>
          ) : b.kind === 'group' ? (
            <div key={b.id} className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="px-4 py-2 bg-white/[0.04] border-b border-white/10 text-xs font-bold text-[#FFED00]/90 truncate">{b.title}</div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                {b.fields.map((f) => (
                  <div key={f.key} className={f.type === 'longtext' || f.type === 'image' ? 'md:col-span-2' : ''}>
                    {renderField(f, { label: shortLabel(f) })}
                  </div>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-28 space-y-6 max-w-[1400px]">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Page Content</h1>
          <p className="text-sm text-white/55 mt-1 max-w-2xl">
            Edit the headings, text and pictures on the main website pages. Everything starts with the original wording — change a field and save,
            or press <span className="text-white/80 font-semibold">Reset</span> to go back. Layout and styling stay the same.
          </p>
        </div>
      </div>

      {/* page tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 w-fit max-w-full">
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => switchPage(p.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              p.id === pageId ? 'bg-[#FFED00] text-[#1B1C1C] shadow' : 'text-white/65 hover:bg-white/10 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* page summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-neutral-950/60 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm text-white/75">{page.description}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {fields.length} fields · {saved ? `${editedTotal} edited` : 'loading…'}
          </p>
        </div>
        <a href={page.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#FFED00] font-semibold hover:underline shrink-0">
          View page <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {loadError && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          Could not load saved content: {loadError}. The website keeps showing the original wording meanwhile.
        </div>
      )}
      {!saved && !loadError && (
        <div className="flex items-center gap-2 text-white/60 text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}

      {saved && (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 items-start">
          {/* section navigator */}
          <aside className="hidden lg:block sticky top-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-white/35 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fields…"
                className={`${inputCls} pl-9 pr-8`}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <nav className="rounded-xl border border-white/10 bg-neutral-950/60 p-1.5 max-h-[calc(100vh-190px)] overflow-y-auto">
              {visibleSections.map((s) => {
                const st = sectionStats(s);
                return (
                  <button
                    key={s.id}
                    onClick={() => jump(s.id)}
                    className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 rounded-lg text-[13px] text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <span className="truncate">{s.title}</span>
                    {st.unsaved > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" title="Unsaved changes" />
                    ) : st.edited > 0 ? (
                      <span className="text-[10px] font-bold text-[#1B1C1C] bg-[#FFED00] rounded-full px-1.5 shrink-0">{st.edited}</span>
                    ) : null}
                  </button>
                );
              })}
              {visibleSections.length === 0 && <p className="px-3 py-2 text-xs text-white/40">No fields match.</p>}
            </nav>
          </aside>

          {/* sections */}
          <div className="space-y-3 min-w-0">
            {/* mobile search */}
            <div className="relative lg:hidden">
              <Search className="w-4 h-4 text-white/35 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fields…" className={`${inputCls} pl-9`} />
            </div>

            <div className="flex items-center justify-between text-xs text-white/45">
              <span>{q ? `${visibleSections.length} section(s) with matches` : `${page.sections.length} sections`}</span>
              {!q && (
                <span className="flex gap-3">
                  <button onClick={() => setOpen(Object.fromEntries(page.sections.map((s) => [s.id, true])))} className="hover:text-white">Expand all</button>
                  <button onClick={() => setOpen({})} className="hover:text-white">Collapse all</button>
                </span>
              )}
            </div>

            {visibleSections.map((section) => {
              const st = sectionStats(section);
              const expanded = isOpen(section.id);
              return (
                <section key={section.id} id={`sec-${section.id}`} className="rounded-xl border border-white/10 bg-neutral-950/60 scroll-mt-4">
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [section.id]: !o[section.id] }))}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0">
                      <h2 className="font-bold text-white truncate">{section.title}</h2>
                      <p className="text-xs text-white/40 mt-0.5">
                        {section.description ?? `${st.total} field${st.total === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {st.unsaved > 0 && <span className="text-[11px] font-semibold text-sky-300">{st.unsaved} unsaved</span>}
                      {st.edited > 0 && (
                        <span className="text-[11px] font-bold text-[#1B1C1C] bg-[#FFED00] rounded-full px-2 py-0.5">{st.edited} edited</span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {expanded && <div className="px-5 pb-5 pt-1 border-t border-white/5"><div className="pt-4">{renderBlocks(section)}</div></div>}
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* save bar */}
      {saved && (
        <div className="sticky bottom-4 z-30">
          <div>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-neutral-900/95 backdrop-blur px-4 py-3 shadow-2xl">
              <div className="text-sm flex-1 min-w-[200px]">
                {saveError ? (
                  <span className="text-rose-300">{saveError}</span>
                ) : toast ? (
                  <span className="text-emerald-300 inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {toast}</span>
                ) : dirtyCount ? (
                  <span className="text-white/85 inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-400" /> {dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}</span>
                ) : (
                  <span className="text-white/40">No unsaved changes</span>
                )}
              </div>
              <button onClick={discard} disabled={!dirtyCount || saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-30">
                Discard
              </button>
              <button
                onClick={save}
                disabled={!dirtyCount || saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FFED00] text-[#1B1C1C] text-sm font-bold disabled:opacity-40"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImageField: React.FC<{
  field: FieldDef;
  src: string;
  info: string;
  busy: boolean;
  onPick: (file: File) => void;
}> = ({ field, src, info, busy, onPick }) => {
  const input = useRef<HTMLInputElement>(null);
  const spec = field.image!;
  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-lg border border-white/10 bg-neutral-900/60 p-3">
      <div className="sm:w-52 shrink-0 rounded-lg overflow-hidden bg-[repeating-conic-gradient(#262626_0%_25%,#1c1c1c_0%_50%)] bg-[length:16px_16px] flex items-center justify-center h-36">
        <img src={src} alt="" className="max-h-36 max-w-full object-contain" />
      </div>
      <div className="flex-1 space-y-2.5 text-sm min-w-0">
        <p className="text-white/70 text-[13px] leading-snug">{spec.note}</p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="px-2 py-1 rounded-md bg-white/5 text-white/70">Recommended <b className="text-white">{spec.width} × {spec.height} px</b></span>
          <span className="px-2 py-1 rounded-md bg-white/5 text-white/70">JPG · PNG · WebP</span>
          <span className="px-2 py-1 rounded-md bg-white/5 text-white/70">Max <b className="text-white">{MAX_IMAGE_MB} MB</b></span>
        </div>
        <p className="text-[11px] text-white/40 truncate">Current: {info}</p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onPick(file);
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} {busy ? 'Uploading…' : 'Upload new image'}
        </button>
      </div>
    </div>
  );
};
