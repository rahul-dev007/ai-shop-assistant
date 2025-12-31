// lib/adminApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  _id: string;
  name_bn: string;
  name_en?: string;
  category: string;
  price: number;
  imageUrl?: string;
  stock?: number;
}

export interface Order {
  _id: string;
  productId: string | (Product & { _id: string }); // populate করলে object আসবে
  quantity: number;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  source?: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

// --------------------
// Chats (Admin)
// --------------------
export type SenderType = "user" | "ai" | "admin";

export interface ChatSessionSummary {
  _id: string;
  sessionKey: string;
  source?: string;
  createdAt: string;
  lastMessageAt?: string;
  aiDisabled?: boolean; // ⭐ AI on/off status
  messageCount: number;
  lastMessage?: {
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  } | null;
}

export interface ChatMessage {
  _id: string;
  role: "user" | "assistant" | "system";
  senderType?: SenderType; // ✅ add (admin page uses it)
  content: string;
  createdAt: string;
}

export interface ChatDetailResponse {
  session: {
    _id: string;
    sessionKey: string;
    source?: string;
    createdAt: string;
    lastMessageAt?: string;
    aiDisabled?: boolean; // ✅ add (backend sends it)
  };
  messages: ChatMessage[];
  pageInfo?: {
    limit: number;
    hasMore: boolean;
    before: string | null;
    oldestMessageAt: string | null;
    newestMessageAt: string | null;
  };
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin",
    credentials: "include",
  }),
  tagTypes: ["Products", "Orders", "Stats", "Chats"],
  endpoints: (builder) => ({
    // ----- Products -----
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      providesTags: ["Products"],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // ----- Orders -----
    getOrders: builder.query<Order[], { status?: string } | void>({
      query: (arg) => {
        if (!arg || !arg.status || arg.status === "all") {
          return "/orders";
        }
        return `/orders?status=${arg.status}`;
      },
      providesTags: ["Orders"],
    }),

    updateOrder: builder.mutation<Order, { id: string; data: Partial<Order> }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),

    // ----- Dashboard Stats -----
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),

    // ----- Chats -----
    getChatSessions: builder.query<ChatSessionSummary[], void>({
      query: () => "/chats",
      providesTags: ["Chats"],
    }),

    // ✅ allow optional limit/before later (pagination ready)
    getChatDetail: builder.query<
      ChatDetailResponse,
      { id: string; limit?: number; before?: string } | string
    >({
      query: (arg) => {
        if (typeof arg === "string") return `/chats/${arg}`;
        const params = new URLSearchParams();
        if (arg.limit) params.set("limit", String(arg.limit));
        if (arg.before) params.set("before", arg.before);
        const qs = params.toString();
        return `/chats/${arg.id}${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result, error, arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        return result ? [{ type: "Chats", id }] : ["Chats"];
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useGetDashboardStatsQuery,
  useGetChatSessionsQuery,
  useGetChatDetailQuery,
} = adminApi;
