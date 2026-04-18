"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, CalendarClock, CheckCircle, Loader2, FileText, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { submitTask, getStudentAssignments, raiseDispute, getDisputes } from "@/lib/api";

export default function MyBountiesPage() {
    const [assignments, setAssignments] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Submission form state (per-task)
    const [submittingId, setSubmittingId] = useState(null);
    const [showFormFor, setShowFormFor] = useState(null);
    const [notes, setNotes] = useState("");

    const fetchAssignments = async () => {
        try {
            const [assignRes, disputeRes] = await Promise.all([
                getStudentAssignments(),
                getDisputes().catch(() => null),
            ]);
            const all = Array.isArray(assignRes.data) ? assignRes.data :
                Array.isArray(assignRes.results) ? assignRes.results :
                    Array.isArray(assignRes) ? assignRes : [];
            setAssignments(all);

            if (disputeRes) {
                const dList = Array.isArray(disputeRes.data) ? disputeRes.data :
                    Array.isArray(disputeRes.results) ? disputeRes.results :
                        Array.isArray(disputeRes) ? disputeRes : [];
                setDisputes(dList);
            }
        } catch (err) {
            setError(`API Error: ${err.message || 'Failed to fetch assignments'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssignments(); }, []);

    const openForm = (taskId) => {
        setShowFormFor(taskId);
        setNotes("");
        setError("");
        setSuccessMsg("");
    };

    const closeForm = () => {
        setShowFormFor(null);
        setNotes("");
    };

    const handleSubmit = async (taskId) => {
        setSubmittingId(taskId);
        setError("");
        setSuccessMsg("");
        try {
            // Pass notes as text; no image — submitTask(id, null, notes)
            await submitTask(taskId, null, notes);
            setSuccessMsg("Work submitted! Waiting for the department to review.");
            closeForm();
            fetchAssignments();
        } catch (err) {
            setError(err.message || "Failed to submit work.");
        } finally {
            setSubmittingId(null);
        }
    };

    const handleRaiseDispute = async (taskId) => {
        const reason = prompt("Please describe your dispute. An admin will review it.");
        if (!reason || !reason.trim()) {
            if (reason !== null) alert("A dispute reason is required.");
            return;
        }
        try {
            await raiseDispute(taskId, reason.trim());
            setSuccessMsg("Dispute raised. An admin will review this case.");
            fetchAssignments();
        } catch (err) {
            setError(err.message || "Failed to raise dispute.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/student/dashboard" className="absolute left-0 text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">My Bounties</h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm font-bold shadow-sm">{error}</div>}
            {successMsg && <div className="p-4 text-green-700 bg-green-100 rounded-xl text-sm text-center font-medium">{successMsg}</div>}

            <div className="flex flex-col gap-4">
                {assignments.length > 0 ? (
                    assignments.map((assignment) => {
                        const task = assignment.task_details || {};
                        const displayStatus = assignment.status;
                        const isFormOpen = showFormFor === task.id;
                        const isSubmitting = submittingId === task.id;
                        const canSubmit = displayStatus === 'in_progress' || displayStatus === 'accepted';
                        const isPending = displayStatus === 'submitted' || displayStatus === 'pending_confirmation';
                        const isDisputed = displayStatus === 'disputed';
                        const isDone = displayStatus === 'completed' || displayStatus === 'confirmed';
                        const isCancelled = displayStatus === 'cancelled';

                        // Find the resolved dispute for this task (if any)
                        const resolvedDispute = disputes.find(d => {
                            const dispTaskId = d.task_details?.id ?? d.task_id ?? d.task;
                            return String(dispTaskId) === String(task.id) && d.status === 'resolved';
                        });
                        const studentWon = resolvedDispute?.resolution_decision === 'student';
                        const deptWon = resolvedDispute?.resolution_decision === 'department';

                        return (
                            <div key={assignment.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-2 h-full ${isDone ? 'bg-green-500' : isDisputed ? 'bg-red-500' : isPending ? 'bg-amber-400' : 'bg-primary'}`} />

                                <div className="pl-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight pr-4">{task.title || "Task"}</h3>
                                        <div className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase ${
                                            isDone ? 'bg-green-50 text-green-600' :
                                            isDisputed ? 'bg-red-50 text-red-600' :
                                            isPending ? 'bg-amber-50 text-amber-600' :
                                            'bg-blue-50 text-primary'
                                        }`}>
                                            {displayStatus.replace(/_/g, " ")}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <Briefcase size={14} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-500">{task.department_name || "Department"}</span>
                                    </div>

                                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{task.description}</p>

                                    <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <CalendarClock size={16} />
                                            <span className="text-xs font-semibold">Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "TBD"}</span>
                                        </div>
                                        <p className="text-lg font-bold text-slate-800">₦{task.reward_amount}</p>
                                    </div>

                                    {/* Already-submitted notes */}
                                    {(isPending || isDone) && assignment.submission_notes && (
                                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                <FileText size={12} /> Your Submission Notes
                                            </p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{assignment.submission_notes}</p>
                                        </div>
                                    )}

                                    {/* Dispute in progress badge */}
                                    {isDisputed && (
                                        <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                                            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-red-700">Dispute in Progress</p>
                                                <p className="text-xs text-red-500">An admin is reviewing this task. You will be notified of the outcome.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dispute resolved — student won */}
                                    {isDone && resolvedDispute && studentWon && (
                                        <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                                            <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-black text-emerald-700 uppercase tracking-wide">Dispute Resolved — You Won! 🎉</p>
                                                <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
                                                    Admin ruled in your favour. ₦{Number(task.reward_amount || 0).toLocaleString()} has been credited to your wallet.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dispute resolved — department won (task cancelled) */}
                                    {isCancelled && resolvedDispute && deptWon && (
                                        <div className="mt-4 bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                                            <AlertTriangle size={20} className="text-slate-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-black text-slate-700 uppercase tracking-wide">Dispute Resolved — Dept. Favoured</p>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                    Admin reviewed the case and ruled in favour of the department. This task has been cancelled.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Generic cancelled (no dispute) */}
                                    {isCancelled && !resolvedDispute && (
                                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                                            <AlertTriangle size={18} className="text-slate-400 flex-shrink-0" />
                                            <p className="text-sm text-slate-500 font-medium">This task has been cancelled.</p>
                                        </div>
                                    )}

                                    {/* Submit Work button */}
                                    {canSubmit && !isFormOpen && (
                                        <button
                                            onClick={() => openForm(task.id)}
                                            className="w-full flex justify-center items-center gap-2 mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]">
                                            <Send size={16} /> Submit Work for Review
                                        </button>
                                    )}

                                    {/* Inline submission form — text only */}
                                    {canSubmit && isFormOpen && (
                                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col gap-4">
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <FileText size={16} className="text-primary" /> Describe your work
                                            </p>
                                            <textarea
                                                rows={4}
                                                placeholder="Briefly explain what you did, where to find it, or any relevant details for the department to review…"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-800 resize-none font-medium"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={closeForm}
                                                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSubmit(task.id)}
                                                    disabled={isSubmitting}
                                                    className="flex-[2] flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70">
                                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Submit for Review</>}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {isPending && (
                                        <div className="w-full mt-4 flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 bg-amber-50 text-amber-700 font-bold py-3 px-4 rounded-xl text-center text-sm border border-amber-200">
                                                Waiting for Department to Confirm
                                            </div>
                                            <button
                                                onClick={() => handleRaiseDispute(task.id)}
                                                className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 font-bold py-3 px-5 rounded-xl hover:bg-red-50 transition-all text-sm">
                                                <AlertTriangle size={14} /> Dispute
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-sm">
                        <CheckCircle size={40} className="text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold text-lg">You haven&apos;t accepted any bounties yet.</p>
                        <p className="text-slate-400 text-sm max-w-xs mt-2">If you recently accepted a task, it will appear here.</p>
                        <Link href="/student/tasks" className="text-primary font-semibold mt-6 bg-primary/10 px-6 py-2.5 rounded-full hover:bg-primary hover:text-white transition-colors">
                            Find New Tasks
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
