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
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface ContactUsScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
}

export const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
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
    if (navItem === 'How it works' || navItem === 'QR Scan') {
      onNavigate('dashboard');
    } else if (navItem === 'About') {
      onNavigate('about');
    } else if (navItem === 'Shop') {
      onNavigate('shop');
    } else if (navItem === 'Contact') {
      onNavigate('contact');
    } else {
      alert(`Navigating to ${navItem}`);
    }
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please accept the consent checkbox to send your inquiry.');
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      alert(`Thank you, ${fullName}! Your inquiry regarding "${subject}" has been received by SCAN CONNECT support. Our team will contact you at ${email} shortly.`);
      setMessage('');
      setIsSubmitted(false);
    }, 800);
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
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* SECTION 1: HEADER & CONTACT INFO CARDS GRID */}
          <div className="space-y-10">
            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#f5b800] tracking-tight font-sans">
                Contact Us
              </h1>
              <p className="text-neutral-600 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
                Connect with the SCAN ME support team for assistance with your parking management or subscription inquiries.
              </p>
            </div>

            {/* Grid of 4 Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Email */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-neutral-100 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Yellow Icon Box */}
                  <div className="w-12 h-12 rounded-xl bg-[#f5b800] text-neutral-950 flex items-center justify-center shadow-xs">
                    <Mail className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
                    Email
                  </h3>

                  <div className="space-y-1.5 text-sm font-medium text-neutral-600">
                    <p className="hover:text-neutral-950 transition-colors">
                      <a href="mailto:info@scanme.com">info@scanme.com</a>
                    </p>
                    <p className="hover:text-neutral-950 transition-colors">
                      <a href="mailto:support@scanme.com">support@scanme.com</a>
                    </p>
                    <p className="hover:text-neutral-950 transition-colors">
                      <a href="mailto:sales@scanme.com">sales@scanme.com</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Call */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-neutral-100 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Yellow Icon Box */}
                  <div className="w-12 h-12 rounded-xl bg-[#f5b800] text-neutral-950 flex items-center justify-center shadow-xs">
                    <Phone className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
                    Call
                  </h3>

                  <div className="space-y-2">
                    <p className="text-lg font-extrabold text-neutral-900 font-mono">
                      <a href="tel:+919990961299" className="hover:underline">+91 9990961299</a>
                    </p>
                    <p className="text-xs font-semibold text-neutral-400">
                      Available 09:00 - 18:00 IST
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Connect */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-neutral-100 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Yellow Icon Box */}
                  <div className="w-12 h-12 rounded-xl bg-[#f5b800] text-neutral-950 flex items-center justify-center shadow-xs">
                    <Share2 className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
                    Connect
                  </h3>

                  {/* 4 Icon Buttons Row */}
                  <div className="flex items-center gap-3 pt-2">
                    {[
                      { icon: MessageSquare, label: 'Live Chat', action: () => alert('Launching SCAN CONNECT WhatsApp Live Assistant...') },
                      { icon: Globe, label: 'Website Portal', action: () => alert('Redirecting to official portal https://sampark.me') },
                      { icon: AtSign, label: 'Social Tags', action: () => alert('Tag us @scanconnect on X / Instagram') },
                      { icon: FileText, label: 'Download Brochure', action: () => alert('Downloading SCAN CONNECT 2026 Product Brochure PDF...') },
                    ].map(({ icon: Icon, label, action }, idx) => (
                      <button
                        key={idx}
                        onClick={action}
                        title={label}
                        className="w-11 h-11 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-950 text-neutral-700 hover:text-[#f5b800] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4: Our Offices (Spans 2 or 3 columns) */}
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-neutral-100 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Left Addresses */}
                <div className="md:col-span-7 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f5b800] text-neutral-950 flex items-center justify-center shadow-xs shrink-0">
                      <MapPin className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
                      Our Offices
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Greater Noida */}
                    <div className="space-y-1.5 border-l-2 border-[#f5b800] pl-4">
                      <h4 className="text-[11px] font-black tracking-widest text-[#d19d00] uppercase font-mono">
                        GREATER NOIDA HEAD OFFICE
                      </h4>
                      <p className="text-sm font-medium text-neutral-700 leading-snug">
                        Plot No.11, Sector - Tech Zone 4, <br />
                        Greater Noida, U.P. - 201308
                      </p>
                    </div>

                    {/* Kolkata */}
                    <div className="space-y-1.5 border-l-2 border-neutral-200 pl-4">
                      <h4 className="text-[11px] font-black tracking-widest text-[#d19d00] uppercase font-mono">
                        KOLKATA BRANCH
                      </h4>
                      <p className="text-sm font-medium text-neutral-700 leading-snug">
                        RDB Boulevard, Block EP&amp;GP <br />
                        Sector V Salt Lake, Kolkata - 700091
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Map Image Graphic */}
                <div className="md:col-span-5 bg-neutral-50 rounded-xl p-3 border border-neutral-200 overflow-hidden relative group">
                  <div className="aspect-[16/9] w-full rounded-lg bg-neutral-200 relative overflow-hidden flex items-center justify-center">
                    {/* Architectural Map Rendering */}
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                      alt="Tech Zone 4 Greater Noida Map Blueprint"
                      className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Simulated Location Marker Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-950 text-[#f5b800] px-3 py-1.5 rounded-full font-black text-[10px] tracking-wider uppercase font-mono border-2 border-[#f5b800] shadow-xl flex items-center gap-1.5 animate-bounce">
                      <Navigation className="w-3.5 h-3.5 fill-[#f5b800]" />
                      <span>TECH ZONE 4, NOIDA</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>


          {/* SECTION 2: DIRECT INQUIRY FORM */}
          <div className="max-w-3xl mx-auto pt-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-neutral-200/80 space-y-8">
              
              {/* Form Title */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight font-sans">
                  Send us a direct inquiry
                </h2>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmitInquiry} className="space-y-6">
                
                {/* 2-Column Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold tracking-wider text-neutral-500 uppercase font-mono">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kartik Ghodake"
                      className="w-full px-4 py-3 bg-[#f4f4f6] border border-neutral-200 rounded-xl text-neutral-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#f5b800] outline-none transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold tracking-wider text-neutral-500 uppercase font-mono">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kartik@example.com"
                      className="w-full px-4 py-3 bg-[#f4f4f6] border border-neutral-200 rounded-xl text-neutral-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#f5b800] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold tracking-wider text-neutral-500 uppercase font-mono">
                    SUBJECT
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f4f4f6] border border-neutral-200 rounded-xl text-neutral-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#f5b800] outline-none transition-all cursor-pointer"
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
                  <label className="block text-[11px] font-extrabold tracking-wider text-neutral-500 uppercase font-mono">
                    YOUR MESSAGE
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message or parking issue details here..."
                    className="w-full px-4 py-3 bg-[#f4f4f6] border border-neutral-200 rounded-xl text-neutral-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#f5b800] outline-none transition-all resize-none"
                  />
                </div>

                {/* Terms Consent Checkbox */}
                <div className="flex items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="consent-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#f5b800] rounded focus:ring-[#f5b800] border-neutral-300 cursor-pointer"
                  />
                  <label htmlFor="consent-checkbox" className="text-xs text-neutral-600 font-medium cursor-pointer leading-tight">
                    I agree to receive communications from SCAN ME regarding my request.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full py-4 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitted ? 'SENDING INQUIRY...' : 'SEND INQUIRY'}</span>
                </button>

                {/* Confidentiality Footer Note */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-medium pt-2">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Your information is secure and confidential.</span>
                </div>

              </form>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
