import React from 'react';
import { Quote, Sparkles, Building, Heart, GraduationCap, Info } from 'lucide-react';
import volunteerImage from '../assets/images/volunteer_chef_portrait_1793953125658.jpg';

export const StoriesSection: React.FC = () => {
  const stories = [
    {
      id: 'story-1',
      title: 'Restaurant Owner',
      quote:
        'Instead of throwing away perfectly good surplus meals, we now have a way to share them with people who need them. FoodBridge makes the process simple.',
      name: 'Chef Priya Sharma',
      role: 'Head Chef & Co-owner',
      organization: 'The Curry House',
      attribution: 'Restaurant Partner',
      image: '/src/assets/images/volunteer_chef_portrait_1793953125658.jpg',
      icon: Building,
      accent: 'text-[#3C8D58] dark:text-[#4EBE73]',
      highlight: 'Over 1,800 meals donated since joining',
    },
    {
      id: 'story-2',
      title: 'NGO Coordinator',
      quote:
        'FoodBridge helps us connect with food donors and coordinate meal distribution more effectively. It brings people together for a meaningful purpose.',
      name: 'Rajesh Nair',
      role: 'Outreach Director',
      organization: 'Hope Community Foundation',
      attribution: 'NGO Partner',
      image: null,
      initials: 'RN',
      avatarBg: 'bg-[#123D2B] dark:bg-[#203D2B]',
      icon: Heart,
      accent: 'text-[#F4A259]',
      highlight: 'Supports 4 neighborhood shelters daily',
    },
    {
      id: 'story-3',
      title: 'Student Volunteer',
      quote:
        'Being part of a community that believes no food should go to waste has been an inspiring experience.',
      name: 'Ananya Sen',
      role: 'Campus Chapter Lead',
      organization: 'University Volunteer Collective',
      attribution: 'Student Volunteer',
      image: null,
      initials: 'AS',
      avatarBg: 'bg-[#3C8D58] dark:bg-[#1E5C36]',
      icon: GraduationCap,
      accent: 'text-[#3C8D58] dark:text-[#4EBE73]',
      highlight: '35 on-call student couriers mobilized',
    },
  ];

  return (
    <section id="stories" className="py-24 lg:py-32 bg-[#F8F5EB] dark:bg-[#0E1611] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3C8D58] dark:text-[#4EBE73]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Voices</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[#123D2B] dark:text-white tracking-tight text-balance">
            Real Connections.
            <br />
            Meaningful Change.
          </h2>

          <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-base sm:text-lg leading-relaxed">
            The heart of FoodBridge beats through the restaurants who bake with love, the non-profits
            who serve with dignity, and the volunteers who bridge the gap every day.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#123D2B]/5 dark:bg-white/5 text-xs text-[#202820]/65 dark:text-[#F8F5EB]/65 border border-transparent dark:border-white/10">
            <Info className="w-3.5 h-3.5 text-[#3C8D58] dark:text-[#4EBE73]" />
            <span>Illustrative community stories representing network experiences</span>
          </div>
        </div>

        {/* 3 Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story) => {
            const Icon = story.icon;

            return (
              <div
                key={story.id}
                className="bg-white dark:bg-[#16221A] rounded-3xl p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] dark:hover:border-[#4EBE73]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Category & Quote mark */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3C8D58] dark:text-[#4EBE73]">
                      {story.attribution}
                    </span>
                    <Quote className="w-7 h-7 text-[#123D2B]/15 dark:text-white/20" />
                  </div>

                  {/* Quote Body */}
                  <p className="text-[#202820]/90 dark:text-white text-base sm:text-lg italic leading-relaxed mb-6 font-normal">
                    "{story.quote}"
                  </p>

                  {/* Impact Highlight */}
                  <div className="text-xs text-[#123D2B] dark:text-[#4EBE73] font-semibold bg-[#F8F5EB] dark:bg-[#1D2C22] p-2.5 rounded-xl mb-6 flex items-center gap-2 border border-[#123D2B]/5 dark:border-white/5">
                    <Icon className="w-4 h-4 text-[#3C8D58] dark:text-[#4EBE73] shrink-0" />
                    <span>{story.highlight}</span>
                  </div>
                </div>

                {/* Profile Attribution */}
                <div className="pt-4 border-t border-[#123D2B]/10 dark:border-white/10 flex items-center gap-4">
                  {story.image ? (
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-13 h-13 rounded-full object-cover border-2 border-[#3C8D58] dark:border-[#4EBE73] shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`w-13 h-13 rounded-full ${story.avatarBg} text-white font-display font-bold flex items-center justify-center text-sm shadow-sm`}
                    >
                      {story.initials}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="font-display font-bold text-base text-[#123D2B] dark:text-white">
                      {story.name}
                    </span>
                    <span className="text-xs text-[#202820]/70 dark:text-[#F8F5EB]/70 font-medium">
                      {story.role} · {story.organization}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
