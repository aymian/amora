import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Heart,
    MessageSquare,
    Share2,
    Music,
    Plus,
    Volume2,
    VolumeX,
    MoreHorizontal,
    ArrowLeft,
    Sparkles,
    Activity,
    Play,
    ChevronUp,
    ChevronDown
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface VideoArtifact {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    imageUrl: string;
    createdAt: any;
    likes?: number;
    likedBy?: string[];
}

const VideoItem = ({ video, isActive }: { video: VideoArtifact, isActive: boolean }) => {
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
                    // Browser blocked unmuted autoplay, fallback to muted
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
            const videoRef = doc(db, "shorts", video.id);
            await updateDoc(videoRef, {
                likes: increment(newIsLiked ? 1 : -1),
                likedBy: newIsLiked ? arrayUnion(auth.currentUser.uid) : arrayRemove(auth.currentUser.uid)
            });
        } catch (error) {
            console.error("Error updating likes:", error);
            // Revert on error
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
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
                <div className="space-y-4 max-w-[80%] pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                            <img src="/amora-logo-small.png" className="w-6 h-6 object-contain opacity-50" alt="" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">amora.official</span>
                        <button className="px-3 py-1 bg-[#e9c49a] text-black text-[10px] font-bold rounded-full uppercase tracking-tighter">Follow</button>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold tracking-tight text-white capitalize">
                            {video.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                        </h3>
                        <p className="text-sm text-white/80 font-light line-clamp-2 leading-relaxed italic">
                            {video.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                        <Music className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-bold tracking-widest overflow-hidden whitespace-nowrap marquee">
                            Original Resonance — Archival Frequency Alpha-9
                        </span>
                    </div>
                </div>
            </div>

            {/* Side Controls */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-8 z-20">
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={handleLike}>
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300",
                        isLiked ? "bg-red-500 border-red-500 scale-110" : "bg-white/10 border-white/10 hover:bg-white/20"
                    )}>
                        <Heart className={cn("w-6 h-6 transition-colors", isLiked ? "text-white fill-current" : "text-white")} />
                    </div>
                    <span className="text-[10px] font-bold text-white shadow-sm">{likesCount >= 1000 ? (likesCount / 1000).toFixed(1) + 'k' : likesCount}</span>
                </div>

                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-white shadow-sm">84</span>
                </div>

                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-white shadow-sm">Sync</span>
                </div>

                <div className="w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center animate-spin-slow">
                    <img src={video.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="" />
                </div>
            </div>

            {/* Mute Indicator */}
            {isMuted && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                    <VolumeX className="w-20 h-20 text-white" />
                </div>
            )}
        </div>
    );
};

export default function ShortVideos() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState<VideoArtifact[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                setUserData(userDoc.exists() ? { id: user.uid, ...userDoc.data() } : { id: user.uid, plan: "free" });
                await fetchVideos();
            } else {
                navigate("/login");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchVideos = async () => {
        try {
            const q = query(collection(db, "shorts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            let videoData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as VideoArtifact[];
            setVideos(videoData);
        } catch (error) {
            console.error("Fetch error:", error);
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                    <p className="text-[10px] uppercase tracking-[0.5em] text-[#e9c49a] font-bold animate-pulse">Initializing Feed...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout user={userData}>
            <div className="h-[calc(100vh-theme(spacing.24))] w-full bg-black overflow-hidden relative">
                {/* Floating Navigation */}
                <div className="absolute top-8 left-8 z-30 flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest">
                        <span className="text-[#e9c49a]">For You</span>
                        <div className="w-px h-3 bg-white/20" />
                        <span className="text-white/40">Following</span>
                    </div>
                </div>

                {/* Up/Down Arrows - Outside central video container */}
                <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-8">
                    <button
                        onClick={() => scrollToVideo('up')}
                        disabled={activeIndex === 0}
                        className={cn(
                            "w-16 h-16 rounded-full bg-blue-600/5 border border-blue-500/20 flex items-center justify-center backdrop-blur-3xl transition-all duration-500 group relative shadow-[0_0_50px_rgba(59,130,246,0.1)]",
                            activeIndex === 0 ? "opacity-10 cursor-not-allowed" : "hover:bg-blue-600 hover:border-blue-400 hover:shadow-[0_0_70px_rgba(59,130,246,0.4)] hover:-translate-y-1 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                        )}
                    >
                        {/* Blue Glow Background */}
                        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ChevronUp className={cn("w-8 h-8 transition-all relative z-10", activeIndex === 0 ? "text-white/20" : "text-blue-400 group-hover:text-white")} />
                    </button>

                    <button
                        onClick={() => scrollToVideo('down')}
                        disabled={activeIndex === videos.length - 1}
                        className={cn(
                            "w-16 h-16 rounded-full bg-blue-600/5 border border-blue-500/20 flex items-center justify-center backdrop-blur-3xl transition-all duration-500 group relative shadow-[0_0_50px_rgba(59,130,246,0.1)]",
                            activeIndex === videos.length - 1 ? "opacity-10 cursor-not-allowed" : "hover:bg-blue-600 hover:border-blue-400 hover:shadow-[0_0_70px_rgba(59,130,246,0.4)] hover:translate-y-1 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                        )}
                    >
                        {/* Blue Glow Background */}
                        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ChevronDown className={cn("w-8 h-8 transition-all relative z-10", activeIndex === videos.length - 1 ? "text-white/20" : "text-blue-400 group-hover:text-white")} />
                    </button>

                    {/* Position Counter */}
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <div className="w-1 h-12 bg-white/5 rounded-full relative overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 w-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                animate={{ height: `${((activeIndex + 1) / videos.length) * 100}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-400/60 uppercase tracking-tighter">
                            A-{(activeIndex + 1).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth custom-scrollbar-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {videos.map((video, i) => (
                        <VideoItem key={video.id} video={video} isActive={i === activeIndex} />
                    ))}

                    {videos.length === 0 && (
                        <div className="h-full w-full flex flex-col items-center justify-center space-y-8 bg-black">
                            <Activity className="w-12 h-12 text-white/10 animate-pulse" />
                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">No High-Fidelity Artifacts Found</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .marquee {
                    display: inline-block;
                    animation: marquee 15s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </DashboardLayout>
    );
}

