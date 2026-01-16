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
import { useLiteMode } from "@/contexts/LiteModeContext";
import { Skeleton } from "@/components/ui/skeleton";

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
    const { isLiteMode, isDataSaver } = useLiteMode();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(video.likes || 0);
    const [isManualPlay, setIsManualPlay] = useState(false);

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

    const handleVideoClick = () => {
        setIsMuted(!isMuted);
    };

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
                poster={video.imageUrl}
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover lg:object-contain z-0"
                onClick={handleVideoClick}
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none z-10" />

            {/* Top Center Tabs */}
            <div className="absolute top-12 left-0 right-0 z-40 flex items-center justify-center gap-5 text-[15px] font-medium drop-shadow-lg text-white/50 pointer-events-auto">
                <button className="text-white font-bold border-b-[3px] border-white pb-1 shadow-sm">For You</button>
                <div className="w-[1px] h-4 bg-white/30" />
                <button className="hover:text-white transition-colors">Following</button>
            </div>

            {/* Back Button (Absolute Left Top) */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-12 left-5 z-40 p-2 text-white/90 hover:text-white drop-shadow-xl active:scale-90 transition-transform"
            >
                <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
            </button>


            {/* Content Info (Bottom Left) */}
            <div className="absolute bottom-4 left-0 z-30 p-4 w-[calc(100%-60px)] flex flex-col justify-end pointer-events-none text-white">
                <div className="pointer-events-auto space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm drop-shadow-md">@amora.official</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium backdrop-blur-sm">Creator</span>
                    </div>

                    <h3 className="text-sm font-normal leading-tight line-clamp-2 w-[90%] opacity-90 drop-shadow-md">
                        {video.description || video.title}
                    </h3>

                    <div className="flex items-center gap-2 text-white/80 pt-1">
                        <Music className="w-3 h-3 animate-pulse" />
                        <div className="overflow-hidden w-2/3">
                            <span className="text-xs marquee whitespace-nowrap opacity-90">
                                Original Resonance — Archival Frequency
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute bottom-6 right-2 z-30 flex flex-col items-center gap-5 pb-4 pointer-events-auto">

                {/* Profile Avatar with Plus */}
                <div className="relative mb-2">
                    <div className="w-10 h-10 rounded-full border border-white p-0.5 bg-black/20 backdrop-blur-sm overflow-hidden">
                        <img src={video.imageUrl || "/amora-logo-small.png"} className="w-full h-full object-cover rounded-full" alt="" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#ea284e] rounded-full p-0.5">
                        <Plus className="w-3 h-3 text-white" />
                    </div>
                </div>

                {/* Like */}
                <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={handleLike}>
                    <Heart className={cn("w-7 h-7 drop-shadow-xl transition-all active:scale-75", isLiked ? "fill-[#ea284e] text-[#ea284e]" : "text-white fill-white/10")} />
                    <span className="text-xs font-semibold text-white drop-shadow-md">{likesCount}</span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                    <MessageSquare className="w-7 h-7 text-white drop-shadow-xl fill-white/10" />
                    <span className="text-xs font-semibold text-white drop-shadow-md">84</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                    <Share2 className="w-7 h-7 text-white drop-shadow-xl fill-white/10" />
                    <span className="text-xs font-semibold text-white drop-shadow-md">Share</span>
                </div>

                {/* Spinning Music Disc */}
                <div className="mt-4 animate-spin-slow">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border-[3px] border-zinc-800 flex items-center justify-center overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${video.imageUrl || '/amora-logo-small.png'})` }} />
                    </div>
                </div>
            </div>

            {/* Mute Overlay */}
            {isMuted && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full">
                        <VolumeX className="w-8 h-8 text-white/50" />
                    </div>
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-6">
                <Skeleton className="w-full max-w-sm aspect-[9/16] rounded-[2.5rem] bg-white/5" />
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-[#e9c49a] font-bold animate-pulse">Initializing Feed...</p>
                    <Skeleton className="h-4 w-32 bg-white/5" />
                </div>
            </div>
        );
    }


    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth custom-scrollbar-none z-10 overscroll-y-contain touch-pan-y"
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

