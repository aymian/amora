import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Sparkles, CloudRain, Moon, Wind, ArrowRight, Play, Share2, Download, Coffee } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Sad() {
    const { user: userData } = useOutletContext<{ user: any }>();
    const [sadArtifacts, setSadArtifacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            // Synced via context
        }
    }, [userData]);

    useEffect(() => {
        const fetchSadContent = async () => {
            try {
                // Fetch content that is likely "sad/moody" (we'll filter for low-key/atmospheric moods)
                const q = query(
                    collection(db, "gallery_images"),
                    limit(8)
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSadArtifacts(items);
            } catch (error) {
                console.error("Error fetching sad content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSadContent();
    }, []);

    return (
        <div className="space-y-12 pb-32">
            {/* Hero Stage - Atmospheric Melancholy */}
            <div className="relative pt-12 overflow-hidden rounded-[4rem] bg-gradient-to-br from-blue-900/20 via-indigo-950/10 to-transparent border border-white/5 p-12 md:p-20">
                {/* Falling Rain Animation (CSS Overlay) */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] animate-pulse" />
                </div>

                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />

                <div className="relative z-10 max-w-3xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400 font-bold flex items-center gap-2">
                                <CloudRain className="w-3 h-3" /> Low Frequency Resonance
                            </span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-display font-light tracking-tight leading-none text-white"
                    >
                        The <span className="text-blue-400 italic font-serif">Melancholy</span> Archive.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 text-lg md:text-xl font-light max-w-2xl leading-relaxed font-sans"
                    >
                        A quiet sanctuary for your heavier moments. Embrace the beauty in the shadows and find peace in the quiet vibrations of the blue spectrum.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-4 pt-4"
                    >
                        <Button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-blue-500/20 transition-all font-bold gap-3 group">
                            <Moon className="w-5 h-5" /> Initialize Night Mode
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/5 text-white/40 hover:text-white transition-all font-light gap-3">
                            <Coffee className="w-5 h-5 text-blue-500/40" /> Solitary Session
                        </Button>
                    </motion.div>
                </div>

                {/* Decorative Floating Moon */}
                <div className="absolute right-20 bottom-20 hidden lg:block">
                    <motion.div
                        animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600/20 to-indigo-500/5 blur-3xl"
                    />
                    <motion.div
                        className="relative"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Moon className="w-24 h-24 text-blue-400/20" />
                    </motion.div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-display font-light text-white tracking-tight">Shadow Artifacts</h2>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Atmosphere: Deep Indigo // 432Hz</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[9/16] rounded-[3rem] bg-white/[0.01] border border-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {sadArtifacts.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative aspect-[9/16] rounded-[3rem] overflow-hidden bg-[#050505] border border-white/5 cursor-pointer"
                            >
                                <img
                                    src={item.imageUrl || (item.videoUrl ? item.videoUrl.replace(/\.[^/.]+$/, ".jpg") : "")}
                                    className="w-full h-full object-cover transition-all duration-[3s] group-hover:scale-105 group-hover:brightness-50 grayscale group-hover:grayscale-0"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end gap-3 translate-y-2 group-hover:translate-y-0 transition-all duration-700">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-white/80 group-hover:text-white transition-colors tracking-tight">{item.title}</h3>
                                        <p className="text-xs text-white/20 font-light line-clamp-2 italic">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all delay-100">
                                        <button className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-900/30 text-white/60 hover:text-white font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                            <Wind className="w-3.5 h-3.5" /> Breath Sync
                                        </button>
                                    </div>
                                </div>

                                {/* Mood Badge */}
                                <div className="absolute top-6 left-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[8px] uppercase tracking-widest font-bold text-white/30">Quiet Resonance</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Night-time Pulse Section */}
            <div className="grid md:grid-cols-3 gap-8 pt-12">
                {[
                    { icon: Moon, label: "Midnight Waves", desc: "Low-fidelity soundscapes for deep reflection." },
                    { icon: Wind, label: "Ethereal Breath", desc: "Guided relaxation within the shadow space." },
                    { icon: CloudRain, label: "Pluphic Pulse", desc: "Synchronize with the rhythm of falling rain." }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 space-y-4 hover:bg-blue-500/[0.02] hover:border-blue-500/20 transition-all"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center border border-white/5">
                            <feature.icon className="w-6 h-6 text-blue-400/40" />
                        </div>
                        <h4 className="text-lg font-bold text-white/60 tracking-tight">{feature.label}</h4>
                        <p className="text-sm text-white/20 font-light leading-relaxed">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
