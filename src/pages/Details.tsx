import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Play,
    Star,
    Clock,
    Calendar,
    ChevronLeft,
    Plus,
    Share2,
    Heart,
    Info,
    CheckCircle2,
    TrendingUp,
    Bookmark,
    Film,
    Settings,
    Maximize,
    Volume2,
    VolumeX,
    Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X as CloseIcon, Layers } from 'lucide-react';
import ReactPlayer from 'react-player';

interface AmoraContent {
    Title: string;
    Plot: string;
    Poster: string;
    imdbRating: string;
    Runtime: string;
    Year: string;
    Rated: string;
    Genre: string;
    Type: 'movie' | 'series';
    Director: string;
    Writer: string;
    Actors: string;
    Metascore: string;
    imdbVotes: string;
    videoUrl?: string;
    imdbID: string;
    BoxOffice?: string;
}

const Details = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<AmoraContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedServer, setSelectedServer] = useState("Server 1");
    const [activeSeason, setActiveSeason] = useState(1);
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [seasonData, setSeasonData] = useState<any>(null);

    // Video Control States
    const playerRef = useRef<any>(null);
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
        controlTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        return `${mm}:${ss}`;
    };

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) {
                setError("Missing sequence identifier");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Check if it's an IMDb ID
                if (id.startsWith('tt')) {
                    const OMDB_API_KEY = "93272d7a";
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}&plot=full`);
                    const data = await res.json();
                    if (data.Response === "True") {
                        setMovie(data);
                        return;
                    }
                }

                // Fallback or Local Artifact Fetch
                const collections = ["gallery_videos", "gallery_images", "mood_content", "shorts", "happy_tracks", "sad_tracks"];
                let foundDocData: any = null;

                for (const collName of collections) {
                    try {
                        const directDoc = await getDoc(doc(db, collName, id));
                        if (directDoc.exists()) {
                            foundDocData = { id: directDoc.id, ...directDoc.data() };
                            break;
                        }

                        const q = query(collection(db, collName), where("id", "==", id), limit(1));
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
                    setMovie({
                        Title: foundDocData.title || "Untitled Artifact",
                        Plot: foundDocData.description || "No description available for this archival artifact.",
                        Poster: foundDocData.imageUrl || foundDocData.thumbnailUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80",
                        imdbRating: foundDocData.rating || "8.5",
                        Runtime: foundDocData.duration ? `${Math.floor(foundDocData.duration / 60)} min` : "0 min",
                        Year: foundDocData.year || "2024",
                        Rated: "PG-13",
                        Genre: foundDocData.category || "Cinematic Artifact",
                        Type: (foundDocData.type || "movie") as 'movie' | 'series',
                        Director: "Amora AI",
                        Writer: "Neural Sequence",
                        Actors: "Amora Community",
                        Metascore: "92",
                        imdbVotes: (foundDocData.views || 0).toLocaleString(),
                        videoUrl: foundDocData.videoUrl,
                        imdbID: id,
                        BoxOffice: "N/A"
                    });
                } else {
                    setError("Sequence not found in neural archives");
                }
            } catch (error) {
                console.error("Fetch Details Error:", error);
                setError("Neural synchronization failed");
                toast.error("Failed to load details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    // Fetch Season Data
    useEffect(() => {
        const fetchSeason = async () => {
            if (movie?.Type === "series" && id) {
                try {
                    const OMDB_API_KEY = "93272d7a";
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}&Season=${activeSeason}`);
                    const data = await res.json();
                    if (data.Response === "True") {
                        setSeasonData(data);
                    }
                } catch (e) {
                    console.error("Season fetch error:", e);
                }
            }
        };
        fetchSeason();
    }, [movie?.imdbID, activeSeason, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="space-y-4 text-center">
                    <div className="w-16 h-16 border-4 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin mx-auto" />
                    <p className="text-[#e9c49a] font-black uppercase tracking-[0.3em] text-[10px]">Neural Syncing...</p>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Film className="w-8 h-8 text-red-500/40" />
                </div>
                <h2 className="text-2xl font-display font-light text-white/40 uppercase tracking-widest">{error || "Neural Void Detected"}</h2>
                <Button onClick={() => navigate(-1)} variant="outline" className="rounded-2xl border-white/10 hover:bg-white/10">Return to Origin</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#e9c49a] selection:text-black">
            {/* Immersive Background */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10" />
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    src={movie.Poster !== "N/A" ? movie.Poster : ""}
                    className="w-full h-full object-cover blur-2xl"
                    alt=""
                />
            </div>

            {/* Content Container */}
            <main className="relative z-10 container mx-auto px-6 pt-32 pb-20">
                <button
                    onClick={() => navigate(-1)}
                    className="group mb-12 flex items-center gap-3 text-white/40 hover:text-[#e9c49a] transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    <div className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center group-hover:border-[#e9c49a]/40 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    Back to Navigation
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
                    {/* Left Side: Cinematic Details */}
                    <div className="space-y-12">
                        <div className="space-y-8">
                            {/* Meta Tags */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap items-center gap-3"
                            >
                                <div className="px-4 py-2 rounded-xl bg-[#e9c49a] text-black text-[10px] font-black uppercase tracking-[0.2em]">
                                    {movie.Type}
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                    <TrendingUp className="w-3 h-3 inline mr-2" />
                                    POPULAR
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-[#e9c49a]/10 border border-[#e9c49a]/30 text-[#e9c49a] text-[10px] font-black uppercase tracking-widest">
                                    4K ULTRA HD
                                </div>
                            </motion.div>

                            {/* Title & Stats */}
                            <div className="space-y-6">
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9]"
                                >
                                    {movie.Title}
                                </motion.h1>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap items-center gap-8 text-white/40 font-black text-[11px] uppercase tracking-[0.2em]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-[#e9c49a] fill-[#e9c49a]" />
                                        <span className="text-white">{movie.imdbRating}</span> / 10
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {movie.Runtime}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {movie.Year}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-1.5 py-0.5 border border-white/20 rounded text-[9px]">
                                            {movie.Rated}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap items-center gap-4"
                            >
                                <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="h-16 px-12 rounded-3xl bg-[#e9c49a] text-black hover:bg-white hover:scale-105 transition-all duration-500 font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_-10px_rgba(233,196,154,0.3)]"
                                        >
                                            Experience Now
                                            <Play className="ml-3 w-5 h-5 fill-current" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[100vw] w-screen h-screen p-0 bg-black border-none z-[100]">
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            {/* Header Controls */}
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-8 z-[110] flex items-center gap-4 w-full md:w-auto px-6 md:px-0 justify-between md:justify-start">
                                                <button
                                                    onClick={() => setShowVideoModal(false)}
                                                    className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-all backdrop-blur-xl"
                                                >
                                                    <CloseIcon className="w-6 h-6" />
                                                </button>
                                                <div className="hidden md:block">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e9c49a]">Neural Sequence Protocol</p>
                                                    <h4 className="text-white text-sm font-bold uppercase truncate max-w-[300px]">{movie.Title}</h4>
                                                </div>
                                            </div>

                                            {/* Server Selector - Only for External */}
                                            {movie.imdbID?.startsWith('tt') && (
                                                <div className="absolute top-24 md:top-8 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 z-[110] flex gap-2">
                                                    {["Server 1", "Server 2", "Server 3"].map((server) => (
                                                        <button
                                                            key={server}
                                                            onClick={() => setSelectedServer(server)}
                                                            className={cn(
                                                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border shadow-2xl",
                                                                selectedServer === server
                                                                    ? "bg-[#e9c49a] text-black border-[#e9c49a]"
                                                                    : "bg-black/60 text-white/60 border-white/10 hover:bg-white/20 hover:border-white/30"
                                                            )}
                                                        >
                                                            {server}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Video Framework */}
                                            <div className="w-full h-full bg-black relative">
                                                {movie.imdbID?.startsWith('tt') ? (
                                                    <iframe
                                                        key={`${selectedServer}-${activeSeason}-${activeEpisode}`}
                                                        src={
                                                            selectedServer === "Server 1"
                                                                ? `https://vidsrc.to/embed/${movie.Type === 'series' ? 'tv' : 'movie'}/${movie.imdbID}${movie.Type === 'series' ? `/${activeSeason}/${activeEpisode}` : ''}`
                                                                : selectedServer === "Server 2"
                                                                    ? `https://vidsrc.xyz/embed/${movie.Type === 'series' ? 'tv' : 'movie'}/${movie.imdbID}${movie.Type === 'series' ? `/${activeSeason}/${activeEpisode}` : ''}`
                                                                    : `https://embed.su/embed/${movie.Type === 'series' ? 'tv' : 'movie'}/${movie.imdbID}${movie.Type === 'series' ? `/${activeSeason}/${activeEpisode}` : ''}`
                                                        }
                                                        className="w-full h-full border-none"
                                                        allowFullScreen
                                                        allow="autoplay; encrypted-media"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center p-0 relative group/player" onMouseMove={handleMouseMove}>
                                                        <div className="w-full h-full relative">
                                                            {(() => {
                                                                const Player = ReactPlayer as any;
                                                                return (
                                                                    <Player
                                                                        ref={playerRef}
                                                                        url={movie?.videoUrl}
                                                                        playing={playing}
                                                                        volume={volume}
                                                                        muted={muted}
                                                                        width="100%"
                                                                        height="100%"
                                                                        onProgress={(state: any) => setPlayed(state.played)}
                                                                        onDuration={(d: number) => setDuration(d)}
                                                                    />
                                                                );
                                                            })()}

                                                            {/* Custom UI: Bottom Controls */}
                                                            <div className={cn(
                                                                "absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end transition-opacity duration-500",
                                                                showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
                                                            )}>
                                                                {/* Progress Bar */}
                                                                <div
                                                                    className="w-full h-1 bg-white/10 relative cursor-pointer group/seek mb-6 mx-8"
                                                                    onClick={(e) => {
                                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                                        const x = e.clientX - rect.left;
                                                                        const val = x / rect.width;
                                                                        playerRef.current?.seekTo(val);
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="absolute top-0 left-0 h-full bg-[#e9c49a] transition-all"
                                                                        style={{ width: `${played * 100}%` }}
                                                                    />
                                                                    <div
                                                                        className="absolute top-1/2 -mt-2 w-4 h-4 bg-[#e9c49a] rounded-full scale-0 group-hover/seek:scale-100 transition-transform shadow-[0_0_15px_rgba(233,196,154,1)]"
                                                                        style={{ left: `${played * 100}%` }}
                                                                    />
                                                                </div>

                                                                {/* Buttons Bar */}
                                                                <div className="flex items-center justify-between pb-10 px-10">
                                                                    <div className="flex items-center gap-8">
                                                                        <button onClick={() => setPlaying(!playing)} className="text-white hover:text-[#e9c49a] transition-colors">
                                                                            {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                                                        </button>
                                                                        <div className="flex items-center gap-4 group/vol">
                                                                            <button onClick={() => setMuted(!muted)} className="text-white hover:text-[#e9c49a] transition-colors">
                                                                                {muted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                                                            </button>
                                                                            <input
                                                                                type="range"
                                                                                min="0"
                                                                                max="1"
                                                                                step="0.1"
                                                                                value={volume}
                                                                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                                                className="w-0 group-hover/vol:w-20 transition-all accent-[#e9c49a]"
                                                                            />
                                                                        </div>
                                                                        <div className="text-[11px] font-black uppercase tracking-widest text-white/60">
                                                                            <span className="text-white">{formatTime(played * duration)}</span>
                                                                            <span className="mx-2">/</span>
                                                                            <span>{formatTime(duration)}</span>
                                                                            <span className="ml-4 text-white/20">AMORA SEQUENCE</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-8 text-white/40">
                                                                        <button className="hover:text-white transition-colors">
                                                                            <Info className="w-5 h-5" />
                                                                        </button>
                                                                        <button className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                                                                            CC
                                                                        </button>
                                                                        <button className="hover:text-white transition-colors">
                                                                            <Settings className="w-5 h-5" />
                                                                        </button>
                                                                        <button className="hover:text-white transition-colors">
                                                                            <Maximize className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Series Controls Overlay */}
                                                {movie.Type === 'series' && (
                                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-4xl px-6">
                                                        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e9c49a]">Sequence Navigation</h4>
                                                                <div className="flex gap-2">
                                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={() => {
                                                                                setActiveSeason(s);
                                                                                setActiveEpisode(1);
                                                                            }}
                                                                            className={cn(
                                                                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                                                activeSeason === s
                                                                                    ? "bg-[#e9c49a] text-black shadow-lg"
                                                                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                                                            )}
                                                                        >
                                                                            S{s}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                                                {seasonData?.Episodes?.map((ep: any) => (
                                                                    <button
                                                                        key={ep.Episode}
                                                                        onClick={() => setActiveEpisode(parseInt(ep.Episode))}
                                                                        className={cn(
                                                                            "flex-shrink-0 px-6 py-4 rounded-2xl border transition-all text-left space-y-1",
                                                                            activeEpisode === parseInt(ep.Episode)
                                                                                ? "bg-[#e9c49a]/20 border-[#e9c49a]/40"
                                                                                : "bg-white/5 border-white/10 hover:border-white/20"
                                                                        )}
                                                                    >
                                                                        <p className="text-[8px] font-black text-[#e9c49a]/40 uppercase tracking-widest">Episode {ep.Episode}</p>
                                                                        <p className={cn(
                                                                            "text-[10px] font-bold uppercase truncate max-w-[120px]",
                                                                            activeEpisode === parseInt(ep.Episode) ? "text-[#e9c49a]" : "text-white/60"
                                                                        )}>{ep.Title}</p>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="outline"
                                    className="w-16 h-16 rounded-3xl border-white/10 bg-white/5 text-white hover:bg-[#e9c49a] hover:text-black hover:border-[#e9c49a] transition-all flex items-center justify-center p-0"
                                    onClick={() => toast.success("Added to Watchlist")}
                                >
                                    <Bookmark className="w-6 h-6" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-16 h-16 rounded-3xl border-white/10 bg-white/5 text-white hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center p-0"
                                >
                                    <Share2 className="w-6 h-6" />
                                </Button>
                            </motion.div>
                        </div>

                        {/* Descriptive Info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-10"
                        >
                            <div className="space-y-4">
                                <h3 className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Cinematic Plot</h3>
                                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-4xl">
                                    {movie.Plot}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h3 className="text-[#e9c49a]/40 text-[10px] font-black uppercase tracking-[0.4em]">Neural Cast</h3>
                                    <p className="text-white/80 font-bold uppercase tracking-widest text-xs leading-loose">
                                        {(movie.Actors || "Cast Unknown").split(',').map((actor: string, i: number) => (
                                            <span key={i} className="block mb-2 text-white/60 hover:text-[#e9c49a] transition-colors cursor-pointer">• {actor.trim()}</span>
                                        ))}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[#e9c49a]/40 text-[10px] font-black uppercase tracking-[0.4em]">Production Data</h3>
                                    <div className="space-y-4 text-xs font-black uppercase tracking-widest">
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-white/20">Director</span>
                                            <span className="text-white/60">{movie.Director}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-white/20">Writer</span>
                                            <span className="text-white/60">{movie.Writer}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-white/20">Genre</span>
                                            <span className="text-white/60">{movie.Genre}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-white/20">Box Office</span>
                                            <span className="text-white/60">{movie.BoxOffice || "Redacted"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Visual Artifact */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div className="sticky top-32 space-y-8">
                            <div className="relative group overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                                <img
                                    src={movie.Poster !== "N/A" ? movie.Poster : ""}
                                    className="w-full aspect-[2/3] object-cover transition-transform duration-[2s] group-hover:scale-110"
                                    alt={movie.Title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

                                {/* Dynamic Badge */}
                                <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center">
                                    <Star className="w-6 h-6 text-[#e9c49a] fill-[#e9c49a] mb-1" />
                                    <span className="text-xs font-black font-display">{movie.imdbRating}</span>
                                </div>
                            </div>

                            {/* Secondary Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-2">
                                    <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Metascore</p>
                                    <p className="text-2xl font-display font-bold text-[#e9c49a]">{movie.Metascore}</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-2">
                                    <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">IMDb Votes</p>
                                    <p className="text-2xl font-display font-bold text-white/60">{movie.imdbVotes}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Details;
