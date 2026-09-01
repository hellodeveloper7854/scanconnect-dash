import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { api, ApiError } from '../lib/api';
import {
  Mail,
  Phone,
  MapPin,
  Share2,
  Send,
  Lock,
  MessageSquare,
  MessageCircle,
  Globe,
  AtSign,
  FileText,
  ExternalLink,
  Check,
  ShieldCheck,
  User,
  ChevronDown
} from 'lucide-react';

interface ContactUsScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

// Interactive Embedded Google Map for Jamshedpur Head Office
const GoogleMapEmbed = () => (
  <div className="w-full h-full min-h-[420px] rounded-xl border border-[#E3E2E2] overflow-hidden relative shadow-sm group bg-neutral-100 flex flex-col">
    {/* Map Header Bar matching Google Maps UI */}
    <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 border-b border-neutral-200 flex items-center justify-between text-xs z-10 shadow-2xs">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#EA4335] shrink-0 fill-[#EA4335]/20 stroke-[2]" />
        <span className="font-semibold text-neutral-800 truncate">Sonari, Jamshedpur</span>
      </div>
      <a
        href="https://maps.app.goo.gl/taLjuXVuYUhTaQ6aA"
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
        title="Jamshedpur Head Office Google Map Location"
        width="100%"
        height="100%"
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        allowFullScreen
        src="https://maps.google.com/maps?q=House+No+1265+Dispensary+Road+Sonari+Jamshedpur+East+Singhbhum+Jharkhand+831011&t=&z=15&ie=UTF8&iwloc=&output=embed"
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
  const [phone, setPhone] = useState(userData.mobileNumber || '');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to receive communications regarding your request.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/api/contact', {
        fullName,
        email,
        phone: phone.trim() || undefined,
        subject,
        message,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        alert(`Thank you, ${fullName}! Your inquiry regarding "${subject}" has been submitted successfully to Scan Connect support.`);
        setMessage('');
        setIsSubmitted(false);
      }, 800);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Why Contact Scan Connect?
  const whyContact = [
    'Product Information',
    'QR Tag Activation',
    'Order Tracking',
    'Technical Support',
    'Bulk & Corporate Orders',
    'Fleet Solutions',
    'Reseller & Franchise Opportunities',
    'Enterprise Parking Solutions',
    'Returns & Warranty Assistance',
    'General Questions',
  ];

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
          
          {/* SECTION 1: TITLE & SUBTITLE */}
          <div className="space-y-4">
            <h1 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-black text-4xl sm:text-5xl text-[#1B1C1C] tracking-tight">
              Contact Us
            </h1>
            <p className="font-['Hanken_Grotesk'] font-bold text-xl sm:text-2xl text-[#1B1C1C]">
              We&apos;re Here to Help
            </p>
            <p className="font-['Inter',sans-serif] font-normal text-lg sm:text-xl text-[#6B7280] leading-relaxed max-w-4xl">
              Have a question about Scan Connect, your QR tag, an order, or our business solutions? Our support team is ready to assist you with quick, reliable, and personalized service.
            </p>
            <p className="font-['Inter',sans-serif] font-normal text-lg sm:text-xl text-[#6B7280] leading-relaxed max-w-4xl">
              Whether you&apos;re an individual customer, reseller, fleet operator, or enterprise partner, we&apos;re just a call or message away.
            </p>
          </div>

          {/* SECTION 2: BENTO GRID OF CONTACT CARDS (Image 4 & CSS Grid Specs) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Email Module */}
            <div className="bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col space-y-6">
              <div className="w-10 h-10 bg-[#FFED00] rounded-lg text-[#1B1C1C] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#1B1C1C] stroke-[2.2]" />
              </div>

              <div className="space-y-4">
                <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                  Email Us
                </h3>
                <p className="font-['Manrope',sans-serif] text-sm text-[#5F5E5E]">
                  For faster assistance, contact the appropriate team:
                </p>

                <div className="space-y-3 font-['Manrope',sans-serif] text-sm text-[#1B1C1C]">
                  <div>
                    <span className="font-['Manrope',sans-serif] font-semibold text-xs tracking-[0.7px] text-[#9CA3AF] uppercase block">
                      General Enquiries
                    </span>
                    <a href="mailto:info@scanconnect.com" className="block hover:text-[#B58500] transition-colors text-base">
                      info@scanconnect.com
                    </a>
                  </div>
                  <div>
                    <span className="font-['Manrope',sans-serif] font-semibold text-xs tracking-[0.7px] text-[#9CA3AF] uppercase block">
                      Customer Support
                    </span>
                    <a href="mailto:support@scanconnect.com" className="block hover:text-[#B58500] transition-colors text-base">
                      support@scanconnect.com
                    </a>
                  </div>
                  <div>
                    <span className="font-['Manrope',sans-serif] font-semibold text-xs tracking-[0.7px] text-[#9CA3AF] uppercase block">
                      Sales &amp; Business Partnerships
                    </span>
                    <a href="mailto:sales@scanconnect.com" className="block hover:text-[#B58500] transition-colors text-base">
                      sales@scanconnect.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: WhatsApp Support Module */}
            <div className="bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col space-y-6">
              <div className="w-10 h-10 bg-[#FFED00] rounded-lg text-[#1B1C1C] flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-[#1B1C1C] stroke-[2.2]" />
              </div>

              <div className="space-y-4">
                <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                  Chat with our WhatsApp support team
                </h3>

                <div className="space-y-2 font-['Manrope',sans-serif]">
                  <a href="https://wa.me/919973878399" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-[#1B1C1C] block hover:text-[#B58500] transition-colors">
                    +91 99738 78399
                  </a>
                  <div className="pt-1">
                    <span className="font-['Manrope',sans-serif] font-semibold text-xs tracking-[0.7px] text-[#9CA3AF] uppercase block">
                      Support Hours
                    </span>
                    <p className="text-sm font-normal text-[#5F5E5E]">
                      Monday &ndash; Saturday <br />
                      09:00 AM &ndash; 06:00 PM (IST)
                    </p>
                  </div>
                  <p className="text-xs font-medium text-[#5F5E5E] pt-1">
                    Need immediate assistance? Our team is happy to help with product information, activation support, order tracking, and technical queries.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Connect Module (sits in row 1 beside Email Us and WhatsApp Support) */}
            <div className="bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col items-center lg:items-start space-y-6">
              <div className="w-10 h-10 bg-[#FFED00] rounded-lg text-[#1B1C1C] flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5 text-[#1B1C1C] stroke-[2.2]" />
              </div>

              <div className="space-y-6 text-center lg:text-left w-full">
                <div className="space-y-2">
                  <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                    Connect
                  </h3>
                  <p className="font-['Manrope',sans-serif] text-sm text-[#5F5E5E]">
                    Reach us instantly through live chat, our web portal, social handles, or review our terms &amp; conditions.
                  </p>
                </div>

                {/* 4 Square Social / Action Buttons matching Image 4 */}
                <div className="flex items-center justify-center lg:justify-start gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => alert('Launching Scan Connect WhatsApp Live Assistant...')}
                    title="Live Support Chat"
                    className="btn-shimmer w-10 h-10 border border-[#1B1C1C] rounded-none bg-[#1B1C1C] hover:bg-[#FFED00] hover:border-[#FFED00] hover:shadow-[0_6px_16px_rgba(242,186,3,0.4)] hover:-translate-y-0.5 text-white hover:text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Redirecting to official web portal https://scanconnect.com')}
                    title="Web Portal"
                    className="btn-shimmer w-10 h-10 border border-[#1B1C1C] rounded-none bg-[#1B1C1C] hover:bg-[#FFED00] hover:border-[#FFED00] hover:shadow-[0_6px_16px_rgba(242,186,3,0.4)] hover:-translate-y-0.5 text-white hover:text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Globe className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Social Handles: @scanconnect')}
                    title="Email & Social Tag"
                    className="btn-shimmer w-10 h-10 border border-[#1B1C1C] rounded-none bg-[#1B1C1C] hover:bg-[#FFED00] hover:border-[#FFED00] hover:shadow-[0_6px_16px_rgba(242,186,3,0.4)] hover:-translate-y-0.5 text-white hover:text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <AtSign className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  <a
                    href="/terms"
                    title="Terms & Conditions"
                    className="btn-shimmer w-10 h-10 border border-[#1B1C1C] rounded-none bg-[#1B1C1C] hover:bg-[#FFED00] hover:border-[#FFED00] hover:shadow-[0_6px_16px_rgba(242,186,3,0.4)] hover:-translate-y-0.5 text-white hover:text-[#1B1C1C] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <FileText className="w-5 h-5 stroke-[1.8]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Card 4: Our Offices Module (Spans 2 columns on desktop matching Image 4 & CSS) */}
            <div className="lg:col-span-2 bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 flex flex-col space-y-6">
              <div className="w-10 h-10 bg-[#FFED00] rounded-lg text-[#1B1C1C] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#1B1C1C] stroke-[2.2]" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
                {/* Office Addresses */}
                <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                  <h3 className="font-['Noto_Serif',serif] font-semibold text-2xl text-[#1B1C1C]">
                    Visit Our Offices
                  </h3>

                  <div className="space-y-6">
                    {/* Office Address */}
                    <div className="space-y-1.5">
                      <h4 className="font-['Manrope',sans-serif] font-semibold text-sm tracking-[0.7px] text-[#9CA3AF] uppercase">
                        Office Address
                      </h4>
                      <p className="font-['Manrope',sans-serif] font-normal text-base text-[#1B1C1C] leading-relaxed">
                        House No. 1265, Dispensary Road, <br />
                        Behind Vishwakarma Temple, Near Aerodrome, <br />
                        Sonari, Jamshedpur, East Singhbhum, <br />
                        Jharkhand &ndash; 831011
                      </p>
                    </div>

                    <a
                      href="https://maps.app.goo.gl/taLjuXVuYUhTaQ6aA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#B58500] hover:text-[#d19d00] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Google Maps</span>
                    </a>
                  </div>
                </div>

                {/* Interactive Embedded Google Map — same row as addresses on laptop/desktop, wider column and taller than before */}
                <div className="lg:col-span-3 w-full h-[420px]">
                  <GoogleMapEmbed />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION 3: DIRECT INQUIRY FORM SECTION (Image 3 & CSS Specs) */}
        <div className="mt-12 bg-[rgba(245,243,243,0.3)] border-t border-[#E3E2E2] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[768px] mx-auto bg-white border border-[#1B1C1C]/5 shadow-[0px_10px_40px_rgba(212,175,55,0.05)] rounded-2xl p-8 sm:p-12 space-y-8">
            
            {/* Form Title */}
            <div className="text-center space-y-2">
              <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-bold text-3xl sm:text-[32px] text-[#1B1C1C]">
                Send Us a Message
              </h2>
              <p className="font-['Inter',sans-serif] text-base text-[#6B7280] max-w-xl mx-auto">
                Have a specific question or need assistance? Fill out the form below, and our team will get back to you as soon as possible.
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmitInquiry} className="space-y-6">

              {/* 2-Column Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block font-['Manrope',sans-serif] font-bold text-xs text-[#1B1C1C] uppercase tracking-wide">
                    Full Name <span className="text-[#B58500]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full h-[51px] bg-[#F5F3F3] pl-11 pr-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#FFED00] outline-none transition-all rounded-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block font-['Manrope',sans-serif] font-bold text-xs text-[#1B1C1C] uppercase tracking-wide">
                    Email Address <span className="text-[#B58500]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      placeholder="Enter your email address"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[51px] bg-[#F5F3F3] pl-11 pr-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#FFED00] outline-none transition-all rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Number (Optional) */}
              <div className="space-y-2">
                <label className="block font-['Manrope',sans-serif] font-bold text-xs text-[#1B1C1C] uppercase tracking-wide">
                  Phone Number <span className="text-[#9CA3AF] font-medium normal-case">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your contact number"
                    className="w-full h-[51px] bg-[#F5F3F3] pl-11 pr-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#FFED00] outline-none transition-all rounded-none"
                  />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="block font-['Manrope',sans-serif] font-bold text-xs text-[#1B1C1C] uppercase tracking-wide">
                  Subject <span className="text-[#B58500]">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-[51px] bg-[#F5F3F3] pl-11 pr-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#FFED00] outline-none cursor-pointer transition-all rounded-none appearance-none"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Product Information">Product Information</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Order & Delivery">Order &amp; Delivery</option>
                    <option value="Activation Support">Activation Support</option>
                    <option value="Bulk Orders">Bulk Orders</option>
                    <option value="Business Partnership">Business Partnership</option>
                    <option value="Reseller Program">Reseller Program</option>
                    <option value="Franchise Enquiry">Franchise Enquiry</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <label className="block font-['Manrope',sans-serif] font-bold text-xs text-[#1B1C1C] uppercase tracking-wide">
                  Message <span className="text-[#B58500]">*</span>
                </label>
                <p className="font-['Manrope',sans-serif] text-xs text-[#5F5E5E]">
                  Tell us how we can help you. Please provide as much detail as possible so our team can assist you efficiently.
                </p>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-[147px] bg-[#F5F3F3] pl-11 pr-4 py-4 font-['Manrope',sans-serif] text-base text-[#1B1C1C] focus:bg-white focus:ring-2 focus:ring-[#FFED00] outline-none resize-none transition-all rounded-none"
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent-check"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 bg-white border border-[#E3E2E2] rounded-xs accent-[#FFED00] cursor-pointer"
                />
                <label htmlFor="consent-check" className="font-['Manrope',sans-serif] font-medium text-xs text-[#5F5E5E] cursor-pointer select-none">
                  I agree to receive communications from Scan Connect regarding my request.
                </label>
              </div>

              {submitError && (
                <p className="text-xs font-semibold text-rose-500 text-center">{submitError}</p>
              )}

              {/* Send Inquiry Button */}
              <button
                type="submit"
                disabled={isSubmitted || isSubmitting}
                className="btn-shimmer w-full h-12 bg-[#FFED00] hover:bg-[#e0ac00] hover:shadow-[0_8px_20px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-[#1B1C1C] font-['Manrope',sans-serif] font-semibold text-sm uppercase tracking-[1.4px] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4.5 h-4.5 text-[#1B1C1C] stroke-[2.2]" />
                <span>{isSubmitting || isSubmitted ? 'SENDING INQUIRY...' : 'SEND INQUIRY'}</span>
              </button>

              {/* Confidentiality Footer Note */}
              <div className="flex items-center justify-center gap-2 text-xs font-['Manrope',sans-serif] font-medium text-[#5F5E5E] pt-1">
                <Lock className="w-3.5 h-3.5 text-[#5F5E5E]" />
                <span>Your information is secure and confidential.</span>
              </div>

            </form>
          </div>
        </div>


        {/* SECTION 4: WHY CONTACT SCAN CONNECT? */}
        <section className="py-16 sm:py-20 bg-white border-t border-[#E3E2E2]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-black text-3xl sm:text-4xl text-[#1B1C1C]">
                Why Contact Scan Connect?
              </h2>
              <p className="text-[#6B7280] text-base sm:text-lg">
                Our dedicated support team can help you with:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {whyContact.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-neutral-50/70 border border-[#E3E2E2] rounded-xl p-4">
                  <Check className="w-4 h-4 text-[#1B1C1C] stroke-[3] shrink-0" />
                  <span className="font-['Hanken_Grotesk'] font-medium text-sm text-[#1B1C1C]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* SECTION 5: YOUR PRIVACY MATTERS */}
        <section className="py-16 bg-[#FAFAFA] border-t border-[#E3E2E2]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1B1C1C] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              <ShieldCheck className="w-8 h-8 text-[#FFED00]" />
            </div>

            <div className="space-y-3">
              <span className="font-bold text-xs tracking-wider uppercase text-[#B58500] block">Your Privacy Matters</span>
              <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Every inquiry is handled with the highest level of confidentiality. Your personal information is securely protected and used only to respond to your request&mdash;we never share your data with third parties.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {[
                'Data Encrypted in Transit',
                'Never Sold or Shared',
                'Used Only to Respond to You',
              ].map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-xs sm:text-sm font-semibold text-[#1B1C1C] shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#1B1C1C] stroke-[3]" />
                  {point}
                </span>
              ))}
            </div>
          </div>
        </section>


        {/* SECTION 6: CLOSING CTA */}
        <section className="py-16 sm:py-20 bg-white border-t border-[#E3E2E2] text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-4xl tracking-tight text-[#1B1C1C]">
              Let&apos;s Build Smarter &amp; Safer Mobility Together
            </h2>
            <p className="text-[#5F5E5E] text-base sm:text-lg leading-relaxed">
              Whether you&apos;re looking to secure a single vehicle or implement intelligent parking solutions for your organization, Scan Connect is here to help.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-['Hanken_Grotesk'] font-bold text-lg text-[#B58500]">
              <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4" /> Call Us</span>
              <span className="text-[#5F5E5E]">&bull;</span>
              <span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4" /> Email Us</span>
              <span className="text-[#5F5E5E]">&bull;</span>
              <span className="inline-flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Send a Message</span>
            </div>
            <p className="text-[#6B7280] text-sm">
              We&apos;re committed to delivering fast, friendly, and reliable support every step of the way.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

