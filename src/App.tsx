import React, { useState, useEffect } from 'react';
import { ScreenType, UserFormData } from './types';
import { BackgroundCockpit } from './components/BackgroundCockpit';
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

const getInitialScreenFromUrl = (): ScreenType => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (path === 'shop') return 'shop';
  if (path === 'about') return 'about';
  if (path === 'contact') return 'contact';
  if (path === 'qr-scan' || path === 'qrscan' || path === 'scan') return 'qr-scan';
  if (path === 'profile') return 'profile';
  if (path === 'login') return 'login';
  if (path === 'register') return 'register';
  return 'dashboard';
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(getInitialScreenFromUrl);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpMobileNumber, setOtpMobileNumber] = useState('9881860335');
  const [userData, setUserData] = useState<UserFormData>({
    fullName: 'Kartik Ghodake',
    mobileNumber: '9881860335',
    email: 'driver@scanme.com',
  });

  // Sync state with popstate browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const screen = getInitialScreenFromUrl();
      setActiveScreen(screen);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top whenever activeScreen changes
  useEffect(() => {
    window.scrollTo(0, 0);
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
      targetScreen = isLoggedIn ? 'profile' : 'login';
    } else if (normalized === 'login') {
      targetScreen = 'login';
    } else if (normalized === 'register') {
      targetScreen = 'register';
    } else {
      targetScreen = 'dashboard';
    }

    setActiveScreen(targetScreen);

    // Update window URL location path
    const targetPath = targetScreen === 'dashboard' ? '/' : `/${targetScreen}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    // Scroll to top when opening a new screen
    window.scrollTo(0, 0);
  };

  const handleRegisterSuccess = (data: UserFormData) => {
    setUserData(data);
    setOtpMobileNumber(data.mobileNumber || '9881860335');
    setIsOtpModalOpen(true);
  };

  const handleLoginSuccess = (data: Partial<UserFormData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setIsLoggedIn(true);
    setActiveScreen('profile');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveScreen('dashboard');
  };

  const handleSendOtpTrigger = (mobile: string) => {
    setOtpMobileNumber(mobile);
    setIsOtpModalOpen(true);
  };

  const handleOtpVerifiedSuccess = () => {
    setIsOtpModalOpen(false);
    setIsLoggedIn(true);
    setActiveScreen('profile');
  };

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

  return (
    <BackgroundCockpit>
      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col justify-center">
        {activeScreen === 'register' && (
          <RegistrationScreen
            onNavigate={handleGlobalNavigate}
            onSubmitSuccess={handleRegisterSuccess}
          />
        )}

        {activeScreen === 'login' && (
          <LoginScreen
            onNavigate={handleGlobalNavigate}
            onSubmitSuccess={handleLoginSuccess}
          />
        )}

        {activeScreen === 'send-otp' && (
          <SendOtpScreen
            onSendOtp={handleSendOtpTrigger}
            onNavigate={handleGlobalNavigate}
          />
        )}

        {activeScreen === 'login-options' && (
          <LoginWithOtpScreen
            onNavigate={handleGlobalNavigate}
            onSelectOtpLogin={() => {
              setOtpMobileNumber(userData.mobileNumber || '9881860335');
              setIsOtpModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Interactive OTP Modal */}
      <OtpModal
        isOpen={isOtpModalOpen}
        mobileNumber={otpMobileNumber}
        onClose={() => setIsOtpModalOpen(false)}
        onVerifySuccess={handleOtpVerifiedSuccess}
      />

    </BackgroundCockpit>
  );
}
