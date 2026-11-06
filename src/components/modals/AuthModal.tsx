import React, { useState } from 'react';
import { X, User, Store, Building2, Heart, ArrowRight } from 'lucide-react';
import { UserSession } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = (role: 'donor' | 'ngo' | 'volunteer', name: string, org: string) => {
    onLogin({
      isLoggedIn: true,
      role,
      name,
      organization: org,
    });
    onClose();
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin({
      isLoggedIn: true,
      role: 'donor',
      name: email.split('@')[0],
      organization: 'Community Partner',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#152219] text-[#202820] dark:text-white rounded-3xl shadow-2xl border border-[#123D2B]/10 dark:border-white/15 overflow-hidden">
        {/* Header */}
        <div className="bg-[#123D2B] dark:bg-[#112318] text-white p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F4A259]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">FoodBridge Portal</h3>
              <p className="text-xs text-[#F8F5EB]/70">Access your donor or volunteer account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* 1-Click Fast Demo Login Roles */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3C8D58] dark:text-[#4EBE73] block mb-2">
              One-Click Interactive Demo Profiles
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleDemoLogin('donor', 'Chef Priya', 'The Curry House')
                }
                className="w-full p-3 rounded-xl border border-[#123D2B]/10 dark:border-white/10 bg-white dark:bg-[#1D2C22] hover:border-[#3C8D58] dark:hover:border-[#4EBE73] hover:bg-[#3C8D58]/5 dark:hover:bg-[#4EBE73]/10 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#3C8D58]/10 dark:bg-[#4EBE73]/20 text-[#3C8D58] dark:text-[#4EBE73] flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#123D2B] dark:text-white">Chef Priya Sharma</div>
                    <div className="text-[11px] text-[#202820]/60 dark:text-white/60">Food Donor · Restaurant Partner</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#202820]/40 dark:text-white/40 group-hover:text-[#3C8D58] dark:group-hover:text-[#4EBE73] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDemoLogin('ngo', 'Rajesh Nair', 'Hope Foundation')
                }
                className="w-full p-3 rounded-xl border border-[#123D2B]/10 dark:border-white/10 bg-white dark:bg-[#1D2C22] hover:border-[#F4A259] hover:bg-[#F4A259]/5 dark:hover:bg-[#F4A259]/10 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F4A259]/10 dark:bg-[#F4A259]/20 text-[#F4A259] flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#123D2B] dark:text-white">Rajesh Nair</div>
                    <div className="text-[11px] text-[#202820]/60 dark:text-white/60">NGO Coordinator · Hope Shelter</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#202820]/40 dark:text-white/40 group-hover:text-[#F4A259] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDemoLogin('volunteer', 'Ananya Sen', 'Campus Collective')
                }
                className="w-full p-3 rounded-xl border border-[#123D2B]/10 dark:border-white/10 bg-white dark:bg-[#1D2C22] hover:border-[#3C8D58] dark:hover:border-[#4EBE73] hover:bg-[#3C8D58]/5 dark:hover:bg-[#4EBE73]/10 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#123D2B]/10 dark:bg-white/10 text-[#123D2B] dark:text-white flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#3C8D58] dark:text-[#4EBE73]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#123D2B] dark:text-white">Ananya Sen</div>
                    <div className="text-[11px] text-[#202820]/60 dark:text-white/60">Volunteer Courier · Student Lead</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#202820]/40 dark:text-white/40 group-hover:text-[#3C8D58] dark:group-hover:text-[#4EBE73] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#123D2B]/10 dark:border-white/10"></div>
            <span className="flex-shrink mx-3 text-xs text-[#202820]/40 dark:text-white/40 font-mono">or sign in with email</span>
            <div className="flex-grow border-t border-[#123D2B]/10 dark:border-white/10"></div>
          </div>

          <form onSubmit={handleStandardSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#123D2B] dark:text-white mb-1">Email</label>
              <input
                type="email"
                placeholder="partner@foodbridge.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#123D2B] dark:text-white mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#123D2B] dark:bg-[#203D2B] hover:bg-[#0B261B] dark:hover:bg-[#2A4F38] text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
