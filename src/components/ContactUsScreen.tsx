import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import {
  Mail,
  Phone,
  MapPin,
  Share2,
  Send,
  Lock,
  MessageSquare,
  Globe,
  AtSign,
  FileText,
  ExternalLink
} from 'lucide-react';

interface ContactUsScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

// Interactive Embedded Google Map for Greater Noida Head Office
const GoogleMapEmbed = () => (
  <div className="w-full h-full min-h-[260px] rounded-xl border border-[#E3E2E2] overflow-hidden relative shadow-sm group bg-neutral-100 flex flex-col">
    {/* Map Header Bar matching Google Maps UI */}
    <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 border-b border-neutral-200 flex items-center justify-between text-xs z-10 shadow-2xs">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#EA4335] shrink-0 fill-[#EA4335]/20 stroke-[2]" />
        <span className="font-semibold text-neutral-800 truncate">Tech Zone 4, Greater Noida</span>
      </div>
      <a
        href="https://maps.google.com/?q=Tech+Zone+4+Greater+Noida+U.P.+201308"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 shrink-0"
      >
        <span>View larger map</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>

    {/* Live Google Map Iframe */}
    <div className="relative flex-1 w-full min-h-[220px] bg-neutral-200">
      <iframe
        title="Greater Noida Head Office Google Map Location"
        width="100%"
        height="100%"
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        allowFullScreen
        src="https://maps.google.com/maps?q=Tech+Zone+4+Greater+Noida+U.P.+201308&t=&z=14&ie=UTF8&iwloc=&output=embed"
      />
    </div>
  </div>
);

export const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
}) => {
  const [activeNav, setActiveNav] = useState('Contact');

  // Form State
  const [fullName, setFullName] = useState(userData.fullName || '');
  const [email, setEmail] = useState(userData.email || '');
  const [subject, setSubject] = useState('Technical Support');
  const [message, setMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to receive communications regarding your request.');
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      alert(`Thank you, ${fullName}! Your inquiry regarding "${subject}" has been submitted successfully to SCAN ME support.`);
      setMessage('');
      setIsSubmitted(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1B1C1C] font-sans antialiased">
      {/* Top Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* SECTION 1: TITLE & SUBTITLE (Frame 31 matching Image 1) */}
          <div className="space-y-4">
            <h1 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-semibold text-5xl sm:text-6xl text-[#F2BA03] tracking-tight">
              Contact Us
            </h1>
            <p className="font-['Inter',sans-serif] font-medium text-xl sm:text-2xl text-[#6B7280] leading-relaxed max-w-4xl">
              Connect with the SCAN ME support team for assistance with your parking management or subscription inquiries.
            </p>
          </div>

          {/* SECTION 2: BENTO GRID OF CONTACT CARDS (Image 4 & CSS Grid Specs) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Email Module */}
            <div className="bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col space-y-6">
              <div className="w-10 h-10 bg-[#F2BA03] rounded-[2px] text-white flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white stroke-[2.2]" />
              </div>

              <div className="space-y-4">
                <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                  Email
                </h3>

                <div className="space-y-2 font-['Manrope',sans-serif] text-base text-[#1B1C1C]">
                  <a href="mailto:info@scanme.com" className="block hover:text-[#F2BA03] transition-colors">
                    info@scanme.com
                  </a>
                  <a href="mailto:support@scanme.com" className="block hover:text-[#F2BA03] transition-colors">
                    support@scanme.com
                  </a>
                  <a href="mailto:sales@scanme.com" className="block hover:text-[#F2BA03] transition-colors">
                    sales@scanme.com
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: Call Module */}
            <div className="bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col space-y-6">
              <div className="w-10 h-10 bg-[#F2BA03] rounded-[2px] text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-white stroke-[2.2]" />
              </div>

              <div className="space-y-4">
                <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                  Call
                </h3>

                <div className="space-y-2 font-['Manrope',sans-serif]">
                  <a href="tel:+919990961299" className="text-base font-normal text-[#1B1C1C] block hover:text-[#F2BA03] transition-colors">
                    +91 9990961299
                  </a>
                  <p className="text-xs font-medium text-[#5F5E5E]">
                    Available 09:00 - 18:00 IST
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Connect Module (Aligns on right column in top row or bottom row) */}
            <div className="bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col justify-center items-center lg:items-start space-y-6 lg:row-start-2 lg:col-start-3">
              <div className="w-10 h-10 bg-[#F2BA03] rounded-[2px] text-white flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5 text-white stroke-[2.2]" />
              </div>

              <div className="space-y-6 text-center lg:text-left w-full">
                <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                  Connect
                </h3>

                {/* 4 Square Social / Action Buttons matching Image 4 */}
                <div className="flex items-center justify-center lg:justify-start gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => alert('Launching SCAN ME WhatsApp Live Assistant...')}
                    title="Live Support Chat"
                    className="w-10 h-10 border border-[#E3E2E2] rounded-none bg-white hover:bg-[#FAF9F6] hover:border-[#1B1C1C] text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Redirecting to official web portal https://sampark.me')}
                    title="Web Portal"
                    className="w-10 h-10 border border-[#E3E2E2] rounded-none bg-white hover:bg-[#FAF9F6] hover:border-[#1B1C1C] text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Globe className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Social Handles: @scanconnect / @scanme')}
                    title="Email & Social Tag"
                    className="w-10 h-10 border border-[#E3E2E2] rounded-none bg-white hover:bg-[#FAF9F6] hover:border-[#1B1C1C] text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <AtSign className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Downloading SCAN CONNECT Official Brochure...')}
                    title="Brochure PDF"
                    className="w-10 h-10 border border-[#E3E2E2] rounded-none bg-white hover:bg-[#FAF9F6] hover:border-[#1B1C1C] text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <FileText className="w-5 h-5 stroke-[1.8]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 4: Our Offices Module (Spans 2 columns on desktop matching Image 4 & CSS) */}
            <div className="lg:col-span-2 bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col space-y-6">
              <div className="w-10 h-10 bg-[#F2BA03] rounded-[2px] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white stroke-[2.2]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Left Side Office Addresses */}
                <div className="space-y-6 flex flex-col justify-between">
                  <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                    Our Offices
                  </h3>

                  <div className="space-y-6">
                    {/* Head Office Noida */}
                    <div className="space-y-1.5">
                      <h4 className="font-['Manrope',sans-serif] font-semibold text-sm tracking-[0.7px] text-[#735C00] uppercase">
                        GREATER NOIDA HEAD OFFICE
                      </h4>
                      <p className="font-['Manrope',sans-serif] font-normal text-base text-[#1B1C1C] leading-relaxed">
                        Plot No.11, Sector - Tech Zone 4, <br />
                        Greater Noida, U.P. - 201308
                      </p>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="h-[1px] bg-[#E3E2E2] opacity-50 my-2" />

                    {/* Kolkata Branch */}
                    <div className="space-y-1.5">
                      <h4 className="font-['Manrope',sans-serif] font-semibold text-sm tracking-[0.7px] text-[#735C00] uppercase">
                        KOLKATA BRANCH
                      </h4>
                      <p className="font-['Manrope',sans-serif] font-normal text-base text-[#1B1C1C] leading-relaxed">
                        RDB Boulevard, Block EP&amp;GP <br />
                        Sector V Salt Lake, Kolkata - 700091
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side Interactive Embedded Google Map */}
                <div className="w-full h-full min-h-[260px]">
                  <GoogleMapEmbed />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION 3: DIRECT INQUIRY FORM SECTION (Image 3 & CSS Specs) */}
        <div className="mt-20 bg-[rgba(245,243,243,0.3)] border-t border-[#E3E2E2] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[768px] mx-auto bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 sm:p-12 space-y-8">
            
            {/* Form Title */}
            <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-medium text-3xl sm:text-[32px] text-[#1B1C1C] text-center">
              Send us a direct inquiry
            </h2>

            {/* Form Inputs */}
            <form onSubmit={handleSubmitInquiry} className="space-y-6">
              
              {/* 2-Column Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block font-['Manrope',sans-serif] font-medium text-xs text-[#4D4635] uppercase">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-[51px] bg-[#F5F3F3] px-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#F2BA03] outline-none transition-all rounded-none"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block font-['Manrope',sans-serif] font-medium text-xs text-[#4D4635] uppercase">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[51px] bg-[#F5F3F3] px-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#F2BA03] outline-none transition-all rounded-none"
                  />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="block font-['Manrope',sans-serif] font-medium text-xs text-[#4D4635] uppercase">
                  SUBJECT
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-[51px] bg-[#F5F3F3] px-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#F2BA03] outline-none cursor-pointer transition-all rounded-none"
                >
                  <option value="Technical Support">Technical Support</option>
                  <option value="Sales & Subscription">Sales &amp; Subscription</option>
                  <option value="Reseller & Franchise">Reseller &amp; Franchise Partnership</option>
                  <option value="Bulk Order for Society">Bulk Order for Housing Society / Garage</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <label className="block font-['Manrope',sans-serif] font-medium text-xs text-[#4D4635] uppercase">
                  YOUR MESSAGE
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-[147px] bg-[#F5F3F3] p-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#F2BA03] outline-none resize-none transition-all rounded-none"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent-check"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 bg-white border border-[#E3E2E2] rounded-xs accent-[#F2BA03] cursor-pointer"
                />
                <label htmlFor="consent-check" className="font-['Manrope',sans-serif] font-medium text-xs text-[#5F5E5E] cursor-pointer select-none">
                  I agree to receive communications from SCAN ME regarding my request.
                </label>
              </div>

              {/* Send Inquiry Button */}
              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full h-12 bg-[#F2BA03] hover:bg-[#e0ac00] text-white font-['Manrope',sans-serif] font-semibold text-sm uppercase tracking-[1.4px] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4.5 h-4.5 text-white stroke-[2.2]" />
                <span>{isSubmitted ? 'SENDING INQUIRY...' : 'SEND INQUIRY'}</span>
              </button>

              {/* Confidentiality Footer Note */}
              <div className="flex items-center justify-center gap-2 text-xs font-['Manrope',sans-serif] font-medium text-[#4D4635] pt-1">
                <Lock className="w-3.5 h-3.5 text-[#4D4635]" />
                <span>Your information is secure and confidential.</span>
              </div>

            </form>
          </div>
        </div>

      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

