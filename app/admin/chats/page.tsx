"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetChatSessionsQuery,
  useGetChatDetailQuery,
} from "@/lib/adminApi";
import { getPusherClient } from "@/lib/pusher/client";

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("bn-BD", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// --- Type helper ---
type AdminChatSession = {
  _id: string;
  sessionKey: string;
  source?: string;
  lastMessageAt?: string;
  lastMessage?: {
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  } | null;
  messageCount: number;
  aiDisabled?: boolean;
};

type AdminChatMessage = {
  _id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  senderType?: "user" | "ai" | "admin";
};

type AdminChatDetail = {
  session: {
    _id: string;
    sessionKey: string;
    aiDisabled?: boolean;
  };
  messages: AdminChatMessage[];
};

export default function AdminChatsPage() {
  const {
    data: sessionsData,
    isLoading,
    error,
    refetch: refetchSessions,
  } = useGetChatSessionsQuery(undefined, {
    pollingInterval: 8000,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: chatDetailData,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useGetChatDetailQuery(selectedId as string, {
    skip: !selectedId,
    pollingInterval: 0,
    refetchOnMountOrArgChange: true,
  });

  const sessions = (sessionsData ?? []) as AdminChatSession[];
  const chatDetail = chatDetailData as AdminChatDetail | undefined;

  const [toggling, setToggling] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const aiDisabled = chatDetail?.session?.aiDisabled ?? false;

  const [liveMessages, setLiveMessages] = useState<AdminChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatDetail?.messages) return;
    setLiveMessages(chatDetail.messages);
  }, [chatDetail?.session?._id, chatDetail?.messages]);

  const selectedSession = useMemo(() => {
    if (!selectedId) return null;
    return sessions.find((s) => s._id === selectedId) ?? null;
  }, [selectedId, sessions]);

  const selectedSessionKey =
    selectedSession?.sessionKey ?? chatDetail?.session?.sessionKey ?? null;

  const scrollToBottom = () => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // ✅ Subscribe to Pusher for selected chat (SAFE)
  useEffect(() => {
    if (!selectedSessionKey) return;

    const pusher = getPusherClient();
    if (!pusher) {
      // env missing / build time → realtime off, but page will still work
      return;
    }

    const channelName = `chat-${selectedSessionKey}`;
    const channel = pusher.subscribe(channelName);

    const handler = (payload: {
      _id: string;
      role: "user" | "assistant" | "system";
      senderType?: "user" | "ai" | "admin";
      content: string;
      createdAt: string;
    }) => {
      const incoming: AdminChatMessage = {
        _id: payload._id,
        role: payload.role,
        senderType: payload.senderType,
        content: payload.content,
        createdAt: payload.createdAt,
      };

      setLiveMessages((prev) => {
        if (prev.some((m) => m._id === incoming._id)) return prev;
        return [...prev, incoming];
      });

      setTimeout(scrollToBottom, 50);
    };

    channel.bind("new-message", handler);

    return () => {
      channel.unbind("new-message", handler);
      pusher.unsubscribe(channelName);
    };
  }, [selectedSessionKey]);

  useEffect(() => {
    if (!selectedId) return;
    setTimeout(scrollToBottom, 50);
  }, [liveMessages.length, selectedId]);

  async function handleToggleAi() {
    if (!selectedId) return;
    try {
      setToggling(true);
      const res = await fetch(`/api/admin/chats/${selectedId}/toggle-ai`, {
        method: "POST",
      });
      if (!res.ok) {
        console.error("Toggle AI failed:", await res.text());
        alert("AI on/off করতে সমস্যা হয়েছে");
        return;
      }

      await refetchDetail();
      await refetchSessions();
    } catch (err) {
      console.error("Toggle AI error:", err);
      alert("AI on/off করতে সমস্যা হয়েছে");
    } finally {
      setToggling(false);
    }
  }

  async function handleSendReply() {
    if (!selectedId) return;
    if (!replyText.trim()) return;
    if (sendingReply) return;

    try {
      setSendingReply(true);
      const res = await fetch(`/api/admin/chats/${selectedId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() }),
      });

      if (!res.ok) {
        console.error("Admin reply failed:", await res.text());
        alert("মেসেজ পাঠাতে সমস্যা হয়েছে");
        return;
      }

      setReplyText("");
      await refetchDetail();
      await refetchSessions();
    } catch (err) {
      console.error("Admin reply error:", err);
      alert("মেসেজ পাঠাতে সমস্যা হয়েছে");
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl sm:text-2xl font-semibold">Admin – Chat History</h1>

      <p className="text-xs sm:text-sm text-slate-400">
        এখানে আপনার কাস্টমারদের সাথে হওয়া AI + Admin চ্যাটগুলো দেখতে পাবেন।
        পুরনো মেসেজগুলো ৭ দিন পরে অটো ডিলিট হয়ে যাবে।
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LEFT: sessions list */}
        <div className="md:col-span-1 border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>সেশন লিস্ট</span>
            <button
              onClick={() => refetchSessions()}
              className="text-[10px] text-slate-400 hover:text-slate-200"
            >
              Refresh
            </button>
          </div>

          {isLoading && <div className="p-3 text-xs text-slate-400">লোড হচ্ছে...</div>}
          {error && (
            <div className="p-3 text-xs text-red-400">সেশন লোড করতে সমস্যা হচ্ছে</div>
          )}

          {!isLoading && !error && (
            <ul className="max-h-[70vh] overflow-y-auto text-xs">
              {sessions.map((s) => (
                <li
                  key={s._id}
                  onClick={() => {
                    setSelectedId(s._id);
                    setReplyText("");
                  }}
                  className={`px-3 py-2 border-b border-slate-900 cursor-pointer hover:bg-slate-900/60 ${
                    selectedId === s._id ? "bg-slate-900/80" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-100">{s.source || "website"}</span>
                    <span className="text-[10px] text-slate-500">
                      {formatDateTime(s.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 line-clamp-2">
                    {s.lastMessage?.content || "কোনো মেসেজ নেই"}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>মোট মেসেজ: {s.messageCount}</span>
                    {s.aiDisabled && <span className="text-amber-400">AI Paused</span>}
                  </div>
                </li>
              ))}

              {sessions.length === 0 && (
                <li className="px-3 py-3 text-[11px] text-slate-400">
                  এখনো কোনো চ্যাট সেশন নেই।
                </li>
              )}
            </ul>
          )}
        </div>

        {/* RIGHT: messages view + reply box */}
        <div className="md:col-span-2 border border-slate-800 rounded-xl bg-slate-950/40 flex flex-col">
          <div className="px-3 py-2 border-b border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span>চ্যাট ডিটেইলস</span>
              {selectedSessionKey && (
                <span className="text-[10px] text-slate-500">
                  Session: {selectedSessionKey.slice(0, 8)}…
                </span>
              )}
            </div>

            {selectedId && (
              <div className="flex items-center gap-2">
                {chatDetail && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      aiDisabled
                        ? "border-amber-500 text-amber-300"
                        : "border-emerald-500 text-emerald-300"
                    }`}
                  >
                    {aiDisabled ? "Mode: Admin takeover" : "Mode: AI + Admin"}
                  </span>
                )}

                <button
                  onClick={handleToggleAi}
                  disabled={toggling}
                  className="text-[10px] rounded border border-slate-600 px-2 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                >
                  {toggling
                    ? "Updating..."
                    : aiDisabled
                    ? "Enable AI for this chat"
                    : "Pause AI for this chat"}
                </button>
              </div>
            )}
          </div>

          {!selectedId && (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              বাম দিক থেকে কোনো সেশন সিলেক্ট করুন।
            </div>
          )}

          {selectedId && detailLoading && (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              মেসেজ লোড হচ্ছে...
            </div>
          )}

          {selectedId && !detailLoading && (
            <>
              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                {liveMessages.map((m) => {
                  const isUser = m.role === "user";
                  const senderType = m.senderType || (isUser ? "user" : "ai");

                  const senderLabel =
                    senderType === "admin"
                      ? "Admin"
                      : senderType === "ai"
                      ? "AI Assistant"
                      : "Customer";

                  return (
                    <div key={m._id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-2xl text-[11px] ${
                          isUser
                            ? "bg-slate-900 text-slate-100 rounded-bl-sm"
                            : senderType === "admin"
                            ? "bg-amber-500 text-slate-900 rounded-br-sm"
                            : "bg-emerald-500 text-slate-900 rounded-br-sm"
                        }`}
                      >
                        <div className="text-[10px] mb-0.5 opacity-80">{senderLabel}</div>
                        <div className="whitespace-pre-line">{m.content}</div>
                        <div className="mt-1 text-[9px] opacity-70">
                          {formatDateTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {liveMessages.length === 0 && (
                  <div className="text-center text-[11px] text-slate-400 mt-4">
                    এই সেশনে কোনো মেসেজ নেই।
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="border-t border-slate-800 p-2 flex gap-2 items-center">
                <input
                  className="flex-1 bg-slate-900 text-slate-100 px-3 py-2 rounded-full text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
                  placeholder="Admin ভাবে উত্তর লিখুন..."
                />
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="text-[11px] px-3 py-2 rounded-full bg-amber-500 text-slate-900 font-semibold disabled:opacity-60"
                >
                  {sendingReply ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
