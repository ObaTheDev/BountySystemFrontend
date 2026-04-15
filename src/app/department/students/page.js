"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Search, Users, Loader2, Award } from "lucide-react";
import Link from "next/link";
import { getDepartmentAssignments } from "@/lib/api";

export default function FindStudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await getDepartmentAssignments();
                const allAssignments = Array.isArray(res.data) ? res.data :
                    Array.isArray(res.results) ? res.results :
                        Array.isArray(res) ? res : [];

                // Deduplicate by student id so each student appears once
                const seen = new Set();
                const unique = [];
                for (const a of allAssignments) {
                    const sid = a.student_details?.id || a.student_details?.user?.id;
                    if (sid && !seen.has(sid)) {
                        seen.add(sid);
                        unique.push(a);
                    }
                }
                setStudents(unique);
            } catch (err) {
                setError(err.message || "Failed to load student directory.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filtered = students.filter((a) => {
        const name = (a.student_details?.user?.full_name || "").toLowerCase();
        const matric = (a.student_details?.matric_number || "").toLowerCase();
        const q = searchQuery.toLowerCase();
        return name.includes(q) || matric.includes(q);
    });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/department/dashboard" className="absolute left-0 text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto flex items-center gap-2">
                    <Users size={20} className="text-secondary" />
                    Student Directory
                </h1>
            </header>

            <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or matric number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-2xl outline-none transition-all shadow-sm font-medium text-slate-800"
                />
            </div>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center font-medium">{error}</div>}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-secondary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-sm border border-slate-100">
                    <Users size={40} className="text-slate-300 mb-4" />
                    <p className="text-slate-600 font-bold text-lg">
                        {searchQuery ? "No students match your search." : "No students have worked on your tasks yet."}
                    </p>
                    <p className="text-slate-400 text-sm mt-2 max-w-xs">
                        Students who accept your bounties will appear here.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((a, i) => {
                        const name = a.student_details?.user?.full_name || "Unknown Student";
                        const matric = a.student_details?.matric_number || "";
                        const level = a.student_details?.level || "";
                        const taskTitle = a.task_details?.title || "Task";
                        const status = a.status || "";
                        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

                        return (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 bg-indigo-50 text-secondary rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate">{name}</h3>
                                        <p className="text-xs text-slate-500 font-medium truncate">
                                            {matric && `${matric} · `}{level && `${level} · `}
                                        </p>
                                        <p className="text-xs text-secondary font-semibold truncate flex items-center gap-1 mt-0.5">
                                            <Award size={11} />
                                            {taskTitle} — <span className="uppercase">{status.replace(/_/g, " ")}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
