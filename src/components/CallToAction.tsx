import React from 'react';
import { HeartHandshake, UserPlus, Building2, ArrowRight, Sparkles } from 'lucide-react';

interface CallToActionProps {
  onOpenDonate: () => void;
  onOpenVolunteer: () => void;
  onOpenPartner: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  onOpenDonate,
  onOpenVolunteer,
  onOpenPartner,
}) => {
  return (
    <section className="py-24 lg:py-32 bg-[#123D2B] text-white relative overflow-hidden">
      {/* Decorative organic radial patterns */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#F4A259]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#3C8D58]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative leaf watermarks / subtle background geometry */}
      <div className="absolute inset-0 bg-grain opacity-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#F4A259] text-xs font-bold uppercase tracking-wider border border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Take Action Today</span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight text-balance">
          Someone Out There Needs
          <br />
          <span className="text-[#F4A259]">The Food You Don't.</span>
        </h2>

        <p className="text-[#F8F5EB]/85 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
          Your surplus can become someone's next meal. Take the first step towards a world
          where good food never goes to waste.
        </p>

        {/* 3 Prominent CTA Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto">
          {/* Button 1: Donate Food */}
          <button
            onClick={onOpenDonate}
            className="group px-6 py-4.5 rounded-2xl bg-gradient-to-r from-[#F4A259] to-[#E89143] hover:from-[#E89143] hover:to-[#D47D30] text-[#123D2B] font-bold text-sm sm:text-base shadow-[0_8px_24px_rgba(244,162,89,0.3)] hover:shadow-[0_12px_30px_rgba(244,162,89,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex flex-col items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#123D2B]" />
              <span className="font-extrabold">Donate Food</span>
            </div>
            <span className="text-xs text-[#123D2B]/80 font-medium">
              Restaurants & Kitchens →
            </span>
          </button>

          {/* Button 2: Become a Volunteer */}
          <button
            onClick={onOpenVolunteer}
            className="group px-6 py-4.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex flex-col items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#3C8D58]" />
              <span className="font-extrabold">Become a Volunteer</span>
            </div>
            <span className="text-xs text-[#F8F5EB]/70 font-medium">
              Couriers & Students →
            </span>
          </button>

          {/* Button 3: Partner With Us */}
          <button
            onClick={onOpenPartner}
            className="group px-6 py-4.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex flex-col items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#F4A259]" />
              <span className="font-extrabold">Partner With Us</span>
            </div>
            <span className="text-xs text-[#F8F5EB]/70 font-medium">
              NGOs & Shelters →
            </span>
          </button>
        </div>

        {/* Small reassurance line */}
        <div className="text-xs text-[#F8F5EB]/60 pt-4">
          No minimum batch size required · Zero fees for community food donors or NGOs
        </div>
      </div>
    </section>
  );
};
