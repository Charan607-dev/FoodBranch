import React, { useState } from 'react';
import { Trash2, AlertCircle, Unlink, Utensils, HeartHandshake, Check, ArrowRight } from 'lucide-react';

export const ProblemSection: React.FC<{ onOpenDonate: () => void }> = ({ onOpenDonate }) => {
  const cards = [
    {
      id: 'waste',
      title: 'Food Waste',
      subtitle: 'Surplus without destination',
      description:
        'Restaurants, hotels, supermarkets and households often have wholesome surplus food that remains unused and discarded at closing time.',
      icon: Trash2,
      accentColor: 'text-[#F4A259]',
      accentBg: 'bg-[#F4A259]/10 dark:bg-[#F4A259]/20',
      statLabel: 'Daily Commercial Surplus',
      statValue: '~35% of cooked food',
    },
    {
      id: 'insecurity',
      title: 'Food Insecurity',
      subtitle: 'Nourishment out of reach',
      description:
        'Vulnerable families, elderly citizens, and underserved communities struggle every single day to access regular, dignified, and nutritious meals.',
      icon: AlertCircle,
      accentColor: 'text-amber-600 dark:text-amber-400',
      accentBg: 'bg-amber-600/10 dark:bg-amber-400/20',
      statLabel: 'Nutritional Deficit',
      statValue: 'Over 800M people globally',
    },
    {
      id: 'connection',
      title: 'The Missing Connection',
      subtitle: 'The logistics bottleneck',
      description:
        'Good food and hungry communities exist side by side in the same neighborhoods, but lack a rapid, trusted logistical connection.',
      icon: Unlink,
      accentColor: 'text-[#3C8D58] dark:text-[#4EBE73]',
      accentBg: 'bg-[#3C8D58]/10 dark:bg-[#4EBE73]/20',
      statLabel: 'Average Distance Between Both',
      statValue: 'Under 5 kilometers',
    },
  ];

  return (
    <section id="mission" className="py-20 lg:py-28 bg-[#F8F5EB] dark:bg-[#0E1611] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3C8D58] dark:text-[#4EBE73]">
            <span>The Reality We Are Solving</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#123D2B] dark:text-white tracking-tight text-balance">
            While Food Gets Wasted, Hunger Continues.
          </h2>
          <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-base sm:text-lg leading-relaxed">
            The world produces enough food to feed everyone, yet millions of people still face food
            insecurity. The problem isn't always a lack of food. Sometimes, it's a lack of connection.
          </p>
        </div>

        {/* 3 Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative bg-white dark:bg-[#17231B] rounded-3xl p-7 lg:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] dark:hover:border-[#4EBE73]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${card.accentBg} flex items-center justify-center ${card.accentColor} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono text-[#202820]/40 dark:text-white/40 font-semibold">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#123D2B] dark:text-white mb-1">
                    {card.title}
                  </h3>
                  <div className="text-xs text-[#202820]/50 dark:text-white/50 mb-3 font-medium">
                    {card.subtitle}
                  </div>

                  <p className="text-[#202820]/80 dark:text-[#F8F5EB]/75 text-sm leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#123D2B]/10 dark:border-white/10 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#202820]/50 dark:text-white/45 font-semibold">
                    {card.statLabel}
                  </span>
                  <span className="text-base font-display font-bold text-[#123D2B] dark:text-white tabular-nums">
                    {card.statValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Storytelling Comparison Banner: Dignified & Insightful */}
        <div className="bg-white dark:bg-[#152018] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Image & Visual Evidence */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 shadow-md">
              <img
                src="/src/assets/images/surplus_produce_harvest_1793953125286.jpg"
                alt="Abundance of wholesome surplus bread, produce, and packaged meals ready for rescue"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#123D2B]/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10">
                Fresh & Edible Surplus
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs p-2.5 rounded-xl flex items-center justify-between border border-white/10">
                <span>Safe to eat · High nutrition</span>
                <span className="text-[#F4A259] font-bold">Rescuable Now</span>
              </div>
            </div>

            {/* Right Interactive Comparison Matrix */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F4A259]">
                  The Bridge in Action
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#123D2B] dark:text-white mt-1 mb-3">
                  Turning An Imbalance Into Dignity & Nourishment
                </h3>
                <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-sm sm:text-base leading-relaxed">
                  Food insecurity isn’t resolved by pity; it is resolved through respect, rapid logistics,
                  and verified hygiene standards. FoodBridge closes the gap in under an hour.
                </p>
              </div>

              {/* Segmented Comparison View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F8F5EB] dark:bg-[#1D2C22] border border-[#123D2B]/10 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center text-xs font-bold">
                      ✕
                    </div>
                    <span className="text-sm font-bold text-[#123D2B] dark:text-white">The Old Broken Path</span>
                  </div>
                  <ul className="text-xs text-[#202820]/75 dark:text-[#F8F5EB]/75 space-y-2">
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500">•</span>
                      Surplus discarded due to lack of immediate cold transport.
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500">•</span>
                      Shelters scramble with uncoordinated ad-hoc donations.
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500">•</span>
                      Zero traceability or temperature audit trails.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#3C8D58]/10 dark:bg-[#183523] border border-[#3C8D58]/20 dark:border-[#4EBE73]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-[#3C8D58] dark:bg-[#4EBE73] text-white dark:text-[#0E1611] flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-sm font-bold text-[#123D2B] dark:text-white">The FoodBridge Solution</span>
                  </div>
                  <ul className="text-xs text-[#202820]/85 dark:text-[#F8F5EB]/85 space-y-2">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#3C8D58] dark:text-[#4EBE73] font-bold">•</span>
                      1-click instant pickup notification to nearest verified NGO.
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#3C8D58] dark:text-[#4EBE73] font-bold">•</span>
                      Insulated food-grade carriers preserve warm meals.
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#3C8D58] dark:text-[#4EBE73] font-bold">•</span>
                      Guaranteed delivery to community recipients with full dignity.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between flex-wrap gap-4">
                <div className="text-xs text-[#202820]/65 dark:text-[#F8F5EB]/65">
                  Ready to stop surplus food from going to landfill?
                </div>
                <button
                  onClick={onOpenDonate}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#123D2B] dark:bg-[#1E3A2A] hover:bg-[#0B261B] dark:hover:bg-[#284E38] rounded-xl flex items-center gap-2 transition-colors border border-transparent dark:border-white/10"
                >
                  <span>Donate Today</span>
                  <ArrowRight className="w-4 h-4 text-[#F4A259]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
