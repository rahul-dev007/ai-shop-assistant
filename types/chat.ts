export type ChatIntent =
  | "CHAT"
  | "SHOW_PRODUCTS"
  | "ASK_ORDER_FORM"
  | "ADD_TO_CART"
  | "CONFIRM_ORDER";

export interface SelectedProduct {
  productId: string;
  quantity?: number;
  confidence?: number;
}

export interface ChatProductCard {
  productId: string;
  name_bn: string;
  price: number;
  imageUrl?: string | null;
}

export interface ChatAIResponse {
  reply_bn: string;
  intent: ChatIntent;
  selected_products?: SelectedProduct[];
  products?: ChatProductCard[];
}
