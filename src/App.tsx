import React, { useState } from 'react';
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

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpMobileNumber, setOtpMobileNumber] = useState('9881860335');
  const [userData, setUserData] = useState<UserFormData>({
    fullName: 'Kartik Ghodake',
    mobileNumber: '9881860335',
    email: 'driver@scanme.com',
  });

  const handleGlobalNavigate = (nav: string) => {
    const normalized = nav.toLowerCase();
    if (normalized === 'about') {
      setActiveScreen('about');
    } else if (normalized === 'shop') {
      setActiveScreen('shop');
    } else if (normalized === 'contact') {
      setActiveScreen('contact');
    } else if (normalized === 'profile') {
      if (isLoggedIn) {
        setActiveScreen('profile');
      } else {
        setActiveScreen('login');
      }
    } else if (normalized === 'login') {
      setActiveScreen('login');
    } else if (normalized === 'register') {
      setActiveScreen('register');
    } else {
      setActiveScreen('dashboard');
    }
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

      {/* Footer copyright */}
      <footer className="w-full py-4 text-center text-[10px] text-neutral-500 font-mono border-t border-white/5 bg-neutral-950/80">
        © {new Date().getFullYear()} SCAN CONNECT • SECURE AUTOMOTIVE NETWORK • ALL RIGHTS RESERVED
      </footer>
    </BackgroundCockpit>
  );
}
