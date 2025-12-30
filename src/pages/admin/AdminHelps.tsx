import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle,
    MessageSquare,
    User,
    Mail,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    ArrowLeft,
    Trash2,
    Check,
    X,
    MoreVertical,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const AdminHelps = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "help_requests"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(list);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to index support requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateDoc(doc(db, "help_requests", id), { status });
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            if (selectedRequest?.id === id) {
                setSelectedRequest({ ...selectedRequest, status });
            }
            toast.success(`Request status updated to ${status}.`);
        } catch (error) {
            toast.error("Status update protocol failed.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Permanently neutralize this support request?")) return;
        try {
            await deleteDoc(doc(db, "help_requests", id));
            setRequests(prev => prev.filter(r => r.id !== id));
            setSelectedRequest(null);
            toast.success("Request archived.");
        } catch (error) {
            toast.error("Deletion protocol failed.");
        }
    };

    const filteredRequests = requests.filter(r =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.contact?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative">
            {/* Header */}
            <header className="h-20 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-10 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/manager/nexus')}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-px bg-white/5" />
                    <Logo className="h-6 opacity-80" />
                    <h1 className="text-sm font-light tracking-[0.2em] uppercase text-white/40 ml-4">
                        Support / <span className="text-[#e9c49a] italic">Nexus</span>
                    </h1>
                </div>

                <div className="relative w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-[#e9c49a] transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan support logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs text-white outline-none focus:border-[#e9c49a]/30 transition-all"
                    />
                </div>
            </header>

            <main className="flex-1 p-10 max-w-7xl mx-auto w-full space-y-8 pb-40">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-display font-light">Assistance <span className="text-[#e9c49a] italic">Queue</span></h2>
                        <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Managing {requests.length} Intelligence Requests</p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : filteredRequests.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredRequests.map((req) => (
                            <motion.div
                                key={req.id}
                                layoutId={req.id}
                                onClick={() => setSelectedRequest(req)}
                                className={cn(
                                    "group p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-8",
                                    req.status === 'pending'
                                        ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                                        : "bg-emerald-500/[0.02] border-emerald-500/10 hover:border-emerald-500/20"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                                    req.status === 'pending' ? "bg-white/5 border-white/10 text-white/20" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                )}>
                                    {req.status === 'pending' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-sm font-medium text-white/90 truncate">{req.name}</h4>
                                        <span className="text-[9px] text-white/20">•</span>
                                        <p className="text-[10px] text-white/40 truncate">{req.contact}</p>
                                    </div>
                                    <p className="text-xs text-white/30 truncate">{req.message}</p>
                                </div>

                                <div className="text-right flex items-center gap-6">
                                    <div className="hidden md:block">
                                        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-1">Received</p>
                                        <p className="text-[9px] text-white/40">{req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[8px] uppercase font-bold tracking-widest",
                                        req.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                    )}>
                                        {req.status}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-[#e9c49a] transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4 rounded-[3rem] border border-dashed border-white/5">
                        <Activity className="w-12 h-12 text-white/10" />
                        <p className="text-white/20 text-sm font-light italic">No matching requests found in the Nexus.</p>
                    </div>
                )}
            </main>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[3rem] overflow-hidden p-12 space-y-10 relative"
                        >
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="absolute top-10 right-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5 text-white/40" />
                            </button>

                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-[#e9c49a]">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-display font-light">{selectedRequest.name}</h2>
                                        <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">{selectedRequest.contact}</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                    <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] font-bold">Assistance Narrative</p>
                                    <p className="text-sm text-white/80 leading-relaxed italic whitespace-pre-wrap">
                                        "{selectedRequest.message}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-1">
                                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Transmission Log</p>
                                        <p className="text-[10px] text-white/50">{selectedRequest.createdAt?.seconds ? new Date(selectedRequest.createdAt.seconds * 1000).toLocaleString() : 'System Origin'}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-1">
                                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Resonance Status</p>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest",
                                            selectedRequest.status === 'pending' ? "text-amber-500" : "text-emerald-500"
                                        )}>{selectedRequest.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                {selectedRequest.status === 'pending' ? (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'resolved')}
                                        className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-xl"
                                    >
                                        <Check className="w-4 h-4 inline-block mr-2" /> Mark Resolved
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'pending')}
                                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        <Clock className="w-4 h-4 inline-block mr-2" /> Re-open Protocol
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(selectedRequest.id)}
                                    className="px-8 py-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ChevronRight import
import { ChevronRight } from 'lucide-react';

export default AdminHelps;
