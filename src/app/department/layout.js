import DeptBottomNav from "@/components/DeptBottomNav";

export default function DepartmentLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 relative">
            <div className="w-full h-full p-4 pb-24 md:p-8 md:pb-10">
                {children}
            </div>
            <DeptBottomNav />
        </div>
    );
}
