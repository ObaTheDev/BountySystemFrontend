"use client";

import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getProfile, updateBankDetails } from "@/lib/api";

export default function StudentSettingsPage() {
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                if (res.data) {
                    setBankName(res.data.bank_name || "");
                    setAccountNumber(res.data.account_number || "");
                    setAccountName(res.data.account_name || "");
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
            await updateBankDetails({
                bank_name: bankName,
                account_number: accountNumber,
                account_name: accountName
            });
            setSuccessMsg("Bank details updated successfully!");
        } catch (err) {
            setError(err.message || "Failed to update bank details.");
        } finally {
            setSaving(false);
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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/student/profile" className="absolute left-0 text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">Settings</h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center">{error}</div>}
            {successMsg && <div className="p-4 text-green-700 bg-green-100 rounded-xl text-sm text-center flex items-center justify-center gap-2"><CheckCircle2 size={16} /> {successMsg}</div>}

            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
                <div>
                    <h2 className="text-sm font-bold text-primary uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Payout Information (Bank Details)</h2>
                    <p className="text-xs text-slate-500 mb-4 font-medium">Enter your bank details carefully. Departments will use this to disburse rewards when your task submissions are confirmed.</p>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 px-1">Bank Name</label>
                            <input
                                type="text"
                                required
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="e.g. Guarantee Trust Bank"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-800"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 px-1">Account Number</label>
                            <input
                                type="text"
                                required
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="e.g. 0123456789"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-800"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 px-1">Account Name</label>
                            <input
                                type="text"
                                required
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        disabled={saving}
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Bank Details</>}
                    </button>
                </div>
            </form>

            <div className="bg-red-50 rounded-3xl p-6 border border-red-200 mt-2 flex flex-col gap-4">
                <div>
                    <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide border-b border-red-200/50 pb-2 mb-2">Danger Zone</h2>
                    <p className="text-xs text-red-500 font-medium">
                        Permanently delete your account. This action cannot be undone and you will lose access to all your earnings and tasks.
                    </p>
                </div>
                <button
                    onClick={async () => {
                        if (confirm("Are you absolutely sure you want to delete your account? This action is permanent!")) {
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
                    Delete My Account
                </button>
            </div>
        </div>
    );
}
