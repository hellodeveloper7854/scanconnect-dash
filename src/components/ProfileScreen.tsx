import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import {
  Camera,
  Lock,
  Smartphone,
  Laptop,
  Sliders,
  Mail,
  MessageSquare,
  Bell,
  ChevronRight,
  Plus,
  Shield,
  Phone,
  UserCheck,
  Check,
  X
} from 'lucide-react';

interface ProfileScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
}) => {
  const [activeNav, setActiveNav] = useState('Profile');

  // Identity State
  const [fullName, setFullName] = useState(userData.fullName || 'Marcus Thorne');
  const [idNumber, setIdNumber] = useState('SCN-ADM-0982');
  const [email, setEmail] = useState(userData.email || 'm.thorne@scanme-portal.com');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  );

  // Security Toggles & State
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: 's1',
      device: 'MacBook Pro 16"',
      details: 'London, UK • Chrome v121',
      isCurrent: true,
    },
    {
      id: 's2',
      device: 'iPhone 15 Pro',
      details: 'Paris, FR • Portal App v2.4',
      isCurrent: false,
    },
  ]);

  // Preferences
  const [systemLanguage, setSystemLanguage] = useState('English (United Kingdom)');
  const [emailDigests, setEmailDigests] = useState(true);
  const [smsCriticalAlerts, setSmsCriticalAlerts] = useState(true);
  const [inAppPush, setInAppPush] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'24' | '12'>('24');

  // Emergency Contacts
  const [contacts, setContacts] = useState([
    {
      id: 'c1',
      initials: 'SH',
      name: 'Sarah Hendersen',
      role: 'Safety Operations Manager',
      phone: '+44 7700 900012',
      email: 's.hendersen@scanme.fleet',
      tag: 'PRIMARY RESPONDER',
      isPrimary: true,
    },
    {
      id: 'c2',
      initials: 'RJ',
      name: 'Robert Jenkins',
      role: 'Logistics Coordinator',
      phone: '+44 7700 900456',
      email: 'r.jenkins@scanme.fleet',
      tag: 'SECONDARY',
      isPrimary: false,
    },
  ]);

  // Add Contact Modal State
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works' || navItem === 'QR Scan') {
      onNavigate('dashboard');
    } else if (navItem === 'About' || navItem === 'about') {
      onNavigate('about');
    } else if (navItem === 'Shop' || navItem === 'shop') {
      onNavigate('shop');
    } else if (navItem === 'Contact' || navItem === 'contact') {
      onNavigate('contact');
    } else if (navItem === 'Profile' || navItem === 'profile') {
      onNavigate('profile');
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

  const handleRevokeSession = (id: string, device: string) => {
    if (confirm(`Are you sure you want to revoke the active session on ${device}?`)) {
      setSessions(sessions.filter((s) => s.id !== id));
    }
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) {
      alert('Please enter at least a name and phone number.');
      return;
    }
    const initials = newContactName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newEntry = {
      id: `c_${Date.now()}`,
      initials: initials || 'EC',
      name: newContactName,
      role: newContactRole || 'Safety Alternate',
      phone: newContactPhone,
      email: newContactEmail || 'contact@scanme.fleet',
      tag: 'SECONDARY',
      isPrimary: false,
    };

    setContacts([...contacts, newEntry]);
    setIsAddContactOpen(false);
    setNewContactName('');
    setNewContactRole('');
    setNewContactPhone('');
    setNewContactEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 font-sans antialiased">
      {/* Top Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        onNavClick={handleHeaderNav}
      />

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* HEADER TITLE */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-[#f5b800] tracking-tight font-sans">
              Profile
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Manage your administrative identity, security protocols, and safety contacts.
            </p>
          </div>

          {/* MAIN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN (IDENTITY, SECURITY, ACTIVE SESSIONS, EMERGENCY CONTACTS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 1. IDENTITY CARD */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xs border border-neutral-100/80">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  
                  {/* Profile Photo with Camera Overlay Badge */}
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl}
                      alt="Profile Avatar"
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-neutral-100 shadow-sm"
                    />
                    <button
                      onClick={handleAvatarChange}
                      title="Update profile picture"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#f5b800] hover:bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer border-2 border-white"
                    >
                      <Camera className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="w-full space-y-4">
                    {/* Row 1: Full Name & ID Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase font-mono">
                          FULL NAME
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-neutral-900 font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-[#f5b800] outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase font-mono">
                          ID NUMBER
                        </label>
                        <input
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-neutral-900 font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-[#f5b800] outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Row 2: Email Address */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase font-mono">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-neutral-900 font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-[#f5b800] outline-none transition-all"
                      />
                    </div>
                  </div>

                </div>
              </div>


              {/* 2. SECURITY & ACTIVE SESSIONS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Security Card */}
                <div className="bg-white rounded-2xl p-6 shadow-2xs border border-neutral-100/80 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f5b800]/20 text-neutral-900 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-amber-600 stroke-[2.2]" />
                    </div>
                    <h2 className="text-lg font-black text-neutral-900 font-sans">
                      Security
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {/* Change Password Row */}
                    <button
                      onClick={() => alert('Password Change Dialog: Check your email for password reset link.')}
                      className="w-full p-3.5 bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div>
                        <p className="text-xs font-bold text-neutral-900">Change Password</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Last changed 42 days ago</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Two-Factor Auth Toggle Row */}
                    <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">Two-Factor Auth</p>
                        <p className="text-[10px] text-neutral-400 font-medium">SMS and Authenticator app</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          twoFactorAuth ? 'bg-[#f5b800]' : 'bg-neutral-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Sessions Card */}
                <div className="bg-white rounded-2xl p-6 shadow-2xs border border-neutral-100/80 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f5b800]/20 text-neutral-900 flex items-center justify-center">
                      <Laptop className="w-5 h-5 text-amber-600 stroke-[2.2]" />
                    </div>
                    <h2 className="text-lg font-black text-neutral-900 font-sans">
                      Active Sessions
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="px-2 py-0.5 bg-[#f5b800] text-neutral-950 font-black text-[9px] uppercase tracking-wider rounded-md font-mono">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 font-medium">{sess.details}</p>
                        </div>

                        {!sess.isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(sess.id, sess.device)}
                            className="text-[11px] font-bold text-neutral-500 hover:text-red-600 cursor-pointer underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>


              {/* 3. EMERGENCY CONTACTS CARD */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xs border border-neutral-100/80 space-y-6">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-neutral-900 font-sans">
                      Emergency Contacts
                    </h2>
                    <p className="text-xs text-neutral-500 font-normal">
                      Automated protocols will use these in case of fleet safety alerts.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddContactOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-extrabold rounded-full transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>

                {/* Contacts 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-2xs relative space-y-4"
                    >
                      {/* Top Pill Tag */}
                      <div className="flex justify-start">
                        <span
                          className={`px-3 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase font-mono ${
                            contact.isPrimary
                              ? 'bg-[#f5b800] text-neutral-950'
                              : 'bg-neutral-200/80 text-neutral-700'
                          }`}
                        >
                          {contact.tag}
                        </span>
                      </div>

                      {/* Initials Circle & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-sm font-mono shrink-0">
                          {contact.initials}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-neutral-900">{contact.name}</h3>
                          <p className="text-[11px] text-neutral-500 font-medium">{contact.role}</p>
                        </div>
                      </div>

                      {/* Phone & Email Info */}
                      <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="font-mono text-neutral-800">{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>


            {/* RIGHT COLUMN (PREFERENCES & ENTERPRISE ADMIN CARD) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. PREFERENCES CARD */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xs border border-neutral-100/80 space-y-6">
                
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f5b800]/20 text-neutral-900 flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-amber-600 stroke-[2.2]" />
                  </div>
                  <h2 className="text-lg font-black text-neutral-900 font-sans">
                    Preferences
                  </h2>
                </div>

                {/* System Language Dropdown */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase font-mono">
                    SYSTEM LANGUAGE
                  </label>
                  <select
                    value={systemLanguage}
                    onChange={(e) => setSystemLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 font-medium text-xs focus:ring-2 focus:ring-[#f5b800] outline-none cursor-pointer"
                  >
                    <option value="English (United Kingdom)">English (United Kingdom)</option>
                    <option value="English (United States)">English (United States)</option>
                    <option value="Hindi (India)">Hindi (India)</option>
                    <option value="French (France)">French (France)</option>
                  </select>
                </div>

                {/* Global Notifications Toggles */}
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <label className="block text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase font-mono">
                    GLOBAL NOTIFICATIONS
                  </label>

                  {/* Email Digests */}
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      <span>Email Digests</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailDigests(!emailDigests)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        emailDigests ? 'bg-[#f5b800]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          emailDigests ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SMS Critical Alerts */}
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-neutral-500" />
                      <span>SMS Critical Alerts</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmsCriticalAlerts(!smsCriticalAlerts)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        smsCriticalAlerts ? 'bg-[#f5b800]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          smsCriticalAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* In-App Push */}
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-neutral-500" />
                      <span>In-App Push</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInAppPush(!inAppPush)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        inAppPush ? 'bg-[#f5b800]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          inAppPush ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Regional Format (24-Hour Time vs 12-Hour AM/PM) */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <label className="block text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase font-mono">
                    REGIONAL FORMAT
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTimeFormat('24')}
                      className={`py-3 px-2 text-center rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                        timeFormat === '24'
                          ? 'bg-white border-2 border-[#f5b800] text-neutral-950 shadow-xs'
                          : 'bg-neutral-50 border border-neutral-200 text-neutral-500'
                      }`}
                    >
                      24-Hour <br /> Time
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeFormat('12')}
                      className={`py-3 px-2 text-center rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                        timeFormat === '12'
                          ? 'bg-white border-2 border-[#f5b800] text-neutral-950 shadow-xs'
                          : 'bg-neutral-50 border border-neutral-200 text-neutral-500'
                      }`}
                    >
                      12-Hour <br /> AM/PM
                    </button>
                  </div>
                </div>

              </div>


              {/* 2. ENTERPRISE ADMIN PRO CARD */}
              <div className="bg-neutral-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6 border border-neutral-800">
                
                {/* Dot Badge */}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f5b800] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono text-neutral-300">
                    ENTERPRISE ADMIN
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white font-sans tracking-tight">
                    SCAN ME Pro
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    Unlimited vehicle monitoring and priority emergency response active.
                  </p>
                </div>

                {/* Manage Subscription Button */}
                <button
                  onClick={() => alert('Manage Subscription: Redirecting to Enterprise Billing Portal...')}
                  className="w-full py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-black text-xs rounded-full transition-all cursor-pointer shadow-md text-center"
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
                <label className="text-xs font-bold text-neutral-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f5b800]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-600">Role / Relationship</label>
                <input
                  type="text"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  placeholder="e.g. Security Supervisor"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f5b800]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-600">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900888"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f5b800]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-600">Email Address</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="e.g. alex@scanme.fleet"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f5b800]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
