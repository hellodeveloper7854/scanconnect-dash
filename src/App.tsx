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

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('register');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpMobileNumber, setOtpMobileNumber] = useState('9881860335');
  const [userData, setUserData] = useState<UserFormData>({
    fullName: 'Kartik Ghodake',
    mobileNumber: '9881860335',
    email: 'driver@scanme.com',
  });

  const handleRegisterSuccess = (data: UserFormData) => {
    setUserData(data);
    setOtpMobileNumber(data.mobileNumber || '9881860335');
    setIsOtpModalOpen(true);
  };

  const handleLoginSuccess = (data: Partial<UserFormData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setActiveScreen('dashboard');
  };

  const handleSendOtpTrigger = (mobile: string) => {
    setOtpMobileNumber(mobile);
    setIsOtpModalOpen(true);
  };

  const handleOtpVerifiedSuccess = () => {
    setIsOtpModalOpen(false);
    setActiveScreen('dashboard');
  };

  if (activeScreen === 'dashboard') {
    return (
      <>
        <VehicleDashboard
          userData={userData}
          onLogout={() => setActiveScreen('login')}
          onNavigate={(nav) => {
            if (nav === 'about' || nav === 'About') setActiveScreen('about');
            else if (nav === 'shop' || nav === 'Shop') setActiveScreen('shop');
          }}
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
          onLogout={() => setActiveScreen('login')}
          onNavigate={(nav) => {
            if (nav === 'dashboard' || nav === 'How it works' || nav === 'QR Scan') {
              setActiveScreen('dashboard');
            } else if (nav === 'about' || nav === 'About') {
              setActiveScreen('about');
            } else if (nav === 'shop' || nav === 'Shop') {
              setActiveScreen('shop');
            }
          }}
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
          onLogout={() => setActiveScreen('login')}
          onNavigate={(nav) => {
            if (nav === 'dashboard' || nav === 'How it works' || nav === 'QR Scan') {
              setActiveScreen('dashboard');
            } else if (nav === 'about' || nav === 'About') {
              setActiveScreen('about');
            } else if (nav === 'shop' || nav === 'Shop') {
              setActiveScreen('shop');
            }
          }}
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
            onNavigate={(screen) => setActiveScreen(screen)}
            onSubmitSuccess={handleRegisterSuccess}
          />
        )}

        {activeScreen === 'login' && (
          <LoginScreen
            onNavigate={(screen) => setActiveScreen(screen)}
            onSubmitSuccess={handleLoginSuccess}
          />
        )}

        {activeScreen === 'send-otp' && (
          <SendOtpScreen
            onSendOtp={handleSendOtpTrigger}
            onNavigate={(screen) => setActiveScreen(screen)}
          />
        )}

        {activeScreen === 'login-options' && (
          <LoginWithOtpScreen
            onNavigate={(screen) => setActiveScreen(screen)}
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
