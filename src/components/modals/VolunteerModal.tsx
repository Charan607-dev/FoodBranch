import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { VolunteerSubmission } from '../../types';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVolunteerSubmitted?: (volunteer: VolunteerSubmission) => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({
  isOpen,
  onClose,
  onVolunteerSubmitted,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Food Courier / Driver' as const,
    availability: 'Weekends' as const,
    area: '',
    vehicle: 'Bicycle / Two-Wheeler' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      errs.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 7)
      errs.phone = 'Valid phone number is required';
    if (!formData.area.trim()) errs.area = 'Please enter your neighborhood/city area';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newVolunteer: VolunteerSubmission = {
      id: `VOL-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      availability: formData.availability,
      area: formData.area,
      vehicle: formData.vehicle,
      createdAt: new Date().toLocaleDateString(),
    };

    setIsSuccess(true);
    onVolunteerSubmitted?.(newVolunteer);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#152219] text-[#202820] dark:text-white rounded-3xl shadow-2xl border border-[#123D2B]/10 dark:border-white/15 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#123D2B] dark:bg-[#112318] text-white p-6 sm:p-8 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3C8D58] dark:text-[#4EBE73]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                Become a FoodBridge Volunteer
              </h3>
              <p className="text-xs text-[#F8F5EB]/75">
                Join our neighborhood rescue squad and deliver warm meals.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#3C8D58]/15 dark:bg-[#4EBE73]/20 text-[#3C8D58] dark:text-[#4EBE73] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-display font-bold text-2xl text-[#123D2B] dark:text-white">
                Welcome to the Family, {formData.fullName}!
              </h4>
              <p className="text-sm text-[#202820]/75 dark:text-[#F8F5EB]/75 max-w-sm mx-auto">
                Your volunteer application has been simulated. In a production launch, your local
                coordinator would reach out via WhatsApp with your thermal gear kit.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#123D2B] dark:bg-[#203D2B] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Rao"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                />
                {errors.fullName && (
                  <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">{errors.fullName}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="vikram@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">{errors.email}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Preferred Volunteer Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  >
                    <option value="Food Courier / Driver">Food Courier / On-call Driver</option>
                    <option value="Quality & Safety Inspector">Quality & Safety Inspector</option>
                    <option value="Distribution Coordinator">Community Center Coordinator</option>
                    <option value="Campus Ambassador">College / Campus Ambassador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availability: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  >
                    <option value="Weekends">Weekends Only</option>
                    <option value="Weekdays">Weekday Evenings</option>
                    <option value="Both">Flexible Any Day</option>
                    <option value="On-Call Emergencies">Emergency On-Call Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                  Neighborhood / Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala / Indiranagar / HSR Layout"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                />
                {errors.area && (
                  <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">{errors.area}</span>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#123D2B]/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#202820]/70 dark:text-white/70 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3C8D58] hover:bg-[#337A4C] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
