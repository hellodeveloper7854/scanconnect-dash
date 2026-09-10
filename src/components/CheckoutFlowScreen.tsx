import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { api, ApiError, downloadFile } from '../lib/api';
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
  Truck,
  Car,
  Phone,
  Plus,
  Download
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

// Maps ShopScreen's static catalog (its numeric `product.id`, 1-5 — see the
// `products` array in ShopScreen.tsx) to the matching real backend Product
// row, so checkout charges the price for whatever the customer actually
// clicked "Buy Now" on instead of always charging the same one product.
// Product #4 ("Fleet & Commercial Tags") isn't sold through checkout at all
// — its CTA routes to Contact Sales — so it has no entry here.
const PRODUCT_ID_BY_SHOP_ID: Record<number, string> = {
  1: '5ab6e299-8795-4cfa-8293-d315bb75e98a', // Scan Connect Car Tag (Pack of 2) — ₹899
  2: '77e2f59e-da2e-4b44-acf6-b87202f900f1', // Scan Connect Car Tag (Single Pack) — ₹599
  3: 'fcda4e93-2c5f-4925-a199-82e8550e41bb', // Scan Connect Bike Tag — ₹399
  5: '8eefe311-750b-4e5b-8110-b040695b9bf7', // Home & Society QR Tags — ₹349
};
const DEFAULT_CHECKOUT_PRODUCT_ID = PRODUCT_ID_BY_SHOP_ID[1];

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Other'];

// Mirrors the backend's registration format expectations loosely: letters,
// digits, spaces and hyphens only, at least 4 characters.
const REGISTRATION_PATTERN = /^[A-Za-z0-9 -]{4,}$/;
const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shipping fields — must mirror server/src/routes/orders.ts exactly so the
// backend never rejects something the frontend already accepted.
const SHIPPING_NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const SHIPPING_PHONE_PATTERN = /^[6-9]\d{9}$/;
const SHIPPING_CITY_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const SHIPPING_PINCODE_PATTERN = /^\d{6}$/;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface VehicleOption {
  id: string;
  registration: string;
  nickname: string | null;
}

interface ContactOption {
  id: string;
  name: string;
  phone: string;
}

interface OrderRecord {
  id: string;
  subtotalInPaise: number;
  discountInPaise: number;
  totalInPaise: number;
  couponCode: string | null;
  status: string;
  qrToken: string | null;
  items: { quantity: number; product: { name: string; priceInPaise: number } }[];
}

interface AvailableCoupon {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  percentageValue: number | null;
  fixedValueInPaise: number | null;
  minOrderInPaise: number | null;
  expiresAt: string | null;
  discountInPaise: number;
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

  // Moving from Shipping to Payment pushes a history entry at depth 3 (see the
  // matching depth-1 wiring in ShopScreen and depth-2 wiring in
  // ProductDetailScreen — depth, not a boolean flag, so a single Back press
  // only closes the deepest-open level instead of every mounted level at
  // once). Step 3 (post-payment review) intentionally does NOT get a history
  // entry — once payment succeeds there is no "back" to a pre-payment state.
  const goToPayment = () => {
    setStep(2);
    window.history.pushState({ scDepth: 3 }, '', `${window.location.pathname}${window.location.search}#payment`);
  };
  const backToShipping = () => {
    if ((window.history.state?.scDepth ?? 0) >= 3) {
      window.history.back();
    } else {
      setStep(1);
    }
  };

  React.useEffect(() => {
    const handlePopState = () => {
      if ((window.history.state?.scDepth ?? 0) < 3) setStep((s) => (s === 2 ? 1 : s));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Form states for Shipping (Step 1)
  const [fullName, setFullName] = useState(userData.fullName || '');
  const [phone, setPhone] = useState(userData.mobileNumber || '');
  const [city, setCity] = useState(userData.city || '');
  const [pincode, setPincode] = useState(userData.pincode || '');
  const [address, setAddress] = useState(userData.address || '');
  const [shippingError, setShippingError] = useState('');
  const [shippingTouched, setShippingTouched] = useState<Record<string, boolean>>({});

  const shippingFieldErrors = {
    fullName: SHIPPING_NAME_PATTERN.test(fullName.trim()) ? '' : 'Enter a valid full name (letters only, at least 2 characters)',
    phone: SHIPPING_PHONE_PATTERN.test(phone.trim()) ? '' : 'Enter a valid 10-digit mobile number',
    city: SHIPPING_CITY_PATTERN.test(city.trim()) ? '' : 'Enter a valid city name (letters only)',
    pincode: SHIPPING_PINCODE_PATTERN.test(pincode.trim()) ? '' : 'Enter a valid 6-digit pincode',
    address: address.trim().length >= 10 ? '' : 'Address must be at least 10 characters',
  };
  const isShippingFormValid = Object.values(shippingFieldErrors).every((e) => !e);

  const markShippingTouched = (field: string) => setShippingTouched((t) => ({ ...t, [field]: true }));

  const handleContinueToPayment = () => {
    setShippingTouched({ fullName: true, phone: true, city: true, pincode: true, address: true });
    if (!isShippingFormValid) {
      setShippingError('Please fix the highlighted fields before continuing.');
      return;
    }
    setShippingError('');
    goToPayment();
  };

  // Live pricing + coupon (Step 1 & 2 Order/Payment Summary) — subtotal comes
  // from the real product price server-side, never a hardcoded placeholder,
  // so the discount shown here is always correct and matches what POST
  // /api/orders will actually charge.
  const [subtotalInPaise, setSubtotalInPaise] = useState<number | null>(null);
  const [pricingError, setPricingError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[] | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountInPaise: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const checkoutProductId =
    (product?.id != null ? PRODUCT_ID_BY_SHOP_ID[product.id] : undefined) ?? DEFAULT_CHECKOUT_PRODUCT_ID;
  const orderItems = React.useMemo(
    () => [{ productId: checkoutProductId, quantity: 1 }],
    [checkoutProductId],
  );

  React.useEffect(() => {
    api
      .post<{ subtotalInPaise: number }>('/api/orders/pricing', { items: orderItems })
      .then((res) => setSubtotalInPaise(res.subtotalInPaise))
      .catch((err) => setPricingError(err instanceof ApiError ? err.message : 'Failed to load pricing'));
    api
      .post<{ coupons: AvailableCoupon[] }>('/api/orders/available-coupons', { items: orderItems })
      .then((res) => setAvailableCoupons(res.coupons))
      .catch(() => setAvailableCoupons([]));
  }, [orderItems]);

  const discountInPaise = appliedCoupon?.discountInPaise ?? 0;
  const totalInPaise = subtotalInPaise != null ? Math.max(0, subtotalInPaise - discountInPaise) : null;

  const applyCoupon = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await api.post<{ code: string; discountInPaise: number }>('/api/orders/apply-coupon', {
        code: trimmed,
        items: orderItems,
      });
      setAppliedCoupon({ code: res.code, discountInPaise: res.discountInPaise });
      setCouponCodeInput('');
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Payment (Step 2) — Razorpay handles the actual payment method selection
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  // Assign step — pick or add the vehicle + emergency contact this order's QR maps to
  const [vehicles, setVehicles] = useState<VehicleOption[] | null>(null);
  const [contacts, setContacts] = useState<ContactOption[] | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicleRegistration, setNewVehicleRegistration] = useState('');
  const [newVehicleNickname, setNewVehicleNickname] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleFuelType, setNewVehicleFuelType] = useState('');
  const [newVehicleColor, setNewVehicleColor] = useState('');
  const [vehicleFormError, setVehicleFormError] = useState('');
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [contactFormError, setContactFormError] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);

  const loadAssignOptions = () => {
    api
      .get<{ vehicles: VehicleOption[] }>('/api/profile/vehicles')
      .then((res) => {
        setVehicles(res.vehicles);
        if (res.vehicles.length === 1) setSelectedVehicleId(res.vehicles[0].id);
      })
      .catch(() => setVehicles([]));
    api
      .get<{ contacts: ContactOption[] }>('/api/profile/emergency-contacts')
      .then((res) => {
        setContacts(res.contacts);
        if (res.contacts.length === 1) setSelectedContactId(res.contacts[0].id);
      })
      .catch(() => setContacts([]));
  };

  React.useEffect(() => {
    if (step === 3 && completedOrder && !completedOrder.qrToken) loadAssignOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, completedOrder?.id]);

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleFormError('');

    const registration = newVehicleRegistration.trim();
    if (!registration) {
      setVehicleFormError('Please enter a registration number.');
      return;
    }
    if (!REGISTRATION_PATTERN.test(registration)) {
      setVehicleFormError('Registration number should be at least 4 characters (letters, numbers, spaces or hyphens only).');
      return;
    }

    setIsSavingVehicle(true);
    try {
      const res = await api.post<{ vehicle: VehicleOption }>('/api/profile/vehicles', {
        registration,
        nickname: newVehicleNickname.trim() || undefined,
        vehicleType: newVehicleType || undefined,
        brand: newVehicleBrand.trim() || undefined,
        model: newVehicleModel.trim() || undefined,
        fuelType: newVehicleFuelType.trim() || undefined,
        color: newVehicleColor.trim() || undefined,
      });
      loadAssignOptions();
      setSelectedVehicleId(res.vehicle.id);
      setIsAddVehicleOpen(false);
      setNewVehicleRegistration('');
      setNewVehicleNickname('');
      setNewVehicleType('');
      setNewVehicleBrand('');
      setNewVehicleModel('');
      setNewVehicleFuelType('');
      setNewVehicleColor('');
    } catch (err) {
      setVehicleFormError(err instanceof ApiError ? err.message : 'Failed to add vehicle');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormError('');

    const name = newContactName.trim();
    const phone = newContactPhone.trim();
    const email = newContactEmail.trim();

    if (!name) {
      setContactFormError('Please enter a full name.');
      return;
    }
    if (!phone) {
      setContactFormError('Please enter a phone number.');
      return;
    }
    if (!PHONE_PATTERN.test(phone)) {
      setContactFormError('Please enter a valid phone number (6-20 digits, spaces, +, or - allowed).');
      return;
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      setContactFormError('Please enter a valid email address.');
      return;
    }

    setIsSavingContact(true);
    try {
      const res = await api.post<{ contact: ContactOption }>('/api/profile/emergency-contacts', {
        name,
        phone,
        role: newContactRole.trim() || undefined,
        email: email || undefined,
      });
      loadAssignOptions();
      setSelectedContactId(res.contact.id);
      setIsAddContactOpen(false);
      setNewContactName('');
      setNewContactRole('');
      setNewContactPhone('');
      setNewContactEmail('');
    } catch (err) {
      setContactFormError(err instanceof ApiError ? err.message : 'Failed to add contact');
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!completedOrder || !selectedVehicleId || !selectedContactId) {
      setAssignError('Please select (or add) a vehicle and an emergency contact.');
      return;
    }
    setIsAssigning(true);
    setAssignError('');
    try {
      const res = await api.post<{ order: OrderRecord }>(`/api/orders/${completedOrder.id}/assign`, {
        vehicleId: selectedVehicleId,
        emergencyContactId: selectedContactId,
      });
      setCompletedOrder(res.order);
      setStep(3);
    } catch (err) {
      setAssignError(err instanceof ApiError ? err.message : 'Failed to generate QR code');
    } finally {
      setIsAssigning(false);
    }
  };

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
      }>('/api/orders', {
        items: orderItems,
        shipping: {
          name: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          address: address.trim(),
        },
        couponCode: appliedCoupon?.code,
      });

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
        theme: { color: '#FFED00' },
      });

      razorpay.open();
    } catch (err) {
      setPaymentError(err instanceof ApiError ? err.message : 'Failed to start payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const productTitle = product?.title || 'SCAN CONNECT Tag';
  const formatPaise = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  // Falls back to the product prop's price string only while pricing is still
  // loading (or failed to load) — once subtotalInPaise arrives, every display
  // below uses the real server-computed number, never the placeholder.
  const subtotalDisplay = subtotalInPaise != null ? formatPaise(subtotalInPaise) : product?.price || '—';
  const totalDisplay = totalInPaise != null ? formatPaise(totalInPaise) : product?.price || '—';
  const orderTotalDisplay = completedOrder ? formatPaise(completedOrder.totalInPaise) : totalDisplay;

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
            onClick={() => step === 2 ? backToShipping() : step > 1 && setStep(1)}
          >
            <div
              className={`flex flex-row justify-center items-center w-[40px] h-[40px] rounded-full transition-all ${
                step === 1
                  ? 'bg-[#FFED00] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
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
            onClick={() => step > 2 && goToPayment()}
          >
            <div
              className={`flex flex-row justify-center items-center w-[40px] h-[40px] rounded-full transition-all ${
                step === 2
                  ? 'bg-[#FFED00]'
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
                  ? 'bg-[#FFED00]'
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
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value.replace(/[^A-Za-z .'-]/g, ''))}
                        onBlur={() => markShippingTouched('fullName')}
                        placeholder="John Doe"
                        className={`w-full h-[42px] bg-[#FFFFFF] border rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#FFED00] ${
                          shippingTouched.fullName && shippingFieldErrors.fullName ? 'border-red-500' : 'border-[#6B7280]'
                        }`}
                      />
                      {shippingTouched.fullName && shippingFieldErrors.fullName && (
                        <p className="text-xs font-semibold text-red-600">{shippingFieldErrors.fullName}</p>
                      )}
                    </div>

                    {/* Frame 50: Phone Number */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onBlur={() => markShippingTouched('phone')}
                        placeholder="9876543210"
                        className={`w-full h-[42px] bg-[#FFFFFF] border rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#FFED00] ${
                          shippingTouched.phone && shippingFieldErrors.phone ? 'border-red-500' : 'border-[#6B7280]'
                        }`}
                      />
                      {shippingTouched.phone && shippingFieldErrors.phone && (
                        <p className="text-xs font-semibold text-red-600">{shippingFieldErrors.phone}</p>
                      )}
                    </div>

                    {/* Frame 51: City */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value.replace(/[^A-Za-z .'-]/g, ''))}
                        onBlur={() => markShippingTouched('city')}
                        placeholder="Mumbai"
                        className={`w-full h-[42px] bg-[#FFFFFF] border rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#FFED00] ${
                          shippingTouched.city && shippingFieldErrors.city ? 'border-red-500' : 'border-[#6B7280]'
                        }`}
                      />
                      {shippingTouched.city && shippingFieldErrors.city && (
                        <p className="text-xs font-semibold text-red-600">{shippingFieldErrors.city}</p>
                      )}
                    </div>

                    {/* Frame 52: Pincode */}
                    <div className="flex flex-col gap-[10px]">
                      <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        onBlur={() => markShippingTouched('pincode')}
                        placeholder="400001"
                        className={`w-full h-[42px] bg-[#FFFFFF] border rounded-[5px] px-[13px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[21px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#FFED00] ${
                          shippingTouched.pincode && shippingFieldErrors.pincode ? 'border-red-500' : 'border-[#6B7280]'
                        }`}
                      />
                      {shippingTouched.pincode && shippingFieldErrors.pincode && (
                        <p className="text-xs font-semibold text-red-600">{shippingFieldErrors.pincode}</p>
                      )}
                    </div>
                  </div>

                  {/* Frame 53: Delivery Address */}
                  <div className="flex flex-col gap-[10px] w-full pt-1">
                    <label className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={() => markShippingTouched('address')}
                      placeholder="House No, Street, Landmark..."
                      className={`w-full h-[57px] bg-[#FFFFFF] border rounded-[5px] px-[13px] py-[10px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#FFED00] resize-none overflow-y-auto ${
                        shippingTouched.address && shippingFieldErrors.address ? 'border-red-500' : 'border-[#6B7280]'
                      }`}
                    />
                    {shippingTouched.address && shippingFieldErrors.address && (
                      <p className="text-xs font-semibold text-red-600">{shippingFieldErrors.address}</p>
                    )}
                  </div>
                </div>

                {/* Continue to Payment Button */}
                <div className="pt-2 space-y-3">
                  {shippingError && (
                    <p className="text-sm font-semibold text-red-600">{shippingError}</p>
                  )}
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!isShippingFormValid}
                    className="w-full sm:w-[232.2px] h-[56px] bg-[#FFED00] hover:enabled:bg-[#e0ac00] rounded-[8px] flex items-center justify-center font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:enabled:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <div className="w-[80px] h-[80px]  rounded-[8px] overflow-hidden shrink-0">
                    <img src={qrImage} alt={productTitle} className="w-full  object-cover" />
                  </div>

                  {/* Title & Price Details */}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-['Hanken_Grotesk'] font-bold text-[18px] leading-[24px] text-[#1B1C1C]">
                      {productTitle}
                    </h4>
                    <p className="font-['Hanken_Grotesk'] font-normal text-[14px] leading-[20px] text-[#5F5E5E]">
                      Premium Protection Plan x1
                    </p>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#B58500] block">
                      {subtotalDisplay}
                    </span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="border-t border-[#CCC7AA] pt-[20px] space-y-3">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-3 bg-[#FFFBF0] border border-[#E6D400] rounded-[8px] px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-['Hanken_Grotesk'] font-bold text-sm text-[#1B1C1C] font-mono truncate">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-[#736B00]">Coupon applied — you saved {formatPaise(appliedCoupon.discountInPaise)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs font-bold text-[#5F5E5E] hover:text-[#1B1C1C] cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-[8px] font-['Hanken_Grotesk'] text-sm text-[#1B1C1C] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FFED00]"
                      />
                      <button
                        type="button"
                        onClick={() => applyCoupon(couponCodeInput)}
                        disabled={isApplyingCoupon || !couponCodeInput.trim()}
                        className="h-[44px] px-5 bg-[#1B1C1C] hover:enabled:bg-neutral-800 text-white font-bold text-sm rounded-[8px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-xs font-semibold text-red-600">{couponError}</p>}

                  {availableCoupons && availableCoupons.length > 0 && !appliedCoupon && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-[#5F5E5E] uppercase tracking-wide">Available Offers</p>
                      {availableCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => applyCoupon(c.code)}
                          disabled={isApplyingCoupon}
                          className="w-full flex items-center justify-between gap-3 border border-dashed border-[#CCC7AA] hover:border-[#FFED00] rounded-[8px] px-3 py-2 text-left cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="font-mono font-bold text-xs text-[#1B1C1C]">{c.code}</span>
                          <span className="text-xs text-[#736B00] font-semibold shrink-0">
                            Save {formatPaise(c.discountInPaise)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Horizontal Border Breakdown */}
                <div className="border-t border-[#CCC7AA] pt-[24px] space-y-[16px]">
                  <div className="flex justify-between items-center">
                    <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      Subtotal
                    </span>
                    <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      {subtotalDisplay}
                    </span>
                  </div>

                  {discountInPaise > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                        Discount
                      </span>
                      <span className="font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-emerald-600">
                        -{formatPaise(discountInPaise)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      Shipping
                    </span>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#B58500]">
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
                    {totalDisplay}
                  </span>
                </div>

                {/* Overlay Alert Box */}
                <div className="bg-[#FFED00] border border-[#E6D400] rounded-[8px] p-[16px] flex flex-row items-start gap-[12px]">
                  <Info className="w-[20px] h-[20px] text-[#1B1C1C] shrink-0 mt-[2px]" />
                  <p className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[20px] text-[#736B00]">
                    Your payment is protected by end-to-end encryption. By clicking complete, you agree to our Terms of Service and Refund Policy.
                  </p>
                </div>

              </div>

            </div>

            {/* TRUST INDICATORS SECTION */}
            <div className="flex flex-wrap items-center justify-center gap-[32px] opacity-70 pt-[16px]">
              <div className="flex items-center gap-[8px]">
                <Lock className="w-[16px] h-[20px] text-[#1B1C1C]" />
                <span className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[16px] text-[#1B1C1C]">
                  SSL SECURED CHECKOUT
                </span>
              </div>

              <div className="flex items-center gap-[8px]">
                <ShieldCheck className="w-[16px] h-[20px] text-[#1B1C1C]" />
                <span className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[16px] text-[#1B1C1C]">
                  PCI DSS COMPLIANT
                </span>
              </div>

              <div className="flex items-center gap-[8px]">
                <Check className="w-[22px] h-[22px] text-[#1B1C1C]" />
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
              <div className="flex items-center justify-between">
                <h2 className="font-['Plus_Jakarta_Sans'] font-normal text-[24px] sm:text-[28px] leading-[32px] text-[#1B1C1C]">
                  Complete Your Payment
                </h2>
                <button
                  onClick={backToShipping}
                  className="text-xs font-bold text-[#5F5E5E] hover:text-[#1B1C1C] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>
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
                    <span>{subtotalDisplay}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[#5F5E5E]">
                      <span>
                        Discount{' '}
                        <span className="font-mono text-xs text-[#736B00]">({appliedCoupon.code})</span>
                      </span>
                      <span className="font-bold text-emerald-600">-{formatPaise(discountInPaise)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5F5E5E]">
                    <span>Shipping</span>
                    <span className="font-bold text-[#676000]">FREE</span>
                  </div>

                  <div className="border-t border-[#CCC7AA] pt-[16px] flex justify-between items-end text-[#1B1C1C]">
                    <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[24px]">
                      Total Amount
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px]">
                      {totalDisplay}
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
                  className="w-full h-[68px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-[12px] flex items-center justify-center gap-[8px] font-['Hanken_Grotesk'] font-bold text-[18px] leading-[28px] text-[#736B00] shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
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

        {/* STEP 3a: ASSIGN VEHICLE + EMERGENCY CONTACT (shown once, right after payment, before the QR is generated) */}
        {step === 3 && completedOrder && !completedOrder.qrToken && (
          <div className="max-w-[600px] mx-auto space-y-8 animate-fade-in px-2 sm:px-4 pt-2">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#FFED00] flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-[#1B1C1C] stroke-[3]" />
              </div>
              <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl sm:text-[28px] text-[#1B1C1C]">
                Payment Successful
              </h1>
              <p className="font-['Hanken_Grotesk'] text-[#5F5E5E] text-base">
                One last step — link this order&apos;s QR tag to a vehicle and an emergency contact.
              </p>
            </div>

            <div className="bg-white border border-[#CCC7AA] rounded-xl p-6 sm:p-8 space-y-6">
              {/* Vehicle picker */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#5F5E5E] uppercase tracking-wide">
                  <Car className="w-4 h-4" /> Vehicle
                </label>
                {!vehicles ? (
                  <p className="text-sm text-[#5F5E5E]">Loading your vehicles...</p>
                ) : vehicles.length === 0 ? (
                  <p className="text-sm text-[#5F5E5E]">No vehicles saved yet.</p>
                ) : (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full h-[46px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#FFED00] cursor-pointer"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nickname ? `${v.nickname} — ${v.registration}` : v.registration}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B1C1C] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add a new vehicle
                </button>
              </div>

              {/* Emergency contact picker */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#5F5E5E] uppercase tracking-wide">
                  <Phone className="w-4 h-4" /> Emergency Contact
                </label>
                {!contacts ? (
                  <p className="text-sm text-[#5F5E5E]">Loading your emergency contacts...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-[#5F5E5E]">No emergency contacts saved yet.</p>
                ) : (
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full h-[46px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#FFED00] cursor-pointer"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.phone}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B1C1C] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add a new emergency contact
                </button>
              </div>

              {assignError && <p className="text-sm font-semibold text-red-600">{assignError}</p>}

              <button
                onClick={handleConfirmAssign}
                disabled={isAssigning || !selectedVehicleId || !selectedContactId}
                className="w-full h-[56px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-['Hanken_Grotesk'] font-bold text-base text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isAssigning ? 'Generating QR...' : 'Generate My QR Tag'}
                {!isAssigning && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Inline Add Vehicle Modal */}
            {isAddVehicleOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-black text-neutral-900">Add Vehicle</h3>
                  <form onSubmit={handleAddVehicleSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D5F5F]">Registration Number</label>
                      <input
                        type="text"
                        required
                        value={newVehicleRegistration}
                        onChange={(e) => setNewVehicleRegistration(e.target.value)}
                        placeholder="e.g. MH12AB1234"
                        className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D5F5F]">Nickname (optional)</label>
                      <input
                        type="text"
                        value={newVehicleNickname}
                        onChange={(e) => setNewVehicleNickname(e.target.value)}
                        placeholder="e.g. My Sedan"
                        className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#5D5F5F]">Vehicle Type (optional)</label>
                        <select
                          value={newVehicleType}
                          onChange={(e) => setNewVehicleType(e.target.value)}
                          className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00] cursor-pointer"
                        >
                          <option value="">Select type</option>
                          {VEHICLE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#5D5F5F]">Fuel Type (optional)</label>
                        <input
                          type="text"
                          value={newVehicleFuelType}
                          onChange={(e) => setNewVehicleFuelType(e.target.value)}
                          placeholder="e.g. Petrol"
                          className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#5D5F5F]">Brand (optional)</label>
                        <input
                          type="text"
                          value={newVehicleBrand}
                          onChange={(e) => setNewVehicleBrand(e.target.value)}
                          placeholder="e.g. Maruti Suzuki"
                          className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#5D5F5F]">Model (optional)</label>
                        <input
                          type="text"
                          value={newVehicleModel}
                          onChange={(e) => setNewVehicleModel(e.target.value)}
                          placeholder="e.g. Swift"
                          className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D5F5F]">Color (optional)</label>
                      <input
                        type="text"
                        value={newVehicleColor}
                        onChange={(e) => setNewVehicleColor(e.target.value)}
                        placeholder="e.g. White"
                        className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                      />
                    </div>

                    {vehicleFormError && <p className="text-sm font-semibold text-red-600">{vehicleFormError}</p>}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddVehicleOpen(false);
                          setVehicleFormError('');
                        }}
                        className="flex-1 py-2.5 bg-[#EFEDED] hover:bg-neutral-200 text-[#5D5F5F] font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingVehicle}
                        className="flex-1 py-2.5 bg-[#FFED00] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-xs uppercase rounded-lg cursor-pointer disabled:opacity-60"
                      >
                        {isSavingVehicle ? 'Saving...' : 'Save Vehicle'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Inline Add Emergency Contact Modal */}
            {isAddContactOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                  <h3 className="text-lg font-black text-neutral-900">Add Emergency Contact</h3>
                  <form onSubmit={handleAddContactSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D5F5F]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D5F5F]">Role / Relationship (optional)</label>
                      <input
                        type="text"
                        value={newContactRole}
                        onChange={(e) => setNewContactRole(e.target.value)}
                        placeholder="e.g. Security Supervisor"
                        className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D5F5F]">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D5F5F]">Email Address (optional)</label>
                      <input
                        type="email"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        placeholder="e.g. alex@scanme.fleet"
                        className="w-full h-[44px] px-3.5 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                      />
                    </div>

                    {contactFormError && <p className="text-sm font-semibold text-red-600">{contactFormError}</p>}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddContactOpen(false);
                          setContactFormError('');
                        }}
                        className="flex-1 py-2.5 bg-[#EFEDED] hover:bg-neutral-200 text-[#5D5F5F] font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingContact}
                        className="flex-1 py-2.5 bg-[#FFED00] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-xs uppercase rounded-lg cursor-pointer disabled:opacity-60"
                      >
                        {isSavingContact ? 'Saving...' : 'Save Contact'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: REVIEW / THANK YOU PAGE (shown once the QR has been generated) */}
        {step === 3 && completedOrder?.qrToken && (
          <div className="max-w-[672px] mx-auto space-y-[32px] animate-fade-in px-2 sm:px-4 pt-2">

            {/* SUCCESS CELEBRATION SECTION */}
            <div className="flex flex-col items-center text-center gap-[16px] w-full">
              {/* Background badge icon with orbit ring */}
              <div className="relative w-[96px] h-[88px] sm:w-[96px] sm:h-[96px] bg-[#FFED00] rounded-full flex items-center justify-center shrink-0">
                <Check className="w-[40px] h-[40px] text-[#1B1C1C] stroke-[3]" />
                <div className="absolute inset-0 border-2 border-[#FFED00] opacity-20 rounded-full scale-105 pointer-events-none" />
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
                <div className="w-[80px] h-[80px] rounded-[8px] overflow-hidden shrink-0">
                  <img src={qrImage} alt={productTitle} className="w-full  object-cover" />
                </div>

                {/* Details Container */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-[16px]">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[18px] sm:text-[20px] leading-[26px] text-[#1B1C1C] truncate">
                      {productTitle}
                    </h3>
                    <span className="font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#1B1C1C] shrink-0">
                      {orderTotalDisplay}
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

            {/* SECTION: YOUR QR TAG */}
            {completedOrder?.qrToken && (
              <div className="bg-white border border-[#E4E2E2] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={`${API_BASE_URL}/api/order-contact/${completedOrder.qrToken}/qr.png`}
                  alt="Your Scan Connect QR tag"
                  className="w-40 h-40 shrink-0 rounded-lg"
                />
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#1B1C1C]">
                    Your QR Tag is Ready
                  </h3>
                  <p className="text-sm text-[#5F5E5E]">
                    This is the QR code that will be printed on your sticker. Anyone who scans it can see your linked
                    vehicle and emergency contact details.
                  </p>
                  <button
                    onClick={() =>
                      downloadFile(
                        `/api/order-contact/${completedOrder.qrToken}/qr.png`,
                        `scanconnect-qr-${completedOrder.id.slice(0, 8)}.png`,
                      )
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B1C1C] hover:bg-neutral-800 text-white text-sm font-bold rounded-lg cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download QR
                  </button>
                </div>
              </div>
            )}

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
                                ? 'fill-[#FFED00] text-[#FFED00]'
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
                      className="w-full h-[96px] bg-[#FFFFFF] border border-[#E4E2E2] rounded-[8px] p-[16px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#FFED00] resize-none"
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
                <div className="bg-[#FFED00]/10 border border-[#FFED00]/30 rounded-[12px] p-[16px] font-['Hanken_Grotesk'] font-bold text-[14px] text-[#1B1C1C] flex items-center gap-[8px]">
                  <Check className="w-[18px] h-[18px] text-[#736B00]" />
                  <span>Thank you! Your feedback has been recorded.</span>
                </div>
              )}

            </div>

            {/* ACTIONS ROW */}
            <div className="flex flex-col sm:flex-row items-center gap-[16px] pb-[32px]">
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-[302px] flex-1 h-[60px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-[8px] flex items-center justify-center gap-[8px] font-['Hanken_Grotesk'] font-bold text-[16px] leading-[24px] text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95"
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

