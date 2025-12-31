// lib/pusher/client.ts
"use client";

import Pusher from "pusher-js";

let _client: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (_client) return _client;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  // ✅ Vercel build time এ env missing থাকলেও crash করবে না
  if (!key || !cluster) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Pusher disabled: Missing NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER");
    }
    return null;
  }

  Pusher.logToConsole = process.env.NODE_ENV === "development";
  _client = new Pusher(key, { cluster });

  return _client;
}

// ✅ backward compatible export (older code keeps working)
export const pusherClient = getPusherClient();
