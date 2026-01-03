import { useState, useEffect } from "react";
import { WifiOff, Sparkles, ArrowRight, Zap, Lock, Map, Compass, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

export function OfflineFallback() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#050505] overflow-y-auto overflow-x-hidden">
            {/* Background Cinematic Aura & Particles (CSS only) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#e9c49a]/5 via-transparent to-transparent opacity-20" />
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-amber-600/10 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-50" />
            </div>

            {/* Simplified Navbar */}
            <nav className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-8 md:px-16 z-50">
                <Logo className="h-8" />
                <div className="hidden md:flex items-center gap-10">
                    {['Explore', 'Stories', 'Mood', 'Creators'].map(link => (
                        <span key={link} className="text-[11px] uppercase tracking-[0.2em] text-white/20 cursor-not-allowed flex items-center gap-2">
                            {link} <Lock className="w-3 h-3" />
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
                        <WifiOff className="w-3 h-3 text-red-500" />
                        <span className="text-[9px] uppercase tracking-[0.2em] text-red-500 font-bold">Offline</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 relative z-10 pt-40 pb-32 flex flex-col items-center">
                {/* Main Hero Section (Home Clone) */}
                <div className="w-full grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-3xl"
                        >
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold">Archival Access Active</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-white leading-none tracking-tight"
                        >
                            Stories <br />
                            <span className="italic text-[#e9c49a] font-serif pr-4">Wait</span> For No One
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto lg:mx-0"
                        >
                            Live sync is disconnected. You are currently exploring the <b>Hyperion Archive</b>.
                            Connect to a planetary frequency to resume cinematic resonance and AI generation.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center gap-6"
                        >
                            <div className="w-full sm:w-auto p-[2px] rounded-2xl bg-gradient-to-br from-[#e9c49a] via-[#b48c5c] to-transparent shadow-[0_20px_40px_rgba(233,196,154,0.15)] group">
                                <Button
                                    className="w-full h-20 px-12 rounded-[0.9rem] bg-black text-[#e9c49a] hover:bg-[#0a0a0a] transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 fill-current" />
                                        <span className="text-xl font-bold uppercase tracking-widest leading-none">Buy Signal Bundle</span>
                                    </div>
                                    <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Unlimited Live Streaming • 4K Quality</span>
                                </Button>
                            </div>

                            <button className="flex items-center gap-4 px-10 py-6 text-white/30 hover:text-white transition-all uppercase text-[10px] tracking-[0.4em] font-bold group">
                                Continue Local Mode
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </motion.div>
                    </div>

                    {/* Attractive Card Stack */}
                    <div className="relative h-[600px] flex items-center justify-center w-full">
                        {[
                            { img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=600", color: "#e9c49a", label: "Archived Story #412" },
                            { img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600", color: "#b48c5c", label: "Resonance Pattern Delta" },
                            { img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600", color: "#876445", label: "Cinematic Core Alpha" },
                        ].map((art, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 50, rotate: 10 }}
                                animate={{
                                    opacity: 1 - (idx * 0.2),
                                    x: idx * 40,
                                    y: idx * -20,
                                    rotate: idx * 5,
                                    scale: 1 - (idx * 0.05)
                                }}
                                className="absolute w-[300px] sm:w-[350px] aspect-[9/16] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
                                style={{ zIndex: 10 - idx }}
                            >
                                <img src={art.img} className="w-full h-full object-cover grayscale" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-8 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-white/40" />
                                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{art.label}</span>
                                    </div>
                                </div>
                                {idx === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white/60 ml-1" />
                                        </div>
                                        <p className="mt-4 text-[9px] uppercase tracking-[0.5em] text-white font-bold">Signal Locked</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Call to Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mt-40">
                    {[
                        { title: "Offline Vault", desc: "Access the last 48 hours of your cinematic history entirely without signal.", icon: Map, badge: "Caches Active" },
                        { title: "Pro Resonance", desc: "Unlock 8K spatial video and real-time AI generation with a signal bundle.", icon: Sparkles, badge: "Live Feature" },
                        { title: "Planetary Sync", desc: "Broadcast your own artifacts to the global network upon reconnection.", icon: Compass, badge: "Sync Only" },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[4rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] transition-all relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest text-white/20">{card.badge}</span>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-[#e9c49a]/5 flex items-center justify-center mb-8 border border-[#e9c49a]/10">
                                <card.icon className="w-6 h-6 text-[#e9c49a]" />
                            </div>
                            <h3 className="text-3xl font-display font-light text-white mb-4 leading-tight">{card.title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed font-light">{card.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Sticky Bundle Bar */}
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-6 rounded-full bg-[#1a1c23]/60 backdrop-blur-3xl border border-[#e9c49a]/20 shadow-[0_32px_64px_rgba(0,0,0,0.8)] flex items-center gap-12 z-[10000]"
                >
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold">Recommended Bundle</span>
                        <span className="text-sm text-white font-medium">Hyperion Global Pack • $14.99</span>
                    </div>
                    <Button className="h-12 px-8 rounded-full bg-[#e9c49a] text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all">
                        Reconnect Now
                    </Button>
                </motion.div>

                {/* Version ID */}
                <div className="mt-32 opacity-10 flex flex-col items-center gap-2">
                    <span className="text-[8px] uppercase tracking-[0.8em] font-bold">Amora Cinematic OS v4.0.21</span>
                    <span className="text-[8px] uppercase tracking-[0.3em]">Protocol Support: Hyperion-Sync-Alpha</span>
                </div>
            </div>
        </div>
    );
}

