import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    const [userData, setUserData] = useState<any>(null);
    const [heroes, setHeroes] = useState<any[]>([]);
    const [newReleases, setNewReleases] = useState<any[]>([]);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            try {
                if (user) {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        if (!data.onboardingCompleted) {
                            navigate("/onboarding");
                        } else {
                            setUserData({ id: user.uid, ...data });
                        }
                    }

                    // Fetch Gallery Data (Videos)
                    let videoItems: any[] = [];
                    try {
                        const q = query(collection(db, "gallery_videos"), orderBy("createdAt", "desc"), limit(20));
                        const querySnapshot = await getDocs(q);
                        videoItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    } catch (e) {
                        console.warn("Archival gallery fetch failed:", e);
                    }

                    // Also fetch the specific hero doc as priority
                    let mainHero = null;
                    try {
                        const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                        if (heroDoc.exists()) {
                            mainHero = { id: 'main-hero', ...heroDoc.data() };
                        }
                    } catch (e) {
                        console.error("Hero stage fetch failed.");
                    }

                    // Process Heroes (Top 5 for rotation)
                    const heroList = (mainHero ? [mainHero, ...videoItems] : videoItems)
                        .filter((item: any) => item && (item.videoUrl || item.imageUrl))
                        .slice(0, 5);

                    // Deduplicate
                    const dedupedHeroes = heroList.reduce((acc: any[], current: any) => {
                        const isDuplicate = acc.some(item =>
                            (item.id === current.id && item.id !== 'main-hero') ||
                            (item.videoUrl && item.videoUrl === current.videoUrl)
                        );
                        if (!isDuplicate) return acc.concat([current]);
                        return acc;
                    }, []);

                    setHeroes(dedupedHeroes);

                    // Process New Releases (Next 6 items, avoiding those in heroes if possible)
                    const releaseList = videoItems
                        .filter(item => !dedupedHeroes.some((h: any) => h.id === item.id))
                        .slice(0, 6);

                    // Fallback to videoItems if deduped filter is too aggressive
                    setNewReleases(releaseList.length > 0 ? releaseList : videoItems.slice(0, 6));

                } else {
                    navigate("/login");
                }
            } catch (err: any) {
                console.error("Dashboard sync error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Auto-slide Timer (10 seconds)
    useEffect(() => {
        if (heroes.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroes.length);
        }, 10000);

        return () => clearInterval(timer);
    }, [heroes.length]);

    const heroData = heroes[currentHeroIndex];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold animate-pulse">Synchronizing Immersion...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout user={userData}>
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
                                    navigate(`/watch?id=${videoId}`);
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Content Watched", value: "48h 12m", icon: Clock, color: "text-blue-400" },
                    { label: "Resonated Items", value: "256", icon: Heart, color: "text-red-400" },
                    { label: "Community Rank", value: "Top 2%", icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Elite Tier", value: userData?.plan === "pro" ? "Pro Member" : "Free Member", icon: Crown, color: "text-[#e9c49a]" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:border-white/10 hover:bg-white/[0.04] transition-all group cursor-default shadow-sm hover:shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">{stat.label}</p>
                            <h4 className="text-2xl font-display font-light tracking-tight">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Continue Watching List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-lg font-light tracking-wide flex items-center gap-3">
                            <History className="w-5 h-5 text-[#e9c49a]" />
                            Continue Watching
                        </h4>
                        <button className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#e9c49a] hover:text-white transition-colors">See History</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((it) => (
                            <div key={it} className="group bg-white/[0.01] border border-white/5 rounded-[24px] p-4 flex items-center gap-6 hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer">
                                <div className="w-32 aspect-video rounded-xl overflow-hidden relative">
                                    <img src={`https://images.unsplash.com/photo-${1500000000000 + it}?auto=format&fit=crop&q=60&w=200`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-6 h-6 text-white fill-current" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-[#e9c49a]" style={{ width: `${30 + it * 20}%` }} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h5 className="font-medium text-white/90 group-hover:text-[#e9c49a] transition-colors tracking-wide">Cinematic Abstract Story #{it}</h5>
                                    <p className="text-[11px] text-white/30 italic">Chapter {it} • 14 mins remaining</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all mr-2" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Discovery Feed Small */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-lg font-light tracking-wide flex items-center gap-3">
                            <Zap className="w-5 h-5 text-[#e9c49a]" />
                            New Releases
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {newReleases.length > 0 ? (
                            newReleases.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/watch?id=${item.id}`)}
                                    className="relative aspect-square rounded-[32px] overflow-hidden group cursor-pointer border border-white/5 hover:border-[#e9c49a]/30 transition-all"
                                >
                                    <img
                                        src={item.imageUrl || (item.videoUrl ? item.videoUrl.replace(/\.[^/.]+$/, ".jpg") : "https://images.unsplash.com/photo-1530000000000?auto=format&fit=crop&q=80")}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        alt={item.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-[#e9c49a] text-[9px] font-bold uppercase tracking-[0.3em]">Newly Released</p>
                                            <Sparkles className="w-3 h-3 text-[#e9c49a] animate-pulse" />
                                        </div>
                                        <p className="text-xl font-display font-light leading-none mb-1 group-hover:text-[#e9c49a] transition-colors">{item.title}</p>
                                        <p className="text-white/40 text-[10px] font-light uppercase tracking-widest">{item.category || "Original Cinematic"}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="aspect-square rounded-[32px] border border-dashed border-white/5 flex items-center justify-center p-8 text-center bg-white/[0.01]">
                                <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Awaiting New Artifacts...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
