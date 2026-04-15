"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Scale, CheckCircle2, ShieldAlert, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { resolveDispute, apiCall } from "@/lib/api";

export default function AdminDisputesPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [adminNotes, setAdminNotes] = useState({});
    const [expandedId, setExpandedId] = useState(null);

    const fetchTasks = async () => {
        try {
            // Use the admin dispute viewset, as standard /tasks/ blocks non-students
            const res = await apiCall('/admin/disputes/');
            const rawData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            // Assume the backend already filters, but if not we keep our filter
            setTasks(rawData.filter(t => t.status === 'disputed' || t.status === 'in_review'));
            setError("");
        } catch (err) {
            setError(err.message || "Failed to load disputed tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleResolve = async (id, decision) => {
        setActionLoading(`${id}-${decision}`);
        setError("");
        setSuccessMsg("");

        try {
            // api_reference: decision is "student" or "department"
            await resolveDispute(id, decision, adminNotes[id] || "");
            const label = decision === "student" ? "student (reward released)" : "department (task cancelled)";
            setSuccessMsg(`Dispute resolved in favour of ${label}.`);
            fetchTasks();
        } catch (err) {
            setError(err.message || "Could not resolve dispute.");
        } finally {
            setActionLoading(null);
        }
    };

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 px-4 md:px-0">
            <header className="flex items-center relative py-2 mb-2 border-b border-slate-100 pb-4">
                <Link href="/" className="absolute left-0 text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">Exit Admin</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto flex items-center gap-2">
                    <ShieldAlert className="text-red-500" size={24} />
                    Dispute Tribunal
                </h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center font-medium shadow-sm">{error}</div>}
            {successMsg && (
                <div className="p-4 text-green-700 bg-green-100 rounded-xl text-sm text-center flex items-center justify-center gap-2 shadow-sm font-medium">
                    <CheckCircle2 size={16} /> {successMsg}
                </div>
            )}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-red-500" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 md:p-10 mt-4 text-center flex flex-col items-center justify-center shadow-sm border border-slate-100">
                    <div className="bg-green-50 text-green-400 p-6 rounded-full mb-4 ring-8 ring-green-50/50">
                        <Scale size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Disputes</h3>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                        The platform is running smoothly. There are no tasks requiring administrative arbitration at the moment.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-5 mt-2">
                    {tasks.map((task) => {
                        const isExpanded = expandedId === task.id;
                        const isLoadingStudent = actionLoading === `${task.id}-student`;
                        const isLoadingDept = actionLoading === `${task.id}-department`;
                        const isAnyLoading = isLoadingStudent || isLoadingDept;

                        return (
                            <div key={task.id} className="bg-white rounded-[2rem] shadow-md border-2 border-red-500/10 flex flex-col overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />

                                <div className="p-5 pl-7">
                                    <div className="flex justify-between items-start gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight flex-1">{task.title}</h3>
                                        <span className="text-2xl font-black text-red-500 flex-shrink-0">₦{task.reward_amount}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{task.description}</p>

                                    {/* Expand for notes */}
                                    <button
                                        onClick={() => toggleExpand(task.id)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-3"
                                    >
                                        <MessageSquare size={14} />
                                        {isExpanded ? "Hide" : "Add"} Admin Notes
                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>

                                    {isExpanded && (
                                        <textarea
                                            rows={3}
                                            placeholder="Optional: enter your ruling notes before resolving…"
                                            value={adminNotes[task.id] || ""}
                                            onChange={(e) => setAdminNotes(prev => ({ ...prev, [task.id]: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-300/50 transition-all font-medium text-slate-800 resize-none mb-4"
                                        />
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            disabled={isAnyLoading}
                                            onClick={() => handleResolve(task.id, 'department')}
                                            className="flex w-full items-center justify-center gap-2 border-2 border-red-200 bg-red-50 text-red-600 font-bold py-3.5 rounded-2xl transition-all hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 disabled:opacity-50"
                                        >
                                            {isLoadingDept ? <Loader2 size={18} className="animate-spin" /> : "Refund Department"}
                                        </button>

                                        <button
                                            disabled={isAnyLoading}
                                            onClick={() => handleResolve(task.id, 'student')}
                                            className="flex w-full items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                                        >
                                            {isLoadingStudent ? <Loader2 size={18} className="animate-spin" /> : "Pay Student"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* User Deletion Module */}
            <div className="bg-red-50 rounded-3xl p-6 md:p-8 mt-6 border-2 border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-red-100/50 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2 relative z-10"><ShieldAlert size={20} /> User Deletion Module</h3>
                <p className="text-sm text-red-600 font-medium mb-5 leading-relaxed relative z-10">
                    Warning: Entering a user ID here will permanently delete the corresponding student or department account from the entire system.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                    <input 
                        type="text" 
                        id="user-delete-input" 
                        placeholder="Enter User ID (e.g. 15)" 
                        className="bg-white border text-red-900 placeholder:text-red-300 border-red-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-all font-bold flex-1"
                    />
                    <button 
                        onClick={async (e) => {
                            const input = document.getElementById("user-delete-input");
                            const id = input.value.trim();
                            if(!id) return;
                            if (confirm(`CRITICAL: Are you absolutely certain you want to purge user #${id} from the database?`)) {
                                const btn = e.currentTarget;
                                btn.disabled = true;
                                btn.innerHTML = "Deleting...";
                                try {
                                    const { deleteUser } = await import("@/lib/api");
                                    await deleteUser(id);
                                    alert(`User #${id} successfully deleted from the platform.`);
                                    input.value = "";
                                } catch(err) {
                                    alert(`Failed to delete user: ${err.message}`);
                                } finally {
                                    btn.disabled = false;
                                    btn.innerHTML = "Execute Deletion";
                                }
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 whitespace-nowrap"
                    >
                        Execute Deletion
                    </button>
                </div>
            </div>
        </div>
    );
}
