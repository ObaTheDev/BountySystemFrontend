"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Mail, BadgeCheck, Settings, LogOut, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/lib/api";

export default function DepartmentProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                setProfile(res.data);
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        await logout();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={40} className="animate-spin text-secondary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/department/dashboard" className="absolute left-0 text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">Department Profile</h1>
            </header>

            {/* Department Information Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4 border-4 border-white shadow-md relative">
                    <Building2 size={40} />
                    <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 border-2 border-white">
                        <BadgeCheck size={16} />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800 text-center">
                    {profile?.user?.full_name || profile?.full_name || profile?.user?.username || "Department Node"}
                </h2>
                <p className="text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                    {profile?.user?.role || "DEPARTMENT"}
                </p>

                <div className="bg-slate-50 rounded-2xl w-full p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 text-slate-400 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
                            <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400 font-medium">Contact Email</p>
                            <p className="text-sm font-semibold text-slate-700 truncate">
                                {profile?.user?.email || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Menu */}
            <div className="flex flex-col gap-3 mt-2">
                <Link href="/department/settings" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-secondary/30 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2 text-slate-600 rounded-lg group-hover:text-secondary group-hover:bg-secondary/10 transition-colors">
                            <Settings size={20} />
                        </div>
                        <span className="font-semibold text-slate-700">Account Settings</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-secondary transition-colors" />
                </Link>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-red-500/30 transition-all group mt-2 cursor-pointer disabled:opacity-70"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                            {loggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                        </div>
                        <span className="font-semibold text-red-500">{loggingOut ? "Logging out…" : "Log Out"}</span>
                    </div>
                    <ChevronRight size={20} className="text-red-200 group-hover:text-red-500 transition-colors" />
                </button>
            </div>
        </div>
    );
}
