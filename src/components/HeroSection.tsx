import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Heart, Clock, CheckCircle2 } from 'lucide-react';
import heroImage from '../assets/images/hero_food_donation_boxes_1793953124158.jpg';

interface HeroSectionProps {
  onOpenDonate: () => void;
  onExploreMission: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDonate,
  onExploreMission,
}) => {
  // Gentle simulated ticker for today's rescue count
  const [todayMeals, setTodayMeals] = useState(1420);

  useEffect(() => {
    const timer = setInterval(() => {
      setTodayMeals((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative pt-28 sm:pt-36 pb-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-[#F8F5EB] via-[#F8F5EB] to-[#F2EDE0] dark:from-[#0E1611] dark:via-[#111A14] dark:to-[#0A100C] transition-colors duration-300"
    >
      {/* Decorative organic ambient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#3C8D58]/10 via-[#F4A259]/15 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Narrative & Action */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8">
            {/* Small Kicker Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#123D2B]/8 dark:bg-[#1B3626] text-[#123D2B] dark:text-[#4EBE73] text-xs sm:text-sm font-semibold tracking-wide w-fit border border-[#123D2B]/10 dark:border-[#3C8D58]/30">
              <span className="text-base">🌱</span>
              <span>Building a World Without Food Waste</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#123D2B] dark:text-white tracking-tight leading-[1.15] text-balance">
              One Meal Can{' '}
              <span className="relative inline-block text-[#3C8D58] dark:text-[#4EBE73]">
                Change A Life.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#F4A259] -z-10"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9C50 2 150 2 198 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              Let's Make Every Meal Count.
            </h1>

            {/* Supporting Text */}
            <p className="text-[#202820]/80 dark:text-[#F8F5EB]/85 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl">
              Every day, perfectly good food goes to waste while millions struggle to find their next meal.
              <strong className="font-semibold text-[#123D2B] dark:text-white"> FoodBridge</strong> connects restaurants,
              businesses, and generous individuals with communities that need food the most.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onOpenDonate}
                className="group px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-[#F4A259] to-[#E89143] hover:from-[#E89143] hover:to-[#D47D30] rounded-2xl shadow-[0_8px_24px_rgba(244,162,89,0.35)] hover:shadow-[0_12px_32px_rgba(244,162,89,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 whitespace-nowrap"
              >
                <span>Donate Surplus Food</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreMission}
                className="px-6 py-4 text-base font-semibold text-[#123D2B] dark:text-white bg-white dark:bg-[#17231B] hover:bg-[#F2EDE0] dark:hover:bg-[#1E2D22] border border-[#123D2B]/15 dark:border-white/10 rounded-2xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Explore Our Mission</span>
              </button>
            </div>

            {/* Trust Indicator & Live Metric Proof */}
            <div className="pt-2 border-t border-[#123D2B]/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#202820]/75 dark:text-[#F8F5EB]/75">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3C8D58] dark:bg-[#4EBE73]" />
                <span className="font-semibold text-[#123D2B] dark:text-white">
                  Together, we can turn food waste into hope.
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#202820]/60 dark:text-[#F8F5EB]/60">
                <CheckCircle2 className="w-4 h-4 text-[#3C8D58] dark:text-[#4EBE73]" />
                <span>Verified NGO Network</span>
                <span className="mx-1">·</span>
                <Clock className="w-4 h-4 text-[#F4A259]" />
                <span>Average 45-min pickup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Primary Visual: Packing fresh donation boxes */}
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] border-4 border-white dark:border-[#1E2D22] aspect-[4/3] bg-neutral-200 dark:bg-neutral-800">
                <img
  src={heroImage}
  alt="FoodBridge volunteers carefully packing fresh surplus meals into donation boxes"
  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
/>
                {/* Subtle gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#123D2B]/60 via-transparent to-transparent pointer-events-none" />

                {/* Bottom caption overlay */}
                <div className="absolute bottom-3 left-4 right-4 text-white text-xs font-medium bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center justify-between border border-white/10">
                  <span className="truncate">Kitchen Team · Verified Fresh Packaging</span>
                  <span className="text-[#F4A259] font-bold">100% Safe</span>
                </div>
              </div>

              {/* Secondary Inset Visual: Volunteer delivering meal package */}
              <div className="absolute -bottom-8 -left-6 sm:-left-10 w-44 sm:w-52 aspect-[16/10] rounded-2xl overflow-hidden border-3 border-white dark:border-[#1E2D22] shadow-[0_12px_30px_rgba(0,0,0,0.2)] bg-neutral-200 hidden xs:block">
                <img
                  src="/src/assets/images/food_rescue_community_delivery_1793953125208.jpg"
                  alt="FoodBridge volunteer delivering fresh meal crate to community partner"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Glassmorphism Card 1: Meals Shared Today */}
              <div className="absolute -top-6 -right-4 sm:-right-6 bg-white/95 dark:bg-[#17231B]/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_14px_35px_rgba(0,0,0,0.14)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.4)] border border-[#123D2B]/10 dark:border-white/15 max-w-[210px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#3C8D58]/15 dark:bg-[#4EBE73]/20 text-[#3C8D58] dark:text-[#4EBE73] flex items-center justify-center font-bold">
                    🍲
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#123D2B]/70 dark:text-[#F8F5EB]/70">
                    Meals Shared Today
                  </span>
                </div>
                <div className="text-2xl font-display font-extrabold text-[#123D2B] dark:text-white tabular-nums">
                  {todayMeals.toLocaleString()}
                  <span className="text-sm font-semibold text-[#3C8D58] dark:text-[#4EBE73] ml-1">+</span>
                </div>
                <p className="text-[11px] text-[#202820]/60 dark:text-[#F8F5EB]/60 mt-0.5">
                  Delivered fresh across active hubs
                </p>
              </div>

              {/* Floating Badge 2: Every Meal Matters */}
              <div className="absolute -bottom-5 right-2 sm:right-6 bg-[#123D2B] dark:bg-[#1B3626] text-white px-4 py-2.5 rounded-full shadow-lg border border-white/20 dark:border-white/10 flex items-center gap-2">
                <Heart className="w-4 h-4 fill-[#F4A259] text-[#F4A259]" />
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  Every Meal Matters
                </span>
                <span className="text-xs">❤️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
