"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, PlusCircle, Building2 } from "lucide-react";

export default function DeptBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: "Dashboard", href: "/department/dashboard", icon: LayoutDashboard },
        { label: "Bounties",  href: "/department/tasks",     icon: Target },
        { label: "Create",    href: "/department/create",    icon: PlusCircle },
        { label: "Profile",   href: "/department/profile",   icon: Building2 },
    ];

    return (
        <nav
            aria-label="Department navigation"
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            <div className="flex justify-around items-center px-2 py-2 max-w-5xl mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
                                isActive ? "text-secondary" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-secondary/10" : "bg-transparent"}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] leading-none ${isActive ? "font-bold text-secondary" : "font-medium"}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
