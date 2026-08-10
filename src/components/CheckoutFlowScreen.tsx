import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { api, ApiError } from '../lib/api';
import qrImage from '../assets/images/qrimage.png';
import {
  ShieldCheck,
  Lock,
  Check,
  Star,
  Info,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  ShoppingBag,
  Radio,
  Truck
} from 'lucide-react';

// Temporary: checkout always charges this seeded product until the Shop
// catalog is wired up to real backend products with matching UUIDs.
const CHECKOUT_PRODUCT_ID = '5ab6e299-8795-4cfa-8293-d315bb75e98a';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface OrderRecord {
  id: string;
  totalInPaise: number;
  status: string;
  items: { quantity: number; product: { name: string; priceInPaise: number } }[];
}

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
  const [fullName, setFullName] = useState(userData.fullName || '');
  const [phone, setPhone] = useState(userData.mobileNumber || '');
  const [city, setCity] = useState(userData.city || '');
  const [pincode, setPincode] = useState(userData.pincode || '');
  const [address, setAddress] = useState(userData.address || '');

  // Payment (Step 2) — Razorpay handles the actual payment method selection
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  // Form states for Review (Step 3)
  const [rating, setRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleSubmitReview = async () => {
    if (!completedOrder) return;
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      await api.post('/api/reviews', {
        orderId: completedOrder.id,
        rating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewSubmitted(true);
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
    }
  };

  const handlePayNow = async () => {
    setPaymentError('');
    setIsProcessingPayment(true);
    try {
      const created = await api.post<{
        order: OrderRecord;
        razorpayOrderId: string;
        razorpayKeyId: string;
        amount: number;
        currency: string;
      }>('/api/orders', { items: [{ productId: CHECKOUT_PRODUCT_ID, quantity: 1 }] });

      const razorpay = new window.Razorpay({
        key: created.razorpayKeyId,
        order_id: created.razorpayOrderId,
        amount: created.amount,
        currency: created.currency,
        name: 'ScanConnect',
        description: 'QR Sticker Order',
        prefill: {
          name: fullName || userData.fullName,
          contact: phone || userData.mobileNumber,
          email: userData.email,
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verified = await api.post<{ order: OrderRecord }>('/api/orders/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setCompletedOrder(verified.order);
            setStep(3);
          } catch (err) {
            setPaymentError(err instanceof ApiError ? err.message : 'Payment verification failed. Please contact support.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false),
        },
        theme: { color: '#F2BA03' },
      });

      razorpay.open();
    } catch (err) {
      setPaymentError(err instanceof ApiError ? err.message : 'Failed to start payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const productTitle = product?.title || 'SCAN CONNECT Tag';
  const productPrice = product?.price || '₹499';
  const orderTotalDisplay = completedOrder
    ? (completedOrder.totalInPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    : productPrice;

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
                  <h2 className="font-['Rubik'] font-bold text-[26px] sm:text-[30px] leading-[36px] text-[#1B1C1C]">
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
                <h3 className="font-['Rubik'] font-bold text-[26px] sm:text-[30px] leading-[36px] text-[#1B1C1C]">
                  Order Summary
                </h3>

                {/* Item Card Container */}
                <div className="flex flex-row items-center gap-[16px] w-full">
                  {/* Thumbnail */}
                  <div className="w-[80px] h-[80px] bg-[#F5F3F3] rounded-[8px] overflow-hidden shrink-0">
                    <img src={qrImage} alt={productTitle} className="w-full h-full object-cover" />
                  </div>

                  {/* Title & Price Details */}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[18px] leading-[24px] text-[#1B1C1C]">
                      {productTitle}
                    </h4>
                    <p className="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[20px] text-[#5F5E5E]">
                      Premium Protection Plan x1
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
              <h2 className="font-['Plus_Jakarta_Sans'] font-normal text-[24px] sm:text-[28px] leading-[32px] text-[#1B1C1C]">
                Complete Your Payment
              </h2>
              <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                All transactions are encrypted and secure. You&apos;ll choose your payment method on the next screen.
              </p>
            </div>

            <div className="max-w-[480px] mx-auto w-full">
              <div className="bg-[#FFFFFF] border border-[#CCC7AA] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-[16px] p-[33px] flex flex-col gap-[24px] relative">

                {/* Heading 2 */}
                <h3 className="font-['Rubik'] font-bold text-[26px] sm:text-[28px] leading-[36px] text-[#1B1C1C]">
                  Payment Summary
                </h3>

                {/* Subtotal, Shipping Breakdown */}
                <div className="space-y-[16px] font-['Hanken_Grotesk'] text-[16px] leading-[24px]">
                  <div className="flex justify-between text-[#5F5E5E]">
                    <span>Subtotal</span>
                    <span>{productPrice}</span>
                  </div>
                  <div className="flex justify-between text-[#5F5E5E]">
                    <span>Shipping</span>
                    <span className="font-bold text-[#676000]">FREE</span>
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
                      Handled by Razorpay with bank-grade encryption. Card details never touch our servers.
                    </p>
                  </div>
                </div>

                {paymentError && (
                  <p className="text-sm font-semibold text-red-600">{paymentError}</p>
                )}

                {/* Pay Now Button */}
                <button
                  onClick={handlePayNow}
                  disabled={isProcessingPayment}
                  className="w-full h-[68px] bg-[#F2BA03] hover:bg-[#e0ac00] rounded-[12px] flex items-center justify-center gap-[8px] font-['Hanken_Grotesk'] font-bold text-[18px] leading-[28px] text-[#736B00] shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  <span>{isProcessingPayment ? 'Processing...' : 'Pay Now'}</span>
                  {!isProcessingPayment && <ArrowRight className="w-[16px] h-[16px] text-[#736B00]" />}
                </button>

                {/* Footer Badges Info */}
                <div className="space-y-[12px] text-center pt-[8px]">
                  <span className="font-['Hanken_Grotesk'] font-normal text-[10px] leading-[15px] tracking-[1px] text-[#5F5E5E] uppercase block">
                    GUARANTEED SAFE CHECKOUT VIA RAZORPAY
                  </span>
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
                  Your order{' '}
                  <span className="font-bold text-[#1B1C1C]">
                    #{completedOrder ? completedOrder.id.slice(0, 8).toUpperCase() : '—'}
                  </span>{' '}
                  has been confirmed and is being prepared for shipment.
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
                <div className="w-[80px] h-[80px] bg-[#F5F3F3] rounded-[8px] overflow-hidden shrink-0">
                  <img src={qrImage} alt={productTitle} className="w-full h-full object-cover" />
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
                  <span className="text-[#5F5E5E]">{orderTotalDisplay}</span>
                </div>
                <div className="flex justify-between text-[#5F5E5E]">
                  <span>Standard Shipping</span>
                  <span className="font-bold text-[#D7CA00]">FREE</span>
                </div>
                <div className="flex justify-between text-[#1B1C1C] pt-[8px] border-t border-[#EFEDED] font-bold text-[18px] leading-[28px]">
                  <span>Total</span>
                  <span>{orderTotalDisplay}</span>
                </div>
              </div>

              {/* Estimated Delivery Container */}
              <div className="bg-[#F5F3F3] rounded-[8px] p-[16px] flex items-center gap-[16px]">
                <Truck className="w-[22px] h-[20px] text-[#676000] shrink-0" />
                <div className="space-y-[2px]">
                  <span className="font-['Hanken_Grotesk'] font-bold text-[14px] leading-[20px] text-[#1B1C1C] block">
                    Estimated Delivery
                  </span>
                  <p className="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[20px] text-[#5F5E5E]">
                    Tuesday, Oct 24th &mdash; Thursday, Oct 26th
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
                <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[24px] sm:text-[28px] leading-[34px] text-[#1B1C1C]">
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

                  {reviewError && (
                    <p className="text-sm font-semibold text-red-600">{reviewError}</p>
                  )}

                  {/* Submit Feedback Button */}
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !completedOrder}
                    className="w-full sm:w-[170px] h-[48px] bg-[#1B1C1C] hover:bg-neutral-800 text-white font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] rounded-[8px] transition-colors cursor-pointer active:scale-95 flex items-center justify-center disabled:opacity-60"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
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
                    256-BIT SSL
                  </span>
                </div>
                <div className="flex flex-col items-center gap-[4px]">
                  <Radio className="w-[25px] h-[25px] text-[#1B1C1C]" />
                  <span className="font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] tracking-[1px] text-[#1B1C1C] uppercase">
                    PCI COMPLIANT
                  </span>
                </div>
                <div className="flex flex-col items-center gap-[4px]">
                  <ShieldCheck className="w-[27px] h-[26px] text-[#1B1C1C]" />
                  <span className="font-['Hanken_Grotesk'] font-bold text-[10px] leading-[15px] tracking-[1px] text-[#1B1C1C] uppercase">
                    SECURE CHECKOUT
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

