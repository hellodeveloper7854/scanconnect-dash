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
  ShoppingBag,
  MapPin,
  Truck
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
    }
  };

  const productTitle = product?.title || 'SCAN CONNECT Tag';
  const productPrice = product?.price || '₹499';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1B1C1C] font-['Hanken_Grotesk'] antialiased">
      {/* Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* PROGRESSIVE STEPPER (Figma Exact Spec) */}
        <div className="flex flex-row justify-center items-center w-full max-w-[672px] h-[72px] mx-auto px-2">
          
          {/* STEP 1: SHIPPING */}
          <div 
            className="flex flex-col items-center gap-[8px] w-[94px] h-[72px] shrink-0 cursor-pointer"
            onClick={() => step > 1 && setStep(1)}
          >
            <div
              className={`flex flex-row justify-center items-center w-[40px] h-[40px] rounded-full transition-all ${
                step === 1
                  ? 'bg-[#F2BA03] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#E9E8E7] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
              }`}
            >
              <span className={`font-['Hanken_Grotesk'] text-[16px] leading-[24px] text-center ${step === 1 ? 'font-bold text-[#736B00]' : step === 3 ? 'font-bold text-[#9CA3AF]' : 'font-bold text-[#6B7280]'}`}>
                1
              </span>
            </div>
            <div className={`flex flex-col items-start w-[94px] h-[24px]`}>
              <span className={`font-['Rubik'] font-medium text-[16px] sm:text-[18px] leading-[24px] ${step === 1 ? 'text-[#736B00]' : step === 3 ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                SHIPPING
              </span>
            </div>
          </div>

          {/* DIVIDER 1 */}
          <div className="flex flex-col items-start px-[8px] sm:px-[16px] pb-[24px] flex-1 max-w-[205px]">
            <div className="w-full h-[2px] bg-[#CCC7AA]" />
          </div>

          {/* STEP 2: PAYMENT */}
          <div 
            className="flex flex-col items-center gap-[8px] w-[93px] h-[72px] shrink-0 cursor-pointer"
            onClick={() => step > 2 && setStep(2)}
          >
            <div
              className={`flex flex-row justify-center items-center w-[40px] h-[40px] rounded-full transition-all ${
                step === 2
                  ? 'bg-[#F2BA03]'
                  : 'bg-[#E9E8E7]'
              }`}
            >
              <span className={`font-['Hanken_Grotesk'] text-[16px] leading-[24px] text-center ${step === 2 ? 'font-normal text-[#5F5E5E]' : step === 3 ? 'font-normal text-[#5F5E5E]' : 'font-normal text-[#5F5E5E]'}`}>
                2
              </span>
            </div>
            <div className={`flex flex-col items-start w-[93px] h-[24px] ${step === 2 ? '' : 'opacity-50'}`}>
              <span className={`font-['Rubik'] font-medium text-[16px] sm:text-[18px] leading-[24px] ${step === 2 ? 'text-[#736B00]' : 'text-[#5F5E5E]'}`}>
                PAYMENT
              </span>
            </div>
          </div>

          {/* DIVIDER 2 */}
          <div className="flex flex-col items-start px-[8px] sm:px-[16px] pb-[24px] flex-1 max-w-[205px]">
            <div className="w-full h-[2px] bg-[#CCC7AA]" />
          </div>

          {/* STEP 3: REVIEW */}
          <div className="flex flex-col items-center gap-[8px] w-[75px] h-[72px] shrink-0 cursor-pointer">
            <div
              className={`flex flex-row justify-center items-center w-[40px] h-[40px] rounded-full transition-all ${
                step === 3
                  ? 'bg-[#F2BA03]'
                  : 'bg-[#E9E8E7]'
              }`}
            >
              <span className={`font-['Hanken_Grotesk'] text-[16px] leading-[24px] text-center ${step === 3 ? 'font-normal text-[#736B00]' : 'font-normal text-[#5F5E5E]'}`}>
                3
              </span>
            </div>
            <div className={`flex flex-col items-start w-[75px] h-[24px] ${step === 3 ? '' : 'opacity-50'}`}>
              <span className={`font-['Rubik'] font-medium text-[16px] sm:text-[18px] leading-[24px] ${step === 3 ? 'text-[#736B00]' : 'text-[#5F5E5E]'}`}>
                REVIEW
              </span>
            </div>
          </div>

        </div>

        {/* FRAME 54: MAIN STEP 1 CONTENT */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] items-start">
              
              {/* LEFT COLUMN: FORM SECTION */}
              <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#CCC7AA] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-6 sm:p-8 space-y-8">
                
                {/* Heading 2 */}
                <div className="flex items-center justify-between">
                  <h2 className="font-['Rubik'] font-medium text-[20px] sm:text-[22px] leading-[28px] text-[#1B1C1C]">
                    Shipping Information
                  </h2>
                  {onBackToProduct && (
                    <button
                      onClick={onBackToProduct}
                      className="text-xs font-bold text-[#5F5E5E] hover:text-[#1B1C1C] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}
                </div>

                {/* Form Fields Grid */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[21px] gap-y-[16px]">
                    
                    {/* Frame 49: Full Name */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-[42px] bg-[#FFFFFF] border border-[#6B7280] rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
                      />
                    </div>

                    {/* Frame 50: Phone Number */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-[42px] bg-[#FFFFFF] border border-[#6B7280] rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
                      />
                    </div>

                    {/* Frame 51: City */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full h-[42px] bg-[#FFFFFF] border border-[#6B7280] rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
                      />
                    </div>

                    {/* Frame 52: Pincode */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="400001"
                        className="w-full h-[42px] bg-[#FFFFFF] border border-[#6B7280] rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
                      />
                    </div>
                  </div>

                  {/* Frame 53: Delivery Address */}
                  <div className="flex flex-col gap-[10px] w-full pt-1">
                    <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House No, Street, Landmark..."
                      className="w-full h-[57px] bg-[#FFFFFF] border border-[#6B7280] rounded-[5px] px-[13px] py-[10px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03] resize-none overflow-y-auto"
                    />
                  </div>
                </div>

                {/* Continue to Payment Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full sm:w-[232.2px] h-[56px] bg-[#F2BA03] hover:bg-[#e0ac00] rounded-[8px] flex items-center justify-center font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#FFFFFF] shadow-xs transition-colors cursor-pointer active:scale-95"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: ASIDE ORDER SUMMARY SECTION */}
              <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#CCC7AA] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[31px_32px_32px] flex flex-col gap-[24px]">
                
                {/* Heading 3 */}
                <h3 className="font-['Rubik'] font-medium text-[18px] sm:text-[20px] leading-[26px] text-[#1B1C1C]">
                  Order Summary
                </h3>

                {/* Item Card Container */}
                <div className="flex flex-row items-center gap-[16px] w-full">
                  {/* Thumbnail */}
                  <div className="w-[80px] h-[80px] bg-[#EFEDED] border border-[#CCC7AA] rounded-[8px] flex items-center justify-center shrink-0 p-2">
                    <div className="w-12 h-12 bg-[#0F0F0F] rounded-lg p-1.5 flex items-center justify-center">
                      <QrCode className="w-full h-full text-[#F2BA03]" />
                    </div>
                  </div>

                  {/* Title & Price Details */}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[18px] leading-[24px] text-[#1B1C1C]">
                      {productTitle}
                    </h4>
                    <p className="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[20px] text-[#5F5E5E]">
                      Premium Protection Tag x1
                    </p>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#F2BA03] block">
                      {productPrice}
                    </span>
                  </div>
                </div>

                {/* Horizontal Border Breakdown */}
                <div className="border-t border-[#CCC7AA] pt-[24px] space-y-[16px]">
                  <div className="flex justify-between items-center">
                    <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      Subtotal
                    </span>
                    <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      {productPrice}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      Shipping
                    </span>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#F2BA03]">
                      FREE
                    </span>
                  </div>
                </div>

                {/* Total Row */}
                <div className="border-t border-[#CCC7AA] pt-[16px] flex justify-between items-center">
                  <span className="font-['Hanken_Grotesk'] font-bold text-[18px] leading-[29px] text-[#1B1C1C]">
                    Total Amount
                  </span>
                  <span className="font-['Hanken_Grotesk'] font-bold text-[24px] leading-[32px] text-[#1B1C1C]">
                    {productPrice}
                  </span>
                </div>

                {/* Overlay Alert Box */}
                <div className="bg-[rgba(255,239,0,0.1)] border border-[rgba(103,96,0,0.2)] rounded-[8px] p-[16px] flex flex-row items-start gap-[12px]">
                  <Info className="w-[20px] h-[20px] text-[#F2BA03] shrink-0 mt-[2px]" />
                  <p className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[20px] text-[#736B00]">
                    Your payment is protected by end-to-end encryption. By clicking complete, you agree to our Terms of Service and Refund Policy.
                  </p>
                </div>

              </div>

            </div>

            {/* TRUST INDICATORS SECTION */}
            <div className="flex flex-wrap items-center justify-center gap-[32px] opacity-70 pt-[16px]">
              <div className="flex items-center gap-[8px]">
                <Lock className="w-[16px] h-[20px] text-[#F2BA03]" />
                <span className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[16px] text-[#1B1C1C]">
                  SSL SECURED CHECKOUT
                </span>
              </div>

              <div className="flex items-center gap-[8px]">
                <ShieldCheck className="w-[16px] h-[20px] text-[#F2BA03]" />
                <span className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[16px] text-[#1B1C1C]">
                  PCI DSS COMPLIANT
                </span>
              </div>

              <div className="flex items-center gap-[8px]">
                <Check className="w-[22px] h-[22px] text-[#F2BA03]" />
                <span className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[16px] text-[#1B1C1C]">
                  MONEY BACK GUARANTEE
                </span>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: PAYMENT PAGE */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-1">
              <h2 className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                Choose Payment Method
              </h2>
              <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                All transactions are encrypted and secure.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] items-start">
              
              {/* Left Column: Payment Accordion Options */}
              <div className="lg:col-span-7 space-y-[16px]">
                
                {/* Option 1: Credit / Debit Card */}
                <div
                  className={`bg-[#FFFFFF] border rounded-[12px] p-[24px] transition-all shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] ${
                    paymentMethod === 'card'
                      ? 'border-[#CCC7AA] ring-1 ring-[#F2BA03]'
                      : 'border-[#CCC7AA]'
                  }`}
                >
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[#F2BA03] flex items-center justify-center shrink-0">
                        <CreditCard className="w-[20px] h-[16px] text-[#FFFFFF]" />
                      </div>
                      <span className="font-['Rubik'] font-medium text-[20px] leading-[24px] text-[#1B1C1C]">
                        Credit / Debit Card
                      </span>
                    </div>

                    <div className="flex items-center gap-[8px]">
                      <span className="w-[40px] h-[24px] bg-[#E9E8E7] rounded-[4px] flex items-center justify-center font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] text-[#5F5E5E]">
                        VISA
                      </span>
                      <span className="w-[40px] h-[24px] bg-[#E9E8E7] rounded-[4px] flex items-center justify-center font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] text-[#5F5E5E]">
                        MC
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px] pt-[24px] mt-[24px] border-t border-[#CCC7AA]">
                      
                      {/* Dark Credit Card Graphic Preview */}
                      <div className="md:col-span-5 bg-gradient-to-br from-[#303031] to-[#1E1E1E] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] text-white rounded-[16px] p-[24px] flex flex-col justify-between aspect-[1.51] relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-['Hanken_Grotesk'] font-normal text-[10px] leading-[15px] text-white opacity-70 uppercase">
                            SCAN CONNECT KEY
                          </span>
                          <div className="w-5 h-5 opacity-50 flex items-center justify-center text-[10px]">
                            📶
                          </div>
                        </div>

                        {/* Gold Chip */}
                        <div className="w-[48px] h-[32px] bg-[rgba(255,239,0,0.2)] rounded-[6px] my-2" />

                        <div className="space-y-2">
                          <div className="font-['Liberation_Mono',monospace] font-normal text-[18px] sm:text-[20px] leading-[28px] tracking-[4px] text-white">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="flex justify-between items-end text-white">
                            <div>
                              <span className="block font-['Hanken_Grotesk'] font-normal text-[8px] leading-[12px] uppercase opacity-50">
                                CARD HOLDER
                              </span>
                              <span className="font-['Hanken_Grotesk'] font-semibold text-[12px] leading-[16px] tracking-[0.6px] block">
                                {cardHolder || 'FULL NAME'}
                              </span>
                            </div>
                            <div>
                              <span className="block font-['Hanken_Grotesk'] font-normal text-[8px] leading-[12px] uppercase opacity-50">
                                EXPIRES
                              </span>
                              <span className="font-['Hanken_Grotesk'] font-semibold text-[12px] leading-[16px] block">
                                {cardExpiry || 'MM/YY'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Input Fields */}
                      <div className="md:col-span-7 space-y-[16px]">
                        <div className="flex flex-col gap-[4px]">
                          <label className="font-['Hanken_Grotesk'] font-normal text-[10px] leading-[15px] text-[#5F5E5E]">
                            CARD NUMBER
                          </label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            className="w-full h-[50px] bg-[#FFFFFF] border border-[#CCC7AA] rounded-[8px] px-[16px] font-['Liberation_Mono',monospace] font-normal text-[16px] leading-[18px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
                          />
                        </div>

                        <div className="flex flex-col gap-[4px]">
                          <label className="font-['Hanken_Grotesk'] font-normal text-[10px] leading-[15px] text-[#5F5E5E]">
                            CARD HOLDER NAME
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="FULL NAME"
                            className="w-full h-[50px] bg-[#FFFFFF] border border-[#CCC7AA] rounded-[8px] px-[16px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] uppercase text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-[16px]">
                          <div className="flex flex-col gap-[4px]">
                            <label className="font-['Hanken_Grotesk'] font-normal text-[10px] leading-[15px] text-[#5F5E5E]">
                              EXPIRY
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full h-[50px] bg-[#FFFFFF] border border-[#CCC7AA] rounded-[8px] px-[16px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
                            />
                          </div>

                          <div className="flex flex-col gap-[4px]">
                            <label className="font-['Hanken_Grotesk'] font-normal text-[10px] leading-[15px] text-[#5F5E5E]">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full h-[50px] bg-[#FFFFFF] border border-[#CCC7AA] rounded-[8px] px-[16px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03]"
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
                  className={`bg-[#FFFFFF] border rounded-[12px] p-[24px] transition-all shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-[#CCC7AA] ring-1 ring-[#F2BA03]'
                      : 'border-[#CCC7AA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[#E9E8E7] flex items-center justify-center shrink-0">
                        <Smartphone className="w-[19px] h-[18px] text-[#5F5E5E]" />
                      </div>
                      <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        UPI / Wallets
                      </span>
                    </div>

                    <div className="flex items-center gap-[16px]">
                      <span className="px-[8px] py-[4px] bg-[#E9E8E7] rounded-[4px] font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] text-[#5F5E5E]">
                        GPay
                      </span>
                      <span className="px-[8px] py-[4px] bg-[#E9E8E7] rounded-[4px] font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] text-[#5F5E5E]">
                        PhonePe
                      </span>
                      <span className="px-[8px] py-[4px] bg-[#E9E8E7] rounded-[4px] font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] text-[#5F5E5E]">
                        Paytm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option 3: Net Banking */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`bg-[#FFFFFF] border rounded-[12px] p-[24px] transition-all shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#CCC7AA] ring-1 ring-[#F2BA03]'
                      : 'border-[#CCC7AA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[#E9E8E7] flex items-center justify-center shrink-0">
                        <Building className="w-[20px] h-[20px] text-[#5F5E5E]" />
                      </div>
                      <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        Net Banking
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'netbanking' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-[16px] pt-[24px] mt-[24px] border-t border-[#CCC7AA]">
                      {['HDFC', 'SBI', 'ICICI', 'AXIS'].map((bank) => (
                        <button
                          key={bank}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Selected ${bank} Net Banking`);
                          }}
                          className="h-[48px] border border-[#CCC7AA] rounded-[8px] flex items-center justify-center font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] text-[#5F5E5E] hover:border-[#F2BA03] hover:bg-[#F2BA03]/10 cursor-pointer transition-colors"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Payment Summary Sidebar */}
              <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#CCC7AA] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-[16px] p-[33px] flex flex-col gap-[24px] relative">
                
                {/* Heading 2 */}
                <h3 className="font-['Rubik'] font-medium text-[16px] leading-[24px] text-[#1B1C1C]">
                  Payment Summary
                </h3>

                {/* Subtotal, Shipping, Tax Breakdown */}
                <div className="space-y-[16px] font-['Hanken_Grotesk'] text-[16px] leading-[24px]">
                  <div className="flex justify-between text-[#5F5E5E]">
                    <span>Subtotal</span>
                    <span>₹499.00</span>
                  </div>
                  <div className="flex justify-between text-[#5F5E5E]">
                    <span>Shipping</span>
                    <span className="font-bold text-[#676000]">FREE</span>
                  </div>
                  <div className="flex justify-between text-[#5F5E5E]">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>

                  <div className="border-t border-[#CCC7AA] pt-[16px] flex justify-between items-end text-[#1B1C1C]">
                    <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[24px]">
                      Total Amount
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px]">
                      {productPrice}
                    </span>
                  </div>
                </div>

                {/* Overlay Alert Box */}
                <div className="bg-[#F5F3F3] rounded-[12px] p-[16px] flex flex-row items-start gap-[12px]">
                  <ShieldCheck className="w-[16px] h-[20px] text-[#676000] shrink-0 mt-[1px]" />
                  <div className="space-y-[2px]">
                    <span className="font-['Hanken_Grotesk'] font-bold text-[11px] leading-[14px] text-[#1B1C1C] block">
                      Secure Transaction
                    </span>
                    <p className="font-['Hanken_Grotesk'] font-normal text-[11px] leading-[14px] text-[#5F5E5E]">
                      Your data is fully encrypted with bank-grade security protocols.
                    </p>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button
                  onClick={() => setStep(3)}
                  className="w-full h-[68px] bg-[#F2BA03] hover:bg-[#e0ac00] rounded-[12px] flex items-center justify-center gap-[8px] font-['Hanken_Grotesk'] font-bold text-[18px] leading-[28px] text-[#736B00] shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  <span>Pay Now</span>
                  <ArrowRight className="w-[16px] h-[16px] text-[#736B00]" />
                </button>

                {/* Footer Badges Info */}
                <div className="space-y-[12px] text-center pt-[8px]">
                  <span className="font-['Hanken_Grotesk'] font-normal text-[10px] leading-[15px] tracking-[1px] text-[#5F5E5E] uppercase block">
                    GUARANTEED SAFE CHECKOUT
                  </span>
                  <div className="flex items-center justify-center gap-[16px]">
                    <div className="w-[32px] h-[16px] bg-[#E9E8E7] rounded-[4px]" />
                    <div className="w-[32px] h-[16px] bg-[#E9E8E7] rounded-[4px]" />
                    <div className="w-[32px] h-[16px] bg-[#E9E8E7] rounded-[4px]" />
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* STEP 3: REVIEW / THANK YOU PAGE */}
        {step === 3 && (
          <div className="max-w-[672px] mx-auto space-y-[32px] animate-fade-in px-2 sm:px-4 pt-2">
            
            {/* SUCCESS CELEBRATION SECTION */}
            <div className="flex flex-col items-center text-center gap-[16px] w-full">
              {/* Background badge icon with orbit ring */}
              <div className="relative w-[96px] h-[88px] sm:w-[96px] sm:h-[96px] bg-[#F2BA03] rounded-full flex items-center justify-center shrink-0">
                <Check className="w-[40px] h-[40px] text-white stroke-[3]" />
                <div className="absolute inset-0 border-2 border-[#F2BA03] opacity-20 rounded-full scale-105 pointer-events-none" />
              </div>

              {/* Heading 1 */}
              <div className="flex flex-col items-center">
                <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[24px] sm:text-[30px] leading-[32px] sm:leading-[38px] tracking-[-0.4px] text-[#1B1C1C]">
                  Thank You for Your Order!
                </h1>
              </div>

              {/* Subtext Container */}
              <div>
                <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                  Your order <span className="font-bold text-[#1B1C1C]">#SN-082194</span> has been confirmed and is being prepared for shipment.
                </p>
              </div>
            </div>

            {/* SECTION: ORDER SUMMARY CARD */}
            <div className="bg-[#FFFFFF] border border-[#E4E2E2] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[24px] sm:p-[48px_32px_32px] space-y-[24px]">
              
              {/* Heading 2 */}
              <span className="font-['Hanken_Grotesk'] font-bold text-[12px] leading-[12px] tracking-[1.2px] uppercase text-[#5F5E5E] block">
                ORDER SUMMARY
              </span>

              {/* Product item row */}
              <div className="flex flex-row items-center gap-[24px] pb-[24px] border-b border-[#EFEDED]">
                {/* Thumbnail Background */}
                <div className="w-[80px] h-[80px] bg-[#F5F3F3] rounded-[8px] flex items-center justify-center p-[8px] shrink-0">
                  <QrCode className="w-[48px] h-[48px] text-[#1B1C1C]" />
                </div>

                {/* Details Container */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-[16px]">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] sm:text-[20px] leading-[26px] text-[#1B1C1C] truncate">
                      {productTitle}
                    </h3>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#1B1C1C] shrink-0">
                      {productPrice}
                    </span>
                  </div>
                  <p className="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[20px] text-[#5F5E5E] mt-[4px]">
                    Industrial Grade &bull; 256-bit Encrypted
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-[12px] pt-[8px] font-['Hanken_Grotesk'] text-[16px] leading-[24px]">
                <div className="flex justify-between text-[#5F5E5E]">
                  <span>Subtotal</span>
                  <span className="text-[#5F5E5E]">{productPrice}</span>
                </div>
                <div className="flex justify-between text-[#5F5E5E]">
                  <span>Shipping</span>
                  <span className="font-bold text-[#D7CA00]">FREE</span>
                </div>
                <div className="flex justify-between text-[#1B1C1C] pt-[8px] border-t border-[#EFEDED] font-bold text-[18px] leading-[28px]">
                  <span>Total</span>
                  <span>{productPrice}</span>
                </div>
              </div>

              {/* Delivery Address Container */}
              <div className="bg-[#F5F3F3] rounded-[8px] p-[16px] flex items-center gap-[16px]">
                <MapPin className="w-[22px] h-[20px] text-[#676000] shrink-0" />
                <div className="space-y-[2px]">
                  <span className="font-['Hanken_Grotesk'] font-bold text-[14px] leading-[20px] text-[#1B1C1C] block">
                    Delivery Address
                  </span>
                  <p className="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[20px] text-[#5F5E5E]">
                    {address || userData.address || 'House No 123, Street Name, Mumbai 400001'}
                  </p>
                </div>
              </div>

            </div>

            {/* SECTION: CUSTOMER FEEDBACK */}
            <div className="bg-[#FFFFFF] border border-[#E4E2E2] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[24px] sm:p-[31px_32px_32px] relative overflow-hidden space-y-[24px]">
              
              {/* Visual Accent */}
              <div className="absolute top-[-63px] right-[-63px] w-[128px] h-[128px] bg-[rgba(255,239,0,0.1)] rounded-bl-full pointer-events-none" />

              {/* Heading & Subtitle */}
              <div className="space-y-[8px]">
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] sm:text-[20px] leading-[26px] text-[#1B1C1C]">
                  How was your experience?
                </h2>
                <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                  We strive for perfection. Let us know how we did.
                </p>
              </div>

              {!reviewSubmitted ? (
                <div className="space-y-[24px] pt-[8px]">
                  {/* Rating selection */}
                  <div>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#5F5E5E] block mb-[12px] uppercase">
                      YOUR RATING
                    </span>
                    <div className="flex items-center gap-[8px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-[30px] h-[28.5px] ${
                              star <= rating
                                ? 'fill-[#F2BA03] text-[#F2BA03]'
                                : 'fill-[#E4E2E2] text-[#E4E2E2]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment box */}
                  <div>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#5F5E5E] block mb-[8px] uppercase">
                      COMMENTS (OPTIONAL)
                    </span>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell us more about your shopping experience..."
                      className="w-full h-[96px] bg-[#FFFFFF] border border-[#E4E2E2] rounded-[8px] p-[16px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F2BA03] resize-none"
                    />
                  </div>

                  {/* Submit Feedback Button */}
                  <button
                    onClick={() => setReviewSubmitted(true)}
                    className="w-full sm:w-[170px] h-[48px] bg-[#1B1C1C] hover:bg-neutral-800 text-white font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] rounded-[8px] transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                  >
                    Submit Feedback
                  </button>
                </div>
              ) : (
                <div className="bg-[#F2BA03]/10 border border-[#F2BA03]/30 rounded-[12px] p-[16px] font-['Hanken_Grotesk'] font-bold text-[14px] text-[#1B1C1C] flex items-center gap-[8px]">
                  <Check className="w-[18px] h-[18px] text-[#736B00]" />
                  <span>Thank you! Your feedback has been recorded.</span>
                </div>
              )}

            </div>

            {/* ACTIONS ROW */}
            <div className="flex flex-col sm:flex-row items-center gap-[16px] pb-[32px]">
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-[302px] flex-1 h-[60px] bg-[#F2BA03] hover:bg-[#e0ac00] rounded-[8px] flex items-center justify-center gap-[8px] font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#FFFFFF] shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <span>View Dashboard</span>
                <LayoutDashboard className="w-[18px] h-[18px] text-white" />
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-[300px] flex-1 h-[60px] border-2 border-[#1B1C1C] rounded-[8px] flex items-center justify-center gap-[8px] font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#1B1C1C] hover:bg-neutral-50 transition-colors cursor-pointer active:scale-95"
              >
                <span>Continue Shopping</span>
                <ShoppingBag className="w-[16px] h-[16px] text-[#1B1C1C]" />
              </button>
            </div>

            {/* FOOTER TRUST MARKERS */}
            <div className="border-t border-[#EFEDED] pt-[32px]">
              <div className="flex flex-row justify-center items-center gap-[24px] sm:gap-[32px] opacity-60 text-center flex-wrap">
                <div className="flex flex-col items-center gap-[4px]">
                  <Lock className="w-[20px] h-[26px] text-[#1B1C1C]" />
                  <span className="font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] tracking-[1px] text-[#1B1C1C] uppercase">
                    SSL SECURED
                  </span>
                </div>
                <div className="flex flex-col items-center gap-[4px]">
                  <Truck className="w-[25px] h-[25px] text-[#1B1C1C]" />
                  <span className="font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] tracking-[1px] text-[#1B1C1C] uppercase">
                    EXPRESS SHIPPING
                  </span>
                </div>
                <div className="flex flex-col items-center gap-[4px]">
                  <ShieldCheck className="w-[27px] h-[26px] text-[#1B1C1C]" />
                  <span className="font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] tracking-[1px] text-[#1B1C1C] uppercase">
                    24/7 SUPPORT
                  </span>
                </div>
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

