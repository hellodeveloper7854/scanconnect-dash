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
  isLoggedIn?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
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
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* HEADER TITLE */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-[64px] sm:leading-[48px] font-semibold text-[#F2BA03] tracking-[-0.4px] font-sans">
              Profile
            </h1>
            <p className="text-[#5D5F5F] text-lg sm:text-[24px] sm:leading-[29px] max-w-4xl font-medium">
              Manage your administrative identity, security protocols, and safety contacts.
            </p>
          </div>

          {/* MAIN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (IDENTITY, SECURITY, ACTIVE SESSIONS, EMERGENCY CONTACTS) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. IDENTITY CARD */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE]">
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
                    {/* Row 1: Full Name & ID Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                          FULL NAME
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-[50px] px-4 bg-white border border-[#CCC7AA] rounded-lg text-[#1B1C1C] font-normal text-base focus:ring-2 focus:ring-[#F2BA03] outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                          ID NUMBER
                        </label>
                        <input
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="w-full h-[50px] px-4 bg-white border border-[#CCC7AA] rounded-lg text-[#5D5F5F] font-normal text-base focus:ring-2 focus:ring-[#F2BA03] outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Row 2: Email Address */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-[1.2px] text-[#5D5F5F] uppercase">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[50px] px-4 bg-white border border-[#CCC7AA] rounded-lg text-[#1B1C1C] font-normal text-base focus:ring-2 focus:ring-[#F2BA03] outline-none transition-all"
                      />
                    </div>
                  </div>

                </div>
              </div>


              {/* 2. SECURITY & ACTIVE SESSIONS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* Security Card */}
                <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE] space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,239,0,0.2)] flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#676000]" />
                    </div>
                    <h2 className="text-xl font-medium text-[#1B1C1C] font-sans">
                      Security
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Change Password Row */}
                    <button
                      onClick={() => alert('Password Change Dialog: Check your email for password reset link.')}
                      className="w-full p-3.5 bg-white border border-[#CCC7AA] rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group hover:border-[#F2BA03]"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#1B1C1C]">Change Password</p>
                        <p className="text-xs text-[#5D5F5F] font-normal">Last changed 42 days ago</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#1B1C1C] group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Two-Factor Auth Toggle Row */}
                    <div className="p-3.5 bg-white border border-[#CCC7AA] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#1B1C1C]">Two-Factor Auth</p>
                        <p className="text-xs text-[#5D5F5F] font-normal">SMS and Authenticator app</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                          twoFactorAuth ? 'bg-[#F2BA03]' : 'bg-[#DBDAD9]'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                            twoFactorAuth ? 'translate-x-[20px]' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Sessions Card */}
                <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE] space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,239,0,0.2)] flex items-center justify-center">
                      <Laptop className="w-5 h-5 text-[#676000]" />
                    </div>
                    <h2 className="text-xl font-medium text-[#1B1C1C] font-sans">
                      Active Sessions
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className={`p-3 bg-white border border-[#CCC7AA] rounded-lg flex items-center justify-between ${
                          !sess.isCurrent ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1B1C1C]">{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="px-2 py-0.5 bg-[#F2BA03] text-white font-bold text-[10px] tracking-wider rounded-full uppercase">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#5D5F5F] font-normal">{sess.details}</p>
                        </div>

                        {!sess.isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(sess.id, sess.device)}
                            className="text-xs font-bold text-[#1B1C1C] hover:text-red-600 cursor-pointer"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-white rounded-xl p-6 border border-[#CCC7AA] shadow-sm relative space-y-4"
                    >
                      {/* Top Pill Tag */}
                      <div className="flex justify-start">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${
                            contact.isPrimary
                              ? 'bg-[#F2BA03] text-white'
                              : 'bg-[#EFEDED] text-[#5D5F5F]'
                          }`}
                        >
                          {contact.isPrimary ? 'PRIMARY RESPONDER' : contact.tag}
                        </span>
                      </div>

                      {/* Initials Circle & Name */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="w-12 h-12 rounded-full bg-[#EFEDED] flex items-center justify-center font-bold text-[#1B1C1C] text-lg shrink-0">
                          {contact.initials}
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
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#676000]" />
                          <span className="truncate text-[#1B1C1C]">{contact.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>


            {/* RIGHT COLUMN (PREFERENCES & ENTERPRISE ADMIN CARD) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* 1. PREFERENCES CARD */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,15,15,0.05)] border border-[#EEEEEE] space-y-8">
                
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,239,0,0.2)] flex items-center justify-center">
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
                    value={systemLanguage}
                    onChange={(e) => setSystemLanguage(e.target.value)}
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
                      onClick={() => setEmailDigests(!emailDigests)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        emailDigests ? 'bg-[#F2BA03]' : 'bg-[#DBDAD9]'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                          emailDigests ? 'translate-x-[20px]' : 'translate-x-0'
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
                      onClick={() => setSmsCriticalAlerts(!smsCriticalAlerts)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        smsCriticalAlerts ? 'bg-[#F2BA03]' : 'bg-[#DBDAD9]'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                          smsCriticalAlerts ? 'translate-x-[20px]' : 'translate-x-0'
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
                      onClick={() => setInAppPush(!inAppPush)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        inAppPush ? 'bg-[#F2BA03]' : 'bg-[#DBDAD9]'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                          inAppPush ? 'translate-x-[20px]' : 'translate-x-0'
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
                      onClick={() => setTimeFormat('24')}
                      className={`h-[52px] px-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        timeFormat === '24'
                          ? 'bg-[rgba(255,239,0,0.1)] border-2 border-[#F2BA03] text-[#1B1C1C]'
                          : 'bg-white border border-[#CCC7AA] text-[#5D5F5F]'
                      }`}
                    >
                      24-Hour <br /> Time
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeFormat('12')}
                      className={`h-[52px] px-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        timeFormat === '12'
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
                  className="flex-1 py-3 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-xs"
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
