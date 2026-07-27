import React, { useState } from 'react';
import { Bell, HelpCircle, LogOut, ShieldAlert, User, Menu, X, Car } from 'lucide-react';
import { UserFormData } from '../types';

interface DashboardHeaderProps {
  userData: UserFormData;
  onLogout: () => void;
  activeNav?: string;
  onNavClick?: (nav: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userData,
  onLogout,
  activeNav = 'How it works',
  onNavClick,
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
    setSosActive(true);
    alert('🚨 EMERGENCY SOS DISPATCHED: Alert sent to emergency contacts & nearby ScanConnect response team!');
    setTimeout(() => setSosActive(false), 5000);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f5b800] text-neutral-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Left Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('How it works')}>
            <div className="text-white text-2xl sm:text-3xl font-black tracking-tight font-sans drop-shadow-sm flex items-center gap-1.5">
              <span>SCAN CONNECT</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm sm:text-base font-bold text-neutral-900">
            {navItems.map((item) => {
              const isActive = activeNav === item;
              return (
                <button
                  key={item}
                  onClick={() => handleNav(item)}
                  className={`transition-colors relative py-1 cursor-pointer ${
                    isActive
                      ? 'text-neutral-950 underline decoration-2 underline-offset-4'
                      : 'hover:text-neutral-950/80'
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
              className={`relative group px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-black text-xs sm:text-sm text-white flex items-center justify-center cursor-pointer transition-all ${
                sosActive
                  ? 'bg-red-700 animate-bounce ring-4 ring-red-400'
                  : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30 active:scale-95'
              }`}
            >
              <span>SOS</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => alert(`Notifications (2):\n• Parking ping from SC-MH12-9881\n• Shield security scan complete`)}
              className="relative p-2 text-neutral-900 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border-2 border-[#f5b800] rounded-full" />
              )}
            </button>

            {/* Help / FAQ Icon */}
            <button
              onClick={() => alert('ScanConnect Helpdesk:\nCall 080-473-59856 or email rj@sampark.me for 24/7 driver support.')}
              className="p-2 text-neutral-900 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              title="Support & FAQ"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </button>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-black/20 transition-all cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="User Avatar"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-sm"
                />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 text-neutral-800 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900 uppercase truncate">
                      {userData.fullName || 'Kartik Ghodake'}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono truncate">
                      {userData.email || 'driver@scanme.com'}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        alert(`Vehicle ID: SC-MH12-9881\nStatus: Active Privacy Shield`);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <Car className="w-4 h-4 text-[#f5b800]" /> Vehicle Details
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-600" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-900 hover:bg-black/5 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#e0a800] border-t border-black/10 px-4 pt-2 pb-4 space-y-2 font-bold text-neutral-900">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNav(item)}
              className="block w-full text-left py-2 px-3 rounded-lg hover:bg-black/5 transition-colors"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onLogout();
            }}
            className="block w-full text-left py-2 px-3 rounded-lg text-red-700 font-extrabold hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
