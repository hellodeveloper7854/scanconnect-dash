import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, PhoneIncoming, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

/** Live admin pages: QR Analytics, Call Logs and IVR Numbers (all backed by real data). */

const errorText = (err: unknown) => (err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong.');
const inputCls = 'bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]';
const fmtNum = (n: number) => n.toLocaleString('en-IN');
const fmtDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';
const fmtDuration = (s: number | null) => (s == null ? '—' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
const phone = (n: string | null) => (n ? n.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2') : '—');

const Page: React.FC<{ title: string; subtitle: string; actions?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, actions, children }) => (
  <div className="p-4 md:p-8 space-y-6 max-w-[1400px]">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">{title}</h1>
        <p className="text-sm text-white/50 mt-1 max-w-2xl">{subtitle}</p>
      </div>
      {actions}
    </div>
    {children}
  </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; note?: React.ReactNode }> = ({ label, value, note }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
    <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">{label}</p>
    <p className="text-3xl font-black text-white mt-1.5 tabular-nums">{value}</p>
    {note && <p className="text-xs text-white/45 mt-1">{note}</p>}
  </div>
);

const Panel: React.FC<{ title: string; note?: string; children: React.ReactNode; className?: string }> = ({ title, note, children, className = '' }) => (
  <section className={`rounded-xl border border-white/10 bg-neutral-950/60 ${className}`}>
    <header className="px-5 pt-4 pb-3 border-b border-white/5">
      <h2 className="font-bold text-white text-sm">{title}</h2>
      {note && <p className="text-xs text-white/40 mt-0.5">{note}</p>}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const Loading: React.FC = () => (
  <div className="flex items-center gap-2 text-white/60 text-sm py-8">
    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
  </div>
);
const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">{message}</div>
);
const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-white/45">{children}</div>
);

/** Horizontal share bars (device split, cities, …). */
const HBars: React.FC<{ rows: { label: string; value: number; sub?: string }[]; suffix?: string }> = ({ rows, suffix = '' }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <Empty>No data yet.</Empty>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/80 capitalize truncate pr-2">{r.label}</span>
            <span className="text-white/50 tabular-nums">{fmtNum(r.value)}{suffix}{r.sub ? ` · ${r.sub}` : ''}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-[#FFED00]" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

/** Daily bar chart with a hover title on each bar. */
const BarChart: React.FC<{ data: { label: string; value: number }[]; color?: string; height?: number }> = ({ data, color = '#FFED00', height = 140 }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const every = Math.ceil(data.length / 8);
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex-1 min-w-0 h-full flex items-end group relative" title={`${d.label}: ${d.value}`}>
            <div
              className="w-full rounded-t-sm transition-opacity group-hover:opacity-80"
              style={{ height: `${d.value ? Math.max(4, (d.value / max) * 100) : 1}%`, background: d.value ? color : 'rgba(255,255,255,0.08)' }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] mt-1.5">
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 min-w-0 text-[9px] text-white/35 text-center truncate">
            {i % every === 0 ? d.label.slice(5).replace('-', '/') : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <div className="overflow-x-auto border border-white/10 rounded-xl">
    <table className="w-full min-w-[720px] text-sm">
      <thead>
        <tr className="text-left text-white/45 uppercase text-[11px] tracking-wider border-b border-white/10 bg-white/[0.02]">
          {headers.map((h) => (
            <th key={h} className="px-4 py-3 whitespace-nowrap font-bold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

// ===================================================================== QR analytics

interface QrAnalytics {
  days: number;
  trackingSince: string | null;
  totals: {
    codes: number; active: number; inactive: number; disabled: number; scansAllTime: number; scans: number;
    uniqueScanned: number; activations: number; contactRequests: number; contactRate: number | null;
  };
  daily: { date: string; scans: number; requests: number; activations: number }[];
  devices: { label: string; count: number }[];
  os: { label: string; count: number }[];
  topCodes: { displayId: string; registration: string | null; nickname: string | null; status: string | null; scans: number }[];
  topCities: { city: string; orders: number }[];
  batches: { batchName: string; total: number; active: number; activationRate: number }[];
}

export const AdminQrAnalytics: React.FC = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<QrAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api.get<QrAnalytics>(`/api/admin/analytics/qr?days=${days}`).then(setData).catch((e) => setError(errorText(e)));
  }, [days]);

  const trackingNote =
    data && (!data.trackingSince || new Date(data.trackingSince) > new Date(Date.now() - days * 86_400_000))
      ? data.trackingSince
        ? `Scan tracking began on ${new Date(data.trackingSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}; earlier scans weren't recorded, so older days show zero.`
        : 'No scans recorded yet. Every time someone opens a tag’s page, it is counted here.'
      : null;

  return (
    <Page
      title="QR Analytics"
      subtitle="Real scan, activation and contact activity for your QR tags."
      actions={
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-md text-xs font-bold ${d === days ? 'bg-[#FFED00] text-[#1B1C1C]' : 'text-white/65 hover:bg-white/10'}`}>
              {d} days
            </button>
          ))}
        </div>
      }
    >
      {error && <ErrorBox message={error} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          {trackingNote && (
            <div className="flex items-start gap-2 rounded-lg border border-sky-300/20 bg-sky-300/5 p-3 text-sm text-sky-100/80">
              <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" /> {trackingNote}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="QR tags" value={fmtNum(data.totals.codes)} note={`${fmtNum(data.totals.active)} active · ${fmtNum(data.totals.inactive)} unclaimed · ${fmtNum(data.totals.disabled)} disabled`} />
            <Stat label={`Scans (${days} days)`} value={fmtNum(data.totals.scans)} note={`${fmtNum(data.totals.uniqueScanned)} different tags · ${fmtNum(data.totals.scansAllTime)} all time`} />
            <Stat label="Activations" value={fmtNum(data.totals.activations)} note="Tags claimed by owners in this period" />
            <Stat
              label="Contact requests"
              value={fmtNum(data.totals.contactRequests)}
              note={data.totals.contactRate !== null ? `${data.totals.contactRate}% of scans led to a call request` : 'Masked-call requests from scanners'}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Panel title="Scans per day" note="Each time someone opens a tag’s page (bots excluded)" className="xl:col-span-2">
              <BarChart data={data.daily.map((d) => ({ label: d.date, value: d.scans }))} />
            </Panel>
            <Panel title="Devices" note="Where scans come from">
              <HBars rows={data.devices.map((d) => ({ label: d.label, value: d.count }))} />
              {data.os.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <HBars rows={data.os.map((d) => ({ label: d.label, value: d.count }))} />
                </div>
              )}
            </Panel>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Activations per day" note="Tags claimed by their owners">
              <BarChart data={data.daily.map((d) => ({ label: d.date, value: d.activations }))} color="#34d399" height={110} />
            </Panel>
            <Panel title="Call requests per day" note="Scanners asking to call an owner or emergency contact">
              <BarChart data={data.daily.map((d) => ({ label: d.date, value: d.requests }))} color="#60a5fa" height={110} />
            </Panel>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Panel title="Most scanned tags" note={`Last ${days} days`} className="xl:col-span-2">
              {data.topCodes.length === 0 ? (
                <Empty>No scans in this period.</Empty>
              ) : (
                <Table headers={['Tag', 'Vehicle', 'Status', 'Scans']}>
                  {data.topCodes.map((c) => (
                    <tr key={c.displayId} className="border-b border-white/5">
                      <td className="px-4 py-2.5 font-mono text-xs text-white">{c.displayId}</td>
                      <td className="px-4 py-2.5 text-white/70">{c.registration ?? <span className="text-white/30">Not claimed</span>}{c.nickname ? <span className="text-white/40"> · {c.nickname}</span> : null}</td>
                      <td className="px-4 py-2.5 text-white/60 text-xs">{c.status}</td>
                      <td className="px-4 py-2.5 text-white font-bold tabular-nums">{fmtNum(c.scans)}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>
            <Panel title="Top cities" note="Paid orders by delivery city">
              <HBars rows={data.topCities.map((c) => ({ label: c.city, value: c.orders }))} />
            </Panel>
          </div>

          <Panel title="Batches" note="How many tags from each batch have been claimed">
            {data.batches.length === 0 ? (
              <Empty>No QR batches yet.</Empty>
            ) : (
              <div className="space-y-3">
                {data.batches.map((b) => (
                  <div key={b.batchName}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80 truncate pr-2">{b.batchName}</span>
                      <span className="text-white/50 tabular-nums">{fmtNum(b.active)} / {fmtNum(b.total)} active · {b.activationRate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${b.activationRate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </Page>
  );
};

// ======================================================================= Call logs

interface CallRow {
  id: string;
  callerNumber: string | null;
  destinationNumber: string | null;
  status: string | null;
  durationSeconds: number | null;
  startedAt: string | null;
  createdAt: string;
  providerCallId: string | null;
  targetKind: string | null;
  virtualNumber: string | null;
  qrDisplayId: string | null;
  registration: string | null;
  rawPayload: unknown;
}
interface CallsResponse {
  calls: CallRow[];
  total: number;
  page: number;
  pageSize: number;
  statuses: { status: string; count: number }[];
  stats: { total: number; talked: number; avgSeconds: number; totalMinutes: number; today: number; week: number };
}
interface RequestRow {
  id: string;
  callerPhone: string;
  targetKind: string;
  virtualNumber: string | null;
  createdAt: string;
  qrDisplayId: string;
  registration: string | null;
  connected: boolean;
}

const Pager: React.FC<{ page: number; pageSize: number; total: number; onPage: (p: number) => void }> = ({ page, pageSize, total, onPage }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between text-xs text-white/50">
      <span>{total === 0 ? 'No results' : `${(page - 1) * pageSize + 1}–${Math.min(total, page * pageSize)} of ${fmtNum(total)}`}</span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
        <span className="px-2">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

const statusStyle = (status: string | null, duration: number | null) => {
  const s = (status ?? '').toLowerCase();
  if ((duration ?? 0) > 0 || /answer|connect|complete/.test(s)) return 'text-emerald-300 bg-emerald-400/10';
  if (/miss|no.?answer|busy|fail|cancel|unavail/.test(s)) return 'text-rose-300 bg-rose-400/10';
  return 'text-white/60 bg-white/10';
};

export const AdminCallLogs: React.FC = () => {
  const [tab, setTab] = useState<'calls' | 'requests'>('calls');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CallsResponse | null>(null);
  const [requests, setRequests] = useState<{ requests: RequestRow[]; total: number; page: number; pageSize: number } | null>(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(() => {
    setError('');
    if (tab === 'calls') {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set('q', query);
      if (status) params.set('status', status);
      if (from) params.set('from', new Date(`${from}T00:00:00+05:30`).toISOString());
      if (to) params.set('to', new Date(`${to}T23:59:59+05:30`).toISOString());
      api.get<CallsResponse>(`/api/admin/calls?${params}`).then(setData).catch((e) => setError(errorText(e)));
    } else {
      api.get<typeof requests>(`/api/admin/calls/requests?page=${page}`).then(setRequests).catch((e) => setError(errorText(e)));
    }
  }, [tab, page, query, status, from, to]);

  useEffect(load, [load]);

  const s = data?.stats;

  return (
    <Page
      title="Call Logs"
      subtitle="Masked calls bridged by Knowlarity, and the call requests scanners made before dialling."
      actions={
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      }
    >
      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Stat label="Calls logged" value={fmtNum(s.total)} note={`${fmtNum(s.today)} today · ${fmtNum(s.week)} this week`} />
          <Stat label="Talked" value={fmtNum(s.talked)} note={s.total ? `${Math.round((s.talked / s.total) * 100)}% of calls were answered` : undefined} />
          <Stat label="Avg. talk time" value={fmtDuration(s.avgSeconds)} note="Answered calls only" />
          <Stat label="Total talk time" value={`${fmtNum(s.totalMinutes)} min`} />
          <Stat label="Statuses" value={data!.statuses.length} note={data!.statuses.slice(0, 3).map((x) => `${x.status} ${x.count}`).join(' · ')} />
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
        {([['calls', 'Calls'], ['requests', 'Call requests']] as const).map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setPage(1); setOpenId(null); }} className={`px-4 py-1.5 rounded-md text-sm font-bold ${tab === id ? 'bg-[#FFED00] text-[#1B1C1C]' : 'text-white/65 hover:bg-white/10'}`}>
            {label}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} />}

      {tab === 'calls' && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-white/35 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number or call ID" className={`${inputCls} w-full pl-9`} />
            </div>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={inputCls}>
              <option value="">All statuses</option>
              {data?.statuses.map((x) => <option key={x.status} value={x.status === 'Unknown' ? '' : x.status}>{x.status} ({x.count})</option>)}
            </select>
            <label className="flex items-center gap-2 text-xs text-white/50">From <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={inputCls} /></label>
            <label className="flex items-center gap-2 text-xs text-white/50">To <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={inputCls} /></label>
          </div>

          {!data && !error && <Loading />}
          {data && data.calls.length === 0 && (
            <Empty>{data.stats.total === 0 ? 'No calls yet. Call records appear here once Knowlarity reports a finished call to /api/qr/partner/call-logs.' : 'No calls match these filters.'}</Empty>
          )}
          {data && data.calls.length > 0 && (
            <>
              <Table headers={['Time', 'Caller (scanner)', 'Connected to', 'Tag / vehicle', 'Status', 'Duration', '']}>
                {data.calls.map((c) => (
                  <React.Fragment key={c.id}>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap text-xs">{fmtDateTime(c.startedAt ?? c.createdAt)}</td>
                      <td className="px-4 py-3 text-white font-mono text-xs whitespace-nowrap">{phone(c.callerNumber)}</td>
                      <td className="px-4 py-3 text-white/80 font-mono text-xs whitespace-nowrap">
                        {phone(c.destinationNumber)}
                        {c.targetKind && <span className="ml-1.5 text-[10px] text-white/40 font-sans">{c.targetKind === 'owner' ? 'owner' : 'emergency contact'}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.qrDisplayId ? (<><span className="font-mono text-white/80">{c.qrDisplayId}</span>{c.registration && <span className="text-white/45"> · {c.registration}</span>}</>) : <span className="text-white/30">Not matched</span>}
                      </td>
                      <td className="px-4 py-3"><span className={`text-[11px] font-bold rounded px-1.5 py-0.5 ${statusStyle(c.status, c.durationSeconds)}`}>{c.status ?? 'Unknown'}</span></td>
                      <td className="px-4 py-3 text-white tabular-nums">{fmtDuration(c.durationSeconds)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setOpenId(openId === c.id ? null : c.id)} className="p-1.5 text-white/45 hover:text-white" aria-label="Show details">
                          <ChevronDown className={`w-4 h-4 transition-transform ${openId === c.id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    {openId === c.id && (
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid md:grid-cols-3 gap-3 text-xs text-white/60 mb-3">
                            <div>Call ID: <span className="font-mono text-white/80">{c.providerCallId ?? '—'}</span></div>
                            <div>Masked number used: <span className="font-mono text-white/80">{phone(c.virtualNumber)}</span></div>
                            <div>Received: <span className="text-white/80">{fmtDateTime(c.createdAt)}</span></div>
                          </div>
                          <pre className="text-[11px] text-white/60 bg-black/40 rounded-lg p-3 overflow-x-auto max-h-64">{JSON.stringify(c.rawPayload, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </Table>
              <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
            </>
          )}
        </>
      )}

      {tab === 'requests' && (
        <>
          {!requests && !error && <Loading />}
          {requests && requests.requests.length === 0 && <Empty>No call requests yet.</Empty>}
          {requests && requests.requests.length > 0 && (
            <>
              <Table headers={['Requested', 'Scanner’s number', 'Wanted to reach', 'Tag / vehicle', 'Masked number', 'Call logged']}>
                {requests.requests.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white/70 text-xs whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3 text-white font-mono text-xs">{phone(r.callerPhone)}</td>
                    <td className="px-4 py-3 text-white/70 text-xs">{r.targetKind === 'owner' ? 'Owner' : 'Emergency contact'}</td>
                    <td className="px-4 py-3 text-xs"><span className="font-mono text-white/80">{r.qrDisplayId}</span>{r.registration && <span className="text-white/45"> · {r.registration}</span>}</td>
                    <td className="px-4 py-3 text-white/70 font-mono text-xs">{phone(r.virtualNumber)}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-bold rounded px-1.5 py-0.5 ${r.connected ? 'text-emerald-300 bg-emerald-400/10' : 'text-white/50 bg-white/10'}`}>{r.connected ? 'Yes' : 'Not yet'}</span></td>
                  </tr>
                ))}
              </Table>
              <Pager page={requests.page} pageSize={requests.pageSize} total={requests.total} onPage={setPage} />
            </>
          )}
        </>
      )}
    </Page>
  );
};

// ====================================================================== IVR numbers

interface IvrNumber {
  number: string;
  source: 'account' | 'env' | 'history';
  dialable: boolean;
  expired: boolean;
  type: string;
  label: string | null;
  enabled: boolean;
  inRotation: boolean;
  requestsTotal: number;
  requests30d: number;
  lastUsedAt: string | null;
}
interface IvrResponse {
  provider: { name: string; configured: boolean; channel: string; usingAllowList: boolean; reachable: boolean; error: string | null };
  numbers: IvrNumber[];
  inRotation: number;
}

const SOURCE_LABEL: Record<IvrNumber['source'], string> = { account: 'Knowlarity account', env: 'Server allow-list', history: 'Past use only' };

export const AdminIvr: React.FC = () => {
  const [data, setData] = useState<IvrResponse | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>({});

  const load = useCallback((refresh = false) => {
    setError('');
    setRefreshing(refresh);
    return api
      .get<IvrResponse>(`/api/admin/ivr${refresh ? '?refresh=1' : ''}`)
      .then((d) => {
        setData(d);
        setLabels(Object.fromEntries(d.numbers.map((n) => [n.number, n.label ?? ''])));
      })
      .catch((e) => setError(errorText(e)))
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (number: string, body: { label?: string | null; enabled?: boolean }) => {
    setBusy(number);
    setError('');
    try {
      await api.patch('/api/admin/ivr/numbers', { phoneNumber: number, ...body });
      await load();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const toggle = (n: IvrNumber) => {
    if (n.enabled && n.inRotation && data && data.inRotation === 1 && !confirm('This is the only number in rotation. Switching it off means scanners will not be able to place masked calls. Continue?')) return;
    patch(n.number, { enabled: !n.enabled });
  };

  const warn = useMemo(() => data && data.provider.configured && data.inRotation === 0, [data]);

  return (
    <Page
      title="IVR Numbers"
      subtitle="The Knowlarity numbers scanners dial to reach an owner without seeing their phone number. Switch a number off to take it out of the rotation."
      actions={
        <button onClick={() => load(true)} disabled={refreshing} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Sync from Knowlarity
        </button>
      }
    >
      {error && <ErrorBox message={error} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Provider"
              value={<span className="text-xl">{data.provider.name}</span>}
              note={
                !data.provider.configured ? 'Not configured on the server'
                : data.provider.reachable ? `Connected · ${data.provider.channel} plan` : 'Could not reach Knowlarity'
              }
            />
            <Stat label="In rotation" value={data.inRotation} note={data.provider.usingAllowList ? 'Server allow-list is active' : 'Handed out round-robin'} />
            <Stat label="Numbers" value={data.numbers.length} note="On the account or used before" />
            <Stat label="Requests (30 days)" value={fmtNum(data.numbers.reduce((a, n) => a + n.requests30d, 0))} note="Masked-call requests" />
          </div>

          {data.provider.error && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100/90">
              <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" /> Knowlarity said: {data.provider.error}. Showing numbers already known to the server.
            </div>
          )}
          {warn && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" /> No number is in rotation, so scanners cannot place masked calls right now.
            </div>
          )}
          {!data.provider.configured && <Empty>Knowlarity is not configured. Set KNOWLARITY_API_KEY and KNOWLARITY_SR_API_KEY (or KNOWLARITY_MASKED_NUMBERS) on the server.</Empty>}

          {data.numbers.length > 0 && (
            <Table headers={['Number', 'Label', 'Type', 'Source', 'Requests 30d / total', 'Last used', 'In rotation']}>
              {data.numbers.map((n) => (
                <tr key={n.number} className="border-b border-white/5">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2 text-white font-mono text-sm"><PhoneIncoming className="w-4 h-4 text-[#FFED00]/80" />{phone(n.number)}</span>
                    {n.expired && <span className="ml-2 text-[10px] font-bold text-rose-300 bg-rose-400/10 rounded px-1.5 py-0.5">EXPIRED</span>}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={labels[n.number] ?? ''}
                      onChange={(e) => setLabels((l) => ({ ...l, [n.number]: e.target.value }))}
                      onBlur={() => (labels[n.number] ?? '') !== (n.label ?? '') && patch(n.number, { label: labels[n.number] ?? '' })}
                      placeholder="Add a label"
                      maxLength={80}
                      className={`${inputCls} w-44 py-1.5`}
                    />
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs">{n.type}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{SOURCE_LABEL[n.source]}</td>
                  <td className="px-4 py-3 text-white/80 tabular-nums text-xs">{fmtNum(n.requests30d)} / {fmtNum(n.requestsTotal)}</td>
                  <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{fmtDateTime(n.lastUsedAt)}</td>
                  <td className="px-4 py-3">
                    {n.dialable || n.source === 'env' ? (
                      <button
                        onClick={() => toggle(n)}
                        disabled={busy === n.number}
                        role="switch"
                        aria-checked={n.enabled}
                        aria-label={`${n.enabled ? 'Switch off' : 'Switch on'} ${n.number}`}
                        className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${n.enabled ? 'bg-emerald-500' : 'bg-white/15'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${n.enabled ? 'translate-x-5' : ''}`} />
                      </button>
                    ) : (
                      <span className="text-[11px] text-white/35">Not dialable</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </>
      )}
    </Page>
  );
};
