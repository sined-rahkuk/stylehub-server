export interface Order {
  orderId: string;
  customerEmail: string;
  customerName: string;
  status: "processing" | "shipped" | "delivered";
  trackingNumber: string | null;
  item: string;
  total: number;
  orderDate: string;
  deliveryDate?: string;
  estimatedDelivery?: string;
}

export interface ReturnRequest {
  orderId: string;
  reason: string;
}

export interface ReturnResponse {
  success: boolean;
  rmaNumber: string;
  orderId: string;
  refundAmount: number;
  status: "approved" | "denied";
}

export interface OrderLookupResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export interface CallAnalysis {
  id: string;
  timestamp: string;
  callType: "order_lookup" | "return_request" | "general";
  success: boolean;
  orderId?: string;
  rmaNumber?: string;
  analysis: string; // 11labs analysis summary instead of individual messages
  duration?: number;
  source: "elevenlabs" | "test" | "manual";
}
