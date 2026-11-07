import React from 'react';
import { Mail, MapPin, Heart, ArrowUp, Instagram, Linkedin, Facebook } from 'lucide-react';

interface FooterProps {
  onOpenDonate: () => void;
  onOpenVolunteer: () => void;
  onOpenPartner: () => void;
  onOpenDbStatus?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDonate,
  onOpenVolunteer,
  onOpenPartner,
  onOpenDbStatus,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-[#0B261B] text-[#F8F5EB] pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#123D2B] flex items-center justify-center text-white border border-white/10 shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round text-[#F4A259]"
                >
                  <path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9S3 7.03 3 12a9 9 0 0 0 9 9Z" className="stroke-[#3C8D58]" />
                  <path d="M7 13c1.5 2 4 3 5 3s3.5-1 5-3" className="stroke-[#F4A259]" />
                  <path d="M12 7c-1.5 2-1 4.5 0 6 1-1.5 1.5-4 0-6Z" fill="#3C8D58" stroke="none" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl tracking-tight text-white">
                  Food<span className="text-[#3C8D58]">Bridge</span>
                </span>
                <span className="text-xs text-[#F4A259] font-semibold">
                  Good Food. Better Futures.
                </span>
              </div>
            </div>

            <p className="text-sm text-[#F8F5EB]/75 max-w-sm leading-relaxed">
              Building stronger communities by connecting surplus food with those who need it.
              Transforming potential waste into immediate daily nourishment.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#social-instagram"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#F4A259] hover:text-[#123D2B] text-white flex items-center justify-center transition-all duration-200 border border-white/10"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#social-linkedin"
                onClick={(e) => e.preventDefault()}
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#F4A259] hover:text-[#123D2B] text-white flex items-center justify-center transition-all duration-200 border border-white/10"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#social-facebook"
                onClick={(e) => e.preventDefault()}
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#F4A259] hover:text-[#123D2B] text-white flex items-center justify-center transition-all duration-200 border border-white/10"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F8F5EB]/70">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleLinkClick(e, '#home')}
                  className="hover:text-[#F4A259] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#mission"
                  onClick={(e) => handleLinkClick(e, '#mission')}
                  className="hover:text-[#F4A259] transition-colors"
                >
                  Our Mission
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleLinkClick(e, '#how-it-works')}
                  className="hover:text-[#F4A259] transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#impact-dashboard"
                  onClick={(e) => handleLinkClick(e, '#impact-dashboard')}
                  className="hover:text-[#F4A259] transition-colors"
                >
                  Our Impact
                </a>
              </li>
              <li>
                <a
                  href="#stories"
                  onClick={(e) => handleLinkClick(e, '#stories')}
                  className="hover:text-[#F4A259] transition-colors"
                >
                  Stories
                </a>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Get Involved
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F8F5EB]/70">
              <li>
                <button
                  onClick={onOpenDonate}
                  className="hover:text-[#F4A259] transition-colors text-left"
                >
                  Donate Food
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenVolunteer}
                  className="hover:text-[#F4A259] transition-colors text-left"
                >
                  Volunteer
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPartner}
                  className="hover:text-[#F4A259] transition-colors text-left"
                >
                  NGO Partnership
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm text-[#F8F5EB]/75">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F4A259]" />
                <a href="mailto:hello@foodbridge.org" className="hover:text-[#F4A259] transition-colors">
                  hello@foodbridge.org
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#3C8D58]" />
                <span>Bengaluru, India</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#F4A259] hover:underline"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Demo Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F8F5EB]/60">
          <div>
            © 2026 FoodBridge. Together, We Make Every Meal Matter.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-center sm:text-right">
            {onOpenDbStatus && (
              <button
                type="button"
                onClick={onOpenDbStatus}
                className="hover:text-[#F4A259] text-[#3C8D58] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
              >
                PostgreSQL Architecture & Sync Status
              </button>
            )}
            <span>•</span>
            <span>Designed for AI Prompt Battle · Interactive Social-Impact Prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
