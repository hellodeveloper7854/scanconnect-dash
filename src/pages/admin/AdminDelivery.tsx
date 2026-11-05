import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Truck } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

interface Rule {
  match: string;
  minDays: string;
  maxDays: string;
}

interface Settings {
  defaultMinDays: number;
  defaultMaxDays: number;
  rules: { match: string; minDays: number; maxDays: number }[];
}

const inputCls =
  'bg-neutral-900 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]';

const isDays = (v: string) => /^\d{1,2}$/.test(v.trim()) && Number(v) <= 60;

/**
 * Admin control for the "Deliver to <pincode>" estimate shown on product pages in the app:
 * a default range of working days, plus rules that override it for particular cities,
 * districts or states. A rule applies when its text matches the place the pincode
 * belongs to (e.g. "Delhi", "Bengaluru", "Karnataka"); the first matching rule wins.
 */
export const AdminDelivery: React.FC = () => {
  const [defMin, setDefMin] = useState('');
  const [defMax, setDefMax] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<Settings>('/api/admin/delivery/settings')
      .then((s) => {
        setDefMin(String(s.defaultMinDays));
        setDefMax(String(s.defaultMaxDays));
        setRules(s.rules.map((r) => ({ match: r.match, minDays: String(r.minDays), maxDays: String(r.maxDays) })));
        setLoaded(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load delivery settings'));
  }, []);

  const touch = () => setSaved(false);
  const setRule = (i: number, patch: Partial<Rule>) => {
    setRules((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    touch();
  };

  const validation = (): string => {
    if (!isDays(defMin) || !isDays(defMax)) return 'Default days must be whole numbers from 0 to 60.';
    if (Number(defMin) > Number(defMax)) return 'Default minimum days cannot be more than the maximum.';
    for (const [i, r] of rules.entries()) {
      if (r.match.trim().length < 2) return `Rule ${i + 1}: enter a city, district or state name.`;
      if (!isDays(r.minDays) || !isDays(r.maxDays)) return `Rule ${i + 1}: days must be whole numbers from 0 to 60.`;
      if (Number(r.minDays) > Number(r.maxDays)) return `Rule ${i + 1}: minimum days cannot be more than the maximum.`;
    }
    return '';
  };

  const save = async () => {
    const problem = validation();
    if (problem) {
      setError(problem);
      setSaved(false);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await api.put('/api/admin/delivery/settings', {
        defaultMinDays: Number(defMin),
        defaultMaxDays: Number(defMax),
        rules: rules.map((r) => ({ match: r.match.trim(), minDays: Number(r.minDays), maxDays: Number(r.maxDays) })),
      });
      setSaved(true);
    } catch (err) {
      setSaved(false);
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded && error) return <div className="p-4 md:p-8 text-rose-400">{error}</div>;
  if (!loaded) return <div className="p-4 md:p-8 text-white/60">Loading…</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2">
          <Truck className="w-6 h-6" /> Delivery Estimates
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Controls the estimated delivery dates customers see when they enter a pincode on a product page. Days are
          working days (Sundays are skipped). This is an estimate, not a courier promise.
        </p>
      </div>

      <section className="border border-white/10 rounded-xl p-4 space-y-3">
        <h2 className="text-white font-bold">Default (everywhere else)</h2>
        <div className="flex items-center gap-3 text-sm text-white/70">
          <input
            className={`${inputCls} w-20`}
            inputMode="numeric"
            value={defMin}
            onChange={(e) => {
              setDefMin(e.target.value);
              touch();
            }}
            aria-label="Default minimum days"
          />
          <span>to</span>
          <input
            className={`${inputCls} w-20`}
            inputMode="numeric"
            value={defMax}
            onChange={(e) => {
              setDefMax(e.target.value);
              touch();
            }}
            aria-label="Default maximum days"
          />
          <span>working days</span>
        </div>
      </section>

      <section className="border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold">Place-specific rules</h2>
          <button
            type="button"
            onClick={() => {
              setRules((rs) => [...rs, { match: '', minDays: '2', maxDays: '3' }]);
              touch();
            }}
            className="flex items-center gap-1 text-sm text-[#FFED00] hover:underline"
          >
            <Plus className="w-4 h-4" /> Add rule
          </button>
        </div>
        <p className="text-xs text-white/40">
          A rule applies when its name matches the pincode&apos;s city, district or state (for example &quot;Delhi&quot;,
          &quot;Mumbai&quot; or &quot;Kerala&quot;). The first matching rule from the top wins.
        </p>
        {rules.length === 0 && <p className="text-sm text-white/40">No rules — the default applies everywhere.</p>}
        {rules.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              className={`${inputCls} flex-1 min-w-[10rem]`}
              placeholder="City, district or state"
              value={r.match}
              onChange={(e) => setRule(i, { match: e.target.value })}
              aria-label={`Rule ${i + 1} place`}
            />
            <input
              className={`${inputCls} w-16`}
              inputMode="numeric"
              value={r.minDays}
              onChange={(e) => setRule(i, { minDays: e.target.value })}
              aria-label={`Rule ${i + 1} minimum days`}
            />
            <span className="text-white/50 text-sm">to</span>
            <input
              className={`${inputCls} w-16`}
              inputMode="numeric"
              value={r.maxDays}
              onChange={(e) => setRule(i, { maxDays: e.target.value })}
              aria-label={`Rule ${i + 1} maximum days`}
            />
            <span className="text-white/50 text-sm">days</span>
            <button
              type="button"
              onClick={() => {
                setRules((rs) => rs.filter((_, idx) => idx !== i));
                touch();
              }}
              className="text-rose-400 hover:text-rose-300 p-1"
              aria-label={`Remove rule ${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </section>

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Saved. New estimates use these settings straight away.</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 bg-[#FFED00] text-black font-bold px-5 py-2.5 rounded-lg disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );
};
