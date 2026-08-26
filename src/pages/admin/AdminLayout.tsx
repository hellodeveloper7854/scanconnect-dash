import React from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Car,
  IndianRupee,
  Phone,
  FileSpreadsheet,
  Star,
  Siren,
  QrCode,
  BarChart3,
  Package,
  Headset,
  PhoneCall,
  CreditCard,
  Ticket,
  Bell,
  FileText,
  Image,
  HelpCircle,
  ShieldCheck,
  Settings,
  LogOut,
  Handshake,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Live Data',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
      { to: '/admin/qr-codes', label: 'QR Codes', icon: QrCode },
      { to: '/admin/payments', label: 'Payments', icon: IndianRupee },
      { to: '/admin/emergency-contacts', label: 'Emergency Contacts', icon: Phone },
      { to: '/admin/reports', label: 'Reports', icon: FileSpreadsheet },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
      { to: '/admin/sos-alerts', label: 'SOS Alerts', icon: Siren },
      { to: '/admin/resellers', label: 'Resellers', icon: Handshake },
      { to: '/admin/contact-requests', label: 'Contact Requests', icon: Mail },
    ],
  },
  {
    title: 'Demo Sections',
    items: [
      { to: '/admin/qr-analytics', label: 'QR Analytics', icon: BarChart3 },
      { to: '/admin/stickers', label: 'Stickers', icon: Package },
      { to: '/admin/ivr', label: 'IVR Numbers', icon: Headset },
      { to: '/admin/call-logs', label: 'Call Logs', icon: PhoneCall },
      { to: '/admin/subscription-plans', label: 'Subscription Plans', icon: CreditCard },
      { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/cms', label: 'CMS Pages', icon: FileText },
      { to: '/admin/banners', label: 'Banners', icon: Image },
      { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
      { to: '/admin/system-config', label: 'System Config', icon: Settings },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const { isLoading, isLoggedIn, isAdmin, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex print:block print:min-h-0 print:bg-white">
      <aside className="w-64 shrink-0 border-r border-white/10 flex flex-col overflow-y-auto print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <span className="font-black uppercase tracking-wide text-[#FFED00]">ScanConnect Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-4 text-[10px] font-bold uppercase tracking-wider text-white/30">
                {section.title}
              </div>
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? 'bg-[#FFED00]/15 text-[#FFED00]' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="text-xs text-white/50 mb-3 truncate">{user?.email}</div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto print:overflow-visible">
        <Outlet />
      </main>
    </div>
  );
};
