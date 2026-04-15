"use client";
import { useState } from "react";
import { BriefcaseBusiness, Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { login, register, logout } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [isAdminView, setIsAdminView] = useState(false);

    // Shared fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Register-only fields
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("student");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (isLogin || isAdminView) {
                const res = await login(email, password);
                const userRole = res.data?.role || "student";
                
                if (isAdminView && userRole !== "admin") {
                    await logout();
                    throw new Error("Access Denied: You do not have administrator privileges.");
                }
                
                router.push(`/${userRole}/dashboard`);
            } else {
                await register({
                    email,
                    password,
                    full_name: fullName,
                    role,
                    ...(phoneNumber ? { phone_number: phoneNumber } : {}),
                });
                // Auto-login after successful registration
                const res = await login(email, password);
                const userRole = res.data?.role || "student";
                router.push(`/${userRole}/dashboard`);
            }
        } catch (err) {
            setError(err.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm outline-none focus:ring-2 transition-all placeholder:text-slate-400 " + 
        (isAdminView ? "focus:border-red-500 focus:ring-red-500/20" : "focus:border-primary focus:ring-primary/20");

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className={`absolute top-[-10%] left-[-10%] w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-50 pointer-events-none transition-colors duration-700 ${isAdminView ? 'bg-red-500/20' : 'bg-primary/20'}`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-50 pointer-events-none transition-colors duration-700 ${isAdminView ? 'bg-orange-500/20' : 'bg-secondary/20'}`} />

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl w-full max-w-sm flex flex-col items-center z-10 transition-all duration-500">
                {/* Logo */}
                <div className={`${isAdminView ? 'bg-red-500 shadow-red-500/30' : 'bg-primary shadow-primary/30'} text-white p-4 rounded-2xl mb-5 shadow-md transition-colors duration-500`}>
                    {isAdminView ? <ShieldAlert size={36} /> : <BriefcaseBusiness size={36} />}
                </div>

                <h1 className="text-3xl font-bold text-slate-800 tracking-tight transition-all">
                    {isAdminView ? "Admin Access" : "CampusGig"}
                </h1>
                <p className="text-slate-500 text-sm mb-6 text-center font-medium mt-1 transition-all">
                    {isAdminView ? "Secure Tribunal Portal" : "University Micro-Task Platform"}
                </p>

                {/* Conditional Header View */}
                {isAdminView ? (
                    <div className="w-full mb-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-full bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-center text-sm font-bold">
                            Restricted: Enter your administrator credentials.
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex bg-slate-100 rounded-2xl p-1 mb-6 animate-in fade-in zoom-in-95 duration-300">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(""); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${isLogin ? "bg-white shadow text-primary" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(""); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${!isLogin ? "bg-white shadow text-primary" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Register
                        </button>
                    </div>
                )}

                {error && (
                    <div className="w-full bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col w-full gap-3">
                    {/* Register-only fields */}
                    {!isLogin && !isAdminView && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name (or Department Name)"
                                className={inputClass}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                autoComplete="name"
                            />
                            <select
                                className={inputClass}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="department">Department</option>
                            </select>
                            <input
                                type="tel"
                                placeholder="Phone Number (optional)"
                                className={inputClass}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                autoComplete="tel"
                            />
                        </>
                    )}

                    {/* Shared fields */}
                    <input
                        type="email"
                        placeholder="Email Address"
                        className={inputClass}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete={isLogin || isAdminView ? "username" : "email"}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={`${inputClass} pr-12`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isLogin || isAdminView ? "current-password" : "new-password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 text-white py-3.5 rounded-2xl font-semibold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2 active:scale-95 ${
                            isAdminView ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" : "bg-primary hover:bg-primary-hover shadow-primary/20"
                        }`}
                    >
                        {loading
                            ? <Loader2 size={20} className="animate-spin" />
                            : (isAdminView ? "Login as Admin" : (isLogin ? "Login" : "Create Account"))}
                    </button>
                </form>

                {/* Admin Mode Toggler */}
                {!isAdminView ? (
                    <button
                        type="button"
                        onClick={() => { setIsAdminView(true); setIsLogin(true); setError(""); }}
                        className="text-[10px] uppercase tracking-wider font-bold text-slate-300 hover:text-red-400 transition-colors mt-8 bg-transparent border-none cursor-pointer"
                    >
                        Access Admin Tribunal
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => { setIsAdminView(false); setError(""); }}
                        className="text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-600 transition-colors mt-8 bg-transparent border-none cursor-pointer"
                    >
                        Return to Main Portal
                    </button>
                )}
            </div>
        </div>
    );
}
