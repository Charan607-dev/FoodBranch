import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to format donation row into camelCase
function formatDonation(d: any) {
  return {
    id: d.id,
    donorId: d.donor_id,
    donorName: d.donor_name,
    donorPhone: d.donor_phone || d.contact_number,
    donorOrg: d.donor_org,
    foodName: d.food_name,
    category: d.category,
    quantity: d.quantity,
    peopleServed: Number(d.people_served) || 10,
    preparationTime: d.preparation_time,
    safeUntil: d.safe_until,
    pickupAddress: d.pickup_address,
    pickupLatitude: Number(d.pickup_latitude) || 12.9716,
    pickupLongitude: Number(d.pickup_longitude) || 77.5946,
    contactNumber: d.contact_number,
    additionalInstructions: d.additional_instructions,
    status: d.status,
    ngoId: d.ngo_id,
    ngoName: d.ngo_name,
    ngoAddress: d.ngo_address,
    ngoLatitude: d.ngo_latitude ? Number(d.ngo_latitude) : undefined,
    ngoLongitude: d.ngo_longitude ? Number(d.ngo_longitude) : undefined,
    volunteerId: d.volunteer_id,
    volunteerName: d.volunteer_name,
    volunteerPhone: d.volunteer_phone,
    volunteerLatitude: d.volunteer_latitude ? Number(d.volunteer_latitude) : undefined,
    volunteerLongitude: d.volunteer_longitude ? Number(d.volunteer_longitude) : undefined,
    volunteerShareLocation: Boolean(d.volunteer_share_location),
    deliveryRemarks: d.delivery_remarks,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

// 1. GET /api/donations (Fetch all donations or filtered by status, donor, ngo, volunteer)
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { status, donorId, ngoId, volunteerId } = req.query;

    let sql = `SELECT * FROM food_donations WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    if (donorId) {
      params.push(donorId);
      sql += ` AND donor_id = $${params.length}`;
    }
    if (ngoId) {
      params.push(ngoId);
      sql += ` AND ngo_id = $${params.length}`;
    }
    if (volunteerId) {
      params.push(volunteerId);
      sql += ` AND volunteer_id = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows.map(formatDonation));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/donations/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM food_donations WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Donation not found.' });
      return;
    }

    const donation = formatDonation(result.rows[0]);

    // Fetch delivery logs
    const updatesRes = await query(
      `SELECT * FROM delivery_updates WHERE donation_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...donation,
      deliveryUpdates: updatesRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/donations (Donor creates donation)
router.post(
  '/',
  authenticateToken,
  requireRole(['donor']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
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
      } = req.body;

      if (!foodName || !category || !quantity || !pickupAddress) {
        res.status(400).json({ error: 'Food name, category, quantity, and pickup address are required.' });
        return;
      }

      if (typeof pickupLatitude !== 'number' || typeof pickupLongitude !== 'number') {
        res.status(400).json({ error: 'Valid pickup coordinates (latitude and longitude) are required.' });
        return;
      }

      // Fetch donor profile info
      let donorRes = await query(
        `SELECT full_name, phone, organization_name FROM profiles WHERE id = $1`,
        [req.user!.id]
      );
      if (donorRes.rows.length === 0) {
        // Ensure profile exists in database to prevent foreign key violation
        await query(
          `INSERT INTO profiles (id, full_name, email, phone, role, organization_name, address, city, latitude, longitude)
           VALUES ($1, $2, $3, $4, 'donor', $5, $6, 'Bengaluru', $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            req.user!.id,
            req.user!.fullName || 'Food Donor',
            req.user!.email,
            contactNumber || '',
            req.user!.organizationName || '',
            pickupAddress,
            pickupLatitude,
            pickupLongitude,
          ]
        );
        donorRes = await query(
          `SELECT full_name, phone, organization_name FROM profiles WHERE id = $1`,
          [req.user!.id]
        );
      }
      const donorProfile = donorRes.rows[0] || {};
      const donorName = donorProfile.full_name || req.user!.fullName || 'Food Donor';
      const donorPhone = contactNumber || donorProfile.phone || '';
      const donorOrg = donorProfile.organization_name || req.user!.organizationName;

      const donationId = `FB-${Math.floor(1000 + Math.random() * 9000)}`;
      const numPeople = Number(peopleServed) || 10;

      await query(
        `INSERT INTO food_donations (
          id, donor_id, donor_name, donor_phone, donor_org, food_name, category,
          quantity, people_served, preparation_time, safe_until, pickup_address,
          pickup_latitude, pickup_longitude, contact_number, additional_instructions,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'Available')`,
        [
          donationId,
          req.user!.id,
          donorName,
          donorPhone,
          donorOrg,
          foodName,
          category,
          quantity,
          numPeople,
          preparationTime || 'Freshly prepared',
          safeUntil || 'Next 4-6 hours',
          pickupAddress,
          pickupLatitude,
          pickupLongitude,
          contactNumber || donorPhone,
          additionalInstructions || '',
        ]
      );

      // Create notification for active NGOs in the system
      try {
        const ngos = await query(`SELECT id FROM profiles WHERE role = 'ngo'`);
        for (const ngo of ngos.rows) {
          await query(
            `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
             VALUES ($1, $2, 'ngo', $3, $4, $5)`,
            [
              `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              ngo.id,
              'Nearby Food Donation Available!',
              `${donorName} posted "${foodName}" (${quantity}) at ${pickupAddress}.`,
              donationId,
            ]
          );
        }
      } catch (e) {
        console.warn('Failed to broadcast NGO notifications:', e);
      }

      const createdRes = await query(`SELECT * FROM food_donations WHERE id = $1`, [donationId]);
      res.status(201).json({
        success: true,
        donation: formatDonation(createdRes.rows[0]),
      });
    } catch (err: any) {
      console.error('[Create Donation Error]', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 4. POST /api/donations/:id/accept-ngo (NGO accepts donation)
router.post(
  '/:id/accept-ngo',
  authenticateToken,
  requireRole(['ngo']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Fetch NGO profile
      let ngoRes = await query(
        `SELECT organization_name, full_name, address, latitude, longitude FROM profiles WHERE id = $1`,
        [req.user!.id]
      );
      if (ngoRes.rows.length === 0) {
        await query(
          `INSERT INTO profiles (id, full_name, email, role, organization_name, address, city, latitude, longitude)
           VALUES ($1, $2, $3, 'ngo', $4, 'Austin Town, Near Community Center, Bengaluru', 'Bengaluru', 12.9620, 77.6145)
           ON CONFLICT (id) DO NOTHING`,
          [req.user!.id, req.user!.fullName || 'NGO Partner', req.user!.email, req.user!.organizationName || 'Hope Community Care Foundation']
        );
        ngoRes = await query(
          `SELECT organization_name, full_name, address, latitude, longitude FROM profiles WHERE id = $1`,
          [req.user!.id]
        );
      }
      const ngoProfile = ngoRes.rows[0] || {};
      const ngoName = ngoProfile.organization_name || ngoProfile.full_name || 'Community NGO';
      const ngoAddress = ngoProfile.address || 'Central Community Hub';
      const ngoLat = ngoProfile.latitude ? Number(ngoProfile.latitude) : 12.9620;
      const ngoLng = ngoProfile.longitude ? Number(ngoProfile.longitude) : 77.6145;

      // ATOMIC UPDATE: Only update if status is 'Available' and ngo_id is NULL
      const updateRes = await query(
        `UPDATE food_donations
         SET status = 'NGO Accepted',
             ngo_id = $1,
             ngo_name = $2,
             ngo_address = $3,
             ngo_latitude = $4,
             ngo_longitude = $5,
             updated_at = NOW()
         WHERE id = $6 AND status = 'Available' AND ngo_id IS NULL
         RETURNING *`,
        [req.user!.id, ngoName, ngoAddress, ngoLat, ngoLng, id]
      );

      if (updateRes.rows.length === 0) {
        res.status(409).json({
          error: 'This donation has already been accepted or is no longer available.',
        });
        return;
      }

      const donation = updateRes.rows[0];

      // Notify Donor
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
         VALUES ($1, $2, 'donor', $3, $4, $5)`,
        [
          `notif-${Date.now()}-donor`,
          donation.donor_id,
          'Donation Accepted by NGO!',
          `${ngoName} accepted your donation of ${donation.food_name}. Route matching is now open for volunteer couriers.`,
          id,
        ]
      );

      // Notify Volunteers
      const volRes = await query(`SELECT id FROM profiles WHERE role = 'volunteer'`);
      for (const vol of volRes.rows) {
        await query(
          `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
           VALUES ($1, $2, 'volunteer', $3, $4, $5)`,
          [
            `notif-${Date.now()}-${vol.id}`,
            vol.id,
            'New Nearby Pickup Task Available',
            `Pickup ready at ${donation.pickup_address} for delivery to ${ngoName}.`,
            id,
          ]
        );
      }

      res.json({
        success: true,
        message: 'Donation successfully accepted.',
        donation: formatDonation(donation),
      });
    } catch (err: any) {
      console.error('[Accept NGO Error]', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 5. POST /api/donations/:id/assign-volunteer (Volunteer accepts pickup)
router.post(
  '/:id/assign-volunteer',
  authenticateToken,
  requireRole(['volunteer']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Fetch Volunteer profile
      let volRes = await query(
        `SELECT full_name, phone, latitude, longitude, share_location FROM profiles WHERE id = $1`,
        [req.user!.id]
      );
      if (volRes.rows.length === 0) {
        await query(
          `INSERT INTO profiles (id, full_name, email, role, address, city, latitude, longitude, share_location)
           VALUES ($1, $2, $3, 'volunteer', 'Koramangala 4th Block, Bengaluru', 'Bengaluru', 12.9345, 77.6265, true)
           ON CONFLICT (id) DO NOTHING`,
          [req.user!.id, req.user!.fullName || 'Volunteer Courier', req.user!.email]
        );
        volRes = await query(
          `SELECT full_name, phone, latitude, longitude, share_location FROM profiles WHERE id = $1`,
          [req.user!.id]
        );
      }
      const volProfile = volRes.rows[0] || {};
      const volName = volProfile.full_name || req.user!.fullName || 'Volunteer Courier';
      const volPhone = volProfile.phone || '';
      const volLat = volProfile.latitude ? Number(volProfile.latitude) : 12.9345;
      const volLng = volProfile.longitude ? Number(volProfile.longitude) : 77.6265;
      const shareLoc = volProfile.share_location ?? true;

      // ATOMIC UPDATE: Only update if status is 'NGO Accepted' and volunteer_id is NULL
      const updateRes = await query(
        `UPDATE food_donations
         SET status = 'Volunteer Assigned',
             volunteer_id = $1,
             volunteer_name = $2,
             volunteer_phone = $3,
             volunteer_latitude = $4,
             volunteer_longitude = $5,
             volunteer_share_location = $6,
             updated_at = NOW()
         WHERE id = $7 AND status = 'NGO Accepted' AND volunteer_id IS NULL
         RETURNING *`,
        [req.user!.id, volName, volPhone, volLat, volLng, shareLoc, id]
      );

      if (updateRes.rows.length === 0) {
        res.status(409).json({
          error: 'This pickup task has already been accepted by another volunteer.',
        });
        return;
      }

      const donation = updateRes.rows[0];

      // Record in volunteer_assignments
      await query(
        `INSERT INTO volunteer_assignments (id, donation_id, volunteer_id, status, assigned_at)
         VALUES ($1, $2, $3, 'Assigned', NOW())`,
        [`asgn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, id, req.user!.id]
      );

      // Record in delivery_updates
      await query(
        `INSERT INTO delivery_updates (id, donation_id, volunteer_id, volunteer_name, status, remarks, latitude, longitude)
         VALUES ($1, $2, $3, $4, 'Volunteer Assigned', 'Courier accepted pickup route.', $5, $6)`,
        [`del-${Date.now()}`, id, req.user!.id, volName, volLat, volLng]
      );

      // Notify Donor
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
         VALUES ($1, $2, 'donor', $3, $4, $5)`,
        [
          `notif-${Date.now()}-vol-donor`,
          donation.donor_id,
          'Volunteer Courier Assigned',
          `${volName} accepted the pickup for ${donation.food_name} and is en route.`,
          id,
        ]
      );

      // Notify NGO
      if (donation.ngo_id) {
        await query(
          `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
           VALUES ($1, $2, 'ngo', $3, $4, $5)`,
          [
            `notif-${Date.now()}-vol-ngo`,
            donation.ngo_id,
            'Courier Assigned for Delivery',
            `${volName} is en route to collect ${donation.food_name} from ${donation.donor_name}.`,
            id,
          ]
        );
      }

      res.json({
        success: true,
        message: 'Pickup task assigned successfully.',
        donation: formatDonation(donation),
      });
    } catch (err: any) {
      console.error('[Assign Volunteer Error]', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 6. POST /api/donations/:id/pickup (Volunteer collects food)
router.post(
  '/:id/pickup',
  authenticateToken,
  requireRole(['volunteer']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const updateRes = await query(
        `UPDATE food_donations
         SET status = 'Pickup in Progress',
             updated_at = NOW()
         WHERE id = $1 AND volunteer_id = $2
         RETURNING *`,
        [id, req.user!.id]
      );

      if (updateRes.rows.length === 0) {
        res.status(403).json({ error: 'Only the assigned volunteer can mark food as picked up.' });
        return;
      }

      const donation = updateRes.rows[0];

      // Update volunteer assignments
      await query(
        `UPDATE volunteer_assignments
         SET status = 'In Transit', pickup_time = NOW()
         WHERE donation_id = $1 AND volunteer_id = $2`,
        [id, req.user!.id]
      );

      // Log delivery update
      await query(
        `INSERT INTO delivery_updates (id, donation_id, volunteer_id, volunteer_name, status, remarks)
         VALUES ($1, $2, $3, $4, 'Pickup in Progress', 'Food collected from donor. Heading to NGO center.')`,
        [`del-${Date.now()}`, id, req.user!.id, donation.volunteer_name]
      );

      // Notify Donor
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
         VALUES ($1, $2, 'donor', $3, $4, $5)`,
        [
          `notif-${Date.now()}-pk-donor`,
          donation.donor_id,
          'Food Picked Up by Courier',
          `${donation.volunteer_name} has collected ${donation.food_name} and is in transit.`,
          id,
        ]
      );

      // Notify NGO
      if (donation.ngo_id) {
        await query(
          `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
           VALUES ($1, $2, 'ngo', $3, $4, $5)`,
          [
            `notif-${Date.now()}-pk-ngo`,
            donation.ngo_id,
            'Food in Transit to Your Center',
            `${donation.volunteer_name} has collected ${donation.food_name} and is heading your way.`,
            id,
          ]
        );
      }

      res.json({
        success: true,
        message: 'Food marked as picked up and in transit.',
        donation: formatDonation(donation),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 7. POST /api/donations/:id/deliver (Volunteer marks delivered)
router.post(
  '/:id/deliver',
  authenticateToken,
  requireRole(['volunteer']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const deliveryRemarks = remarks || 'Delivered in good condition to NGO center staff.';

      const updateRes = await query(
        `UPDATE food_donations
         SET status = 'Delivered',
             delivery_remarks = $1,
             updated_at = NOW()
         WHERE id = $2 AND volunteer_id = $3
         RETURNING *`,
        [deliveryRemarks, id, req.user!.id]
      );

      if (updateRes.rows.length === 0) {
        res.status(403).json({ error: 'Only the assigned volunteer can mark delivery as completed.' });
        return;
      }

      const donation = updateRes.rows[0];

      await query(
        `UPDATE volunteer_assignments
         SET status = 'Delivered', delivery_time = NOW(), notes = $1
         WHERE donation_id = $2 AND volunteer_id = $3`,
        [deliveryRemarks, id, req.user!.id]
      );

      await query(
        `INSERT INTO delivery_updates (id, donation_id, volunteer_id, volunteer_name, status, remarks)
         VALUES ($1, $2, $3, $4, 'Delivered', $5)`,
        [`del-${Date.now()}`, id, req.user!.id, donation.volunteer_name, deliveryRemarks]
      );

      // Notify NGO
      if (donation.ngo_id) {
        await query(
          `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
           VALUES ($1, $2, 'ngo', $3, $4, $5)`,
          [
            `notif-${Date.now()}-del-ngo`,
            donation.ngo_id,
            'Donation Arrived at Center',
            `${donation.volunteer_name} has delivered ${donation.food_name}. Please inspect and confirm receipt.`,
            id,
          ]
        );
      }

      // Notify Donor
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
         VALUES ($1, $2, 'donor', $3, $4, $5)`,
        [
          `notif-${Date.now()}-del-donor`,
          donation.donor_id,
          'Donation Delivered to NGO!',
          `Your food donation of ${donation.food_name} has safely arrived at ${donation.ngo_name}.`,
          id,
        ]
      );

      res.json({
        success: true,
        message: 'Delivery recorded successfully.',
        donation: formatDonation(donation),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 8. POST /api/donations/:id/confirm-receipt (NGO confirms receipt & distributes)
router.post(
  '/:id/confirm-receipt',
  authenticateToken,
  requireRole(['ngo']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const updateRes = await query(
        `UPDATE food_donations
         SET status = 'Completed',
             updated_at = NOW()
         WHERE id = $1 AND ngo_id = $2
         RETURNING *`,
        [id, req.user!.id]
      );

      if (updateRes.rows.length === 0) {
        res.status(403).json({ error: 'Only the receiving NGO can confirm receipt.' });
        return;
      }

      const donation = updateRes.rows[0];

      // Notify Donor
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
         VALUES ($1, $2, 'donor', $3, $4, $5)`,
        [
          `notif-${Date.now()}-comp-donor`,
          donation.donor_id,
          'Rescue Complete! Meals Distributed',
          `${donation.ngo_name} confirmed receipt and distributed ${donation.food_name} (${donation.people_served} meals served). Thank you!`,
          id,
        ]
      );

      // Notify Volunteer
      if (donation.volunteer_id) {
        await query(
          `INSERT INTO notifications (id, user_id, role, title, message, donation_id)
           VALUES ($1, $2, 'volunteer', $3, $4, $5)`,
          [
            `notif-${Date.now()}-comp-vol`,
            donation.volunteer_id,
            'Delivery Confirmed! Impact Recorded',
            `${donation.ngo_name} confirmed successful handover of ${donation.food_name}. +${donation.people_served} impact points earned!`,
            id,
          ]
        );
      }

      res.json({
        success: true,
        message: 'Receipt confirmed and rescue completed.',
        donation: formatDonation(donation),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 9. POST /api/donations/:id/cancel (Donor cancels donation if still available)
router.post(
  '/:id/cancel',
  authenticateToken,
  requireRole(['donor']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const updateRes = await query(
        `UPDATE food_donations
         SET status = 'Cancelled',
             updated_at = NOW()
         WHERE id = $1 AND donor_id = $2 AND status = 'Available'
         RETURNING *`,
        [id, req.user!.id]
      );

      if (updateRes.rows.length === 0) {
        res.status(400).json({
          error: 'Only unaccepted donations can be cancelled by the donor.',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Donation successfully cancelled.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
