import React, { useState, useEffect } from 'react';
import { UserProfile, DonationRecord, DonationCategory, NotificationItem } from '../../types';
import { foodbridgeService } from '../../services/foodbridgeService';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import { DonorTrackingMap } from '../maps/DonorTrackingMap';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  History,
  User,
  LogOut,
  Bell,
  Scale,
  Utensils,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Truck,
  HeartHandshake,
  AlertCircle,
  Menu,
  X,
  Navigation,
} from 'lucide-react';

interface DonorDashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onViewWebsite: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  user,
  onLogout,
  onViewWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'my-donations' | 'history' | 'profile'>('overview');
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedTrackingDonation, setSelectedTrackingDonation] = useState<DonationRecord | null>(null);

  // Form State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<DonationCategory>('Cooked Food');
  const [quantity, setQuantity] = useState('');
  const [peopleServed, setPeopleServed] = useState<number>(25);
  const [preparationTime, setPreparationTime] = useState('');
  const [safeUntil, setSafeUntil] = useState('');
  const [pickupAddress, setPickupAddress] = useState(user.address || 'The Curry House, 100ft Rd, Indiranagar, Bengaluru');
  const [pickupLatitude, setPickupLatitude] = useState<number>(user.latitude || 12.9784);
  const [pickupLongitude, setPickupLongitude] = useState<number>(user.longitude || 77.6408);
  const [contactNumber, setContactNumber] = useState(user.phone || '+91 98450 12345');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(true);

  const loadData = async () => {
    const all = await foodbridgeService.getDonations();
    setDonations(all.filter((d) => d.donorId === user.id));
    const notifs = await foodbridgeService.getNotifications(user.id);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [user.id]);

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  // Stats calculation
  const totalDonations = donations.length;
  const acceptedDonations = donations.filter((d) => d.status === 'NGO Accepted' || d.status === 'Volunteer Assigned' || d.status === 'Pickup in Progress').length;
  const completedDonations = donations.filter((d) => d.status === 'Completed').length;
  const mealsShared = donations.reduce((acc, curr) => acc + (curr.peopleServed || 0), 0);

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!foodName.trim()) {
      setFormError('Please enter food item name.');
      return;
    }
    if (!quantity.trim()) {
      setFormError('Please specify available quantity.');
      return;
    }
    if (!preparationTime.trim()) {
      setFormError('Please enter preparation / cooking time.');
      return;
    }
    if (!safeUntil.trim()) {
      setFormError('Please specify safe consumption deadline.');
      return;
    }
    if (!pickupAddress.trim() || !pickupLatitude || !pickupLongitude) {
      setFormError('Please select and confirm a food pickup location on the interactive map.');
      return;
    }

    setIsPublishing(true);
    const res = await foodbridgeService.createDonation({
      donor: user,
      foodName,
      category,
      quantity,
      peopleServed,
      preparationTime,
      safeUntil,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      contactNumber,
      additionalInstructions,
    });
    setIsPublishing(false);

    if (res.success && res.donation) {
      setSuccessToast(`Donation ${res.donation.id} published successfully! Nearby NGOs and couriers have been alerted.`);
      setFoodName('');
      setQuantity('');
      setPreparationTime('');
      setSafeUntil('');
      setAdditionalInstructions('');
      loadData();
      setActiveTab('my-donations');
      setTimeout(() => setSuccessToast(null), 5000);
    } else {
      setFormError(res.error || 'Failed to publish donation.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'NGO Accepted':
        return 'bg-[#F4A259]/15 text-[#E0832F] dark:text-[#F4A259] border-[#F4A259]/30';
      case 'Volunteer Assigned':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Pickup in Progress':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Delivered':
      case 'Completed':
        return 'bg-[#3C8D58]/10 text-[#3C8D58] dark:text-[#4EBE73] border-[#3C8D58]/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EB] dark:bg-[#0E1611] text-[#202820] dark:text-[#F4F6F4] flex flex-col md:flex-row transition-colors duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#123D2B] dark:bg-[#142318] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-[#3C8D58]" />
          <span className="text-xs sm:text-sm font-semibold">{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="p-1 hover:bg-white/10 rounded-lg ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal: Live Tracking Map */}
      {selectedTrackingDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DonorTrackingMap
              donation={selectedTrackingDonation}
              onClose={() => setSelectedTrackingDonation(null)}
            />
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#16221A] border-b border-[#123D2B]/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#123D2B] dark:bg-[#1B3626] flex items-center justify-center text-[#F4A259] font-bold text-xs">
            FB
          </div>
          <span className="font-display font-bold text-base text-[#123D2B] dark:text-white">
            Donor Portal
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-[#123D2B] dark:text-white hover:bg-black/5"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 lg:w-72 bg-white dark:bg-[#142318] border-r border-[#123D2B]/10 dark:border-white/10 flex flex-col justify-between shrink-0 transition-all ${
          mobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-6">
          {/* Brand & User Pill */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#123D2B]/10 dark:border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-[#123D2B] dark:bg-[#1B3626] flex items-center justify-center text-[#F4A259] shadow-md border border-[#3C8D58]/30">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-[#123D2B] dark:text-white leading-tight">
                FoodBridge
              </span>
              <span className="text-[11px] font-semibold text-[#3C8D58] uppercase tracking-wider">
                Donor Portal
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="mt-6 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#3C8D58]" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('create');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#3C8D58] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#3C8D58]/10'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#F4A259]" />
              <span>Create Donation</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('my-donations');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-donations'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[#3C8D58]" />
                <span>My Donations</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#123D2B]/10 dark:bg-white/10 font-mono">
                {donations.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('history');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4 text-[#3C8D58]" />
              <span>Donation History</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4 text-[#F4A259]" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className={`p-4 border-t border-[#123D2B]/10 dark:border-white/10 space-y-2 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <button
            onClick={onViewWebsite}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#123D2B] dark:text-white hover:bg-[#123D2B]/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#3C8D58]" />
              View Public Website
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#202820]/40" />
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        {/* Top Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#3C8D58] uppercase tracking-wider">
              {user.organizationName || 'Donor Partner'}
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#123D2B] dark:text-white">
              Welcome back, {user.fullName}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#16221A] border border-[#123D2B]/10 dark:border-white/10 flex items-center justify-center text-[#123D2B] dark:text-white hover:bg-[#123D2B]/5 relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F4A259] text-[#123D2B] font-bold text-[10px] rounded-full flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifPanel && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#18261E] rounded-2xl shadow-2xl border border-[#123D2B]/10 dark:border-white/15 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-[#123D2B]/10 dark:border-white/10">
                    <span className="text-xs font-bold text-[#123D2B] dark:text-white">
                      Notifications ({notifications.length})
                    </span>
                    <button
                      onClick={async () => {
                        for (const n of notifications) {
                          await foodbridgeService.markNotificationAsRead(n.id);
                        }
                        loadData();
                      }}
                      className="text-[11px] text-[#3C8D58] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 mt-3">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#202820]/60 dark:text-white/60 text-center py-4">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            n.isRead
                              ? 'bg-[#F8F5EB]/60 dark:bg-white/5'
                              : 'bg-[#3C8D58]/10 dark:bg-[#3C8D58]/20 border border-[#3C8D58]/20'
                          }`}
                        >
                          <div className="font-bold text-[#123D2B] dark:text-white flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-[#202820]/50 dark:text-white/50">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[#202820]/80 dark:text-[#F8F5EB]/80 leading-relaxed text-[11px]">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2.5 bg-[#3C8D58] hover:bg-[#337A4C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Donation</span>
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>Total Donations</span>
                  <Package className="w-4 h-4 text-[#3C8D58]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#123D2B] dark:text-white">
                  {totalDonations}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  All batches recorded
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>Accepted Batches</span>
                  <HeartHandshake className="w-4 h-4 text-[#F4A259]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#F4A259]">
                  {acceptedDonations}
                </div>
                <span className="text-[11px] text-[#F4A259] font-semibold mt-1 block">
                  Claimed & dispatching
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>Completed Rescues</span>
                  <CheckCircle2 className="w-4 h-4 text-[#3C8D58]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#3C8D58]">
                  {completedDonations}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  Handed over to community
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>Meals Shared</span>
                  <Utensils className="w-4 h-4 text-[#E08E45]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#123D2B] dark:text-white">
                  {mealsShared.toLocaleString()}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  Life-saving portions
                </span>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-[#123D2B] via-[#1B4B36] to-[#123D2B] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10 max-w-xl space-y-3">
                <span className="text-xs font-bold text-[#F4A259] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Turn Extra Food Into Impact
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl leading-snug">
                  Have surplus food from today's service?
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Pin your pickup location on our interactive map. Our nearby NGO network and volunteer couriers can collect it within 45 minutes.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-3 bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer mt-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Food Batch Now</span>
                </button>
              </div>
            </div>

            {/* Recent Donations Table */}
            <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                  Recent Donation Activity
                </h3>
                <button
                  onClick={() => setActiveTab('my-donations')}
                  className="text-xs font-semibold text-[#3C8D58] hover:underline"
                >
                  View All ({donations.length})
                </button>
              </div>

              {donations.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#3C8D58]/10 text-[#3C8D58] flex items-center justify-center mx-auto">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#202820]/70 dark:text-white/70">
                    You haven't posted any food donations yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-5 py-2 bg-[#3C8D58] text-white text-xs font-bold rounded-xl"
                  >
                    Publish First Donation
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 4).map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-2xl bg-[#F8F5EB]/60 dark:bg-white/5 border border-[#123D2B]/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#3C8D58]">
                            #{d.id}
                          </span>
                          <span className="text-xs text-[#202820]/50 dark:text-white/50">·</span>
                          <span className="text-xs font-semibold text-[#202820]/60 dark:text-white/60">
                            {d.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#123D2B] dark:text-white">
                          {d.foodName}
                        </h4>
                        <div className="text-xs text-[#202820]/70 dark:text-white/70 flex items-center gap-3">
                          <span>📦 {d.quantity}</span>
                          <span>🍽️ Feeds ~{d.peopleServed}</span>
                          <span>⏳ Safe: {d.safeUntil}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${getStatusBadge(
                            d.status
                          )}`}
                        >
                          {d.status}
                        </span>
                        <button
                          onClick={() => setSelectedTrackingDonation(d)}
                          className="px-3 py-1.5 rounded-xl bg-[#3C8D58]/15 hover:bg-[#3C8D58]/25 text-[#123D2B] dark:text-[#4EBE73] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Track Map</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE DONATION FORM TAB */}
        {activeTab === 'create' && (
          <div className="max-w-3xl bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-10 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-[#3C8D58] uppercase tracking-wider">
                New Food Donation Request
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                Publish Surplus Food for Rescue
              </h2>
              <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-1">
                Pin your pickup location on the interactive map so nearby NGOs and volunteer couriers can easily navigate to collect it.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDonation} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    1. Food Name / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetable Pulav & Dal Fry"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    2. Food Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DonationCategory)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  >
                    <option value="Cooked Food">Cooked Food (Hot Meals & Rice)</option>
                    <option value="Packaged Food">Packaged Food & Dry Groceries</option>
                    <option value="Fruits">Fresh Fruits</option>
                    <option value="Vegetables">Fresh Vegetables</option>
                    <option value="Bakery">Bakery & Artisan Breads</option>
                    <option value="Other">Other Food Surplus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    3. Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 40 Portions or 15 kg"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    4. Estimated People It Can Serve <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 35"
                    value={peopleServed}
                    onChange={(e) => setPeopleServed(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    5. Food Preparation Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today at 2:00 PM"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    6. Safe Consumption Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today by 8:30 PM (6 hours)"
                    value={safeUntil}
                    onChange={(e) => setSafeUntil(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>
              </div>

              {/* SECTION: SELECT FOOD PICKUP LOCATION (INTERACTIVE MAP) */}
              <div className="space-y-2 pt-2">
                <LocationPickerMap
                  title="Select Food Pickup Location"
                  helperText="Search address, click anywhere on the map, or drag the marker to your precise kitchen / dock dispatch point."
                  initialLat={pickupLatitude}
                  initialLng={pickupLongitude}
                  initialAddress={pickupAddress}
                  confirmButtonText="Confirm Pickup Location"
                  roleTheme="donor"
                  onConfirmLocation={(loc) => {
                    setPickupAddress(loc.address);
                    setPickupLatitude(loc.lat);
                    setPickupLongitude(loc.lng);
                    setIsLocationConfirmed(true);
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                  8. Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                  9. Additional Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Packed in sealed thermal containers. Service entry located near back gate."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2.5 text-xs font-semibold text-[#202820]/60 dark:text-white/60 hover:text-[#123D2B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-7 py-3 bg-[#3C8D58] hover:bg-[#337A4C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isPublishing ? 'Publishing...' : 'Publish Food Donation'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MY DONATIONS TAB */}
        {activeTab === 'my-donations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                  My Active Donations
                </h2>
                <p className="text-xs text-[#202820]/70 dark:text-white/70">
                  Track live progression through the FoodBridge logistics network.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-[#3C8D58] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Batch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {donations.map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-[#16221A] rounded-3xl p-6 border border-[#123D2B]/10 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#3C8D58] bg-[#3C8D58]/10 px-2.5 py-1 rounded-lg">
                        #{d.id}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${getStatusBadge(
                          d.status
                        )}`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-[#123D2B] dark:text-white">
                      {d.foodName}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#202820]/75 dark:text-white/75 bg-[#F8F5EB]/60 dark:bg-white/5 p-3 rounded-2xl">
                      <div>
                        <span className="text-[#202820]/50 dark:text-white/40 block text-[10px]">
                          CATEGORY
                        </span>
                        <span className="font-semibold">{d.category}</span>
                      </div>
                      <div>
                        <span className="text-[#202820]/50 dark:text-white/40 block text-[10px]">
                          QUANTITY
                        </span>
                        <span className="font-semibold">{d.quantity}</span>
                      </div>
                      <div>
                        <span className="text-[#202820]/50 dark:text-white/40 block text-[10px]">
                          SAFE UNTIL
                        </span>
                        <span className="font-semibold">{d.safeUntil}</span>
                      </div>
                      <div>
                        <span className="text-[#202820]/50 dark:text-white/40 block text-[10px]">
                          PEOPLE SERVED
                        </span>
                        <span className="font-semibold">~{d.peopleServed} portions</span>
                      </div>
                    </div>

                    {/* Logistics Chain Card */}
                    <div className="border-t border-[#123D2B]/5 dark:border-white/5 pt-3 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-[#202820]/80 dark:text-white/80">
                        <MapPin className="w-3.5 h-3.5 text-[#3C8D58] shrink-0" />
                        <span className="truncate">{d.pickupAddress}</span>
                      </div>

                      {d.ngoName && (
                        <div className="flex items-center gap-2 text-[#202820]/80 dark:text-white/80">
                          <HeartHandshake className="w-3.5 h-3.5 text-[#F4A259] shrink-0" />
                          <span>NGO: <strong>{d.ngoName}</strong></span>
                        </div>
                      )}

                      {d.volunteerName && (
                        <div className="flex items-center gap-2 text-[#202820]/80 dark:text-white/80">
                          <Truck className="w-3.5 h-3.5 text-[#3C8D58] shrink-0" />
                          <span>Courier: <strong>{d.volunteerName}</strong> ({d.volunteerPhone})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#123D2B]/5 dark:border-white/5">
                    <span className="text-[11px] text-[#202820]/50 dark:text-white/40">
                      Posted: {new Date(d.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => setSelectedTrackingDonation(d)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#3C8D58]/15 hover:bg-[#3C8D58]/25 text-[#123D2B] dark:text-[#4EBE73] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track on Map</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DONATION HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-xl text-[#123D2B] dark:text-white">
              Lifetime Donation History & Verification Log
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F5EB] dark:bg-white/5 text-[#123D2B] dark:text-white font-bold border-b border-[#123D2B]/10 dark:border-white/10">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Food Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">People Fed</th>
                    <th className="p-3">Partner NGO</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#123D2B]/5 dark:divide-white/5">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-[#3C8D58]">#{d.id}</td>
                      <td className="p-3 font-semibold">{d.foodName}</td>
                      <td className="p-3">{d.category}</td>
                      <td className="p-3">{d.quantity}</td>
                      <td className="p-3 font-semibold">~{d.peopleServed}</td>
                      <td className="p-3">{d.ngoName || 'Pending Claim'}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedTrackingDonation(d)}
                          className="px-2.5 py-1 rounded-lg bg-[#3C8D58]/15 hover:bg-[#3C8D58]/25 text-[#123D2B] dark:text-[#4EBE73] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Track</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-xl text-[#123D2B] dark:text-white">
              Food Donor Profile & Kitchen Center
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[#202820]/60 dark:text-white/60 block font-semibold mb-1">
                  Primary Contact Name
                </label>
                <div className="p-3 rounded-xl bg-[#F8F5EB] dark:bg-white/5 font-bold text-[#123D2B] dark:text-white">
                  {user.fullName}
                </div>
              </div>

              <div>
                <label className="text-[#202820]/60 dark:text-white/60 block font-semibold mb-1">
                  Restaurant / Business Organization
                </label>
                <div className="p-3 rounded-xl bg-[#F8F5EB] dark:bg-white/5 font-bold text-[#123D2B] dark:text-white">
                  {user.organizationName || 'Not configured'}
                </div>
              </div>

              <div>
                <label className="text-[#202820]/60 dark:text-white/60 block font-semibold mb-1">
                  Email Address
                </label>
                <div className="p-3 rounded-xl bg-[#F8F5EB] dark:bg-white/5 font-mono text-[#123D2B] dark:text-white">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="text-[#202820]/60 dark:text-white/60 block font-semibold mb-1">
                  Phone Number
                </label>
                <div className="p-3 rounded-xl bg-[#F8F5EB] dark:bg-white/5 font-mono text-[#123D2B] dark:text-white">
                  {user.phone || '+91 98450 12345'}
                </div>
              </div>

              <div>
                <label className="text-[#202820]/60 dark:text-white/60 block font-semibold mb-1">
                  Registered Dispatch Address & Coordinates
                </label>
                <div className="p-3 rounded-xl bg-[#F8F5EB] dark:bg-white/5 text-[#123D2B] dark:text-white flex flex-col gap-1">
                  <span>{user.address || '100ft Road, Indiranagar, Bengaluru'}</span>
                  <span className="text-[10px] font-mono text-[#202820]/50 dark:text-white/40">
                    GPS: {pickupLatitude.toFixed(4)}, {pickupLongitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
