import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
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
    Maximize,
    Activity
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { collection, query, getDocs, limit, orderBy, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function Happy() {
    const { user: userData } = useOutletContext<{ user: any }>();
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
        if (userData) {
            // Already synced via context
        }
    }, [userData]);

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
                            className="absolute inset-0 bg-black/98 backdrop-blur-[120px]"
                            onClick={() => setShowPlayerModal(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 20 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="relative w-full h-full lg:h-[92vh] max-w-[1920px] bg-[#050505] lg:rounded-[3.5rem] overflow-hidden flex flex-col shadow-[0_0_200px_rgba(0,0,0,1)] border border-white/5 mx-auto"
                            onMouseMove={handleMouseMove}
                        >
                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                                {/* Main Stage (Player) */}
                                <div className={cn(
                                    "flex-1 flex flex-col transition-all duration-1000 ease-in-out uppercase overflow-y-auto custom-scrollbar",
                                    isSidebarCollapsed ? "w-full" : "lg:w-[72%]"
                                )}>
                                    <div className="relative flex-1 min-h-[50vh] bg-black flex items-center justify-center overflow-hidden border-b border-white/5">
                                        <div className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none overflow-hidden scale-150">
                                            <video src={currentClip.videoUrl} autoPlay muted playsInline loop className="w-full h-full object-cover" />
                                        </div>

                                        <video
                                            ref={videoRef}
                                            src={currentClip.videoUrl}
                                            autoPlay
                                            muted={muted}
                                            playsInline
                                            className="relative z-10 h-full w-auto max-w-full object-contain"
                                            onTimeUpdate={handleTimeUpdate}
                                            onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                                            onEnded={handleNext}
                                            onClick={handleTogglePlay}
                                        />

                                        {/* Premium Interaction Overlay (Controls Only) */}
                                        <div className={cn(
                                            "absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-700",
                                            (showControls || !playing) ? "opacity-100" : "opacity-0"
                                        )}>
                                            <div className="bg-gradient-to-b from-black/60 to-transparent p-8 flex justify-end items-start">
                                                <button
                                                    onClick={() => setShowPlayerModal(false)}
                                                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all backdrop-blur-3xl group"
                                                >
                                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                                </button>
                                            </div>

                                            <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent p-12 space-y-10 group/ui">
                                                <div className="space-y-6">
                                                    <div className="relative h-1.5 bg-white/5 rounded-full cursor-pointer group/progress overflow-hidden" onClick={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const x = e.clientX - rect.left;
                                                        const val = x / rect.width;
                                                        if (videoRef.current) videoRef.current.currentTime = val * videoRef.current.duration;
                                                    }}>
                                                        <motion.div
                                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e9c49a] via-[#8b6544] to-[#f5d9b8] rounded-full shadow-[0_0_20px_rgba(233,196,154,0.3)]"
                                                            style={{ width: `${played * 100}%` }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-10">
                                                            <button onClick={handlePrev} className="text-white/20 hover:text-white transition-all scale-100 hover:scale-120 active:scale-90"><SkipBack className="w-5 h-5 fill-current" /></button>
                                                            <button onClick={handleTogglePlay} className="w-20 h-20 rounded-[2rem] bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                                                                {playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                                                            </button>
                                                            <button onClick={handleNext} className="text-white/20 hover:text-white transition-all scale-100 hover:scale-120 active:scale-90"><SkipForward className="w-5 h-5 fill-current" /></button>

                                                            <div className="h-10 w-px bg-white/10 mx-2" />

                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Duration Scan</span>
                                                                <div className="text-[12px] font-bold text-[#e9c49a] tracking-[0.2em] font-mono">
                                                                    {formatTime(played * duration)} <span className="text-white/20 mx-1">/</span> {formatTime(duration)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-8">
                                                            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                                                <button onClick={() => setMuted(!muted)} className="text-white/40 hover:text-white transition-all">
                                                                    {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                                                </button>
                                                                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-white/40" style={{ width: muted ? '0%' : '80%' }} />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                                                className={cn("p-4 rounded-2xl transition-all", !isSidebarCollapsed ? "bg-[#e9c49a] text-black" : "bg-white/5 text-white/40 hover:text-white")}
                                                            >
                                                                <LayoutGrid className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta Info Section (Below Player) */}
                                    <div className="p-12 space-y-8 bg-[#050505]">
                                        <div className="space-y-4 max-w-5xl">
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="px-4 py-1.5 bg-[#e9c49a] text-black rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
                                                >
                                                    Resonance Active
                                                </motion.div>
                                                <div className="h-px w-12 bg-[#e9c49a]/30" />
                                                <span className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em]">Cinematic High Frequency</span>
                                            </div>
                                            <h2 className="text-4xl lg:text-5xl font-display font-light text-white tracking-tight leading-none uppercase lg:ml-[-4px] break-words">
                                                {currentClip.title.split(' ').map((word: string, i: number) => (
                                                    <span key={i} className={cn(i % 2 !== 0 && "text-[#e9c49a] italic font-serif")}>{word} </span>
                                                ))}
                                            </h2>
                                            <div className="pt-4 flex items-center gap-6 border-t border-white/5">
                                                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 hover:bg-[#e9c49a]/10 hover:text-[#e9c49a] transition-all border border-white/5">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Like</span>
                                                </button>
                                                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 hover:bg-[#e9c49a]/10 hover:text-[#e9c49a] transition-all border border-white/5">
                                                    <Share className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Share</span>
                                                </button>
                                                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 hover:bg-[#e9c49a]/10 hover:text-[#e9c49a] transition-all border border-white/5">
                                                    <Download className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Save</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Sidebar */}
                                <AnimatePresence>
                                    {!isSidebarCollapsed && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0, x: 100 }}
                                            animate={{ width: "400px", opacity: 1, x: 0 }}
                                            exit={{ width: 0, opacity: 0, x: 100 }}
                                            className="hidden lg:flex flex-col border-l border-white/5 bg-[#080808] overflow-hidden z-30"
                                        >
                                            <div className="p-10 space-y-12 h-full overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/40">
                                                <div className="space-y-4">
                                                    <div className="w-12 h-1 bg-[#e9c49a] rounded-full" />
                                                    <div className="space-y-1">
                                                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#e9c49a]">Next Resonance</h3>
                                                        <p className="text-[9px] text-white/20 uppercase font-bold tracking-[0.2em]">Atmospheric Cloud Registry</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {happyClips.map((clip, i) => (
                                                        <motion.div
                                                            key={clip.id}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            onClick={() => setCurrentClip(clip)}
                                                            className={cn(
                                                                "flex items-center gap-6 cursor-pointer group transition-all relative p-5 rounded-[2rem] border overflow-hidden",
                                                                currentClip.id === clip.id
                                                                    ? "bg-[#e9c49a]/5 border-[#e9c49a]/20"
                                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                                            )}
                                                        >
                                                            <div className="w-28 aspect-[16/10] rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/5">
                                                                <img src={clip.imageUrl || clip.videoUrl?.replace(/\.[^/.]+$/, ".jpg")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                                                {currentClip.id === clip.id && (
                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                                                        <motion.div
                                                                            animate={{ scale: [1, 1.2, 1] }}
                                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                                            className="w-8 h-8 rounded-full bg-[#e9c49a] flex items-center justify-center text-black"
                                                                        >
                                                                            <div className="flex gap-0.5">
                                                                                {[1, 2, 3].map(bar => <div key={bar} className="w-0.5 h-3 bg-black animate-pulse" />)}
                                                                            </div>
                                                                        </motion.div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 space-y-2 min-w-0">
                                                                <h4 className={cn(
                                                                    "text-[10px] uppercase font-black tracking-[0.2em] truncate transition-colors",
                                                                    currentClip.id === clip.id ? "text-[#e9c49a]" : "text-white/60 group-hover:text-white"
                                                                )}>
                                                                    {clip.title}
                                                                </h4>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">{clip.duration ? formatTime(clip.duration) : "4K CINEMA"}</span>
                                                                    {currentClip.id === clip.id && <Sparkles className="w-3 h-3 text-[#e9c49a]" />}
                                                                </div>
                                                            </div>
                                                        </motion.div>
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
        </div>
    );
}
