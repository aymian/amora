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
    Play
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface VideoArtifact {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    imageUrl: string;
    createdAt: any;
}

const VideoItem = ({ video, isActive }: { video: VideoArtifact, isActive: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

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
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setIsLiked(!isLiked)}>
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300",
                        isLiked ? "bg-red-500 border-red-500 scale-110" : "bg-white/10 border-white/10 hover:bg-white/20"
                    )}>
                        <Heart className={cn("w-6 h-6 transition-colors", isLiked ? "text-white fill-current" : "text-white")} />
                    </div>
                    <span className="text-[10px] font-bold text-white shadow-sm">1.2k</span>
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
                    <img src={video.imageUrl} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="" />
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
            const q = query(collection(db, "gallery_videos"));
            const querySnapshot = await getDocs(q);
            let videoData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VideoArtifact[];

            if (videoData.length === 0) {
                const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                if (heroDoc.exists()) {
                    const data = heroDoc.data();
                    videoData = [{
                        id: data.id || "current-hero",
                        title: data.title || "Current Hero",
                        description: data.description || "Active sequence",
                        videoUrl: data.videoUrl,
                        imageUrl: data.imageUrl || (data.videoUrl ? data.videoUrl.replace(/\.[^/.]+$/, ".jpg") : ""),
                        createdAt: data.updatedAt ? { seconds: new Date(data.updatedAt).getTime() / 1000 } : null
                    }] as VideoArtifact[];
                }
            }
            setVideos(videoData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
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
            <div className="h-[calc(100vh-theme(spacing.24))] lg:h-[calc(100vh-theme(spacing.24))] w-full bg-black overflow-hidden relative">
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
