import React, { useState } from 'react';
import { Bell, HelpCircle, LogOut, ShieldAlert, User, Menu, X, ChevronDown, Package } from 'lucide-react';
import { UserFormData } from '../types';
import { api, ApiError } from '../lib/api';
import logoImg from '../assets/images/logo.png';

interface DashboardHeaderProps {
  userData: UserFormData;
  onLogout: () => void;
  activeNav?: string;
  onNavClick?: (nav: string) => void;
  isLoggedIn?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userData,
  onLogout,
  activeNav = 'How it works',
  onNavClick,
  isLoggedIn = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(2);

  const navItems = ['How it works', 'Shop', 'About', 'QR Scan', 'Contact'];

  const handleNav = (item: string) => {
    if (onNavClick) onNavClick(item);
    setMobileMenuOpen(false);
  };

  const triggerSosAlert = () => {
    if (!isLoggedIn) {
      alert('Please sign in to use the SOS emergency alert.');
      return;
    }

    const sendAlert = async (coords?: { latitude: number; longitude: number }) => {
      setSosActive(true);
      try {
        await api.post('/api/sos', coords);
        alert('🚨 EMERGENCY SOS DISPATCHED: Alert sent to emergency contacts & nearby ScanConnect response team!');
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'Failed to dispatch SOS alert. Please try again.');
      } finally {
        setTimeout(() => setSosActive(false), 5000);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => sendAlert({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => sendAlert(),
        { timeout: 3000 },
      );
    } else {
      sendAlert();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#EFCE1F] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Left Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('How it works')}>
            <img src={logoImg} alt="Scan Connect" className="h-12 md:h-14 w-auto object-contain" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-base font-['Rubik',sans-serif] text-[#1B1C1C]">
            {navItems.map((item) => {
              const isActive = activeNav === item;
              return (
                <button
                  key={item}
                  onClick={() => handleNav(item)}
                  className={`transition-all relative py-1 cursor-pointer ${
                    isActive
                      ? 'text-[#1B1C1C] underline decoration-2 underline-offset-8 font-bold'
                      : 'text-[#1B1C1C]/80 hover:text-[#1B1C1C] font-medium'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & User Avatar */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* SOS Emergency Button */}
            <button
              onClick={triggerSosAlert}
              title="Trigger Emergency SOS"
              className={`relative group w-9 h-9 sm:w-10 sm:h-10 rounded-full font-extrabold text-xs text-white flex items-center justify-center cursor-pointer transition-all shadow-sm ${
                sosActive
                  ? 'bg-red-700 animate-bounce ring-4 ring-red-400'
                  : 'bg-[#FF0022] hover:bg-red-700 active:scale-95 border border-white/30'
              }`}
            >
              <span>SOS</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => alert(`Notifications (2):\n• Parking ping from SC-MH12-9881\n• Shield security scan complete`)}
              className="relative p-2 text-[#1B1C1C] hover:bg-black/10 rounded-full transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border-2 border-[#EFCE1F] rounded-full" />
              )}
            </button>

            {/* Help / FAQ Icon */}
            <button
              onClick={() => alert('ScanConnect Helpdesk:\nCall 080-473-59856 or email rj@sampark.me for 24/7 driver support.')}
              className="p-2 text-[#1B1C1C] hover:bg-black/10 rounded-full transition-colors cursor-pointer"
              title="Support & FAQ"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </button>

            {/* User Profile Avatar / Login Button */}
            {isLoggedIn ? (
              <div className="relative flex items-center gap-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleNav('Profile');
                  }}
                  title="View My Profile"
                  className="flex items-center p-0.5 rounded-xl hover:ring-2 hover:ring-white/40 transition-all cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                    alt="User Avatar"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-white/80 shadow-xs group-hover:scale-105 transition-transform"
                  />
                </button>

                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title="Account Menu"
                  className="p-1 text-[#1B1C1C] hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 text-neutral-800 z-50 animate-fade-in">
                    <div
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleNav('Profile');
                      }}
                      className="px-4 py-2 border-b border-neutral-100 hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-bold text-neutral-900 uppercase truncate">
                        {userData.fullName || 'Rahul Sharma'}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono truncate">
                        {userData.email || 'driver@scanme.com'}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNav('Profile');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-amber-50 flex items-center gap-2 text-neutral-900 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#f5b800]" /> My Profile
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNav('My Orders');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-[#f5b800]" /> My Orders
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-600" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('Profile')}
                title="Login or Register Account"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-amber-400 font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-amber-400/30"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Login / Register</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#1B1C1C] hover:bg-black/10 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#e0a800] border-t border-black/10 px-4 pt-2 pb-4 space-y-2 font-['Rubik',sans-serif] font-bold text-[#1B1C1C]">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNav(item)}
              className="block w-full text-left py-2 px-3 rounded-lg hover:bg-black/10 transition-colors"
            >
              {item}
            </button>
          ))}
          {isLoggedIn ? (
            <>
              <button
                onClick={() => handleNav('Profile')}
                className="block w-full text-left py-2 px-3 rounded-lg hover:bg-black/10 font-extrabold flex items-center gap-2"
              >
                <User className="w-4 h-4" /> My Profile
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="block w-full text-left py-2 px-3 rounded-lg text-red-800 font-extrabold hover:bg-red-500/20"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNav('Profile')}
              className="block w-full text-left py-2 px-3 rounded-lg bg-neutral-950 text-amber-400 font-extrabold hover:bg-neutral-900"
            >
              Login / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};
