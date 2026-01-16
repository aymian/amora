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
    ArrowRight,
    Plus,
    Music,
    X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
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
    const [stories, setStories] = useState<any[]>([]);
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading || !userData) return;

            try {
                // Fetch OMDB Data for Hero Section
                const OMDB_API_KEY = "93272d7a";
                const searchTerms = ["Marvel", "Avengers", "Star Wars", "Batman", "John Wick"];
                const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

                // Fetch movies
                const movieRes = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${randomTerm}&type=movie`);
                const movieData = await movieRes.json();

                // Fetch series for variety
                const seriesRes = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=Succession&type=series`);
                const seriesData = await seriesRes.json();

                const combinedResults = [
                    ...(movieData.Search || []),
                    ...(seriesData.Search || [])
                ].slice(0, 12);

                // Fetch full details for each to get descriptions
                const detailedHeroes = await Promise.all(
                    combinedResults.map(async (item: any) => {
                        const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${item.imdbID}`);
                        const details = await detailRes.json();
                        return {
                            id: item.imdbID,
                            title: details.Title,
                            description: details.Plot !== "N/A" ? details.Plot : "No description available.",
                            imageUrl: details.Poster !== "N/A" ? details.Poster : "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80",
                            year: details.Year,
                            rating: details.imdbRating,
                            genre: details.Genre,
                            runtime: details.Runtime
                        };
                    })
                );

                setHeroes(detailedHeroes);

                // Fetch Gallery Data (Videos) for New Releases
                let videoItems: any[] = [];
                try {
                    const q = query(collection(db, "gallery_videos"), orderBy("createdAt", "desc"), limit(20));
                    const querySnapshot = await getDocs(q);
                    videoItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } catch (e) {
                    console.warn("Archival gallery fetch failed:", e);
                }
                setNewReleases(videoItems.slice(0, 6));

                // Fetch Stories
                const qStories = query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(20));
                const storySnap = await getDocs(qStories);
                const fetchedStories = storySnap.docs.map(doc => {
                    const data = doc.data();
                    const isSeen = data.viewedBy?.includes(userData.id);
                    return { id: doc.id, ...data, isSeen };
                });
                setStories(fetchedStories);

            } catch (err: any) {
                console.error("Dashboard sync error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userData, authLoading]);

    // Auto-slide Timer (8 seconds)
    useEffect(() => {
        if (heroes.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroes.length);
        }, 8000);

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

    const handleViewStory = async (story: any) => {
        if (!userData?.id) return;
        setSelectedStory(story);
        if (!story.isSeen) {
            try {
                await updateDoc(doc(db, "stories", story.id), {
                    viewedBy: [...(story.viewedBy || []), userData.id]
                });
                setStories(prev => prev.map(s => s.id === story.id ? { ...s, isSeen: true } : s));
            } catch (err) {
                console.error("Mark seen failed:", err);
            }
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Stories Section */}
            <section className="relative px-2">
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                    {/* Add Story */}
                    <div
                        onClick={() => navigate('/create-story')}
                        className="flex flex-col items-center gap-3 flex-shrink-0 group cursor-pointer"
                    >
                        <div className="relative w-20 h-20 rounded-[2rem] border border-white/10 p-1 group-hover:border-[#e9c49a]/50 transition-all bg-white/[0.02]">
                            <div className="w-full h-full rounded-[1.8rem] bg-white/5 flex items-center justify-center backdrop-blur-md">
                                <Plus className="w-8 h-8 text-[#e9c49a]" />
                            </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-white/20 font-black group-hover:text-white transition-colors">Create</span>
                    </div>

                    {stories.map((story) => (
                        <div
                            key={story.id}
                            onClick={() => handleViewStory(story)}
                            className="flex flex-col items-center gap-3 flex-shrink-0 group cursor-pointer"
                        >
                            <div className={cn(
                                "relative w-20 h-20 rounded-[2rem] p-1 transition-all duration-700",
                                story.isSeen
                                    ? "border border-white/5 grayscale opacity-50"
                                    : "border-2 border-[#e9c49a] shadow-[0_0_25px_rgba(233,196,154,0.2)] group-hover:scale-110"
                            )}>
                                <Avatar className="w-full h-full rounded-[1.8rem] ring-2 ring-black">
                                    <AvatarImage src={story.userPhoto || story.mediaUrl} className="object-cover" />
                                    <AvatarFallback className="bg-white/5 text-xs">{story.userName?.[0]}</AvatarFallback>
                                </Avatar>
                                {!story.isSeen && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_15px_#f59e0b]" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] uppercase tracking-widest font-black truncate max-w-[80px] transition-colors",
                                story.isSeen ? "text-white/20" : "text-white/60 group-hover:text-white"
                            )}>{story.userName || "Citizen"}</span>
                        </div>
                    ))}
                </div>
            </section>
            {/* Dynamic Hero Banner Section */}
            <section className="relative group rounded-[40px] overflow-hidden aspect-[2/3] md:aspect-[21/9] flex items-end md:items-center p-6 sm:p-10 md:p-16 border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] bg-black/40">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={heroData?.id || 'static'}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute inset-0 z-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent md:bg-gradient-to-r md:from-[#050505] md:via-[#050505]/60 md:to-transparent z-10" />
                        <img
                            src={heroData?.imageUrl}
                            className="w-full h-full object-cover brightness-[0.7] transition-all duration-1000 group-hover:scale-105"
                            alt={heroData?.title || "Cinema Hero"}
                        />
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-20 max-w-2xl space-y-4 md:space-y-8 w-full mb-8 md:mb-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroData?.title || 'loading'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-4 md:space-y-8"
                        >
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e9c49a]/20 border border-[#e9c49a]/30 text-[#e9c49a] text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-black backdrop-blur-md">
                                    <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                    Featured Sequence
                                </div>
                                {heroData?.rating && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[8px] md:text-[10px] uppercase tracking-widest font-black backdrop-blur-md">
                                        IMDb {heroData.rating}
                                    </div>
                                )}
                                {heroData?.year && (
                                    <div className="inline-flex sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[8px] md:text-[10px] uppercase tracking-widest font-black backdrop-blur-md">
                                        {heroData.year}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <h3 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] tracking-tighter text-white drop-shadow-2xl">
                                    {heroData?.title || 'Synchronizing...'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/40 text-[9px] md:text-xs uppercase tracking-widest font-black">
                                    <span className="text-[#e9c49a]/60">{heroData?.genre?.split(',')[0]}</span>
                                    {heroData?.runtime !== "N/A" && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span>{heroData?.runtime}</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-white/60 text-[11px] md:text-base font-light leading-relaxed max-w-lg line-clamp-2 md:line-clamp-none">
                                    {heroData?.description || "Initializing neural cinematic interface..."}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 pt-2">
                                <Button
                                    onClick={() => {
                                        navigate(`/details/${heroData?.id}`);
                                    }}
                                    className="h-12 md:h-14 px-10 rounded-2xl bg-[#e9c49a] text-black hover:bg-white hover:scale-105 transition-all duration-300 font-black shadow-[0_20px_40px_-12px_rgba(233,196,154,0.3)] text-[10px] md:text-xs uppercase tracking-[0.2em]"
                                >
                                    Experience Now
                                    <Play className="ml-3 w-4 md:w-5 h-4 md:h-5 fill-current" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 md:h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 font-bold text-[10px] md:text-xs uppercase tracking-widest"
                                    onClick={() => toast.info("Added to Archive")}
                                >
                                    Add to Collection
                                    <Heart className="ml-3 w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-16 md:bottom-16 md:translate-x-0 z-30 flex items-center gap-2">
                    {heroes.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentHeroIndex(idx)}
                            className={cn(
                                "h-1.5 transition-all duration-500 rounded-full cursor-pointer",
                                idx === currentHeroIndex
                                    ? "w-10 bg-[#e9c49a] shadow-[0_0_15px_rgba(233,196,154,0.5)]"
                                    : "w-4 bg-white/20 hover:bg-white/40"
                            )}
                        />
                    ))}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#e9c49a]/5 to-transparent pointer-events-none opacity-50" />
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
            {/* Story Viewer Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-lg aspect-[9/16] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(233,196,154,0.1)] border border-white/10">
                            {/* Media */}
                            {selectedStory.mediaType === 'video' ? (
                                <video
                                    src={selectedStory.mediaUrl}
                                    autoPlay
                                    className="w-full h-full object-cover"
                                    onEnded={() => setSelectedStory(null)}
                                />
                            ) : (
                                <img src={selectedStory.mediaUrl} className="w-full h-full object-cover" alt="Story" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 p-8 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-[#e9c49a] p-0.5">
                                            <Avatar className="w-full h-full rounded-full ring-1 ring-black">
                                                <AvatarImage src={selectedStory.userPhoto} />
                                                <AvatarFallback>{selectedStory.userName?.[0]}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-bold tracking-tight">{selectedStory.userName}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                                                TRANSMISSION_ACTIVE
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStory(null)}
                                        className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-display font-light text-white">{selectedStory.title}</h3>
                                    <p className="text-sm text-white/60 font-light leading-relaxed">{selectedStory.description}</p>

                                    {selectedStory.audioUrl && (
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/10 w-fit backdrop-blur-md">
                                            <Music className="w-3 h-3 text-[#e9c49a] animate-pulse" />
                                            <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Atmospheric frequency active</span>
                                            <audio src={selectedStory.audioUrl} autoPlay loop />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: selectedStory.mediaType === 'video' ? 15 : 5, ease: "linear" }}
                                    onAnimationComplete={() => setSelectedStory(null)}
                                    className="h-full bg-[#e9c49a]"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
