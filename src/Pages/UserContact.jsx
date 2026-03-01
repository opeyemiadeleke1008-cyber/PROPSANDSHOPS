import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";
import {
  appendMessageToThread,
  ensureMessageThreadForUser,
  getMessageThreads,
  getUserSession,
  markThreadRead,
} from "../data/adminStore";

export default function UserContact() {
  const navigate = useNavigate();
  const sessionUser = getUserSession();
  const [threads, setThreads] = useState(getMessageThreads());
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!sessionUser?.email) {
      navigate("/signin", { replace: true });
      return;
    }
    ensureMessageThreadForUser(sessionUser);
    setThreads(getMessageThreads());
  }, [navigate, sessionUser]);

  useEffect(() => {
    const refresh = () => setThreads(getMessageThreads());
    window.addEventListener("storage", refresh);
    window.addEventListener("propsandshops-storage-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("propsandshops-storage-updated", refresh);
    };
  }, []);

  const thread = useMemo(
    () =>
      threads.find(
        (entry) => entry.userEmail?.toLowerCase() === sessionUser?.email?.toLowerCase(),
      ),
    [threads, sessionUser?.email],
  );

  useEffect(() => {
    if (thread?.id) {
      markThreadRead(thread.id, "user");
    }
  }, [thread?.id]);

  if (!sessionUser?.email) return null;

  const handleSend = () => {
    if (!thread || !draft.trim()) return;
    appendMessageToThread(thread.id, {
      sender: "user",
      text: draft.trim(),
    });
    setDraft("");
    setThreads(getMessageThreads());
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <UserHeader />
      <main className="mx-auto w-[92%] max-w-5xl pt-28 pb-10">
        <section className="rounded-[28px] border border-[#ddd3c6] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
          <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Messages
          </h1>
          <p className="mt-2 text-sm text-[#5d5a55]">
            Chat directly with the admin team about orders, products or support.
          </p>

          <div className="mt-6 rounded-2xl bg-[#f8f3ec] p-4">
            <div className="space-y-3">
              {(thread?.messages || []).length === 0 ? (
                <p className="text-sm text-[#766d63]">Start the conversation with your first message.</p>
              ) : (
                thread.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                      message.sender === "user"
                        ? "ml-auto bg-[#cf7858] text-white"
                        : "bg-white text-[#2f2d2a]"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`mt-2 text-[11px] ${message.sender === "user" ? "text-white/80" : "text-[#8d847a]"}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#e5dbd0] bg-white p-4">
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
                className="rounded-full bg-[#2f2d2a] px-4 py-2 text-sm font-semibold text-white"
              >
                Send Message
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
