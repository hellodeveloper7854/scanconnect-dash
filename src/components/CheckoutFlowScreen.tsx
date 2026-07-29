import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import {
  ShieldCheck,
  Lock,
  Check,
  QrCode,
  CreditCard,
  Building,
  Smartphone,
  Star,
  Info,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  ShoppingBag
} from 'lucide-react';

interface CheckoutFlowScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
  onBackToProduct?: () => void;
  product?: {
    id: number;
    title: string;
    desc: string;
    price: string;
  };
}

export const CheckoutFlowScreen: React.FC<CheckoutFlowScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
  onBackToProduct,
  product
}) => {
  const [activeNav, setActiveNav] = useState('Shop');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Form states for Shipping (Step 1)
  const [fullName, setFullName] = useState(userData.fullName || 'John Doe');
  const [phone, setPhone] = useState(userData.mobileNumber || '+91 98765 43210');
  const [city, setCity] = useState(userData.city || 'Mumbai');
  const [pincode, setPincode] = useState(userData.pincode || '400001');
  const [address, setAddress] = useState(userData.address || 'House No, Street, Landmark...');

  // Form states for Payment (Step 2)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('YOUR NAME');
  const [cardExpiry, setCardExpiry] = useState('MM/YY');
  const [cardCvv, setCardCvv] = useState('');

  // Form states for Review (Step 3)
  const [rating, setRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

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
    }
  };

  const productTitle = product?.title || 'SCAN ME Pro Tag';
  const productPrice = product?.price || '₹499';

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      {/* Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* TOP STEPPER PROGRESS BAR */}
        <div className="flex items-center justify-center max-w-xl mx-auto py-4">
          {/* STEP 1 */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => step > 1 && setStep(1)}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step === 1
                  ? 'bg-[#f5b800] text-neutral-950 shadow-md ring-4 ring-amber-100'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              1
            </div>
            <span
              className={`text-[11px] font-extrabold uppercase tracking-widest ${
                step === 1 ? 'text-[#c69300]' : 'text-neutral-400'
              }`}
            >
              SHIPPING
            </span>
          </div>

          {/* LINE 1-2 */}
          <div
            className={`h-0.5 w-16 sm:w-28 mx-2 sm:mx-4 transition-colors ${
              step >= 2 ? 'bg-[#f5b800]' : 'bg-neutral-200'
            }`}
          />

          {/* STEP 2 */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => step > 2 && setStep(2)}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step === 2
                  ? 'bg-[#f5b800] text-neutral-950 shadow-md ring-4 ring-amber-100'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              2
            </div>
            <span
              className={`text-[11px] font-extrabold uppercase tracking-widest ${
                step === 2 ? 'text-[#c69300]' : 'text-neutral-400'
              }`}
            >
              PAYMENT
            </span>
          </div>

          {/* LINE 2-3 */}
          <div
            className={`h-0.5 w-16 sm:w-28 mx-2 sm:mx-4 transition-colors ${
              step === 3 ? 'bg-[#f5b800]' : 'bg-neutral-200'
            }`}
          />

          {/* STEP 3 */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step === 3
                  ? 'bg-[#f5b800] text-neutral-950 shadow-md ring-4 ring-amber-100'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              3
            </div>
            <span
              className={`text-[11px] font-extrabold uppercase tracking-widest ${
                step === 3 ? 'text-[#c69300]' : 'text-neutral-400'
              }`}
            >
              REVIEW
            </span>
          </div>
        </div>

        {/* STEP 1: SHIPPING PAGE */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Shipping Information Form */}
              <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-sans tracking-tight">
                    Shipping Information
                  </h2>
                  {onBackToProduct && (
                    <button
                      onClick={onBackToProduct}
                      className="text-xs font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800] focus:ring-1 focus:ring-[#f5b800]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800] focus:ring-1 focus:ring-[#f5b800]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800] focus:ring-1 focus:ring-[#f5b800]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="400001"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800] focus:ring-1 focus:ring-[#f5b800]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Delivery Address
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House No, Street, Landmark..."
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800] focus:ring-1 focus:ring-[#f5b800] resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-8 py-3.5 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-extrabold text-sm rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="text-xl font-black text-neutral-900 font-sans border-b border-neutral-100 pb-4">
                  Order Summary
                </h3>

                {/* Item Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#f5b800] rounded-2xl flex items-center justify-center p-2 shrink-0 border border-amber-300 shadow-xs">
                    <div className="w-10 h-10 bg-neutral-950 rounded-xl flex items-center justify-center text-amber-400">
                      <QrCode className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h4 className="font-extrabold text-sm text-neutral-900">
                      {productTitle}
                    </h4>
                    <p className="text-neutral-500 text-xs">
                      Premium Protection Plan x1
                    </p>
                    <span className="font-extrabold text-xs text-neutral-900 block">
                      {productPrice}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">{productPrice}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery</span>
                    <span className="font-extrabold text-[#c69300] uppercase tracking-wider">FREE</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-black text-neutral-950">
                    <span>Total Amount</span>
                    <span className="text-xl">{productPrice}</span>
                  </div>
                </div>

                {/* Security Box */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Your payment is protected by end-to-end encryption. By clicking complete, you agree to our Terms of Service and Refund Policy.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>SSL SECURED CHECKOUT</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>PCI DSS COMPLIANT</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-500" />
                <span>MONEY BACK GUARANTEE</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT PAGE */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900 font-sans">
                Choose Payment Method
              </h2>
              <p className="text-neutral-500 text-xs">
                All transactions are encrypted and secure.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Payment Accordion */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Option 1: Credit / Debit Card */}
                <div
                  className={`bg-white border rounded-3xl p-6 transition-all shadow-xs ${
                    paymentMethod === 'card'
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-200'
                  }`}
                >
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className="flex items-center justify-between cursor-pointer mb-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f5b800] text-neutral-950 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-base text-neutral-950">
                        Credit / Debit Card
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                      <span className="border border-neutral-200 px-1.5 py-0.5 rounded">VISA</span>
                      <span className="border border-neutral-200 px-1.5 py-0.5 rounded">MC</span>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-neutral-100">
                      
                      {/* Dark Credit Card Graphic Preview */}
                      <div className="md:col-span-5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800 text-white rounded-2xl p-4 shadow-xl border border-neutral-700/80 flex flex-col justify-between aspect-[1.58] relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                            DIGITAL ASSET KEY
                          </span>
                          <div className="w-6 h-6 rounded-full border border-neutral-600 flex items-center justify-center text-[10px]">
                            📶
                          </div>
                        </div>

                        {/* Gold Chip */}
                        <div className="w-8 h-6 bg-amber-400/90 rounded-md border border-amber-300 shadow-inner my-2" />

                        <div className="space-y-1">
                          <div className="font-mono text-sm tracking-widest font-bold text-neutral-200">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="flex justify-between items-end text-[9px] font-mono text-neutral-400 uppercase pt-1">
                            <div>
                              <span className="block text-[7px] text-neutral-500">CARD HOLDER</span>
                              <span className="font-bold text-white">{cardHolder || 'YOUR NAME'}</span>
                            </div>
                            <div>
                              <span className="block text-[7px] text-neutral-500">EXPIRES</span>
                              <span className="font-bold text-white">{cardExpiry || 'MM/YY'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Input Fields */}
                      <div className="md:col-span-7 space-y-3.5">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase">
                            Card Number
                          </label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase">
                            Card Holder Name
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="FULL NAME"
                            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 uppercase focus:outline-none focus:border-[#f5b800]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase">
                              Expiry
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="***"
                              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:border-[#f5b800]"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Option 2: UPI / Wallets */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`bg-white border rounded-3xl p-5 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-base text-neutral-950">
                        UPI / Wallets
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-500">
                      <span className="bg-neutral-100 px-2 py-1 rounded-md">GPay</span>
                      <span className="bg-neutral-100 px-2 py-1 rounded-md">PhonePe</span>
                      <span className="bg-neutral-100 px-2 py-1 rounded-md">Paytm</span>
                    </div>
                  </div>
                </div>

                {/* Option 3: Net Banking */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`bg-white border rounded-3xl p-5 cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-base text-neutral-950">
                        Net Banking
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'netbanking' && (
                    <div className="grid grid-cols-4 gap-2 pt-4 mt-3 border-t border-neutral-100">
                      {['HDFC', 'SBI', 'ICICI', 'AXIS'].map((bank) => (
                        <button
                          key={bank}
                          onClick={() => alert(`Selected ${bank} Net Banking`)}
                          className="py-2.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:border-amber-400 hover:bg-amber-50 cursor-pointer"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Payment Summary */}
              <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="text-xl font-black text-neutral-900 font-sans border-b border-neutral-100 pb-4">
                  Payment Summary
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">{productPrice}.00</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-extrabold text-[#c69300] uppercase tracking-wider">FREE</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax</span>
                    <span className="font-bold text-neutral-900">₹0.00</span>
                  </div>

                  <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-black text-neutral-950">
                    <span>Total Amount</span>
                    <span className="text-xl">{productPrice}</span>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-neutral-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-neutral-900 block">Secure Transaction</span>
                    <p className="text-[11px] text-neutral-500 leading-tight">
                      Your data is fully encrypted with bank-grade security protocols.
                    </p>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-4 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Pay Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="text-center pt-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
                    GUARANTEE SAFE CHECKOUT
                  </span>
                  <div className="flex items-center justify-center gap-2 text-xs text-neutral-300">
                    <div className="w-8 h-4 bg-neutral-200 rounded" />
                    <div className="w-8 h-4 bg-neutral-200 rounded" />
                    <div className="w-8 h-4 bg-neutral-200 rounded" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: REVIEW / THANK YOU PAGE */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center">
            
            {/* Big Yellow Check Circle */}
            <div className="w-20 h-20 bg-[#f5b800] text-neutral-950 rounded-full flex items-center justify-center mx-auto shadow-xl ring-8 ring-amber-100">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight font-sans">
                Thank You for Your Order!
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm font-medium">
                Your order <span className="font-mono font-bold text-neutral-800">#SN-082194</span> has been confirmed and is being prepared for shipment.
              </p>
            </div>

            {/* CARD 1: ORDER SUMMARY */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 text-left space-y-5 shadow-xs">
              <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase font-mono block">
                ORDER SUMMARY
              </span>

              <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#f5b800] rounded-xl flex items-center justify-center p-1.5 shrink-0">
                    <QrCode className="w-full h-full text-neutral-950" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-neutral-950">
                      {productTitle}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Industrial Grade • 256-bit Encrypted
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-neutral-950">
                  {productPrice}.00
                </span>
              </div>

              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">{productPrice}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="font-extrabold text-[#c69300] uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-950 pt-2 border-t border-neutral-100">
                  <span>Total Amount</span>
                  <span>{productPrice}.00</span>
                </div>
              </div>

              {/* Estimated Delivery Box */}
              <div className="bg-neutral-100/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-neutral-800">
                <span className="text-lg">🚚</span>
                <div>
                  <span className="font-bold block text-neutral-900">Estimated Delivery</span>
                  <span className="text-neutral-500 text-[11px]">Tuesday, Oct 24th — Thursday, Oct 26th</span>
                </div>
              </div>
            </div>

            {/* CARD 2: EXPERIENCE REVIEW */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 text-left space-y-4 shadow-xs relative overflow-hidden">
              {/* Soft top corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-full pointer-events-none" />

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-neutral-950">
                  How was your experience?
                </h3>
                <p className="text-neutral-500 text-xs">
                  We strive for perfection. Let us know how we did.
                </p>
              </div>

              {!reviewSubmitted ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
                      YOUR RATING
                    </span>
                    <div className="flex gap-1.5 text-2xl cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
                      COMMENTS (OPTIONAL)
                    </span>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell us more about your shopping experience..."
                      className="w-full p-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#f5b800] resize-none"
                    />
                  </div>

                  <button
                    onClick={() => setReviewSubmitted(true)}
                    className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl cursor-pointer active:scale-95"
                  >
                    Submit Review
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600" />
                  <span>Thank you! Your feedback has been recorded.</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="py-3.5 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>View Dashboard</span>
                <LayoutDashboard className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="py-3.5 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Continue Shopping</span>
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Security Footer Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>256 BIT SSL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>PCI COMPLIANT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-neutral-400" />
                <span>SECURE CHECKOUT</span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
