import React, { useState } from 'react';
import { X, HeartHandshake, CheckCircle2, AlertCircle, Clock, MapPin, Sparkles, ChefHat } from 'lucide-react';
import { DonationSubmission } from '../../types';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonationSubmitted?: (donation: DonationSubmission) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onDonationSubmitted,
}) => {
  const [formData, setFormData] = useState({
    donorName: '',
    phone: '',
    donorType: 'Restaurant' as const,
    foodType: 'Fresh Cooked Meals' as const,
    quantity: '',
    quantityType: 'Meals' as const,
    prepTime: '',
    address: '',
    cityArea: '',
    dietaryInfo: 'Vegetarian & Freshly Prepared',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<DonationSubmission | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.donorName.trim()) {
      errs.donorName = 'Please enter your donor or organization name';
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      errs.phone = 'Please provide a valid contact phone number';
    }
    if (!formData.quantity.trim() || Number(formData.quantity) <= 0) {
      errs.quantity = 'Please enter a valid quantity';
    }
    if (!formData.prepTime.trim()) {
      errs.prepTime = 'Please specify preparation / readiness time';
    }
    if (!formData.address.trim()) {
      errs.address = 'Please specify pickup address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newSubmission: DonationSubmission = {
        id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
        donorName: formData.donorName,
        phone: formData.phone,
        donorType: formData.donorType,
        foodType: formData.foodType,
        quantity: formData.quantity,
        quantityType: formData.quantityType,
        prepTime: formData.prepTime,
        expiryHours: '4-6 hours (recommended)',
        address: formData.address,
        cityArea: formData.cityArea || 'Central District',
        dietaryInfo: formData.dietaryInfo,
        notes: formData.notes,
        status: 'Pending Pickup',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSubmittedData(newSubmission);
      setIsSubmitting(false);
      onDonationSubmitted?.(newSubmission);
    }, 700);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      donorName: '',
      phone: '',
      donorType: 'Restaurant',
      foodType: 'Fresh Cooked Meals',
      quantity: '',
      quantityType: 'Meals',
      prepTime: '',
      address: '',
      cityArea: '',
      dietaryInfo: 'Vegetarian & Freshly Prepared',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#152219] text-[#202820] dark:text-white rounded-3xl shadow-2xl border border-[#123D2B]/10 dark:border-white/15 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#123D2B] dark:bg-[#112318] text-white p-6 sm:p-8 flex items-center justify-between relative border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F4A259]">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                Donate Surplus Food
              </h3>
              <p className="text-xs text-[#F8F5EB]/75">
                Every meal rescued is an opportunity to create a better tomorrow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {submittedData ? (
            /* Success Confirmation State */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#3C8D58]/15 dark:bg-[#4EBE73]/20 text-[#3C8D58] dark:text-[#4EBE73] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3C8D58] dark:text-[#4EBE73] bg-[#3C8D58]/10 dark:bg-[#4EBE73]/10 px-3 py-1 rounded-full border border-[#3C8D58]/20">
                  Dispatch Ticket: #{submittedData.id}
                </span>
                <h4 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                  Thank You, {submittedData.donorName}!
                </h4>
                <p className="text-[#202820]/75 dark:text-[#F8F5EB]/75 text-sm max-w-md mx-auto">
                  Your surplus food donation has been logged in this demonstration flow. In our live
                  network, a courier within 5km would be routed immediately.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#F8F5EB] dark:bg-[#1D2C22] rounded-2xl p-5 text-left text-xs space-y-2 border border-[#123D2B]/10 dark:border-white/10 max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-[#123D2B]/5 dark:border-white/10">
                  <span className="text-[#202820]/60 dark:text-white/60">Food Type:</span>
                  <span className="font-bold text-[#123D2B] dark:text-white">{submittedData.foodType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#123D2B]/5 dark:border-white/10">
                  <span className="text-[#202820]/60 dark:text-white/60">Quantity:</span>
                  <span className="font-bold text-[#3C8D58] dark:text-[#4EBE73]">
                    {submittedData.quantity} {submittedData.quantityType}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#123D2B]/5 dark:border-white/10">
                  <span className="text-[#202820]/60 dark:text-white/60">Pickup Address:</span>
                  <span className="font-bold text-[#123D2B] dark:text-white truncate max-w-[200px]">
                    {submittedData.address}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#202820]/60 dark:text-white/60">Estimated Pickup:</span>
                  <span className="font-bold text-[#F4A259]">Within 45 Minutes</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-[#123D2B] dark:bg-[#203D2B] hover:bg-[#0B261B] dark:hover:bg-[#2A4F38] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Done / Close
                </button>
                <button
                  onClick={() => setSubmittedData(null)}
                  className="px-6 py-3 bg-[#F8F5EB] dark:bg-[#1D2C22] hover:bg-[#EAE4D3] dark:hover:bg-[#25392B] text-[#123D2B] dark:text-white font-bold text-xs rounded-xl transition-colors border border-[#123D2B]/10 dark:border-white/10 cursor-pointer"
                >
                  Submit Another Batch
                </button>
              </div>
            </div>
          ) : (
            /* Donation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Prototype Notice */}
              <div className="bg-[#F8F5EB] dark:bg-[#1D2C22] border border-[#123D2B]/10 dark:border-white/10 rounded-2xl p-3.5 text-xs text-[#202820]/75 dark:text-[#F8F5EB]/75 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#F4A259] shrink-0 mt-0.5" />
                <span>
                  <strong>Interactive Prototype Demo:</strong> Submitting simulates FoodBridge's
                  instant dispatch workflow without making live third-party calls.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Donor / Organization Name */}
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Donor / Establishment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Spice Garden Bistro or Priya Sharma"
                    value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58] ${
                      errors.donorName ? 'border-red-500' : 'border-[#123D2B]/15 dark:border-white/20'
                    }`}
                  />
                  {errors.donorName && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5 block">
                      {errors.donorName}
                    </span>
                  )}
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58] ${
                      errors.phone ? 'border-red-500' : 'border-[#123D2B]/15 dark:border-white/20'
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5 block">
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Donor Type */}
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Donor Category
                  </label>
                  <select
                    value={formData.donorType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        donorType: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  >
                    <option value="Restaurant">Restaurant / Bistro</option>
                    <option value="Hotel & Catering">Hotel / Banquet / Catering</option>
                    <option value="Supermarket">Supermarket / Grocery Retail</option>
                    <option value="Bakery">Artisan Bakery / Cafe</option>
                    <option value="Corporate Cafeteria">Corporate Cafeteria</option>
                    <option value="Household">Individual / Household</option>
                  </select>
                </div>

                {/* Food Type */}
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Food Category
                  </label>
                  <select
                    value={formData.foodType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        foodType: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  >
                    <option value="Fresh Cooked Meals">Fresh Cooked Meals (Rice, Curries, Mains)</option>
                    <option value="Fresh Produce & Fruits">Fresh Produce & Whole Fruits</option>
                    <option value="Bakery & Bread">Bakery, Breads & Sandwiches</option>
                    <option value="Packaged Goods">Dry Packaged Groceries</option>
                    <option value="Dairy & Perishables">Dairy & Cold-Storage Perishables</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Quantity Available <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 40"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58] ${
                        errors.quantity ? 'border-red-500' : 'border-[#123D2B]/15 dark:border-white/20'
                      }`}
                    />
                    <select
                      value={formData.quantityType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantityType: e.target.value as any,
                        })
                      }
                      className="px-3 py-2.5 text-xs font-bold rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                    >
                      <option value="Meals">Portions / Meals</option>
                      <option value="Kilograms">Kilograms (kg)</option>
                      <option value="Boxes">Crates / Boxes</option>
                    </select>
                  </div>
                  {errors.quantity && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5 block">
                      {errors.quantity}
                    </span>
                  )}
                </div>

                {/* Prep Time */}
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Preparation / Ready Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Prepared at 1:30 PM, ready now"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58] ${
                      errors.prepTime ? 'border-red-500' : 'border-[#123D2B]/15 dark:border-white/20'
                    }`}
                  />
                  {errors.prepTime && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5 block">
                      {errors.prepTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Pickup Address */}
              <div>
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                  Pickup Location & Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 42 Indiranagar 100ft Road, opposite Metro Station, Bengaluru"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58] ${
                    errors.address ? 'border-red-500' : 'border-[#123D2B]/15 dark:border-white/20'
                  }`}
                />
                {errors.address && (
                  <span className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5 block">
                    {errors.address}
                  </span>
                )}
              </div>

              {/* Dietary & Additional Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Dietary & Allergen Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Veg, Nut-free, Halal"
                    value={formData.dietaryInfo}
                    onChange={(e) => setFormData({ ...formData, dietaryInfo: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    Packing & Access Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please enter via service kitchen door"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#123D2B]/15 dark:border-white/20 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#123D2B]/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-semibold text-[#202820]/70 dark:text-white/70 hover:text-[#123D2B] dark:hover:text-white rounded-xl hover:bg-[#123D2B]/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#F4A259] to-[#E89143] hover:from-[#E89143] hover:to-[#D47D30] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Verifying & Dispatching...</span>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4" />
                      <span>Submit Food Donation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
