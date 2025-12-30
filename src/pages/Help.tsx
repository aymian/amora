import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Phone,
    Search,
    FileText,
    ChevronRight,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const Help = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [viewingStatus, setViewingStatus] = useState(false);
    const [trackingContact, setTrackingContact] = useState('');
    const [searchingCase, setSearchingCase] = useState(false);
    const [foundRequests, setFoundRequests] = useState<any[]>([]);
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

    const handleTrackCase = async () => {
        if (!trackingContact.trim()) return;
        setSearchingCase(true);
        try {
            const q = query(
                collection(db, "help_requests"),
                where("contact", "==", trackingContact.trim()),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFoundRequests(list);
            if (list.length === 0) toast.error("No case found for this contact channel.");
        } catch (error) {
            console.error("Tracking error:", error);
            toast.error("Failed to retrieve Nexus archives.");
        } finally {
            setSearchingCase(false);
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
                <button
                    onClick={() => setViewingStatus(!viewingStatus)}
                    className={cn(
                        "px-6 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all",
                        viewingStatus ? "bg-[#e9c49a] border-transparent text-black" : "bg-white/5 border-white/10 text-[#e9c49a] hover:bg-white/10"
                    )}
                >
                    {viewingStatus ? "Assist Form" : "Track Case"}
                </button>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-2xl text-center">
                    <AnimatePresence mode="wait">
                        {viewingStatus ? (
                            <motion.div
                                key="tracker"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-14 space-y-8"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-display font-light">Case <span className="text-[#e9c49a] italic">Retrieval</span></h2>
                                    <p className="text-white/30 text-xs font-light">Enter your contact info to scan the assistance archives.</p>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="Email or Phone channel..."
                                        value={trackingContact}
                                        onChange={(e) => setTrackingContact(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTrackCase()}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-[#e9c49a]/40 transition-all"
                                    />
                                    <button
                                        onClick={handleTrackCase}
                                        disabled={searchingCase}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#e9c49a] text-black rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                                    >
                                        {searchingCase ? <Loader2 className="w-3 h-3 animate-spin" /> : "Scan"}
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {foundRequests.map((req) => (
                                        <div key={req.id} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 text-left relative overflow-hidden">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] uppercase tracking-widest text-[#e9c49a] font-bold">Case #{req.id.slice(-4).toUpperCase()}</p>
                                                    <h4 className="text-sm font-medium text-white/90">{req.name}</h4>
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[8px] uppercase font-bold tracking-widest",
                                                    req.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                                )}>
                                                    {req.status}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-white/20 font-bold">
                                                    <FileText className="w-3 h-3" /> Narrative
                                                </div>
                                                <p className="text-xs text-white/40 italic leading-relaxed">"{req.message}"</p>
                                            </div>

                                            {req.reply && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-6 rounded-2xl bg-[#e9c49a]/10 border border-[#e9c49a]/20 space-y-3 relative z-10"
                                                >
                                                    <p className="text-[8px] uppercase tracking-widest text-[#e9c49a] font-bold underline underline-offset-8 decoration-[#e9c49a]/30">Technical Solution Transmitted</p>
                                                    <p className="text-[13px] text-white/90 leading-relaxed font-medium">
                                                        {req.reply}
                                                    </p>
                                                </motion.div>
                                            )}

                                            <div className="pt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[8px] text-white/20 font-bold uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" /> {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Nexus Origin'}
                                                </div>
                                                {!req.reply && req.status === 'pending' && (
                                                    <span className="text-[8px] text-amber-500/60 font-medium italic flex items-center gap-2">
                                                        <AlertCircle className="w-3 h-3" /> Support analysis in progress...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {foundRequests.length === 0 && !searchingCase && trackingContact && (
                                        <div className="text-center py-10 opacity-20 italic text-sm">Case archives empty for this channel.</div>
                                    )}
                                </div>
                            </motion.div>
                        ) : !submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-14 space-y-10 text-left"
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

export default Help;
