import React, { useState } from 'react';
import { Smartphone, Route, Sparkles, Clock, CheckCircle2, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenDonate: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenDonate }) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const steps = [
    {
      number: '01',
      title: 'Share Your Food',
      subtitle: 'Surplus notification in 60s',
      description:
        'Restaurants, hotels, caterers, supermarkets, and event organizers submit details about available surplus—quantity, food type, and pickup window.',
      icon: Smartphone,
      details: [
        'Select food category (Cooked, Bakery, Produce)',
        'Specify available quantity and preparation time',
        'Automatic temperature packaging instructions',
      ],
      interactivePreview: {
        badge: 'Donor Interface Preview',
        headline: 'Surplus Batch #FB-4029',
        subtext: '45 portions fresh vegetable biryani ready for pickup',
        status: 'Active · Ready for Courier',
      },
    },
    {
      number: '02',
      title: 'Connect & Coordinate',
      subtitle: 'Smart algorithmic dispatch',
      description:
        'FoodBridge instantly pings verified NGO partners and trained neighborhood couriers within a 5-kilometer radius for swift collection.',
      icon: Route,
      details: [
        'Geo-optimized routing under 12 minutes',
        'Direct contact with vetted non-profit supervisors',
        'Insulated food carrier dispatch confirmation',
      ],
      interactivePreview: {
        badge: 'Dispatch Radar Preview',
        headline: 'Matched with Hope Foundation NGO',
        subtext: 'Volunteer Courier Vikram arrived at restaurant at 14:15',
        status: 'En Route · ETA 18 mins',
      },
    },
    {
      number: '03',
      title: 'Deliver Happiness',
      subtitle: 'Dignified meal distribution',
      description:
        'Food reaches community shelters, after-school learning centers, and families through coordinated, respectful, and hygienic distribution.',
      icon: Sparkles,
      details: [
        'Temperature probe check before consumption',
        'Zero stigma, full community warmth and respect',
        'Real-time photo receipt delivered to donor',
      ],
      interactivePreview: {
        badge: 'Community Delivery Certificate',
        headline: '45 Individuals Fed with Warm Meals',
        subtext: 'Verified at Sunrise Community Hall, Bengaluru',
        status: 'Completed · 100% Wholesome',
      },
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-[#F8F5EB] dark:bg-[#0E1611] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3C8D58] dark:text-[#4EBE73]">
            <span>Seamless Workflow</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[#123D2B] dark:text-white tracking-tight text-balance">
            Three Simple Steps.
            <br />
            Thousands of Possibilities.
          </h2>
          <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-base sm:text-lg leading-relaxed">
            Eliminating food waste shouldn't be complicated. We built a rapid, zero-friction process
            that guarantees surplus meals reach plates while still warm and fresh.
          </p>
        </div>

        {/* Step-by-Step Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative mb-16">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#3C8D58]/20 via-[#F4A259]/30 to-[#3C8D58]/20 -translate-y-12 -z-0 pointer-events-none" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeTab === idx + 1;

            return (
              <div
                key={step.number}
                onClick={() => setActiveTab(idx + 1)}
                className={`relative z-10 cursor-pointer rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between border ${
                  isCurrent
                    ? 'bg-white dark:bg-[#18281E] border-[#3C8D58] dark:border-[#4EBE73] shadow-[0_16px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)] -translate-y-2'
                    : 'bg-white/70 dark:bg-[#141F17] hover:bg-white dark:hover:bg-[#18281E] border-[#123D2B]/10 dark:border-white/10 shadow-sm'
                }`}
              >
                <div>
                  {/* Top Bar: Number and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display font-extrabold text-3xl text-[#123D2B]/30 dark:text-white/20 tracking-tight">
                      {step.number}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-[#3C8D58] dark:bg-[#4EBE73] text-white dark:text-[#0E1611] shadow-md shadow-[#3C8D58]/25'
                          : 'bg-[#123D2B]/5 dark:bg-white/10 text-[#123D2B] dark:text-white'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#123D2B] dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <div className="text-xs text-[#3C8D58] dark:text-[#4EBE73] font-semibold mb-3">
                    {step.subtitle}
                  </div>

                  <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-[#123D2B]/10 dark:border-white/10">
                    {step.details.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#202820]/75 dark:text-[#F8F5EB]/75">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3C8D58] dark:text-[#4EBE73] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <span
                    className={`text-xs font-bold inline-flex items-center gap-1.5 ${
                      isCurrent ? 'text-[#3C8D58] dark:text-[#4EBE73]' : 'text-[#202820]/50 dark:text-white/50'
                    }`}
                  >
                    <span>Click to view live simulation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Step Prototype Showcase Sandbox */}
        <div className="bg-[#123D2B] dark:bg-[#112318] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F4A259] text-xs font-bold uppercase tracking-wider border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulated Step {activeTab} Activity</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-white">
                {steps[activeTab - 1].interactivePreview.headline}
              </h3>
              <p className="text-[#F8F5EB]/75 text-sm">
                {steps[activeTab - 1].interactivePreview.subtext}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#4EBE73]">
                <ShieldCheck className="w-4 h-4" />
                <span>FoodBridge Real-Time Operational Protocol Active</span>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="w-full md:w-auto min-w-[280px] sm:min-w-[340px] bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/15 shadow-inner">
              <div className="flex items-center justify-between text-xs text-white/70 mb-3">
                <span className="font-mono">DISPATCH STATUS</span>
                <span className="text-[#F4A259] font-bold">LIVE</span>
              </div>
              <div className="text-sm font-bold text-white mb-2">
                {steps[activeTab - 1].interactivePreview.status}
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-[#3C8D58] dark:bg-[#4EBE73] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${activeTab * 33.3}%` }}
                />
              </div>
              <button
                onClick={onOpenDonate}
                className="w-full py-2.5 bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Try Food Donation Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
