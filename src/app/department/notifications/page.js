"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Loader2, CheckCircle2, Scale, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { getNotifications, markNotificationRead } from "@/lib/api";

/**
 * Detects whether a notification is a dispute resolution alert.
 * Backend format: "Dispute for '[Task Title]' resolved in favor of [decision]. Result saved at [Timestamp]. Admin Notes: [Notes]"
 */
function parseDisputeNotification(message) {
    if (!message) return null;

    const lowerMsg = message.toLowerCase();
    if (!lowerMsg.includes("dispute") || !lowerMsg.includes("resolved in favor")) return null;

    const deptWon = lowerMsg.includes("in favor of department");
    const studentWon = lowerMsg.includes("in favor of student");

    const titleMatch = message.match(/Dispute for ['"'"](.+?)['"'"]/i);
    const taskTitle = titleMatch ? titleMatch[1] : null;

    const notesMatch = message.match(/Admin Notes:\s*(.+)/i);
    const adminNotes = notesMatch ? notesMatch[1].trim() : null;

    const tsMatch = message.match(/Result saved at\s+([^.]+)/i);
    const resolvedAt = tsMatch ? tsMatch[1].trim() : null;

    return { deptWon, studentWon, taskTitle, adminNotes, resolvedAt };
}

function DisputeNotificationCard({ notif, onMarkRead }) {
    const info = parseDisputeNotification(notif.message);
    const { deptWon } = info;

    return (
        <div className={`rounded-2xl border-2 overflow-hidden relative ${
            notif.is_read
                ? "opacity-70 border-slate-200 bg-slate-50"
                : deptWon
                    ? "border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-100"
                    : "border-orange-300 bg-orange-50 shadow-lg shadow-orange-100"
        }`}>
            {/* Verdict banner */}
            <div className={`px-5 py-3 flex items-center gap-3 ${deptWon ? "bg-emerald-500" : "bg-orange-500"}`}>
                <div className="bg-white/25 p-1.5 rounded-full">
                    <Scale size={16} className="text-white" />
                </div>
                <p className="text-white font-black text-sm uppercase tracking-wide">
                    {deptWon ? "✅ Dispute Resolved — Dept. Favoured" : "⚠️ Dispute Resolved — Student Paid"}
                </p>
            </div>

            {/* Details */}
            <div className="p-5 flex flex-col gap-3">
                {info.taskTitle && (
                    <p className={`text-sm font-bold ${deptWon ? "text-emerald-900" : "text-orange-900"}`}>
                        Task: {info.taskTitle}
                    </p>
                )}

                <p className={`text-sm leading-relaxed font-medium ${deptWon ? "text-emerald-700" : "text-orange-700"}`}>
                    {deptWon
                        ? "Admin ruled in your favour. The task was cancelled — no payment made."
                        : "Admin ruled in favour of the student. The reward has been paid out from the bounty."}
                </p>

                {info.adminNotes && (
                    <div className={`rounded-xl p-3 flex gap-2.5 items-start ${
                        deptWon ? "bg-emerald-100 border border-emerald-200" : "bg-orange-100 border border-orange-200"
                    }`}>
                        <MessageSquareText size={14} className={`flex-shrink-0 mt-0.5 ${deptWon ? "text-emerald-600" : "text-orange-600"}`} />
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${deptWon ? "text-emerald-600" : "text-orange-600"}`}>
                                Admin Notes
                            </p>
                            <p className={`text-xs leading-relaxed ${deptWon ? "text-emerald-800" : "text-orange-800"}`}>
                                {info.adminNotes}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-400 font-medium">
                        {info.resolvedAt || new Date(notif.created_at).toLocaleString()}
                    </p>
                    {!notif.is_read && (
                        <button
                            onClick={() => onMarkRead(notif.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-95 ${
                                deptWon
                                    ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-600 hover:text-white"
                                    : "text-orange-700 bg-orange-100 hover:bg-orange-600 hover:text-white"
                            }`}>
                            <CheckCircle2 size={14} /> Mark Read
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function StandardNotificationCard({ notif, onMarkRead }) {
    return (
        <div className={`p-5 rounded-2xl border ${
            notif.is_read
                ? "bg-slate-50 border-slate-100 opacity-70"
                : "bg-white border-secondary/20 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.15)] relative overflow-hidden"
        }`}>
            {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />}
            <div className="flex gap-4">
                <div className="mt-1">
                    <div className={`p-2 rounded-full ${notif.is_read ? "bg-slate-200 text-slate-500" : "bg-indigo-100 text-secondary"}`}>
                        <Bell size={20} />
                    </div>
                </div>
                <div className="flex-1">
                    <p className={`text-sm ${notif.is_read ? "text-slate-600" : "text-slate-800 font-medium"}`}>{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(notif.created_at).toLocaleString()}</p>
                </div>
                {!notif.is_read && (
                    <button
                        onClick={() => onMarkRead(notif.id)}
                        className="self-center flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-secondary bg-indigo-50 hover:bg-secondary hover:text-white transition-colors active:scale-95">
                        <CheckCircle2 size={14} /> Read
                    </button>
                )}
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setNotifications(data);
        } catch (err) {
            setError(err.message || "Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const disputeNotifs = notifications.filter(n => parseDisputeNotification(n.message));
    const standardNotifs = notifications.filter(n => !parseDisputeNotification(n.message));
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2">
                <Link href="/department/dashboard" className="absolute left-0 text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <div className="mx-auto flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-800">System Alerts</h1>
                    {unreadCount > 0 && (
                        <span className="bg-secondary text-white text-xs font-black px-2 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                </div>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center">{error}</div>}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-secondary" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 md:p-10 mt-4 text-center flex flex-col items-center justify-center shadow-sm border border-slate-100 mx-px">
                    <div className="bg-slate-50 text-slate-300 p-6 rounded-full mb-4 ring-8 ring-slate-50/50">
                        <Bell size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No active alerts</h3>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                        You have not received any new system notifications. Dispute outcomes and bounty updates will appear here.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Dispute resolution notifications — pinned to top */}
                    {disputeNotifs.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Scale size={13} /> Dispute Results
                            </p>
                            {disputeNotifs.map(notif => (
                                <DisputeNotificationCard key={notif.id} notif={notif} onMarkRead={handleMarkAsRead} />
                            ))}
                        </div>
                    )}

                    {/* Standard notifications */}
                    {standardNotifs.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {disputeNotifs.length > 0 && (
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Bell size={13} /> Other Alerts
                                </p>
                            )}
                            {standardNotifs.map(notif => (
                                <StandardNotificationCard key={notif.id} notif={notif} onMarkRead={handleMarkAsRead} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
