"use client";
import { useEffect, useState } from "react";
import {
    ArrowLeft, Loader2, Scale, CheckCircle2, ShieldAlert,
    MessageSquare, ChevronDown, ChevronUp, User, Building,
    AlertCircle, FileText
} from "lucide-react";
import Link from "next/link";
import { resolveDispute, apiCall, deleteUser, getTaskDetails } from "@/lib/api";

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [adminNotes, setAdminNotes] = useState({});
    const [expandedId, setExpandedId] = useState(null);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const res = await apiCall('/admin/disputes/');

            // Normalize regardless of whether the API returns an array,
            // a {data: [...]} envelope, or a paginated {results: [...]} shape.
            const raw = Array.isArray(res) ? res
                : Array.isArray(res.data) ? res.data
                : Array.isArray(res.results) ? res.results
                : Array.isArray(res.data?.results) ? res.data.results
                : [];

            /**
             * Each item from /admin/disputes/ is a Dispute object:
             * {
             *   id, status, reason, dept_response, resolution_decision,
             *   task_title, department_name,
             *   // OR nested: task_details: { id, title, reward_amount, description }
             * }
             * We normalise to a flat shape the UI can consume directly.
             */
            const normalised = raw.map(item => {
                const taskDetails = item.task_details || item.task || {};
                const assignmentDetails = item.assignment_details || item.assignment || {};
                const taskId = taskDetails.id || item.task_id ||
                    (typeof item.task === 'number' ? item.task : null);
                return {
                    // Dispute identity
                    disputeId: item.id,
                    taskId,
                    status: item.status,
                    reason: item.reason || "",
                    deptResponse: item.dept_response || "",
                    resolutionDecision: item.resolution_decision || null,
                    adminNotesSaved: item.admin_notes || "",
                    // Student submission notes (may be on assignment_details or task_details)
                    submissionNotes: assignmentDetails.submission_notes || item.submission_notes || taskDetails.submission_notes || "",
                    // Task info
                    title: item.task_title || taskDetails.title || "Untitled Task",
                    description: taskDetails.description || item.description || "",
                    rewardAmount: taskDetails.reward_amount || item.reward_amount || null,
                    // Party names
                    departmentName: item.department_name || taskDetails.department_name || "Department",
                    studentName: item.student_name || taskDetails.student_name || "Student",
                };
            });

            // ── Enrichment pass: fetch task details for disputes missing reward amount ──
            const enriched = await Promise.all(
                normalised.map(async (d) => {
                    if ((d.rewardAmount === null || d.rewardAmount === 0) && d.taskId) {
                        try {
                            const taskRes = await getTaskDetails(d.taskId);
                            const t = taskRes.data || taskRes;
                            return {
                                ...d,
                                rewardAmount: t.reward_amount || 0,
                                description: d.description || t.description || '',
                                title: d.title === 'Untitled Task' ? (t.title || d.title) : d.title,
                            };
                        } catch { /* keep as-is */ }
                    }
                    return { ...d, rewardAmount: d.rewardAmount ?? 0 };
                })
            );

            setDisputes(enriched);
            setError("");
        } catch (err) {
            setError(err.message || "Failed to load disputes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDisputes(); }, []);

    const handleResolve = async (disputeId, decision) => {
        setActionLoading(`${disputeId}-${decision}`);
        setError("");
        setSuccessMsg("");
        try {
            await resolveDispute(disputeId, decision, adminNotes[disputeId] || "");
            const label = decision === "student" ? "student (reward released)" : "department (task cancelled)";
            setSuccessMsg(`Dispute #${disputeId} resolved in favour of ${label}.`);
            fetchDisputes();
        } catch (err) {
            setError(err.message || "Could not resolve dispute.");
        } finally {
            setActionLoading(null);
        }
    };

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    // Status colour helpers
    const statusBadge = (status) => {
        if (status === 'pending') return 'bg-amber-100 text-amber-700';
        if (status === 'in_review') return 'bg-blue-100 text-blue-700';
        if (status === 'resolved') return 'bg-green-100 text-green-700';
        return 'bg-slate-100 text-slate-500';
    };

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

            {error && (
                <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center font-medium shadow-sm flex items-center justify-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {successMsg && (
                <div className="p-4 text-green-700 bg-green-100 rounded-xl text-sm text-center flex items-center justify-center gap-2 shadow-sm font-medium">
                    <CheckCircle2 size={16} /> {successMsg}
                </div>
            )}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-red-500" />
                </div>
            ) : disputes.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 md:p-10 mt-4 text-center flex flex-col items-center justify-center shadow-sm border border-slate-100">
                    <div className="bg-green-50 text-green-400 p-6 rounded-full mb-4 ring-8 ring-green-50/50">
                        <Scale size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Disputes</h3>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                        The platform is running smoothly. There are no disputes requiring administrative review at the moment.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-5 mt-2">
                    {disputes.map((d) => {
                        const isExpanded = expandedId === d.disputeId;
                        const isLoadingStudent = actionLoading === `${d.disputeId}-student`;
                        const isLoadingDept = actionLoading === `${d.disputeId}-department`;
                        const isAnyLoading = isLoadingStudent || isLoadingDept;
                        const isResolved = d.status === 'resolved';

                        return (
                            <div key={d.disputeId} className="bg-white rounded-[2rem] shadow-md border-2 border-red-500/10 flex flex-col overflow-hidden relative">
                                {/* Status accent bar */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${isResolved ? 'bg-green-500' : d.status === 'in_review' ? 'bg-blue-500' : 'bg-red-500'}`} />

                                <div className="p-5 pl-7 flex flex-col gap-4">
                                    {/* Title row */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-800 leading-tight truncate">{d.title}</h3>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                                                    <Building size={12} /> {d.departmentName}
                                                </span>
                                                {d.studentName && d.studentName !== "Student" && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                                                        <User size={12} /> {d.studentName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <span className="text-xl font-black text-slate-800">₦{Number(d.rewardAmount).toLocaleString()}</span>
                                            <span className="text-[10px] font-semibold text-slate-400">Bounty</span>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${statusBadge(d.status)}`}>
                                                {d.status.replace("_", " ")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dispute Reason */}
                                    {d.reason && (
                                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                <AlertCircle size={12} /> Dispute Reason
                                            </p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{d.reason}</p>
                                        </div>
                                    )}

                                    {/* Student Submission Notes */}
                                    {d.submissionNotes && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                <FileText size={12} /> Student Submission Notes
                                            </p>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{d.submissionNotes}</p>
                                        </div>
                                    )}

                                    {/* Department Response (if submitted) */}
                                    {d.deptResponse && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                <FileText size={12} /> Department Evidence
                                            </p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{d.deptResponse}</p>
                                        </div>
                                    )}

                                    {/* Admin Notes toggle */}
                                    {!isResolved && (
                                        <>
                                            <button
                                                onClick={() => toggleExpand(d.disputeId)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                            >
                                                <MessageSquare size={14} />
                                                {isExpanded ? "Hide" : "Add"} Admin Notes
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>

                                            {isExpanded && (
                                                <textarea
                                                    rows={3}
                                                    placeholder="Optional: record your ruling rationale before resolving…"
                                                    value={adminNotes[d.disputeId] || ""}
                                                    onChange={(e) => setAdminNotes(prev => ({ ...prev, [d.disputeId]: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-300/50 transition-all font-medium text-slate-800 resize-none"
                                                />
                                            )}

                                            {/* Resolution buttons */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <button
                                                    disabled={isAnyLoading}
                                                    onClick={() => handleResolve(d.disputeId, 'department')}
                                                    className="flex w-full items-center justify-center gap-2 border-2 border-red-200 bg-red-50 text-red-600 font-bold py-3.5 rounded-2xl transition-all hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 disabled:opacity-50"
                                                >
                                                    {isLoadingDept ? <Loader2 size={18} className="animate-spin" /> : "Favour Department"}
                                                </button>

                                                <button
                                                    disabled={isAnyLoading}
                                                    onClick={() => handleResolve(d.disputeId, 'student')}
                                                    className="flex w-full items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                                                >
                                                    {isLoadingStudent ? <Loader2 size={18} className="animate-spin" /> : "Pay Student"}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {/* Resolved banner */}
                                    {isResolved && (
                                        <div className={`rounded-2xl p-4 flex items-start gap-3 border-2 ${
                                            d.resolutionDecision === 'student'
                                                ? 'bg-emerald-50 border-emerald-200'
                                                : 'bg-red-50 border-red-200'
                                        }`}>
                                            <CheckCircle2 size={22} className={`flex-shrink-0 mt-0.5 ${
                                                d.resolutionDecision === 'student' ? 'text-emerald-500' : 'text-red-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-black uppercase tracking-wide ${
                                                    d.resolutionDecision === 'student' ? 'text-emerald-700' : 'text-red-700'
                                                }`}>
                                                    {d.resolutionDecision === 'student'
                                                        ? '✅ Resolved — Student Paid'
                                                        : '🚫 Resolved — Task Cancelled (Dept. Favoured)'}
                                                </p>
                                                <p className={`text-xs mt-1 leading-relaxed ${
                                                    d.resolutionDecision === 'student' ? 'text-emerald-600' : 'text-red-500'
                                                }`}>
                                                    {d.resolutionDecision === 'student'
                                                        ? `₦${Number(d.rewardAmount).toLocaleString()} reward was released to the student's wallet.`
                                                        : 'The task was cancelled. No payment was made to the student.'}
                                                </p>
                                                {d.adminNotesSaved && (
                                                    <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-200 pt-2">
                                                        Admin note: {d.adminNotesSaved}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* User Deletion Module */}
            <div className="bg-red-50 rounded-3xl p-6 md:p-8 mt-6 border-2 border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-red-100/50 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2 relative z-10">
                    <ShieldAlert size={20} /> User Deletion Module
                </h3>
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
                            const uid = input.value.trim();
                            if (!uid) return;
                            if (confirm(`CRITICAL: Are you absolutely certain you want to purge user #${uid} from the database?`)) {
                                const btn = e.currentTarget;
                                btn.disabled = true;
                                btn.innerHTML = "Deleting...";
                                try {
                                    await deleteUser(uid);
                                    alert(`User #${uid} successfully deleted from the platform.`);
                                    input.value = "";
                                } catch (err) {
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
