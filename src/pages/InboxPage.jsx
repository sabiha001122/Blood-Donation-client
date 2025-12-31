import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/apiClient";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import { useAuth } from "../context/AuthContext";

function InboxPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const activeChat = useMemo(
    () => chats.find((c) => c._id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  const otherParticipant = useMemo(() => {
    if (!activeChat || !user) return null;
    return activeChat.participants?.find((p) => p._id !== user._id) || null;
  }, [activeChat, user]);

  const isPaused = useMemo(() => {
    if (!activeChat) return false;
    return (activeChat.pausedBy || []).length > 0;
  }, [activeChat]);

  const loadChats = async () => {
    setLoadingChats(true);
    setError("");
    try {
      const res = await api.get("/chats");
      setChats(res.data.data || []);
      const initialChatId = searchParams.get("chat");
      if (initialChatId) {
        setSelectedChatId(initialChatId);
      } else if ((res.data.data || []).length > 0) {
        setSelectedChatId(res.data.data[0]._id);
      }
    } catch (err) {
      setError("Could not load inbox.");
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId) => {
    if (!chatId) return;
    setLoadingMessages(true);
    setStatus("");
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data.data?.messages || []);
    } catch (err) {
      setStatus("Could not load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMessages(selectedChatId);
  }, [selectedChatId]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeChat) return;
    setStatus("");
    try {
      await api.post(`/chats/${activeChat._id}/messages`, { message: messageText.trim() });
      setMessageText("");
      await loadMessages(activeChat._id);
      await loadChats();
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not send message.");
    }
  };

  const handlePause = async () => {
    if (!activeChat) return;
    try {
      await api.post(`/chats/${activeChat._id}/pause`);
      await loadChats();
    } catch (err) {
      setStatus("Could not pause chat.");
    }
  };

  const handleResume = async () => {
    if (!activeChat) return;
    try {
      await api.post(`/chats/${activeChat._id}/unpause`);
      await loadChats();
    } catch (err) {
      setStatus("Could not resume chat.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Messages</p>
        <h1 className="text-3xl font-semibold text-slate-900">Inbox</h1>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Conversations</h2>
          {loadingChats ? (
            <p className="text-sm text-slate-600">Loading chats...</p>
          ) : chats.length === 0 ? (
            <p className="text-sm text-slate-600">No chats yet.</p>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const other =
                  chat.participants?.find((p) => p._id !== user?._id) || {};
                return (
                  <button
                    key={chat._id}
                    type="button"
                    onClick={() => setSelectedChatId(chat._id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      chat._id === selectedChatId
                        ? "border-red-300 bg-red-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {other.name || "User"} {other.email ? `(${other.email})` : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {chat.request?.bloodGroup || ""} · {chat.request?.city || "Unknown"} ·{" "}
                      {chat.request?.status || "open"}
                    </p>
                    {chat.lastMessage?.text ? (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {chat.lastMessage.text}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          {activeChat ? (
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {otherParticipant?.name || "Chat"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {activeChat.request?.bloodGroup || ""} · {activeChat.request?.city || ""} ·{" "}
                    {activeChat.request?.unitsNeeded || 0} unit(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isPaused ? (
                    <button
                      onClick={handleResume}
                      className="px-3 py-2 rounded-md text-sm border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Resume chat
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="px-3 py-2 rounded-md text-sm border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Pause chat
                    </button>
                  )}
                </div>
              </div>

              {isPaused ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                  This chat is paused. Resume to continue messaging.
                </p>
              ) : null}

              {loadingMessages ? (
                <p className="text-sm text-slate-600">Loading messages...</p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto border border-slate-100 rounded-lg p-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-slate-600">No messages yet.</p>
                  ) : (
                    messages.map((m) => {
                      const isMine = m.fromUser?._id === user?._id;
                      return (
                        <div
                          key={m._id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`p-3 rounded-lg text-sm max-w-[80%] ${
                              isMine
                                ? "bg-red-50 border border-red-100 text-right"
                                : "bg-slate-50 border border-slate-100"
                            }`}
                          >
                            <p className="font-semibold text-slate-800">
                              {isMine ? "You" : m.fromUser?.name || "User"}
                            </p>
                            <p className="text-slate-700">{m.message}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              <div className="mt-4 space-y-2">
                <Input
                  label="Message"
                  name="chatMessage"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write a message..."
                  disabled={isPaused}
                />
                <Button onClick={handleSend} disabled={!messageText.trim() || isPaused}>
                  Send message
                </Button>
                {status ? <p className="text-sm text-slate-600">{status}</p> : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600">Select a chat to view messages.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InboxPage;
