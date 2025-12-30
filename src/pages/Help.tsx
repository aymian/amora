import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HelpCircle,
    MessageSquare,
    User,
    Mail,
    Send,
    Loader2,
    CheckCircle2,
    Sparkles,
    ArrowLeft,
    Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const Help = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.contact || !formData.message) {
            toast.error("Protocol Error: Missing required information.");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "help_requests"), {
                ...formData,
                status: 'pending',
                createdAt: serverTimestamp(),
                source: 'web_help_page'
            });

            setSubmitted(true);
            toast.success("Intelligence Transmission Successful: Our team will analyze your request.");
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error("Transmission Failure: Neural link unstable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#e9c49a]/[0.03] blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/[0.03] blur-[120px] rounded-full -ml-40 -mb-40 pointer-events-none" />

            <header className="h-20 flex items-center justify-between px-10 relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <Logo className="h-6 opacity-80" />
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-14 space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-[2rem] bg-[#e9c49a]/10 border border-[#e9c49a]/20 flex items-center justify-center mb-6">
                                        <HelpCircle className="w-8 h-8 text-[#e9c49a]" />
                                    </div>
                                    <h1 className="text-4xl font-display font-light tracking-tight">Need <span className="text-[#e9c49a] italic">Assistance?</span></h1>
                                    <p className="text-white/30 text-sm font-light leading-relaxed">
                                        Describe your problem or request below. Our support agents will analyze the logs and contact you shortly.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">
                                                <User className="w-3.5 h-3.5" /> Identity Name
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Your full name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#e9c49a]/40 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">
                                                <Mail className="w-3.5 h-3.5" /> Contact Channel
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Email or Phone"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#e9c49a]/40 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">
                                            <MessageSquare className="w-3.5 h-3.5" /> Problem Narrative
                                        </div>
                                        <textarea
                                            placeholder="Describe what happened with as much detail as possible..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 px-6 text-sm outline-none focus:border-[#e9c49a]/40 transition-all h-40 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={cn(
                                            "w-full h-16 rounded-[2rem] font-bold uppercase tracking-[0.4em] text-[10px] transition-all flex items-center justify-center gap-4 group relative overflow-hidden",
                                            loading ? "bg-white/5 text-white/20" : "bg-[#e9c49a] text-black shadow-[0_20px_50px_rgba(233,196,154,0.15)] hover:bg-white"
                                        )}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                <span>Transmit to Support</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-14 text-center space-y-8"
                            >
                                <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-display font-light">Transmission <span className="text-emerald-500 italic">Confirmed.</span></h2>
                                    <p className="text-white/30 text-sm font-light leading-relaxed max-w-md mx-auto">
                                        Your request has been indexed in our support nexus. A support agent will review your case and reach out via {formData.contact}.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Return to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <footer className="p-10 text-center relative z-10">
                <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] font-bold flex items-center justify-center gap-3">
                    <Sparkles className="w-3 h-3" /> Amora Support Protocol v2.1
                </p>
            </footer>
        </div>
    );
};

// Import AnimatePresence as it's used inside
import { AnimatePresence } from 'framer-motion';

export default Help;
