// models/ChatSession.ts
import {
  Schema,
  model,
  models,
  type Document,
  type Model,
} from "mongoose";
import { connectDB } from "@/lib/db";

export interface IChatSession extends Document {
  sessionKey: string; // cookie বা frontend থেকে আসা কোনো unique key
  userName?: string;
  phone?: string;
  source?: string; // "website" | "facebook" | "whatsapp" etc.
  aiDisabled?: boolean; // ⭐ নতুন ফিল্ড
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  aiPaused: boolean;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionKey: { type: String, required: true, index: true },
    userName: { type: String },
    phone: { type: String },
    source: { type: String, default: "website" },

    // ⭐ শুধুমাত্র এই একটি field থাকবে
    aiDisabled: {
      type: Boolean,
      default: false
    },

    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Session auto-delete 7 days
ChatSessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 }
);

const ChatSession: Model<IChatSession> =
  (models.ChatSession as Model<IChatSession>) ||
  model<IChatSession>("ChatSession", ChatSessionSchema);

export async function getChatSessionModel() {
  await connectDB();
  return ChatSession;
}

export default ChatSession;
