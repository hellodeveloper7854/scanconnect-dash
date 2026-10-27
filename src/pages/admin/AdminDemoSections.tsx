import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DemoBanner } from './DemoBanner';

function useDemoData<T>(path: string, key: string) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    api.get<Record<string, unknown>>(path).then((res) => setData(res[key] as T));
  }, [path, key]);
  return data;
}

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">{children}</div>
);

const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <div className="overflow-x-auto border border-white/10 rounded-xl">
    <table className="w-full min-w-[640px] text-sm">
      <thead>
        <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
          {headers.map((h) => (
            <th key={h} className="px-4 py-3 whitespace-nowrap first:sticky first:left-0 first:bg-neutral-950">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

interface QrAnalytics {
  daily: number[];
  weekly: number[];
  monthly: number[];
  byDevice: Record<string, number>;
  byLocation: { city: string; scans: number }[];
}

export const AdminQrAnalytics: React.FC = () => {
  const analytics = useDemoData<QrAnalytics>('/api/admin/demo/qr-analytics', 'analytics');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">QR Analytics</h1>
      <DemoBanner note="Scan tracking isn't implemented yet." />
      {!analytics ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-xs uppercase text-white/50 mb-2">Daily Scans (last 7 days)</p>
            <p className="text-white">{analytics.daily.join(', ')}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase text-white/50 mb-2">By Device</p>
            <p className="text-white">
              {Object.entries(analytics.byDevice)
                .map(([k, v]) => `${k}: ${v}%`)
                .join(', ')}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase text-white/50 mb-2">By Location</p>
            <p className="text-white">
              {analytics.byLocation.map((l) => `${l.city} (${l.scans})`).join(', ')}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

interface Sticker {
  id: string;
  vehicleNickname: string;
  status: string;
  trackingId: string;
  createdAt: string;
}

export const AdminStickers: React.FC = () => {
  const stickers = useDemoData<Sticker[]>('/api/admin/demo/stickers', 'stickers');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">QR Sticker Management</h1>
      <DemoBanner note="No fulfillment/shipping integration yet." />
      {!stickers ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['Vehicle', 'Status', 'Tracking ID', 'Ordered']}>
          {stickers.map((s) => (
            <tr key={s.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white">{s.vehicleNickname}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{s.status}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70 font-mono">{s.trackingId}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/50 text-xs">{s.createdAt}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface IvrNumber {
  id: string;
  virtualNumber: string;
  assignedTo: string;
  status: string;
}

export const AdminIvr: React.FC = () => {
  const numbers = useDemoData<IvrNumber[]>('/api/admin/demo/ivr-numbers', 'numbers');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">IVR Management</h1>
      <DemoBanner note="No Cloud IVR provider (Exotel/Knowlarity) connected yet." />
      {!numbers ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['Virtual Number', 'Assigned To', 'Status']}>
          {numbers.map((n) => (
            <tr key={n.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white font-mono">{n.virtualNumber}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{n.assignedTo}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{n.status}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface CallLog {
  id: string;
  from: string;
  to: string;
  duration: number;
  status: string;
  createdAt: string;
}

export const AdminCallLogs: React.FC = () => {
  const calls = useDemoData<CallLog[]>('/api/admin/demo/call-logs', 'calls');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Call Management</h1>
      <DemoBanner note="No Cloud IVR provider connected yet." />
      {!calls ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['From', 'To', 'Duration (s)', 'Status', 'Date']}>
          {calls.map((c) => (
            <tr key={c.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white">{c.from}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{c.to}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{c.duration}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{c.status}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/50 text-xs">{new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface Plan {
  id: string;
  name: string;
  priceInPaise: number;
  durationDays: number;
  features: string[];
}

export const AdminSubscriptionPlans: React.FC = () => {
  const plans = useDemoData<Plan[]>('/api/admin/demo/subscription-plans', 'plans');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Subscription Plans</h1>
      <DemoBanner note="Plan/subscription billing isn't built yet — orders are one-off purchases today." />
      {!plans ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((p) => (
            <Card key={p.id}>
              <p className="font-bold text-white mb-1">{p.name}</p>
              <p className="text-white/70 text-sm mb-2">
                {(p.priceInPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} /{' '}
                {p.durationDays} days
              </p>
              <ul className="text-white/50 text-xs list-disc list-inside">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface NotificationCampaign {
  id: string;
  title: string;
  audience: string;
  status: string;
  sentAt: string | null;
}

export const AdminNotifications: React.FC = () => {
  const campaigns = useDemoData<NotificationCampaign[]>('/api/admin/demo/notifications', 'campaigns');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Push Notifications</h1>
      <DemoBanner note="Firebase Cloud Messaging campaign sending isn't wired up yet." />
      {!campaigns ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['Title', 'Audience', 'Status', 'Sent']}>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white">{c.title}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{c.audience}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{c.status}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/50 text-xs">{c.sentAt ?? '—'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface CmsPage {
  id: string;
  title: string;
  updatedAt: string;
}

export const AdminCms: React.FC = () => {
  const pages = useDemoData<CmsPage[]>('/api/admin/demo/cms-pages', 'pages');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">CMS Management</h1>
      <DemoBanner note="No CMS backend — website content is hardcoded in the frontend today." />
      {!pages ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['Page', 'Last Updated']}>
          {pages.map((p) => (
            <tr key={p.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white">{p.title}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/50 text-xs">{p.updatedAt}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface Banner {
  id: string;
  title: string;
  placement: string;
  active: boolean;
}

export const AdminBanners: React.FC = () => {
  const banners = useDemoData<Banner[]>('/api/admin/demo/banners', 'banners');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Banner Management</h1>
      <DemoBanner note="No banner engine wired into the website yet." />
      {!banners ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['Title', 'Placement', 'Active']}>
          {banners.map((b) => (
            <tr key={b.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white">{b.title}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{b.placement}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{b.active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const AdminFaqs: React.FC = () => {
  const faqs = useDemoData<Faq[]>('/api/admin/demo/faqs', 'faqs');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">FAQ Management</h1>
      <DemoBanner note="FAQs are hardcoded on the website today." />
      {!faqs ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['Category', 'Question', 'Answer']}>
          {faqs.map((f) => (
            <tr key={f.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{f.category}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white">{f.question}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70 max-w-md truncate">{f.answer}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
}

export const AdminAuditLogs: React.FC = () => {
  const logs = useDemoData<AuditLog[]>('/api/admin/demo/audit-logs', 'logs');
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Audit &amp; Security Logs</h1>
      <DemoBanner note="Admin action logging isn't implemented yet." />
      {!logs ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <Table headers={['Actor', 'Action', 'Target', 'Date']}>
          {logs.map((l) => (
            <tr key={l.id} className="border-b border-white/5">
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white">{l.actor}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70">{l.action}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/70 font-mono">{l.target}</td>
              <td className="px-4 py-3 first:sticky first:left-0 first:bg-neutral-950 text-white/50 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

interface IntegrationFlag {
  provider?: string;
  host?: string;
  configured?: boolean;
}

// The API returns flat demo flags (smtpConfigured, ...); older shapes nested them.
// Either way these are stored demo values, NOT a live connectivity check.
interface SystemConfig {
  smtp?: IntegrationFlag;
  smsGateway?: IntegrationFlag;
  pushNotifications?: IntegrationFlag;
  paymentGateway?: IntegrationFlag;
  cloudIvr?: IntegrationFlag;
  smtpConfigured?: boolean;
  smsGatewayConfigured?: boolean;
  pushNotificationsConfigured?: boolean;
  paymentGatewayConfigured?: boolean;
  cloudIvrConfigured?: boolean;
  maintenanceMode?: boolean;
  appVersion?: string;
}

const DEMO_TOOLTIP =
  'Demo placeholder: this is a stored demo flag, not a live integration. No connection to this service is made or tested from here.';

export const AdminSystemConfig: React.FC = () => {
  const config = useDemoData<SystemConfig>('/api/admin/demo/system-config', 'config');
  const items = config
    ? [
        { label: 'SMTP / Email', detail: config.smtp?.host, flag: config.smtp?.configured ?? config.smtpConfigured },
        { label: 'SMS Gateway', detail: config.smsGateway?.provider, flag: config.smsGateway?.configured ?? config.smsGatewayConfigured },
        {
          label: 'Push Notifications',
          detail: config.pushNotifications?.provider,
          flag: config.pushNotifications?.configured ?? config.pushNotificationsConfigured,
        },
        {
          label: 'Payment Gateway',
          detail: config.paymentGateway?.provider,
          flag: config.paymentGateway?.configured ?? config.paymentGatewayConfigured,
        },
        { label: 'Cloud IVR', detail: config.cloudIvr?.provider, flag: config.cloudIvr?.configured ?? config.cloudIvrConfigured },
      ]
    : [];
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">System Configuration</h1>
      <DemoBanner
        message="Demo placeholders — the integration statuses below are stored demo flags, not live connections. Nothing here is tested or connected to SMTP, SMS, push, payment or IVR providers."
        note="Real integration settings are managed via the server environment (.env)."
      />
      {!config ? (
        <div className="text-white/60">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.label}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-semibold">{item.label}</span>
                <span
                  title={DEMO_TOOLTIP}
                  className="text-xs font-bold uppercase px-2 py-1 rounded text-[#e0ac00] bg-[#FFED00]/10 border border-[#FFED00]/30 cursor-help"
                >
                  Demo placeholder
                </span>
              </div>
              <p className="text-white/50 text-xs mt-1">
                {item.detail ? `${item.detail} · ` : ''}
                {item.flag ? 'Demo flag: marked configured' : 'Demo flag: not configured'} · not connected
              </p>
            </Card>
          ))}
          <Card>
            <span className="text-white font-semibold">App Version</span>
            <p className="text-white/50 text-xs mt-1">{config.appVersion ?? '—'}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
