import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

interface FaqRow {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
  updatedAt: string;
}

interface FaqForm {
  category: string;
  question: string;
  answer: string;
  published: boolean;
}

const emptyForm = (category = ''): FaqForm => ({ category, question: '', answer: '', published: true });

const inputCls =
  'w-full bg-neutral-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]';

/** Server validation errors arrive as zod's flatten() ({fieldErrors}) or a plain string. */
const errorText = (err: unknown): string => {
  if (err instanceof ApiError) {
    const d = err.details as { error?: { fieldErrors?: Record<string, string[]> } } | undefined;
    const first = d?.error?.fieldErrors && Object.values(d.error.fieldErrors).flat()[0];
    return first || err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
};

/**
 * FAQ Management: the questions on the website's FAQ page (/faq). Questions are grouped by
 * category, shown in this order, and only "published" ones appear on the site.
 */
export const AdminFaqs: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqRow[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [editing, setEditing] = useState<{ id: string | null; form: FaqForm } | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = () =>
    api
      .get<{ faqs: FaqRow[] }>('/api/admin/content/faqs')
      .then((res) => setFaqs(res.faqs))
      .catch((err) => setLoadError(errorText(err)));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of faqs ?? []) counts.set(f.category, (counts.get(f.category) ?? 0) + 1);
    return [...counts.entries()];
  }, [faqs]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (faqs ?? []).filter(
      (f) =>
        (category === 'ALL' || f.category === category) &&
        (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)),
    );
  }, [faqs, search, category]);

  // Grouped by category in the order categories first appear.
  const groups = useMemo(() => {
    const map = new Map<string, FaqRow[]>();
    for (const f of shown) map.set(f.category, [...(map.get(f.category) ?? []), f]);
    return [...map.entries()];
  }, [shown]);

  const openNew = () => {
    setFormError('');
    setEditing({ id: null, form: emptyForm(category !== 'ALL' ? category : '') });
  };
  const openEdit = (f: FaqRow) => {
    setFormError('');
    setEditing({ id: f.id, form: { category: f.category, question: f.question, answer: f.answer, published: f.published } });
  };

  const save = async () => {
    if (!editing) return;
    const { form } = editing;
    if (form.category.trim().length < 2) return setFormError('Choose or type a category.');
    if (form.question.trim().length < 5) return setFormError('Enter the question (at least 5 characters).');
    if (form.answer.trim().length < 5) return setFormError('Enter the answer (at least 5 characters).');
    setSaving(true);
    setFormError('');
    try {
      if (editing.id) await api.patch(`/api/admin/content/faqs/${editing.id}`, form);
      else await api.post('/api/admin/content/faqs', form);
      setEditing(null);
      setToast(editing.id ? 'FAQ updated.' : 'FAQ added.');
      await load();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (f: FaqRow) => {
    if (!confirm(`Delete this FAQ?\n\n"${f.question}"\n\nThis cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/content/faqs/${f.id}`);
      setToast('FAQ deleted.');
      await load();
    } catch (err) {
      setToast(errorText(err));
    }
  };

  const togglePublished = async (f: FaqRow) => {
    try {
      await api.patch(`/api/admin/content/faqs/${f.id}`, { published: !f.published });
      setToast(f.published ? 'Hidden from the website.' : 'Now showing on the website.');
      await load();
    } catch (err) {
      setToast(errorText(err));
    }
  };

  /** Moves a question up/down among the questions of its own category (swapping places in the overall order). */
  const move = async (f: FaqRow, direction: -1 | 1) => {
    if (!faqs) return;
    const sameCategory = faqs.filter((x) => x.category === f.category);
    const index = sameCategory.findIndex((x) => x.id === f.id);
    const neighbour = sameCategory[index + direction];
    if (!neighbour) return;
    const ids = faqs.map((x) => x.id);
    const a = ids.indexOf(f.id);
    const b = ids.indexOf(neighbour.id);
    [ids[a], ids[b]] = [ids[b], ids[a]];
    // Show the new order straight away; the server confirms it.
    setFaqs(ids.map((id) => faqs.find((x) => x.id === id)!));
    try {
      await api.post('/api/admin/content/faqs/reorder', { ids });
    } catch (err) {
      setToast(errorText(err));
      await load();
    }
  };

  if (loadError && !faqs) return <div className="p-4 md:p-8 text-rose-400">{loadError}</div>;
  if (!faqs) return <div className="p-4 md:p-8 text-white/60">Loading FAQs…</div>;

  const publishedCount = faqs.filter((f) => f.published).length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">FAQ Management</h1>
          <p className="text-sm text-white/50 mt-1">
            These are the questions on your website&apos;s FAQ page. Changes appear on the site within a minute.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white border border-white/15 rounded-lg px-3 py-2"
          >
            <ExternalLink className="w-4 h-4" /> View on site
          </a>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 bg-[#FFED00] text-black font-bold text-sm px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <span className="bg-white/5 rounded-full px-3 py-1">{faqs.length} total</span>
        <span className="bg-emerald-400/10 text-emerald-300 rounded-full px-3 py-1">{publishedCount} on the website</span>
        {faqs.length - publishedCount > 0 && (
          <span className="bg-white/5 rounded-full px-3 py-1">{faqs.length - publishedCount} hidden</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions and answers"
            className="pl-9 pr-3 h-10 bg-white/10 border border-white/10 text-white text-sm rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[['ALL', faqs.length] as [string, number], ...categories].map(([name, count]) => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                category === name ? 'bg-[#FFED00] text-black border-[#FFED00]' : 'text-white/70 border-white/15 hover:text-white'
              }`}
            >
              {name === 'ALL' ? 'All' : name} <span className="opacity-60">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl p-10 text-center text-white/50">
          {faqs.length === 0 ? 'No FAQs yet. Add your first one.' : 'No FAQs match your search.'}
        </div>
      ) : (
        groups.map(([name, items]) => (
          <section key={name} className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
              {name} · {items.length}
            </h2>
            <div className="border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
              {items.map((f) => {
                const siblings = (faqs ?? []).filter((x) => x.category === f.category);
                const position = siblings.findIndex((x) => x.id === f.id);
                const reorderable = !search.trim(); // order only makes sense on the unfiltered list
                return (
                  <div key={f.id} className={`flex gap-3 p-4 ${f.published ? '' : 'opacity-60'}`}>
                    <div className="flex flex-col justify-center">
                      <button
                        onClick={() => move(f, -1)}
                        disabled={!reorderable || position === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        aria-label="Move up"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => move(f, 1)}
                        disabled={!reorderable || position === siblings.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        aria-label="Move down"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{f.question}</p>
                      <p className="text-white/50 text-sm mt-1 line-clamp-2 whitespace-pre-line">{f.answer}</p>
                      {!f.published && <span className="inline-block mt-2 text-[10px] font-bold uppercase text-amber-300 bg-amber-300/10 rounded px-1.5 py-0.5">Hidden</span>}
                    </div>
                    <div className="flex items-start gap-1">
                      <button
                        onClick={() => togglePublished(f)}
                        className="p-2 text-white/50 hover:text-white"
                        title={f.published ? 'Hide from website' : 'Show on website'}
                        aria-label={f.published ? 'Hide from website' : 'Show on website'}
                      >
                        {f.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(f)} className="p-2 text-white/50 hover:text-white" title="Edit" aria-label="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(f)} className="p-2 text-white/50 hover:text-rose-400" title="Delete" aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {toast && (
        <div role="status" className="fixed bottom-6 right-6 bg-neutral-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl border border-white/10">
          {toast}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => !saving && setEditing(null)}>
          <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">{editing.id ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-white/60">Category</span>
                <input
                  list="faq-categories"
                  className={inputCls}
                  value={editing.form.category}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, category: e.target.value } })}
                  placeholder="Pick one or type a new category"
                />
                <datalist id="faq-categories">
                  {categories.map(([name]) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-white/60">Question</span>
                <input
                  className={inputCls}
                  value={editing.form.question}
                  maxLength={300}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, question: e.target.value } })}
                  placeholder="e.g. How do I activate my tag?"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-white/60">Answer</span>
                <textarea
                  className={`${inputCls} min-h-[140px]`}
                  value={editing.form.answer}
                  maxLength={5000}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, answer: e.target.value } })}
                  placeholder="Write the answer. Line breaks are kept."
                />
                <span className="text-[11px] text-white/30">{editing.form.answer.length}/5000</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.form.published}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, published: e.target.checked } })}
                  className="w-4 h-4 accent-[#FFED00]"
                />
                Show on the website
              </label>
              {formError && <p className="text-sm text-rose-400">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-white/10">
              <button onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2 text-sm text-white/70 hover:text-white">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="bg-[#FFED00] text-black font-bold text-sm px-5 py-2 rounded-lg disabled:opacity-60">
                {saving ? 'Saving…' : editing.id ? 'Save changes' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
