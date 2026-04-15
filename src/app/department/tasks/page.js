"use client";
import { useEffect, useState } from "react";
import { PlusCircle, Search, Calendar, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { getDeptTasks, getDepartmentAssignments } from "@/lib/api";

export default function DepartmentTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTasks = async () => {
        try {
            const res = await getDeptTasks();
             // Standardize the shape across different Django Rest Framework configs
            const fetchedTasks = Array.isArray(res.data) ? res.data : 
                                 Array.isArray(res.results) ? res.results : 
                                 Array.isArray(res) ? res : [];
            setTasks(fetchedTasks || []);

            try {
                const assignRes = await getDepartmentAssignments();
                const allA = Array.isArray(assignRes.data) ? assignRes.data : 
                             Array.isArray(assignRes.results) ? assignRes.results : 
                             Array.isArray(assignRes) ? assignRes : [];
                setAssignments(allA);
            } catch (assignErr) {
                console.error("Failed to fetch assignments:", assignErr);
            }

        } catch (err) {
            setError(`Failed to fetch tasks: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter(task => 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || ""
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Your Bounties</h1>
                    <p className="text-sm text-slate-500">Manage all the tasks you have posted.</p>
                </div>
                <Link
                    href="/department/create"
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
                >
                    <PlusCircle size={20} />
                    <span>Create Bounty</span>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by title..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-700 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm font-bold shadow-sm">
                    {error}
                </div>
            )}

            {/* Tasks List */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex items-center gap-2 text-slate-500 bg-white p-6 rounded-3xl justify-center shadow-sm">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="font-semibold text-sm">Loading tasks...</span>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl text-center border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <Search size={24} />
                        </div>
                        <p className="text-slate-500 font-bold text-lg mb-1">No bounties found.</p>
                        <p className="text-slate-400 text-sm max-w-sm">Try adjusting your search criteria or create a new task to get started.</p>
                    </div>
                ) : (
                    filteredTasks.map((bounty) => {
                        const activeAssign = assignments.find(a => String(a.task_details?.id) === String(bounty.id));
                        const studentName = activeAssign?.student_details?.user?.full_name || activeAssign?.student_details?.username || "A Student";

                        return (
                        <div key={bounty.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            {bounty.status === "open" || bounty.status === "in_progress" || bounty.status === "accepted" || bounty.status === "pending_confirmation" ? (
                                <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                                    {bounty.status.replace('_', ' ')}
                                </div>
                            ) : (
                                <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                                    {bounty.status.replace('_', ' ')}
                                </div>
                            )}

                            <div className="pr-12 mb-4">
                                <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{bounty.title}</h3>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                                        <Users size={16} className="text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">
                                            Student: {bounty.status === "open" ? "Unassigned" : studentName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                                        <Calendar size={16} />
                                        <span className="text-sm font-semibold text-slate-700">{new Date(bounty.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <div>
                                        <p className="text-secondary font-bold text-lg leading-none">₦{bounty.reward_amount}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Reward</p>
                                    </div>
                                    
                                    <Link 
                                        href={`/department/tasks/${bounty.id}`}
                                        className="h-10 px-5 rounded-xl border-2 border-primary/20 text-primary font-bold flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                    >
                                        Manage
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )})
                )}
            </div>
        </div>
    );
}
