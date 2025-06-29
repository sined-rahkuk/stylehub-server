# Senior Software Engineer Dev Test Assignment

## AI Calling Agent Integration & Dashboard

**Important Notes:** 

- Pick what you’re best at, if your strength is Typescript, start with those parts (e.g. Server Tools or Dashboard) and create mock data. **If you can make it all, it’s great, but don’t be pressured to do so**.
- Please track your time, it is recommended to **spend ~4 hours on this**.
- It is expected to use AI coding assistants when working on this assignment.
- Feel free to reach out to me to assist you in anything, especially in case you get stuck. **I can provide you with a ~30min coding session for support.**
- **Please send me estimate date when you’d like to show your finished code.**
- For easy server setup, we recommend render.

### 🎯 **Objective**

Build an conversational AI agent for StyleHub's (fictional) customer support, integrated with server tools for real-time order lookups, an n8n integration and a simple web dashboard.

**Conversational AI Provider**: Use whatever provider you want.
Example providers are ElevenLabs or Vapi. 
ElevenLabs: Make free trial account or in case of bigger usage, use 1$ discounted package with more minutes.

### ⏱️ **Time Allocation: 3-4 hours**

---

## 📞 **StyleHub Shop After-Hours Support**

### **System Architecture Overview**

```
Incoming (Web) Call → ElevenLabs/Vapi Agent → Post-call Webhook → n8n/make.com Workflow → Your Integration Layer
                             ↓                                              
                      Real-time Response                              
                             ↓                                              
                      Server Tools (your APIs) → Order/Product Database

```

---

# 🛠️ What you’ll build

## **1. Conversational Agent (ElevenLabs/Vapi/..)**

- Configure agent with 2 server tools
- Handle the 2 conversation scenarios above
- Handle post call analysis with n8n

### **Scenario 1: Order Status**

- Customer asks: *"Can you check my order 001?"*
- Agent calls your `lookupOrder` API
- Agent responds with order details

### **Scenario 2: Return Request**

- Customer says: *"I need to return my jacket from order 001"*
- Agent calls your `processReturn` API
- Agent provides RMA number

## **📋 Sample Call Scenarios & Expected Outcomes**

### **Scenario 1: Order Status Inquiry**

```
Customer: "Hi, I placed an order last week and haven't received any updates. Can you check the status?"

Expected System Flow:
1. Agent extracts order number from conversation
2. Agent calls your "lookupOrder" server tool with extracted parameters
3. Your API returns order status, tracking info, and delivery date
4. Agent responds naturally: "I found your order 642. It shipped yesterday and will arrive soon!"
5. Post-call webhook sends conversation data to n8n for analysis

Success Criteria: ✅ Order ID extracted ✅ Server tool called ✅ Real data returned ✅ Natural response

```

### **Scenario 2: Return Request**

```
Customer: "I received a sweater yesterday but it's the wrong size. How can I return it?"

Expected System Flow:
1. Agent asks for order details and collects return reason
2. "processReturn" server tool validates return eligibility and generates RMA
3. Agent provides return instructions and authorization number
4. Post-call webhook triggers n8n workflow to email return label (can be mocked) and analysis

Success Criteria: ✅ Return validated ✅ RMA generated ✅ Instructions provided ✅ Workflow triggered

```

---

## **2. Server Tool APIs (Node.js + TypeScript)**

```tsx
// GET /api/orders/{orderId}
app.get('/api/orders/:orderId', (req, res) => {
  // Return order details from test data
});

// POST /api/returns
app.post('/api/returns', (req, res) => {
  // Process return request
});

```

## **3. Post-call Webhook + n8n Analysis**

Create a simple n8n/make.com workflow that:

- Receives webhook data from your API
- Categorizes call types (order_lookup, return_request)
- Analyses out if agent successfully did it’s job
- Logs analysis to a simple database/file

## **4.** Show call summary in a dashboard

Show the data in a simple React.js dashboard

- Show the data from analysis in the dashboard
    - List of calls
    - Call analysis details
- No login needed

---

## 📊 **Deliverables**

1. **Working ElevenLabs agent** that handles both scenarios
2. **2 API endpoints** that respond correctly
3. **n8n workflow** that processes and logs call analysis
4. **Dashboard** with call history
5. **Demo video** (3 minutes) showing the flow and your solution

---

## 🧪 **Test Data Provided**

[Sample Data](https://www.notion.so/Sample-Data-21ff39a7995181f692c2cba5348a3086?pvs=21)

Use the simplified test data provided:

- 3 sample orders (001, 002, 003)
- Simple API response formats

---

## 💡 **Success Tips**

- **Start simple**: Get one part working first (e.g. get order details endpoint)
- **Use test data**: Don't waste time creating realistic data
- **It doesn’t need to be perfect:** Get it working first, I don’t care about small issues.
- **Test frequently**: Make sure each piece works before moving on
- **Document briefly**: Explain your approach in README

---

## ❓ **Optional Extras** (If You Have Time)

- Enhanced call analysis (script improvements, tracking specific errors or scenarios)
- Error handling for invalid orders and API failures
- Additional conversation scenarios (urgent issues, complex returns)

**Focus on core functionality first - extras are bonus points only!**