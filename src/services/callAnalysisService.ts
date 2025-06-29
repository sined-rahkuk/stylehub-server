import { CallAnalysis } from "../types";

class CallAnalysisService {
  private calls: CallAnalysis[] = [];

  public addCall(
    call: Omit<CallAnalysis, "id"> & { timestamp?: string }
  ): CallAnalysis {
    const newCall: CallAnalysis = {
      ...call,
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: call.timestamp || new Date().toISOString(), // Use provided timestamp or generate new one
      source: call.source || "elevenlabs", // Default to 'elevenlabs' if not specified
    };

    this.calls.push(newCall);
    return newCall;
  }

  public getAllCalls(): CallAnalysis[] {
    return [...this.calls].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getCallStats() {
    const total = this.calls.length;
    const successful = this.calls.filter((call) => call.success).length;
    const orderLookups = this.calls.filter(
      (call) => call.callType === "order_lookup"
    ).length;
    const returns = this.calls.filter(
      (call) => call.callType === "return_request"
    ).length;

    return {
      total,
      successful,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      orderLookups,
      returns,
      general: total - orderLookups - returns,
    };
  }
}

export const callAnalysisService = new CallAnalysisService();
