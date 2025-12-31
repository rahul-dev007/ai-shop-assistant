// lib/pusher/server.ts
import Pusher from "pusher";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster =
  process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!appId) throw new Error("Missing PUSHER_APP_ID");
if (!key) throw new Error("Missing PUSHER_KEY");
if (!secret) throw new Error("Missing PUSHER_SECRET");
if (!cluster) throw new Error("Missing PUSHER_CLUSTER");

export const pusherServer = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
});
