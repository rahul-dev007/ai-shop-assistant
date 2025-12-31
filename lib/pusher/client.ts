// lib/pusher/client.ts
import Pusher from "pusher-js";

let client: Pusher | null = null;

/**
 * Returns a singleton Pusher client on browser only.
 * If env is missing, returns null (so build never crashes).
 */
export function getPusherClient(): Pusher | null {
  // SSR/build time এ Pusher client init করবো না
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) return null;

  // dev এ লগ চাইলে only dev
  Pusher.logToConsole = process.env.NODE_ENV === "development";

  if (!client) {
    client = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
  }

  return client;
}
