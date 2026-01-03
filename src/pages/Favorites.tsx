import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    Heart,
    Play,
    Share2,
    Star,
    Sparkles,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function Favorites() {
    const { user: userData } = useOutletContext<{ user: any }>();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData?.id) return;

        // Fetch user's favorites
        const q = query(
            collection(db, `users/${userData.id}/favorites`),
            orderBy("addedAt", "desc"),
            limit(50)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setFavorites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => {
            console.warn("Favorites fetch failed:", err);
            setLoading(false);
        });

        return () => unsub();
    }, [userData?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold animate-pulse">Syncing Heartbeats...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-10">
            <header className="space-y-1">
                <div className="flex items-center gap-3 text-[#e9c49a]">
                    <Heart className="w-6 h-6 fill-current" />
                    <h1 className="text-3xl font-display font-light text-white uppercase tracking-wider">Soul Archives</h1>
                </div>
                <p className="text-white/40 text-[10px] font-light uppercase tracking-[0.5em]">The artifacts that resonated deepest.</p>
            </header>

            {favorites.length === 0 ? (
                <div className="py-40 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-white/10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-display text-white/40">Archive Is Void</h3>
                        <p className="text-white/20 text-xs font-light max-w-xs mx-auto italic">You have not yet marked any artifact with your resonance pulse.</p>
                    </div>
                    <button
                        onClick={() => navigate('/explore')}
                        className="px-8 py-4 rounded-2xl border border-white/10 text-white font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all"
                    >
                        Index Artifacts
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favorites.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={item.id}
                            className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[#e9c49a]/30 transition-all duration-700 bg-black cursor-pointer"
                            onClick={() => navigate(`/watch?id=${item.artifactId}`)}
                        >
                            <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-3 h-3 text-[#e9c49a]" />
                                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#e9c49a] font-black">Favorite Artifact</span>
                                </div>
                                <h4 className="text-2xl font-display text-white mb-4 group-hover:text-[#e9c49a] transition-colors">{item.title}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white transition-all">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">ID: {item.artifactId?.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
