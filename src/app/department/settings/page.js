"use client";

import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/lib/api";

export default function DepartmentSettingsPage() {
    const [fullName, setFullName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                if (res.data) {
                    setFullName(res.data.user?.full_name || res.data.full_name || "");
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMsg("");

        try {
            await updateProfile({
                full_name: fullName
            });
            setSuccessMsg("Department Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Failed to update profile details.");
        } finally {
            setSaving(false);
        }
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
                <Link href="/department/profile" className="absolute left-0 text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">Department Settings</h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center">{error}</div>}
            {successMsg && <div className="p-4 text-green-700 bg-green-100 rounded-xl text-sm text-center flex items-center justify-center gap-2"><CheckCircle2 size={16} /> {successMsg}</div>}

            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
                <div>
                    <h2 className="text-sm font-bold text-secondary uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Organization Detail Updates</h2>
                    <p className="text-xs text-slate-500 mb-4 font-medium">Update the name visible to the students dynamically.</p>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 px-1">Display Name / Title</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Faculty of Science"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        disabled={saving}
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>

            <div className="bg-red-50 rounded-3xl p-6 border border-red-200 mt-2 flex flex-col gap-4">
                <div>
                    <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide border-b border-red-200/50 pb-2 mb-2">Danger Zone</h2>
                    <p className="text-xs text-red-500 font-medium">
                        Permanently delete your department account. This action cannot be undone and will void all existing tasks.
                    </p>
                </div>
                <button
                    onClick={async () => {
                        if (confirm("Are you absolutely sure you want to delete your department account? This action is permanent!")) {
                            setSaving(true);
                            setError("");
                            try {
                                const profileRes = await getProfile();
                                const userId = profileRes.data?.user?.id || profileRes.data?.user?.pk || profileRes.data?.id;
                                if (!userId) throw new Error("Could not find user ID to delete");
                                await import("@/lib/api").then(api => api.deleteUser(userId));
                                await import("@/lib/api").then(api => api.logout());
                                window.location.href = "/";
                            } catch (err) {
                                setError(err.message || "Failed to delete account. You might need admin privileges.");
                                setSaving(false);
                            }
                        }
                    }}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-500 text-red-600 font-bold py-3.5 rounded-xl transition-all border-2 border-red-200 hover:text-white hover:border-red-500 active:scale-[0.98] disabled:opacity-75"
                >
                    Delete Department Account
                </button>
            </div>
        </div>
    );
}
