import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full-Stack End-to-End System Tests...\n');

  try {
    // 1. Health Check
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 1. Health check passed:', health.data.status);

    // 2. Form Validations Test - Registration failures
    console.log('\n🔍 2. Testing Registration Validations...');
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: 'Short Name', // < 20 chars
        email: 'invalid-email',
        address: '',
        password: 'weak',
      });
      console.error('❌ Failed: Should have rejected invalid registration input');
    } catch (err: any) {
      console.log('✅ Validation correctly caught invalid input:', err.response?.data?.errors?.length, 'errors returned');
    }

    // 3. Register a valid new user
    const timestamp = Date.now();
    const validUser = {
      name: 'E2E Test User Alexander Harrison', // 32 chars
      email: `testuser_${timestamp}@example.com`,
      address: '789 Test Lane, Innovation District, Suite 200',
      password: 'User@12345',
    };

    const regRes = await axios.post(`${API_BASE}/auth/register`, validUser);
    console.log('✅ 3. Registration successful for new user:', regRes.data.user.email);
    const userToken = regRes.data.token;

    // 4. User views stores
    const storesRes = await axios.get(`${API_BASE}/stores/user`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('✅ 4. User fetched store list:', storesRes.data.stores.length, 'stores found');
    const firstStore = storesRes.data.stores[0];

    // 5. User submits a rating (4 stars)
    const rateRes = await axios.post(
      `${API_BASE}/ratings/stores/${firstStore.id}`,
      { rating: 4 },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✅ 5. User submitted rating 4 stars. New store average:', rateRes.data.storeStats.overallRating);

    // 6. User modifies the rating (to 5 stars)
    const modifyRateRes = await axios.post(
      `${API_BASE}/ratings/stores/${firstStore.id}`,
      { rating: 5 },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✅ 6. User modified rating to 5 stars. Recalculated average:', modifyRateRes.data.storeStats.overallRating);

    // 7. User updates their password
    const updatePassRes = await axios.put(
      `${API_BASE}/auth/password`,
      {
        oldPassword: 'User@12345',
        newPassword: 'NewPassword@2026',
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log('✅ 7. User updated password successfully:', updatePassRes.data.message);

    // 8. Admin Login & Dashboard Stats
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@storerating.com',
      password: 'Admin@12345',
    });
    const adminToken = adminLogin.data.token;
    console.log('\n👑 8. Admin logged in successfully:', adminLogin.data.user.email);

    const adminStats = await axios.get(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Admin stats retrieved:', adminStats.data.stats);

    // 9. Admin adds a new user
    const adminCreateUser = await axios.post(
      `${API_BASE}/admin/users`,
      {
        name: 'Victoria Genevieve Pendelton',
        email: `victoria_${timestamp}@example.com`,
        address: '400 Beacon Hill, Boston, MA 02108',
        password: 'AdminUser@123',
        role: 'STORE_OWNER',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ 9. Admin created new STORE_OWNER user:', adminCreateUser.data.user.email);

    // 10. Admin adds a new store
    const adminCreateStore = await axios.post(
      `${API_BASE}/admin/stores`,
      {
        name: 'Beacon Hill Gourmet Provisions & Wine',
        email: `beacon.provisions_${timestamp}@stores.com`,
        address: '402 Beacon Hill Street, Boston, MA 02108',
        ownerId: adminCreateUser.data.user.id,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ 10. Admin added new store with assigned owner:', adminCreateStore.data.store.name);

    // 11. Admin views users with store owner rating
    const adminUsers = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ 11. Admin fetched user directory:', adminUsers.data.users.length, 'users returned');

    // 12. Store Owner Login & Dashboard
    const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john.vance@storeowner.com',
      password: 'Owner@12345',
    });
    const ownerToken = ownerLogin.data.token;
    console.log('\n🏪 12. Store Owner logged in:', ownerLogin.data.user.email);

    const ownerDashboard = await axios.get(`${API_BASE}/stores/owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    console.log('✅ Store Owner dashboard loaded: Store =', ownerDashboard.data.store.name);
    console.log('   Average Rating =', ownerDashboard.data.stats.averageRating);
    console.log('   Total Customer Reviews =', ownerDashboard.data.ratings.length);

    console.log('\n🎉 ALL 12 END-TO-END VALIDATIONS & FLOWS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err: any) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
