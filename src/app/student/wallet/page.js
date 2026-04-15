"use client";

import { ArrowLeft, Wallet, ArrowDownCircle, X, Building, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getWalletBalance, getWalletTransactions, getProfile } from "@/lib/api";

export default function WalletPage() {
    const [balanceData, setBalanceData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // For withdraw modal
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawStatus, setWithdrawStatus] = useState("idle");

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const [balRes, trxRes, profRes] = await Promise.all([
                    getWalletBalance(),
                    getWalletTransactions(),
                    getProfile()
                ]);
                setBalanceData(balRes.data);
                setTransactions(trxRes.data || []);
                setProfile(profRes.data);
            } catch (err) {
                setError("Failed to load wallet data");
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    const handleWithdraw = (e) => {
        e.preventDefault();
        setWithdrawStatus("processing");

        setTimeout(() => {
            setWithdrawStatus("success");
            setTimeout(() => {
                setIsWithdrawModalOpen(false);
                setWithdrawStatus("idle");
            }, 2000);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/student/dashboard" className="absolute left-0 text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">My Wallet</h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center">{error}</div>}

            <div className="bg-gradient-to-br from-primary to-secondary rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 opacity-90">
                        <Wallet size={20} />
                        <span className="text-sm font-medium">Total Lifetime Earnings</span>
                    </div>

                    <p className="text-5xl font-bold mb-8 tracking-tight">₦{balanceData?.total_earned || "0.00"}</p>

                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-medium py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <ArrowDownCircle size={20} />
                        View Payout Details
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="mt-4 pb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Recent Transactions</h2>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                    {transactions.length > 0 ? (
                        transactions.map((trx) => (
                            <div key={trx.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${trx.type === 'credit' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                        <Wallet size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{trx.description}</p>
                                        <p className="text-xs text-slate-400 font-medium">{new Date(trx.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold ${trx.type === 'credit' ? 'text-green-500' : 'text-slate-700'}`}>
                                    {trx.type === 'credit' ? '+' : '-'}₦{trx.amount}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center gap-3 py-8">
                            <div className="bg-slate-50 p-4 rounded-full text-slate-400">
                                <Wallet size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">No recent transactions</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal Overlay */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Payout Information</h3>
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                            Note: Payouts are made directly to your bank account by the department upon task completion. CampusGig records your lifetime earnings.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex justify-between items-start flex-col gap-2">
                            <span className="text-slate-500 font-medium text-sm">Your Payment Details</span>
                            <div className="flex flex-col text-slate-800 font-bold text-sm bg-white p-3 rounded-xl border border-slate-200 w-full">
                                {profile?.bank_name ? (
                                    <>
                                        <div className="text-primary flex items-center gap-2"><Building size={16} /> {profile.bank_name}</div>
                                        <div className="text-sm text-slate-600">{profile.account_number}</div>
                                        <div className="text-sm text-slate-600">{profile.account_name}</div>
                                    </>
                                ) : (
                                    <span className="text-red-500">Bank details not set up yet. Please update in profile.</span>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
