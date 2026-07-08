const fetch = require('node-fetch'); // wait, let's check if node-fetch is available, or use global fetch in Node 18+

async function run() {
  try {
    // Login as admin
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in successfully. Token length:", token.length);
    
    // Get pending startups
    const pendingRes = await fetch('http://localhost:5001/api/admin/startups/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const pendingData = await pendingRes.json();
    console.log("Pending startups count:", pendingData.length);
    if (pendingData.length === 0) {
      console.log("No pending startups seeded. Exiting.");
      return;
    }
    
    const startupId = pendingData[0]._id;
    console.log("Querying details for startup ID:", startupId);
    
    // Query details route
    const detailsRes = await fetch(`http://localhost:5001/api/admin/startups/${startupId}/details`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log("Response status:", detailsRes.status);
    const detailsData = await detailsRes.json();
    console.log("Response details:", JSON.stringify(detailsData, null, 2));
    
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

run();
