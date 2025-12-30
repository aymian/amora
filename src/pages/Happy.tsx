import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Video,
    Volume2,
    VolumeX,
    Maximize2,
    Layers,
    Eye,
    Music,
    Film,
    X,
    LayoutGrid,
    ThumbsUp,
    ThumbsDown,
    Share,
    Download,
    ListPlus,
    MoreHorizontal,
    MonitorPlay,
    Info,
    Maximize
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { collection, query, getDocs, limit, orderBy, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function Happy() {
    const [userData, setUserData] = useState<any>(null);
    const [happyClips, setHappyClips] = useState<any[]>([]);
    const [currentClip, setCurrentClip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Player State
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false); // Unmuted by default as requested
    const [showControls, setShowControls] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const controlsTimeoutRef = useRef<any>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData({ id: user.uid, ...userDoc.data() });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchHappyClips = async () => {
            try {
                let docs: any[] = [];
                const q = query(
                    collection(db, "happy_tracks"),
                    orderBy("createdAt", "desc"),
                    limit(50)
                );
                const snap = await getDocs(q);
                docs = snap.docs;

                const clips = docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHappyClips(clips);
            } catch (error) {
                console.error("Error fetching happy clips:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHappyClips();
    }, []);

    const handlePlayClip = (clip: any) => {
        setCurrentClip(clip);
        setShowPlayerModal(true);
        setPlaying(true);
        setPlayed(0);
    };

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

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setPlayed(videoRef.current.currentTime / videoRef.current.duration);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    const handleNext = () => {
        if (!currentClip) return;
        const currentIndex = happyClips.findIndex(t => t.id === currentClip.id);
        const nextClip = happyClips[(currentIndex + 1) % happyClips.length];
        setCurrentClip(nextClip);
        setPlayed(0);
    };

    const handlePrev = () => {
        if (!currentClip) return;
        const currentIndex = happyClips.findIndex(t => t.id === currentClip.id);
        const prevClip = happyClips[(currentIndex - 1 + happyClips.length) % happyClips.length];
        setCurrentClip(prevClip);
        setPlayed(0);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <DashboardLayout user={userData}>
            <div className="min-h-screen pb-32 space-y-16">
                {/* Immersive Header */}
                <div className="relative h-[65vh] flex flex-col justify-end p-12 lg:p-24 overflow-hidden rounded-[4rem] border border-white/5 mx-4 mt-4">
                    {/* Background Visualizer */}
                    <div className="absolute inset-0 bg-[#050505]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
                        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[#e9c49a]/5 blur-[180px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#e9c49a]/2 blur-[120px] rounded-full" />
                    </div>

                    <div className="relative z-10 space-y-8 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#e9c49a]/10 flex items-center justify-center text-[#e9c49a] border border-[#e9c49a]/20">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold tracking-[0.4em] text-[#e9c49a]/60 uppercase">System Neural Core</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-7xl md:text-9xl font-display font-light tracking-tight leading-none text-white lg:ml-[-5px]"
                        >
                            Happy <span className="text-[#e9c49a] italic">Core.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/40 text-xl font-light max-w-2xl font-sans tracking-wide leading-relaxed"
                        >
                            The planetary visual sanctuary. High-clarity cinematics synchronized for your emotional resonance at <span className="text-[#e9c49a] font-medium tracking-widest">AMORA ALPHA FREQUENCIES</span>.
                        </motion.p>
                    </div>
                </div>

                {/* Clips Grid */}
                <div className="space-y-12 px-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Film className="w-5 h-5 text-[#e9c49a]" />
                            </div>
                            <h2 className="text-3xl font-display font-light text-white tracking-widest uppercase">Resonance Index</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">{happyClips.length} Verified Artifacts</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="aspect-[16/10] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {happyClips.map((clip, idx) => (
                                <motion.div
                                    key={clip.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handlePlayClip(clip)}
                                    className={cn(
                                        "group relative bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all cursor-pointer hover:shadow-[0_40px_100px_rgba(0,0,0,0.8)] hover:-translate-y-2 hover:border-[#e9c49a]/20",
                                    )}
                                >
                                    {/* Visual Stage */}
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <img
                                            src={clip.imageUrl || clip.videoUrl?.replace(/\.[^/.]+$/, ".jpg")}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                            alt={clip.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                        {/* Play Indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                                            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                                                <Play className="w-6 h-6 fill-current ml-1" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-bold text-[#e9c49a] tracking-widest uppercase">
                                            {clip.duration ? formatTime(clip.duration) : "Cinema"}
                                        </div>
                                    </div>

                                    {/* Info Segment */}
                                    <div className="p-8 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-[#e9c49a]" />
                                            <p className="text-[9px] uppercase tracking-[0.3em] text-[#e9c49a]/40 font-bold">Resonance Detected</p>
                                        </div>
                                        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[#e9c49a] transition-colors line-clamp-1">{clip.title}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* THEATER MODAL (Replicating /watch) */}
                <AnimatePresence>
                    {showPlayerModal && currentClip && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/95 backdrop-blur-[100px]"
                                onClick={() => setShowPlayerModal(false)}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="relative w-full h-full max-w-[1920px] max-h-[1080px] bg-[#050505] lg:rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_150px_rgba(233,196,154,0.1)] border border-white/5"
                                onMouseMove={handleMouseMove}
                            >
                                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                    {/* Main Stage (Player) */}
                                    <div className={cn(
                                        "flex-1 relative bg-black flex items-center justify-center transition-all duration-700",
                                        isSidebarCollapsed ? "w-full" : "lg:w-[75%]"
                                    )}>
                                        <video
                                            ref={videoRef}
                                            src={currentClip.videoUrl}
                                            autoPlay
                                            muted={muted}
                                            playsInline
                                            className="w-full h-full object-contain"
                                            onTimeUpdate={handleTimeUpdate}
                                            onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                                            onEnded={handleNext}
                                            onClick={handleTogglePlay}
                                        />

                                        {/* Interaction Overlay */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 flex flex-col justify-end p-8 lg:p-12",
                                            (showControls || !playing) && "opacity-100"
                                        )}>
                                            <div className="max-w-6xl mx-auto w-full space-y-8">
                                                {/* Control Bar */}
                                                <div className="space-y-6">
                                                    {/* Progress Center */}
                                                    <div className="relative h-1.5 bg-white/10 rounded-full cursor-pointer group/seek" onClick={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const x = e.clientX - rect.left;
                                                        const val = x / rect.width;
                                                        if (videoRef.current) videoRef.current.currentTime = val * videoRef.current.duration;
                                                    }}>
                                                        <motion.div
                                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e9c49a] via-[#8b6544] to-[#e9c49a] rounded-full"
                                                            style={{ width: `${played * 100}%` }}
                                                        />
                                                        <div
                                                            className="absolute top-1/2 -ml-2 -mt-2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] opacity-0 group-hover/seek:opacity-100 transition-opacity"
                                                            style={{ left: `${played * 100}%` }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-8">
                                                            <button onClick={handlePrev} className="text-white/20 hover:text-white transition-all"><SkipBack className="w-6 h-6 fill-current" /></button>
                                                            <button onClick={handleTogglePlay} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                                                                {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                                            </button>
                                                            <button onClick={handleNext} className="text-white/20 hover:text-white transition-all"><SkipForward className="w-6 h-6 fill-current" /></button>

                                                            <div className="h-8 w-px bg-white/10" />

                                                            <div className="text-[11px] font-bold text-white/40 tracking-[0.2em] font-mono">
                                                                {formatTime(played * duration)} <span className="mx-2">//</span> {formatTime(duration)}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <button onClick={() => setMuted(!muted)} className="text-white/40 hover:text-white transition-all">
                                                                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                                            </button>
                                                            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={cn("text-white/40 hover:text-[#e9c49a] transition-all", !isSidebarCollapsed && "text-[#e9c49a]")}>
                                                                <Layers className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="px-4 py-1.5 bg-[#e9c49a] text-black rounded-full text-[9px] font-black uppercase tracking-widest">Resonance Active</div>
                                                        <div className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">Cinematic Synchrony v.04</div>
                                                    </div>
                                                    <h2 className="text-5xl lg:text-7xl font-display font-light text-white tracking-tight leading-none uppercase">{currentClip.title}</h2>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Modal Termination */}
                                        <button
                                            onClick={() => setShowPlayerModal(false)}
                                            className="absolute top-8 right-8 p-4 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 text-white/40 hover:text-white transition-all hover:bg-white/10 z-[120]"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Sync Sidebar */}
                                    <AnimatePresence>
                                        {!isSidebarCollapsed && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "350px", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="hidden lg:flex flex-col border-l border-white/5 bg-black overflow-hidden"
                                            >
                                                <div className="p-10 space-y-10 h-full overflow-y-auto custom-scrollbar">
                                                    <div className="space-y-2">
                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e9c49a]">Next Resonance</h3>
                                                        <p className="text-[9px] text-white/20 uppercase font-bold tracking-[0.2em]">Atmospheric Queued Sequence</p>
                                                    </div>

                                                    <div className="space-y-8">
                                                        {happyClips.map((clip, i) => (
                                                            <div
                                                                key={clip.id}
                                                                onClick={() => setCurrentClip(clip)}
                                                                className={cn(
                                                                    "flex gap-5 cursor-pointer group transition-all",
                                                                    currentClip.id === clip.id && "bg-white/[0.03] p-4 rounded-3xl -mx-4"
                                                                )}
                                                            >
                                                                <div className="w-24 aspect-video rounded-xl overflow-hidden relative flex-shrink-0 border border-white/5">
                                                                    <img src={clip.imageUrl || clip.videoUrl?.replace(/\.[^/.]+$/, ".jpg")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                                    {currentClip.id === clip.id && (
                                                                        <div className="absolute inset-0 bg-[#e9c49a]/40 flex items-center justify-center">
                                                                            <Play className="w-4 h-4 text-black fill-current" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 space-y-1 min-w-0">
                                                                    <h4 className={cn(
                                                                        "text-[10px] uppercase font-bold tracking-widest truncate transition-colors",
                                                                        currentClip.id === clip.id ? "text-[#e9c49a]" : "text-white/60 group-hover:text-white"
                                                                    )}>
                                                                        {clip.title}
                                                                    </h4>
                                                                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">{clip.duration ? formatTime(clip.duration) : "verified"}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(233, 196, 154, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(233, 196, 154, 0.2);
                }
            `}</style>
        </DashboardLayout>
    );
}
