import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
    Heart,
    MessageSquare,
    Share2,
    Music,
    Volume2,
    VolumeX,
    ArrowLeft,
    Sparkles,
    Activity,
    ChevronUp,
    ChevronDown,
    Clock,
    Tag
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface MoodArtifact {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    moods: string[];
    category: string;
    language: string;
    createdAt: any;
    likes?: number;
    likedBy?: string[];
}

const MoodVideoItem = ({ video, isActive }: { video: MoodArtifact, isActive: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(video.likes || 0);

    useEffect(() => {
        if (auth.currentUser && video.likedBy?.includes(auth.currentUser.uid)) {
            setIsLiked(true);
        }
    }, [video.likedBy]);

    useEffect(() => {
        if (isActive && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    setIsMuted(true);
                    videoRef.current?.play().catch(e => console.error("Playback failed:", e));
                });
            }
        } else {
            videoRef.current?.pause();
        }
    }, [isActive]);

    const handleLike = async () => {
        if (!auth.currentUser) return;

        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            const vRef = doc(db, "mood_content", video.id);
            await updateDoc(vRef, {
                likes: increment(newIsLiked ? 1 : -1),
                likedBy: newIsLiked ? arrayUnion(auth.currentUser.uid) : arrayRemove(auth.currentUser.uid)
            });
        } catch (error) {
            console.error("Error updating likes:", error);
            setIsLiked(!newIsLiked);
            setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
        }
    };

    return (
        <div className="h-full w-full relative snap-start bg-black flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                src={video.videoUrl}
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover lg:object-contain"
                onClick={() => setIsMuted(!isMuted)}
            />

            {/* Bottom Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 pb-24 space-y-6 pointer-events-none">
                <div className="space-y-4 max-w-xl pointer-events-auto">
                    <div className="flex flex-wrap gap-2">
                        {video.moods.map(mood => (
                            <span key={mood} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/30">
                                {mood}
                            </span>
                        ))}
                        <span className="px-3 py-1 rounded-full bg-[#e9c49a]/20 text-[#e9c49a] text-[9px] font-black uppercase tracking-widest border border-[#e9c49a]/30">
                            {video.category}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-4xl font-display font-light tracking-tight text-white leading-tight"
                        >
                            {video.title}
                        </motion.h3>
                        <p className="text-sm md:text-base text-white/50 font-light line-clamp-3 leading-relaxed italic">
                            {video.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-white/30">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">105:00 Transmission</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#e9c49a]/60">
                            <Activity className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">{video.language} Frequency</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Controls */}
            <div className="absolute right-6 md:right-12 bottom-32 flex flex-col items-center gap-10 z-20">
                <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={handleLike}>
                    <motion.div
                        whileTap={{ scale: 0.8 }}
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-500",
                            isLiked ? "bg-red-500 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]" : "bg-white/10 border-white/10 hover:bg-white/20"
                        )}>
                        <Heart className={cn("w-7 h-7 transition-colors", isLiked ? "text-white fill-current" : "text-white")} />
                    </motion.div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{likesCount >= 1000 ? (likesCount / 1000).toFixed(1) + 'k' : likesCount}</span>
                </div>

                <div className="flex flex-col items-center gap-3 cursor-pointer group">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Archive</span>
                </div>

                <div className="flex flex-col items-center gap-3 cursor-pointer group">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <Share2 className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Pulse</span>
                </div>

                <div className="w-14 h-14 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center p-1 group">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
                        <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Mute Indicator */}
            {isMuted && (
                <div className="absolute top-10 right-10 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/40">
                    <VolumeX className="w-5 h-5" />
                </div>
            )}
        </div>
    );
};

export default function MoodsWatch() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState<MoodArtifact[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                setUserData(userDoc.exists() ? { id: user.uid, ...userDoc.data() } : { id: user.uid, plan: "free" });
                await initializeSequence();
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [id]);

    const initializeSequence = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // 1. Fetch target video
            const targetRef = doc(db, "mood_content", id);
            const targetSnap = await getDoc(targetRef);

            if (!targetSnap.exists()) {
                navigate("/moods");
                return;
            }

            const targetVideo = { id: targetSnap.id, ...targetSnap.data() } as MoodArtifact;

            // 2. Fetch related videos (matching at least one mood)
            const q = query(
                collection(db, "mood_content"),
                where("moods", "array-contains-any", targetVideo.moods),
                limit(15)
            );

            const querySnapshot = await getDocs(q);
            let relatedVideos = querySnapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(v => v.id !== targetVideo.id) as MoodArtifact[];

            // 3. Set the feed starting with target video
            setVideos([targetVideo, ...relatedVideos]);
            setActiveIndex(0);
        } catch (error) {
            console.error("Sequence Initialization Failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const index = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    const scrollToVideo = (direction: 'up' | 'down') => {
        if (!containerRef.current) return;
        const newIndex = direction === 'up' ? activeIndex - 1 : activeIndex + 1;
        if (newIndex >= 0 && newIndex < videos.length) {
            const height = containerRef.current.clientHeight;
            containerRef.current.scrollTo({
                top: newIndex * height,
                behavior: 'smooth'
            });
            setActiveIndex(newIndex);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-[3px] border-blue-500/20 border-t-blue-500 rounded-full"
                    />
                    <p className="text-[10px] uppercase tracking-[0.6em] text-blue-400 font-bold animate-pulse text-center pl-2">
                        Synchronizing <br /> Atmospheric Frequency
                    </p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout user={userData}>
            <div className="h-[calc(100vh-theme(spacing.24))] w-full bg-black overflow-hidden relative">
                {/* Floating Header Navigation */}
                <div className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between pointer-events-none">
                    <button
                        onClick={() => navigate("/moods")}
                        className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all pointer-events-auto group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] pointer-events-auto">
                        <Sparkles className="w-3.5 h-3.5 text-[#e9c49a]" />
                        <span className="text-[#e9c49a]">Mood Resonance</span>
                        <div className="w-px h-3 bg-white/20" />
                        <span className="text-white/40">Frequency A-{(activeIndex + 1).toString().padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Vertical Navigation Controls */}
                <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-10">
                    <button
                        onClick={() => scrollToVideo('up')}
                        disabled={activeIndex === 0}
                        className={cn(
                            "w-16 h-16 rounded-[2rem] bg-blue-500/5 border border-blue-500/20 flex items-center justify-center backdrop-blur-3xl transition-all duration-500 group relative",
                            activeIndex === 0 ? "opacity-10 cursor-not-allowed" : "hover:bg-blue-600 hover:border-blue-400 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:-translate-y-1"
                        )}
                    >
                        <ChevronUp className={cn("w-8 h-8 transition-all relative z-10", activeIndex === 0 ? "text-white/20" : "text-blue-400 group-hover:text-white")} />
                    </button>

                    <button
                        onClick={() => scrollToVideo('down')}
                        disabled={activeIndex === videos.length - 1}
                        className={cn(
                            "w-16 h-16 rounded-[2rem] bg-blue-500/5 border border-blue-500/20 flex items-center justify-center backdrop-blur-3xl transition-all duration-500 group relative",
                            activeIndex === videos.length - 1 ? "opacity-10 cursor-not-allowed" : "hover:bg-blue-600 hover:border-blue-400 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:translate-y-1"
                        )}
                    >
                        <ChevronDown className={cn("w-8 h-8 transition-all relative z-10", activeIndex === videos.length - 1 ? "text-white/20" : "text-blue-400 group-hover:text-white")} />
                    </button>

                    {/* Neural Progress Index */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-1 h-32 bg-white/5 rounded-full relative overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 w-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                                animate={{ height: `${((activeIndex + 1) / videos.length) * 100}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[11px] font-mono font-black text-blue-400">{(activeIndex + 1).toString().padStart(2, '0')}</span>
                            <div className="w-4 h-[1px] bg-white/20 my-1" />
                            <span className="text-[9px] font-mono font-bold text-white/20">{videos.length.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
                >
                    {videos.map((video, i) => (
                        <MoodVideoItem key={video.id + i} video={video} isActive={i === activeIndex} />
                    ))}

                    {videos.length === 0 && (
                        <div className="h-full w-full flex flex-col items-center justify-center space-y-8 bg-[#050505]">
                            <Activity className="w-16 h-16 text-white/5 animate-pulse" />
                            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">No Frequency Samples Detected</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </DashboardLayout>
    );
}
