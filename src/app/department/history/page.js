"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, History, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getDeptTasks } from "@/lib/api";

export default function PastBountiesPage() {
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getDeptTasks();
                const allTasks = Array.isArray(res.data) ? res.data :
                    Array.isArray(res.results) ? res.results :
                        Array.isArray(res) ? res : [];
                // Show only tasks that are completed, confirmed or cancelled
                const done = allTasks.filter(t =>
                    t.status === "completed" ||
                    t.status === "confirmed" ||
                    t.status === "cancelled"
                );
                setCompletedTasks(done);
            } catch (err) {
                setError(err.message || "Failed to load past bounties.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const statusColor = (status) => {
        if (status === "completed" || status === "confirmed") return "bg-green-100 text-green-700";
        if (status === "cancelled") return "bg-red-100 text-red-600";
        return "bg-slate-100 text-slate-500";
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/department/dashboard" className="absolute left-0 text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto flex items-center gap-2">
                    <Clock size={20} className="text-secondary" />
                    Past Bounties
                </h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center font-medium">{error}</div>}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-secondary" />
                </div>
            ) : completedTasks.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-sm border border-slate-100">
                    <History size={48} className="text-slate-300 mb-4" />
                    <h3 className="text-slate-800 font-bold text-lg">No Past Bounties</h3>
                    <p className="text-slate-500 font-medium mt-2 max-w-sm">
                        All your bounties are currently active or in draft. Once a bounty is fully completed and paid out, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {completedTasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3 gap-3">
                                <h3 className="font-bold text-slate-800 text-base leading-snug flex-1">{task.title}</h3>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap flex-shrink-0 ${statusColor(task.status)}`}>
                                    {task.status.replace(/_/g, " ")}
                                </span>
                            </div>

                            <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">{task.description}</p>

                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 border-t border-slate-50 pt-3">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                                    <Calendar size={13} />
                                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}
                                </span>
                                <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                                    <CheckCircle2 size={13} />
                                    ₦{task.reward_amount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
