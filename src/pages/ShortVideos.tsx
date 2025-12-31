import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, useOutletContext } from "react-router-dom";
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

const VideoItem = ({
    video,
    isActive,
    onScrollUp,
    onScrollDown,
    isFirst,
    isLast,
    index,
    total
}: {
    video: VideoArtifact,
    isActive: boolean,
    onScrollUp: () => void,
    onScrollDown: () => void,
    isFirst: boolean,
    isLast: boolean,
    index: number,
    total: number
}) => {
    const navigate = useNavigate();
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
            const vRef = doc(db, "shorts", video.id);
            await updateDoc(vRef, {
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
                className="h-full w-full object-cover lg:object-contain z-0"
                onClick={() => setIsMuted(!isMuted)}
            />

            {/* Left Side Interface - Desktop & Mobile */}
            <div className="absolute inset-y-0 left-0 z-20 p-6 md:p-12 flex flex-col justify-between pointer-events-none w-full md:w-[45%]">
                {/* Top Nav (Back + Filter) */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                        <button className="px-5 py-2 rounded-full bg-white/10 md:bg-transparent text-white text-[11px] font-bold uppercase tracking-widest">
                            <span className="text-[#e9c49a]">For You</span>
                        </button>
                        <div className="w-px h-3 bg-white/20 mx-1 hidden md:block" />
                        <button className="px-5 py-2 rounded-full text-white/40 text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                            Following
                        </button>
                    </div>
                </div>

                {/* Bottom Info (Profile + Title + Music) */}
                <div className="space-y-6 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                            <img src={video.imageUrl || "/amora-logo-small.png"} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-wide text-white">amora.official</span>
                            <button className="text-[10px] font-bold text-[#e9c49a] uppercase tracking-tighter hover:underline">Follow</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight text-white capitalize">
                            {video.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                        </h3>
                        <p className="text-sm text-white/70 font-light line-clamp-2 leading-relaxed">
                            {video.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-white/40 pt-2 border-t border-white/5">
                        <Music className="w-4 h-4" />
                        <div className="flex-1 overflow-hidden">
                            <span className="text-[11px] uppercase font-bold tracking-widest marquee block">
                                ORIGINAL RESONANCE — ARCHIVAL FREQUENCY ALPHA-9
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Interface - Combined Controls */}
            <div className="absolute right-0 inset-y-0 z-20 flex flex-col justify-center gap-8 p-6 md:p-12 pointer-events-none">
                <div className="flex flex-col items-center gap-5 pointer-events-auto">

                    {/* Navigation - UP */}
                    <button
                        onClick={onScrollUp}
                        disabled={isFirst}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all",
                            isFirst ? "opacity-20 cursor-not-allowed" : "bg-white/5 hover:bg-white/10"
                        )}
                    >
                        <ChevronUp className="w-6 h-6 text-white" />
                    </button>

                    {/* Comment */}
                    <div className="flex flex-col items-center gap-1">
                        <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </button>
                        <span className="text-xs font-bold text-white drop-shadow-md pb-1">84</span>
                    </div>

                    {/* Navigation - DOWN */}
                    <button
                        onClick={onScrollDown}
                        disabled={isLast}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all",
                            isLast ? "opacity-20 cursor-not-allowed" : "bg-white/5 hover:bg-white/10"
                        )}
                    >
                        <ChevronDown className="w-6 h-6 text-white" />
                    </button>

                    {/* Share/Sync */}
                    <div className="flex flex-col items-center gap-1">
                        <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                            <Share2 className="w-6 h-6 text-white" />
                        </button>
                        <span className="text-xs font-bold text-white drop-shadow-md uppercase tracking-tighter">Sync</span>
                    </div>

                    {/* Like */}
                    <div className="flex flex-col items-center gap-1 group">
                        <button
                            onClick={handleLike}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300",
                                isLiked ? "bg-red-500 border-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "bg-white/10 border-white/10 hover:bg-white/20"
                            )}
                        >
                            <Heart className={cn("w-7 h-7", isLiked ? "text-white fill-current" : "text-white")} />
                        </button>
                        <span className="text-xs font-bold text-white drop-shadow-md">{likesCount}</span>
                    </div>

                    {/* Spinning Disc */}
                    <div className="mt-4 relative animate-spin-slow">
                        <div className="w-14 h-14 rounded-full border-2 border-white/10 bg-black/40 overflow-hidden shadow-2xl">
                            <img src={video.imageUrl || "/amora-logo-small.png"} className="w-full h-full object-cover opacity-80" alt="" />
                        </div>
                    </div>
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
    const { user: userData, loading: authLoading } = useOutletContext<{ user: any, loading: boolean }>();
    const navigate = useNavigate();
    const [videos, setVideos] = useState<VideoArtifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initFeed = async () => {
            if (authLoading || !userData) return;
            await fetchVideos();
            setLoading(false);
        };
        initFeed();
    }, [userData, authLoading]);

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
        <div className="relative w-full h-[calc(100vh-theme(spacing.24))] bg-black overflow-hidden flex items-center justify-center">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth custom-scrollbar-none z-10"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {videos.map((video, i) => (
                    <VideoItem
                        key={video.id}
                        video={video}
                        isActive={i === activeIndex}
                        onScrollUp={() => scrollToVideo('up')}
                        onScrollDown={() => scrollToVideo('down')}
                        isFirst={i === 0}
                        isLast={i === videos.length - 1}
                        index={i}
                        total={videos.length}
                    />
                ))}

                {videos.length === 0 && (
                    <div className="h-full w-full flex flex-col items-center justify-center space-y-8 bg-black">
                        <Activity className="w-16 h-16 text-white/10 animate-pulse" />
                        <p className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold">Resonance Signal Lost</p>
                    </div>
                )}
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
                    white-space: nowrap;
                    padding-left: 100%;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
}

