"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Home, Map, CircleSlash } from "lucide-react";

export default function NotFound() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const handleMouseMove = (e) => {
            // Calculate normalized mouse positions (-1 to 1) for the parallax effect
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-screen bg-slate-50 overflow-hidden flex items-center justify-center font-sans">

            {/* Background Decorative Blob 1 (Far background - moves opposite to cursor slightly) */}
            <div
                className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] transition-transform duration-75 ease-out"
                style={isClient ? { transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)` } : {}}
            />

            {/* Background Decorative Blob 2 (Far background) */}
            <div
                className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] bg-secondary/20 rounded-full blur-[100px] transition-transform duration-75 ease-out"
                style={isClient ? { transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)` } : {}}
            />

            {/* Floating 404 Elements (Middle background - moves strongly with cursor) */}
            <div
                className="absolute transition-transform duration-75 ease-out z-0 pointer-events-none select-none"
                style={isClient ? { transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` } : {}}
            >
                <h1 className="text-[35vw] md:text-[25vw] font-black text-slate-200/60 tracking-tighter mix-blend-multiply">
                    404
                </h1>
            </div>

            {/* Floating Icon 1 */}
            <div
                className="absolute top-[25%] right-[20%] text-primary/30 z-0 transition-transform duration-75 ease-out"
                style={isClient ? { transform: `translate(${mousePosition.x * 80}px, ${mousePosition.y * 80}px) rotate(${mousePosition.x * 20}deg)` } : {}}
            >
                <Compass size={140} strokeWidth={1} />
            </div>

            {/* Floating Icon 2 */}
            <div
                className="absolute bottom-[20%] left-[15%] text-indigo-400/20 z-0 transition-transform duration-75 ease-out"
                style={isClient ? { transform: `translate(${mousePosition.x * -70}px, ${mousePosition.y * -70}px) rotate(${mousePosition.y * -30}deg)` } : {}}
            >
                <Map size={120} strokeWidth={1} />
            </div>

            {/* Floating Icon 3 */}
            <div
                className="absolute top-[40%] left-[25%] text-red-500/10 z-0 transition-transform duration-75 ease-out"
                style={isClient ? { transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 90}px) rotate(${mousePosition.y * 45}deg)` } : {}}
            >
                <CircleSlash size={80} strokeWidth={1.5} />
            </div>

            {/* Main Content Card (Foreground - moves opposite to cursor slightly for 3D popup effect) */}
            <div
                className="relative z-10 flex flex-col items-center justify-center p-6 w-full max-w-lg transition-transform duration-75 ease-out"
                style={isClient ? { transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)` } : {}}
            >
                {/* Glassmorphism Card */}
                <div className="bg-white/70 backdrop-blur-3xl p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white flex flex-col items-center w-full">

                    <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary text-white rounded-3xl mb-8 flex items-center justify-center shadow-lg shadow-primary/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        <Compass size={36} className="animate-[spin_6s_linear_infinite] relative z-10" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-4 text-center">
                        Lost on Campus?
                    </h2>

                    <p className="text-slate-500 text-center mb-10 text-base md:text-lg font-medium leading-relaxed">
                        We couldn't locate the page you're looking for. It looks like this task or bounty has moved, or the link is broken.
                    </p>

                    <Link
                        href="/student/dashboard"
                        className="flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95 shadow-xl shadow-primary/30 w-full group"
                    >
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Home size={18} className="transition-transform group-hover:scale-110" />
                        </div>
                        <span>Return to Dashboard</span>
                    </Link>
                </div>
            </div>

        </div>
    );
}
