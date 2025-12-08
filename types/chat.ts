// types/chat.ts

export type SenderType = "user" | "ai" | "admin";

export interface Product {
  productId: string;
  name_bn: string;
  name_en?: string;
  category: string;
  price: number;
  tags?: string[];
  imageUrl?: string;
  description_bn?: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
}

export type ChatIntent =
  | "NONE"                // 👈 নতুন fallback intent (callGemini এর সাথে match)
  | "SMALL_TALK"
  | "ASK_PRODUCT_DETAILS"
  | "ASK_ORDER_FORM"
  | "CANCEL_ORDER"
  | "SHOW_PRODUCTS"
  | "UNKNOWN";

export interface ChatAIResponse {
  reply_bn: string;
  intent?: ChatIntent;    // AI intent আসতে-ও পারে, না-ও পারে → optional থাকা ঠিক আছে
  products?: Product[];
  selected_products?: {
    productId: string;
    quantity?: number;
  }[];
}

export interface Message {
  id: string;
  from: "user" | "bot";
  senderType: SenderType;
  text: string;
  aiMeta?: ChatAIResponse;
  createdAt: string;
}

export interface PendingOrder {
  productId: string;
  quantity?: number;
  productName?: string;
  price?: number;
}
