"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, CalendarClock, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { submitTask, getStudentAssignments } from "@/lib/api";

export default function MyBountiesPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submittingId, setSubmittingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    const fetchAssignments = async () => {
        try {
            const res = await getStudentAssignments();
            const allAssignments = Array.isArray(res.data) ? res.data : 
                             Array.isArray(res.results) ? res.results : 
                             Array.isArray(res) ? res : [];
            setAssignments(allAssignments);
        } catch (err) {
            setError(`API Error: ${err.message || 'Failed to fetch assignments'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleSubmit = async (taskId) => {
        setSubmittingId(taskId);
        setError("");
        setSuccessMsg("");

        try {
            await submitTask(taskId);
            setSuccessMsg("Task submitted successfully for review!");
            fetchAssignments();
        } catch (err) {
            setError(err.message || "Failed to submit work.");
        } finally {
            setSubmittingId(null);
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
                        const displayStatus = assignment.status; // status is on the assignment

                        return (
                        <div key={assignment.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-2 h-full ${displayStatus === 'completed' || displayStatus === 'confirmed' ? 'bg-green-500' : 'bg-primary'}`} />

                            <div className="pl-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight pr-4">{task.title || "Task Documented"}</h3>
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase ${displayStatus === 'completed' || displayStatus === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-primary'}`}>
                                        {displayStatus.replace("_", " ")}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Briefcase size={14} className="text-slate-400" />
                                    <span className="text-sm font-medium text-slate-500">{task.department_name || "Department"}</span>
                                </div>

                                <p className="text-sm text-slate-600 mb-4">{task.description}</p>

                                <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center mt-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <CalendarClock size={16} />
                                        <span className="text-xs font-semibold">Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "TBD"}</span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-800">₦{task.reward_amount}</p>
                                </div>

                                {(displayStatus === 'in_progress' || displayStatus === 'accepted') && (
                                    <button
                                        onClick={() => handleSubmit(task.id)}
                                        disabled={submittingId === task.id}
                                        className="w-full flex justify-center items-center gap-2 mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                                        {submittingId === task.id ? <Loader2 size={18} className="animate-spin" /> : "Submit Work for Review"}
                                    </button>
                                )}

                                {displayStatus === 'submitted' || displayStatus === 'pending_confirmation' ? (
                                    <div className="w-full mt-4 bg-amber-50 text-amber-700 font-bold py-3 px-4 rounded-xl text-center text-sm border border-amber-200">
                                        Waiting for Department to Confirm
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )})
                ) : (
                    <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-sm">
                        <CheckCircle size={40} className="text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold text-lg">You haven't accepted any bounties yet.</p>
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
