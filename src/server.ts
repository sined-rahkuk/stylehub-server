import express from "express";
import cors from "cors";
import helmet from "helmet";
import { orderService } from "./services/orderService";
import { callAnalysisService } from "./services/callAnalysisService";
import { OrderLookupResponse, ReturnRequest, CallAnalysis } from "./types";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Add ngrok-skip-browser-warning header to all responses for external services
app.use((req, res, next) => {
  res.header("ngrok-skip-browser-warning", "true");
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  // List of endpoints to skip logging
  const skipLogging = ["/api/dashboard/calls", "/api/dashboard/stats"];

  // Optionally skip logging for OPTIONS preflight requests too
  if (skipLogging.includes(req.path) || req.method === "OPTIONS") {
    return next();
  }

  const timestamp = new Date().toISOString();
  const { method, url, headers, query, body } = req;

  // Log the incoming request
  console.log("\n🔵 INCOMING REQUEST:");
  console.log(`📅 Timestamp: ${timestamp}`);
  console.log(`🔍 Method: ${method}`);
  console.log(`🌐 URL: ${url}`);
  console.log(`📋 Headers:`, {
    "content-type": headers["content-type"],
    "user-agent": headers["user-agent"],
    "ngrok-skip-browser-warning": headers["ngrok-skip-browser-warning"],
    authorization: headers["authorization"] ? "***REDACTED***" : undefined,
    host: headers["host"],
    "x-forwarded-for": headers["x-forwarded-for"],
    "x-forwarded-proto": headers["x-forwarded-proto"],
  });
  console.log(`❓ Query:`, query);
  console.log(`📦 Body:`, body);

  // Capture response details
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`✅ Response Status: ${res.statusCode}`);
    console.log(
      `📤 Response Body:`,
      typeof data === "string" ? JSON.parse(data || "{}") : data
    );
    console.log("─".repeat(80));
    return originalSend.call(this, data);
  };

  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 11labs Server Tool: Lookup Order
app.get("/api/orders/:orderId", (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orderService.lookupOrder(orderId);

    if (!order) {
      const response: OrderLookupResponse = {
        success: false,
        error: "Order not found",
      };
      return res.status(404).json(response);
    }

    const response: OrderLookupResponse = {
      success: true,
      order,
    };

    res.json(response);
  } catch (error) {
    console.error("Error looking up order:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// 11labs Server Tool: Process Return
app.post("/api/returns", (req, res) => {
  try {
    const returnRequest: ReturnRequest = req.body;

    if (!returnRequest.orderId || !returnRequest.reason) {
      return res.status(400).json({
        success: false,
        error: "Order ID and reason are required",
      });
    }

    const returnResponse = orderService.processReturn(returnRequest);
    res.json(returnResponse);
  } catch (error) {
    console.error("Error processing return:", error);
    if (error instanceof Error && error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Webhook endpoint for n8n integration (post-call analysis from 11labs)
app.post("/webhook/call-analysis", (req, res) => {
  try {
    const {
      callType,
      success,
      orderId,
      rmaNumber,
      analysis,
      duration,
      source,
      timestamp,
    } = req.body;

    const callAnalysis = callAnalysisService.addCall({
      callType: callType || "general",
      success: success || false,
      orderId,
      rmaNumber,
      analysis: analysis || "No analysis available",
      duration,
      source: source || "elevenlabs", // Default to 'elevenlabs' if not provided
      timestamp, // Pass the timestamp from 11labs/n8n data
    });

    console.log("Call analysis recorded:", callAnalysis);
    res.json({
      success: true,
      message: "Call analysis recorded",
      id: callAnalysis.id,
    });
  } catch (error) {
    console.error("Error recording call analysis:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record call analysis",
    });
  }
});

// Dashboard API endpoints
app.get("/api/dashboard/calls", (req, res) => {
  try {
    const calls = callAnalysisService.getAllCalls();
    res.json(calls);
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch calls",
    });
  }
});

app.get("/api/dashboard/stats", (req, res) => {
  try {
    const stats = callAnalysisService.getCallStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    });
  }
});

// Get all orders (for testing)
app.get("/api/orders", (req, res) => {
  try {
    const orders = orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 StyleHub AI Agent Server running on port ${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/calls`);
  console.log(`🔍 Order lookup: http://localhost:${PORT}/api/orders/{orderId}`);
  console.log(`🔄 Returns API: http://localhost:${PORT}/api/returns`);
  console.log(`🎯 Webhook: http://localhost:${PORT}/webhook/call-analysis`);
});
