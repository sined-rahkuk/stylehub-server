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

export interface CallStats {
  total: number;
  successful: number;
  successRate: number;
  orderLookups: number;
  returns: number;
  general: number;
}
