import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ChevronLeft,
    Share2,
    Info,
    Loader2,
    Sparkles,
    MessageSquare,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Heart,
    Download,
    Plus,
    Flame,
    LayoutGrid,
    ArrowUpRight,
    Activity,
    Settings,
    Maximize2,
    MoreHorizontal,
    ThumbsUp,
    ThumbsDown,
    Share,
    ListPlus,
    Search,
    Bell,
    Grid,
    Layers,
    MonitorPlay,
    Instagram,
    Eye,
    Diamond
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, limit, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Watch() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const artifactId = searchParams.get("id");
    const artifactName = searchParams.get("name");

    const [videoData, setVideoData] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [nextSequences, setNextSequences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);

    // Video State
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);
    const controlsTimeoutRef = useRef<any>(null);

    // 1. Auth Observer
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData({ id: user.uid, ...userDoc.data() });
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Directorial Metadata Sync (Title)
    useEffect(() => {
        if (videoData?.title) {
            const cleanTitle = videoData.title.toLowerCase().replace(/\s+/g, '_');
            document.title = `${cleanTitle}.artifact | Amora Theater`;
        }
    }, [videoData]);

    // 3. Data Fetcher & Navigation Reset
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const fetchData = async () => {
            setLoading(true);
            try {
                if (artifactId) {
                    const collections = ["gallery_videos", "gallery_images", "mood_content", "shorts", "happy_tracks", "sad_tracks"];
                    let foundDocData = null;

                    for (const collName of collections) {
                        try {
                            // First attempt: Direct Document ID fetch
                            const directDoc = await getDoc(doc(db, collName, artifactId));
                            if (directDoc.exists()) {
                                foundDocData = { id: directDoc.id, ...directDoc.data() };
                                break;
                            }

                            // Second attempt: Search by 'id' field (resilience for custom amora-xxx IDs)
                            const q = query(collection(db, collName), where("id", "==", artifactId), limit(1));
                            const querySnap = await getDocs(q);
                            if (!querySnap.empty) {
                                const d = querySnap.docs[0];
                                foundDocData = { id: d.id, ...d.data() };
                                break;
                            }
                        } catch (e) {
                            console.warn(`Fetch failed for ${collName}:`, e);
                        }
                    }

                    if (foundDocData) {
                        setVideoData(foundDocData);
                    } else {
                        // Final Fallback: Site Hero
                        const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                        if (heroDoc.exists()) {
                            const data = heroDoc.data();
                            // Only set hero if it matches the requested artifactId or if we really have no choice
                            // But usually, if they asked for an ID and it's not found, we show the hero
                            setVideoData({ id: 'hero', ...data });
                        }
                    }
                } else {
                    const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                    if (heroDoc.exists()) setVideoData({ id: 'hero', ...heroDoc.data() });
                }

                // Fetch next sequences for sidebar
                const q = query(collection(db, "gallery_videos"), limit(12));
                const querySnapshot = await getDocs(q);
                setNextSequences(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Theater Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [artifactId]);

    // 4. Playback Pulse & Keyboard Controls
    useEffect(() => {
        if (!loading && videoRef.current) {
            const playVideo = async () => {
                try {
                    videoRef.current?.load();
                    await videoRef.current?.play();
                    setPlaying(true);
                } catch (err) {
                    console.warn("Autoplay transition restricted:", err);
                    setPlaying(false);
                }
            };
            playVideo();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Avoid triggers if user is typing in search or input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    handleTogglePlay();
                    break;
                case "KeyK":
                    handleTogglePlay();
                    break;
                case "ArrowLeft":
                    if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
                    break;
                case "ArrowRight":
                    if (videoRef.current) videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setVolume(prev => {
                        const newVol = Math.min(1, prev + 0.1);
                        if (videoRef.current) videoRef.current.volume = newVol;
                        return newVol;
                    });
                    setMuted(false);
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setVolume(prev => {
                        const newVol = Math.max(0, prev - 0.1);
                        if (videoRef.current) videoRef.current.volume = newVol;
                        return newVol;
                    });
                    break;
                case "KeyM":
                    setMuted(prev => !prev);
                    break;
                case "KeyF":
                    handleToggleFullscreen();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [loading, videoData?.videoUrl]);

    // Handle Fullscreen Change tracking
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFsChange);
        return () => document.removeEventListener("fullscreenchange", handleFsChange);
    }, []);

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setPlaying(true);
            } else {
                videoRef.current.pause();
                setPlaying(false);
            }
        }
    };

    const handleVideoEnd = () => {
        if (isAutoplayEnabled && nextSequences.length > 0) {
            const nextSeq = nextSequences[0];
            navigate(`/watch?name=${encodeURIComponent(nextSeq.title)}&id=${nextSeq.id}`);
        } else {
            setPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setPlayed(videoRef.current.currentTime / videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = val * videoRef.current.duration;
            setPlayed(val);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const ratio = videoRef.current.videoWidth / videoRef.current.videoHeight;
            setVideoAspectRatio(ratio);
            setDuration(videoRef.current.duration);
        }
    };

    const handleToggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8 overflow-hidden">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-20 h-20 border-[3px] border-[#e9c49a]/5 border-t-[#e9c49a] rounded-full animate-spin" />
                </motion.div>
                <p className="text-[10px] uppercase tracking-[0.6em] text-[#e9c49a] font-bold animate-pulse">Initializing Immersion</p>
                <div className="absolute inset-0 bg-[#e9c49a]/5 blur-[120px] -z-10" />
            </div>
        );
    }

    const displayTitle = videoData?.title || artifactName || "unknown";
    const artifactHandle = displayTitle.toUpperCase();

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <DashboardLayout user={userData}>
            <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col pt-4 pb-20">
                <main className="max-w-[1920px] mx-auto w-full px-4 lg:px-12 py-4">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Left Side: Video Player & Info */}
                        <div className={cn(
                            "flex-1 space-y-10 transition-all duration-500 ease-in-out",
                            isSidebarCollapsed ? "w-full" : "lg:w-[75%]"
                        )}>
                            {/* Video Player Header with Toggle */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white"
                                    >
                                        <Layers className={cn("w-5 h-5 transition-transform", !isSidebarCollapsed && "text-blue-500")} />
                                    </button>
                                </div>
                            </div>

                            {/* Video Container - Premium Rounded Aesthetics */}
                            <div className="relative group">
                                <motion.div
                                    ref={containerRef}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "w-full overflow-hidden bg-[#0a0a0a] relative z-10 flex items-center justify-center transition-all duration-500",
                                        isFullscreen ? "rounded-none h-screen" : "rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 aspect-video"
                                    )}
                                    onMouseMove={handleMouseMove}
                                >
                                    <video
                                        key={videoData?.videoUrl}
                                        ref={videoRef}
                                        src={videoData?.videoUrl}
                                        autoPlay
                                        muted={muted}
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover lg:object-contain"
                                        onTimeUpdate={handleTimeUpdate}
                                        onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onEnded={handleVideoEnd}
                                        onClick={handleTogglePlay}
                                    />

                                    {/* Custom Video Controls Layer */}
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 transition-opacity duration-300",
                                        showControls || !playing ? "opacity-100" : "opacity-0"
                                    )}>
                                        <div className="space-y-6">
                                            {/* Progress Bar - Gradient Style */}
                                            <div className="relative h-1 bg-white/10 rounded-full group/seek cursor-pointer" onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const x = e.clientX - rect.left;
                                                const val = x / rect.width;
                                                if (videoRef.current) videoRef.current.currentTime = val * videoRef.current.duration;
                                            }}>
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 rounded-full"
                                                    style={{ width: `${played * 100}%` }}
                                                />
                                                <div
                                                    className="absolute top-1/2 -ml-2 -mt-2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity"
                                                    style={{ left: `${played * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <button onClick={handleTogglePlay} className="hover:scale-110 transition-transform">
                                                        {playing ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                                                    </button>
                                                    <div className="text-[11px] font-bold text-white/60 tracking-wider">
                                                        {formatTime(played * duration)} / {formatTime(duration)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={() => setMuted(!muted)}>
                                                            {muted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5" />}
                                                        </button>
                                                        <button><Maximize2 className="w-5 h-5 text-white/40" /></button>
                                                        <button><Settings className="w-5 h-5 text-white/40" /></button>
                                                        <button onClick={handleToggleFullscreen}>
                                                            {isFullscreen ? <Maximize2 className="w-5 h-5 text-blue-500" /> : <Maximize className="w-5 h-5 text-white/40" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Title Section */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                                        {artifactHandle}
                                    </h1>
                                    <div className="flex items-center gap-3 text-[12px] text-white/30 font-bold uppercase tracking-widest">
                                        <span className="text-white/60">LOVE BUSTER</span>
                                        <span>•</span>
                                        <span>2.1M views</span>
                                        <span>•</span>
                                        <span>1 hour ago</span>
                                    </div>
                                </div>

                                {/* Action Row */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                                            <button className="flex items-center gap-2.5 px-6 py-3 hover:bg-white/10 transition-colors border-r border-white/10">
                                                <ThumbsUp className="w-5 h-5 text-blue-400 fill-blue-400" />
                                                <span className="text-[12px] font-bold uppercase tracking-wider">The</span>
                                            </button>
                                            <button className="px-6 py-3 hover:bg-white/10 transition-colors flex items-center gap-2">
                                                <ThumbsDown className="w-5 h-5 text-white/40" />
                                                <span className="text-[12px] font-bold uppercase tracking-wider">Dislikes</span>
                                            </button>
                                        </div>

                                        <button className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-[12px] uppercase tracking-wider">
                                            <Share className="w-4 h-4" /> Share
                                        </button>
                                        <button className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-[12px] uppercase tracking-wider">
                                            <Download className="w-4 h-4" /> Download
                                        </button>
                                        <button className="flex items-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-[#5c2e1d] to-[#7c3a23] text-white font-black text-[12px] uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(124,58,35,0.3)]">
                                            <MonitorPlay className="w-4 h-4 fill-white" /> SUBSCRIBE
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
                                            <Info className="w-5 h-5 text-white/60" />
                                        </button>
                                        <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
                                            <ListPlus className="w-5 h-5 text-white/60" />
                                        </button>
                                        <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
                                            <MoreHorizontal className="w-5 h-5 text-white/60" />
                                        </button>
                                    </div>
                                </div>

                                {/* Secondary Global Progress - Unique visual element from reference */}
                                <div className="pt-8 space-y-3">
                                    <div className="h-1 w-full bg-white/5 rounded-full relative overflow-hidden">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-blue-500/40"
                                            style={{ width: '100%' }}
                                        />
                                        <div
                                            className="absolute inset-y-0 left-0 bg-orange-500"
                                            style={{ width: '60%' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-white/20 font-mono">
                                        <span>2.2M</span>
                                        <span>4:78</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Next Up & Apps */}
                        <AnimatePresence>
                            {!isSidebarCollapsed && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 50 }}
                                    className="lg:w-[350px] xl:w-[450px] space-y-10 flex-shrink-0"
                                >
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8 h-full">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-white/60">NEXT UP</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">AUTOPLAY</span>
                                                <button 
                                                    onClick={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
                                                    className={cn(
                                                        "w-10 h-5 rounded-full relative transition-colors duration-300 ring-1 ring-white/10",
                                                        isAutoplayEnabled ? "bg-blue-600" : "bg-white/10"
                                                    )}
                                                >
                                                    <motion.div 
                                                        animate={{ x: isAutoplayEnabled ? 20 : 2 }}
                                                        className="absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm"
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {nextSequences.slice(0, 8).map((seq, i) => (
                                                <div
                                                    key={seq.id}
                                                    onClick={() => navigate(`/watch?name=${encodeURIComponent(seq.title)}&id=${seq.id}`)}
                                                    className="flex gap-4 cursor-pointer group"
                                                >
                                                    <div className="w-40 aspect-[16/9] rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/5 group-hover:border-blue-500/30 transition-all">
                                                        <img src={seq.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded-md text-[9px] font-bold">
                                                            {seq.duration ? formatTime(seq.duration) : "0:39"}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 py-1 flex-1">
                                                        <h4 className="text-[12px] font-black uppercase leading-[1.3] group-hover:text-blue-500 transition-colors">
                                                            {(i + 1).toString().padStart(2, '0')} {seq.title.toUpperCase()}
                                                        </h4>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-white/30 font-bold leading-tight">
                                                                7.9M views • Archive video
                                                            </p>
                                                            <p className="text-[9px] text-white/10 uppercase tracking-widest font-mono">
                                                                {seq.id.slice(-8).toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Bottom App Shortcut Icons */}
                                        <div className="pt-8 border-t border-white/5 space-y-6">
                                             <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">QUICK ACCESS</h3>
                                             <div className="grid grid-cols-5 gap-3">
                                                {[
                                                    { icon: MonitorPlay, color: "bg-blue-600" },
                                                    { icon: Diamond, color: "bg-gray-800" },
                                                    { icon: Eye, color: "bg-red-600" },
                                                    { icon: Instagram, color: "bg-gray-800" },
                                                    { icon: LayoutGrid, color: "bg-gray-800" }
                                                ].map((app, i) => (
                                                    <button
                                                        key={i}
                                                        className={cn(
                                                            "aspect-square rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95",
                                                            app.color
                                                        )}
                                                    >
                                                        <app.icon className="w-5 h-5 text-white" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>

                <style>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
            `}</style>
            </div>
        </DashboardLayout>
    );
}
