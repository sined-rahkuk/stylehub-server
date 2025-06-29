# 11labs Conversational AI Integration Guide

This guide walks you through setting up **11labs Conversational AI** for StyleHub customer support with order lookup and return processing capabilities.

## 📋 **Prerequisites**

- ✅ Backend server running (port 3000)
- ✅ ngrok tunnel active with auth token configured
- ✅ n8n workflow imported and active
- ✅ 11labs account with API access

## 🎯 **Integration Overview**

**11labs Conversational AI** → **Tools (webhooks)** → **Your Server APIs** → **n8n Processing** → **Dashboard Analytics**

## 🔧 **Step 1: Server & ngrok Setup**

### 1.1 Start Your Backend Server

```bash
cd iva_test
npm start
```

### 1.2 Start ngrok Tunnel

```bash
ngrok http 3000
```

Copy your ngrok URL (e.g., `https://abc123.ngrok-free.app`)

## 🤖 **Step 2: Create 11labs Agent**

### 2.1 Create New Agent

1. Go to [11labs Conversational AI Platform](https://elevenlabs.io/conversational-ai)
2. Click **"Create Agent"**
3. Set **Agent Name**: `StyleHub Support`
4. Choose a voice from the library

### 2.2 Configure Agent Prompt

In the **"Agent Configuration"** section, use this system prompt:

```
You are Alexis, a helpful customer support agent for StyleHub, an online fashion retailer.

CAPABILITIES:
- Look up order status using order ID
- Process return requests for eligible orders
- Provide helpful customer service

IMPORTANT GUIDELINES:
- Always be polite and professional
- Ask for order ID if customer mentions an order
- For returns, confirm order details before processing
- Only handle order status and return requests
- For other inquiries, politely redirect to general support

CONVERSATION FLOW:
1. Greet the customer warmly
2. Ask how you can help today
3. If they need order status: use lookupOrder tool
4. If they need a return: use processReturn tool
5. Provide clear, helpful responses
6. End with "Is there anything else I can help you with?"

Remember: You represent StyleHub's commitment to excellent customer service!
```

### 2.3 Configure First Message

Set the **First Message**:

```
Hi! I'm Alexis from StyleHub customer support. How can I help you today?
```

## 🛠️ **Step 3: Configure Tools**

### 3.1 Add Order Lookup Tool

1. Go to **"Tools"** section in your agent
2. Click **"Add Tool"**
3. Configure:
   - **Tool Name**: `lookupOrder`
   - **Description**: `Look up order status and details using order ID`
   - **URL**: `https://YOUR-NGROK-URL/api/orders/{orderId}`
   - **Method**: `GET`
   - **Parameters**:
     - Name: `orderId`
     - Type: `string`
     - Description: `The order ID to look up (e.g., 001, 002, 003)`
     - Required: `true`

### 3.2 Add Return Processing Tool

1. Click **"Add Tool"** again
2. Configure:
   - **Tool Name**: `processReturn`
   - **Description**: `Process a return request for an order`
   - **URL**: `https://YOUR-NGROK-URL/api/returns`
   - **Method**: `POST`
   - **Parameters**:
     - Name: `orderId`
     - Type: `string`
     - Description: `The order ID for the return request`
     - Required: `true`
     - Name: `reason`
     - Type: `string`
     - Description: `Reason for the return`
     - Required: `false`

## 📡 **Step 4: Configure Webhook**

### 4.1 Set Up 11labs Webhook

1. Go to **Settings** → **Webhooks**
2. Create a new webhook:
   - **URL**: `https://YOUR-N8N-URL/webhook/stylehub-elevenlabs`
   - **Events**: Select `post_call_transcription`
   - **Method**: `POST`

### 4.2 Enable Agent Webhook

1. In your agent settings, go to **"Webhooks"**
2. Enable the webhook you created
3. Select **"Post-call analysis"**

## 🔄 **Step 5: n8n Configuration**

### 5.1 Import Workflow

1. Open n8n
2. Import the `n8n-workflow.json` file
3. Update the webhook URL in the HTTP node to your backend:
   ```
   https://YOUR-NGROK-URL/webhook/call-analysis
   ```

### 5.2 Activate Workflow

1. Click the **toggle** to activate the workflow
2. Note the webhook URL from the **"11labs Webhook"** node
3. Use this URL in your 11labs webhook configuration

## 🎨 **Step 6: Voice & Language Settings**

### 6.1 Voice Selection

- Choose from 11labs' voice library
- Recommended: Professional, clear voices
- Test different voices to find the best fit

### 6.2 Language Settings

- Set to **English (US)**
- Configure speech speed and tone as needed

## 🧪 **Step 7: Testing**

### 7.1 Test Voice Conversation

1. Use the **"Test"** feature in 11labs
2. Try these scenarios:
   - "I need to check my order status for order 001"
   - "I want to return order 002"
   - "What's your return policy?" (should redirect)

### 7.2 Verify Data Flow

1. Check that calls appear in your dashboard
2. Verify analysis data is being processed
3. Confirm timestamps and call types are correct

## 🔐 **Step 8: Authentication & Security**

### 8.1 11labs API Security

- Store API keys securely in environment variables
- Use signed URLs for private agents
- Implement proper authentication for webhooks

### 8.2 Webhook Security

- Validate webhook signatures
- Use HTTPS endpoints only
- Implement rate limiting

## 📊 **Step 9: Monitoring & Analytics**

### 9.1 Dashboard Access

- Open `http://localhost:3001` for call analytics
- Monitor success rates and call types
- Review conversation summaries

### 9.2 11labs Console

- Monitor call usage and costs
- Review conversation logs
- Access detailed analytics

## 🚀 **Step 10: Going Live**

### 10.1 Production Deployment

- Deploy your backend to a cloud provider (Railway, Render, etc.)
- Update webhook URLs to production endpoints
- Configure domain and SSL certificates

### 10.2 Phone Integration

- Set up phone numbers through 11labs' telephony partners
- Configure inbound/outbound calling
- Test end-to-end phone integration

## 🆘 **Troubleshooting**

### Common Issues:

**Tool calls not working:**

- Check ngrok is running and accessible
- Verify tool URLs are correct
- Ensure your server returns proper JSON responses

**Webhook not receiving data:**

- Confirm n8n workflow is active
- Check webhook URL configuration
- Verify 11labs webhook is enabled

**Analysis not appearing in dashboard:**

- Check n8n processing code
- Verify backend webhook endpoint
- Review server logs for errors

**Voice quality issues:**

- Try different voices from 11labs library
- Adjust speech settings
- Check audio quality settings

## 📝 **11labs vs Other Platforms**

| Aspect           | Other Platforms              | 11labs                          |
| ---------------- | ---------------------------- | ------------------------------- |
| **Tool Config**  | Direct function calls        | Webhook-based tools             |
| **Webhook Data** | `items[0].json.body.message` | `data` (top level)              |
| **Analysis**     | `analysis.summary`           | `analysis.transcript_summary`   |
| **Success**      | `analysis.successEvaluation` | `analysis.call_successful`      |
| **Timestamps**   | `startedAt`                  | `metadata.start_time_unix_secs` |
| **Duration**     | `durationSeconds`            | `metadata.call_duration_secs`   |

## 🎉 **Success Checklist**

- [ ] 11labs agent created and configured
- [ ] Tools (lookupOrder, processReturn) working
- [ ] Webhooks configured and active
- [ ] n8n workflow processing data correctly
- [ ] Dashboard showing call analytics
- [ ] Test conversations successful
- [ ] Voice quality acceptable
- [ ] All integrations functional

## 🔗 **Resources**

- [11labs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai)
- [11labs Webhook Guide](https://elevenlabs.io/docs/product-guides/administration/webhooks)
- [11labs Tools Documentation](https://elevenlabs.io/docs/conversational-ai/customization/tools)
- [Pricing Information](https://elevenlabs.io/pricing)

---

**Support**: If you encounter issues, check the 11labs documentation or community forums for the latest updates and solutions.
