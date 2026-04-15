"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Trophy, Medal, Loader2, Award } from "lucide-react";
import Link from "next/link";
import { getStudentDashboard, getStudentAssignments, getProfile } from "@/lib/api";

export default function LeaderboardPage() {
    // No leaderboard API exists — we show contextual stats for the logged-in student
    // and keep the visual design intact with live data where possible.
    const [profile, setProfile] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [completedCount, setCompletedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profRes, dashRes, assignRes] = await Promise.all([
                    getProfile(),
                    getStudentDashboard(),
                    getStudentAssignments(),
                ]);
                setProfile(profRes.data);
                setDashboard(dashRes.data);

                const allA = Array.isArray(assignRes.data) ? assignRes.data :
                    Array.isArray(assignRes.results) ? assignRes.results :
                        Array.isArray(assignRes) ? assignRes : [];
                const done = allA.filter(a =>
                    a.status === "completed" || a.status === "confirmed"
                );
                setCompletedCount(done.length);
            } catch (err) {
                console.error("Leaderboard data error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const myName = profile?.user?.full_name || profile?.full_name || "You";
    const totalEarned = dashboard?.total_earned ?? "0.00";

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/student/dashboard" className="absolute left-0 text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-500" />
                    Leaderboard
                </h1>
            </header>

            {/* Top Graphic */}
            <div className="bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-[2rem] p-8 text-white shadow-xl shadow-yellow-500/20 relative overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/20 rounded-full blur-2xl" />
                <Medal size={64} className="mb-4 drop-shadow-md text-yellow-100" />
                <h2 className="text-2xl font-black tracking-tight drop-shadow-sm mb-1">Campus Top Earners</h2>
                <p className="text-yellow-100 font-medium">Rankings based on total bounties completed</p>
            </div>

            {/* My Stats Card */}
            {loading ? (
                <div className="flex h-32 items-center justify-center">
                    <Loader2 size={36} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-primary/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                        {myName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{myName} <span className="text-xs text-primary font-semibold">(You)</span></p>
                        <p className="text-xs text-slate-500 font-medium">{completedCount} bounties completed</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-primary">₦{totalEarned}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Earned</p>
                    </div>
                </div>
            )}

            {/* Leaderboard info note */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Award size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 font-medium leading-relaxed">
                    A full campus leaderboard will be available once more students complete bounties. Your personal stats are shown above based on live data.
                </p>
            </div>
        </div>
    );
}
