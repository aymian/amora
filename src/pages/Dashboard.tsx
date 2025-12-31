import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Play,
    Clock,
    Heart,
    TrendingUp,
    Crown,
    Sparkles,
    History,
    Zap,
    ArrowRight
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
    const { user: userData, loading: authLoading } = useOutletContext<{ user: any, loading: boolean }>();
    const [heroes, setHeroes] = useState<any[]>([]);
    const [newReleases, setNewReleases] = useState<any[]>([]);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading || !userData) return;

            try {
                // Fetch Gallery Data (Videos)
                let videoItems: any[] = [];
                try {
                    const q = query(collection(db, "gallery_videos"), orderBy("createdAt", "desc"), limit(20));
                    const querySnapshot = await getDocs(q);
                    videoItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } catch (e) {
                    console.warn("Archival gallery fetch failed:", e);
                }

                const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                const mainHero = heroDoc.exists() ? { id: 'main-hero', ...heroDoc.data() } : null;

                const heroList = (mainHero ? [mainHero, ...videoItems] : videoItems)
                    .filter((item: any) => item && (item.videoUrl || item.imageUrl))
                    .slice(0, 5);

                setHeroes(heroList);
                setNewReleases(videoItems.slice(0, 6));
            } catch (err: any) {
                console.error("Dashboard sync error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userData, authLoading]);

    // Auto-slide Timer (10 seconds)
    useEffect(() => {
        if (heroes.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroes.length);
        }, 10000);

        return () => clearInterval(timer);
    }, [heroes.length]);

    const heroData = heroes[currentHeroIndex];

    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold animate-pulse">Synchronizing Immersion...</p>
            </div>
        );
    }

    return (
        <>
            {/* Dynamic Hero Banner Section */}
            <section className="relative group rounded-[40px] overflow-hidden aspect-[21/9] flex items-center p-8 lg:p-16 border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] bg-black">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={heroData?.videoUrl || 'static'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                        {heroData?.videoUrl ? (
                            <video
                                src={heroData.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80"
                                className="w-full h-full object-cover brightness-50"
                                alt="Cinema Hero"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-20 max-w-2xl space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroData?.title || 'loading'}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#e9c49a]/10 border border-[#e9c49a]/20 text-[#e9c49a] text-[10px] uppercase tracking-[0.3em] font-bold">
                                <Sparkles className="w-3.5 h-3.5" />
                                {currentHeroIndex === 0 ? 'Featured Sequence' : 'Archival Resonance'}
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl lg:text-5xl font-display font-light leading-tight tracking-tight max-w-lg">
                                    {heroData?.title || 'Initializing Cinema...'}
                                </h3>
                                <p className="text-white/50 text-xs lg:text-sm font-light leading-relaxed max-w-md line-clamp-2">
                                    {heroData?.description || "Synchronizing with your personalized cinematic feed..."}
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    const videoId = heroData?.id || 'main-hero';
                                    const videoName = heroData?.title || 'featured_sequence';
                                    navigate(`/watch?name=${encodeURIComponent(videoName)}&id=${videoId}`);
                                }}
                                className="h-12 px-8 rounded-full bg-white text-black hover:bg-[#e9c49a] hover:text-black transition-all duration-500 font-bold group shadow-xl text-xs uppercase tracking-widest"
                            >
                                Watch Sequence
                                <Play className="ml-2 w-4 h-4 fill-current" />
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-10 right-10 z-30 flex gap-3">
                    {heroes.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentHeroIndex(idx)}
                            className={cn(
                                "h-1 transition-all duration-500 rounded-full cursor-pointer",
                                idx === currentHeroIndex ? "w-8 bg-[#e9c49a]" : "w-4 bg-white/20 hover:bg-white/40"
                            )}
                        />
                    ))}
                </div>
            </section>

            {/* User Identity Phase */}
            <div className="flex justify-center">
                <div className="w-full max-w-sm bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:border-white/10 hover:bg-white/[0.04] transition-all group cursor-default shadow-sm hover:shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all text-[#e9c49a]">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Active Plan</span>
                            <div className="w-2 h-2 rounded-full bg-[#e9c49a] animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Resonance Tier</p>
                        <h4 className="text-2xl font-display font-light tracking-tight">
                            {userData?.plan === "pro" ? "Pro Citizen" :
                                userData?.plan === "elite" ? "Elite Architect" :
                                    userData?.plan === "creator" ? "Neural Creator" : "Free Citizen"}
                        </h4>
                    </div>
                </div>
            </div>

            {/* Discovery Feed - New Releases */}
            <div className="space-y-10">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-2">
                        <h4 className="text-3xl font-display font-light tracking-tight flex items-center gap-3">
                            <Zap className="w-6 h-6 text-[#e9c49a]" />
                            New Artifacts
                        </h4>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Latest Neural Transmissions Synchronized</p>
                    </div>
                    <button onClick={() => navigate('/gallery')} className="px-6 py-2 rounded-full border border-white/10 text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 transition-all">Explore Gallery</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newReleases.length > 0 ? (
                        newReleases.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/watch?name=${encodeURIComponent(item.title)}&id=${item.id}`)}
                                className="relative aspect-square rounded-[40px] overflow-hidden group cursor-pointer border border-white/5 hover:border-[#e9c49a]/30 transition-all duration-700 bg-[#0A0A0A]"
                            >
                                <img
                                    src={item.imageUrl || (item.videoUrl ? item.videoUrl.replace(/\.[^/.]+$/, ".jpg") : "https://images.unsplash.com/photo-1530000000000?auto=format&fit=crop&q=80")}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    alt={item.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <p className="text-[#e9c49a] text-[10px] font-black uppercase tracking-[0.3em]">Newly Released</p>
                                        <Sparkles className="w-3.5 h-3.5 text-[#e9c49a] animate-pulse" />
                                    </div>
                                    <p className="text-2xl font-display font-light leading-none mb-2 group-hover:text-[#e9c49a] transition-colors">{item.title}</p>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{item.category || "Original Cinematic"}</p>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center">
                                        <Play className="w-8 h-8 text-white fill-current translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full aspect-[21/9] rounded-[40px] border border-dashed border-white/5 flex items-center justify-center p-8 text-center bg-white/[0.01]">
                            <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Awaiting New Artifacts...</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
