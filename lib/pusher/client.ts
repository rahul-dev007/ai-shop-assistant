// lib/pusher/client.ts
import Pusher from "pusher-js";

if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
  throw new Error("Missing NEXT_PUBLIC_PUSHER_KEY");
}
if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  throw new Error("Missing NEXT_PUBLIC_PUSHER_CLUSTER");
}

// (Optional but recommended) keep noisy logs off in prod
Pusher.logToConsole = process.env.NODE_ENV === "development";

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});
