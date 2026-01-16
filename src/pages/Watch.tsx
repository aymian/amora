import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useOutletContext } from "react-router-dom";
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
    Diamond,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, limit, where, updateDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReactPlayer from "react-player";

interface TheaterContent {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    rating?: string;
    year?: string;
    genre?: string;
    runtime?: string;
    type?: 'movie' | 'series';
    Type?: 'movie' | 'series';
    videoUrl?: string;
    collectionName?: string;
    views?: number;
    likes?: number;
    dislikes?: number;
    createdAt?: any;
}

export default function Watch() {
    const { user: userData } = useOutletContext<{ user: any }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const artifactId = searchParams.get("id");
    const artifactName = searchParams.get("name");

    const [videoData, setVideoData] = useState<TheaterContent | null>(null);
    const [nextSequences, setNextSequences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExternalStream, setIsExternalStream] = useState(false);
    const [selectedServer, setSelectedServer] = useState("Server 1");
    const [activeSeason, setActiveSeason] = useState(1);
    const [activeEpisode, setActiveEpisode] = useState(1);
    const [seasonData, setSeasonData] = useState<any>(null);

    // Video State
    const playerRef = useRef<ReactPlayer>(null);
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
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Auth Observer
    useEffect(() => {
        if (userData) {
            // Context provided
        }
    }, [userData]);

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
            setIsExternalStream(false);

            try {
                // Check if it's an IMDb ID (External Streaming)
                if (artifactId?.startsWith('tt')) {
                    const OMDB_API_KEY = "93272d7a";
                    const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${artifactId}`);
                    const details = await detailRes.json();

                    if (details.Response === "True") {
                        setVideoData({
                            id: artifactId,
                            title: details.Title,
                            description: details.Plot,
                            imageUrl: details.Poster,
                            rating: details.imdbRating,
                            year: details.Year,
                            genre: details.Genre,
                            runtime: details.Runtime,
                            type: details.Type as 'movie' | 'series',
                            Type: details.Type as 'movie' | 'series'
                        });
                        setIsExternalStream(true);
                    } else {
                        setError("Neural sequence not found in global archive");
                    }
                } else if (artifactId) {
                    const collections = ["gallery_videos", "gallery_images", "mood_content", "shorts", "happy_tracks", "sad_tracks"];
                    let foundDocData: TheaterContent | null = null;

                    for (const collName of collections) {
                        try {
                            const directDoc = await getDoc(doc(db, collName, artifactId));
                            if (directDoc.exists()) {
                                foundDocData = { id: directDoc.id, collectionName: collName, ...directDoc.data() } as TheaterContent;
                                break;
                            }

                            const q = query(collection(db, collName), where("id", "==", artifactId), limit(1));
                            const querySnap = await getDocs(q);
                            if (!querySnap.empty) {
                                const d = querySnap.docs[0];
                                foundDocData = { id: d.id, collectionName: collName, ...d.data() } as TheaterContent;
                                break;
                            }
                        } catch (e) {
                            console.warn(`Fetch failed for ${collName}:`, e);
                        }
                    }

                    if (foundDocData) {
                        setVideoData(foundDocData);
                    } else {
                        setError("Artifact data could not be retrieved from neural storage");
                    }
                } else {
                    setError("Sequence identifier missing");
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

    // Fetch Season Data
    useEffect(() => {
        const fetchSeason = async () => {
            if (videoData?.type === "series" && artifactId) {
                try {
                    const OMDB_API_KEY = "93272d7a";
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${artifactId}&Season=${activeSeason}`);
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
    }, [videoData?.id, activeSeason]);

    // Update view count on load
    useEffect(() => {
        if (videoData?.id && videoData.id !== 'hero' && videoData?.collectionName) {
            const incrementView = async () => {
                // Optimistically update local view count immediately
                setVideoData((prev: any) => ({
                    ...prev,
                    views: (prev?.views || 0) + 1
                }));

                try {
                    const ref = doc(db, videoData.collectionName, videoData.id);
                    await updateDoc(ref, { views: increment(1) });
                } catch (e) {
                    console.error("View increment failed:", e);
                }
            };
            incrementView();
        }
        // Run once per video ID load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoData?.id, videoData?.collectionName]);

    // 4. Playback Pulse & Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Avoid triggers if user is typing in search or input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    setPlaying(prev => !prev);
                    break;
                case "KeyK":
                    setPlaying(prev => !prev);
                    break;
                case "ArrowLeft":
                    if (playerRef.current) {
                        const currentTime = playerRef.current.getCurrentTime() || 0;
                        playerRef.current.seekTo(Math.max(0, currentTime - 5));
                    }
                    break;
                case "ArrowRight":
                    if (playerRef.current) {
                        const currentTime = playerRef.current.getCurrentTime() || 0;
                        playerRef.current.seekTo(currentTime + 5);
                    }
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setVolume(prev => Math.min(1, prev + 0.1));
                    setMuted(false);
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setVolume(prev => Math.max(0, prev - 0.1));
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
        setPlaying(prev => !prev);
    };

    const handleVideoEnd = () => {
        if (isAutoplayEnabled && nextSequences.length > 0) {
            const nextSeq = nextSequences[0];
            // Move current next sequence to the end of the list to create a loop/cycle if desired, 
            // or just navigate and let the next page fetch new sequences.
            navigate(`/watch?name=${encodeURIComponent(nextSeq.title)}&id=${nextSeq.id}`);
        } else {
            setPlaying(false);
        }
    };

    const handleSeek = (val: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(val);
            setPlayed(val);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
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

    const handleLike = async () => {
        if (!videoData?.id || videoData.id === 'hero' || !videoData?.collectionName) return;

        // Optimistic UI update
        setVideoData((prev: any) => ({ ...prev, likes: (prev.likes || 0) + 1 }));

        try {
            const ref = doc(db, videoData.collectionName, videoData.id);
            await updateDoc(ref, { likes: increment(1) });
        } catch (error) {
            console.error("Error liking video:", error);
        }
    };

    const handleDislike = async () => {
        if (!videoData?.id || videoData.id === 'hero' || !videoData?.collectionName) return;

        setVideoData((prev: any) => ({ ...prev, dislikes: (prev.dislikes || 0) + 1 }));

        try {
            const ref = doc(db, videoData.collectionName, videoData.id);
            await updateDoc(ref, { dislikes: increment(1) });
        } catch (error) {
            console.error("Error disliking video:", error);
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

    if (error || !videoData) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8 p-10 text-center">
                <div className="w-24 h-24 rounded-full bg-[#e9c49a]/5 border border-[#e9c49a]/10 flex items-center justify-center">
                    <MonitorPlay className="w-10 h-10 text-[#e9c49a]/20" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-display font-light text-white italic tracking-tighter uppercase">NEURAL VOID DETECTED</h2>
                    <p className="text-[#e9c49a]/40 text-[10px] font-black uppercase tracking-[0.4em]">{error || "The requested sequence is currently unreachable"}</p>
                </div>
                <Button
                    onClick={() => navigate('/')}
                    className="h-14 px-10 rounded-2xl bg-[#e9c49a] text-black hover:bg-white transition-all font-black uppercase tracking-[0.2em] text-[10px]"
                >
                    RETURN TO DASHBOARD
                </Button>
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

    const formatDate = (date: any) => {
        if (!date) return "Oct 24, 2024";
        const d = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
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
                                    title="Toggle Next Up Sidebar"
                                >
                                    <Layers className={cn("w-5 h-5 transition-transform", !isSidebarCollapsed && "text-[#e9c49a]")} />
                                </button>

                                <button
                                    onClick={() => isExternalStream ? navigate(`/details/${artifactId}`) : navigate(-1)}
                                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-[#e9c49a]/10 hover:border-[#e9c49a]/30 transition-all text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-[#e9c49a]"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Return to Details
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
                                    isFullscreen ? "rounded-none h-screen" : "rounded-[2.5rem] shadow-[0_40px_100px_rgba(233,196,154,0.1)] border border-[#e9c49a]/10 aspect-video"
                                )}
                                onMouseMove={handleMouseMove}
                            >
                                {isExternalStream ? (
                                    <div className="absolute inset-0 w-full h-full bg-black">
                                        <iframe
                                            key={`${selectedServer}-${activeSeason}-${activeEpisode}`}
                                            src={
                                                selectedServer === "Server 1"
                                                    ? `https://vidsrc.to/embed/${(videoData?.type === 'series' || videoData?.Type === 'series') ? 'tv' : 'movie'}/${artifactId}${(videoData?.type === 'series' || videoData?.Type === 'series') ? `/${activeSeason}/${activeEpisode}` : ''}`
                                                    : selectedServer === "Server 2"
                                                        ? `https://vidsrc.xyz/embed/${(videoData?.type === 'series' || videoData?.Type === 'series') ? 'tv' : 'movie'}/${artifactId}${(videoData?.type === 'series' || videoData?.Type === 'series') ? `/${activeSeason}/${activeEpisode}` : ''}`
                                                        : `https://embed.su/embed/${(videoData?.type === 'series' || videoData?.Type === 'series') ? 'tv' : 'movie'}/${artifactId}${(videoData?.type === 'series' || videoData?.Type === 'series') ? `/${activeSeason}/${activeEpisode}` : ''}`
                                            }
                                            className="w-full h-full"
                                            allowFullScreen
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                        />

                                        {/* Server Selector Overlay (Custom UI) */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-50">
                                            {["Server 1", "Server 2", "Server 3"].map((server) => (
                                                <button
                                                    key={server}
                                                    onClick={() => setSelectedServer(server)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border shadow-2xl",
                                                        selectedServer === server
                                                            ? "bg-[#e9c49a] text-black border-[#e9c49a]"
                                                            : "bg-black/60 text-white/60 border-white/10 hover:bg-white/20 hover:border-white/30"
                                                    )}
                                                >
                                                    {server}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <ReactPlayer
                                            ref={playerRef}
                                            url={videoData?.videoUrl}
                                            playing={playing}
                                            muted={muted}
                                            volume={volume}
                                            width="100%"
                                            height="100%"
                                            playsinline
                                            onProgress={(state) => setPlayed(state.played)}
                                            onDuration={(d) => setDuration(d)}
                                            onEnded={handleVideoEnd}
                                            onClickPreview={handleTogglePlay}
                                            style={{ objectFit: 'cover' }}
                                        />

                                        {/* Custom Video Controls Layer */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 transition-opacity duration-300",
                                            showControls || !playing ? "opacity-100" : "opacity-0"
                                        )}>
                                            <div className="space-y-6">
                                                {/* Progress Bar - Amora Gradient Style */}
                                                <div className="relative h-1 bg-white/10 rounded-full group/seek cursor-pointer" onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const x = e.clientX - rect.left;
                                                    const val = x / rect.width;
                                                    handleSeek(val);
                                                }}>
                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e9c49a] via-[#8b6544] to-[#e9c49a] rounded-full"
                                                        style={{ width: `${played * 100}%` }}
                                                    />
                                                    <div
                                                        className="absolute top-1/2 -ml-2 -mt-2 w-4 h-4 bg-[#e9c49a] rounded-full shadow-[0_0_15px_rgba(233,196,154,0.5)] opacity-0 group-hover/seek:opacity-100 transition-opacity"
                                                        style={{ left: `${played * 100}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <button onClick={handleTogglePlay} className="hover:scale-110 transition-transform text-[#e9c49a]">
                                                            {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                                        </button>
                                                        <div className="text-[11px] font-bold text-[#e9c49a]/60 tracking-wider">
                                                            {formatTime(played * duration)} / {formatTime(duration)}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <button onClick={() => setMuted(!muted)}>
                                                                {muted ? <VolumeX className="w-5 h-5 text-white/20" /> : <Volume2 className="w-5 h-5 text-[#e9c49a]" />}
                                                            </button>
                                                            <button><Maximize2 className="w-5 h-5 text-white/20 hover:text-[#e9c49a]" /></button>
                                                            <button><Settings className="w-5 h-5 text-white/20 hover:text-[#e9c49a]" /></button>
                                                            <button onClick={handleToggleFullscreen}>
                                                                {isFullscreen ? <Maximize2 className="w-5 h-5 text-[#e9c49a] drop-shadow-[0_0_8px_#e9c49a]" /> : <Maximize className="w-5 h-5 text-white/20 hover:text-[#e9c49a]" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </div>

                        {/* Title Section */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase max-w-4xl">
                                    {videoData?.title || artifactName || "unknown"}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-[12px] text-white/30 font-bold uppercase tracking-[0.2em]">
                                    {isExternalStream ? (
                                        <>
                                            <span className="text-[#e9c49a] bg-[#e9c49a]/10 px-2 py-1 rounded">NEURAL STREAM ACTIVE</span>
                                            {videoData?.rating && <span className="text-white/60">IMDb {videoData.rating}</span>}
                                            {videoData?.year && <span>{videoData.year}</span>}
                                            {videoData?.genre && <span className="text-[#e9c49a]/40">{videoData.genre}</span>}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-white/60">AMORA ARTIFACT</span>
                                            <span>•</span>
                                            <span>{videoData?.views ? videoData.views.toLocaleString() : "0"} views</span>
                                            <span>•</span>
                                            <span>{formatDate(videoData?.createdAt)}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Row */}
                            <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                                        <button
                                            onClick={handleLike}
                                            className="flex items-center gap-2.5 px-6 py-4 hover:bg-[#e9c49a]/10 transition-colors border-r border-white/5"
                                        >
                                            <ThumbsUp className="w-5 h-5 text-[#e9c49a] fill-[#e9c49a]" />
                                            <span className="text-[12px] font-black uppercase tracking-wider text-white/60">
                                                {videoData?.likes ? videoData.likes.toLocaleString() : "Like"}
                                            </span>
                                        </button>
                                        <button
                                            onClick={handleDislike}
                                            className="px-6 py-4 hover:bg-white/5 transition-colors flex items-center gap-2"
                                        >
                                            <ThumbsDown className="w-5 h-5 text-white/20" />
                                        </button>
                                    </div>

                                    <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[11px] uppercase tracking-widest text-white/60">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                    <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#e9c49a]/10 border border-[#e9c49a]/20 text-[#e9c49a] hover:bg-[#e9c49a] hover:text-black transition-all font-black text-[11px] uppercase tracking-widest">
                                        <Download className="w-4 h-4" /> Archive
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Movie Description Section */}
                            <div className="pt-6 space-y-4">
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#e9c49a]">
                                    <Sparkles className="w-4 h-4" />
                                    Cinematic Metadata
                                </div>
                                <p className="text-white/50 text-base font-light leading-relaxed max-w-4xl">
                                    {videoData?.description || "Initializing neural cinematic feed with optimized metadata synchronization..."}
                                </p>
                            </div>

                            {/* TV Series Season/Episode Picker */}
                            {videoData?.type === "series" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-10 space-y-8"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-8 bg-[#e9c49a] rounded-full" />
                                            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">Neural Sequences</h3>
                                        </div>

                                        {/* Season Select */}
                                        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => {
                                                        setActiveSeason(s);
                                                        setActiveEpisode(1);
                                                    }}
                                                    className={cn(
                                                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        activeSeason === s
                                                            ? "bg-[#e9c49a] text-black shadow-lg"
                                                            : "text-white/40 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    Season {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Episode Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                        {seasonData?.Episodes?.map((ep: any) => (
                                            <button
                                                key={ep.Episode}
                                                onClick={() => setActiveEpisode(parseInt(ep.Episode))}
                                                className={cn(
                                                    "group flex items-center gap-4 p-4 rounded-3xl border transition-all text-left",
                                                    activeEpisode === parseInt(ep.Episode)
                                                        ? "bg-[#e9c49a]/10 border-[#e9c49a]/30"
                                                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all",
                                                    activeEpisode === parseInt(ep.Episode)
                                                        ? "bg-[#e9c49a] text-black"
                                                        : "bg-white/5 text-white/40 group-hover:bg-white/10"
                                                )}>
                                                    {ep.Episode.padStart(2, '0')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={cn(
                                                        "text-[11px] font-black uppercase tracking-wider truncate mb-1",
                                                        activeEpisode === parseInt(ep.Episode) ? "text-[#e9c49a]" : "text-white/60"
                                                    )}>
                                                        {ep.Title}
                                                    </div>
                                                    <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                                        Released: {ep.Released}
                                                    </div>
                                                </div>
                                                {activeEpisode === parseInt(ep.Episode) && (
                                                    <div className="w-2 h-2 rounded-full bg-[#e9c49a] animate-pulse" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
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
                                            <button
                                                onClick={() => setIsSidebarCollapsed(true)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all mb-0.5"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <span className="text-[10px] font-bold text-[#e9c49a]/40 uppercase tracking-widest">AUTOPLAY</span>
                                            <button
                                                onClick={() => setIsAutoplayEnabled(!isAutoplayEnabled)}
                                                className={cn(
                                                    "w-10 h-5 rounded-full relative transition-colors duration-300 ring-1 ring-[#e9c49a]/20",
                                                    isAutoplayEnabled ? "bg-[#e9c49a]" : "bg-white/5"
                                                )}
                                            >
                                                <motion.div
                                                    animate={{ x: isAutoplayEnabled ? 20 : 2 }}
                                                    className={cn(
                                                        "absolute top-1 w-3 h-3 rounded-full transition-all shadow-sm",
                                                        isAutoplayEnabled ? "bg-black" : "bg-[#e9c49a]/40"
                                                    )}
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
                                                <div className="w-40 aspect-[16/9] rounded-2xl overflow-hidden relative flex-shrink-0 border border-[#e9c49a]/5 group-hover:border-[#e9c49a]/40 transition-all">
                                                    <img src={seq.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" alt="" />
                                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded-md text-[9px] font-bold text-[#e9c49a]">
                                                        {seq.duration ? formatTime(seq.duration) : "0:39"}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 py-1 flex-1">
                                                    <h4 className="text-[12px] font-black uppercase leading-[1.3] text-white/60 group-hover:text-[#e9c49a] transition-colors">
                                                        {(i + 1).toString().padStart(2, '0')} {seq.title.toUpperCase()}
                                                    </h4>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-[#e9c49a]/20 font-bold leading-tight uppercase tracking-wider">
                                                            Amora Cinema • Artifact
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom App Shortcut Icons */}
                                    <div className="pt-8 border-t border-[#e9c49a]/10 space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#e9c49a]/20">QUICK ACCESS</h3>
                                        <div className="grid grid-cols-5 gap-3">
                                            {[
                                                { icon: Diamond, color: "bg-white/5 text-[#e9c49a]/40" },
                                                { icon: Eye, color: "bg-[#8b6544] text-white" },
                                                { icon: Instagram, color: "bg-white/5 text-[#e9c49a]/40" },
                                                { icon: LayoutGrid, color: "bg-white/5 text-[#e9c49a]/40" }
                                            ].map((app, i) => (
                                                <button
                                                    key={i}
                                                    className={cn(
                                                        "aspect-square rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-[#e9c49a]/5 hover:border-[#e9c49a]/20",
                                                        app.color
                                                    )}
                                                >
                                                    <app.icon className="w-5 h-5" />
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
    );
}
