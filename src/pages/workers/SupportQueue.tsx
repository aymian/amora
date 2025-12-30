import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    User,
    Clock,
    CheckCircle2,
    Search,
    Filter,
    Trash2,
    Check,
    X,
    Activity,
    ChevronRight,
    ArrowUpCircle,
    Phone,
    Mail,
    Shield,
    Send,
    Loader2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const SupportQueue = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [reply, setReply] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

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
            const updatePayload: any = { status };
            if (status === 'resolved' && reply.trim()) {
                updatePayload.reply = reply.trim();
                updatePayload.repliedAt = new Date();
                updatePayload.repliedBy = 'Support Agent';
            }

            await updateDoc(doc(db, "help_requests", id), updatePayload);

            setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updatePayload } : r));
            if (selectedRequest?.id === id) {
                setSelectedRequest({ ...selectedRequest, ...updatePayload });
            }
            setReply("");
            toast.success(`Protocol updated: Request marked as ${status}.`);
        } catch (error) {
            toast.error("Status update protocol failed.");
        }
    };

    const handleSendReply = async () => {
        if (!reply.trim()) return toast.error("Transmission Error: Empty narrative.");
        setSendingReply(true);
        try {
            await handleUpdateStatus(selectedRequest.id, 'resolved');
            setSelectedRequest(null);
        } finally {
            setSendingReply(false);
        }
    };

    const filteredRequests = requests.filter(r =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.contact?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-display font-light">User <span className="text-[#e9c49a] italic">Support Nexus</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mt-2">Active Operational Queue // Protocol v2.1</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/[0.02] border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Unresolved</p>
                            <p className="text-xl font-display font-light text-[#e9c49a]">{requests.filter(r => r.status === 'pending').length}</p>
                        </div>
                        <Activity className="w-5 h-5 text-[#e9c49a]/40" />
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-[#e9c49a] transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan assistance logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs text-white outline-none focus:border-[#e9c49a]/30 transition-all font-sans"
                    />
                </div>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all"
                >
                    <Clock className="w-4 h-4" /> Refresh Logs
                </button>
            </div>

            {/* Request List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-28 bg-white/5 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map((req) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedRequest(req)}
                            className={cn(
                                "group p-8 rounded-[2.5rem] border transition-all cursor-pointer flex items-center gap-8",
                                req.status === 'pending'
                                    ? "bg-white/[0.02] border-white/5 hover:border-[#e9c49a]/30"
                                    : "bg-emerald-500/[0.02] border-emerald-500/10 opacity-60"
                            )}
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-[1.5rem] flex items-center justify-center border transition-all shadow-xl",
                                req.status === 'pending' ? "bg-white/5 border-white/10 text-[#e9c49a]" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            )}>
                                {req.status === 'pending' ? <MessageSquare className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <h4 className="text-base font-medium text-white/90 truncate">{req.name}</h4>
                                    <div className="h-1 w-1 rounded-full bg-white/10" />
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold truncate">{req.contact}</p>
                                </div>
                                <p className="text-xs text-white/30 truncate max-w-2xl">{req.message}</p>
                            </div>

                            <div className="hidden lg:flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[8px] uppercase tracking-widest text-white/10 font-bold mb-1">Received</p>
                                    <p className="text-[10px] text-white/30">{req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Nexus Origin'}</p>
                                </div>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] uppercase font-bold tracking-[0.2em] shadow-lg",
                                    req.status === 'pending' ? "bg-[#e9c49a]/10 text-[#e9c49a] border border-[#e9c49a]/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                )}>
                                    {req.status}
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-[#e9c49a] transition-all group-hover:translate-x-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center space-y-4 rounded-[4rem] bg-white/[0.01] border border-dashed border-white/5">
                    <Activity className="w-12 h-12 text-white/5" />
                    <p className="text-white/20 text-sm font-light italic">The support nexus is currently clear.</p>
                </div>
            )}

            {/* Detailed Inspection Drawer */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="w-full max-w-3xl bg-[#080808] border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all z-20 group"
                            >
                                <X className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                            </button>

                            <div className="p-14 space-y-12">
                                {/* Identity Block */}
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-[#e9c49a]/10 border border-[#e9c49a]/20 flex items-center justify-center text-[#e9c49a]">
                                        <User className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-4xl font-display font-light text-white">{selectedRequest.name}</h2>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-widest",
                                                selectedRequest.status === 'pending' ? "bg-[#e9c49a]/10 text-[#e9c49a]" : "bg-emerald-500/10 text-emerald-500"
                                            )}>{selectedRequest.status}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" /> {selectedRequest.contact}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Narrative Block */}
                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] font-bold ml-1">Assistance Required</p>
                                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] relative">
                                        <div className="absolute top-8 left-8">
                                            <MessageSquare className="w-8 h-8 text-white/[0.03]" />
                                        </div>
                                        <p className="text-lg text-white/80 font-light leading-relaxed whitespace-pre-wrap relative z-10">
                                            "{selectedRequest.message}"
                                        </p>
                                    </div>
                                </div>

                                {selectedRequest.reply ? (
                                    <div className="p-10 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[3rem] space-y-4">
                                        <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Transmitted Solution</p>
                                        <p className="text-sm text-emerald-500/80 leading-relaxed italic whitespace-pre-wrap font-medium">
                                            "{selectedRequest.reply}"
                                        </p>
                                    </div>
                                ) : selectedRequest.status === 'pending' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between ml-1">
                                            <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] font-bold">Intel Response Protocol</p>
                                            <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest italic">Direct Line Active</span>
                                        </div>
                                        <textarea
                                            placeholder="Enter technical guidance or resolution steps..."
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 px-6 text-sm outline-none focus:border-[#e9c49a]/40 transition-all h-32 resize-none"
                                        />
                                    </div>
                                )}

                                {/* Upgrade Gude / Intel */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 space-y-2 group cursor-pointer hover:bg-emerald-500/[0.05] transition-all">
                                        <div className="flex items-center gap-3 text-emerald-500 mb-2">
                                            <ArrowUpCircle className="w-5 h-5 font-bold" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Upgrade Guidance</span>
                                        </div>
                                        <p className="text-xs text-emerald-500/60 font-medium">Ready to facilitate protocol ascension for this citizen.</p>
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-2">
                                        <div className="flex items-center gap-3 text-white/20 mb-2">
                                            <Shield className="w-5 h-5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Security Clearance</span>
                                        </div>
                                        <p className="text-xs text-white/40 font-medium">Identity verified via Nexus Auth v4.2.</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-6">
                                    {selectedRequest.status === 'pending' ? (
                                        <button
                                            onClick={handleSendReply}
                                            disabled={sendingReply}
                                            className="flex-1 py-5 bg-[#e9c49a] text-black rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-white transition-all active:scale-95 shadow-[0_20px_40px_rgba(233,196,154,0.1)] disabled:opacity-50"
                                        >
                                            {sendingReply ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> : <Send className="w-5 h-5 inline-block mr-2" />}
                                            Transmit Solution
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedRequest.id, 'pending')}
                                            className="flex-1 py-5 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all active:scale-95"
                                        >
                                            <Clock className="w-5 h-5 inline-block mr-2" /> Restore Active Status
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedRequest(null)}
                                        className="px-10 py-5 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-red-500/10 hover:text-red-500 transition-all"
                                    >
                                        Neutralize Interaction
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportQueue;
