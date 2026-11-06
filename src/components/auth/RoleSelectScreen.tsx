import React from 'react';
import { UserRole } from '../../types';
import { UtensilsCrossed, Building2, Heart, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Truck } from 'lucide-react';

interface RoleSelectScreenProps {
  onSelectRole: (role: UserRole) => void;
  onBackToWebsite: () => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  onSelectRole,
  onBackToWebsite,
}) => {
  const roles = [
    {
      role: 'donor' as UserRole,
      title: 'Food Donor',
      tagline: 'Restaurants, Hotels & Caterers',
      description: 'Have surplus food? Share it with communities that need it.',
      buttonText: 'Continue as Donor',
      icon: UtensilsCrossed,
      accent: 'border-[#3C8D58]/30 hover:border-[#3C8D58]',
      iconBg: 'bg-[#3C8D58]/15 text-[#3C8D58] dark:bg-[#4EBE73]/20 dark:text-[#4EBE73]',
      hoverGlow: 'hover:shadow-[0_20px_40px_rgba(60,141,88,0.18)]',
      demoName: 'Chef Priya Sharma',
      badge: 'Immediate Tax & Impact Tracking',
    },
    {
      role: 'ngo' as UserRole,
      title: 'NGO Partner',
      tagline: 'Shelters, Pantries & Kitchens',
      description: 'Discover food donations and connect with communities in need.',
      buttonText: 'Continue as NGO',
      icon: Building2,
      accent: 'border-[#123D2B]/30 hover:border-[#123D2B] dark:border-white/20 dark:hover:border-white',
      iconBg: 'bg-[#123D2B]/15 text-[#123D2B] dark:bg-white/10 dark:text-white',
      hoverGlow: 'hover:shadow-[0_20px_40px_rgba(18,61,43,0.22)]',
      demoName: 'Rajesh Nair',
      badge: 'Zero-Cost Fresh Supply Channel',
    },
    {
      role: 'volunteer' as UserRole,
      title: 'Volunteer',
      tagline: 'Couriers, Students & Champions',
      description: 'Help collect and deliver surplus food to people who need it.',
      buttonText: 'Continue as Volunteer',
      icon: Heart,
      accent: 'border-[#F4A259]/40 hover:border-[#F4A259]',
      iconBg: 'bg-[#F4A259]/20 text-[#F4A259]',
      hoverGlow: 'hover:shadow-[0_20px_40px_rgba(244,162,89,0.25)]',
      demoName: 'Vikram Rao',
      badge: 'Flexible Local Delivery Shifts',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EB] dark:bg-[#0E1611] text-[#202820] dark:text-[#F4F6F4] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3C8D58]/10 dark:bg-[#3C8D58]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F4A259]/10 dark:bg-[#F4A259]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar with Back Button */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#123D2B] dark:text-white hover:text-[#3C8D58] dark:hover:text-[#4EBE73] bg-white dark:bg-[#16221A] px-4 py-2 rounded-xl border border-[#123D2B]/10 dark:border-white/10 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to FoodBridge Homepage</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#202820]/60 dark:text-white/60">
          <ShieldCheck className="w-4 h-4 text-[#3C8D58] dark:text-[#4EBE73]" />
          <span>Secure Role-Based Portal</span>
        </div>
      </div>

      {/* Center Content */}
      <div className="max-w-5xl mx-auto w-full my-auto py-12 z-10 text-center">
        {/* Header */}
        <div className="space-y-4 max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#123D2B]/8 dark:bg-[#1B3626] text-[#123D2B] dark:text-[#4EBE73] text-xs font-bold uppercase tracking-wider border border-[#123D2B]/10 dark:border-[#3C8D58]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#F4A259]" />
            <span>Welcome to FoodBridge</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#123D2B] dark:text-white tracking-tight text-balance">
            Choose how you want to make a difference.
          </h1>

          <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-base sm:text-lg leading-relaxed">
            Every member of the FoodBridge ecosystem plays a vital part in transforming surplus meals
            into hope. Select your role to access your dedicated dashboard.
          </p>
        </div>

        {/* 3 Interactive Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className={`group relative bg-white dark:bg-[#16221A] rounded-3xl p-8 border-2 ${item.accent} shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] ${item.hoverGlow} hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#202820]/50 dark:text-white/40 font-bold">
                      {item.role.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-[#123D2B] dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#3C8D58] dark:text-[#4EBE73] font-semibold mb-4">
                    {item.tagline}
                  </div>

                  <p className="text-[#202820]/80 dark:text-[#F8F5EB]/75 text-sm leading-relaxed mb-6">
                    "{item.description}"
                  </p>

                  <div className="text-[11px] font-semibold text-[#123D2B] dark:text-white bg-[#F8F5EB] dark:bg-[#1D2C22] p-2.5 rounded-xl mb-8 flex items-center gap-2 border border-[#123D2B]/5 dark:border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3C8D58] dark:bg-[#4EBE73]" />
                    <span>{item.badge}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => onSelectRole(item.role)}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#123D2B] dark:bg-[#203D2B] hover:bg-[#0B261B] dark:hover:bg-[#2A4F38] text-white flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg cursor-pointer"
                  >
                    <span>{item.buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="mt-3 text-center text-[11px] text-[#202820]/50 dark:text-white/50">
                    Includes instant demo account: <strong className="text-[#123D2B] dark:text-white">{item.demoName}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-[#202820]/50 dark:text-white/40 z-10">
        © 2026 FoodBridge. Role isolation enforced with strict database-level security policies.
      </div>
    </div>
  );
};
