// Test script to simulate API calls and generate sample data for the dashboard
// Tests work with 11labs backend - source field set to 'test' for test data
const https = require("https");
const http = require("http");
const { URL } = require("url");

const SERVER_URL = "https://stylehub-server-lgna.onrender.com";

// Generate realistic timestamps (spread over the last 2 hours)
function generateTestTimestamps() {
  const now = new Date();
  return [
    new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    new Date(now.getTime() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
    new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  ];
}

// Test data for simulating calls
function getTestCalls() {
  const timestamps = generateTestTimestamps();

  return [
    {
      callType: "order_lookup",
      success: true,
      orderId: "001",
      analysis:
        "Customer successfully inquired about order 001. Agent located the Black Leather Jacket order and confirmed delivery on 2024-06-25 with tracking information provided.",
      duration: 45,
      source: "test",
      timestamp: timestamps[0],
    },
    {
      callType: "return_request",
      success: true,
      orderId: "001",
      rmaNumber: "RMA-001",
      analysis:
        "Customer requested return for order 001 due to size issue. Agent successfully processed return request and generated RMA-001 for $299.99 refund.",
      duration: 78,
      source: "test",
      timestamp: timestamps[1],
    },
    {
      callType: "order_lookup",
      success: true,
      orderId: "002",
      analysis:
        "Customer inquired about order 002 status. Agent confirmed Blue Sweater has shipped with tracking TRK123457 and provided estimated delivery date of 2024-06-28.",
      duration: 32,
      source: "test",
      timestamp: timestamps[2],
    },
    {
      callType: "general",
      success: false,
      analysis:
        "Customer asked about store hours which is outside agent's scope. Agent politely redirected customer to main customer service for general inquiries.",
      duration: 15,
      source: "test",
      timestamp: timestamps[3],
    },
    {
      callType: "order_lookup",
      success: true,
      orderId: "003",
      analysis:
        "Customer inquired about order 003. Agent confirmed Summer Dress is currently in processing stage and provided timeline of 1-2 business days for shipment.",
      duration: 38,
      source: "test",
      timestamp: timestamps[4],
    },
    {
      callType: "return_request",
      success: true,
      orderId: "002",
      rmaNumber: "RMA-002",
      analysis:
        "Customer reported receiving wrong color for order 002. Agent successfully processed return request and generated RMA-002 for $149.99 refund.",
      duration: 65,
      source: "test",
      timestamp: timestamps[5],
    },
    {
      callType: "order_lookup",
      success: false,
      orderId: "999",
      analysis:
        "Customer inquired about order 999 but agent could not locate order in system. Agent advised customer to verify order number as it may contain an error.",
      duration: 22,
      source: "test",
      timestamp: timestamps[6],
    },
    {
      callType: "general",
      success: false,
      analysis:
        "Customer asked about international shipping policies which is outside agent's scope. Agent redirected to main customer service for shipping policy questions.",
      duration: 18,
      source: "test",
      timestamp: timestamps[7],
    },
  ];
}

// Function to make HTTP/HTTPS requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Use https for https URLs, http for http URLs
    const requestModule = url.protocol === "https:" ? https : http;

    const req = requestModule.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testOrderLookup() {
  console.log("🔍 Testing Order Lookup API...");
  try {
    const response = await makeRequest("GET", "/api/orders/001");
    console.log("✅ Order lookup successful:", response.data);
  } catch (error) {
    console.error("❌ Order lookup failed:", error.message);
  }
}

async function testReturnRequest() {
  console.log("↩️ Testing Return Request API...");
  try {
    const response = await makeRequest("POST", "/api/returns", {
      orderId: "001",
      reason: "Wrong size",
    });
    console.log("✅ Return request successful:", response.data);
  } catch (error) {
    console.error("❌ Return request failed:", error.message);
  }
}

async function simulateCallAnalysis() {
  console.log("📞 Simulating call analysis data with realistic timestamps...");

  const testCalls = getTestCalls();

  for (const call of testCalls) {
    try {
      const response = await makeRequest(
        "POST",
        "/webhook/call-analysis",
        call
      );
      console.log(
        `✅ Call analysis recorded: ${call.callType} - ${
          call.success ? "Success" : "Failed"
        } (${call.timestamp})`
      );

      // Add delay between calls
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("❌ Call analysis failed:", error.message);
    }
  }
}

async function testDashboardAPI() {
  console.log("📊 Testing Dashboard APIs...");
  try {
    const statsResponse = await makeRequest("GET", "/api/dashboard/stats");
    console.log("✅ Dashboard stats:", statsResponse.data);

    const callsResponse = await makeRequest("GET", "/api/dashboard/calls");
    console.log(
      `✅ Dashboard calls: ${callsResponse.data.length} calls recorded`
    );
  } catch (error) {
    console.error("❌ Dashboard API failed:", error.message);
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting API Tests for StyleHub AI Agent\n");

  await testOrderLookup();
  console.log("");

  await testReturnRequest();
  console.log("");

  await simulateCallAnalysis();
  console.log("");

  await testDashboardAPI();

  console.log(
    "\n✨ All tests completed! Check your dashboard at http://localhost:3001"
  );
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, getTestCalls };
