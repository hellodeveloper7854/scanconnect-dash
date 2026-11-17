import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

type Placement = 'TOP_BAR' | 'HOMEPAGE' | 'SHOP';

interface BannerRow {
  id: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
  placement: Placement;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
}

interface BannerForm {
  title: string;
  message: string;
  ctaLabel: string;
  linkUrl: string;
  imageUrl: string;
  placement: Placement;
  active: boolean;
  startsAt: string; // datetime-local value, '' = no start
  endsAt: string;
}

const PLACEMENTS: { key: Placement; label: string; where: string }[] = [
  { key: 'TOP_BAR', label: 'Top bar', where: 'A thin announcement strip above the header on every page.' },
  { key: 'HOMEPAGE', label: 'Homepage', where: 'A banner card at the top of the home page.' },
  { key: 'SHOP', label: 'Shop', where: 'A banner card at the top of the shop page.' },
];

const inputCls =
  'w-full bg-neutral-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]';

const errorText = (err: unknown): string => {
  if (err instanceof ApiError) {
    const d = err.details as { error?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } } | undefined;
    const first = d?.error && (Object.values(d.error.fieldErrors ?? {}).flat()[0] ?? d.error.formErrors?.[0]);
    return first || err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
};

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyForm = (placement: Placement = 'TOP_BAR'): BannerForm => ({
  title: '',
  message: '',
  ctaLabel: '',
  linkUrl: '',
  imageUrl: '',
  placement,
  active: true,
  startsAt: '',
  endsAt: '',
});

const rowToForm = (b: BannerRow): BannerForm => ({
  title: b.title,
  message: b.message,
  ctaLabel: b.ctaLabel ?? '',
  linkUrl: b.linkUrl ?? '',
  imageUrl: b.imageUrl ?? '',
  placement: b.placement,
  active: b.active,
  startsAt: toLocalInput(b.startsAt),
  endsAt: toLocalInput(b.endsAt),
});

type LiveState = 'LIVE' | 'SCHEDULED' | 'EXPIRED' | 'OFF';

/** What visitors would see for this banner right now. */
const liveState = (b: BannerRow): LiveState => {
  if (!b.active) return 'OFF';
  const now = Date.now();
  if (b.startsAt && new Date(b.startsAt).getTime() > now) return 'SCHEDULED';
  if (b.endsAt && new Date(b.endsAt).getTime() <= now) return 'EXPIRED';
  return 'LIVE';
};

const STATE_STYLE: Record<LiveState, string> = {
  LIVE: 'text-emerald-300 bg-emerald-300/10',
  SCHEDULED: 'text-sky-300 bg-sky-300/10',
  EXPIRED: 'text-white/50 bg-white/10',
  OFF: 'text-amber-300 bg-amber-300/10',
};
const STATE_LABEL: Record<LiveState, string> = { LIVE: 'Live', SCHEDULED: 'Scheduled', EXPIRED: 'Expired', OFF: 'Off' };

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : null;

/** A small preview that looks like what the website shows. */
const Preview: React.FC<{ form: BannerForm }> = ({ form }) => {
  const title = form.title || 'Banner title';
  if (form.placement === 'TOP_BAR') {
    return (
      <div className="bg-[#1B1C1C] text-white text-xs rounded-lg px-4 py-2 text-center border border-white/10">
        <span className="font-bold">{title}</span>
        {form.message && <span className="text-white/80"> — {form.message}</span>}
        {form.linkUrl && form.ctaLabel && <span className="ml-2 font-bold text-[#FFED00] underline">{form.ctaLabel}</span>}
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-[#FFED00] text-[#1B1C1C] flex overflow-hidden">
      {form.imageUrl && /^https:\/\//i.test(form.imageUrl) && <img src={form.imageUrl} alt="" className="w-28 object-cover" />}
      <div className="p-4">
        <p className="font-black leading-tight">{title}</p>
        {form.message && <p className="text-xs mt-1 text-[#1B1C1C]/80">{form.message}</p>}
        {form.linkUrl && form.ctaLabel && (
          <span className="inline-block mt-2 bg-[#1B1C1C] text-white font-bold text-xs px-3 py-1.5 rounded-md">{form.ctaLabel}</span>
        )}
      </div>
    </div>
  );
};

/**
 * Banner Management: promotional banners shown on the website. Each banner has a placement
 * (top bar, homepage or shop), an optional button link, an optional image, and an optional
 * schedule. Within a placement they appear in the order shown here.
 */
export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<BannerRow[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<Placement | 'ALL'>('ALL');
  const [editing, setEditing] = useState<{ id: string | null; form: BannerForm } | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = () =>
    api
      .get<{ banners: BannerRow[] }>('/api/admin/content/banners')
      .then((res) => setBanners(res.banners))
      .catch((err) => setLoadError(errorText(err)));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const shown = useMemo(() => (banners ?? []).filter((b) => tab === 'ALL' || b.placement === tab), [banners, tab]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: banners?.length ?? 0 };
    for (const b of banners ?? []) c[b.placement] = (c[b.placement] ?? 0) + 1;
    return c;
  }, [banners]);

  const openNew = () => {
    setFormError('');
    setEditing({ id: null, form: emptyForm(tab === 'ALL' ? 'TOP_BAR' : tab) });
  };
  const openEdit = (b: BannerRow) => {
    setFormError('');
    setEditing({ id: b.id, form: rowToForm(b) });
  };

  const save = async () => {
    if (!editing) return;
    const f = editing.form;
    if (f.title.trim().length < 2) return setFormError('Enter a title.');
    if (f.ctaLabel.trim() && !f.linkUrl.trim()) return setFormError('Add a link for the button, or clear the button text.');
    if (f.linkUrl.trim() && !/^\/(?!\/)|^https?:\/\//i.test(f.linkUrl.trim())) {
      return setFormError('The link must start with / (a page on this site) or https://');
    }
    if (f.imageUrl.trim() && !/^https:\/\//i.test(f.imageUrl.trim())) return setFormError('The image link must start with https://');
    if (f.startsAt && f.endsAt && new Date(f.startsAt) >= new Date(f.endsAt)) return setFormError('The end date must be after the start date.');

    const body = {
      title: f.title.trim(),
      message: f.message.trim(),
      ctaLabel: f.ctaLabel.trim(),
      linkUrl: f.linkUrl.trim(),
      imageUrl: f.imageUrl.trim(),
      placement: f.placement,
      active: f.active,
      startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null,
      endsAt: f.endsAt ? new Date(f.endsAt).toISOString() : null,
    };
    setSaving(true);
    setFormError('');
    try {
      if (editing.id) await api.patch(`/api/admin/content/banners/${editing.id}`, body);
      else await api.post('/api/admin/content/banners', body);
      setEditing(null);
      setToast(editing.id ? 'Banner updated.' : 'Banner created.');
      await load();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: BannerRow) => {
    try {
      await api.patch(`/api/admin/content/banners/${b.id}/active`, { active: !b.active });
      setToast(b.active ? 'Banner switched off.' : 'Banner switched on.');
      await load();
    } catch (err) {
      setToast(errorText(err));
    }
  };

  const remove = async (b: BannerRow) => {
    if (!confirm(`Delete the banner "${b.title}"?\n\nThis cannot be undone. To hide it for now, switch it off instead.`)) return;
    try {
      await api.delete(`/api/admin/content/banners/${b.id}`);
      setToast('Banner deleted.');
      await load();
    } catch (err) {
      setToast(errorText(err));
    }
  };

  /** Moves a banner up/down within its own placement. */
  const move = async (b: BannerRow, direction: -1 | 1) => {
    if (!banners) return;
    const siblings = banners.filter((x) => x.placement === b.placement);
    const neighbour = siblings[siblings.findIndex((x) => x.id === b.id) + direction];
    if (!neighbour) return;
    const ids = banners.map((x) => x.id);
    const a = ids.indexOf(b.id);
    const n = ids.indexOf(neighbour.id);
    [ids[a], ids[n]] = [ids[n], ids[a]];
    setBanners(ids.map((id) => banners.find((x) => x.id === id)!));
    try {
      await api.post('/api/admin/content/banners/reorder', { ids });
    } catch (err) {
      setToast(errorText(err));
      await load();
    }
  };

  if (loadError && !banners) return <div className="p-4 md:p-8 text-rose-400">{loadError}</div>;
  if (!banners) return <div className="p-4 md:p-8 text-white/60">Loading banners…</div>;

  const liveCount = banners.filter((b) => liveState(b) === 'LIVE').length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Banner Management</h1>
          <p className="text-sm text-white/50 mt-1">
            Announcements and promotions shown on your website. {liveCount} live right now. Changes appear on the site within a minute.
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-[#FFED00] text-black font-bold text-sm px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> New banner
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([{ key: 'ALL', label: 'All' }, ...PLACEMENTS] as { key: Placement | 'ALL'; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              tab === t.key ? 'bg-[#FFED00] text-black border-[#FFED00]' : 'text-white/70 border-white/15 hover:text-white'
            }`}
          >
            {t.label} <span className="opacity-60">({counts[t.key] ?? 0})</span>
          </button>
        ))}
      </div>
      {tab !== 'ALL' && <p className="text-xs text-white/40 -mt-3">{PLACEMENTS.find((p) => p.key === tab)?.where}</p>}

      {shown.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-xl p-10 text-center text-white/50">
          {banners.length === 0 ? 'No banners yet. Create your first one.' : 'No banners in this placement.'}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((b) => {
            const state = liveState(b);
            const siblings = banners.filter((x) => x.placement === b.placement);
            const position = siblings.findIndex((x) => x.id === b.id);
            return (
              <div key={b.id} className="border border-white/10 rounded-xl p-4 space-y-3">
                <Preview form={rowToForm(b)} />
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`font-bold uppercase rounded px-1.5 py-0.5 ${STATE_STYLE[state]}`}>{STATE_LABEL[state]}</span>
                  <span className="text-white/50">{PLACEMENTS.find((p) => p.key === b.placement)?.label}</span>
                  {(b.startsAt || b.endsAt) && (
                    <span className="text-white/40">
                      {fmt(b.startsAt) ? `from ${fmt(b.startsAt)}` : ''} {fmt(b.endsAt) ? `until ${fmt(b.endsAt)}` : ''}
                    </span>
                  )}
                  {b.linkUrl && (
                    <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white flex items-center gap-1 truncate max-w-[14rem]">
                      <ExternalLink className="w-3 h-3 shrink-0" /> <span className="truncate">{b.linkUrl}</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                    <input type="checkbox" checked={b.active} onChange={() => toggleActive(b)} className="w-4 h-4 accent-[#FFED00]" />
                    Switched on
                  </label>
                  <div className="flex items-center">
                    <button onClick={() => move(b, -1)} disabled={position === 0} className="p-2 text-white/40 hover:text-white disabled:opacity-20" aria-label="Move up" title="Show earlier">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => move(b, 1)} disabled={position === siblings.length - 1} className="p-2 text-white/40 hover:text-white disabled:opacity-20" aria-label="Move down" title="Show later">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(b)} className="p-2 text-white/50 hover:text-white" aria-label="Edit" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(b)} className="p-2 text-white/50 hover:text-rose-400" aria-label="Delete" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-6 right-6 bg-neutral-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl border border-white/10">
          {toast}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => !saving && setEditing(null)}>
          <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">{editing.id ? 'Edit banner' : 'New banner'}</h2>
              <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Preview form={editing.form} />
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-white/60">Where it appears</span>
                <select
                  className={inputCls}
                  value={editing.form.placement}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, placement: e.target.value as Placement } })}
                >
                  {PLACEMENTS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label} — {p.where}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-white/60">Title</span>
                <input className={inputCls} maxLength={120} value={editing.form.title} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, title: e.target.value } })} placeholder="e.g. Festive offer: 20% off all tags" />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-white/60">Message (optional)</span>
                <input className={inputCls} maxLength={300} value={editing.form.message} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, message: e.target.value } })} placeholder="A short line under the title" />
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-white/60">Button text (optional)</span>
                  <input className={inputCls} maxLength={40} value={editing.form.ctaLabel} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, ctaLabel: e.target.value } })} placeholder="Shop now" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-white/60">Button link</span>
                  <input className={inputCls} value={editing.form.linkUrl} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, linkUrl: e.target.value } })} placeholder="/shop or https://…" />
                </label>
              </div>
              {editing.form.placement !== 'TOP_BAR' && (
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-white/60">Image link (optional, https only)</span>
                  <input className={inputCls} value={editing.form.imageUrl} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, imageUrl: e.target.value } })} placeholder="https://…/banner.jpg" />
                </label>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-white/60">Start showing (optional)</span>
                  <input type="datetime-local" className={inputCls} value={editing.form.startsAt} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, startsAt: e.target.value } })} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-white/60">Stop showing (optional)</span>
                  <input type="datetime-local" className={inputCls} value={editing.form.endsAt} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, endsAt: e.target.value } })} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                <input type="checkbox" checked={editing.form.active} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, active: e.target.checked } })} className="w-4 h-4 accent-[#FFED00]" />
                Switched on
              </label>
              {formError && <p className="text-sm text-rose-400">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-white/10">
              <button onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2 text-sm text-white/70 hover:text-white">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="bg-[#FFED00] text-black font-bold text-sm px-5 py-2 rounded-lg disabled:opacity-60">
                {saving ? 'Saving…' : editing.id ? 'Save changes' : 'Create banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
