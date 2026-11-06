import React, { useState, useEffect, useRef } from 'react';
import { Utensils, Building, Users, HeartHandshake, Info, Sparkles, Sliders, Leaf, Droplets } from 'lucide-react';

export const ImpactSection: React.FC<{ onOpenDonate: () => void }> = ({ onOpenDonate }) => {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Animated counters state
  const [counts, setCounts] = useState({
    meals: 0,
    donors: 0,
    ngos: 0,
    people: 0,
  });

  // Interactive impact calculator state
  const [dailyMealsInput, setDailyMealsInput] = useState<number>(30);

  // Target values
  const targets = {
    meals: 25000,
    donors: 500,
    ngos: 120,
    people: 8000,
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1800; // ms
    const steps = 40;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // easeOutExpo curve
      const factor = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCounts({
        meals: Math.floor(targets.meals * factor),
        donors: Math.floor(targets.donors * factor),
        ngos: Math.floor(targets.ngos * factor),
        people: Math.floor(targets.people * factor),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [isInView]);

  // Derived metrics from calculator
  const annualMeals = dailyMealsInput * 365;
  const co2AvoidedKg = Math.round(annualMeals * 2.5); // avg 2.5kg CO2e per meal rescued
  const waterSavedLiters = Math.round(annualMeals * 140); // avg 140L virtual water saved per meal

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-[#123D2B] text-white relative overflow-hidden"
    >
      {/* Subtle organic background pattern & ambient glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#3C8D58]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F4A259]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F4A259] text-xs font-bold uppercase tracking-wider border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demonstrated Community Velocity</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight text-balance">
            Small Acts.
            <br />
            <span className="text-[#F4A259]">Extraordinary Impact.</span>
          </h2>

          <p className="text-[#F8F5EB]/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Every meal rescued is an opportunity to create a better tomorrow. Here is how our network
            is transforming potential waste into everyday nourishment.
          </p>

          {/* Transparent demo label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-[#F8F5EB]/70">
            <Info className="w-3.5 h-3.5 text-[#F4A259]" />
            <span>Illustrative demonstration figures · Representative platform simulation</span>
          </div>
        </div>

        {/* 4 Large Animated Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Counter 1 */}
          <div className="bg-[#174834]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:border-[#F4A259]/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#3C8D58]/30 text-[#F4A259] flex items-center justify-center mb-6">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight tabular-nums mb-2">
              {counts.meals.toLocaleString()}
              <span className="text-[#F4A259] text-3xl ml-1">+</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Meals Shared</h3>
            <p className="text-xs text-[#F8F5EB]/70 leading-relaxed">
              Wholesome portions delivered fresh to community members.
            </p>
          </div>

          {/* Counter 2 */}
          <div className="bg-[#174834]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:border-[#F4A259]/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#3C8D58]/30 text-[#F4A259] flex items-center justify-center mb-6">
              <Building className="w-6 h-6" />
            </div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight tabular-nums mb-2">
              {counts.donors.toLocaleString()}
              <span className="text-[#F4A259] text-3xl ml-1">+</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Food Donors</h3>
            <p className="text-xs text-[#F8F5EB]/70 leading-relaxed">
              Restaurants, caterers, hotels, and corporate kitchens.
            </p>
          </div>

          {/* Counter 3 */}
          <div className="bg-[#174834]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:border-[#F4A259]/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#3C8D58]/30 text-[#F4A259] flex items-center justify-center mb-6">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight tabular-nums mb-2">
              {counts.ngos.toLocaleString()}
              <span className="text-[#F4A259] text-3xl ml-1">+</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">NGO Partners</h3>
            <p className="text-xs text-[#F8F5EB]/70 leading-relaxed">
              Accredited shelters, food pantries, and care centers.
            </p>
          </div>

          {/* Counter 4 */}
          <div className="bg-[#174834]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:border-[#F4A259]/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#3C8D58]/30 text-[#F4A259] flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight tabular-nums mb-2">
              {counts.people.toLocaleString()}
              <span className="text-[#F4A259] text-3xl ml-1">+</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">People Reached</h3>
            <p className="text-xs text-[#F8F5EB]/70 leading-relaxed">
              Individuals and children supported with reliable meals.
            </p>
          </div>
        </div>

        {/* Interactive Meal Rescue Impact Calculator */}
        <div className="bg-[#0B261B] rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Control */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4A259]">
                <Sliders className="w-4 h-4" />
                <span>Simulate Your Organization's Potential</span>
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
                How much food could you rescue?
              </h3>
              <p className="text-sm text-[#F8F5EB]/75 leading-relaxed">
                Move the slider to estimate the environmental and community impact if your kitchen or
                event shares surplus daily through FoodBridge.
              </p>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Estimated Daily Surplus</span>
                  <span className="text-xl font-display font-extrabold text-[#F4A259] tabular-nums">
                    {dailyMealsInput} meals / day
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={dailyMealsInput}
                  onChange={(e) => setDailyMealsInput(Number(e.target.value))}
                  className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F4A259]"
                />
                <div className="flex justify-between text-[11px] text-[#F8F5EB]/50 mt-1">
                  <span>5 meals (Small Cafe)</span>
                  <span>50 meals (Restaurant)</span>
                  <span>150 meals (Banquet/Hotel)</span>
                </div>
              </div>
            </div>

            {/* Simulated Yield Output Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-2xl p-5 border border-white/10 text-center flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#3C8D58]/30 text-[#3C8D58] flex items-center justify-center mx-auto mb-2">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="text-2xl font-display font-extrabold text-white tabular-nums">
                  {annualMeals.toLocaleString()}
                </div>
                <div className="text-xs text-[#F8F5EB]/70 font-medium mt-1">
                  Meals Rescued / Year
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 border border-white/10 text-center flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#F4A259]/30 text-[#F4A259] flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="text-2xl font-display font-extrabold text-white tabular-nums">
                  {(co2AvoidedKg / 1000).toFixed(1)}t
                </div>
                <div className="text-xs text-[#F8F5EB]/70 font-medium mt-1">
                  CO₂e Emissions Saved
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 border border-white/10 text-center flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center mx-auto mb-2">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-2xl font-display font-extrabold text-white tabular-nums">
                  {(waterSavedLiters / 1000).toFixed(0)}k L
                </div>
                <div className="text-xs text-[#F8F5EB]/70 font-medium mt-1">
                  Water Conserved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
