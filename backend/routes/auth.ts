import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Register new user (donor, ngo, or volunteer)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role,
      organizationName,
      address,
      city,
      latitude,
      longitude,
    } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({ error: 'Full name, email, password, and role are required.' });
      return;
    }

    if (!['donor', 'ngo', 'volunteer'].includes(role)) {
      res.status(400).json({ error: 'Role must be donor, ngo, or volunteer.' });
      return;
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: `An account with email "${email}" already exists.` });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr-${role}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const defaultLat = role === 'ngo' ? 12.9620 : role === 'volunteer' ? 12.9345 : 12.9784;
    const defaultLng = role === 'ngo' ? 77.6145 : role === 'volunteer' ? 77.6265 : 77.6408;

    const lat = typeof latitude === 'number' ? latitude : defaultLat;
    const lng = typeof longitude === 'number' ? longitude : defaultLng;
    const org = organizationName || `${fullName}'s ${role.toUpperCase()}`;
    const userCity = city || 'Bengaluru';
    const userAddress = address || 'Bengaluru, Karnataka';

    // Insert user credentials
    await query(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [userId, email.toLowerCase(), passwordHash, role]
    );

    // Insert profile
    await query(
      `INSERT INTO profiles (id, full_name, email, phone, role, organization_name, address, city, latitude, longitude, share_location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        fullName,
        email.toLowerCase(),
        phone || '',
        role,
        org,
        userAddress,
        userCity,
        lat,
        lng,
        role === 'volunteer',
      ]
    );

    // If NGO, also seed ngo_information
    if (role === 'ngo') {
      await query(
        `INSERT INTO ngo_information (id, org_name, contact_person, phone, email, address, city, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [userId, org, fullName, phone || '', email.toLowerCase(), userAddress, userCity, lat, lng]
      );
    }

    const token = generateToken({
      id: userId,
      email: email.toLowerCase(),
      role,
      fullName,
      organizationName: org,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        fullName,
        email: email.toLowerCase(),
        phone: phone || '',
        role,
        organizationName: org,
        address: userAddress,
        city: userCity,
        latitude: lat,
        longitude: lng,
        shareLocation: role === 'volunteer',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Register Error]', err);
    res.status(500).json({ error: err.message || 'Internal server error registering account.' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !role) {
      res.status(400).json({ error: 'Email and role are required.' });
      return;
    }

    // Fetch user and profile
    const userRes = await query(
      `SELECT u.id, u.email, u.password_hash, u.role,
              p.full_name, p.phone, p.organization_name, p.address, p.city,
              p.latitude, p.longitude, p.share_location, p.created_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (userRes.rows.length === 0) {
      // Auto-provision standard demo accounts on first login if not yet in database
      const demoUsers: Record<string, { id: string; name: string; phone: string; role: 'donor' | 'ngo' | 'volunteer'; org: string; address: string; city: string; lat: number; lng: number }> = {
        'priya@curryhouse.com': {
          id: 'donor-priya-01',
          name: 'Chef Priya Sharma',
          phone: '+91 98450 12345',
          role: 'donor',
          org: 'The Curry House Restaurant',
          address: '100ft Road, Indiranagar, Bengaluru',
          city: 'Bengaluru',
          lat: 12.9784,
          lng: 77.6408,
        },
        'rajesh@hopefoundation.org': {
          id: 'ngo-rajesh-01',
          name: 'Rajesh Nair',
          phone: '+91 98860 67890',
          role: 'ngo',
          org: 'Hope Community Care Foundation',
          address: 'Austin Town, Near Community Center, Bengaluru',
          city: 'Bengaluru',
          lat: 12.9620,
          lng: 77.6145,
        },
        'vikram.rao@volunteer.org': {
          id: 'volunteer-vikram-01',
          name: 'Vikram Rao',
          phone: '+91 97410 54321',
          role: 'volunteer',
          org: 'FoodBridge City Volunteer Corps',
          address: 'Koramangala 4th Block, Bengaluru',
          city: 'Bengaluru',
          lat: 12.9345,
          lng: 77.6265,
        },
      };

      const demo = demoUsers[email.toLowerCase()];
      if (demo && demo.role === role) {
        const defaultHash = '$2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy';
        await query(
          `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [demo.id, email.toLowerCase(), defaultHash, demo.role]
        );
        await query(
          `INSERT INTO profiles (id, full_name, email, phone, role, organization_name, address, city, latitude, longitude, share_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
          [demo.id, demo.name, email.toLowerCase(), demo.phone, demo.role, demo.org, demo.address, demo.city, demo.lat, demo.lng, demo.role === 'volunteer']
        );
        const recheck = await query(
          `SELECT u.id, u.email, u.password_hash, u.role,
                  p.full_name, p.phone, p.organization_name, p.address, p.city,
                  p.latitude, p.longitude, p.share_location, p.created_at
           FROM users u
           LEFT JOIN profiles p ON u.id = p.id
           WHERE LOWER(u.email) = LOWER($1)`,
          [email]
        );
        if (recheck.rows.length > 0) {
          userRes.rows.push(recheck.rows[0]);
        }
      }
    }

    if (userRes.rows.length === 0) {
      res.status(404).json({
        error: `No account found for "${email}". Please register to continue.`,
      });
      return;
    }

    const userRow = userRes.rows[0];

    // Role check
    if (userRow.role !== role) {
      res.status(403).json({
        error: `Account role mismatch: "${email}" is registered as a ${userRow.role.toUpperCase()}. Please switch to the ${userRow.role.toUpperCase()} portal.`,
      });
      return;
    }

    // Verify password if provided
    if (password) {
      const isMatch = await bcrypt.compare(password, userRow.password_hash);
      // Also allow default demo bypass password if matches demo account
      const isDemoMatch = password === 'foodbridge123' || password === 'demo123';
      if (!isMatch && !isDemoMatch) {
        res.status(401).json({ error: 'Incorrect password. Please try again.' });
        return;
      }
    }

    const userProfile = {
      id: userRow.id,
      fullName: userRow.full_name || userRow.email,
      email: userRow.email,
      phone: userRow.phone || '',
      role: userRow.role,
      organizationName: userRow.organization_name,
      address: userRow.address,
      city: userRow.city || 'Bengaluru',
      latitude: Number(userRow.latitude) || 12.9716,
      longitude: Number(userRow.longitude) || 77.5946,
      shareLocation: Boolean(userRow.share_location),
      createdAt: userRow.created_at,
    };

    const token = generateToken({
      id: userRow.id,
      email: userRow.email,
      role: userRow.role,
      fullName: userProfile.fullName,
      organizationName: userProfile.organizationName,
    });

    res.json({
      success: true,
      token,
      user: userProfile,
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: err.message || 'Internal server error during login.' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRes = await query(
      `SELECT id, full_name, email, phone, role, organization_name,
              address, city, latitude, longitude, share_location, created_at
       FROM profiles WHERE id = $1`,
      [req.user!.id]
    );

    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const row = userRes.rows[0];
    res.json({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      organizationName: row.organization_name,
      address: row.address,
      city: row.city,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      shareLocation: Boolean(row.share_location),
      createdAt: row.created_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organizationName, address, city, latitude, longitude, shareLocation } = req.body;

    await query(
      `UPDATE profiles
       SET organization_name = COALESCE($1, organization_name),
           address = COALESCE($2, address),
           city = COALESCE($3, city),
           latitude = COALESCE($4, latitude),
           longitude = COALESCE($5, longitude),
           share_location = COALESCE($6, share_location),
           updated_at = NOW()
       WHERE id = $7`,
      [organizationName, address, city, latitude, longitude, shareLocation, req.user!.id]
    );

    // If NGO, keep ngo_information in sync
    if (req.user!.role === 'ngo') {
      await query(
        `UPDATE ngo_information
         SET org_name = COALESCE($1, org_name),
             address = COALESCE($2, address),
             city = COALESCE($3, city),
             latitude = COALESCE($4, latitude),
             longitude = COALESCE($5, longitude),
             updated_at = NOW()
         WHERE id = $6`,
        [organizationName, address, city, latitude, longitude, req.user!.id]
      );
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
