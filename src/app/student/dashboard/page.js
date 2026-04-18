"use client";
import { useEffect, useState } from "react";
import { Search, Award, HelpCircle, Loader2, Bell, Scale, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getStudentDashboard, getDisputes } from "@/lib/api";

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [resolvedDisputes, setResolvedDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashRes, disputeRes] = await Promise.all([
                    getStudentDashboard(),
                    getDisputes().catch(() => null),
                ]);
                setData(dashRes.data);

                if (disputeRes) {
                    const dList = Array.isArray(disputeRes.data) ? disputeRes.data :
                        Array.isArray(disputeRes.results) ? disputeRes.results :
                            Array.isArray(disputeRes) ? disputeRes : [];
                    setResolvedDisputes(dList.filter(d => d.status === "resolved"));
                }
            } catch (err) {
                setError(err.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-600 bg-red-100 rounded-xl">{error}</div>;
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome back, {data?.full_name}!</h1>
                </div>
            </header>

            {/* Stats Card */}
            <div className="bg-primary rounded-3xl p-6 text-white shadow-lg shadow-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-6 -mb-6" />

                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-sm font-medium mb-1 text-white/80">Total Earned</p>
                        <p className="text-3xl font-bold">₦{data?.total_earned}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium mb-1 text-white/80">Active Tasks</p>
                        <p className="text-3xl font-bold">{data?.active_tasks_count}</p>
                    </div>
                </div>
            </div>

            {/* Dispute Outcomes — only shown when there are resolved disputes */}
            {resolvedDisputes.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Scale size={20} className="text-primary" />
                        Dispute Outcomes
                    </h2>
                    {resolvedDisputes.map((dispute) => {
                        const studentWon = dispute.resolution_decision === "student";
                        const taskDetails = dispute.task_details || dispute.task || {};
                        const taskId = taskDetails.id || dispute.task_id ||
                            (typeof dispute.task === "number" ? dispute.task : null);
                        const taskTitle = dispute.task_title || taskDetails.title || "Task";
                        const rewardAmount = taskDetails.reward_amount || dispute.reward_amount || 0;

                        return (
                            <div
                                key={dispute.id}
                                className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
                                    studentWon
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-slate-100 border-slate-200"
                                }`}
                            >
                                <div className={`p-2 rounded-full flex-shrink-0 mt-0.5 ${
                                    studentWon
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-slate-200 text-slate-500"
                                }`}>
                                    {studentWon
                                        ? <CheckCircle size={18} />
                                        : <AlertTriangle size={18} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black uppercase tracking-wide ${
                                        studentWon ? "text-emerald-700" : "text-slate-700"
                                    }`}>
                                        {studentWon
                                            ? "🎉 Dispute Resolved — You Won!"
                                            : "Dispute Resolved — Dept. Favoured"}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-600 mt-1 truncate">{taskTitle}</p>
                                    <p className={`text-xs mt-1 leading-relaxed ${
                                        studentWon ? "text-emerald-600" : "text-slate-500"
                                    }`}>
                                        {studentWon
                                            ? `Admin ruled in your favour. ₦${Number(rewardAmount).toLocaleString()} has been credited to your wallet.`
                                            : "Admin reviewed the case and ruled in favour of the department. This task was cancelled."}
                                    </p>
                                </div>

                                {taskId && (
                                    <Link
                                        href="/student/bounties"
                                        className={`flex-shrink-0 self-center p-1.5 rounded-full transition-colors ${
                                            studentWon
                                                ? "text-emerald-500 hover:bg-emerald-100"
                                                : "text-slate-400 hover:bg-slate-200"
                                        }`}
                                    >
                                        <ChevronRight size={18} />
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/student/tasks" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/20 transition-all active:scale-95 group">
                        <div className="bg-blue-50 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <Search size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Find Tasks</span>
                    </Link>

                    <Link href="/student/bounties" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/20 transition-all active:scale-95 cursor-pointer group">
                        <div className="bg-blue-50 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <Award size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">My Bounties</span>
                    </Link>

                    <Link href="/student/notifications" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/20 transition-all active:scale-95 cursor-pointer group">
                        <div className="bg-blue-50 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300 relative">
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <Bell size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">System Alerts</span>
                    </Link>

                    <Link href="/student/support" className="bg-white p-6 rounded-3xl shadow-sm border-2 border-primary/20 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary transition-all active:scale-95 cursor-pointer group">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <HelpCircle size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Support</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
