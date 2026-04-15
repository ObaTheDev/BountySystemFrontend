"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Loader2, CheckCircle2, SearchX } from "lucide-react";
import Link from "next/link";
import { getOpenTasks, acceptTask } from "@/lib/api";

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acceptingId, setAcceptingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    const fetchTasks = async () => {
        try {
            const res = await getOpenTasks();
            const responseData = res.data || res.results || [];
            setTasks(Array.isArray(responseData) ? responseData : (responseData.results || []));
            setError("");
        } catch (err) {
            setError(err.message || "Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAccept = async (id) => {
        setAcceptingId(id);
        setError("");
        setSuccessMsg("");
        try {
            await acceptTask(id);
            setSuccessMsg("Task accepted successfully!");
            if (typeof window !== "undefined") {
                localStorage.setItem("activeTaskId", id);
            }
            // Refresh tasks
            fetchTasks();
        } catch (err) {
            setError(err.message || "Could not accept task.");
        } finally {
            setAcceptingId(null);
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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center relative py-2">
                <Link href="/student/dashboard" className="absolute left-0 text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">Available Tasks</h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center">{error}</div>}
            {successMsg && <div className="p-4 text-green-700 bg-green-100 rounded-xl text-sm text-center flex items-center justify-center gap-2"><CheckCircle2 size={16} /> {successMsg}</div>}

            <div className="flex flex-col gap-4 mt-4">
                {tasks.length === 0 ? (
                    <div className="bg-white rounded-3xl p-6 md:p-10 mt-4 text-center flex flex-col items-center justify-center shadow-sm border border-slate-100 mx-px">
                        <div className="bg-slate-50 text-slate-300 p-6 rounded-full mb-4 ring-8 ring-slate-50/50">
                            <SearchX size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No tasks available</h3>
                        <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Check back later! Departments have not posted any new bounties yet, or they might be currently taken by other students.
                        </p>
                        <button onClick={() => fetchTasks()} className="mt-6 text-primary font-bold bg-primary/10 px-6 py-2.5 rounded-full hover:bg-primary hover:text-white transition-colors">
                            Refresh Page
                        </button>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1 font-medium pb-2">
                                        <Building2 size={14} />
                                        <span>{task.department_name || "Department"}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-primary tracking-tight">₦{task.reward_amount}</p>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Reward</span>
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                                {task.description}
                            </p>

                            <button
                                onClick={() => handleAccept(task.id)}
                                disabled={acceptingId === task.id || task.status !== 'open'}
                                className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {acceptingId === task.id ? <Loader2 size={18} className="animate-spin" /> : "Accept Task"}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
