import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  UserProfile,
  UserRole,
  DonationRecord,
  NotificationItem,
  DonationCategory,
} from '../types';

const USERS_STORAGE_KEY = 'foodbridge_users_v3';
const DONATIONS_STORAGE_KEY = 'foodbridge_donations_v3';
const NOTIFICATIONS_STORAGE_KEY = 'foodbridge_notifications_v3';
const SESSION_STORAGE_KEY = 'foodbridge_session_v3';

// Initial pre-seeded users with accurate geographic coordinates
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'donor-priya-01',
    fullName: 'Chef Priya Sharma',
    email: 'priya@curryhouse.com',
    phone: '+91 98450 12345',
    role: 'donor',
    organizationName: 'The Curry House Restaurant',
    address: '100ft Road, Indiranagar, Bengaluru',
    city: 'Bengaluru',
    latitude: 12.9784,
    longitude: 77.6408,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'ngo-rajesh-01',
    fullName: 'Rajesh Nair',
    email: 'rajesh@hopefoundation.org',
    phone: '+91 98860 67890',
    role: 'ngo',
    organizationName: 'Hope Community Care Foundation',
    address: 'Austin Town, Near Community Center, Bengaluru',
    city: 'Bengaluru',
    latitude: 12.9620,
    longitude: 77.6145,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'volunteer-vikram-01',
    fullName: 'Vikram Rao',
    email: 'vikram.rao@volunteer.org',
    phone: '+91 97410 54321',
    role: 'volunteer',
    organizationName: 'FoodBridge City Volunteer Corps',
    address: 'Koramangala 4th Block, Bengaluru',
    city: 'Bengaluru',
    latitude: 12.9345,
    longitude: 77.6265,
    shareLocation: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
];

// Initial seeded donations with exact pickup and destination coordinates
const INITIAL_DONATIONS: DonationRecord[] = [
  {
    id: 'FB-9041',
    donorId: 'donor-priya-01',
    donorName: 'Chef Priya Sharma',
    donorPhone: '+91 98450 12345',
    donorOrg: 'The Curry House Restaurant',
    foodName: 'Vegetable Dum Biryani & Dal Makhani',
    category: 'Cooked Food',
    quantity: '35 Portions (12 kg)',
    peopleServed: 35,
    preparationTime: 'Today, 1:30 PM',
    safeUntil: 'Today, 8:30 PM (4.5h left)',
    pickupAddress: 'The Curry House, 100ft Rd, Indiranagar, Bengaluru',
    pickupLatitude: 12.9784,
    pickupLongitude: 77.6408,
    contactNumber: '+91 98450 12345',
    additionalInstructions: 'Packed in food-grade insulated thermal carriers. Please keep level during transit.',
    status: 'Available',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'FB-9205',
    donorId: 'donor-priya-01',
    donorName: 'Chef Priya Sharma',
    donorPhone: '+91 98450 12345',
    donorOrg: 'The Curry House Bakery & Cafe',
    foodName: 'Fresh Baked Sourdough Loaves & Croissants',
    category: 'Bakery',
    quantity: '45 Assorted Items',
    peopleServed: 40,
    preparationTime: 'Today, 10:00 AM',
    safeUntil: 'Tomorrow, 5:00 PM',
    pickupAddress: 'Richmond Circle, Shanthi Nagar, Bengaluru',
    pickupLatitude: 12.9602,
    pickupLongitude: 77.5996,
    contactNumber: '+91 98450 12345',
    additionalInstructions: 'Ready in paper bags, dry cargo.',
    status: 'Available',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'FB-9310',
    donorId: 'donor-priya-01',
    donorName: 'Chef Priya Sharma',
    donorPhone: '+91 98450 12345',
    donorOrg: 'Greenleaf Catering Hub',
    foodName: 'Steamed Rice, Sambar & Seasonal Veg Poriyal',
    category: 'Cooked Food',
    quantity: '60 Meals (20 kg)',
    peopleServed: 60,
    preparationTime: 'Today, 12:45 PM',
    safeUntil: 'Today, 9:00 PM',
    pickupAddress: 'Ecospace Business Park, Bellandur, Bengaluru',
    pickupLatitude: 12.9298,
    pickupLongitude: 77.6833,
    contactNumber: '+91 98450 12345',
    additionalInstructions: 'Gate 2 pickup. Contact cafeteria manager on arrival.',
    status: 'Available',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'FB-8822',
    donorId: 'donor-priya-01',
    donorName: 'Chef Priya Sharma',
    donorPhone: '+91 98450 12345',
    donorOrg: 'The Curry House Restaurant',
    foodName: 'Artisan Whole Wheat Bread & Buns',
    category: 'Bakery',
    quantity: '60 Loaves & Rolls',
    peopleServed: 50,
    preparationTime: 'Today, 11:00 AM',
    safeUntil: 'Tomorrow, 6:00 PM',
    pickupAddress: 'Domlur Intermediate Ring Rd, Bengaluru',
    pickupLatitude: 12.9609,
    pickupLongitude: 77.6387,
    contactNumber: '+91 98450 12345',
    status: 'NGO Accepted',
    ngoId: 'ngo-rajesh-01',
    ngoName: 'Hope Community Care Foundation',
    ngoAddress: 'Austin Town, Near Community Center, Bengaluru',
    ngoLatitude: 12.9620,
    ngoLongitude: 77.6145,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'FB-7619',
    donorId: 'donor-priya-01',
    donorName: 'Chef Priya Sharma',
    donorPhone: '+91 98450 12345',
    donorOrg: 'The Curry House Restaurant',
    foodName: 'Fresh Cut Seasonal Fruit Salad & Crates',
    category: 'Fruits',
    quantity: '25 kg Crate',
    peopleServed: 60,
    preparationTime: 'Today, 12:00 PM',
    safeUntil: 'Today, 7:00 PM',
    pickupAddress: 'MG Road Metro Station Area, Bengaluru',
    pickupLatitude: 12.9753,
    pickupLongitude: 77.6066,
    contactNumber: '+91 98450 12345',
    status: 'Volunteer Assigned',
    ngoId: 'ngo-rajesh-01',
    ngoName: 'Hope Community Care Foundation',
    ngoAddress: 'Austin Town, Near Community Center, Bengaluru',
    ngoLatitude: 12.9620,
    ngoLongitude: 77.6145,
    volunteerId: 'volunteer-vikram-01',
    volunteerName: 'Vikram Rao',
    volunteerPhone: '+91 97410 54321',
    volunteerLatitude: 12.9345,
    volunteerLongitude: 77.6265,
    volunteerShareLocation: true,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'FB-6502',
    donorId: 'donor-priya-01',
    donorName: 'Chef Priya Sharma',
    donorPhone: '+91 98450 12345',
    donorOrg: 'The Curry House Restaurant',
    foodName: 'Pulao & Mixed Veg Curry',
    category: 'Cooked Food',
    quantity: '40 Portions',
    peopleServed: 40,
    preparationTime: 'Yesterday, 7:00 PM',
    safeUntil: 'Delivered Fresh',
    pickupAddress: 'Koramangala 5th Block, Bengaluru',
    pickupLatitude: 12.9352,
    pickupLongitude: 77.6245,
    contactNumber: '+91 98450 12345',
    status: 'Completed',
    ngoId: 'ngo-rajesh-01',
    ngoName: 'Hope Community Care Foundation',
    ngoAddress: 'Austin Town, Bengaluru',
    ngoLatitude: 12.9620,
    ngoLongitude: 77.6145,
    volunteerId: 'volunteer-vikram-01',
    volunteerName: 'Vikram Rao',
    volunteerPhone: '+91 97410 54321',
    deliveryRemarks: 'Received with temperature check intact (68°C). Served to 40 children.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 72000000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'donor-priya-01',
    role: 'donor',
    title: 'Donation Accepted!',
    message: 'Hope Community Care Foundation accepted your donation of Artisan Bread (FB-8822).',
    donationId: 'FB-8822',
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'ngo-rajesh-01',
    role: 'ngo',
    title: 'New Donation Available',
    message: 'The Curry House just published 35 portions of Vegetable Dum Biryani (FB-9041).',
    donationId: 'FB-9041',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'volunteer-vikram-01',
    role: 'volunteer',
    title: 'New Pickup Task Available',
    message: 'Artisan Bread (FB-8822) is ready for pickup in Indiranagar for delivery to Austin Town.',
    donationId: 'FB-8822',
    isRead: false,
    createdAt: new Date(Date.now() - 1700000).toISOString(),
  },
];

function getStoredUsers(): UserProfile[] {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

function getStoredDonations(): DonationRecord[] {
  const data = localStorage.getItem(DONATIONS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(INITIAL_DONATIONS));
    return INITIAL_DONATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DONATIONS;
  }
}

function saveStoredDonations(donations: DonationRecord[]) {
  localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donations));
}

function getStoredNotifications(): NotificationItem[] {
  const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveStoredNotifications(notifs: NotificationItem[]) {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
}

export const foodbridgeService = {
  isSupabaseLive(): boolean {
    return isSupabaseConfigured;
  },

  // ---------------- AUTHENTICATION & SESSIONS ----------------
  getCurrentSession(): UserProfile | null {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentSession(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  async login(
    email: string,
    role: UserRole
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    // If Supabase is configured, authenticate via Supabase Auth / profiles
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (profileErr || !profileData) {
          // Fall back to local check
        } else if (profileData.role !== role) {
          return {
            success: false,
            error: `This account is registered as a ${profileData.role.toUpperCase()}. Please select the correct role.`,
          };
        } else {
          const user: UserProfile = {
            id: profileData.id,
            fullName: profileData.full_name,
            email: profileData.email,
            phone: profileData.phone || '',
            role: profileData.role,
            organizationName: profileData.organization_name,
            address: profileData.address,
            city: profileData.city || 'Bengaluru',
            latitude: profileData.latitude || 12.9716,
            longitude: profileData.longitude || 77.5946,
            shareLocation: profileData.share_location || false,
            createdAt: profileData.created_at,
          };
          this.setCurrentSession(user);
          return { success: true, user };
        }
      } catch (err: any) {
        console.warn('Supabase auth fallback:', err);
      }
    }

    // Local / Demo Authentication
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      return {
        success: false,
        error: `No account found for "${email}". Please click 'Create Account' to register.`,
      };
    }

    // Role boundary lock
    if (existing.role !== role) {
      return {
        success: false,
        error: `Account role mismatch: "${email}" is registered as a ${existing.role.toUpperCase()}. Please log in through the ${existing.role.toUpperCase()} portal.`,
      };
    }

    this.setCurrentSession(existing);
    return { success: true, user: existing };
  },

  async register(params: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    organizationName?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === params.email.toLowerCase())) {
      return {
        success: false,
        error: `An account with email "${params.email}" already exists. Please log in instead.`,
      };
    }

    const defaultLat = params.role === 'ngo' ? 12.962 : params.role === 'volunteer' ? 12.9345 : 12.9784;
    const defaultLng = params.role === 'ngo' ? 77.6145 : params.role === 'volunteer' ? 77.6265 : 77.6408;

    const newUser: UserProfile = {
      id: `usr-${params.role}-${Date.now().toString(36)}`,
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      role: params.role,
      organizationName: params.organizationName || `${params.fullName}'s ${params.role.toUpperCase()}`,
      address: params.address || 'Bengaluru, Karnataka',
      city: params.city || 'Bengaluru',
      latitude: params.latitude || defaultLat,
      longitude: params.longitude || defaultLng,
      shareLocation: params.role === 'volunteer',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').insert({
          id: newUser.id,
          full_name: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          organization_name: newUser.organizationName,
          address: newUser.address,
          city: newUser.city,
          latitude: newUser.latitude,
          longitude: newUser.longitude,
          share_location: newUser.shareLocation,
        });
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    }

    this.setCurrentSession(newUser);
    return { success: true, user: newUser };
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) {
      return { success: false, error: 'User profile not found.' };
    }

    const updatedUser: UserProfile = {
      ...users[index],
      ...updates,
    };
    users[index] = updatedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // If this is the current active session, update session too
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.id === userId) {
      this.setCurrentSession(updatedUser);
    }

    // Sync to Supabase if live
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            organization_name: updatedUser.organizationName,
            address: updatedUser.address,
            city: updatedUser.city,
            latitude: updatedUser.latitude,
            longitude: updatedUser.longitude,
            share_location: updatedUser.shareLocation,
          })
          .eq('id', userId);
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }

    return { success: true, user: updatedUser };
  },

  logout() {
    this.setCurrentSession(null);
  },

  // ---------------- DONATIONS & WORKFLOW ----------------
  async getDonations(): Promise<DonationRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            donorId: d.donor_id,
            donorName: d.donor_name,
            donorPhone: d.contact_number,
            donorOrg: d.donor_org,
            foodName: d.food_name,
            category: d.category,
            quantity: d.quantity,
            peopleServed: d.people_served,
            preparationTime: d.preparation_time,
            safeUntil: d.safe_until,
            pickupAddress: d.pickup_address,
            pickupLatitude: d.pickup_latitude || 12.9716,
            pickupLongitude: d.pickup_longitude || 77.5946,
            contactNumber: d.contact_number,
            additionalInstructions: d.additional_instructions,
            status: d.status,
            ngoId: d.ngo_id,
            ngoName: d.ngo_name,
            ngoAddress: d.ngo_address,
            ngoLatitude: d.ngo_latitude,
            ngoLongitude: d.ngo_longitude,
            volunteerId: d.volunteer_id,
            volunteerName: d.volunteer_name,
            volunteerPhone: d.volunteer_phone,
            volunteerLatitude: d.volunteer_latitude,
            volunteerLongitude: d.volunteer_longitude,
            volunteerShareLocation: d.volunteer_share_location,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            deliveryRemarks: d.delivery_remarks,
          }));
        }
      } catch (err) {
        console.warn('Supabase read fallback:', err);
      }
    }
    return getStoredDonations();
  },

  async createDonation(params: {
    donor: UserProfile;
    foodName: string;
    category: DonationCategory;
    quantity: string;
    peopleServed: number;
    preparationTime: string;
    safeUntil: string;
    pickupAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    contactNumber: string;
    additionalInstructions?: string;
  }): Promise<{ success: boolean; donation?: DonationRecord; error?: string }> {
    if (!params.pickupLatitude || !params.pickupLongitude) {
      return {
        success: false,
        error: 'Please select a valid food pickup location on the interactive map.',
      };
    }

    const newDonation: DonationRecord = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      donorId: params.donor.id,
      donorName: params.donor.fullName,
      donorPhone: params.contactNumber || params.donor.phone,
      donorOrg: params.donor.organizationName,
      foodName: params.foodName,
      category: params.category,
      quantity: params.quantity,
      peopleServed: Number(params.peopleServed) || 10,
      preparationTime: params.preparationTime,
      safeUntil: params.safeUntil,
      pickupAddress: params.pickupAddress,
      pickupLatitude: params.pickupLatitude,
      pickupLongitude: params.pickupLongitude,
      contactNumber: params.contactNumber,
      additionalInstructions: params.additionalInstructions,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const donations = getStoredDonations();
    donations.unshift(newDonation);
    saveStoredDonations(donations);

    // Notify all active NGOs that a new donation is available
    const users = getStoredUsers();
    const ngos = users.filter((u) => u.role === 'ngo');
    const notifs = getStoredNotifications();

    ngos.forEach((ngo) => {
      notifs.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: ngo.id,
        role: 'ngo',
        title: 'Nearby Food Donation Available!',
        message: `${newDonation.donorName} posted "${newDonation.foodName}" (${newDonation.quantity}) at ${newDonation.pickupAddress}.`,
        donationId: newDonation.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });
    saveStoredNotifications(notifs);

    return { success: true, donation: newDonation };
  },

  // Step 3: NGO accepts donation (Atomic check: 1 donation accepted by only 1 NGO)
  async acceptDonationAsNGO(
    donationId: string,
    ngo: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    const donations = getStoredDonations();
    const target = donations.find((d) => d.id === donationId);

    if (!target) {
      return { success: false, error: 'Donation not found.' };
    }

    if (target.status !== 'Available' || target.ngoId) {
      return {
        success: false,
        error: 'This donation has already been accepted by another NGO partner.',
      };
    }

    target.status = 'NGO Accepted';
    target.ngoId = ngo.id;
    target.ngoName = ngo.organizationName || ngo.fullName;
    target.ngoAddress = ngo.address || 'Central Community Hub';
    target.ngoLatitude = ngo.latitude || 12.962;
    target.ngoLongitude = ngo.longitude || 77.6145;
    target.updatedAt = new Date().toISOString();
    saveStoredDonations(donations);

    // Notify Donor
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-1`,
      userId: target.donorId,
      role: 'donor',
      title: 'Donation Accepted by NGO!',
      message: `${target.ngoName} accepted your donation of ${target.foodName} (${target.id}). A volunteer courier is now being matched for pickup.`,
      donationId: target.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Notify Volunteers about the newly available pickup task
    const users = getStoredUsers();
    const volunteers = users.filter((u) => u.role === 'volunteer');
    volunteers.forEach((vol) => {
      notifs.unshift({
        id: `notif-${Date.now()}-${vol.id}`,
        userId: vol.id,
        role: 'volunteer',
        title: 'New Nearby Pickup Task Available',
        message: `Pickup ready at ${target.pickupAddress} for delivery to ${target.ngoName}.`,
        donationId: target.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });
    saveStoredNotifications(notifs);

    return { success: true };
  },

  // Step 5: Volunteer accepts pickup (Atomic check: 1 task assigned to only 1 volunteer)
  async acceptPickupAsVolunteer(
    donationId: string,
    volunteer: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    const donations = getStoredDonations();
    const target = donations.find((d) => d.id === donationId);

    if (!target) {
      return { success: false, error: 'Donation not found.' };
    }

    if (target.status !== 'NGO Accepted' || target.volunteerId) {
      return {
        success: false,
        error: 'This pickup task has already been accepted by another volunteer courier.',
      };
    }

    target.status = 'Volunteer Assigned';
    target.volunteerId = volunteer.id;
    target.volunteerName = volunteer.fullName;
    target.volunteerPhone = volunteer.phone;
    target.volunteerLatitude = volunteer.latitude || 12.9345;
    target.volunteerLongitude = volunteer.longitude || 77.6265;
    target.volunteerShareLocation = volunteer.shareLocation ?? true;
    target.updatedAt = new Date().toISOString();
    saveStoredDonations(donations);

    // Notify Donor & NGO
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-vol-donor`,
      userId: target.donorId,
      role: 'donor',
      title: 'Volunteer Courier Assigned',
      message: `${volunteer.fullName} has accepted the pickup for ${target.foodName} and is en route.`,
      donationId: target.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    if (target.ngoId) {
      notifs.unshift({
        id: `notif-${Date.now()}-vol-ngo`,
        userId: target.ngoId,
        role: 'ngo',
        title: 'Courier Assigned for Your Donation',
        message: `${volunteer.fullName} is en route to collect ${target.foodName} from ${target.donorName} and deliver it to your center.`,
        donationId: target.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoredNotifications(notifs);
    return { success: true };
  },

  // Step 6: Volunteer collects food
  async markAsPickedUp(
    donationId: string,
    volunteer: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    const donations = getStoredDonations();
    const target = donations.find((d) => d.id === donationId);

    if (!target) return { success: false, error: 'Donation not found' };
    if (target.volunteerId !== volunteer.id) {
      return { success: false, error: 'Only the assigned volunteer can update pickup status.' };
    }

    target.status = 'Pickup in Progress';
    target.updatedAt = new Date().toISOString();
    saveStoredDonations(donations);

    // Notify Donor and NGO
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-pk-donor`,
      userId: target.donorId,
      role: 'donor',
      title: 'Food Picked Up by Courier',
      message: `${volunteer.fullName} has collected ${target.foodName} and is in transit to the NGO center.`,
      donationId: target.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    if (target.ngoId) {
      notifs.unshift({
        id: `notif-${Date.now()}-pk-ngo`,
        userId: target.ngoId,
        role: 'ngo',
        title: 'Food in Transit to You',
        message: `${volunteer.fullName} has collected ${target.foodName} and is on the way to your delivery center.`,
        donationId: target.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoredNotifications(notifs);
    return { success: true };
  },

  // Step 7: Volunteer delivers food to NGO
  async markAsDelivered(
    donationId: string,
    volunteer: UserProfile,
    remarks?: string
  ): Promise<{ success: boolean; error?: string }> {
    const donations = getStoredDonations();
    const target = donations.find((d) => d.id === donationId);

    if (!target) return { success: false, error: 'Donation not found' };
    if (target.volunteerId !== volunteer.id) {
      return { success: false, error: 'Only the assigned volunteer can update delivery status.' };
    }

    target.status = 'Delivered';
    target.deliveryRemarks = remarks || 'Delivered in good condition to NGO center staff.';
    target.updatedAt = new Date().toISOString();
    saveStoredDonations(donations);

    const notifs = getStoredNotifications();
    if (target.ngoId) {
      notifs.unshift({
        id: `notif-${Date.now()}-del-ngo`,
        userId: target.ngoId,
        role: 'ngo',
        title: 'Donation Arrived at Center',
        message: `${volunteer.fullName} has delivered ${target.foodName}. Please inspect and confirm receipt.`,
        donationId: target.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    notifs.unshift({
      id: `notif-${Date.now()}-del-donor`,
      userId: target.donorId,
      role: 'donor',
      title: 'Donation Delivered to NGO!',
      message: `Your food donation of ${target.foodName} has safely arrived at ${target.ngoName}.`,
      donationId: target.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveStoredNotifications(notifs);
    return { success: true };
  },

  // Step 8: NGO confirms receipt
  async confirmReceiptAsNGO(
    donationId: string,
    ngo: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    const donations = getStoredDonations();
    const target = donations.find((d) => d.id === donationId);

    if (!target) return { success: false, error: 'Donation not found.' };
    if (target.ngoId !== ngo.id) {
      return { success: false, error: 'Only the receiving NGO partner can confirm receipt.' };
    }

    target.status = 'Completed';
    target.updatedAt = new Date().toISOString();
    saveStoredDonations(donations);

    // Notify Donor
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-comp-donor`,
      userId: target.donorId,
      role: 'donor',
      title: 'Rescue Complete! Meals Distributed',
      message: `${target.ngoName} has confirmed receipt and distributed ${target.foodName} (${target.peopleServed} meals served). Thank you for changing lives!`,
      donationId: target.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    if (target.volunteerId) {
      notifs.unshift({
        id: `notif-${Date.now()}-comp-vol`,
        userId: target.volunteerId,
        role: 'volunteer',
        title: 'Delivery Confirmed! Impact Recorded',
        message: `${target.ngoName} confirmed successful handover of ${target.foodName}. +${target.peopleServed} impact points added to your profile!`,
        donationId: target.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoredNotifications(notifs);
    return { success: true };
  },

  // Update volunteer location sharing preference during active delivery
  async toggleVolunteerLocationSharing(
    volunteerId: string,
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const users = getStoredUsers();
    const u = users.find((user) => user.id === volunteerId);
    if (u) {
      u.shareLocation = enabled;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      const current = this.getCurrentSession();
      if (current && current.id === volunteerId) {
        current.shareLocation = enabled;
        this.setCurrentSession(current);
      }
    }

    // Update active assigned donations with location sharing state
    const donations = getStoredDonations();
    let updated = false;
    donations.forEach((d) => {
      if (d.volunteerId === volunteerId && (d.status === 'Volunteer Assigned' || d.status === 'Pickup in Progress')) {
        d.volunteerShareLocation = enabled;
        updated = true;
      }
    });
    if (updated) {
      saveStoredDonations(donations);
    }

    return { success: true };
  },

  // ---------------- NOTIFICATIONS ----------------
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const notifs = getStoredNotifications();
    return notifs.filter((n) => n.userId === userId);
  },

  async markNotificationAsRead(notifId: string): Promise<void> {
    const notifs = getStoredNotifications();
    const target = notifs.find((n) => n.id === notifId);
    if (target) {
      target.isRead = true;
      saveStoredNotifications(notifs);
    }
  },
};
