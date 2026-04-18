"use client";
import { useEffect, useState } from "react";
import { PlusCircle, CheckCircle, Clock, Loader2, Bell, Scale, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getProfile, getDeptTasks, getDisputes } from "@/lib/api";

export default function DepartmentDashboard() {
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [resolvedDisputes, setResolvedDisputes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profRes, tasksRes, disputeRes] = await Promise.all([
                    getProfile(),
                    getDeptTasks(),
                    getDisputes().catch(() => null),
                ]);
                setProfile(profRes.data);
                const taskData = tasksRes.data || tasksRes.results || [];
                setTasks(Array.isArray(taskData) ? taskData : (taskData.results || []));

                if (disputeRes) {
                    const dList = Array.isArray(disputeRes.data) ? disputeRes.data :
                        Array.isArray(disputeRes.results) ? disputeRes.results :
                            Array.isArray(disputeRes) ? disputeRes : [];
                    // Only show resolved disputes — pending/in_review are shown on the task page
                    setResolvedDisputes(dList.filter(d => d.status === 'resolved'));
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={40} className="animate-spin text-secondary" />
            </div>
        );
    }

    const activeBountiesCount = tasks.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'pending_confirmation').length;
    // Calculate total spent based on completed reward amounts
    const totalSpent = tasks.filter(t => t.status === 'completed' || t.status === 'confirmed').reduce((acc, curr) => acc + parseFloat(curr.reward_amount), 0);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile?.full_name || profile?.user?.full_name || "Department"}!</h1>
                </div>
            </header>

            {/* Stats Card - Uses Secondary theme for Department */}
            <div className="bg-secondary rounded-3xl p-6 text-white shadow-lg shadow-secondary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-6 -mb-6" />

                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-secondary-100 text-sm font-medium mb-1 text-white/80">Active Bounties</p>
                        <p className="text-4xl font-bold">{activeBountiesCount}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-secondary-100 text-sm font-medium mb-1 text-white/80">Total Spent</p>
                        <p className="text-3xl font-bold">₦{totalSpent.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Resolved Dispute Outcomes */}
            {resolvedDisputes.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Scale size={20} className="text-secondary" />
                        Dispute Outcomes
                    </h2>
                    {resolvedDisputes.map((dispute) => {
                        const deptWon = dispute.resolution_decision === 'department';
                        const taskDetails = dispute.task_details || dispute.task || {};
                        const taskId = taskDetails.id || dispute.task_id ||
                            (typeof dispute.task === 'number' ? dispute.task : null);
                        const taskTitle = dispute.task_title || taskDetails.title || 'Task';
                        const rewardAmount = taskDetails.reward_amount || dispute.reward_amount || 0;

                        return (
                            <div
                                key={dispute.id}
                                className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
                                    deptWon
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-orange-50 border-orange-200'
                                }`}
                            >
                                <div className={`p-2 rounded-full flex-shrink-0 mt-0.5 ${
                                    deptWon ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-500'
                                }`}>
                                    {deptWon ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black uppercase tracking-wide ${
                                        deptWon ? 'text-emerald-700' : 'text-orange-700'
                                    }`}>
                                        {deptWon
                                            ? '✅ Dispute Resolved — Dept. Favoured'
                                            : '⚠️ Dispute Resolved — Student Paid'}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-600 mt-1 truncate">{taskTitle}</p>
                                    <p className={`text-xs mt-1 leading-relaxed ${
                                        deptWon ? 'text-emerald-600' : 'text-orange-600'
                                    }`}>
                                        {deptWon
                                            ? 'Admin ruled in your favour. The task was cancelled — no payment made.'
                                            : `Admin ruled in favour of the student. ₦${Number(rewardAmount).toLocaleString()} was paid out.`}
                                    </p>
                                </div>
                                {taskId && (
                                    <Link
                                        href={`/department/tasks/${taskId}`}
                                        className={`flex-shrink-0 self-center p-1.5 rounded-full transition-colors ${
                                            deptWon
                                                ? 'text-emerald-500 hover:bg-emerald-100'
                                                : 'text-orange-500 hover:bg-orange-100'
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
                <h2 className="text-lg font-bold text-slate-800 mb-4">Department Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/department/create" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-secondary/20 transition-all active:scale-95 group">
                        <div className="bg-indigo-50 text-secondary p-3 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                            <PlusCircle size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 text-center">Create Bounty</span>
                    </Link>

                    <Link href="/department/tasks" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-secondary/20 transition-all active:scale-95 group">
                        <div className="bg-indigo-50 text-secondary p-3 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 text-center">Review Submissions</span>
                    </Link>

                    <Link href="/department/history" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-secondary/20 transition-all active:scale-95 cursor-pointer group">
                        <div className="bg-indigo-50 text-secondary p-3 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                            <Clock size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 text-center">Past Bounties</span>
                    </Link>

                    <Link href="/department/notifications" className="bg-white p-6 rounded-3xl shadow-sm border-2 border-secondary/20 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-secondary transition-all active:scale-95 cursor-pointer group">
                        <div className="bg-secondary/10 text-secondary p-3 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-colors duration-300 relative">
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <Bell size={24} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 text-center">System Alerts</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
