"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, User, Mail, Settings, LogOut, ChevronRight, Loader2, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/lib/api";

export default function ProfilePage() {
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
                console.error(err);
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
                <h1 className="text-xl font-bold text-slate-800 mx-auto">My Profile</h1>
            </header>

            {/* User Information Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border-4 border-white shadow-md">
                    <User size={40} />
                </div>

                <h2 className="text-xl font-bold text-slate-800 text-center">
                    {profile?.user?.full_name || profile?.full_name || profile?.user?.username || "Student"}
                </h2>
                <p className="text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                    {profile?.user?.role || "Student"}
                </p>

                <div className="bg-slate-50 rounded-2xl w-full p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 text-slate-400 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
                            <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400 font-medium">Email</p>
                            <p className="text-sm font-semibold text-slate-700 truncate">
                                {profile?.user?.email || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 text-slate-400 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
                            <Building size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400 font-medium">Bank Details</p>
                            {profile?.bank_name ? (
                                <p className="text-sm font-semibold text-slate-700 truncate">
                                    {profile.bank_name} — {profile.account_number}
                                </p>
                            ) : (
                                <p className="text-sm font-semibold text-red-500">Not set up</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Menu */}
            <div className="flex flex-col gap-3 mt-2">
                <Link href="/student/settings" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2 text-slate-600 rounded-lg group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                            <Settings size={20} />
                        </div>
                        <span className="font-semibold text-slate-700">Account Settings</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                </Link>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-red-500/30 transition-all group mt-2 disabled:opacity-70"
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
