// models/ChatMessage.ts
import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  Types,
} from "mongoose";
import { connectDB } from "@/lib/db";

export interface IChatMessage extends Document {
  sessionId: Types.ObjectId; // ChatSession._id
  role: "user" | "assistant" | "system";
  content: string;
  senderType: "user" | "ai" | "admin"; // ⭐ নতুন ফিল্ড
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },

    // ⭐ এখানে senderType schema এর অংশ
    senderType: {
      type: String,
      enum: ["user", "ai", "admin"],
      default: "ai", // assistant হলে default AI ধরা হবে
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ⚠️ TTL index: message createdAt থেকে ৭ দিন পর auto delete
ChatMessageSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 }
);

const ChatMessage: Model<IChatMessage> =
  (models.ChatMessage as Model<IChatMessage>) ||
  model<IChatMessage>("ChatMessage", ChatMessageSchema);

export async function getChatMessageModel() {
  await connectDB();
  return ChatMessage;
}

export default ChatMessage;
