export type ModalType = 'donate' | 'volunteer' | 'partner' | 'login' | null;

export type UserRole = 'donor' | 'ngo' | 'volunteer';

export type DonationCategory =
  | 'Cooked Food'
  | 'Packaged Food'
  | 'Fruits'
  | 'Vegetables'
  | 'Bakery'
  | 'Other';

export type DonationStatus =
  | 'Available'
  | 'NGO Accepted'
  | 'Volunteer Assigned'
  | 'Pickup in Progress'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  organizationName?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  shareLocation?: boolean; // Volunteer explicit location sharing during active delivery
  createdAt: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  user?: UserProfile | null;
  name?: string;
  role?: string;
  organization?: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorOrg?: string;
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
  status: DonationStatus;
  ngoId?: string;
  ngoName?: string;
  ngoAddress?: string;
  ngoLatitude?: number;
  ngoLongitude?: number;
  volunteerId?: string;
  volunteerName?: string;
  volunteerPhone?: string;
  volunteerLatitude?: number;
  volunteerLongitude?: number;
  volunteerShareLocation?: boolean;
  createdAt: string;
  updatedAt: string;
  deliveryRemarks?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface RouteEstimate {
  straightLineKm: number;
  roadKm?: number;
  durationMinutes?: number;
  geometry?: [number, number][]; // [lat, lng] array for polyline
  isRoadRoute: boolean;
  summary?: string;
}

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lng: number;
  city?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  donationId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DeliveryUpdateRecord {
  id: string;
  donationId: string;
  volunteerId: string;
  volunteerName: string;
  status: string;
  remarks?: string;
  createdAt: string;
}

export type ViewRoute =
  | 'landing'
  | 'role-select'
  | 'auth'
  | 'donor-dashboard'
  | 'ngo-dashboard'
  | 'volunteer-dashboard';

// Backward compatibility for existing modal types
export interface DonationSubmission {
  id: string;
  donorName: string;
  phone: string;
  donorType: string;
  foodType: string;
  quantity: string;
  quantityType: string;
  prepTime: string;
  expiryHours: string;
  address: string;
  cityArea: string;
  dietaryInfo: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface VolunteerSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  availability: string;
  area: string;
  vehicle: string;
  createdAt: string;
}

export interface PartnerSubmission {
  id: string;
  orgName: string;
  contactName: string;
  email: string;
  phone: string;
  regId: string;
  dailyCapacity: string;
  storageAvailable: boolean;
  serviceAreas: string;
  createdAt: string;
}
