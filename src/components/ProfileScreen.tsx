import React, { useEffect, useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { OtpModal } from './OtpModal';
import { api, ApiError } from '../lib/api';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  Camera,
  Lock,
  Laptop,
  Sliders,
  Mail,
  MessageSquare,
  Bell,
  ChevronRight,
  Plus,
  Phone,
  Check,
  X,
  Pencil,
  Trash2,
  Link2
} from 'lucide-react';

interface BackendUser {
  fullName: string;
  email: string;
  mobileNumber: string | null;
  mobileVerified: boolean;
}

interface Preferences {
  systemLanguage: string;
  emailDigests: boolean;
  smsCriticalAlerts: boolean;
  inAppPush: boolean;
  timeFormat: '24' | '12';
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string | null;
  phone: string;
  email: string | null;
  isPrimary: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  systemLanguage: 'English (United Kingdom)',
  emailDigests: true,
  smsCriticalAlerts: true,
  inAppPush: false,
  timeFormat: '24',
};

interface ProfileScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
}) => {
  const [activeNav, setActiveNav] = useState('Profile');

  // Identity State — fetched from the backend, read-only until "Edit" is clicked
  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [profileError, setProfileError] = useState('');
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [draftFullName, setDraftFullName] = useState('');
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  );

  const [isLinkMobileOpen, setIsLinkMobileOpen] = useState(false);

  const loadProfile = () => {
    api
      .get<{ user: BackendUser }>('/api/auth/me')
      .then((res) => setProfile(res.user))
      .catch((err) => setProfileError(err instanceof ApiError ? err.message : 'Failed to load profile'));
  };

  useEffect(loadProfile, []);

  const handleMobileLinked = () => {
    setIsLinkMobileOpen(false);
    loadProfile();
  };

  const startEditingIdentity = () => {
    setDraftFullName(profile?.fullName ?? '');
    setIsEditingIdentity(true);
  };

  const cancelEditingIdentity = () => {
    setIsEditingIdentity(false);
  };

  const saveIdentity = async () => {
    if (!draftFullName.trim()) return;
    setIsSavingIdentity(true);
    try {
      const res = await api.patch<{ user: BackendUser }>('/api/auth/me', { fullName: draftFullName.trim() });
      setProfile(res.user);
      setIsEditingIdentity(false);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Failed to save changes');
    } finally {
      setIsSavingIdentity(false);
    }
  };

  // Security: password reset via Firebase, 2FA reflects real mobile-link status
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Preferences — fetched from backend, auto-saved on each change
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const savePreferences = async (patch: Partial<Preferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    try {
      await api.patch('/api/profile/preferences', patch);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Failed to save preference');
    }
  };

  useEffect(() => {
    api
      .get<{ preferences: Preferences }>('/api/profile/preferences')
      .then((res) => setPreferences(res.preferences))
      .catch(() => {})
      .finally(() => setPreferencesLoaded(true));
  }, []);

  // Emergency Contacts — fetched from backend, full CRUD
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const loadContacts = () => {
    api
      .get<{ contacts: EmergencyContact[] }>('/api/profile/emergency-contacts')
      .then((res) => setContacts(res.contacts))
      .catch(() => {});
  };

  useEffect(loadContacts, []);

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Remove this emergency contact?')) return;
    try {
      await api.delete(`/api/profile/emergency-contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Failed to remove contact');
    }
  };

  // Add Contact Modal State
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works') {
      onNavigate('dashboard');
    } else if (navItem === 'QR Scan') {
      onNavigate('qr-scan');
    } else if (navItem === 'About' || navItem === 'about') {
      onNavigate('about');
    } else if (navItem === 'Shop' || navItem === 'shop') {
      onNavigate('shop');
    } else if (navItem === 'Contact' || navItem === 'contact') {
      onNavigate('contact');
    } else if (navItem === 'Profile' || navItem === 'profile') {
      onNavigate('profile');
    } else if (navItem === 'My Orders') {
      onNavigate('orders');
    } else {
      alert(`Navigating to ${navItem}`);
    }
  };

  const handleAvatarChange = () => {
    const newAvatar = prompt(
      'Enter new image URL for profile photo:',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    );
    if (newAvatar) {
      setAvatarUrl(newAvatar);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, profile.email);
      alert(`Password reset instructions sent to ${profile.email}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message.replace('Firebase: ', '') : 'Failed to send reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) {
      alert('Please enter at least a name and phone number.');
      return;
    }

    setIsSavingContact(true);
    try {
      await api.post('/api/profile/emergency-contacts', {
        name: newContactName,
        role: newContactRole || undefined,
        phone: newContactPhone,
        email: newContactEmail || undefined,
      });
      loadContacts();
      setIsAddContactOpen(false);
      setNewContactName('');
      setNewContactRole('');
      setNewContactPhone('');
      setNewContactEmail('');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to add contact');
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 font-sans antialiased">
      {/* Top Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* HEADER TITLE */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl sm:leading-[48px] font-black text-[#F2BA03] tracking-[-0.4px] font-sans">
              Profile
            </h1>
            <p className="text-[#5D5F5F] text-base sm:text-lg sm:leading-[26px] max-w-4xl font-normal">
              Manage your administrative identity, security protocols, and safety contacts.
            </p>
          </div>

          {/* MAIN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (IDENTITY, SECURITY, ACTIVE SESSIONS, EMERGENCY CONTACTS) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. IDENTITY CARD */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE]">
                <div className="flex items-start justify-between mb-2">
                  {profileError && <p className="text-xs font-semibold text-red-600">{profileError}</p>}
                  <div className="flex-1" />
                  {profile && !isEditingIdentity && (
                    <button
                      onClick={startEditingIdentity}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CCC7AA] text-xs font-bold text-[#1B1C1C] hover:border-[#F2BA03] transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

                  {/* Profile Photo with Camera Overlay Badge */}
                  <div className="relative shrink-0 w-[128px] h-[128px]">
                    <div className="w-[128px] h-[128px] bg-[#EFEDED] border-2 border-[#CCC7AA] rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={avatarUrl}
                        alt="Profile Avatar"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={handleAvatarChange}
                      title="Update profile picture"
                      className="absolute -bottom-2 -right-2 w-[30px] h-[32px] rounded-lg bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer border border-white"
                    >
                      <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="w-full space-y-4">
                    {/* Row 1: Full Name & Mobile Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                          FULL NAME
                        </label>
                        {isEditingIdentity ? (
                          <input
                            type="text"
                            value={draftFullName}
                            onChange={(e) => setDraftFullName(e.target.value)}
                            placeholder="Rahul Sharma"
                            className="w-full h-[50px] px-4 bg-white border border-[#CCC7AA] rounded-lg text-[#1B1C1C] font-normal text-base focus:ring-2 focus:ring-[#F2BA03] outline-none transition-all"
                          />
                        ) : (
                          <div className="w-full h-[50px] px-4 flex items-center bg-[#F8F8F8] border border-[#EEEEEE] rounded-lg text-[#1B1C1C] font-normal text-base">
                            {profile?.fullName || '—'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                          MOBILE NUMBER
                        </label>
                        <div className="w-full h-[50px] px-4 flex items-center justify-between gap-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-lg text-[#5D5F5F] font-normal text-base">
                          <span className="font-mono truncate">{profile?.mobileNumber || 'Not linked'}</span>
                          {profile && !profile.mobileNumber && (
                            <button
                              onClick={() => setIsLinkMobileOpen(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] text-xs font-bold shrink-0 cursor-pointer"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              Link
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email Address (read-only, tied to Firebase identity) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                        EMAIL ADDRESS
                      </label>
                      <div className="w-full h-[50px] px-4 flex items-center bg-[#F8F8F8] border border-[#EEEEEE] rounded-lg text-[#5D5F5F] font-normal text-base">
                        {profile?.email || '—'}
                      </div>
                    </div>

                    {isEditingIdentity && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={cancelEditingIdentity}
                          disabled={isSavingIdentity}
                          className="flex-1 h-[46px] bg-[#EFEDED] hover:bg-neutral-200 text-[#5D5F5F] font-bold text-xs rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveIdentity}
                          disabled={isSavingIdentity || !draftFullName.trim()}
                          className="flex-1 h-[46px] bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-xs cursor-pointer disabled:opacity-60"
                        >
                          {isSavingIdentity ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>


              {/* 2. SECURITY & ACTIVE SESSIONS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* Security Card */}
                <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE] space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#676000]" />
                    </div>
                    <h2 className="text-xl font-medium text-[#1B1C1C] font-sans">
                      Security
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Change Password Row */}
                    <button
                      onClick={handlePasswordReset}
                      disabled={isSendingReset || !profile}
                      className="w-full p-3.5 bg-white border border-[#CCC7AA] rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group hover:border-[#F2BA03] disabled:opacity-60"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#1B1C1C]">Change Password</p>
                        <p className="text-xs text-[#5D5F5F] font-normal">
                          {isSendingReset ? 'Sending reset email...' : 'Sends a reset link to your email'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#1B1C1C] group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Two-Factor Auth Status Row (reflects linked+verified mobile) */}
                    <div className="p-3.5 bg-white border border-[#CCC7AA] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#1B1C1C]">Two-Factor Auth</p>
                        <p className="text-xs text-[#5D5F5F] font-normal">
                          {profile?.mobileVerified ? 'Enabled via verified mobile OTP' : 'Link a verified mobile number to enable'}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          profile?.mobileVerified ? 'bg-[#F2BA03] text-white' : 'bg-[#DBDAD9] text-[#5D5F5F]'
                        }`}
                      >
                        {profile?.mobileVerified ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Sessions Card */}
                <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE] space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Laptop className="w-5 h-5 text-[#676000]" />
                    </div>
                    <h2 className="text-xl font-medium text-[#1B1C1C] font-sans">
                      Active Sessions
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-[#CCC7AA] rounded-lg flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1B1C1C]">This device</span>
                          <span className="px-2 py-0.5 bg-[#F2BA03] text-white font-bold text-[10px] tracking-wider rounded-full uppercase">
                            CURRENT
                          </span>
                        </div>
                        <p className="text-[10px] text-[#5D5F5F] font-normal">Signed in as {profile?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>


              {/* 3. EMERGENCY CONTACTS CARD */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE] space-y-8">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-[#1B1C1C] font-sans">
                      Emergency Contacts
                    </h2>
                    <p className="text-base text-[#5D5F5F] font-normal leading-normal">
                      Automated protocols will use these in case of fleet safety alerts.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddContactOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#000000] hover:bg-neutral-800 text-white text-sm font-bold rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>

                {/* Contacts 2-Column Grid */}
                {contacts.length === 0 ? (
                  <p className="text-sm text-[#5D5F5F]">No emergency contacts added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {contacts.map((contact) => {
                      const initials = contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <div
                          key={contact.id}
                          className="bg-white rounded-xl p-6 border border-[#CCC7AA] shadow-sm relative space-y-4"
                        >
                          {/* Top Pill Tag + Delete */}
                          <div className="flex justify-between items-start">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${
                                contact.isPrimary ? 'bg-[#F2BA03] text-white' : 'bg-[#EFEDED] text-[#5D5F5F]'
                              }`}
                            >
                              {contact.isPrimary ? 'PRIMARY RESPONDER' : 'SECONDARY'}
                            </span>
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              title="Remove contact"
                              className="p-1 text-[#5D5F5F] hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Initials Circle & Name */}
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-12 h-12 rounded-full bg-[#EFEDED] flex items-center justify-center font-bold text-[#1B1C1C] text-lg shrink-0">
                              {initials || 'EC'}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-[#1B1C1C]">{contact.name}</h3>
                              <p className="text-xs text-[#5D5F5F] font-normal">{contact.role}</p>
                            </div>
                          </div>

                          {/* Phone & Email Info */}
                          <div className="pt-4 border-t border-[#CCC7AA] space-y-2 text-sm text-[#1B1C1C] font-normal">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[#676000]" />
                              <span className="text-[#1B1C1C]">{contact.phone}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#676000]" />
                                <span className="truncate text-[#1B1C1C]">{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>


            {/* RIGHT COLUMN (PREFERENCES & ENTERPRISE ADMIN CARD) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* 1. PREFERENCES CARD */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE] space-y-8">
                
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-[#676000]" />
                  </div>
                  <h2 className="text-xl font-medium text-[#1B1C1C] font-sans">
                    Preferences
                  </h2>
                </div>

                {/* System Language Dropdown */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                    SYSTEM LANGUAGE
                  </label>
                  <select
                    value={preferences.systemLanguage}
                    onChange={(e) => savePreferences({ systemLanguage: e.target.value })}
                    disabled={!preferencesLoaded}
                    className="w-full h-[50px] px-4 bg-white border border-[#CCC7AA] rounded-lg text-[#1B1C1C] font-normal text-base focus:ring-2 focus:ring-[#F2BA03] outline-none cursor-pointer"
                  >
                    <option value="English (United Kingdom)">English (United Kingdom)</option>
                    <option value="English (United States)">English (United States)</option>
                    <option value="Hindi (India)">Hindi (India)</option>
                    <option value="French (France)">French (France)</option>
                  </select>
                </div>

                {/* Global Notifications Toggles */}
                <div className="space-y-4 pt-4 border-t border-[#CCC7AA]">
                  <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                    GLOBAL NOTIFICATIONS
                  </label>

                  {/* Email Digests */}
                  <div className="flex items-center justify-between text-base font-normal text-[#1B1C1C]">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#5D5F5F]" />
                      <span>Email Digests</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => savePreferences({ emailDigests: !preferences.emailDigests })}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        preferences.emailDigests ? 'bg-[#F2BA03]' : 'bg-[#DBDAD9]'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                          preferences.emailDigests ? 'translate-x-[20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SMS Critical Alerts */}
                  <div className="flex items-center justify-between text-base font-normal text-[#1B1C1C]">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#5D5F5F]" />
                      <span>SMS Critical Alerts</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => savePreferences({ smsCriticalAlerts: !preferences.smsCriticalAlerts })}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        preferences.smsCriticalAlerts ? 'bg-[#F2BA03]' : 'bg-[#DBDAD9]'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                          preferences.smsCriticalAlerts ? 'translate-x-[20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* In-App Push */}
                  <div className="flex items-center justify-between text-base font-normal text-[#1B1C1C]">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#5D5F5F]" />
                      <span>In-App Push</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => savePreferences({ inAppPush: !preferences.inAppPush })}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        preferences.inAppPush ? 'bg-[#F2BA03]' : 'bg-[#DBDAD9]'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                          preferences.inAppPush ? 'translate-x-[20px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Regional Format (24-Hour Time vs 12-Hour AM/PM) */}
                <div className="space-y-3 pt-4 border-t border-[#CCC7AA]">
                  <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                    REGIONAL FORMAT
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => savePreferences({ timeFormat: '24' })}
                      className={`h-[52px] px-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        preferences.timeFormat === '24'
                          ? 'bg-[rgba(255,239,0,0.1)] border-2 border-[#F2BA03] text-[#1B1C1C]'
                          : 'bg-white border border-[#CCC7AA] text-[#5D5F5F]'
                      }`}
                    >
                      24-Hour <br /> Time
                    </button>

                    <button
                      type="button"
                      onClick={() => savePreferences({ timeFormat: '12' })}
                      className={`h-[52px] px-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        preferences.timeFormat === '12'
                          ? 'bg-[rgba(255,239,0,0.1)] border-2 border-[#F2BA03] text-[#1B1C1C]'
                          : 'bg-white border border-[#CCC7AA] text-[#5D5F5F]'
                      }`}
                    >
                      12-Hour <br /> AM/PM
                    </button>
                  </div>
                </div>

              </div>


              {/* 2. ENTERPRISE ADMIN PRO CARD */}
              <div className="bg-[#000000] text-white rounded-xl p-8 shadow-xl relative overflow-hidden space-y-6">
                
                {/* Dot Badge */}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F2BA03]" />
                  <span className="text-xs font-bold uppercase tracking-[1.2px] text-white">
                    ENTERPRISE ADMIN
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-normal text-white font-sans">
                    SCAN ME Pro
                  </h3>
                  <p className="text-sm text-[#DBDAD9] leading-relaxed font-normal">
                    Unlimited vehicle monitoring and priority emergency response active.
                  </p>
                </div>

                {/* Manage Subscription Button */}
                <button
                  onClick={() => alert('Manage Subscription: Redirecting to Enterprise Billing Portal...')}
                  className="w-full h-10 bg-white hover:bg-neutral-100 text-[#000000] font-bold text-sm rounded-lg transition-all cursor-pointer shadow-md text-center"
                >
                  Manage Subscription
                </button>

              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Add New Contact Modal */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-black text-neutral-900 font-sans">
                Add Emergency Contact
              </h3>
              <button
                onClick={() => setIsAddContactOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full h-[46px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#F2BA03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">Role / Relationship</label>
                <input
                  type="text"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  placeholder="e.g. Security Supervisor"
                  className="w-full h-[46px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#F2BA03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900888"
                  className="w-full h-[46px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#F2BA03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">Email Address</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="e.g. alex@scanme.fleet"
                  className="w-full h-[46px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#F2BA03]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="flex-1 py-3 bg-[#EFEDED] hover:bg-neutral-200 text-[#5D5F5F] font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="flex-1 py-3 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-xs disabled:opacity-60"
                >
                  {isSavingContact ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Mobile Number Modal */}
      <OtpModal
        isOpen={isLinkMobileOpen}
        mobileNumber=""
        onClose={() => setIsLinkMobileOpen(false)}
        onVerifySuccess={handleMobileLinked}
      />

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
