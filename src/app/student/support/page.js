"use client";

import { ArrowLeft, HelpCircle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { faqData } from "@/lib/demoData";

export default function SupportPage() {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex items-center relative py-2 mb-2">
                <Link href="/student/dashboard" className="absolute left-0 text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </Link>
                <h1 className="text-xl font-bold text-slate-800 mx-auto flex items-center gap-2">
                    <HelpCircle size={20} className="text-primary" />
                    Support & FAQ
                </h1>
            </header>

            {/* Contact Support Button */}
            <div className="bg-primary hover:bg-primary-hover transition-colors rounded-3xl p-6 text-white shadow-md shadow-primary/20 flex items-center justify-between cursor-pointer active:scale-[0.98]">
                <div>
                    <h2 className="text-lg font-bold mb-1">Need direct help?</h2>
                    <p className="text-primary-100 text-sm font-medium text-white/80">Chat with the CampusGig Support Team</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                    <MessageSquare size={24} className="text-white" />
                </div>
            </div>

            <div className="mt-2">
                <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Frequently Asked Questions</h2>

                <div className="flex flex-col gap-3">
                    {faqData.map((faq, index) => {
                        const isOpen = openFaqIndex === index;

                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex justify-between items-center p-5 text-left active:bg-slate-50 transition-colors"
                                >
                                    <p className="font-semibold text-slate-700 pr-4">{faq.question}</p>
                                    {isOpen ? (
                                        <ChevronUp size={20} className="text-primary flex-shrink-0" />
                                    ) : (
                                        <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />
                                    )}
                                </button>

                                <div
                                    className={`px-5 text-slate-500 text-sm leading-relaxed transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                                        }`}
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
