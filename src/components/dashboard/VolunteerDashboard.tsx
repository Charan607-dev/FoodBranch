import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, DonationRecord, NotificationItem } from '../../types';
import { foodbridgeService } from '../../services/foodbridgeService';
import { calculateHaversineDistance } from '../../services/geoService';
import { VolunteerRouteMap } from '../maps/VolunteerRouteMap';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import {
  LayoutDashboard,
  Navigation,
  CheckCircle2,
  Bike,
  Archive,
  User,
  LogOut,
  Bell,
  Clock,
  MapPin,
  Utensils,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Menu,
  X,
  Phone,
  Heart,
  Truck,
  Package,
  ArrowRight,
  Check,
  Building2,
  Radio,
  Eye,
  EyeOff,
  Compass,
  Sparkles,
  Save,
} from 'lucide-react';

interface VolunteerDashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onViewWebsite: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  user,
  onLogout,
  onViewWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'available-pickups' | 'my-tasks' | 'completed' | 'profile'
  >('available-pickups');
  const [allDonations, setAllDonations] = useState<DonationRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deliveryRemark, setDeliveryRemark] = useState('');
  const [activeDeliveringId, setActiveDeliveringId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRouteDonation, setSelectedRouteDonation] = useState<DonationRecord | null>(null);

  // Volunteer Working Location & Privacy Settings
  const [volAddress, setVolAddress] = useState(user.address || 'Koramangala 4th Block, Bengaluru');
  const [volCity, setVolCity] = useState(user.city || 'Bengaluru');
  const [volLat, setVolLat] = useState<number>(user.latitude || 12.9345);
  const [volLng, setVolLng] = useState<number>(user.longitude || 77.6265);
  const [shareLiveLocation, setShareLiveLocation] = useState<boolean>(user.shareLocation ?? true);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

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

  // Filtered views
  // Available pickups: donations accepted by an NGO that have no volunteer assigned yet
  const rawAvailablePickups = useMemo(() => {
    return allDonations.filter((d) => d.status === 'NGO Accepted' && !d.volunteerId);
  }, [allDonations]);

  // Nearby Pickup Opportunities with calculated distances
  const availablePickupsWithDistance = useMemo(() => {
    return rawAvailablePickups
      .map((d) => {
        const ngoLat = d.ngoLatitude || 12.962;
        const ngoLng = d.ngoLongitude || 77.6145;

        const distVolToDonor = calculateHaversineDistance(volLat, volLng, d.pickupLatitude, d.pickupLongitude);
        const distDonorToNgo = calculateHaversineDistance(d.pickupLatitude, d.pickupLongitude, ngoLat, ngoLng);
        const totalDistance = Math.round((distVolToDonor + distDonorToNgo) * 10) / 10;
        const estMinutes = Math.max(5, Math.round((totalDistance / 24) * 60)); // ~24km/h city delivery pace

        return {
          ...d,
          distVolToDonor,
          distDonorToNgo,
          totalDistance,
          estMinutes,
        };
      })
      .sort((a, b) => a.distVolToDonor - b.distVolToDonor);
  }, [rawAvailablePickups, volLat, volLng]);

  const myTasks = allDonations.filter(
    (d) =>
      d.volunteerId === user.id &&
      (d.status === 'Volunteer Assigned' || d.status === 'Pickup in Progress' || d.status === 'Delivered')
  );

  const myCompleted = allDonations.filter((d) => d.volunteerId === user.id && d.status === 'Completed');
  const mealsHelped = myCompleted.reduce((acc, curr) => acc + (curr.peopleServed || 0), 0);

  const handleAcceptPickup = async (donationId: string) => {
    setErrorMessage(null);
    const res = await foodbridgeService.acceptPickupAsVolunteer(donationId, {
      ...user,
      address: volAddress,
      latitude: volLat,
      longitude: volLng,
      shareLocation: shareLiveLocation,
    });
    if (res.success) {
      setActionMessage(`Pickup task #${donationId} assigned to you! Contact donor and start route.`);
      loadData();
      setActiveTab('my-tasks');
      setSelectedRouteDonation(null);
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to accept pickup.');
    }
  };

  const handleMarkPickedUp = async (donationId: string) => {
    setErrorMessage(null);
    const res = await foodbridgeService.markAsPickedUp(donationId, user);
    if (res.success) {
      setActionMessage('Status updated: Food collected from donor! Heading to NGO delivery location.');
      loadData();
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to update pickup status.');
    }
  };

  const handleMarkDelivered = async (donationId: string) => {
    setErrorMessage(null);
    const res = await foodbridgeService.markAsDelivered(donationId, user, deliveryRemark);
    if (res.success) {
      setActionMessage('Food delivered to NGO! Staff has been notified to inspect and confirm receipt.');
      setActiveDeliveringId(null);
      setDeliveryRemark('');
      loadData();
      setTimeout(() => setActionMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to mark as delivered.');
    }
  };

  const handleToggleLocationSharing = async (enabled: boolean) => {
    setShareLiveLocation(enabled);
    await foodbridgeService.toggleVolunteerLocationSharing(user.id, enabled);
    setActionMessage(
      enabled
        ? 'Live GPS broadcast enabled for your active deliveries. Donors and NGOs can see courier transit.'
        : 'Live GPS broadcast disabled. Courier location is now in privacy mode.'
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleSaveWorkingLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLocation(true);
    setErrorMessage(null);
    const res = await foodbridgeService.updateUserProfile(user.id, {
      address: volAddress,
      city: volCity,
      latitude: volLat,
      longitude: volLng,
      shareLocation: shareLiveLocation,
    });
    setIsSavingLocation(false);
    if (res.success) {
      setActionMessage('Working location updated! Nearby pickup opportunities have re-sorted to your current base.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to update location.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NGO Accepted':
        return 'bg-[#F4A259]/15 text-[#E0832F] dark:text-[#F4A259] border-[#F4A259]/30';
      case 'Volunteer Assigned':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Pickup in Progress':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold';
      case 'Delivered':
        return 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30';
      case 'Completed':
        return 'bg-[#3C8D58]/15 text-[#3C8D58] dark:text-[#4EBE73] border-[#3C8D58]/30 font-bold';
      default:
        return 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EB] dark:bg-[#0E1611] text-[#202820] dark:text-[#F4F6F4] flex flex-col md:flex-row transition-colors duration-300">
      {/* Toast Notification */}
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

      {/* Modal: Interactive Route Map */}
      {selectedRouteDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <VolunteerRouteMap
              donation={selectedRouteDonation}
              volunteer={{
                ...user,
                address: volAddress,
                latitude: volLat,
                longitude: volLng,
              }}
              onClose={() => setSelectedRouteDonation(null)}
              onAcceptPickup={handleAcceptPickup}
              isAccepted={selectedRouteDonation.volunteerId === user.id}
            />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-[#142318] border-r border-[#123D2B]/10 dark:border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-[#123D2B]/10 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4A259] flex items-center justify-center text-[#123D2B] shadow-md font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-[#123D2B] dark:text-white leading-tight">
                  Food<span className="text-[#3C8D58]">Bridge</span>
                </span>
                <span className="text-[10px] uppercase font-mono block text-[#F4A259] font-bold">
                  Volunteer Courier
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
                setActiveTab('available-pickups');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'available-pickups'
                  ? 'bg-[#F4A259] text-[#123D2B] shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#F4A259]/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Navigation className="w-4 h-4 text-[#123D2B] dark:text-[#F4A259]" />
                Nearby Pickups
              </span>
              {availablePickupsWithDistance.length > 0 && (
                <span className="bg-[#123D2B] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                  {availablePickupsWithDistance.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('my-tasks');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-tasks'
                  ? 'bg-[#123D2B] dark:bg-[#203D2B] text-white shadow-sm'
                  : 'text-[#202820]/70 dark:text-white/70 hover:bg-[#123D2B]/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#3C8D58]" />
                My Active Tasks
              </span>
              {myTasks.length > 0 && (
                <span className="bg-[#3C8D58] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {myTasks.length}
                </span>
              )}
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
              <span>Impact Overview</span>
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
              <Archive className="w-4 h-4 text-[#3C8D58]" />
              <span>Delivery History ({myCompleted.length})</span>
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
              <MapPin className="w-4 h-4 text-[#F4A259]" />
              <span>Working Location & GPS</span>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#F4A259] uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5" />
              Volunteer Courier Dispatch
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#123D2B] dark:text-white">
              Hello, {user.fullName}!
            </h1>
            <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-0.5">
              Current Base: <strong className="text-[#123D2B] dark:text-white">{volAddress}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live GPS Broadcast Toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-[#16221A] px-3.5 py-2 rounded-xl border border-[#123D2B]/10 dark:border-white/10 text-xs shadow-sm">
              <button
                type="button"
                onClick={() => handleToggleLocationSharing(!shareLiveLocation)}
                className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                  shareLiveLocation ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                }`}
                title="Toggle location broadcast for active deliveries"
              >
                {shareLiveLocation ? (
                  <>
                    <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                    <span>Live GPS: ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>GPS: Private</span>
                  </>
                )}
              </button>
            </div>

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

        {/* SECTION 5: NEARBY VOLUNTEER PICKUP TASKS */}
        {activeTab === 'available-pickups' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#3C8D58] uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#F4A259]" />
                  Sorted by Nearest Distance to You
                </span>
                <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                  Nearby Pickup Opportunities
                </h2>
                <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-1">
                  Food donations claimed by accredited NGOs that need volunteer courier transport from donor to NGO.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold hover:bg-black/10 transition-colors self-start sm:self-auto"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F4A259]" />
                <span>Adjust Base Location</span>
              </button>
            </div>

            {availablePickupsWithDistance.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#16221A] rounded-3xl border border-dashed border-[#123D2B]/15 dark:border-white/10 space-y-3">
                <Truck className="w-12 h-12 text-[#3C8D58]/40 mx-auto" />
                <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                  All Current Pickups Dispatched!
                </h3>
                <p className="text-xs text-[#202820]/60 dark:text-white/60 max-w-sm mx-auto">
                  There are no unassigned courier tasks right now. As soon as an NGO claims a surplus batch, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePickupsWithDistance.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white dark:bg-[#16221A] rounded-3xl p-6 border border-[#123D2B]/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#3C8D58]">
                            #{d.id}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3C8D58]/15 text-[#3C8D58]">
                            {d.category}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#F4A259] bg-[#F4A259]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          📍 {d.distVolToDonor} km to pickup
                        </span>
                      </div>

                      {/* Food Info */}
                      <div>
                        <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                          {d.foodName}
                        </h3>
                        <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-0.5">
                          {d.quantity} &bull; Feeds ~{d.peopleServed} individuals
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                          ⏱ Consume by: {d.safeUntil}
                        </p>
                      </div>

                      {/* Location Itinerary */}
                      <div className="p-3.5 bg-[#F8F5EB]/60 dark:bg-white/5 rounded-2xl space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#3C8D58] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            1
                          </span>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#123D2B] dark:text-white">
                              Pickup: {d.donorOrg || d.donorName}
                            </span>
                            <span className="text-[11px] text-[#202820]/70 dark:text-white/70 line-clamp-1">
                              {d.pickupAddress}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#123D2B] dark:bg-white text-white dark:text-[#123D2B] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            2
                          </span>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#123D2B] dark:text-white">
                              Deliver to: {d.ngoName || 'NGO Center'}
                            </span>
                            <span className="text-[11px] text-[#202820]/70 dark:text-white/70 line-clamp-1">
                              {d.ngoAddress || 'Community Center, Bengaluru'}
                            </span>
                          </div>
                        </div>

                        {/* Distance & Travel Summary */}
                        <div className="pt-2 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[#202820]/50 dark:text-white/40 block">
                              Total Road Distance
                            </span>
                            <strong className="text-[#3C8D58] font-bold">
                              ~{d.totalDistance} km
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#202820]/50 dark:text-white/40 block">
                              Estimated Duration
                            </span>
                            <strong className="text-[#F4A259] font-bold">
                              ~{d.estMinutes} mins drive
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                      <button
                        onClick={() => setSelectedRouteDonation(d)}
                        className="px-3.5 py-2.5 rounded-xl border border-[#123D2B]/15 dark:border-white/10 hover:bg-[#123D2B]/5 text-[#123D2B] dark:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#3C8D58]" />
                        <span>View Route</span>
                      </button>

                      <button
                        onClick={() => handleAcceptPickup(d.id)}
                        className="flex-grow py-2.5 px-4 bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Pickup</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY ACTIVE TASKS TAB */}
        {activeTab === 'my-tasks' && (
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
              My Active Deliveries ({myTasks.length})
            </h2>

            {myTasks.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#16221A] rounded-3xl border border-dashed border-[#123D2B]/15 dark:border-white/10 space-y-3">
                <Truck className="w-12 h-12 text-[#3C8D58]/40 mx-auto" />
                <h3 className="font-display font-bold text-lg text-[#123D2B] dark:text-white">
                  No active courier tasks
                </h3>
                <p className="text-xs text-[#202820]/60 dark:text-white/60">
                  Select a task from "Nearby Pickups" to begin transporting surplus food.
                </p>
                <button
                  onClick={() => setActiveTab('available-pickups')}
                  className="px-5 py-2.5 bg-[#F4A259] text-[#123D2B] font-bold text-xs rounded-xl"
                >
                  Browse Nearby Pickups
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myTasks.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-md space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#123D2B]/10 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#3C8D58]">
                            #{d.id}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full border ${getStatusBadge(d.status)}`}>
                            {d.status}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-xl text-[#123D2B] dark:text-white mt-1">
                          {d.foodName}
                        </h3>
                        <p className="text-xs text-[#202820]/70 dark:text-white/70">
                          {d.quantity} &bull; Feeds ~{d.peopleServed} people
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedRouteDonation(d)}
                        className="px-4 py-2 rounded-xl bg-[#3C8D58]/15 hover:bg-[#3C8D58]/25 text-[#123D2B] dark:text-[#4EBE73] font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Interactive Route Map</span>
                      </button>
                    </div>

                    {/* Step-by-step Execution Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Step 1: Donor */}
                      <div className="p-4 rounded-2xl bg-[#3C8D58]/10 border border-[#3C8D58]/20 space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#3C8D58]">
                          1. Collection Stop
                        </span>
                        <h4 className="font-bold text-sm text-[#123D2B] dark:text-white">
                          {d.donorOrg || d.donorName}
                        </h4>
                        <p className="text-[#202820]/80 dark:text-white/80">{d.pickupAddress}</p>
                        <a
                          href={`tel:${d.contactNumber}`}
                          className="inline-flex items-center gap-1.5 font-bold text-[#3C8D58] mt-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Donor: {d.contactNumber}</span>
                        </a>
                      </div>

                      {/* Step 2: NGO */}
                      <div className="p-4 rounded-2xl bg-[#123D2B]/10 dark:bg-white/5 border border-[#123D2B]/15 dark:border-white/10 space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#123D2B] dark:text-white">
                          2. Handover Stop
                        </span>
                        <h4 className="font-bold text-sm text-[#123D2B] dark:text-white">
                          {d.ngoName || 'NGO Distribution Center'}
                        </h4>
                        <p className="text-[#202820]/80 dark:text-white/80">
                          {d.ngoAddress || 'Central Hub'}
                        </p>
                      </div>
                    </div>

                    {/* Stage Transition Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs">
                        <Radio className={`w-3.5 h-3.5 ${shareLiveLocation ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} />
                        <span className="text-[#202820]/70 dark:text-white/70">
                          GPS Sharing: <strong>{shareLiveLocation ? 'Active' : 'Private'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {d.status === 'Volunteer Assigned' && (
                          <button
                            onClick={() => handleMarkPickedUp(d.id)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#F4A259] hover:bg-[#E89143] text-[#123D2B] font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            <span>Mark as Picked Up</span>
                          </button>
                        )}

                        {d.status === 'Pickup in Progress' && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="Remarks (e.g. Handed to staff)"
                              value={activeDeliveringId === d.id ? deliveryRemark : ''}
                              onChange={(e) => {
                                setActiveDeliveringId(d.id);
                                setDeliveryRemark(e.target.value);
                              }}
                              className="px-3 py-2 text-xs rounded-xl border border-black/15 bg-white dark:bg-black/30 text-xs w-48"
                            />
                            <button
                              onClick={() => handleMarkDelivered(d.id)}
                              className="px-6 py-2.5 bg-[#3C8D58] hover:bg-[#327749] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Mark as Delivered</span>
                            </button>
                          </div>
                        )}

                        {d.status === 'Delivered' && (
                          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Awaiting NGO handover confirmation
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <span className="text-xs text-[#202820]/60 dark:text-white/60 font-semibold block mb-2">
                  Completed Rescues
                </span>
                <div className="text-3xl font-display font-extrabold text-[#3C8D58]">
                  {myCompleted.length}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  Safe deliveries
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <span className="text-xs text-[#202820]/60 dark:text-white/60 font-semibold block mb-2">
                  Meals Transported
                </span>
                <div className="text-3xl font-display font-extrabold text-[#123D2B] dark:text-white">
                  {mealsHelped}
                </div>
                <span className="text-[11px] text-[#3C8D58] font-semibold mt-1 block">
                  Servings rescued
                </span>
              </div>

              <div className="bg-white dark:bg-[#16221A] rounded-2xl p-5 border border-[#123D2B]/10 dark:border-white/10 shadow-sm">
                <span className="text-xs text-[#202820]/60 dark:text-white/60 font-semibold block mb-2">
                  Current Tasks
                </span>
                <div className="text-3xl font-display font-extrabold text-[#F4A259]">
                  {myTasks.length}
                </div>
                <span className="text-[11px] text-[#F4A259] font-semibold mt-1 block">
                  Active in transit
                </span>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED TAB */}
        {activeTab === 'completed' && (
          <div className="bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-xl text-[#123D2B] dark:text-white">
              My Completed Rescue Deliveries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F5EB] dark:bg-white/5 border-b border-[#123D2B]/10 dark:border-white/10 font-bold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Food Item</th>
                    <th className="p-3">Donor</th>
                    <th className="p-3">Receiving NGO</th>
                    <th className="p-3">Servings</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {myCompleted.map((d) => (
                    <tr key={d.id}>
                      <td className="p-3 font-mono font-bold text-[#3C8D58]">#{d.id}</td>
                      <td className="p-3 font-semibold">{d.foodName}</td>
                      <td className="p-3">{d.donorOrg || d.donorName}</td>
                      <td className="p-3">{d.ngoName}</td>
                      <td className="p-3">{d.peopleServed}</td>
                      <td className="p-3">{new Date(d.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: VOLUNTEER WORKING LOCATION SETUP */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl bg-white dark:bg-[#16221A] rounded-3xl p-6 sm:p-8 border border-[#123D2B]/10 dark:border-white/10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-[#F4A259] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Working Dispatch Location
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#123D2B] dark:text-white">
                Preferred Working Location Setup
              </h2>
              <p className="text-xs text-[#202820]/70 dark:text-white/70 mt-1">
                Your preferred location determines which pickup tasks appear closest to you. You can adjust this whenever you move to a new neighborhood or campus.
              </p>
            </div>

            <form onSubmit={handleSaveWorkingLocation} className="space-y-5">
              <div className="space-y-2">
                <LocationPickerMap
                  title="Select Your Preferred Working Area"
                  helperText="Use your current GPS position, search a landmark or road, or click anywhere on the map."
                  initialLat={volLat}
                  initialLng={volLng}
                  initialAddress={volAddress}
                  confirmButtonText="Set Working Location"
                  roleTheme="volunteer"
                  onConfirmLocation={(loc) => {
                    setVolAddress(loc.address);
                    setVolLat(loc.lat);
                    setVolLng(loc.lng);
                    if (loc.city) setVolCity(loc.city);
                  }}
                />
              </div>

              {/* Privacy and Location Sharing Switch */}
              <div className="p-4 rounded-2xl bg-[#F8F5EB] dark:bg-white/5 border border-[#123D2B]/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs sm:text-sm text-[#123D2B] dark:text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#F4A259]" />
                      Broadcast Live GPS to Donors & NGOs During Active Deliveries
                    </span>
                    <span className="text-xs text-[#202820]/60 dark:text-white/60 mt-0.5">
                      FoodBridge respects your privacy. We never track continuous location in the background. GPS is only transmitted during an active accepted delivery if this toggle is on.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={shareLiveLocation}
                    onChange={(e) => handleToggleLocationSharing(e.target.checked)}
                    className="w-5 h-5 accent-[#3C8D58] rounded cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingLocation}
                  className="px-6 py-2.5 bg-[#3C8D58] hover:bg-[#327749] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingLocation ? 'Saving...' : 'Save Working Location'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
