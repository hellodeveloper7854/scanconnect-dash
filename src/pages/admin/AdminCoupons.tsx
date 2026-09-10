import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

interface CouponRow {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  percentageValue: number | null;
  fixedValueInPaise: number | null;
  minOrderInPaise: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const CODE_PATTERN = /^[A-Za-z0-9-]{3,40}$/;

interface CouponFormState {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  percentageValue: string;
  fixedValueInRupees: string;
  minOrderInRupees: string;
  usageLimit: string;
  isActive: boolean;
  expiresAt: string; // yyyy-mm-dd, empty = no expiry
}

const emptyForm = (): CouponFormState => ({
  code: '',
  type: 'PERCENTAGE',
  percentageValue: '',
  fixedValueInRupees: '',
  minOrderInRupees: '',
  usageLimit: '',
  isActive: true,
  expiresAt: '',
});

const rowToForm = (c: CouponRow): CouponFormState => ({
  code: c.code,
  type: c.type,
  percentageValue: c.percentageValue != null ? String(c.percentageValue) : '',
  fixedValueInRupees: c.fixedValueInPaise != null ? String(c.fixedValueInPaise / 100) : '',
  minOrderInRupees: c.minOrderInPaise != null ? String(c.minOrderInPaise / 100) : '',
  usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
  isActive: c.isActive,
  expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
});

const money = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponRow[] | null>(null);
  const [error, setError] = useState('');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => {
    api
      .get<{ coupons: CouponRow[] }>('/api/admin/coupons')
      .then((res) => setCoupons(res.coupons))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load coupons'));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setFormError('');
    setEditingId(null);
    setModalMode('create');
  };

  const openEdit = (c: CouponRow) => {
    setForm(rowToForm(c));
    setFormError('');
    setEditingId(c.id);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const fieldErrors = {
    code: CODE_PATTERN.test(form.code.trim())
      ? ''
      : 'Code must be 3-40 characters, letters/numbers/hyphens only',
    value:
      form.type === 'PERCENTAGE'
        ? Number(form.percentageValue) >= 1 && Number(form.percentageValue) <= 100 && form.percentageValue.trim() !== ''
          ? ''
          : 'Enter a percentage between 1 and 100'
        : Number(form.fixedValueInRupees) >= 1 && form.fixedValueInRupees.trim() !== ''
          ? ''
          : 'Enter a discount amount greater than 0',
    usageLimit:
      form.usageLimit.trim() === '' || Number(form.usageLimit) >= 1 ? '' : 'Usage limit must be at least 1',
    minOrder:
      form.minOrderInRupees.trim() === '' || Number(form.minOrderInRupees) >= 0
        ? ''
        : 'Minimum order cannot be negative',
  };
  const isFormValid = Object.values(fieldErrors).every((e) => !e);

  const handleSave = async () => {
    if (!isFormValid) {
      setFormError('Please fix the highlighted fields.');
      return;
    }
    setIsSaving(true);
    setFormError('');
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        percentageValue: form.type === 'PERCENTAGE' ? Number(form.percentageValue) : undefined,
        fixedValueInPaise: form.type === 'FIXED' ? Math.round(Number(form.fixedValueInRupees) * 100) : undefined,
        minOrderInPaise: form.minOrderInRupees.trim() ? Math.round(Number(form.minOrderInRupees) * 100) : undefined,
        usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : undefined,
        isActive: form.isActive,
        expiresAt: form.expiresAt || undefined,
      };
      if (modalMode === 'create') {
        await api.post('/api/admin/coupons', body);
      } else if (editingId) {
        await api.patch(`/api/admin/coupons/${editingId}`, body);
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/api/admin/coupons/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Coupon Management</h1>
          <p className="text-white/50 text-sm mt-1">
            Live coupons — every discount here applies at checkout and is validated server-side.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 font-black text-xs uppercase tracking-wide rounded-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New Coupon
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl px-4 py-3">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-rose-300 cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!coupons ? (
        <div className="text-white/60">Loading...</div>
      ) : coupons.length === 0 ? (
        <div className="text-white/60">No coupons yet. Create one to get started.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = c.expiresAt ? new Date(c.expiresAt).getTime() < Date.now() : false;
                const limitReached = c.usageLimit != null && c.usedCount >= c.usageLimit;
                return (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white font-mono">{c.code}</td>
                    <td className="px-4 py-3 text-white/70">
                      {c.type === 'PERCENTAGE' ? `${c.percentageValue}%` : money(c.fixedValueInPaise ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {c.minOrderInPaise != null ? money(c.minOrderInPaise) : '—'}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {c.usedCount}
                      {c.usageLimit != null ? `/${c.usageLimit}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                          !c.isActive
                            ? 'text-white/40 bg-white/5'
                            : expired
                              ? 'text-rose-400 bg-rose-400/10'
                              : limitReached
                                ? 'text-amber-400 bg-amber-400/10'
                                : 'text-emerald-400 bg-emerald-400/10'
                        }`}
                      >
                        {!c.isActive ? 'Disabled' : expired ? 'Expired' : limitReached ? 'Limit Reached' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-white/50 hover:text-[#FFED00] cursor-pointer inline-block"
                        title="Edit coupon"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: c.id, code: c.code })}
                        className="p-1.5 text-white/50 hover:text-rose-400 cursor-pointer inline-block"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-lg text-white">{modalMode === 'create' ? 'New Coupon' : 'Edit Coupon'}</h2>
              <button onClick={closeModal} className="text-white/50 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-1.5">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') }))}
                  placeholder="WELCOME10"
                  className="w-full h-10 px-3 bg-white/10 border border-white/10 text-white font-mono text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-1.5">Discount Type</label>
                <div className="flex rounded-md overflow-hidden border border-white/10">
                  {(['PERCENTAGE', 'FIXED'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 h-10 text-xs font-bold uppercase cursor-pointer ${
                        form.type === t ? 'bg-[#FFED00] text-neutral-950' : 'bg-white/10 text-white/70 hover:bg-white/15'
                      }`}
                    >
                      {t === 'PERCENTAGE' ? 'Percentage %' : 'Fixed ₹'}
                    </button>
                  ))}
                </div>
              </div>

              {form.type === 'PERCENTAGE' ? (
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1.5">Percentage Off</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.percentageValue}
                    onChange={(e) => setForm((f) => ({ ...f, percentageValue: e.target.value }))}
                    placeholder="10"
                    className="w-full h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1.5">Discount Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.fixedValueInRupees}
                    onChange={(e) => setForm((f) => ({ ...f, fixedValueInRupees: e.target.value }))}
                    placeholder="100"
                    className="w-full h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase mb-1.5">Minimum Order (₹, optional)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderInRupees}
                  onChange={(e) => setForm((f) => ({ ...f, minOrderInRupees: e.target.value }))}
                  placeholder="No minimum"
                  className="w-full h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1.5">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase mb-1.5">Expires On</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#FFED00] cursor-pointer"
                />
                <span className="text-sm text-white/70">Active</span>
              </label>
            </div>

            {formError && <p className="text-xs font-semibold text-rose-400">{formError}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="h-10 px-4 text-white/70 hover:text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 px-4 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 text-sm font-bold rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="font-black text-lg text-white">Delete this coupon?</h2>
            </div>
            <p className="text-sm text-white/70">
              This will permanently delete coupon <span className="font-mono text-white">{deleteTarget.code}</span>.
              It will no longer be usable at checkout. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="h-10 px-4 text-white/70 hover:text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="h-10 px-4 bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
