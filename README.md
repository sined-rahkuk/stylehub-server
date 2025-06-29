# StyleHub AI Agent - Customer Support Integration (11Labs)

This project integrates a conversational AI agent with server tools for StyleHub's customer support, handling order lookups and return requests with real-time data processing and dashboard visualization.

## 🏗️ Architecture

```
Incoming Call → 11labs Agent → Server Tools (APIs) → Order Database
                    ↓
            Post-call Webhook → n8n Workflow → Dashboard
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Test the APIs

**Order Lookup:**

```bash
curl http://localhost:3000/api/orders/001
```

**Process Return:**

```bash
curl -X POST http://localhost:3000/api/returns \
  -H "Content-Type: application/json" \
  -d '{"orderId": "001", "reason": "Wrong size"}'
```

**Dashboard Stats:**

```bash
curl http://localhost:3000/api/dashboard/stats
```

## 📞 11labs Integration

### Server Tools Configuration

Add these server tools to your 11labs agent:

**Tool 1: Order Lookup**

- **Name:** `lookupOrder`
- **URL:** `https://your-ngrok-url.app/api/orders/{orderId}`
- **Method:** `GET`
- **Parameters:** `orderId` (string)

**Tool 2: Process Return**

- **Name:** `processReturn`
- **URL:** `https://your-ngrok-url.app/api/returns`
- **Method:** `POST`
- **Body:** `{"orderId": "string", "reason": "string"}`

### Webhook Configuration

- **URL:** `https://your-ngrok-url.app/webhook/call-analysis`
- **Method:** `POST`
- **Trigger:** Post-call

## 🌐 Exposing with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Authenticate: `ngrok authtoken YOUR_TOKEN`
3. Expose the server: `ngrok http 3000`
4. Copy the public URL (e.g., `https://abc123.ngrok.io`)
5. Update 11labs server tools with the ngrok URL

## 📊 Available APIs

### Server Tools (for 11labs)

- `GET /api/orders/:orderId` - Lookup order details
- `POST /api/returns` - Process return request

### Dashboard APIs

- `GET /api/dashboard/calls` - Get all call records
- `GET /api/dashboard/stats` - Get call statistics

### Webhook

- `POST /webhook/call-analysis` - Receive post-call data from n8n

### Utility

- `GET /health` - Health check
- `GET /api/orders` - Get all orders (testing)

## 🧪 Test Data

Sample orders available for testing:

- Order 001: Black Leather Jacket (delivered)
- Order 002: Blue Sweater (shipped)
- Order 003: Summer Dress (processing)

## 🔄 n8n Workflow Setup

1. Create a new workflow in n8n
2. Add HTTP Request node triggered by webhook
3. Configure webhook URL: `https://your-ngrok-url.app/webhook/call-analysis`
4. Add data processing nodes for call analysis
5. Connect to dashboard API for logging

## 🎯 Example Call Scenarios

### Scenario 1: Order Status

**Customer:** "Can you check my order 001?"
**Expected Flow:** Agent → lookupOrder API → Response with delivery info

### Scenario 2: Return Request

**Customer:** "I need to return my jacket from order 001"
**Expected Flow:** Agent → processReturn API → RMA number provided

## 🛠️ Development

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## 📋 Next Steps

1. ✅ Server APIs running
2. 🔄 Set up ngrok tunnel
3. 🔄 Configure 11labs agent
4. 🔄 Create n8n workflow
5. 🔄 Build React dashboard
6. 🔄 Test end-to-end flow

## 🐛 Troubleshooting

- **11labs not calling APIs:** Check ngrok URL is accessible
- **Webhook not receiving data:** Verify n8n workflow webhook URL
- **Orders not loading:** Check `src/data/orders.json` file exists
- **TypeScript errors:** Run `npm run type-check`
