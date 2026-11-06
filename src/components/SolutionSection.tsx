import React, { useState } from 'react';
import { Store, Cpu, Users, ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

export const SolutionSection: React.FC<{
  onOpenDonate: () => void;
  onOpenPartner: () => void;
}> = ({ onOpenDonate, onOpenPartner }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      tag: '01. SOURCE',
      title: 'Food Donors',
      icon: Store,
      badge: 'Restaurants, Hotels & Cafeterias',
      description:
        'Donors share details of prepared or unserved surplus in seconds—specifying meal count, temperature, and safe window.',
      bullets: [
        'Zero-friction submission under 60 seconds',
        'Automatic tax-deductible receipt generation',
        'Insulated food safety packing guidelines',
      ],
      actionText: 'Register as Donor',
      action: onOpenDonate,
    },
    {
      id: 2,
      tag: '02. INTELLIGENT DISPATCH',
      title: 'FoodBridge Platform',
      icon: Cpu,
      badge: 'Real-time Coordination Engine',
      description:
        'Our smart algorithm matches donations with the nearest verified NGO partner and dispatches trained volunteers in insulated carriers.',
      bullets: [
        'Geo-fenced matching within 5km radius',
        'Instant volunteer courier mobilization',
        'Digital custody tracking from pickup to plate',
      ],
      actionText: 'Partner With FoodBridge',
      action: onOpenPartner,
    },
    {
      id: 3,
      tag: '03. IMPACT',
      title: 'Communities in Need',
      icon: Users,
      badge: 'Shelters, Homes & Families',
      description:
        'Nutritious meals are received with dignity, checked for temperature safety, and distributed immediately to hungry individuals.',
      bullets: [
        'Strict hygiene and freshness verification',
        '100% free food distribution to recipients',
        'Transparent feedback loops to donors',
      ],
      actionText: 'View Verified Impact',
      action: () => {
        document.querySelector('#impact')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-[#123D2B] text-white relative overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3C8D58]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F4A259]/15 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F4A259] text-xs font-bold uppercase tracking-wider border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The FoodBridge Architecture</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight text-balance">
            We Don't Just Move Food.
            <br />
            <span className="text-[#F4A259]">We Move Hope.</span>
          </h2>

          <p className="text-[#F8F5EB]/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            FoodBridge transforms surplus food into meaningful support by creating a simple,
            hygienic, and ultra-reliable connection between food donors, verified NGOs, and
            communities in need.
          </p>
        </div>

        {/* 3-Part Visual Flow with Interactive Cards and Connecting Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-stretch">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`cursor-pointer rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-[#174834] border-[#F4A259] shadow-[0_12px_40px_rgba(244,162,89,0.2)] -translate-y-2'
                    : 'bg-[#0B261B]/80 hover:bg-[#174834]/70 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top Badge & Step Marker */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono text-[#F4A259] font-bold tracking-wider">
                      {step.tag}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#F4A259] text-[#123D2B]' : 'bg-white/10 text-white'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-white mb-1">
                    {step.title}
                  </h3>
                  <div className="text-xs text-[#F4A259] font-medium mb-4">
                    {step.badge}
                  </div>

                  <p className="text-[#F8F5EB]/85 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2.5 mb-8">
                    {step.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#F8F5EB]/75">
                        <CheckCircle2 className="w-4 h-4 text-[#3C8D58] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step.action();
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#F4A259] text-[#123D2B] hover:bg-[#E89143]'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span>{step.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Animated Connecting Flow Bar on Desktop */}
        <div className="hidden lg:flex items-center justify-center gap-6 mt-12 py-4 px-8 rounded-2xl bg-white/5 border border-white/10 max-w-2xl mx-auto text-sm text-[#F8F5EB]/80">
          <span className="font-semibold text-white">FOOD DONORS</span>
          <ArrowRight className="w-4 h-4 text-[#F4A259] animate-pulse" />
          <span className="font-semibold text-[#F4A259]">FOODBRIDGE ENGINE</span>
          <ArrowRight className="w-4 h-4 text-[#F4A259] animate-pulse" />
          <span className="font-semibold text-white">COMMUNITIES</span>
        </div>
      </div>
    </section>
  );
};
