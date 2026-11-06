import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../types';
import { foodbridgeService } from '../../services/foodbridgeService';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import {
  ArrowLeft,
  UtensilsCrossed,
  Building2,
  Heart,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  MapPin,
  Compass,
} from 'lucide-react';

interface AuthScreenProps {
  selectedRole: UserRole;
  onSuccess: (user: UserProfile) => void;
  onBackToRoles: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  selectedRole,
  onSuccess,
  onBackToRoles,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [lat, setLat] = useState<number>(
    selectedRole === 'ngo' ? 12.962 : selectedRole === 'volunteer' ? 12.9345 : 12.9784
  );
  const [lng, setLng] = useState<number>(
    selectedRole === 'ngo' ? 77.6145 : selectedRole === 'volunteer' ? 77.6265 : 77.6408
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleMeta = {
    donor: {
      title: 'Food Donor Portal',
      icon: UtensilsCrossed,
      color: 'text-[#3C8D58]',
      accentBg: 'bg-[#3C8D58]/15',
      demoEmail: 'priya@curryhouse.com',
      demoName: 'Chef Priya Sharma',
      orgPlaceholder: 'e.g. The Curry House Restaurant',
      addressPlaceholder: 'e.g. 100ft Road, Indiranagar',
    },
    ngo: {
      title: 'NGO Partner Portal',
      icon: Building2,
      color: 'text-[#123D2B] dark:text-white',
      accentBg: 'bg-[#123D2B]/15 dark:bg-white/10',
      demoEmail: 'rajesh@hopefoundation.org',
      demoName: 'Rajesh Nair',
      orgPlaceholder: 'e.g. Hope Community Care Foundation',
      addressPlaceholder: 'e.g. Austin Town, Near Community Center',
    },
    volunteer: {
      title: 'Volunteer Courier Portal',
      icon: Heart,
      color: 'text-[#F4A259]',
      accentBg: 'bg-[#F4A259]/20',
      demoEmail: 'vikram.rao@volunteer.org',
      demoName: 'Vikram Rao',
      orgPlaceholder: 'e.g. Independent Courier / Volunteer Corps',
      addressPlaceholder: 'e.g. Koramangala 4th Block',
    },
  }[selectedRole];

  const Icon = roleMeta.icon;

  const handleDemoOneClick = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await foodbridgeService.login(roleMeta.demoEmail, selectedRole);
    setIsSubmitting(false);
    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Failed to log in with demo account.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please enter a valid phone number for dispatch alerts.');
        return;
      }
      if (selectedRole === 'ngo' && !orgName.trim()) {
        setErrorMsg('Please specify your NGO / Foundation organization name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      setIsSubmitting(true);
      const res = await foodbridgeService.register({
        fullName,
        email,
        phone,
        role: selectedRole,
        organizationName: orgName.trim() || undefined,
        address: address.trim() || (selectedRole === 'ngo' ? 'Austin Town, Bengaluru' : 'Bengaluru Central'),
        city: city.trim() || 'Bengaluru',
        latitude: lat,
        longitude: lng,
      });
      setIsSubmitting(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } else {
      setIsSubmitting(true);
      const res = await foodbridgeService.login(email, selectedRole);
      setIsSubmitting(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Invalid credentials or role mismatch.');
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email above to receive password reset instructions.');
      return;
    }
    setErrorMsg(null);
    setInfoMsg(`Password recovery link dispatched to ${email}. (Demo simulation)`);
  };

  return (
    <div className="min-h-screen bg-[#F8F5EB] dark:bg-[#0E1611] text-[#202820] dark:text-[#F4F6F4] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-[#3C8D58]/10 dark:bg-[#3C8D58]/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between z-10 mb-6">
        <button
          onClick={onBackToRoles}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#123D2B] dark:text-white hover:text-[#3C8D58] dark:hover:text-[#4EBE73] bg-white dark:bg-[#16221A] px-4 py-2 rounded-xl border border-[#123D2B]/10 dark:border-white/10 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch Role</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#123D2B]/5 dark:bg-white/10 uppercase tracking-wider text-[#123D2B] dark:text-white">
          Role: {selectedRole}
        </span>
      </div>

      {/* Main Auth Container */}
      <div className="max-w-md mx-auto w-full z-10">
        <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#123D2B]/10 dark:border-white/10">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className={`w-14 h-14 rounded-2xl ${roleMeta.accentBg} ${roleMeta.color} flex items-center justify-center mx-auto mb-3 shadow-sm`}
            >
              <Icon className="w-7 h-7" />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
              {roleMeta.title}
            </h1>
            <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-1">
              {isSignUp
                ? `Create a verified ${selectedRole.toUpperCase()} account`
                : `Sign in to access your ${selectedRole.toUpperCase()} dashboard`}
            </p>
          </div>

          {/* Quick 1-Click Demo Login Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#123D2B]/5 via-[#3C8D58]/10 to-[#123D2B]/5 dark:from-white/5 dark:to-white/5 border border-[#3C8D58]/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#F4A259] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#123D2B] dark:text-white">
                  1-Click Demo Login
                </span>
                <span className="text-[11px] text-[#202820]/60 dark:text-white/60">
                  {roleMeta.demoName} ({roleMeta.demoEmail})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoOneClick}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-[#3C8D58] hover:bg-[#327749] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-[#F8F5EB] dark:bg-black/30 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-white dark:bg-[#16221A] text-[#123D2B] dark:text-white shadow-sm'
                  : 'text-[#202820]/60 dark:text-white/60 hover:text-[#123D2B]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-white dark:bg-[#16221A] text-[#123D2B] dark:text-white shadow-sm'
                  : 'text-[#202820]/60 dark:text-white/60 hover:text-[#123D2B]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-5 p-3 rounded-xl bg-[#3C8D58]/10 border border-[#3C8D58]/20 text-[#3C8D58] dark:text-[#4EBE73] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-[#202820]/40 dark:text-white/40" />
                    <input
                      type="text"
                      placeholder="e.g. Ananya Sen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    {selectedRole === 'ngo' ? 'NGO Name' : 'Organization Name'} {selectedRole === 'ngo' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={roleMeta.orgPlaceholder}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#202820]/40 dark:text-white/40" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                    />
                  </div>
                </div>

                {/* Address & City */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                      Street / Area
                    </label>
                    <input
                      type="text"
                      placeholder={roleMeta.addressPlaceholder}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                    />
                  </div>
                </div>

                {/* Optional Location Pin button */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className="w-full py-2 px-3 rounded-xl border border-[#3C8D58]/30 bg-[#3C8D58]/10 text-xs font-bold text-[#123D2B] dark:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#3C8D58]" />
                    <span>{showLocationPicker ? 'Hide Map Location' : 'Pin Exact Location on Map'}</span>
                  </button>
                </div>

                {showLocationPicker && (
                  <div className="pt-1">
                    <LocationPickerMap
                      title="Set Your Registration Location"
                      initialLat={lat}
                      initialLng={lng}
                      initialAddress={address}
                      roleTheme={selectedRole}
                      confirmButtonText="Save Pinned Location"
                      onConfirmLocation={(loc) => {
                        setAddress(loc.address);
                        setLat(loc.lat);
                        setLng(loc.lng);
                        if (loc.city) setCity(loc.city);
                        setShowLocationPicker(false);
                      }}
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#202820]/40 dark:text-white/40" />
                <input
                  type="email"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white">
                  Password <span className="text-red-500">*</span>
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-[#3C8D58] dark:text-[#4EBE73] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#202820]/40 dark:text-white/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-[#202820]/40 dark:text-white/40" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#123D2B] hover:bg-[#1A543C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {isSubmitting
                  ? 'Verifying Credentials...'
                  : isSignUp
                  ? `Create ${selectedRole.toUpperCase()} Account`
                  : `Sign In as ${selectedRole.toUpperCase()}`}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#202820]/50 dark:text-white/40 mt-8 z-10">
        FoodBridge &bull; Good Food. Better Futures. &bull; Secure Location-Aware Rescue Network
      </div>
    </div>
  );
};
