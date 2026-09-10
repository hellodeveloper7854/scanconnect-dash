import React, { useEffect, useState } from 'react';
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

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  linkPath: string | null;
  isRead: boolean;
  createdAt: string;
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

  // Real, per-user notifications — only ever fetched while signed in. Signing
  // out clears everything back to empty so a stale badge/list from the
  // previous session can never leak into a logged-out header.
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  const loadNotifications = () => {
    api
      .get<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications')
      .then((res) => {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
        setNotificationsLoaded(true);
      })
      .catch(() => setNotificationsLoaded(true));
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsOpen(false);
      setNotificationsLoaded(false);
      return;
    }
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const toggleNotifications = () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (opening) {
      if (!notificationsLoaded) loadNotifications();
      if (unreadCount > 0) {
        api
          .patch('/api/notifications/read-all')
          .then(() => {
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          })
          .catch(() => {});
      }
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    setNotificationsOpen(false);
    if (n.linkPath) {
      const target = n.linkPath.replace(/^\//, '');
      handleNav(target === 'orders' ? 'My Orders' : target === 'profile' ? 'Profile' : target);
    }
  };

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
    <header className="sticky top-0 z-50 bg-[#FFED00] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Left Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => handleNav('How it works')}>
            <img src={logoImg} alt="Scan Connect" className="h-5 sm:h-7 md:h-11 w-auto object-contain max-w-[140px] sm:max-w-[170px] md:max-w-none" />
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
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* SOS Emergency Button — always visible, highest priority */}
            <button
              onClick={triggerSosAlert}
              title="Trigger Emergency SOS"
              className={`relative group w-11 h-11 sm:w-13 sm:h-13 rounded-full font-extrabold text-sm text-white flex items-center justify-center cursor-pointer transition-all shadow-lg overflow-hidden shrink-0 ${
                sosActive
                  ? 'bg-red-700 animate-bounce ring-4 ring-red-400'
                  : 'bg-[#FF0022] hover:bg-red-700 active:scale-95 border-2 border-white/60'
              }`}
            >
              {!sosActive && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-sos-pulse-ring pointer-events-none" />
              )}
              <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                <span className="absolute inset-y-0 left-0 w-1/3 bg-white/40 blur-[2px] animate-sos-shimmer" />
              </span>
              <span className="relative z-10">SOS</span>
            </button>

            {/* Notification Bell — signed-in users only, desktop (mobile drawer has its own copy below) */}
            {isLoggedIn && (
              <div className="hidden md:block relative">
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 text-[#1B1C1C] hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border-2 border-[#FFED00] rounded-full" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto bg-white rounded-xl shadow-xl border border-neutral-200 py-2 text-neutral-800 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs font-bold text-neutral-900 uppercase">Notifications</p>
                    </div>
                    {!notificationsLoaded ? (
                      <p className="px-4 py-6 text-sm text-neutral-400 text-center">Loading...</p>
                    ) : notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-neutral-400 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left px-4 py-3 border-b border-neutral-50 last:border-b-0 hover:bg-amber-50/60 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <p className="text-xs font-bold text-neutral-900">{n.title}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-neutral-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Help / FAQ Icon — desktop only, moved into hamburger drawer on mobile */}
            <button
              onClick={() => alert('ScanConnect Helpdesk:\nCall 080-473-59856 or email support@scanconnect.com for 24/7 driver support.')}
              className="hidden md:inline-flex p-2 text-[#1B1C1C] hover:bg-black/10 rounded-full transition-colors cursor-pointer"
              title="Support & FAQ"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </button>

            {/* User Profile Avatar / Login Button — desktop only, moved into hamburger drawer on mobile */}
            {isLoggedIn ? (
              <div className="hidden md:flex relative items-center gap-1">
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
                className="hidden md:inline-flex px-3.5 py-1.5 sm:px-4 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-[#FFED00] font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer items-center gap-1.5 border border-[#FFED00]/30"
              >
                <User className="w-3.5 h-3.5 text-[#FFED00]" />
                <span>Login / Register</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-1 text-[#1B1C1C] hover:bg-black/10 rounded-lg shrink-0"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFED00] border-t border-black/10 px-4 pt-2 pb-4 space-y-2 font-['Rubik',sans-serif] font-bold text-[#1B1C1C]">
          {navItems.map((item) => {
            const isActive = activeNav === item;
            return (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#1B1C1C] underline decoration-2 underline-offset-4'
                    : 'hover:bg-black/10'
                }`}
              >
                {item}
              </button>
            );
          })}

          {/* Secondary icons moved out of the top bar to reduce mobile crowding */}
          <div className="border-t border-black/10 pt-2 space-y-1">
            {isLoggedIn && (
              <div>
                <button
                  onClick={toggleNotifications}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-black/10 flex items-center gap-2.5"
                >
                  <span className="relative inline-flex">
                    <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-600 border border-[#e0a800] rounded-full" />
                    )}
                  </span>
                  Notifications
                </button>
                {notificationsOpen && (
                  <div className="ml-3 mr-1 mb-2 max-h-[300px] overflow-y-auto bg-white/95 rounded-lg border border-black/10 divide-y divide-black/5">
                    {!notificationsLoaded ? (
                      <p className="px-3 py-4 text-xs text-neutral-500 text-center">Loading...</p>
                    ) : notifications.length === 0 ? (
                      <p className="px-3 py-4 text-xs text-neutral-500 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            handleNotificationClick(n);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-amber-50/60 cursor-pointer"
                        >
                          <p className="text-xs font-bold text-neutral-900">{n.title}</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{n.body}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                alert('ScanConnect Helpdesk:\nCall 080-473-59856 or email support@scanconnect.com for 24/7 driver support.');
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-black/10 flex items-center gap-2.5"
            >
              <HelpCircle className="w-4.5 h-4.5 stroke-[2.2]" /> Support &amp; FAQ
            </button>
          </div>

          <div className="border-t border-black/10 pt-2 space-y-1">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNav('Profile')}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-black/10 font-extrabold flex items-center gap-2.5"
                >
                  <User className="w-4.5 h-4.5" /> My Profile
                </button>
                <button
                  onClick={() => handleNav('My Orders')}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-black/10 font-extrabold flex items-center gap-2.5"
                >
                  <Package className="w-4.5 h-4.5" /> My Orders
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-red-800 font-extrabold hover:bg-red-500/20 flex items-center gap-2.5"
                >
                  <LogOut className="w-4.5 h-4.5" /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav('Profile')}
                className="block w-full text-left py-2 px-3 rounded-lg bg-neutral-950 text-[#FFED00] font-extrabold hover:bg-neutral-900"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
