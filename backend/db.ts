import pg from 'pg';
import { config } from './config';

const { Pool } = pg;

let pool: pg.Pool | null = null;

// Central in-memory table store used when process.env.DATABASE_URL is pending/unconfigured.
// This guarantees that all devices (Laptop, Mobile, Tablet) connecting to the backend share
// the exact same centralized records instead of isolating data into individual device localStorages.
interface InMemoryStore {
  users: Array<{ id: string; email: string; password_hash: string; role: string; created_at: string; updated_at: string }>;
  profiles: Array<{
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    organization_name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    share_location: boolean;
    created_at: string;
    updated_at: string;
  }>;
  food_donations: Array<{
    id: string;
    donor_id: string;
    donor_name: string;
    donor_phone: string;
    donor_org: string;
    food_name: string;
    category: string;
    quantity: string;
    people_served: number;
    preparation_time: string;
    safe_until: string;
    pickup_address: string;
    pickup_latitude: number;
    pickup_longitude: number;
    contact_number: string;
    additional_instructions?: string;
    status: string;
    ngo_id?: string;
    ngo_name?: string;
    ngo_address?: string;
    ngo_latitude?: number;
    ngo_longitude?: number;
    volunteer_id?: string;
    volunteer_name?: string;
    volunteer_phone?: string;
    volunteer_latitude?: number;
    volunteer_longitude?: number;
    volunteer_share_location?: boolean;
    delivery_remarks?: string;
    created_at: string;
    updated_at: string;
  }>;
  notifications: Array<{
    id: string;
    user_id: string;
    role: string;
    title: string;
    message: string;
    donation_id?: string;
    is_read: boolean;
    created_at: string;
  }>;
  delivery_updates: Array<{
    id: string;
    donation_id: string;
    volunteer_id?: string;
    volunteer_name?: string;
    status: string;
    remarks?: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
  }>;
  volunteer_assignments: Array<{
    id: string;
    donation_id: string;
    volunteer_id: string;
    status: string;
    assigned_at: string;
    pickup_time?: string;
    delivery_time?: string;
    notes?: string;
  }>;
}

const inMemoryStore: InMemoryStore = {
  users: [
    {
      id: 'donor-priya-01',
      email: 'priya@curryhouse.com',
      password_hash: '$2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy',
      role: 'donor',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'ngo-rajesh-01',
      email: 'rajesh@hopefoundation.org',
      password_hash: '$2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy',
      role: 'ngo',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'volunteer-vikram-01',
      email: 'vikram.rao@volunteer.org',
      password_hash: '$2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy',
      role: 'volunteer',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  profiles: [
    {
      id: 'donor-priya-01',
      full_name: 'Chef Priya Sharma',
      email: 'priya@curryhouse.com',
      phone: '+91 98450 12345',
      role: 'donor',
      organization_name: 'The Curry House Restaurant',
      address: '100ft Road, Indiranagar, Bengaluru',
      city: 'Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      share_location: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'ngo-rajesh-01',
      full_name: 'Rajesh Nair',
      email: 'rajesh@hopefoundation.org',
      phone: '+91 98860 67890',
      role: 'ngo',
      organization_name: 'Hope Community Care Foundation',
      address: 'Austin Town, Near Community Center, Bengaluru',
      city: 'Bengaluru',
      latitude: 12.962,
      longitude: 77.6145,
      share_location: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'volunteer-vikram-01',
      full_name: 'Vikram Rao',
      email: 'vikram.rao@volunteer.org',
      phone: '+91 97410 54321',
      role: 'volunteer',
      organization_name: 'FoodBridge City Volunteer Corps',
      address: 'Koramangala 4th Block, Bengaluru',
      city: 'Bengaluru',
      latitude: 12.9345,
      longitude: 77.6265,
      share_location: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  food_donations: [
    {
      id: 'FB-9041',
      donor_id: 'donor-priya-01',
      donor_name: 'Chef Priya Sharma',
      donor_phone: '+91 98450 12345',
      donor_org: 'The Curry House Restaurant',
      food_name: 'Vegetable Dum Biryani & Dal Makhani',
      category: 'Cooked Food',
      quantity: '35 Portions (12 kg)',
      people_served: 35,
      preparation_time: 'Today, 1:30 PM',
      safe_until: 'Today, 8:30 PM (4.5h left)',
      pickup_address: 'The Curry House, 100ft Rd, Indiranagar, Bengaluru',
      pickup_latitude: 12.9784,
      pickup_longitude: 77.6408,
      contact_number: '+91 98450 12345',
      additional_instructions: 'Packed in food-grade insulated thermal carriers.',
      status: 'Available',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'FB-9205',
      donor_id: 'donor-priya-01',
      donor_name: 'Chef Priya Sharma',
      donor_phone: '+91 98450 12345',
      donor_org: 'The Curry House Bakery & Cafe',
      food_name: 'Fresh Baked Sourdough Loaves & Croissants',
      category: 'Bakery',
      quantity: '45 Assorted Items',
      people_served: 40,
      preparation_time: 'Today, 10:00 AM',
      safe_until: 'Tomorrow, 5:00 PM',
      pickup_address: 'Richmond Circle, Shanthi Nagar, Bengaluru',
      pickup_latitude: 12.9602,
      pickup_longitude: 77.5996,
      contact_number: '+91 98450 12345',
      status: 'Available',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'FB-8822',
      donor_id: 'donor-priya-01',
      donor_name: 'Chef Priya Sharma',
      donor_phone: '+91 98450 12345',
      donor_org: 'The Curry House Restaurant',
      food_name: 'Artisan Whole Wheat Bread & Buns',
      category: 'Bakery',
      quantity: '60 Loaves & Rolls',
      people_served: 50,
      preparation_time: 'Today, 11:00 AM',
      safe_until: 'Tomorrow, 6:00 PM',
      pickup_address: 'Domlur Intermediate Ring Rd, Bengaluru',
      pickup_latitude: 12.9609,
      pickup_longitude: 77.6387,
      contact_number: '+91 98450 12345',
      status: 'NGO Accepted',
      ngo_id: 'ngo-rajesh-01',
      ngo_name: 'Hope Community Care Foundation',
      ngo_address: 'Austin Town, Near Community Center, Bengaluru',
      ngo_latitude: 12.962,
      ngo_longitude: 77.6145,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  notifications: [
    {
      id: 'notif-seed-1',
      user_id: 'donor-priya-01',
      role: 'donor',
      title: 'Donation Accepted!',
      message: 'Hope Community Care Foundation accepted your donation of Artisan Bread (FB-8822).',
      donation_id: 'FB-8822',
      is_read: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'notif-seed-2',
      user_id: 'ngo-rajesh-01',
      role: 'ngo',
      title: 'New Donation Available',
      message: 'The Curry House just published 35 portions of Vegetable Dum Biryani (FB-9041).',
      donation_id: 'FB-9041',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-seed-3',
      user_id: 'volunteer-vikram-01',
      role: 'volunteer',
      title: 'New Pickup Task Available',
      message: 'Artisan Bread (FB-8822) is ready for pickup in Indiranagar for delivery to Austin Town.',
      donation_id: 'FB-8822',
      is_read: false,
      created_at: new Date(Date.now() - 1700000).toISOString(),
    },
  ],
  delivery_updates: [],
  volunteer_assignments: [],
};

export function getPool(): pg.Pool | null {
  if (!config.databaseUrl) {
    return null;
  }

  if (!pool) {
    const isLocalhost =
      config.databaseUrl.includes('localhost') ||
      config.databaseUrl.includes('127.0.0.1');

    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error] Unexpected idle client error:', err.message);
    });
  }

  return pool;
}

export function isPostgresConfigured(): boolean {
  return Boolean(config.databaseUrl && config.databaseUrl.startsWith('postgres'));
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const currentPool = getPool();

  // If real PostgreSQL DATABASE_URL is configured, execute directly on PostgreSQL!
  if (currentPool) {
    const start = Date.now();
    try {
      const result = await currentPool.query<T>(text, params);
      const duration = Date.now() - start;
      if (process.env.DEBUG_SQL === 'true') {
        console.log('[PostgreSQL SQL]', { text: text.slice(0, 100), duration, rows: result.rowCount });
      }
      return result;
    } catch (error: any) {
      console.error('[PostgreSQL SQL Error]', { message: error.message, query: text.slice(0, 100) });
      throw error;
    }
  }

  // Fallback: Centralized Server-Side In-Memory Relational Engine
  // This guarantees that if DATABASE_URL is not provided, both Laptop and Mobile
  // still hit the EXACT SAME central backend server and share live data across devices.
  return executeInMemoryQuery<T>(text, params || []);
}

function executeInMemoryQuery<T extends pg.QueryResultRow = any>(text: string, params: any[]): pg.QueryResult<T> {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. SELECT * FROM food_donations
  if (lower.startsWith('select * from food_donations')) {
    let rows = [...inMemoryStore.food_donations];

    // Check for id = $1
    if (lower.includes('where id = $1') && params[0]) {
      rows = rows.filter((d) => d.id === params[0]);
    } else {
      // Dynamic filters: status, donor_id, ngo_id, volunteer_id
      if (lower.includes('status = $')) {
        const paramIdx = extractParamIndex(clean, 'status');
        if (paramIdx !== -1 && params[paramIdx]) rows = rows.filter((d) => d.status === params[paramIdx]);
      }
      if (lower.includes('donor_id = $')) {
        const paramIdx = extractParamIndex(clean, 'donor_id');
        if (paramIdx !== -1 && params[paramIdx]) rows = rows.filter((d) => d.donor_id === params[paramIdx]);
      }
      if (lower.includes('ngo_id = $')) {
        const paramIdx = extractParamIndex(clean, 'ngo_id');
        if (paramIdx !== -1 && params[paramIdx]) rows = rows.filter((d) => d.ngo_id === params[paramIdx]);
      }
      if (lower.includes('volunteer_id = $')) {
        const paramIdx = extractParamIndex(clean, 'volunteer_id');
        if (paramIdx !== -1 && params[paramIdx]) rows = rows.filter((d) => d.volunteer_id === params[paramIdx]);
      }
    }

    // Sort descending by created_at
    rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      rows: rows as unknown as T[],
      command: 'SELECT',
      rowCount: rows.length,
      oid: 0,
      fields: [],
    };
  }

  // 2. INSERT INTO food_donations
  if (lower.startsWith('insert into food_donations')) {
    const newDonation = {
      id: params[0],
      donor_id: params[1],
      donor_name: params[2],
      donor_phone: params[3],
      donor_org: params[4],
      food_name: params[5],
      category: params[6],
      quantity: params[7],
      people_served: Number(params[8]) || 10,
      preparation_time: params[9],
      safe_until: params[10],
      pickup_address: params[11],
      pickup_latitude: Number(params[12]),
      pickup_longitude: Number(params[13]),
      contact_number: params[14],
      additional_instructions: params[15],
      status: 'Available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryStore.food_donations.unshift(newDonation);
    return {
      rows: [newDonation] as unknown as T[],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    };
  }

  // 3. UPDATE food_donations (NGO Acceptance, Volunteer Assignment, Delivery Transitions)
  if (lower.startsWith('update food_donations')) {
    if (lower.includes("set status = 'ngo accepted'")) {
      // NGO acceptance: $1: ngoId, $2: ngoName, $3: ngoAddress, $4: ngoLat, $5: ngoLng, $6: donationId
      const donationId = params[5];
      const target = inMemoryStore.food_donations.find(
        (d) => d.id === donationId && d.status === 'Available' && !d.ngo_id
      );
      if (!target) {
        return { rows: [] as unknown as T[], command: 'UPDATE', rowCount: 0, oid: 0, fields: [] };
      }
      target.status = 'NGO Accepted';
      target.ngo_id = params[0];
      target.ngo_name = params[1];
      target.ngo_address = params[2];
      target.ngo_latitude = Number(params[3]);
      target.ngo_longitude = Number(params[4]);
      target.updated_at = new Date().toISOString();
      return { rows: [target] as unknown as T[], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] };
    }

    if (lower.includes("set status = 'volunteer assigned'")) {
      // Volunteer assign: $1: volId, $2: volName, $3: volPhone, $4: volLat, $5: volLng, $6: shareLoc, $7: donationId
      const donationId = params[6];
      const target = inMemoryStore.food_donations.find(
        (d) => d.id === donationId && d.status === 'NGO Accepted' && !d.volunteer_id
      );
      if (!target) {
        return { rows: [] as unknown as T[], command: 'UPDATE', rowCount: 0, oid: 0, fields: [] };
      }
      target.status = 'Volunteer Assigned';
      target.volunteer_id = params[0];
      target.volunteer_name = params[1];
      target.volunteer_phone = params[2];
      target.volunteer_latitude = Number(params[3]);
      target.volunteer_longitude = Number(params[4]);
      target.volunteer_share_location = Boolean(params[5]);
      target.updated_at = new Date().toISOString();
      return { rows: [target] as unknown as T[], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] };
    }

    if (lower.includes("set status = 'pickup in progress'")) {
      const donationId = params[0];
      const volId = params[1];
      const target = inMemoryStore.food_donations.find((d) => d.id === donationId && d.volunteer_id === volId);
      if (target) {
        target.status = 'Pickup in Progress';
        target.updated_at = new Date().toISOString();
        return { rows: [target] as unknown as T[], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] };
      }
      return { rows: [] as unknown as T[], command: 'UPDATE', rowCount: 0, oid: 0, fields: [] };
    }

    if (lower.includes("set status = 'delivered'")) {
      const remarks = params[0];
      const donationId = params[1];
      const volId = params[2];
      const target = inMemoryStore.food_donations.find((d) => d.id === donationId && d.volunteer_id === volId);
      if (target) {
        target.status = 'Delivered';
        target.delivery_remarks = remarks;
        target.updated_at = new Date().toISOString();
        return { rows: [target] as unknown as T[], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] };
      }
      return { rows: [] as unknown as T[], command: 'UPDATE', rowCount: 0, oid: 0, fields: [] };
    }

    if (lower.includes("set status = 'completed'")) {
      const donationId = params[0];
      const ngoId = params[1];
      const target = inMemoryStore.food_donations.find((d) => d.id === donationId && d.ngo_id === ngoId);
      if (target) {
        target.status = 'Completed';
        target.updated_at = new Date().toISOString();
        return { rows: [target] as unknown as T[], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] };
      }
      return { rows: [] as unknown as T[], command: 'UPDATE', rowCount: 0, oid: 0, fields: [] };
    }

    if (lower.includes("set status = 'cancelled'")) {
      const donationId = params[0];
      const donorId = params[1];
      const target = inMemoryStore.food_donations.find(
        (d) => d.id === donationId && d.donor_id === donorId && d.status === 'Available'
      );
      if (target) {
        target.status = 'Cancelled';
        target.updated_at = new Date().toISOString();
        return { rows: [target] as unknown as T[], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] };
      }
      return { rows: [] as unknown as T[], command: 'UPDATE', rowCount: 0, oid: 0, fields: [] };
    }
  }

  // 4. SELECT users / profiles
  if (lower.startsWith('select u.id, u.email') || lower.startsWith('select id, email')) {
    const email = params[0]?.toLowerCase();
    const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === email);
    if (!user) return { rows: [] as unknown as T[], command: 'SELECT', rowCount: 0, oid: 0, fields: [] };
    const profile = inMemoryStore.profiles.find((p) => p.id === user.id) || ({} as any);
    const combined = {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role,
      full_name: profile.full_name || user.email,
      phone: profile.phone || '',
      organization_name: profile.organization_name || '',
      address: profile.address || '',
      city: profile.city || 'Bengaluru',
      latitude: profile.latitude || 12.9716,
      longitude: profile.longitude || 77.5946,
      share_location: profile.share_location || false,
      created_at: user.created_at,
    };
    return { rows: [combined] as unknown as T[], command: 'SELECT', rowCount: 1, oid: 0, fields: [] };
  }

  if (lower.includes('from profiles where id = $1')) {
    const id = params[0];
    const profile = inMemoryStore.profiles.find((p) => p.id === id);
    return {
      rows: (profile ? [profile] : []) as unknown as T[],
      command: 'SELECT',
      rowCount: profile ? 1 : 0,
      oid: 0,
      fields: [],
    };
  }

  if (lower.includes("from profiles where role = 'ngo'")) {
    const ngos = inMemoryStore.profiles.filter((p) => p.role === 'ngo');
    return { rows: ngos as unknown as T[], command: 'SELECT', rowCount: ngos.length, oid: 0, fields: [] };
  }

  if (lower.includes("from profiles where role = 'volunteer'")) {
    const vols = inMemoryStore.profiles.filter((p) => p.role === 'volunteer');
    return { rows: vols as unknown as T[], command: 'SELECT', rowCount: vols.length, oid: 0, fields: [] };
  }

  // 5. INSERT INTO users
  if (lower.startsWith('insert into users')) {
    const existing = inMemoryStore.users.find((u) => u.id === params[0] || u.email === params[1]);
    if (!existing) {
      inMemoryStore.users.push({
        id: params[0],
        email: params[1],
        password_hash: params[2],
        role: params[3],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return { rows: [] as unknown as T[], command: 'INSERT', rowCount: 1, oid: 0, fields: [] };
  }

  // 6. INSERT INTO profiles
  if (lower.startsWith('insert into profiles')) {
    const existing = inMemoryStore.profiles.find((p) => p.id === params[0]);
    if (!existing) {
      inMemoryStore.profiles.push({
        id: params[0],
        full_name: params[1],
        email: params[2],
        phone: params[3] || '',
        role: params[4],
        organization_name: params[5] || '',
        address: params[6] || '',
        city: params[7] || 'Bengaluru',
        latitude: Number(params[8]) || 12.9716,
        longitude: Number(params[9]) || 77.5946,
        share_location: Boolean(params[10]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return { rows: [] as unknown as T[], command: 'INSERT', rowCount: 1, oid: 0, fields: [] };
  }

  // 7. NOTIFICATIONS
  if (lower.startsWith('select id, user_id, role, title, message') || lower.startsWith('select * from notifications')) {
    const userId = params[0];
    const userNotifs = inMemoryStore.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows: userNotifs as unknown as T[], command: 'SELECT', rowCount: userNotifs.length, oid: 0, fields: [] };
  }

  if (lower.startsWith('insert into notifications')) {
    inMemoryStore.notifications.unshift({
      id: params[0],
      user_id: params[1],
      role: params[2],
      title: params[3],
      message: params[4],
      donation_id: params[5],
      is_read: false,
      created_at: new Date().toISOString(),
    });
    return { rows: [] as unknown as T[], command: 'INSERT', rowCount: 1, oid: 0, fields: [] };
  }

  if (lower.startsWith('update notifications set is_read = true')) {
    const id = params[0];
    const notif = inMemoryStore.notifications.find((n) => n.id === id);
    if (notif) notif.is_read = true;
    return { rows: [] as unknown as T[], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] };
  }

  // 8. DELIVERY UPDATES / VOLUNTEER ASSIGNMENTS
  if (lower.startsWith('insert into delivery_updates')) {
    inMemoryStore.delivery_updates.push({
      id: params[0],
      donation_id: params[1],
      volunteer_id: params[2],
      volunteer_name: params[3],
      status: params[4],
      remarks: params[5],
      latitude: params[6],
      longitude: params[7],
      created_at: new Date().toISOString(),
    });
    return { rows: [] as unknown as T[], command: 'INSERT', rowCount: 1, oid: 0, fields: [] };
  }

  if (lower.startsWith('select * from delivery_updates')) {
    const donationId = params[0];
    const updates = inMemoryStore.delivery_updates.filter((u) => u.donation_id === donationId);
    return { rows: updates as unknown as T[], command: 'SELECT', rowCount: updates.length, oid: 0, fields: [] };
  }

  if (lower.startsWith('select count(*)')) {
    const count = lower.includes('users')
      ? inMemoryStore.users.length
      : lower.includes('food_donations')
      ? inMemoryStore.food_donations.length
      : inMemoryStore.notifications.length;
    return { rows: [{ count: String(count) }] as unknown as T[], command: 'SELECT', rowCount: 1, oid: 0, fields: [] };
  }

  // Default empty return
  return {
    rows: [] as unknown as T[],
    command: 'SELECT',
    rowCount: 0,
    oid: 0,
    fields: [],
  };
}

function extractParamIndex(sql: string, columnName: string): number {
  const regex = new RegExp(`${columnName}\\s*=\\s*\\$(\\d+)`, 'i');
  const match = sql.match(regex);
  if (match && match[1]) {
    return parseInt(match[1], 10) - 1;
  }
  return -1;
}

export interface ConnectionTestResult {
  connected: boolean;
  configured: boolean;
  databaseName?: string;
  version?: string;
  serverTime?: string;
  latencyMs?: number;
  tables?: string[];
  error?: string;
}

export async function testConnection(): Promise<ConnectionTestResult> {
  if (!config.databaseUrl) {
    return {
      connected: false,
      configured: false,
      error: 'process.env.DATABASE_URL is not set. The backend is operating on the synchronized central server store.',
    };
  }

  const start = Date.now();
  try {
    const currentPool = getPool();
    if (!currentPool) {
      throw new Error('Database pool could not be initialized.');
    }

    const res = await currentPool.query(`SELECT NOW() AS now, current_database() AS db_name, version() AS version;`);
    const latency = Date.now() - start;

    let tableNames: string[] = [];
    try {
      const tableRes = await currentPool.query(
        `SELECT table_name 
         FROM information_schema.tables 
         WHERE table_schema = 'public' 
         ORDER BY table_name;`
      );
      tableNames = tableRes.rows.map((r: any) => r.table_name);
    } catch {
      // Non-fatal
    }

    return {
      connected: true,
      configured: true,
      databaseName: res.rows[0]?.db_name,
      version: res.rows[0]?.version?.split(' ')?.[0] + ' ' + (res.rows[0]?.version?.split(' ')?.[1] || ''),
      serverTime: res.rows[0]?.now?.toISOString?.() || String(res.rows[0]?.now),
      latencyMs: latency,
      tables: tableNames,
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      error: err.message || 'Failed to establish connection to PostgreSQL database.',
      latencyMs: Date.now() - start,
    };
  }
}
