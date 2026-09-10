import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminUsers } from './AdminUsers';
import { AdminVehicles } from './AdminVehicles';
import { AdminQrCodes } from './AdminQrCodes';
import { AdminQrCodesTrash } from './AdminQrCodesTrash';
import { AdminCoupons } from './AdminCoupons';
import { AdminPayments } from './AdminPayments';
import { AdminEmergencyContacts } from './AdminEmergencyContacts';
import { AdminReports } from './AdminReports';
import { AdminReviews } from './AdminReviews';
import { AdminSosAlerts } from './AdminSosAlerts';
import { AdminResellers } from './AdminResellers';
import { AdminContactRequests } from './AdminContactRequests';
import {
  AdminQrAnalytics,
  AdminStickers,
  AdminIvr,
  AdminCallLogs,
  AdminSubscriptionPlans,
  AdminNotifications,
  AdminCms,
  AdminBanners,
  AdminFaqs,
  AdminAuditLogs,
  AdminSystemConfig,
} from './AdminDemoSections';
import { AdminLogin } from './AdminLogin';

export const AdminApp: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="emergency-contacts" element={<AdminEmergencyContacts />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="sos-alerts" element={<AdminSosAlerts />} />
          <Route path="resellers" element={<AdminResellers />} />
          <Route path="contact-requests" element={<AdminContactRequests />} />
          <Route path="qr-codes" element={<AdminQrCodes />} />
          <Route path="qr-codes/recover" element={<AdminQrCodesTrash />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="qr-analytics" element={<AdminQrAnalytics />} />
          <Route path="stickers" element={<AdminStickers />} />
          <Route path="ivr" element={<AdminIvr />} />
          <Route path="call-logs" element={<AdminCallLogs />} />
          <Route path="subscription-plans" element={<AdminSubscriptionPlans />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="cms" element={<AdminCms />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="faqs" element={<AdminFaqs />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="system-config" element={<AdminSystemConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
