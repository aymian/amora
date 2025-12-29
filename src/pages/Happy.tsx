import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Heart, Music, ArrowRight, Play, Share2, Download } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Happy() {
    const [userData, setUserData] = useState<any>(null);
    const [happyArtifacts, setHappyArtifacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const { doc, getDoc } = await import("firebase/firestore");
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData({ id: user.uid, ...userDoc.data() });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchHappyContent = async () => {
            try {
                // Fetch content that is likely "happy" (we'll filter for energetic/positive moods)
                const q = query(
                    collection(db, "gallery_images"),
                    limit(8)
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHappyArtifacts(items);
            } catch (error) {
                console.error("Error fetching happy content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHappyContent();
    }, []);

    return (
        <DashboardLayout user={userData}>
            <div className="space-y-12 pb-32">
                {/* Hero Stage - Radiant Aura */}
                <div className="relative pt-12 overflow-hidden rounded-[4rem] bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-white/5 p-12 md:p-20">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 blur-[150px] rounded-full animate-pulse" />

                    <div className="relative z-10 max-w-3xl space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-orange-400 font-bold flex items-center gap-2">
                                    <Sun className="w-3 h-3" /> High Energy Frequency
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-display font-light tracking-tight leading-none text-white"
                        >
                            The <span className="text-orange-400 italic font-serif">Euphoria</span> Engine.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/60 text-lg md:text-xl font-light max-w-2xl leading-relaxed font-sans"
                        >
                            Synchronize your resonance with the purest vibrations of joy. A curated sanctuary of uplifted visuals and radiant narratives.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-4 pt-4"
                        >
                            <Button className="h-14 px-8 rounded-2xl bg-orange-500 text-black hover:bg-white transition-all font-bold gap-3 group">
                                <Music className="w-5 h-5" /> Start Radiant Session
                            </Button>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 text-white hover:bg-white/5 transition-all font-light gap-3">
                                <Sparkles className="w-5 h-5 text-orange-400" /> Discover Joy
                            </Button>
                        </motion.div>
                    </div>

                    {/* Floating Decorative Hearts */}
                    <div className="absolute right-20 bottom-20 hidden lg:block">
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_20px_40px_rgba(251,146,60,0.4)] flex items-center justify-center"
                        >
                            <Heart className="w-12 h-12 text-white fill-current" />
                        </motion.div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-display font-light text-white tracking-tight">Vibrant Artifacts</h2>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Resonance Level: 100% Radiant</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-orange-400/40" />
                            <div className="w-2 h-2 rounded-full bg-orange-400/20" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-[9/16] rounded-[3rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {happyArtifacts.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative aspect-[9/16] rounded-[3rem] overflow-hidden bg-black border border-white/5 cursor-pointer shadow-2xl"
                                >
                                    <img
                                        src={item.imageUrl || (item.videoUrl ? item.videoUrl.replace(/\.[^/.]+$/, ".jpg") : "")}
                                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                                    <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                                            <p className="text-xs text-orange-200/60 font-light line-clamp-2 italic">{item.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="flex-1 h-12 rounded-xl bg-orange-400 text-black font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                                <Play className="w-3 h-3 fill-current" /> Sync
                                            </button>
                                            <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange-400 transition-all">
                                                <Heart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Radiant Corner Badge */}
                                    <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-500/30">
                                        <span className="text-[8px] uppercase tracking-widest font-bold text-orange-400">Radiant Asset</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Energy Pulse Section */}
                <div className="grid md:grid-cols-3 gap-8 pt-12">
                    {[
                        { icon: Music, label: "Auditory Joy", desc: "Radiant soundscapes tuned to 528Hz." },
                        { icon: Share2, label: "Vibe Sync", desc: "Share your euphoric state with the collective." },
                        { icon: Download, label: "Physical Anchor", desc: "Download high-alpha radiant artifacts." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 hover:bg-orange-500/[0.03] hover:border-orange-500/20 transition-all"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                                <feature.icon className="w-6 h-6 text-orange-400" />
                            </div>
                            <h4 className="text-lg font-bold text-white tracking-tight">{feature.label}</h4>
                            <p className="text-sm text-white/40 font-light leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
