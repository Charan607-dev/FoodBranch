import React, { useState } from 'react';
import { X, Building2, ShieldCheck } from 'lucide-react';
import { PartnerSubmission } from '../../types';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartnerSubmitted?: (partner: PartnerSubmission) => void;
}

export const PartnershipModal: React.FC<PartnershipModalProps> = ({
  isOpen,
  onClose,
  onPartnerSubmitted,
}) => {
  const [formData, setFormData] = useState({
    orgName: '',
    contactName: '',
    email: '',
    phone: '',
    regId: '',
    dailyCapacity: '50-100 meals',
    storageAvailable: true,
    serviceAreas: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.orgName.trim()) errs.orgName = 'Organization / NGO name is required';
    if (!formData.contactName.trim()) errs.contactName = 'Contact person name is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      errs.email = 'Valid email is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.serviceAreas.trim()) errs.serviceAreas = 'Service area is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newPartner: PartnerSubmission = {
      id: `NGO-${Math.floor(100 + Math.random() * 900)}`,
      orgName: formData.orgName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      regId: formData.regId || 'PENDING-VERIFICATION',
      dailyCapacity: formData.dailyCapacity,
      storageAvailable: formData.storageAvailable,
      serviceAreas: formData.serviceAreas,
      createdAt: new Date().toLocaleDateString(),
    };

    setIsSuccess(true);
    onPartnerSubmitted?.(newPartner);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#152219] text-[#202820] dark:text-white rounded-3xl shadow-2xl border border-[#123D2B]/10 dark:border-white/15 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#123D2B] dark:bg-[#112318] text-white p-6 sm:p-8 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F4A259]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                NGO Partnership Onboarding
              </h3>
              <p className="text-xs text-[#F8F5EB]/75">
                Join our verified network to receive daily nutritious meals.
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
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h4 className="font-display font-bold text-2xl text-[#123D2B] dark:text-white">
                Inquiry Received: {formData.orgName}
              </h4>
              <p className="text-sm text-[#202820]/75 dark:text-[#F8F5EB]/75 max-w-sm mx-auto">
                Thank you for applying. In our live ecosystem, our verification team validates your
                trust certificate within 24 hours to begin dispatching nearby surplus.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    NGO / Trust Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hope Care Shelter"
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                  {errors.orgName && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">{errors.orgName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Authorized Representative <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Nair"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                  {errors.contactName && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">
                      {errors.contactName}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="contact@ngo.org"
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
                    Direct Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 12345"
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
                    Daily Meal Need / Capacity
                  </label>
                  <select
                    value={formData.dailyCapacity}
                    onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  >
                    <option value="25-50 meals">25 – 50 meals / day</option>
                    <option value="50-100 meals">50 – 100 meals / day</option>
                    <option value="100-300 meals">100 – 300 meals / day</option>
                    <option value="300+ meals">300+ meals / day (Large shelter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Government Trust / 80G Reg No. (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TR-2023-8821"
                    value={formData.regId}
                    onChange={(e) => setFormData({ ...formData, regId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                  Primary Distribution Neighborhoods <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shivaji Nagar, Austin Town, Bengaluru East"
                  value={formData.serviceAreas}
                  onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                />
                {errors.serviceAreas && (
                  <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">
                    {errors.serviceAreas}
                  </span>
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
                  className="px-6 py-2.5 bg-[#123D2B] dark:bg-[#203D2B] hover:bg-[#0B261B] dark:hover:bg-[#2A4F38] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Submit Partner Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
