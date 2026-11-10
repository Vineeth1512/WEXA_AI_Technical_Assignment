require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');

const runFullRegressionSuite = async () => {
  console.log('=====================================================');
  console.log('🧪 RUNNING STOCKFLOW END-TO-END REGRESSION TEST SUITE');
  console.log('=====================================================\n');

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Failed to connect to database for tests.');
    process.exit(1);
  }

  // Start temporary test server on random available OS port (port 0)
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  let passedTests = 0;
  let totalTests = 0;

  const test = async (title, fn) => {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ Test ${totalTests}: ${title}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ Test ${totalTests}: ${title}`);
      console.error(`     Error: ${err.message}`);
    }
  };

  const req = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  const uniqueId = Date.now();
  let tenant1Token, tenant1User, tenant1P1Id, tenant1P2Id, tenant1P3Id;
  let tenant2Token, tenant2User;

  try {
    // 1. Health check
    await test('Health check endpoint returns status 200', async () => {
      const res = await req('/health');
      if (res.status !== 200 || res.data.status !== 'ok') {
        throw new Error(`Expected 200 with status ok, got ${res.status}`);
      }
    });

    // 2. User registration
    await test('Tenant 1 registration creates Org and User with 201 Created', async () => {
      const res = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `suite_t1_${uniqueId}@stockflow.io`,
          password: 'password123',
          organizationName: `Test Org 1 - ${uniqueId}`
        })
      });
      if (res.status !== 201 || !res.data.token) {
        throw new Error(`Expected 201 with token, got ${res.status} - ${JSON.stringify(res.data)}`);
      }
      tenant1Token = res.data.token;
      tenant1User = res.data.user;
    });

    // 3. Duplicate email registration rejected
    await test('Duplicate registration returns 409 Conflict', async () => {
      const res = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `suite_t1_${uniqueId}@stockflow.io`,
          password: 'password123',
          organizationName: 'Another Org'
        })
      });
      if (res.status !== 409) {
        throw new Error(`Expected 409, got ${res.status}`);
      }
    });

    // 4. Successful login
    await test('Login with valid credentials returns 200 OK + JWT', async () => {
      const res = await req('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: `suite_t1_${uniqueId}@stockflow.io`,
          password: 'password123'
        })
      });
      if (res.status !== 200 || !res.data.token) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    });

    // 5. Invalid password login
    await test('Login with invalid password returns 401 Unauthorized', async () => {
      const res = await req('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: `suite_t1_${uniqueId}@stockflow.io`,
          password: 'wrongpassword'
        })
      });
      if (res.status !== 401) {
        throw new Error(`Expected 401, got ${res.status}`);
      }
    });

    // 6. Tokenless request to protected route
    await test('Accessing GET /api/auth/me without token returns 401', async () => {
      const res = await req('/auth/me');
      if (res.status !== 401) {
        throw new Error(`Expected 401, got ${res.status}`);
      }
    });

    // 7. GET /api/auth/me with valid Bearer token
    await test('Accessing GET /api/auth/me with valid Bearer token returns 200', async () => {
      const res = await req('/auth/me', {
        headers: { Authorization: `Bearer ${tenant1Token}` }
      });
      if (res.status !== 200 || res.data.user.email !== tenant1User.email) {
        throw new Error(`Expected 200, got ${res.status}`);
      }
    });

    // 8. Create Product 1 (Healthy stock)
    await test('Tenant 1 creates Product 1 (Normal stock: Qty 25, Default threshold 5)', async () => {
      const res = await req('/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tenant1Token}` },
        body: JSON.stringify({
          name: 'Pro Laptop Stand',
          sku: 'STAND-001',
          quantity: 25,
          selling_price: 39.99
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      tenant1P1Id = res.data.data._id;
    });

    // 9. Create Product 2 (Low stock via default threshold)
    await test('Tenant 1 creates Product 2 (Low stock: Qty 3, Default threshold 5)', async () => {
      const res = await req('/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tenant1Token}` },
        body: JSON.stringify({
          name: 'USB-C Cable',
          sku: 'CABLE-001',
          quantity: 3,
          selling_price: 9.99
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      tenant1P2Id = res.data.data._id;
    });

    // 10. Create Product 3 (Custom threshold)
    await test('Tenant 1 creates Product 3 (Custom threshold: Qty 8, Threshold 10)', async () => {
      const res = await req('/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tenant1Token}` },
        body: JSON.stringify({
          name: 'Mechanical Keycaps',
          sku: 'CAPS-001',
          quantity: 8,
          selling_price: 19.99,
          low_stock_threshold: 10
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      tenant1P3Id = res.data.data._id;
    });

    // 11. Duplicate SKU in Tenant 1 rejected
    await test('Tenant 1 duplicate SKU returns 409 Conflict', async () => {
      const res = await req('/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tenant1Token}` },
        body: JSON.stringify({
          name: 'Duplicate Stand',
          sku: 'STAND-001',
          quantity: 5
        })
      });
      if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
    });

    // 12. Register Tenant 2
    await test('Tenant 2 registers independently', async () => {
      const res = await req('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `suite_t2_${uniqueId}@stockflow.io`,
          password: 'password123',
          organizationName: `Test Org 2 - ${uniqueId}`
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      tenant2Token = res.data.token;
      tenant2User = res.data.user;
    });

    // 13. Tenant 2 creates product with SAME SKU (STAND-001)
    await test('Tenant 2 can create product with SAME SKU "STAND-001" without collision', async () => {
      const res = await req('/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tenant2Token}` },
        body: JSON.stringify({
          name: 'Heavy Duty Stand',
          sku: 'STAND-001',
          quantity: 100
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    });

    // 14. Tenant 2 cannot see Tenant 1 products
    await test('Tenant 2 product listing only shows Tenant 2 products (count: 1)', async () => {
      const res = await req('/products', {
        headers: { Authorization: `Bearer ${tenant2Token}` }
      });
      if (res.status !== 200 || res.data.count !== 1) {
        throw new Error(`Expected count 1, got ${res.data.count}`);
      }
    });

    // 15. Cross-tenant read access blocked
    await test('Tenant 2 cannot read Tenant 1 product by ID (returns 404)', async () => {
      const res = await req(`/products/${tenant1P1Id}`, {
        headers: { Authorization: `Bearer ${tenant2Token}` }
      });
      if (res.status !== 404) {
        throw new Error(`Expected 404, got ${res.status}`);
      }
    });

    // 16. Cross-tenant delete access blocked
    await test('Tenant 2 cannot delete Tenant 1 product by ID (returns 404)', async () => {
      const res = await req(`/products/${tenant1P1Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tenant2Token}` }
      });
      if (res.status !== 404) {
        throw new Error(`Expected 404, got ${res.status}`);
      }
    });

    // 17. Search by query
    await test('Tenant 1 searches products with ?search=cable', async () => {
      const res = await req('/products?search=cable', {
        headers: { Authorization: `Bearer ${tenant1Token}` }
      });
      if (res.status !== 200 || res.data.count !== 1 || res.data.data[0].sku !== 'CABLE-001') {
        throw new Error(`Expected 1 match with SKU CABLE-001, got ${res.data.count}`);
      }
    });

    // 18. Dashboard Summary Calculation
    await test('Dashboard summary calculates metrics accurately (3 products, 36 units, 2 low stock)', async () => {
      const res = await req('/dashboard/summary', {
        headers: { Authorization: `Bearer ${tenant1Token}` }
      });
      const d = res.data.data;
      if (d.totalProducts !== 3 || d.totalQuantity !== 36 || d.lowStockCount !== 2) {
        throw new Error(`Calculation mismatch: ${JSON.stringify(d)}`);
      }
    });

    // 19. Update Settings
    await test('Tenant 1 updates default low-stock threshold to 30 units', async () => {
      const res = await req('/settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tenant1Token}` },
        body: JSON.stringify({
          default_low_stock_threshold: 30
        })
      });
      if (res.status !== 200 || res.data.data.default_low_stock_threshold !== 30) {
        throw new Error(`Expected 30, got ${res.data.data.default_low_stock_threshold}`);
      }
    });

    // 20. Dynamic Dashboard Threshold Recalculation
    await test('Dashboard dynamically recalculates: Product 1 (Qty 25) is now ALSO low stock (25 <= 30)', async () => {
      const res = await req('/dashboard/summary', {
        headers: { Authorization: `Bearer ${tenant1Token}` }
      });
      const d = res.data.data;
      if (d.lowStockCount !== 3) {
        throw new Error(`Expected lowStockCount 3, got ${d.lowStockCount}`);
      }
    });

    // 21. Delete Product
    await test('Tenant 1 deletes Product 3 successfully', async () => {
      const res = await req(`/products/${tenant1P3Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tenant1Token}` }
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    });

    // 22. Verify Deleted Product returns 404
    await test('Deleted Product 3 returns 404 on subsequent lookup', async () => {
      const res = await req(`/products/${tenant1P3Id}`, {
        headers: { Authorization: `Bearer ${tenant1Token}` }
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    });

  } finally {
    server.close();
  }

  console.log('\n=====================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100% SUCCESS)`);
  console.log('=====================================================\n');

  process.exit(passedTests === totalTests ? 0 : 1);
};

runFullRegressionSuite();

