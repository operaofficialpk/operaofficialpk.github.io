import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // Reply modal
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(
        collection(db, "contactMessages")
      );

      const messageList = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort((a, b) => {
          const getTime = (value) => {
            if (!value) return 0;

            if (value?.toMillis) {
              return value.toMillis();
            }

            if (value?.seconds) {
              return value.seconds * 1000;
            }

            const parsed = new Date(value).getTime();

            return Number.isNaN(parsed) ? 0 : parsed;
          };

          return getTime(b.createdAt) - getTime(a.createdAt);
        });

      setMessages(messageList);
    } catch (err) {
      console.error("Error fetching contact messages:", err);

      setError(
        "Messages load nahi ho rahe. Firebase Firestore permissions check karein."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const newMessages = useMemo(
    () =>
      messages.filter(
        (message) => (message.status || "New") === "New"
      ),
    [messages]
  );

  const readMessages =
    messages.length - newMessages.length;

  const formatDate = (value) => {
    if (!value) return "Date not available";

    let date;

    if (value?.toDate) {
      date = value.toDate();
    } else if (value?.seconds) {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ============================================================
  // MARK AS READ
  // ============================================================

  const markAsRead = async (id) => {
    setActionLoading(`read-${id}`);

    try {
      await updateDoc(
        doc(db, "contactMessages", id),
        {
          status: "Read",
        }
      );

      setMessages((current) =>
        current.map((message) =>
          message.id === id
            ? {
                ...message,
                status: "Read",
              }
            : message
        )
      );
    } catch (err) {
      console.error(
        "Error marking message as read:",
        err
      );

      alert("Message read mark nahi ho saka.");
    } finally {
      setActionLoading("");
    }
  };

  // ============================================================
  // DELETE MESSAGE
  // ============================================================

  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Kya aap ye message permanently delete karna chahte hain?"
    );

    if (!confirmed) return;

    setActionLoading(`delete-${id}`);

    try {
      await deleteDoc(
        doc(db, "contactMessages", id)
      );

      setMessages((current) =>
        current.filter(
          (message) => message.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Error deleting contact message:",
        err
      );

      alert("Message delete nahi ho saka.");
    } finally {
      setActionLoading("");
    }
  };

  // ============================================================
  // OPEN REPLY BOX
  // ============================================================

  const openReply = (message) => {
    if (!message.email) {
      alert(
        "Customer ki email available nahi hai."
      );
      return;
    }

    setReplyMessage(message);
    setReplyText("");
    setReplyOpen(true);
  };

  // ============================================================
  // CLOSE REPLY BOX
  // ============================================================

  const closeReply = () => {
    if (replySending) return;

    setReplyOpen(false);
    setReplyMessage(null);
    setReplyText("");
  };

  // ============================================================
  // SEND REPLY
  // ============================================================

  const sendReply = async () => {
    if (!replyMessage?.email) {
      alert(
        "Customer ki email available nahi hai."
      );
      return;
    }

    if (!replyText.trim()) {
      alert("Please apna reply likhein.");
      return;
    }

    setReplySending(true);

    try {
      const subject =
        "Re: Contact Us Message - Opera Official";

      const body = `Dear ${
        replyMessage.name || "Customer"
      },

${replyText.trim()}

Best regards,
Opera Jewellery & Perfumes
Opera Official PK
WhatsApp: +92 317 3355420
Email: support@operaofficialpk.com`;

      const mailtoLink =
        `mailto:${replyMessage.email}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      // Mark message as read
      try {
        await updateDoc(
          doc(
            db,
            "contactMessages",
            replyMessage.id
          ),
          {
            status: "Read",
          }
        );

        setMessages((current) =>
          current.map((message) =>
            message.id === replyMessage.id
              ? {
                  ...message,
                  status: "Read",
                }
              : message
          )
        );
      } catch (firebaseError) {
        console.error(
          "Could not mark message as read:",
          firebaseError
        );
      }

      // Open email client
      window.location.href = mailtoLink;

      // Close reply box
      setReplyOpen(false);
      setReplyMessage(null);
      setReplyText("");
    } catch (err) {
      console.error(
        "Error preparing reply:",
        err
      );

      alert(
        "Reply prepare nahi ho saka. Please dobara try karein."
      );
    } finally {
      setReplySending(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Customer Messages
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Contact Us form se received customer
              messages.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMessages}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh Messages"}
          </button>
        </div>

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Total Messages
            </p>

            <p className="text-2xl font-black text-slate-900 mt-2">
              {messages.length}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-amber-600">
              New Messages
            </p>

            <p className="text-2xl font-black text-slate-900 mt-2">
              {newMessages.length}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
              Read Messages
            </p>

            <p className="text-2xl font-black text-slate-900 mt-2">
              {readMessages}
            </p>
          </div>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />

              <p className="text-xs font-semibold text-slate-500 mt-4">
                Loading messages...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* ====================================================
             EMPTY
          ==================================================== */

          <div className="border-2 border-dashed border-slate-200 rounded-2xl py-20 px-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
              ✉
            </div>

            <h3 className="text-sm font-black text-slate-900 mt-5">
              No Messages Found
            </h3>

            <p className="text-xs text-slate-400 mt-2">
              Abhi Contact Us form se koi message
              receive nahi hua.
            </p>
          </div>
        ) : (
          /* ====================================================
             MESSAGES
          ==================================================== */

          <div className="space-y-4">
            {messages.map((message) => {
              const isNew =
                (message.status || "New") ===
                "New";

              return (
                <div
                  key={message.id}
                  className={`border rounded-2xl p-5 transition ${
                    isNew
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* CUSTOMER HEADER */}

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">
                          {message.name ||
                            "Unknown Customer"}
                        </h4>

                        <span
                          className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                            isNew
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isNew
                            ? "New"
                            : "Read"}
                        </span>
                      </div>

                      {/* EMAIL */}

                      <a
                        href={`mailto:${
                          message.email || ""
                        }`}
                        className="inline-block text-xs text-slate-500 hover:text-slate-900 mt-1"
                      >
                        {message.email ||
                          "No email provided"}
                      </a>

                      <p className="text-[10px] text-slate-400 mt-2">
                        {formatDate(
                          message.createdAt
                        )}
                      </p>
                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* REPLY */}

                      <button
                        type="button"
                        onClick={() =>
                          openReply(message)
                        }
                        disabled={!message.email}
                        className="px-3 py-2 bg-[#C5A059] text-white rounded-lg text-[10px] font-bold hover:bg-[#b18d49] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Reply
                      </button>

                      {/* MARK READ */}

                      {isNew && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              message.id
                            )
                          }
                          disabled={
                            actionLoading ===
                            `read-${message.id}`
                          }
                          className="px-3 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition disabled:opacity-50"
                        >
                          {actionLoading ===
                          `read-${message.id}`
                            ? "Saving..."
                            : "Mark Read"}
                        </button>
                      )}

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          deleteMessage(
                            message.id
                          )
                        }
                        disabled={
                          actionLoading ===
                          `delete-${message.id}`
                        }
                        className="px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition disabled:opacity-50"
                      >
                        {actionLoading ===
                        `delete-${message.id}`
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* ORIGINAL MESSAGE */}

                  <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                      Customer Message
                    </p>

                    <p className="text-sm text-slate-700 leading-6 whitespace-pre-wrap break-words">
                      {message.message ||
                        "No message content."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          REPLY MODAL
      ======================================================== */}

      {replyOpen && replyMessage && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                  Customer Reply
                </p>

                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Reply to Customer
                </h3>
              </div>

              <button
                type="button"
                onClick={closeReply}
                disabled={replySending}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition flex items-center justify-center text-lg disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-6 space-y-5">
              {/* CUSTOMER */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Customer
                  </label>

                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                    {replyMessage.name ||
                      "Unknown Customer"}
                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Email
                  </label>

                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 break-all">
                    {replyMessage.email}
                  </div>
                </div>
              </div>

              {/* ORIGINAL MESSAGE */}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Customer Message
                </label>

                <div className="px-4 py-4 bg-[#FDFBF7] border border-[#C5A059]/20 rounded-xl text-sm text-slate-700 leading-6 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {replyMessage.message ||
                    "No message content."}
                </div>
              </div>

              {/* SUBJECT */}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  value="Re: Contact Us Message - Opera Official"
                  readOnly
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none"
                />
              </div>

              {/* REPLY */}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Your Reply
                </label>

                <textarea
                  value={replyText}
                  onChange={(e) =>
                    setReplyText(e.target.value)
                  }
                  rows="7"
                  placeholder="Type your reply to the customer..."
                  disabled={replySending}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 resize-none transition"
                />
              </div>

              {/* INFO */}

              <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-[11px] text-blue-700 leading-5">
                  Send Reply par click karne ke baad aapke
                  computer ka default email application
                  customer ki email ke saath open hoga.
                </p>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={closeReply}
                disabled={replySending}
                className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={sendReply}
                disabled={
                  replySending ||
                  !replyText.trim()
                }
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-[#C5A059] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replySending
                  ? "Preparing Reply..."
                  : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ContactMessages;