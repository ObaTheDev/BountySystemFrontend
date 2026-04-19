"use client";
import { useEffect, useState } from "react";
import {
    ArrowLeft, User, Calendar, CheckSquare, Loader2,
    AlertTriangle, CheckCircle, Phone, Hash,
    GraduationCap, MessageSquare, Send, FileText, MessageSquareText
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTaskDetails, confirmTask, raiseDispute, respondToDispute, getDepartmentAssignments, apiCall } from "@/lib/api";

export default function TaskManagementPage() {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [taskDispute, setTaskDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [bankDetails, setBankDetails] = useState(null);

    // Hybrid dispute response state
    const [showDisputeResponse, setShowDisputeResponse] = useState(false);
    const [deptResponse, setDeptResponse] = useState("");
    const [respondingToDispute, setRespondingToDispute] = useState(false);

    const fetchData = async () => {
        try {
            const res = await getTaskDetails(id);
            setTask(res.data || res);

            try {
                const assigns = await getDepartmentAssignments();
                const allA = Array.isArray(assigns.data) ? assigns.data :
                    Array.isArray(assigns.results) ? assigns.results :
                        Array.isArray(assigns) ? assigns : [];
                const activeAssign = allA.find(a => String(a.task_details?.id) === String(id));
                if (activeAssign) setAssignment(activeAssign);
            } catch (assignErr) {
                console.error("Failed to fetch assignments:", assignErr);
            }

            // Fetch any dispute for this task to show outcome after resolution
            try {
                const dRes = await apiCall(`/tasks/disputes/?task=${id}`);
                const dList = Array.isArray(dRes.data) ? dRes.data :
                    Array.isArray(dRes.results) ? dRes.results :
                        Array.isArray(dRes) ? dRes : [];
                // Prefer resolved dispute; fall back to most recent
                const resolved = dList.find(d => d.status === 'resolved') || dList[0] || null;
                setTaskDispute(resolved);
            } catch (dErr) {
                console.error("Could not fetch dispute info:", dErr);
            }
        } catch (err) {
            setError(`Failed to load task details. ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleConfirm = async () => {
        setActionLoading(true);
        setError("");
        try {
            const res = await confirmTask(id);
            setSuccessMsg("Task confirmed! Please send the reward to the student.");
            if (res.data?.bank_name) setBankDetails(res.data);
            fetchData();
        } catch (err) {
            setError(err.message || "Failed to confirm task");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRaiseDispute = async () => {
        const reason = prompt("Please enter the reason for the dispute. An admin will review it.");
        if (!reason || !reason.trim()) {
            if (reason !== null) alert("Reason for dispute is required.");
            return;
        }
        setActionLoading(true);
        setError("");
        try {
            await raiseDispute(id, reason.trim());
            setSuccessMsg("Dispute raised. An admin will review this task.");
            fetchData();
        } catch (err) {
            setError(err.message || "Failed to raise dispute");
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * The respond endpoint is POST /tasks/disputes/<dispute_id>/respond/
     * We need the dispute object's ID, not the task ID.
     * We fetch it from /tasks/disputes/?task=<id> as a fallback when the assignment
     * doesn't have it baked in.
     */
    const getDisputeId = async () => {
        // Prefer the baked-in dispute_id if the API returns it
        if (assignment?.dispute_id) return assignment.dispute_id;
        if (assignment?.dispute?.id) return assignment.dispute.id;

        // Fallback: fetch from the disputes endpoint filtered by task
        try {
            const res = await apiCall(`/tasks/disputes/?task=${id}`);
            const disputes = Array.isArray(res.data) ? res.data :
                Array.isArray(res.results) ? res.results :
                    Array.isArray(res) ? res : [];
            const pending = disputes.find(d => d.status === 'pending' || d.status === 'in_review');
            if (pending) return pending.id;
        } catch (e) {
            console.error("Could not resolve dispute ID:", e);
        }
        return null;
    };

    const handleDisputeResponse = async (e) => {
        e.preventDefault();
        if (!deptResponse.trim()) return;
        setRespondingToDispute(true);
        setError("");
        try {
            const disputeId = await getDisputeId();
            if (!disputeId) throw new Error("Could not locate the dispute record. Please refresh and try again.");
            await respondToDispute(disputeId, deptResponse);
            setSuccessMsg("Evidence submitted. Status moved to 'In Review'. Admin will make the final call.");
            setShowDisputeResponse(false);
            setDeptResponse("");
            fetchData();
        } catch (err) {
            setError(err.message || "Failed to submit dispute response");
        } finally {
            setRespondingToDispute(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={40} className="animate-spin text-secondary" />
            </div>
        );
    }

    if (!task) {
        return <div className="p-4 text-slate-500 text-center">Task Not Found</div>;
    }

    const studentName = assignment?.student_details?.user?.full_name || "A Student";
    const studentPhone = assignment?.student_details?.user?.phone_number || "";
    const studentMatric = assignment?.student_details?.matric_number || "";
    const studentLevel = assignment?.student_details?.level || "";

    // Submission evidence (text only)
    const submissionNotes = assignment?.submission_notes;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <header className="flex flex-col gap-2 relative mb-2">
                <Link
                    href="/department/tasks"
                    className="text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium self-start bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Tasks</span>
                </Link>
                <div className="flex justify-between items-end mt-4 px-1 gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight flex-1">Manage Bounty</h1>
                    <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase shadow-sm flex-shrink-0 ${
                        task.status === 'completed' || task.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        task.status === 'disputed' ? 'bg-red-100 text-red-600' :
                        task.status === 'pending_confirmation' ? 'bg-amber-100 text-amber-700' :
                        'bg-secondary/10 text-secondary'
                    }`}>
                        {task.status.replace(/_/g, " ")}
                    </div>
                </div>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm font-bold shadow-sm">{error}</div>}
            {successMsg && <div className="p-4 text-green-700 bg-green-100 border border-green-200 rounded-xl text-sm font-bold shadow-sm">{successMsg}</div>}

            {/* Bank Details Card (shown after confirm) */}
            {bankDetails && (
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><CheckCircle size={100} /></div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                        <CheckCircle size={20} /> Please send ₦{task.reward_amount} to the student
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                        <div className="bg-black/10 rounded-xl p-3">
                            <p className="text-green-100 text-xs mb-1">Bank Name</p>
                            <p className="font-bold text-white text-sm">{bankDetails.bank_name}</p>
                        </div>
                        <div className="bg-black/10 rounded-xl p-3">
                            <p className="text-green-100 text-xs mb-1">Account Number</p>
                            <p className="font-mono font-bold text-white text-sm">{bankDetails.account_number}</p>
                        </div>
                        <div className="bg-black/10 rounded-xl p-3 col-span-1 sm:col-span-2">
                            <p className="text-green-100 text-xs mb-1">Account Name</p>
                            <p className="font-bold text-white text-sm">{bankDetails.account_name}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Details Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">{task.title}</h2>

                {/* Meta row */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                        <Calendar size={13} />
                        {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">
                        ₦{task.reward_amount}
                    </span>
                    {assignment && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                            <User size={13} /> {studentName}
                        </span>
                    )}
                </div>

                {/* Student details if assigned */}
                {assignment && (studentMatric || studentLevel || studentPhone) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {studentMatric && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                                <Hash size={12} /> {studentMatric}
                            </span>
                        )}
                        {studentLevel && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                                <GraduationCap size={12} /> {studentLevel}
                            </span>
                        )}
                        {studentPhone && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                                <Phone size={12} /> {studentPhone}
                            </span>
                        )}
                    </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-sm text-slate-700 mb-2">Task Instructions</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
            </div>

            {/* Submission Status + Actions */}
            <h3 className="font-bold text-lg text-slate-800 px-1 mt-2">Submission Status</h3>

            {task.status === "open" ? (
                <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-sm border border-slate-100">
                    <CheckSquare size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium text-lg">No student has claimed this task yet.</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs">When a student accepts and submits, it will appear here.</p>
                </div>

            ) : task.status === "in_progress" || task.status === "accepted" ? (
                <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-sm border border-slate-100">
                    <CheckSquare size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium text-lg">{studentName} has accepted and is working on this.</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs">When they submit their work, it will appear here for you to review.</p>
                </div>

            ) : task.status === "pending_confirmation" ? (
                <div className="bg-amber-50 rounded-3xl p-6 shadow-sm border border-amber-200">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <CheckCircle size={32} className="text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{studentName} submitted their work!</h3>
                        <p className="text-slate-600 text-sm">Review their submission below. If satisfactory, confirm to release payment.</p>
                    </div>

                    {/* ── Submission Evidence (text only) ── */}
                    {submissionNotes && (
                        <div className="bg-white rounded-2xl p-5 border border-amber-200 mb-6">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <FileText size={12} /> Student Submission Notes
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{submissionNotes}</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <button
                            onClick={handleRaiseDispute}
                            disabled={actionLoading}
                            className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all border border-slate-200 disabled:opacity-70 active:scale-[0.98]"
                        >
                            <AlertTriangle size={18} className="text-red-500" />
                            Raise Dispute
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={actionLoading}
                            className="flex-[2] flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : "Confirm & Pay Student"}
                        </button>
                    </div>
                </div>

            ) : task.status === 'disputed' ? (
                /* ── Hybrid Dispute System: Dept Evidence Submission ── */
                <div className="bg-red-50 rounded-3xl p-6 shadow-sm border border-red-200">
                    <div className="flex flex-col items-center text-center mb-5">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-red-500">
                            <AlertTriangle size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">Dispute Raised</h3>
                        <p className="text-slate-600 text-sm max-w-sm">
                            This task is under dispute. As the task poster, you can submit your evidence below.
                            Once you respond, the case moves to Admin review.
                        </p>
                    </div>

                    {!showDisputeResponse ? (
                        <button
                            onClick={() => setShowDisputeResponse(true)}
                            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-300 text-red-600 font-bold py-3.5 rounded-xl hover:bg-red-100 transition-all active:scale-[0.98]"
                        >
                            <MessageSquare size={18} />
                            Submit Department Evidence
                        </button>
                    ) : (
                        <form onSubmit={handleDisputeResponse} className="flex flex-col gap-4 mt-2">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                                    Your Evidence / Response
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    placeholder="Describe your position. Include details that support your case — what was agreed, what was delivered, etc."
                                    value={deptResponse}
                                    onChange={(e) => setDeptResponse(e.target.value)}
                                    className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-300/50 transition-all font-medium text-slate-800 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDisputeResponse(false)}
                                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={respondingToDispute || !deptResponse.trim()}
                                    className="flex-[2] flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70 active:scale-[0.98]"
                                >
                                    {respondingToDispute ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Submit Evidence</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            ) : task.status === 'completed' || task.status === 'confirmed' ? (
                /* ── Task completed (possibly after dispute) ── */
                <div className={`rounded-3xl p-6 shadow-sm border-2 ${
                    taskDispute?.resolution_decision === 'student'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-green-50 border-green-200'
                }`}>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className={`p-4 rounded-full ${
                            taskDispute?.resolution_decision === 'student'
                                ? 'bg-orange-100 text-orange-500'
                                : 'bg-green-100 text-green-500'
                        }`}>
                            <CheckCircle size={36} />
                        </div>
                        {taskDispute?.resolution_decision === 'student' ? (
                            <>
                                <h3 className="text-xl font-bold text-orange-800">Dispute Resolved — Student Paid</h3>
                                <p className="text-sm text-orange-700 max-w-sm leading-relaxed">
                                    Admin reviewed the dispute and ruled in favour of the student.
                                    <strong> ₦{Number(task.reward_amount || 0).toLocaleString()} was released to the student&apos;s wallet.</strong>
                                </p>
                                {taskDispute.admin_notes && (
                                    <div className="bg-orange-100 rounded-xl p-3 flex gap-2 items-start text-left w-full mt-2">
                                        <MessageSquareText size={13} className="flex-shrink-0 mt-0.5 text-orange-600" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-0.5">Admin Notes</p>
                                            <p className="text-xs text-orange-800 leading-relaxed">{taskDispute.admin_notes}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-green-800">Task Completed</h3>
                                <p className="text-sm text-green-700 max-w-sm">
                                    This task has been successfully confirmed and completed.
                                </p>
                            </>
                        )}
                    </div>
                </div>

            ) : task.status === 'cancelled' ? (
                /* ── Task cancelled (possibly after dispute) ── */
                <div className={`rounded-3xl p-6 shadow-sm border-2 ${
                    taskDispute?.resolution_decision === 'department'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                }`}>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className={`p-4 rounded-full ${
                            taskDispute?.resolution_decision === 'department'
                                ? 'bg-emerald-100 text-emerald-500'
                                : 'bg-slate-100 text-slate-400'
                        }`}>
                            <AlertTriangle size={36} />
                        </div>
                        {taskDispute?.resolution_decision === 'department' ? (
                            <>
                                <h3 className="text-xl font-bold text-emerald-800">Dispute Resolved — Dept. Favoured ✅</h3>
                                <p className="text-sm text-emerald-700 max-w-sm leading-relaxed">
                                    Admin reviewed the dispute and ruled in your favour.
                                    This task has been cancelled and no payment was made to the student.
                                </p>
                                {taskDispute.admin_notes && (
                                    <div className="bg-emerald-100 rounded-xl p-3 flex gap-2 items-start text-left w-full mt-2">
                                        <MessageSquareText size={13} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5">Admin Notes</p>
                                            <p className="text-xs text-emerald-800 leading-relaxed">{taskDispute.admin_notes}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-slate-700">Task Cancelled</h3>
                                <p className="text-sm text-slate-500 max-w-sm">This task has been cancelled.</p>
                            </>
                        )}
                    </div>
                </div>

            ) : (
                <div className="bg-slate-50 rounded-3xl p-8 text-center flex flex-col items-center border border-slate-200">
                    <p className="text-slate-600 font-bold text-lg uppercase">{task.status.replace(/_/g, " ")}</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs">This task is no longer active.</p>
                </div>
            )}
        </div>
    );
}
