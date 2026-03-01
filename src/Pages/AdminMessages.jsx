import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../Layouts/AdminHeader";
import {
  appendMessageToThread,
  getAdminSession,
  getMessageThreads,
  getOrders,
  markThreadRead,
  updateThreadNotes,
} from "../data/adminStore";

export default function AdminMessages() {
  const navigate = useNavigate();
  const adminSession = getAdminSession();
  const [threads, setThreads] = useState(getMessageThreads());
  const [selectedThreadId, setSelectedThreadId] = useState(getMessageThreads()[0]?.id || "");
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!adminSession?.email) {
      navigate("/admin-signin", { replace: true });
    }
  }, [adminSession, navigate]);

  useEffect(() => {
    const refresh = () => setThreads(getMessageThreads());
    window.addEventListener("storage", refresh);
    window.addEventListener("propsandshops-storage-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("propsandshops-storage-updated", refresh);
    };
  }, []);

  const sortedThreads = useMemo(
    () =>
      [...threads].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [threads],
  );

  const selectedThread =
    sortedThreads.find((thread) => thread.id === selectedThreadId) || sortedThreads[0];

  useEffect(() => {
    if (!selectedThread && sortedThreads[0]) {
      setSelectedThreadId(sortedThreads[0].id);
      return;
    }
    if (!selectedThread) return;

    setNotes(selectedThread.notes || "");
    markThreadRead(selectedThread.id, "admin");
  }, [selectedThread, sortedThreads]);

  if (!adminSession?.email) return null;

  const handleSend = () => {
    if (!selectedThread || !draft.trim()) return;
    appendMessageToThread(selectedThread.id, {
      sender: "admin",
      text: draft.trim(),
    });
    setDraft("");
    setThreads(getMessageThreads());
  };

  const customerOrders = getOrders().filter(
    (order) => order.userEmail === selectedThread?.userEmail,
  );

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <AdminHeader />
      <main className="mx-auto w-[94%] max-w-7xl pt-28 pb-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.5fr_0.8fr]">
          <aside className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-5">
            <h1 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
              Messages
            </h1>
            <div className="mt-4 space-y-3">
              {sortedThreads.length === 0 ? (
                <p className="text-sm text-[#766d63]">No customer conversations yet.</p>
              ) : (
                sortedThreads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full rounded-2xl p-3 text-left transition ${
                      selectedThread?.id === thread.id
                        ? "bg-[#cf7858] text-white"
                        : "bg-white hover:bg-[#f1ebe2]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{thread.userName}</p>
                      <span className="text-xs">{thread.unreadByAdmin || 0}</span>
                    </div>
                    <p className="mt-1 text-xs">{thread.messages[thread.messages.length - 1]?.text || "No messages yet."}</p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-5">
            {selectedThread ? (
              <>
                <div className="border-b border-[#e5dbd0] pb-4">
                  <h2 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                    {selectedThread.userName}
                  </h2>
                  <p className="text-sm text-[#766d63]">{selectedThread.userEmail}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedThread.messages.map((message) => (
                    <article
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                        message.sender === "admin"
                          ? "ml-auto bg-[#cf7858] text-white"
                          : "bg-white text-[#2f2d2a]"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`mt-2 text-[11px] ${message.sender === "admin" ? "text-white/80" : "text-[#8d847a]"}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-[#e4d8ca] bg-white p-4">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full resize-none outline-none"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSend}
                      className="rounded-full bg-[#cf7858] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#766d63]">Select a conversation to start.</p>
            )}
          </section>

          <aside className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-5">
            <h2 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
              Customer Details
            </h2>
            {selectedThread ? (
              <>
                <div className="mt-4 rounded-2xl border border-[#e5dbd0] bg-white p-4">
                  <p className="font-semibold text-[#2f2d2a]">{selectedThread.userName}</p>
                  <p className="text-sm text-[#766d63]">{selectedThread.userEmail}</p>
                  <p className="mt-3 text-sm text-[#2f2d2a]">Total Orders: {customerOrders.length}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-[#e5dbd0] bg-white p-4">
                  <p className="font-semibold text-[#2f2d2a]">Internal Notes</p>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    onBlur={() => selectedThread && updateThreadNotes(selectedThread.id, notes)}
                    rows={6}
                    className="mt-3 w-full resize-none rounded-xl border border-[#e5dbd0] px-3 py-2 outline-none"
                  />
                </div>
              </>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
