import React, { useState, useEffect } from 'react';
import { UserProfile, DonationRecord, NotificationItem } from '../../types';
import { foodbridgeService } from '../../services/foodbridgeService';
import { NgoDonationMap } from '../maps/NgoDonationMap';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  Truck,
  Archive,
  User,
  LogOut,
  Bell,
  Clock,
  MapPin,
  Utensils,
  HeartHandshake,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Menu,
  X,
  Phone,
  Building2,
  Check,
  Compass,
  Layers,
  Sparkles,
  Save,
} from 'lucide-react';

interface NgoDashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onViewWebsite: () => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({
  user,
  onLogout,
  onViewWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'nearby-map'
    | 'available'
    | 'accepted'
    | 'active-deliveries'
    | 'completed'
    | 'profile'
  >('nearby-map');
  const [allDonations, setAllDonations] = useState<DonationRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDonationDetails, setSelectedDonationDetails] = useState<DonationRecord | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Location Setup State
  const [ngoOrgName, setNgoOrgName] = useState(user.organizationName || 'Hope Community Care Foundation');
  const [ngoAddress, setNgoAddress] = useState(user.address || 'Austin Town, Near Community Center, Bengaluru');
  const [ngoCity, setNgoCity] = useState(user.city || 'Bengaluru');
  const [ngoLat, setNgoLat] = useState<number>(user.latitude || 12.962);
  const [ngoLng, setNgoLng] = useState<number>(user.longitude || 77.6145);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const loadData = async () => {
    const list = await foodbridgeService.getDonations();
    setAllDonations(list);
    const notifs = await foodbridgeService.getNotifications(user.id);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [user.id]);

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  // Filtered lists
  const availableDonations = allDonations.filter((d) => d.status === 'Available');
  const acceptedByMe = allDonations.filter((d) => d.ngoId === user.id);
  const activeDeliveries = acceptedByMe.filter(
    (d) =>
      d.status === 'Volunteer Assigned' ||
      d.status === 'Pickup in Progress' ||
      d.status === 'Delivered'
  );
  const completedByMe = acceptedByMe.filter((d) => d.status === 'Completed');
  const mealsDistributed = completedByMe.reduce((acc, curr) => acc + (curr.peopleServed || 0), 0);

  const handleAcceptDonation = async (donationId: string) => {
    setErrorMessage(null);
    const res = await foodbridgeService.acceptDonationAsNGO(donationId, {
      ...user,
      address: ngoAddress,
      latitude: ngoLat,
      longitude: ngoLng,
      organizationName: ngoOrgName,
    });
    if (res.success) {
      setActionMessage(`Donation #${donationId} claimed! Dispatched to neighborhood volunteer couriers for pickup.`);
      loadData();
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to accept donation.');
    }
  };

  const handleConfirmReceipt = async (donationId: string) => {
    setErrorMessage(null);
    const res = await foodbridgeService.confirmReceiptAsNGO(donationId, user);
    if (res.success) {
      setActionMessage(`Receipt confirmed for #${donationId}! Batch marked as Completed and meals recorded.`);
      loadData();
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to confirm receipt.');
    }
  };

  const handleSaveLocationProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setErrorMessage(null);
    const res = await foodbridgeService.updateUserProfile(user.id, {
      organizationName: ngoOrgName,
      address: ngoAddress,
      city: ngoCity,
      latitude: ngoLat,
      longitude: ngoLng,
    });
    setIsSavingProfile(false);
    if (res.success) {
      setActionMessage('Organization center location updated successfully! Nearby donation distances will now re-index.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to update location.');
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
      {/* Action Banners */}
      {actionMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#123D2B] dark:bg-[#142318] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-[#4EBE73]" />
          <span className="text-xs sm:text-sm font-semibold">{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="p-1 hover:bg-white/10 rounded-lg ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-6 right-6 z-50 bg-red-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 text-red-200" />
          <span className="text-xs sm:text-sm font-semibold">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-white/10 rounded-lg ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-[#142318] border-r border-[#123D2B]/10 dark:border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#123D2B]/10 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#123D2B] dark:bg-[#1B3626] flex items-center justify-center text-[#4EBE73] shadow-md border border-[#3C8D58]/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-[#123D2B] dark:text-white leading-tight">
                  Food<span className="text-[#3C8D58]">Bridge</span>
                </span>
                <span className="text-[10px] uppercase font-mono block text-[#123D2B] dark:text-[#F4A259] font-bold">
                  NGO Partner Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#123D2B] dark:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className={`p-4 space-y-1.5 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <button
              onClick={() => {
                setActiveTab('nearby-map');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'nearby-map'
                  ? 'bg-[#3C8D58] text-white shadow-md'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#3C8D58]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#F4A259]" />
                Discover Nearby Food
              </span>
              <span className="bg-[#F4A259] text-[#123D2B] font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                {availableDonations.length}
              </span>
            </button>

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
              <LayoutDashboard className="w-4 h-4 text-[#F4A259]" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('available');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'available'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Inbox className="w-4 h-4 text-[#3C8D58]" />
                Available Donations
              </span>
              {availableDonations.length > 0 && (
                <span className="bg-[#123D2B]/10 dark:bg-white/10 text-xs px-2 py-0.5 rounded-full">
                  {availableDonations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('accepted');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'accepted'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#F4A259]" />
                Accepted ({acceptedByMe.length})
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('active-deliveries');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'active-deliveries'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#3C8D58]" />
                Active Deliveries
              </span>
              {activeDeliveries.length > 0 && (
                <span className="bg-[#3C8D58] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {activeDeliveries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('completed');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <Archive className="w-4 h-4 text-[#F4A259]" />
              <span>Completed ({completedByMe.length})</span>
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
              <MapPin className="w-4 h-4 text-[#3C8D58]" />
              <span>Center Location Setup</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
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
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#3C8D58] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {ngoOrgName}
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#123D2B] dark:text-white">
              Welcome, {user.fullName}!
            </h1>
            <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-0.5">
              Distribution Hub: <strong className="text-[#123D2B] dark:text-white">{ngoAddress}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('nearby-map')}
              className="px-4 py-2.5 bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Map Discovery ({availableDonations.length})</span>
            </button>

            {/* Notifications */}
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
          </div>
        </div>

        {/* SECTION 3: DISCOVER NEARBY DONATIONS (MAP & LIST VIEW) */}
        {activeTab === 'nearby-map' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#3C8D58] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#F4A259]" />
                Location-Aware Surplus Network
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                Discover Nearby Food Donations
              </h2>
              <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-1">
                Explore real-time surplus batches within proximity of your center. Switch between interactive Leaflet map and distance-sorted list view.
              </p>
            </div>

            <NgoDonationMap
              donations={allDonations}
              ngo={{
                ...user,
                address: ngoAddress,
                latitude: ngoLat,
                longitude: ngoLng,
                organizationName: ngoOrgName,
              }}
              onAcceptDonation={handleAcceptDonation}
              onViewDetails={(d) => setSelectedDonationDetails(d)}
            />
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>Available Nearby</span>
                  <Inbox className="w-4 h-4 text-[#3C8D58]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#123D2B] dark:text-white">
                  {availableDonations.length}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  Awaiting NGO claim
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>Accepted By Us</span>
                  <CheckCircle2 className="w-4 h-4 text-[#F4A259]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#F4A259]">
                  {acceptedByMe.length}
                </div>
                <span className="text-[11px] text-[#F4A259] font-semibold mt-1 block">
                  Claimed batches
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>In Transit (Couriers)</span>
                  <Truck className="w-4 h-4 text-[#3C8D58]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#3C8D58]">
                  {activeDeliveries.length}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  Volunteers delivering
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#202820]/60 dark:text-white/60 mb-2 font-semibold">
                  <span>Meals Distributed</span>
                  <Utensils className="w-4 h-4 text-[#E08E45]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#123D2B] dark:text-white">
                  {mealsDistributed.toLocaleString()}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  People fed directly
                </span>
              </div>
            </div>

            {/* Banner jumping to Map Discovery */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-[#123D2B] to-[#1F543C] rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#F4A259] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Live Proximity Matching
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl">
                  {availableDonations.length} Fresh Surplus Batches Ready for Pickup
                </h3>
                <p className="text-xs text-white/80 max-w-lg">
                  Restaurants and bakeries near {ngoCity} have logged surplus food. Claim them to route volunteer couriers directly to your distribution center.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('nearby-map')}
                className="px-6 py-3 rounded-xl bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] font-bold text-xs sm:text-sm whitespace-nowrap shadow-md cursor-pointer transition-all hover:scale-105"
              >
                Open Discovery Map &rarr;
              </button>
            </div>
          </div>
        )}

        {/* AVAILABLE DONATIONS TAB */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                  Available Food Donations
                </h2>
                <p className="text-xs text-[#202820]/70 dark:text-white/70">
                  Ready to be claimed by accredited NGO partners.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('nearby-map')}
                className="px-4 py-2 bg-[#3C8D58] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>View on Map</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDonations.map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-[#16221A] rounded-3xl p-6 border border-[#123D2B]/10 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3C8D58]/15 text-[#3C8D58]">
                        {d.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#123D2B]/60 dark:text-white/60">
                        #{d.id}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                      {d.foodName}
                    </h3>

                    <div className="bg-[#F8F5EB]/60 dark:bg-white/5 p-3 rounded-2xl space-y-1.5 text-xs text-[#202820]/75 dark:text-white/75">
                      <p><strong>Quantity:</strong> {d.quantity} (Serves ~{d.peopleServed})</p>
                      <p><strong>Donor:</strong> {d.donorOrg || d.donorName}</p>
                      <p className="truncate"><strong>Pickup:</strong> {d.pickupAddress}</p>
                      <p className="text-amber-700 dark:text-amber-400 font-semibold">
                        ⏳ Safe Until: {d.safeUntil}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleAcceptDonation(d.id)}
                      className="flex-1 py-2.5 bg-[#3C8D58] hover:bg-[#327749] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Accept Donation
                    </button>
                    <button
                      onClick={() => setSelectedDonationDetails(d)}
                      className="px-3 py-2.5 bg-black/5 dark:bg-white/10 text-xs font-bold rounded-xl hover:bg-black/10 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE DELIVERIES TAB */}
        {activeTab === 'active-deliveries' && (
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
              Active Courier Deliveries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDeliveries.map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-[#16221A] rounded-3xl p-6 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#3C8D58]">#{d.id}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusBadge(d.status)}`}>
                      {d.status}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                    {d.foodName}
                  </h3>

                  <div className="p-3 bg-[#F8F5EB]/60 dark:bg-white/5 rounded-2xl space-y-1.5 text-xs text-[#202820]/75 dark:text-white/75">
                    <p><strong>Courier:</strong> {d.volunteerName || 'Matching in progress...'}</p>
                    <p><strong>Contact:</strong> {d.volunteerPhone || 'N/A'}</p>
                    <p><strong>Destination:</strong> {d.ngoAddress || ngoAddress}</p>
                    {d.deliveryRemarks && <p className="italic text-emerald-700">Remarks: "{d.deliveryRemarks}"</p>}
                  </div>

                  {d.status === 'Delivered' && (
                    <button
                      onClick={() => handleConfirmReceipt(d.id)}
                      className="w-full py-2.5 bg-[#3C8D58] hover:bg-[#327749] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Receipt & Distribute</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCEPTED DONATIONS TAB */}
        {activeTab === 'accepted' && (
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
              All Claimed Donations ({acceptedByMe.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {acceptedByMe.map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-[#16221A] rounded-3xl p-6 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#3C8D58]">#{d.id}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusBadge(d.status)}`}>
                      {d.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-[#123D2B] dark:text-white">{d.foodName}</h4>
                  <p className="text-xs text-[#202820]/70 dark:text-white/70">
                    {d.quantity} &bull; Feeds ~{d.peopleServed}
                  </p>
                  <p className="text-xs text-[#202820]/60 dark:text-white/60 truncate">
                    Pickup: {d.pickupAddress}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLETED TAB */}
        {activeTab === 'completed' && (
          <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-xl text-[#123D2B] dark:text-white">
              Completed Rescues Log
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F5EB] dark:bg-white/5 border-b border-[#123D2B]/10 dark:border-white/10 font-bold">
                  <tr>
                    <th className="p-3">Batch ID</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Servings</th>
                    <th className="p-3">Courier</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {completedByMe.map((d) => (
                    <tr key={d.id}>
                      <td className="p-3 font-mono font-bold text-[#3C8D58]">#{d.id}</td>
                      <td className="p-3 font-semibold">{d.foodName}</td>
                      <td className="p-3">{d.peopleServed} meals</td>
                      <td className="p-3">{d.volunteerName || 'Direct Pickup'}</td>
                      <td className="p-3 text-emerald-600 font-bold">Distributed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: NGO LOCATION SETUP & PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-[#3C8D58] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F4A259]" />
                Distribution Center Coordinates
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                NGO Center Location Setup
              </h2>
              <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-1">
                Your registered coordinates determine which food donations appear in your discovery feed and calculate accurate courier transit routes.
              </p>
            </div>

            <form onSubmit={handleSaveLocationProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    NGO Organization Name
                  </label>
                  <input
                    type="text"
                    value={ngoOrgName}
                    onChange={(e) => setNgoOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123D2B] dark:text-white mb-1">
                    City / Metro Region
                  </label>
                  <input
                    type="text"
                    value={ngoCity}
                    onChange={(e) => setNgoCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#123D2B]/15 dark:border-white/15 bg-white dark:bg-[#0E1611] text-[#202820] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C8D58]"
                  />
                </div>
              </div>

              {/* Interactive Location Picker Map */}
              <div className="space-y-2">
                <LocationPickerMap
                  title="Set Organization Center on Map"
                  helperText="Search address or drag the marker to your community kitchen / shelter location."
                  initialLat={ngoLat}
                  initialLng={ngoLng}
                  initialAddress={ngoAddress}
                  confirmButtonText="Pin Center Location"
                  roleTheme="ngo"
                  onConfirmLocation={(loc) => {
                    setNgoAddress(loc.address);
                    setNgoLat(loc.lat);
                    setNgoLng(loc.lng);
                    if (loc.city) setNgoCity(loc.city);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#202820]/60 dark:text-white/60 font-semibold mb-1 block">
                    Latitude
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#F8F5EB] dark:bg-white/5 font-mono text-xs">
                    {ngoLat.toFixed(5)}
                  </div>
                </div>
                <div>
                  <label className="text-[#202820]/60 dark:text-white/60 font-semibold mb-1 block">
                    Longitude
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#F8F5EB] dark:bg-white/5 font-mono text-xs">
                    {ngoLng.toFixed(5)}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-[#3C8D58] hover:bg-[#327749] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Location & Center Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: View Details */}
        {selectedDonationDetails && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#16221A] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#123D2B]/10 dark:border-white/15">
              <div className="flex items-center justify-between pb-3 border-b border-[#123D2B]/10 dark:border-white/10">
                <div>
                  <span className="text-xs font-mono text-[#3C8D58] font-bold">#{selectedDonationDetails.id}</span>
                  <h3 className="font-display font-bold text-xl text-[#123D2B] dark:text-white">
                    {selectedDonationDetails.foodName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDonationDetails(null)}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-2.5 text-[#202820]/80 dark:text-white/80">
                <p><strong>Category:</strong> {selectedDonationDetails.category}</p>
                <p><strong>Quantity:</strong> {selectedDonationDetails.quantity} (~{selectedDonationDetails.peopleServed} servings)</p>
                <p><strong>Preparation Time:</strong> {selectedDonationDetails.preparationTime}</p>
                <p><strong>Safe Consumption Until:</strong> {selectedDonationDetails.safeUntil}</p>
                <p><strong>Pickup Address:</strong> {selectedDonationDetails.pickupAddress}</p>
                <p><strong>Donor Contact:</strong> {selectedDonationDetails.donorName} ({selectedDonationDetails.contactNumber})</p>
                {selectedDonationDetails.additionalInstructions && (
                  <p className="bg-[#F8F5EB] dark:bg-white/5 p-3 rounded-xl italic">
                    Note: "{selectedDonationDetails.additionalInstructions}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#123D2B]/10 dark:border-white/10 flex gap-3">
                <button
                  onClick={() => setSelectedDonationDetails(null)}
                  className="flex-1 py-2.5 bg-neutral-100 dark:bg-white/10 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                {selectedDonationDetails.status === 'Available' && (
                  <button
                    onClick={() => {
                      handleAcceptDonation(selectedDonationDetails.id);
                      setSelectedDonationDetails(null);
                    }}
                    className="flex-1 py-2.5 bg-[#3C8D58] hover:bg-[#327749] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Accept Donation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
