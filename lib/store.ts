// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { adminApi } from "./adminApi";

export const store = configureStore({
  reducer: {
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware),
});

// টাইপ (TS এর জন্য)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
