import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Sun,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Video,
    Volume2,
    Repeat,
    Shuffle,
    X,
    Maximize2,
    Layers,
    Eye,
    Music,
    Zap,
    Film
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { collection, query, getDocs, limit, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactPlayer from "react-player";

// Dynamic Wrapper to bypass strict JSX type mismatches
const DynamicPlayer = (props: any) => {
    return <ReactPlayer {...props} />;
};

export default function Happy() {
    const [userData, setUserData] = useState<any>(null);
    const [happyClips, setHappyClips] = useState<any[]>([]);
    const [currentClip, setCurrentClip] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const { doc, getDoc } = await import("firebase/firestore");
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
                try {
                    const q = query(
                        collection(db, "happy_tracks"),
                        orderBy("createdAt", "desc"),
                        limit(20)
                    );
                    const snap = await getDocs(q);
                    docs = snap.docs;
                } catch (err) {
                    console.warn("Ordered clips fetch failed, falling back", err);
                    const q2 = query(collection(db, "happy_tracks"), limit(20));
                    const snap2 = await getDocs(q2);
                    docs = snap2.docs;
                }

                if (docs.length === 0) {
                    const q3 = query(collection(db, "happy_tracks"), limit(20));
                    const snap3 = await getDocs(q3);
                    docs = snap3.docs;
                }

                const clips = docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHappyClips(clips);

                if (clips.length > 0 && !currentClip) {
                    setCurrentClip(clips[0]);
                }
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
        setIsPlaying(true);
        setShowPlayerModal(true);
        setPlayed(0);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!playerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        playerRef.current.seekTo(percentage);
        setPlayed(percentage);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (!currentClip) return;
        const currentIndex = happyClips.findIndex(t => t.id === currentClip.id);
        const nextClip = happyClips[(currentIndex + 1) % happyClips.length];
        setCurrentClip(nextClip);
    };

    const handlePrev = () => {
        if (!currentClip) return;
        const currentIndex = happyClips.findIndex(t => t.id === currentClip.id);
        const prevClip = happyClips[(currentIndex - 1 + happyClips.length) % happyClips.length];
        setCurrentClip(prevClip);
    };

    return (
        <DashboardLayout user={userData}>
            <div className="min-h-screen pb-32 space-y-16">
                {/* Immersive Header */}
                <div className="relative h-[60vh] flex flex-col justify-end p-12 lg:p-24 overflow-hidden rounded-[4rem] border border-white/5 mx-4">
                    {/* Background Visualizer */}
                    <div className="absolute inset-0 bg-black">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/40 to-transparent z-10" />
                        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-orange-600/10 blur-[180px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-600/5 blur-[120px] rounded-full" />
                    </div>

                    <div className="relative z-10 space-y-8 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.4em] text-orange-400/60 uppercase">System Neural Core</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-7xl md:text-9xl font-display font-light tracking-tight leading-none text-white lg:ml-[-5px]"
                        >
                            Happy <span className="text-orange-400 italic">Core.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/40 text-xl md:text-2xl font-light max-w-2xl font-sans tracking-wide leading-relaxed"
                        >
                            The planetary visual sanctuary. High-clarity cinematics synchronized for your emotional resonance at <span className="text-orange-400 font-medium">Alpha-Stage frequencies</span>.
                        </motion.p>
                    </div>
                </div>

                {/* Clips Grid */}
                <div className="space-y-12 px-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Film className="w-5 h-5 text-orange-400" />
                            </div>
                            <h2 className="text-3xl font-display font-light text-white tracking-widest uppercase">Resonance Index</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">{happyClips.length} Verified Artifacts</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {happyClips.map((clip, idx) => (
                                <motion.div
                                    key={clip.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handlePlayClip(clip)}
                                    className={cn(
                                        "group relative bg-[#0D121F]/40 hover:bg-[#0D121F] border border-white/5 rounded-[3rem] p-4 transition-all cursor-pointer flex flex-col gap-6 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] hover:-translate-y-2",
                                        currentClip?.id === clip.id && "border-orange-500/30 bg-orange-500/[0.02]"
                                    )}
                                >
                                    {/* Card Visual Stage */}
                                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/40">
                                        <img
                                            src={clip.imageUrl || clip.videoUrl?.replace(/\.[^/.]+$/, ".jpg") || `https://source.unsplash.com/featured/?radiant,light&sig=${idx}`}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                            alt={clip.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                        {/* Play Hover State */}
                                        <div className="absolute inset-0 flex items-center justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                                <Play className="w-8 h-8 fill-current ml-1" />
                                            </div>
                                        </div>

                                        {/* Corner Badges */}
                                        <div className="absolute top-4 right-4 z-20">
                                            {clip.videoUrl ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                                                    <Video className="w-3 h-3 text-orange-400" />
                                                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Cinema</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                                                    <Music className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Audio</span>
                                                </div>
                                            )}
                                        </div>

                                        {clip.duration && (
                                            <div className="absolute bottom-6 left-6 z-20 text-[9px] font-mono font-bold text-white/60 tracking-widest">
                                                {formatTime(clip.duration)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Metadata */}
                                    <div className="px-4 pb-4 space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[8px] uppercase tracking-[0.3em] text-orange-400/60 font-bold mb-1">Verification // verified</p>
                                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-orange-400 transition-colors line-clamp-1">{clip.title}</h3>
                                        </div>
                                        <p className="text-white/20 font-light text-xs italic line-clamp-2 leading-relaxed h-8 group-hover:text-white/40 transition-colors">{clip.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* mini-player */}
                <AnimatePresence>
                    {currentClip && isPlaying && !showPlayerModal && (
                        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={() => setShowPlayerModal(true)} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-orange-950/40 backdrop-blur-4xl border border-orange-400/20 rounded-full p-2.5 z-40 flex items-center gap-6 shadow-[0_40px_100px_rgba(0,0,0,0.6)] cursor-pointer hover:border-orange-400/40 transition-all">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500/20 flex-shrink-0 relative">
                                <img src={currentClip.imageUrl || currentClip.videoUrl?.replace(/\.[^/.]+$/, ".jpg")} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[8px] uppercase tracking-[0.3em] text-orange-400/60 font-bold mb-0.5">Radiating Frequency</p>
                                <h4 className="text-white text-sm font-bold truncate tracking-tight">{currentClip.title}</h4>
                            </div>
                            <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-xl active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* EPIC PLAYER MODAL (Directorial Stage) */}
                <AnimatePresence>
                    {showPlayerModal && currentClip && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-8 overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/98 backdrop-blur-[60px]"
                                onClick={() => setShowPlayerModal(false)}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                                className="relative w-full max-w-screen-2xl h-full max-h-[900px] bg-black border border-white/5 rounded-none lg:rounded-[4rem] flex flex-col overflow-hidden shadow-[0_0_150px_rgba(249,115,22,0.1)] group/modal"
                            >
                                {/* THE DIRECTORIAL STAGE (VIDEO/VISUALS) */}
                                <div className="relative flex-1 bg-[#050505] overflow-hidden flex items-center justify-center group/player">

                                    {currentClip.videoUrl ? (
                                        <div className="w-full h-full relative z-10">
                                            <DynamicPlayer
                                                ref={playerRef}
                                                url={currentClip.videoUrl}
                                                playing={isPlaying}
                                                onProgress={(state: any) => setPlayed(state.played)}
                                                onDuration={(d: number) => setDuration(d)}
                                                onEnded={handleNext}
                                                width="100%"
                                                height="100%"
                                                volume={0.8}
                                                playsinline
                                            />
                                        </div>
                                    ) : (
                                        /* AUDIO-ONLY SPECTRAL VIEWPORT */
                                        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-950/20 via-black to-black">
                                            {/* Pulse Rings */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                {[1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity, delay: i * 1.3 }}
                                                        className="absolute w-[40vh] h-[40vh] border-2 border-orange-500/20 rounded-full"
                                                    />
                                                ))}
                                            </div>

                                            <div className="relative z-20 flex flex-col items-center gap-10">
                                                <div className="w-64 h-64 rounded-[4rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center relative shadow-[0_0_100px_rgba(233,110,0,0.1)]">
                                                    <motion.div
                                                        animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
                                                        transition={{ duration: 0.5, repeat: Infinity }}
                                                        className="w-40 h-40 rounded-full border-2 border-orange-500/40 flex items-center justify-center"
                                                    >
                                                        <Music className="w-16 h-16 text-orange-400" />
                                                    </motion.div>

                                                    {/* Orbiting Particles */}
                                                    <div className="absolute inset-0">
                                                        {[...Array(6)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 10, repeat: Infinity, delay: i * 1.5, ease: "linear" }}
                                                                className="absolute inset-0"
                                                            >
                                                                <div className="w-2 h-2 rounded-full bg-orange-400/40 absolute top-0 left-1/2 -translate-x-1/2" />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] uppercase tracking-[0.8em] font-bold text-orange-400 animate-pulse">Spectral Audio Active</span>
                                            </div>

                                            {/* Hidden Audio Player */}
                                            <div className="hidden">
                                                <DynamicPlayer
                                                    ref={playerRef}
                                                    url={currentClip.audioUrl}
                                                    playing={isPlaying}
                                                    onProgress={(state: any) => setPlayed(state.played)}
                                                    onDuration={(d: number) => setDuration(d)}
                                                    onEnded={handleNext}
                                                    volume={0.8}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Modal Close (Directorial Termination) */}
                                    <button
                                        onClick={() => setShowPlayerModal(false)}
                                        className="absolute top-10 right-10 p-5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white z-[110] group"
                                    >
                                        <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
                                    </button>

                                    {/* Metadata Overlay (Netflix Style) */}
                                    <div className="absolute inset-x-0 bottom-0 p-12 lg:p-24 bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none">
                                        <div className="space-y-6 max-w-5xl translate-y-20 group-modal:translate-y-0 opacity-0 group-modal:opacity-100 transition-all duration-1000">
                                            <div className="flex items-center gap-4">
                                                <div className="px-4 py-2 bg-orange-500 rounded-full">
                                                    <span className="text-[10px] uppercase tracking-widest text-black font-black">Verify // Sync</span>
                                                </div>
                                                <div className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                                                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Resonance Level: 0.98</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h2 className="text-5xl lg:text-8xl font-display font-light text-white tracking-tighter leading-none">
                                                    {currentClip.title}
                                                </h2>
                                                <p className="text-white/40 text-xl lg:text-2xl font-light italic max-w-3xl leading-relaxed">
                                                    {currentClip.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* THE CONTROL COMMAND CENTER (BOTTOM PILL) */}
                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-[105]">
                                    <div className="bg-white/5 backdrop-blur-4xl border border-white/10 rounded-[3rem] p-8 space-y-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                                        {/* Progress Command */}
                                        <div className="space-y-4">
                                            <div onClick={handleSeek} className="relative h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group hover:h-3 transition-all">
                                                <motion.div className="absolute inset-y-0 left-0 bg-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.6)] z-10" style={{ width: `${played * 100}%` }} />
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-mono tracking-[0.3em] text-white/20 font-bold uppercase">
                                                <span>{formatTime(played * duration)} (SYNCHRONIZED)</span>
                                                <span>{formatTime(duration)} (TOTAL DEPTH)</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-10">
                                            <div className="flex items-center gap-8">
                                                <button onClick={handlePrev} className="text-white/10 hover:text-orange-400 transition-all hover:scale-110 active:scale-90"><SkipBack className="w-8 h-8 fill-current" /></button>
                                                <button
                                                    onClick={togglePlay}
                                                    className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
                                                >
                                                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-2" />}
                                                </button>
                                                <button onClick={handleNext} className="text-white/10 hover:text-orange-400 transition-all hover:scale-110 active:scale-90"><SkipForward className="w-8 h-8 fill-current" /></button>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="hidden lg:flex flex-col items-end text-right">
                                                    <span className="text-[8px] text-[#e9c49a] uppercase font-bold tracking-widest mb-1 leading-none">Transmission Node</span>
                                                    <span className="text-xs text-white/60 font-light truncate max-w-[150px]">{currentClip.provider || "Cloudinary"} // Planetary</span>
                                                </div>
                                                <div className="h-10 w-px bg-white/5 mx-2" />
                                                <div className="flex items-center gap-4">
                                                    <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-orange-400 transition-all"><Volume2 className="w-5 h-5" /></button>
                                                    <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-orange-400 transition-all"><Maximize2 className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
