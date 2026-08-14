import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ScreenType, UserFormData } from './types';
import { auth } from './lib/firebase';
import { api, ApiError } from './lib/api';
import { RegistrationScreen } from './components/RegistrationScreen';
import { LoginScreen } from './components/LoginScreen';
import { SendOtpScreen } from './components/SendOtpScreen';
import { LoginWithOtpScreen } from './components/LoginWithOtpScreen';
import { OtpModal } from './components/OtpModal';
import { VehicleDashboard } from './components/VehicleDashboard';
import { AboutUsScreen } from './components/AboutUsScreen';
import { ShopScreen } from './components/ShopScreen';
import { ContactUsScreen } from './components/ContactUsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { QrScanScreen } from './components/QrScanScreen';
import { MyOrdersScreen } from './components/MyOrdersScreen';
import { OrderContactPage } from './pages/OrderContactPage';
import { QrLandingPage } from './pages/QrLandingPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { InvestorsPage } from './pages/InvestorsPage';
import { FaqPage } from './pages/FaqPage';
import { TermsAndConditionsPage } from './pages/TermsAndConditionsPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { AdminApp } from './pages/admin/AdminApp';

const getInitialScreenFromUrl = (): ScreenType => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (path === 'shop') return 'shop';
  if (path === 'about') return 'about';
  if (path === 'contact') return 'contact';
  if (path === 'qr-scan' || path === 'qrscan' || path === 'scan') return 'qr-scan';
  if (path === 'profile') return 'profile';
  if (path === 'orders') return 'orders';
  if (path === 'login') return 'login-options';
  if (path === 'register') return 'register';
  return 'dashboard';
};

export default function App() {
  const path = window.location.pathname.toLowerCase();

  if (path.startsWith('/admin')) {
    return <AdminApp />;
  }

  if (path.startsWith('/order-contact/')) {
    const token = window.location.pathname.split('/').pop() ?? '';
    return <OrderContactPage token={token} />;
  }

  if (path.startsWith('/qr/')) {
    const code = window.location.pathname.split('/').pop() ?? '';
    return <QrLandingPage code={code} />;
  }

  if (path === '/blog') {
    return <BlogListPage />;
  }

  if (path.startsWith('/blog/')) {
    const slug = window.location.pathname.split('/').pop() ?? '';
    return <BlogPostPage slug={slug} />;
  }

  if (path === '/investors') {
    return <InvestorsPage />;
  }

  if (path === '/faq') {
    return <FaqPage />;
  }

  if (path === '/terms') {
    return <TermsAndConditionsPage />;
  }

  if (path === '/shipping-policy') {
    return <ShippingPolicyPage />;
  }

  return <MainApp />;
}

function MainApp() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(getInitialScreenFromUrl);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpMobileNumber, setOtpMobileNumber] = useState('+91 98765 43210');
  const [userData, setUserData] = useState<UserFormData>({
    fullName: '',
    mobileNumber: '',
    email: '',
  });

  // Restore session from Firebase's persisted auth state on page load,
  // so a reload doesn't silently drop the user back to a logged-out view.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsLoggedIn(false);
        setIsSessionLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        const { user } = await api.post<{ user: { fullName: string; email: string; mobileNumber: string | null } }>(
          '/api/auth/session',
          { idToken },
        );
        setUserData((prev) => ({
          ...prev,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber ?? '',
        }));
        setIsLoggedIn(true);

        // If a logged-in user reloads while sitting on an auth screen (e.g. they
        // bookmarked /login), send them to their profile instead of re-showing it.
        const authOnlyScreens: ScreenType[] = ['login', 'login-options', 'register', 'send-otp'];
        if (authOnlyScreens.includes(getInitialScreenFromUrl())) {
          setActiveScreen('profile');
          if (window.location.pathname !== '/profile') {
            window.history.replaceState(null, '', '/profile');
          }
        }
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
      } finally {
        setIsSessionLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Sync state with popstate browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const screen = getInitialScreenFromUrl();
      setActiveScreen(screen);
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top whenever activeScreen changes, unless the URL has a hash
  // target (e.g. /shop#products) that a screen wants to scroll to instead.
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [activeScreen]);

  // Auth screens render as an overlay on top of the dashboard; lock page
  // scroll while one is open so the dimmed dashboard behind it stays still.
  const authOverlayScreens: ScreenType[] = ['login', 'login-options', 'register', 'send-otp'];
  useEffect(() => {
    if (authOverlayScreens.includes(activeScreen)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeScreen]);

  const handleGlobalNavigate = (nav: string) => {
    const normalized = nav.toLowerCase().trim().replace(/^\//, '');
    let targetScreen: ScreenType = 'dashboard';

    if (normalized === 'about') {
      targetScreen = 'about';
    } else if (normalized === 'shop') {
      targetScreen = 'shop';
    } else if (normalized === 'contact') {
      targetScreen = 'contact';
    } else if (normalized === 'qr scan' || normalized === 'qr-scan' || normalized === 'qrscan') {
      targetScreen = 'qr-scan';
    } else if (normalized === 'profile') {
      targetScreen = isLoggedIn ? 'profile' : 'login-options';
    } else if (normalized === 'orders' || normalized === 'my orders' || normalized === 'my-orders') {
      targetScreen = isLoggedIn ? 'orders' : 'login-options';
    } else if (normalized === 'login') {
      targetScreen = 'login-options';
    } else if (normalized === 'register') {
      targetScreen = 'register';
    } else if (normalized === 'send-otp') {
      targetScreen = 'send-otp';
    } else {
      targetScreen = 'dashboard';
    }

    setActiveScreen(targetScreen);

    // Update window URL location path
    const pathByScreen: Partial<Record<ScreenType, string>> = { dashboard: '/', 'login-options': '/login' };
    const targetPath = pathByScreen[targetScreen] ?? `/${targetScreen}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    // Scroll to top when opening a new screen
    window.scrollTo(0, 0);
  };

  const handleRegisterSuccess = (data: UserFormData) => {
    setUserData(data);
    setOtpMobileNumber(data.mobileNumber || '+91 98765 43210');
    setIsOtpModalOpen(true);
  };

  const handleLoginSuccess = (data: Partial<UserFormData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setIsLoggedIn(true);
    setActiveScreen('profile');
  };

  const handleLogout = () => {
    auth.signOut();
    setIsLoggedIn(false);
    setActiveScreen('dashboard');
  };

  const handleOtpVerifiedSuccess = (data?: Partial<UserFormData>) => {
    if (data) setUserData((prev) => ({ ...prev, ...data }));
    setIsOtpModalOpen(false);
    setIsLoggedIn(true);
    setActiveScreen('profile');
  };

  const navigateToScreen = (screen: ScreenType) => {
    setActiveScreen(screen);
    const pathByScreen: Partial<Record<ScreenType, string>> = { dashboard: '/', 'login-options': '/login' };
    const targetPath = pathByScreen[screen] ?? `/${screen}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo(0, 0);
  };

  const authOnlyScreens: ScreenType[] = ['login', 'login-options', 'register', 'send-otp'];
  if (
    isSessionLoading &&
    (activeScreen === 'profile' || activeScreen === 'orders' || authOnlyScreens.includes(activeScreen))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#0F0F0F]">
        Loading...
      </div>
    );
  }

  if (activeScreen === 'dashboard') {
    return (
      <>
        <VehicleDashboard
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onNavigate={handleGlobalNavigate}
        />
        {/* Interactive OTP Modal */}
        <OtpModal
          isOpen={isOtpModalOpen}
          mobileNumber={otpMobileNumber}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={handleOtpVerifiedSuccess}
        />
      </>
    );
  }

  if (activeScreen === 'about') {
    return (
      <>
        <AboutUsScreen
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onNavigate={handleGlobalNavigate}
        />
        {/* Interactive OTP Modal */}
        <OtpModal
          isOpen={isOtpModalOpen}
          mobileNumber={otpMobileNumber}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={handleOtpVerifiedSuccess}
        />
      </>
    );
  }

  if (activeScreen === 'shop') {
    return (
      <>
        <ShopScreen
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onNavigate={handleGlobalNavigate}
        />
        {/* Interactive OTP Modal */}
        <OtpModal
          isOpen={isOtpModalOpen}
          mobileNumber={otpMobileNumber}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={handleOtpVerifiedSuccess}
        />
      </>
    );
  }

  if (activeScreen === 'contact') {
    return (
      <>
        <ContactUsScreen
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onNavigate={handleGlobalNavigate}
        />
        {/* Interactive OTP Modal */}
        <OtpModal
          isOpen={isOtpModalOpen}
          mobileNumber={otpMobileNumber}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={handleOtpVerifiedSuccess}
        />
      </>
    );
  }

  if (activeScreen === 'qr-scan') {
    return (
      <>
        <QrScanScreen
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onNavigate={handleGlobalNavigate}
        />
        {/* Interactive OTP Modal */}
        <OtpModal
          isOpen={isOtpModalOpen}
          mobileNumber={otpMobileNumber}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={handleOtpVerifiedSuccess}
        />
      </>
    );
  }

  if (activeScreen === 'profile') {
    return (
      <>
        <ProfileScreen
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onNavigate={handleGlobalNavigate}
        />
        {/* Interactive OTP Modal */}
        <OtpModal
          isOpen={isOtpModalOpen}
          mobileNumber={otpMobileNumber}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={handleOtpVerifiedSuccess}
        />
      </>
    );
  }

  if (activeScreen === 'orders') {
    return (
      <>
        <MyOrdersScreen
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onNavigate={handleGlobalNavigate}
        />
        {/* Interactive OTP Modal */}
        <OtpModal
          isOpen={isOtpModalOpen}
          mobileNumber={otpMobileNumber}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={handleOtpVerifiedSuccess}
        />
      </>
    );
  }

  // Auth screens (login/register/OTP) render as an overlay on top of the
  // dashboard, so the site behind them stays visible through a dimmed backdrop
  // instead of navigating away to a separate page.
  return (
    <>
      <VehicleDashboard
        userData={userData}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onNavigate={handleGlobalNavigate}
      />

      {activeScreen === 'register' && (
        <RegistrationScreen
          onNavigate={navigateToScreen}
          onSubmitSuccess={handleRegisterSuccess}
        />
      )}

      {activeScreen === 'login' && (
        <LoginScreen
          onNavigate={navigateToScreen}
          onSubmitSuccess={handleLoginSuccess}
        />
      )}

      {activeScreen === 'send-otp' && (
        <SendOtpScreen
          onVerifySuccess={handleOtpVerifiedSuccess}
          onNavigate={navigateToScreen}
        />
      )}

      {activeScreen === 'login-options' && (
        <LoginWithOtpScreen
          onNavigate={navigateToScreen}
        />
      )}

      {/* Interactive OTP Modal */}
      <OtpModal
        isOpen={isOtpModalOpen}
        mobileNumber={otpMobileNumber}
        onClose={() => setIsOtpModalOpen(false)}
        onVerifySuccess={handleOtpVerifiedSuccess}
      />
    </>
  );
}
