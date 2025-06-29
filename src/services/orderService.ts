import * as fs from "fs";
import * as path from "path";
import { Order, ReturnRequest, ReturnResponse } from "../types";

class OrderService {
  private orders: Order[] = [];
  private returnCounter = 1;

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    try {
      const ordersPath = path.join(__dirname, "../data/orders.json");
      const ordersData = fs.readFileSync(ordersPath, "utf-8");
      this.orders = JSON.parse(ordersData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      this.orders = [];
    }
  }

  public lookupOrder(orderId: string): Order | null {
    return this.orders.find((order) => order.orderId === orderId) || null;
  }

  public processReturn(returnRequest: ReturnRequest): ReturnResponse {
    const order = this.lookupOrder(returnRequest.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Only allow returns for delivered or shipped orders
    if (order.status === "processing") {
      return {
        success: false,
        rmaNumber: "",
        orderId: returnRequest.orderId,
        refundAmount: 0,
        status: "denied",
      };
    }

    const rmaNumber = `RMA-${String(this.returnCounter++).padStart(3, "0")}`;

    return {
      success: true,
      rmaNumber,
      orderId: returnRequest.orderId,
      refundAmount: order.total,
      status: "approved",
    };
  }

  public getAllOrders(): Order[] {
    return [...this.orders];
  }
}

export const orderService = new OrderService();
