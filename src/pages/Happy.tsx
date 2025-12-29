import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Sun,
    Music,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Headphones,
    Volume2,
    Repeat,
    Shuffle,
    X,
    Maximize2,
    Layers
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
    const [happyTracks, setHappyTracks] = useState<any[]>([]);
    const [currentTrack, setCurrentTrack] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [played, setPlayed] = useState(0); // Progress percentage (0 to 1)
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
        const fetchHappyTracks = async () => {
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
                    console.warn("Ordered tracks fetch failed, falling back", err);
                    const q2 = query(collection(db, "happy_tracks"), limit(20));
                    const snap2 = await getDocs(q2);
                    docs = snap2.docs;
                }

                if (docs.length === 0) {
                    const q3 = query(collection(db, "happy_tracks"), limit(20));
                    const snap3 = await getDocs(q3);
                    docs = snap3.docs;
                }

                const tracks = docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHappyTracks(tracks);

                if (tracks.length > 0 && !currentTrack) {
                    setCurrentTrack(tracks[0]);
                }
            } catch (error) {
                console.error("Error fetching happy tracks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHappyTracks();
    }, []);

    const handlePlayTrack = (track: any) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        setShowPlayerModal(true);
        setPlayed(0); // Reset progress on new track
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
        if (!currentTrack) return;
        const currentIndex = happyTracks.findIndex(t => t.id === currentTrack.id);
        const nextTrack = happyTracks[(currentIndex + 1) % happyTracks.length];
        setCurrentTrack(nextTrack);
    };

    const handlePrev = () => {
        if (!currentTrack) return;
        const currentIndex = happyTracks.findIndex(t => t.id === currentTrack.id);
        const prevTrack = happyTracks[(currentIndex - 1 + happyTracks.length) % happyTracks.length];
        setCurrentTrack(prevTrack);
    };

    return (
        <DashboardLayout user={userData}>
            <div className="min-h-screen pb-32 space-y-16">
                {/* Header Section */}
                <div className="relative pt-20 pb-12 overflow-hidden rounded-[4rem] bg-gradient-to-b from-orange-500/10 via-black to-black border border-white/5 px-12 md:px-20">
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-500/10 blur-[150px] rounded-full animate-pulse" />
                    <div className="relative z-10 space-y-6">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-8 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                            <Sun className="w-8 h-8" />
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-display font-light tracking-tight leading-none text-white">
                            Happy <span className="text-orange-400 italic font-serif">Aura</span> Hub
                        </h1>
                        <p className="text-white/40 text-lg md:text-xl font-light max-w-2xl font-sans tracking-wide">
                            The auditory sanctuary for radiant frequencies. Synchronize your neural core with verified euphoric tracks.
                        </p>
                    </div>
                </div>

                {/* Track List */}
                <div className="space-y-10 px-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <Headphones className="w-5 h-5 text-orange-400" />
                            <h2 className="text-2xl font-display font-light text-white tracking-widest uppercase">Verified Frequencies</h2>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">{happyTracks.length} DISCOVERIES</span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-24 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {happyTracks.map((track, idx) => (
                                <motion.div
                                    key={track.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handlePlayTrack(track)}
                                    className={cn(
                                        "group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-[2.5rem] p-8 transition-all cursor-pointer flex items-center gap-10",
                                        currentTrack?.id === track.id && "bg-orange-500/[0.03] border-orange-500/20"
                                    )}
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-all group-hover:text-black">
                                        {currentTrack?.id === track.id && isPlaying ? (
                                            <div className="flex items-end gap-1 h-6">
                                                {[1, 2, 3].map((i) => (
                                                    <motion.div key={i} animate={{ height: ["30%", "100%", "50%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} className="w-1 bg-current rounded-full" />
                                                ))}
                                            </div>
                                        ) : (
                                            <Play className="w-6 h-6 fill-current" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">{track.title}</h3>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400/40 px-3 py-1 bg-orange-500/5 rounded-full border border-orange-500/10">Synchronized</span>
                                        </div>
                                        <p className="text-white/40 font-light text-sm italic max-w-2xl leading-relaxed">{track.description}</p>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end gap-2 text-right">
                                        <span className="text-white/10 text-[10px] uppercase font-bold tracking-widest">Duration</span>
                                        <span className="text-white text-lg font-mono tracking-tight">{track.duration ? formatTime(track.duration) : "LIVE"}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* mini-player */}
                <AnimatePresence>
                    {currentTrack && isPlaying && !showPlayerModal && (
                        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={() => setShowPlayerModal(true)} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-orange-950/40 backdrop-blur-3xl border border-orange-400/20 rounded-full p-4 z-40 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:border-orange-400/40 transition-all">
                            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-black"><Music className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] uppercase tracking-widest text-orange-400 font-bold mb-1">Radiating Frequency</p>
                                <h4 className="text-white text-sm font-bold truncate">{currentTrack.title}</h4>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Spotify-Killer Playback Modal */}
                <AnimatePresence>
                    {showPlayerModal && currentTrack && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowPlayerModal(false)} />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="relative w-full max-w-6xl h-full max-h-[850px] bg-gradient-to-br from-orange-950/20 via-black to-black border border-white/5 rounded-[4rem] flex flex-col lg:flex-row overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.1)]">
                                <div className="hidden lg:flex w-[45%] h-full relative p-20 flex-col justify-between items-center border-r border-white/5">
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/5 blur-[120px] rounded-full animate-pulse" />
                                    </div>
                                    <div className="relative z-10 w-full aspect-square rounded-[3rem] bg-orange-400/10 border border-orange-400/30 flex items-center justify-center overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                                        <motion.div animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} className="w-40 h-40 rounded-full border-2 border-orange-500/20 flex items-center justify-center">
                                            <Music className="w-20 h-20 text-orange-400 opacity-40" />
                                        </motion.div>
                                        <div className="absolute bottom-10 left-10 right-10 flex justify-center gap-2 h-20 items-end">
                                            {[...Array(20)].map((_, i) => (
                                                <motion.div key={i} animate={{ height: isPlaying ? [`${Math.random() * 40 + 10}%`, `${Math.random() * 90 + 20}%`, `${Math.random() * 40 + 10}%`] : "10%" }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }} className="w-1 bg-orange-400/40 rounded-full" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-center space-y-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Sparkles className="w-4 h-4 text-orange-400" />
                                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]">Planetary High Fidelity</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 h-full p-12 lg:p-20 flex flex-col justify-center">
                                    <button onClick={() => setShowPlayerModal(false)} className="absolute top-10 right-10 p-4 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                                    <div className="space-y-16">
                                        <div className="space-y-6">
                                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">Now Radiating</span>
                                            </motion.div>
                                            <div className="space-y-4">
                                                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-display font-light text-white tracking-tight">{currentTrack.title}</motion.h2>
                                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 text-lg md:text-xl font-light italic leading-relaxed">{currentTrack.description}</motion.p>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            {/* progress bar */}
                                            <div className="space-y-4">
                                                <div onClick={handleSeek} className="relative h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group hover:h-3 transition-all">
                                                    <motion.div className="absolute inset-y-0 left-0 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)] z-10" style={{ width: `${played * 100}%` }} />
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex justify-between text-[10px] font-mono tracking-widest text-white/40 font-bold">
                                                    <span>{formatTime(played * duration)}</span>
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex items-center justify-between">
                                                <button className="text-white/20 hover:text-white transition-colors"><Shuffle className="w-6 h-6" /></button>
                                                <div className="flex items-center gap-12">
                                                    <button onClick={handlePrev} className="text-white hover:text-orange-400 transition-colors"><SkipBack className="w-8 h-8 fill-current" /></button>
                                                    <button onClick={togglePlay} className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)]">
                                                        {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                                                    </button>
                                                    <button onClick={handleNext} className="text-white hover:text-orange-400 transition-colors"><SkipForward className="w-8 h-8 fill-current" /></button>
                                                </div>
                                                <button className="text-white/20 hover:text-white transition-colors"><Repeat className="w-6 h-6" /></button>
                                            </div>
                                        </div>

                                        <div className="hidden">
                                            <DynamicPlayer
                                                ref={playerRef}
                                                url={currentTrack?.audioUrl || ""}
                                                playing={isPlaying}
                                                onProgress={(state: any) => setPlayed(state.played)}
                                                onDuration={(d: number) => setDuration(d)}
                                                onEnded={handleNext}
                                                onError={(e: any) => console.error("Playback error:", e)}
                                                width="0"
                                                height="0"
                                                volume={0.8}
                                                playsinline
                                            />
                                        </div>

                                        <div className="flex items-center gap-10 pt-10 border-t border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Layers className="w-4 h-4 text-orange-400" /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest leading-none">Vibe State</span>
                                                    <span className="text-xs text-white/60">Alpha Synchronization</span>
                                                </div>
                                            </div>
                                            <div className="flex-1" />
                                            <Button variant="outline" className="rounded-full border-white/10 text-white/40 hover:text-white gap-2"><Maximize2 className="w-4 h-4" /> Fullscreen Mode</Button>
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
