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
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Watch() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const artifactId = searchParams.get("id");

    const [videoData, setVideoData] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [nextSequences, setNextSequences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);

    // Video State
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(true); // Default to true since autoPlay is on
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(true);
    const [showControls, setShowControls] = useState(true);
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
                    let artDoc = await getDoc(doc(db, "gallery_videos", artifactId));
                    if (!artDoc.exists()) {
                        artDoc = await getDoc(doc(db, "gallery_images", artifactId));
                    }

                    if (artDoc.exists()) {
                        setVideoData({ id: artDoc.id, ...artDoc.data() });
                    } else {
                        const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                        if (heroDoc.exists()) setVideoData({ id: 'hero', ...heroDoc.data() });
                    }
                } else {
                    const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                    if (heroDoc.exists()) setVideoData({ id: 'hero', ...heroDoc.data() });
                }

                const q = query(collection(db, "gallery_videos"), limit(12));
                const querySnapshot = await getDocs(q);
                setNextSequences(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Theater Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [artifactId]);

    // 4. Playback Pulse (YouTube-style transition)
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
    }, [loading, videoData?.videoUrl]);

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

    const artifactHandle = (videoData?.title || "unknown").toLowerCase().replace(/\s+/g, '_') + ".artifact";

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col pt-24 pb-20">
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 right-0 h-24 px-6 md:px-12 flex items-center justify-between z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5">
                <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-white/40 hover:text-[#e9c49a] transition-all group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Return to Nexus</span>
                </button>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#e9c49a] shadow-[0_0_20px_rgba(233,196,154,0.1)]">
                        <Flame className="w-3 h-3" /> Live Reflection
                    </div>
                </div>
            </div>

            <main className="max-w-[1850px] mx-auto w-full px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Main Projections Column */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="relative group">
                            {/* Ambient Glow Atmosphere */}
                            <div className="absolute inset-0 bg-[#e9c49a]/5 blur-[120px] rounded-[3rem] -z-10 group-hover:bg-[#e9c49a]/10 transition-colors duration-1000" />

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full rounded-[3.5rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)] border border-white/10 bg-black relative z-10"
                                style={{
                                    aspectRatio: videoAspectRatio,
                                    maxHeight: videoAspectRatio < 1 ? '82vh' : 'none',
                                    margin: '0 auto'
                                }}
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
                                    className="w-full h-full object-cover"
                                    onTimeUpdate={handleTimeUpdate}
                                    onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onClick={handleTogglePlay}
                                />

                                <AnimatePresence>
                                    {showControls && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/60 to-transparent pt-40 space-y-8"
                                        >
                                            <div className="relative group/seek h-1.5 flex items-center bg-white/10 rounded-full">
                                                <input type="range" min={0} max={0.999999} step="any" value={played} onChange={handleSeek} className="w-full h-full appearance-none bg-transparent cursor-pointer accent-[#e9c49a] relative z-20" />
                                                <div className="absolute top-0 left-0 h-full bg-[#e9c49a] rounded-full pointer-events-none z-10 shadow-[0_0_15px_rgba(233,196,154,0.5)]" style={{ width: `${played * 100}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-8">
                                                    <button onClick={handleTogglePlay} className="hover:scale-110 transition-transform active:scale-95">
                                                        {playing ? <Pause className="w-9 h-9 text-white fill-current" /> : <Play className="w-9 h-9 text-white fill-current translate-x-0.5" />}
                                                    </button>
                                                    <span className="text-[11px] font-mono text-white/40 tracking-[0.2em]">{Math.floor(played * duration / 60)}:{(Math.floor(played * duration % 60)).toString().padStart(2, '0')}</span>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="hidden md:flex items-center gap-4">
                                                        <span className="text-[9px] uppercase tracking-widest text-[#e9c49a]/30 font-bold">Spectral Resonance</span>
                                                        <div className="w-28 h-[3px] bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-[#e9c49a]/20 via-[#e9c49a] to-[#e9c49a]/20"
                                                                animate={{ x: ["-100%", "100%"] }}
                                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setMuted(!muted)} className="hover:text-[#e9c49a] transition-colors">{muted ? <VolumeX className="w-6 h-6 opacity-40" /> : <Volume2 className="w-6 h-6" />}</button>
                                                    <button onClick={() => videoRef.current?.requestFullscreen()} className="hover:text-[#e9c49a] transition-colors"><Maximize className="w-6 h-6 opacity-40" /></button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Metadata Section */}
                        <div className="space-y-12">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]/40">
                                        <Activity className="w-3.5 h-3.5" /> High-Fidelity Artifact
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-display font-light text-white tracking-tight leading-tight">
                                        {artifactHandle}
                                    </h1>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/5">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="w-16 h-16 ring-4 ring-white/5 shadow-2xl">
                                            <AvatarImage src={userData?.photoURL} />
                                            <AvatarFallback className="bg-white/5 font-serif text-[#e9c49a]">{userData?.fullName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-white mb-0.5">{userData?.fullName || "Elite Citizen"}</span>
                                            <span className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold opacity-60">{userData?.plan || "Explorer"} Protocol</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button className="px-8 py-4 rounded-2xl bg-white text-black text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#e9c49a] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] active:scale-95">
                                            Synchronize Link
                                        </button>
                                        <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#e9c49a]/10 hover:border-[#e9c49a]/30 transition-all text-white/40 hover:text-[#e9c49a] group">
                                            <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Resonate</span>
                                            <span className="text-[10px] font-bold sm:hidden">Like</span>
                                        </button>
                                        <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#e9c49a]/10 hover:border-[#e9c49a]/30 transition-all text-white/40 hover:text-[#e9c49a] group">
                                            <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Pulse</span>
                                            <span className="text-[10px] font-bold sm:hidden">Share</span>
                                        </button>
                                        <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#e9c49a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] font-bold text-[#e9c49a]/40 relative z-10">
                                        <Info className="w-4 h-4" /> Directorial Narrative
                                    </div>
                                    <p className="text-white/50 text-xl font-light leading-relaxed italic font-serif relative z-10">
                                        "{videoData?.description || "No archival notes detected for this artifact."}"
                                    </p>
                                </div>
                                <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between group">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] font-bold text-white/10">
                                            <Activity className="w-4 h-4" /> Indexing Telemetry
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                <span className="text-[10px] uppercase text-white/20 font-bold">Artifact ID</span>
                                                <span className="text-xs font-mono text-[#e9c49a]">{artifactId?.slice(-8).toUpperCase() || "CORE-ALPHA"}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                <span className="text-[10px] uppercase text-white/20 font-bold">Status</span>
                                                <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Synchronized
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-6">
                                        <motion.div className="h-full bg-[#e9c49a]/20" animate={{ width: ["30%", "100%", "30%"] }} transition={{ duration: 10, repeat: Infinity }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Archival Resonance Feed */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="sticky top-32 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-display font-light text-white tracking-tight">Archive Feed</h3>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#e9c49a]/40 font-bold">Next Sequences</p>
                                </div>
                                <LayoutGrid className="w-5 h-5 text-white/20" />
                            </div>

                            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
                                {nextSequences.map((seq, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={seq.id}
                                        onClick={() => navigate(`/watch?id=${seq.id}`)}
                                        className={cn(
                                            "flex gap-6 p-4 rounded-[2.5rem] border border-transparent transition-all duration-500 cursor-pointer group",
                                            artifactId === seq.id ? "bg-[#e9c49a]/10 border-[#e9c49a]/20" : "hover:bg-white/[0.03] hover:border-white/10"
                                        )}
                                    >
                                        <div className="w-32 aspect-[9/16] rounded-[1.5rem] overflow-hidden bg-[#0a0a0a] border border-white/5 relative flex-shrink-0">
                                            <img src={seq.imageUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500" />
                                            </div>
                                            {artifactId === seq.id && (
                                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#e9c49a] shadow-[0_0_10px_#e9c49a]" />
                                            )}
                                        </div>
                                        <div className="flex-1 py-3 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <h4 className={cn(
                                                    "text-sm font-bold tracking-tight transition-colors line-clamp-2",
                                                    artifactId === seq.id ? "text-[#e9c49a]" : "text-white/60 group-hover:text-white"
                                                )}>
                                                    {seq.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] uppercase tracking-widest font-bold text-white/30">
                                                        Alpha High
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#e9c49a]/40 font-mono font-bold">
                                                    #{seq.id.slice(-6).toUpperCase()}
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-[#e9c49a]/0 group-hover:text-[#e9c49a]/40 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button className="w-full h-16 rounded-[2rem] border border-white/5 bg-white/[0.02] text-white/30 text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-white/5 hover:text-white transition-all group relative overflow-hidden">
                                <span className="relative z-10">Load More Sequences</span>
                                <div className="absolute inset-0 bg-[#e9c49a]/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
