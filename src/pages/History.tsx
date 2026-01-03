import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    Clock,
    Play,
    Trash2,
    Calendar,
    ArrowRight,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";

export default function History() {
    const { user: userData } = useOutletContext<{ user: any }>();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData?.id) return;

        // Fetch user's view history
        const q = query(
            collection(db, `users/${userData.id}/history`),
            orderBy("viewedAt", "desc"),
            limit(50)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => {
            console.warn("History fetch failed (likely empty or missing collection):", err);
            setLoading(false);
        });

        return () => unsub();
    }, [userData?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold animate-pulse">Retrieving Archival Footprints...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-10">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-[#e9c49a]">
                        <Clock className="w-6 h-6" />
                        <h1 className="text-3xl font-display font-light text-white uppercase tracking-wider">Temporal Log</h1>
                    </div>
                    <p className="text-white/40 text-[10px] font-light uppercase tracking-[0.5em]">Revisit your synchronized resonances.</p>
                </div>
                {history.length > 0 && (
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all group">
                        <Trash2 className="w-3.5 h-3.5 group-hover:text-red-400 transition-colors" />
                        Purge Memory
                    </button>
                )}
            </header>

            {history.length === 0 ? (
                <div className="py-40 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-white/10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-display text-white/40">No Trace Detected</h3>
                        <p className="text-white/20 text-xs font-light max-w-xs mx-auto italic">Your journey across the cinematic expanse has not yet been recorded.</p>
                    </div>
                    <button
                        onClick={() => navigate('/explore')}
                        className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-[#e9c49a] transition-all"
                    >
                        Begin Exploration
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {history.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id}
                            className="group relative flex items-center gap-6 p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-[#e9c49a]/20 transition-all cursor-pointer"
                            onClick={() => navigate(`/watch?id=${item.artifactId}`)}
                        >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shrink-0">
                                <img src={item.imageUrl || item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#e9c49a]/10 text-[#e9c49a] border border-[#e9c49a]/20 font-bold">
                                        {item.type || 'Artifact'}
                                    </span>
                                    <span className="text-[9px] text-white/20 font-bold uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.viewedAt?.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-lg font-display text-white/80 group-hover:text-white transition-colors">{item.title}</h4>
                                <div className="flex items-center gap-4 text-[9px] text-white/20 uppercase tracking-widest font-black">
                                    <span>Duration: {item.duration || '--:--'}</span>
                                    <span>Sync Rank: PRO</span>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-6">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
