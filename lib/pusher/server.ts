// lib/pusher/server.ts
import Pusher from "pusher";

if (!process.env.PUSHER_APP_ID) throw new Error("Missing PUSHER_APP_ID");
if (!process.env.PUSHER_KEY) throw new Error("Missing PUSHER_KEY");
if (!process.env.PUSHER_SECRET) throw new Error("Missing PUSHER_SECRET");
if (!process.env.PUSHER_CLUSTER) throw new Error("Missing PUSHER_CLUSTER");

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});
