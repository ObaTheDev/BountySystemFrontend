import BottomNav from "@/components/BottomNav";

export default function StudentLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Bottom nav height: ~72px. Add extra safe-area padding on notched phones. */}
            <div className="w-full h-full p-4 pb-24 md:p-8 md:pb-10">
                {children}
            </div>
            <BottomNav />
        </div>
    );
}
