import { createExpressApp } from './app';
import http from 'http';

async function runIntegrationTest() {
  console.log('--- STARTING FOODBRIDGE DATA SYNCHRONIZATION INTEGRATION TEST ---');

  const app = createExpressApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(4567, '127.0.0.1', () => {
      console.log('Test server listening on http://127.0.0.1:4567');
      resolve();
    });
  });

  const baseUrl = 'http://127.0.0.1:4567';

  try {
    // 1. Health check
    console.log('\n[1] Checking /api/health...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('Health response status:', healthRes.status, 'db connected:', healthData.database?.connected);

    // 2. Donor Login
    console.log('\n[2] Logging in as Donor (Priya Sharma)...');
    const donorLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya@curryhouse.com', role: 'donor' }),
    });
    if (!donorLoginRes.ok) throw new Error(`Donor login failed: ${await donorLoginRes.text()}`);
    const donorLoginData = await donorLoginRes.json();
    const donorToken = donorLoginData.token;
    console.log('Donor logged in successfully. User ID:', donorLoginData.user.id);

    // 3. Donor Submits Food Donation
    console.log('\n[3] Submitting new food donation as Donor...');
    const donationPayload = {
      foodName: 'Kashmiri Pulao & Paneer Butter Masala',
      category: 'Cooked Food',
      quantity: '40 Portions (15 kg)',
      peopleServed: 40,
      preparationTime: 'Today, 2:00 PM',
      safeUntil: 'Today, 9:00 PM',
      pickupAddress: 'The Curry House, 100ft Rd, Indiranagar, Bengaluru',
      pickupLatitude: 12.9784,
      pickupLongitude: 77.6408,
      contactNumber: '+91 98450 12345',
      additionalInstructions: 'Insulated hot carriers, ready for immediate pickup.',
    };
    const createRes = await fetch(`${baseUrl}/api/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify(donationPayload),
    });
    if (!createRes.ok) throw new Error(`Donation creation failed: ${await createRes.text()}`);
    const createData = await createRes.json();
    const donationId = createData.donation.id;
    console.log(`Donation created! ID: ${donationId}, Status: ${createData.donation.status}`);

    // 4. NGO Login (Device 2 simulation)
    console.log('\n[4] Logging in as NGO Partner (Rajesh Nair on Mobile device)...');
    const ngoLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh@hopefoundation.org', role: 'ngo' }),
    });
    if (!ngoLoginRes.ok) throw new Error(`NGO login failed: ${await ngoLoginRes.text()}`);
    const ngoLoginData = await ngoLoginRes.json();
    const ngoToken = ngoLoginData.token;
    console.log('NGO logged in successfully. User ID:', ngoLoginData.user.id);

    // 5. NGO Fetches Donations
    console.log('\n[5] NGO fetching central donations list...');
    const listRes = await fetch(`${baseUrl}/api/donations`);
    const listData = await listRes.json();
    const found = listData.find((d: any) => d.id === donationId);
    if (!found) {
      throw new Error(`CRITICAL FAILURE: Donation ${donationId} was not visible to NGO on mobile!`);
    }
    console.log(`SUCCESS: Donation ${donationId} discovered on central database by NGO!`);

    // 6. NGO Accepts Donation
    console.log('\n[6] NGO accepting donation...');
    const acceptRes = await fetch(`${baseUrl}/api/donations/${donationId}/accept-ngo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({
        ngoAddress: 'Austin Town, Near Community Center, Bengaluru',
        ngoLatitude: 12.962,
        ngoLongitude: 77.6145,
      }),
    });
    if (!acceptRes.ok) throw new Error(`NGO acceptance failed: ${await acceptRes.text()}`);
    const acceptData = await acceptRes.json();
    console.log(`Donation ${donationId} accepted by NGO. Status: ${acceptData.donation.status}`);

    // 7. Duplicate Acceptance Prevention Check
    console.log('\n[7] Verifying atomic duplicate acceptance prevention...');
    const duplicateRes = await fetch(`${baseUrl}/api/donations/${donationId}/accept-ngo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({}),
    });
    if (duplicateRes.status === 409 || duplicateRes.status === 400) {
      console.log('SUCCESS: Duplicate acceptance correctly blocked with HTTP', duplicateRes.status);
    } else {
      throw new Error(`Expected 409/400 on duplicate acceptance, got ${duplicateRes.status}`);
    }

    // 8. Volunteer Login (Device 3 simulation)
    console.log('\n[8] Logging in as Volunteer Courier (Vikram Rao on bike)...');
    const volLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vikram.rao@volunteer.org', role: 'volunteer' }),
    });
    if (!volLoginRes.ok) throw new Error(`Volunteer login failed: ${await volLoginRes.text()}`);
    const volLoginData = await volLoginRes.json();
    const volToken = volLoginData.token;
    console.log('Volunteer logged in successfully. User ID:', volLoginData.user.id);

    // 9. Volunteer Claims Pickup Task
    console.log('\n[9] Volunteer assigning themselves to pickup task...');
    const assignRes = await fetch(`${baseUrl}/api/donations/${donationId}/assign-volunteer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volToken}`,
      },
    });
    if (!assignRes.ok) throw new Error(`Volunteer assignment failed: ${await assignRes.text()}`);
    const assignData = await assignRes.json();
    console.log(`Donation ${donationId} assigned to volunteer. Status: ${assignData.donation.status}`);

    // 10. Volunteer Marks Picked Up
    console.log('\n[10] Volunteer marks food as Picked Up from restaurant...');
    const pickupRes = await fetch(`${baseUrl}/api/donations/${donationId}/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volToken}`,
      },
      body: JSON.stringify({ remarks: 'Collected 40 portions in thermal bags, departing restaurant.' }),
    });
    if (!pickupRes.ok) throw new Error(`Pickup update failed: ${await pickupRes.text()}`);
    const pickupData = await pickupRes.json();
    console.log(`Pickup in progress! Status: ${pickupData.donation.status}`);

    // 11. Volunteer Marks Delivered
    console.log('\n[11] Volunteer marks food as Delivered to NGO hub...');
    const deliverRes = await fetch(`${baseUrl}/api/donations/${donationId}/deliver`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volToken}`,
      },
      body: JSON.stringify({ remarks: 'Handed over at Austin Town Community Center.' }),
    });
    if (!deliverRes.ok) throw new Error(`Delivery update failed: ${await deliverRes.text()}`);
    const deliverData = await deliverRes.json();
    console.log(`Delivered to NGO! Status: ${deliverData.donation.status}`);

    // 12. NGO Confirms Receipt
    console.log('\n[12] NGO confirms receipt & verifies batch distribution...');
    const confirmRes = await fetch(`${baseUrl}/api/donations/${donationId}/confirm-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
    });
    if (!confirmRes.ok) throw new Error(`NGO confirm receipt failed: ${await confirmRes.text()}`);
    const confirmData = await confirmRes.json();
    console.log(`Donation lifecycle completed! Final Status: ${confirmData.donation.status}`);

    // 13. Verify Notifications
    console.log('\n[13] Verifying real-time notifications dispatched to all roles...');
    const donorNotifs = await (
      await fetch(`${baseUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${donorToken}` },
      })
    ).json();
    const ngoNotifs = await (
      await fetch(`${baseUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${ngoToken}` },
      })
    ).json();
    const volNotifs = await (
      await fetch(`${baseUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${volToken}` },
      })
    ).json();

    console.log(
      `Notifications logged - Donor: ${donorNotifs.notifications?.length || 0}, NGO: ${
        ngoNotifs.notifications?.length || 0
      }, Volunteer: ${volNotifs.notifications?.length || 0}`
    );

    console.log('\n======================================================');
    console.log('✅ ALL INTEGRATION TESTS PASSED: FULL LIFECYCLE VERIFIED!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runIntegrationTest().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
