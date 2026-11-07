import React, { useState, useEffect } from 'react';
import { Menu, X, HeartHandshake, User, ArrowRight, ShieldCheck, Sun, Moon, Database } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  onOpenDonate: () => void;
  onOpenLogin: () => void;
  onGoToDashboard?: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDbStatus?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDonate,
  onOpenLogin,
  onGoToDashboard,
  userSession,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onOpenDbStatus,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Our Mission', href: '#mission' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Our Impact', href: '#impact-dashboard' },
    { label: 'Stories', href: '#stories' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F8F5EB]/90 dark:bg-[#0E1611]/90 backdrop-blur-md border-b border-[#123D2B]/10 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Brand Zone */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-2.5 group whitespace-nowrap shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#123D2B] dark:bg-[#1B3626] flex items-center justify-center text-white shadow-md shadow-[#123D2B]/20 dark:shadow-black/40 border border-[#123D2B]/20 dark:border-[#3C8D58]/30 transition-transform duration-200 group-hover:scale-105">
              {/* Creative leaf + bridge bowl SVG icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round text-[#F4A259]"
              >
                <path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9S3 7.03 3 12a9 9 0 0 0 9 9Z" className="stroke-[#3C8D58] dark:stroke-[#4EBE73]" />
                <path d="M7 13c1.5 2 4 3 5 3s3.5-1 5-3" className="stroke-[#F4A259]" />
                <path d="M12 7c-1.5 2-1 4.5 0 6 1-1.5 1.5-4 0-6Z" fill="#3C8D58" stroke="none" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#123D2B] dark:text-[#F8F5EB]">
                Food<span className="text-[#3C8D58] dark:text-[#4EBE73]">Bridge</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#202820]/80 dark:text-[#F8F5EB]/80">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="hover:text-[#123D2B] dark:hover:text-[#4EBE73] hover:font-semibold transition-colors duration-150 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3C8D58] dark:after:bg-[#4EBE73] hover:after:w-full after:transition-all after:duration-200 whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#123D2B]/5 hover:bg-[#123D2B]/10 dark:bg-white/10 dark:hover:bg-white/15 text-[#123D2B] dark:text-[#F4A259] border border-[#123D2B]/10 dark:border-white/15 transition-all duration-200 cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[#F4A259] transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-[#123D2B] transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>


            {/* Login or User badge (desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              {userSession?.isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#123D2B]/5 dark:bg-white/10 px-3 py-1.5 rounded-xl border border-[#123D2B]/10 dark:border-white/15">
                    <ShieldCheck className="w-4 h-4 text-[#3C8D58] dark:text-[#4EBE73]" />
                    <span className="text-xs font-semibold text-[#123D2B] dark:text-white whitespace-nowrap">
                      {userSession.name || userSession.user?.fullName} ({((userSession.role || userSession.user?.role) || 'donor').toUpperCase()})
                    </span>
                    <button
                      onClick={onLogout}
                      className="text-xs text-[#202820]/60 dark:text-white/60 hover:text-red-500 font-medium ml-1 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                  {onGoToDashboard && (
                    <button
                      onClick={onGoToDashboard}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#123D2B] dark:text-white bg-[#3C8D58]/15 dark:bg-[#4EBE73]/20 hover:bg-[#3C8D58]/25 dark:hover:bg-[#4EBE73]/30 rounded-xl border border-[#3C8D58]/30 dark:border-[#4EBE73]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>My Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#3C8D58] dark:text-[#4EBE73]" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-sm font-semibold text-[#123D2B] dark:text-[#F8F5EB] hover:text-[#3C8D58] dark:hover:text-[#4EBE73] transition-colors rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Register</span>
                </button>
              )}

              <button
                onClick={onOpenDonate}
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#F4A259] to-[#E89143] hover:from-[#E89143] hover:to-[#D47D30] rounded-xl shadow-[0_4px_14px_rgba(244,162,89,0.35)] hover:shadow-[0_6px_20px_rgba(244,162,89,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Donate Food</span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={onOpenDonate}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#F4A259] rounded-lg shadow-sm"
              >
                Donate
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-[#123D2B] dark:text-white hover:bg-[#123D2B]/10 dark:hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-[#123D2B]/10 dark:border-white/10 bg-[#F8F5EB] dark:bg-[#121B15] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base font-semibold text-[#202820] dark:text-white hover:text-[#3C8D58] dark:hover:text-[#4EBE73] py-2 px-3 rounded-lg hover:bg-[#123D2B]/5 dark:hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[#123D2B]/10 dark:border-white/10 flex flex-col gap-2.5">
              {userSession?.isLoggedIn ? (
                <div className="flex flex-col gap-2 p-3 bg-[#123D2B]/5 dark:bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#123D2B] dark:text-white">
                      {userSession.name || userSession.user?.fullName} ({((userSession.role || userSession.user?.role) || 'donor').toUpperCase()})
                    </span>
                    <button onClick={onLogout} className="text-xs text-red-500 font-semibold cursor-pointer">
                      Logout
                    </button>
                  </div>
                  {onGoToDashboard && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onGoToDashboard();
                      }}
                      className="w-full py-2 text-xs font-bold text-[#123D2B] dark:text-white bg-[#3C8D58]/20 dark:bg-[#4EBE73]/20 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <span>Open My Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-2.5 text-sm font-semibold text-[#123D2B] dark:text-white bg-[#123D2B]/5 dark:bg-white/10 hover:bg-[#123D2B]/10 rounded-xl text-center"
                >
                  Partner / Volunteer Login
                </button>
              )}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDonate();
                }}
                className="w-full py-3 text-sm font-bold text-white bg-[#F4A259] hover:bg-[#E89143] rounded-xl text-center shadow-md flex items-center justify-center gap-2"
              >
                <span>Donate Surplus Food</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenDbStatus && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDbStatus();
                  }}
                  className="w-full py-2 text-xs font-semibold text-[#123D2B] dark:text-[#F8F5EB]/80 bg-[#123D2B]/5 dark:bg-white/5 hover:bg-[#123D2B]/10 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#3C8D58]" />
                  <span>Database & Sync Architecture</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
