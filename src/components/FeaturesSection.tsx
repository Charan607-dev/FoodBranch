import React from 'react';
import { Smartphone, Building2, Truck, Users, ArrowUpRight, Sparkles } from 'lucide-react';

interface FeaturesSectionProps {
  onOpenDonate: () => void;
  onOpenPartner: () => void;
  onOpenVolunteer: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onOpenDonate,
  onOpenPartner,
  onOpenVolunteer,
}) => {
  const features = [
    {
      id: 'donation',
      title: 'Smart Food Donation',
      category: 'Simplicity & Speed',
      description:
        'Frictionless donation submission with verified quantity fields, food categories, allergen disclosures, and instant pickup window scheduling.',
      icon: Smartphone,
      accent: 'from-[#3C8D58]/15 to-[#3C8D58]/5 dark:from-[#3C8D58]/30 dark:to-[#3C8D58]/10',
      iconColor: 'text-[#3C8D58] dark:text-[#4EBE73]',
      points: [
        'Multi-unit support (meals, kg, crates)',
        'Prep time & expiry calculation',
        'Automatic donation tax certificate',
      ],
      action: onOpenDonate,
      actionLabel: 'Schedule Donation',
    },
    {
      id: 'ngo',
      title: 'NGO Partnerships',
      category: 'Vetted Trust Network',
      description:
        'Connect directly with verified NGO partners, community pantries, and shelters equipped with food-grade storage and distribution capabilities.',
      icon: Building2,
      accent: 'from-[#123D2B]/15 to-[#123D2B]/5 dark:from-white/15 dark:to-white/5',
      iconColor: 'text-[#123D2B] dark:text-[#F4A259]',
      points: [
        'Government-registered NGO validation',
        'Daily meal absorption tracking',
        'Transparent recipient verification',
      ],
      action: onOpenPartner,
      actionLabel: 'Explore Partnerships',
    },
    {
      id: 'pickup',
      title: 'Pickup Coordination',
      category: 'Smart Urban Logistics',
      description:
        'Make food collection and transportation effortless through organized pickup coordination, insulated temperature-controlled gear, and optimized routes.',
      icon: Truck,
      accent: 'from-[#F4A259]/20 to-[#F4A259]/5 dark:from-[#F4A259]/30 dark:to-[#F4A259]/10',
      iconColor: 'text-[#F4A259]',
      points: [
        'Automated closest-courier ping',
        'Thermal transit insulated cases',
        'Real-time live delivery milestones',
      ],
      action: onOpenDonate,
      actionLabel: 'View Logistics Model',
    },
    {
      id: 'community',
      title: 'Community Participation',
      category: 'Grassroots Engagement',
      description:
        'Encourage passionate individuals, university students, and neighborhood volunteers to participate in ending food waste and building bonds.',
      icon: Users,
      accent: 'from-[#3C8D58]/15 to-[#F4A259]/10 dark:from-[#4EBE73]/20 dark:to-[#F4A259]/20',
      iconColor: 'text-[#3C8D58] dark:text-[#4EBE73]',
      points: [
        'Campus food-rescue chapters',
        'Flexible on-call courier shifts',
        'Community impact certificates',
      ],
      action: onOpenVolunteer,
      actionLabel: 'Join as Volunteer',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-[#F2EDE0] dark:bg-[#0B140E] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3C8D58] dark:text-[#4EBE73]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[#123D2B] dark:text-white tracking-tight text-balance">
            Everything Needed to Make Giving Easier.
          </h2>
          <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-base sm:text-lg leading-relaxed">
            By eliminating technical, logistical, and administrative friction, FoodBridge makes
            surplus food sharing an effortless daily habit for kitchens of every scale.
          </p>
        </div>

        {/* 4 Premium Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative bg-white dark:bg-[#16221A] rounded-3xl p-8 sm:p-10 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.1)] dark:hover:border-[#4EBE73]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.accent} flex items-center justify-center ${feat.iconColor} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold tracking-wider uppercase text-[#202820]/50 dark:text-white/45">
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-[#123D2B] dark:text-white mb-3 group-hover:text-[#3C8D58] dark:group-hover:text-[#4EBE73] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-sm sm:text-base leading-relaxed mb-6">
                    {feat.description}
                  </p>

                  <ul className="space-y-2.5 pt-2 border-t border-[#123D2B]/10 dark:border-white/10 mb-8">
                    {feat.points.map((p, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#202820]/75 dark:text-[#F8F5EB]/75">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3C8D58] dark:bg-[#4EBE73]" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={feat.action}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#123D2B]/5 dark:bg-white/10 hover:bg-[#123D2B] dark:hover:bg-[#1E3B2A] text-[#123D2B] dark:text-white hover:text-white transition-all flex items-center justify-between group/btn cursor-pointer"
                >
                  <span>{feat.actionLabel}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
