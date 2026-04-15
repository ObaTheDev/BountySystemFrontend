"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getNotifications, markNotificationRead } from "@/lib/api";

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
            // Refresh to confirm read state from server
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2">
                <Link href="/department/dashboard" className="absolute left-0 text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">System Alerts</h1>
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
                        You have not received any new system notifications. When bounties are accepted or disputed, alerts may appear here.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-5 rounded-2xl border ${notif.is_read ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-secondary/20 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.15)] relative overflow-hidden'}`}>
                            {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />}
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <div className={`p-2 rounded-full ${notif.is_read ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-secondary'}`}>
                                        <Bell size={20} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm ${notif.is_read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>{notif.message}</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                                {!notif.is_read && (
                                    <button onClick={() => handleMarkAsRead(notif.id)} className="self-center flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-secondary bg-indigo-50 hover:bg-secondary hover:text-white transition-colors active:scale-95">
                                        <CheckCircle2 size={14} /> Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
