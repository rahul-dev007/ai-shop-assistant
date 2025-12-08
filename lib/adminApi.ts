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
  productId:
  | string
  | (Product & { _id: string }); // populate করলে object আসবে
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
  };
  messages: ChatMessage[];
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

    updateProduct: builder.mutation<
      Product,
      { id: string; data: Partial<Product> }
    >({
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

    updateOrder: builder.mutation<
      Order,
      { id: string; data: Partial<Order> }
    >({
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
      // চাইলে later এখানে providesTags: ["Stats"] দিতে পারো
    }),

    // ⭐ নতুন: chat sessions list
    getChatSessions: builder.query<ChatSessionSummary[], void>({
      query: () => "/chats",
      providesTags: ["Chats"],
    }),

    // ⭐ নতুন: single chat details
    getChatDetail: builder.query<ChatDetailResponse, string>({
      query: (id) => `/chats/${id}`,
      providesTags: (result, error, id) =>
        result ? [{ type: "Chats", id }] : ["Chats"],
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
