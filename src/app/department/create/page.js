"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createTask, getProfile } from "@/lib/api";

export default function CreateBountyPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rewardAmount, setRewardAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [postedBy, setPostedBy] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                const profileData = res.data;
                const userId = profileData?.user?.id || profileData?.user?.pk || profileData?.id || profileData?.pk;
                setPostedBy(userId);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await createTask({
                title,
                description,
                reward_amount: parseFloat(rewardAmount),
                deadline: new Date(deadline).toISOString(),
                posted_by: postedBy
            });
            setSuccess("Bounty published successfully!");
            setTitle("");
            setDescription("");
            setRewardAmount("");
            setDeadline("");
        } catch (err) {
            setError(err.message || "Failed to publish bounty");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2">
                <Link href="/department/dashboard" className="absolute left-0 text-slate-500 hover:text-secondary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto">Create Bounty</h1>
            </header>

            {error && <div className="p-4 text-red-600 bg-red-100 rounded-xl text-sm text-center">{error}</div>}
            {success && <div className="p-4 text-green-700 bg-green-100 rounded-xl text-sm text-center flex justify-center items-center gap-2"><CheckCircle2 size={16} /> {success}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
                {/* Basic Details */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">Bounty Details</h2>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 px-1">Task Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Campus Event Ushering"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium text-slate-800"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 px-1">Description <span className="text-red-500">*</span></label>
                        <textarea
                            rows="4"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what the students need to do..."
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium text-slate-800 resize-none"
                        />
                    </div>
                </div>

                {/* Budget and Constraints */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">Budget & Deadline</h2>

                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-xs font-semibold text-slate-500 px-1">Reward (₦) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                value={rewardAmount}
                                onChange={(e) => setRewardAmount(e.target.value)}
                                placeholder="2000"
                                min="0"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-bold text-secondary"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-xs font-semibold text-slate-500 px-1">Deadline <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                required
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-bold text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Link href="/department/dashboard" className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        Cancel
                    </Link>

                    <button disabled={loading} type="submit" className="flex-[2] disabled:opacity-75 disabled:cursor-not-allowed bg-secondary hover:bg-indigo-600 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-secondary/30 flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Publish Bounty</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
