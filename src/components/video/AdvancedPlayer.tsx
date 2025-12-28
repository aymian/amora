import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
    SkipBack,
    SkipForward,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedPlayerProps {
    url: string;
    title?: string;
    onProgress?: (progress: any) => void;
    autoPlay?: boolean;
}

export default function AdvancedPlayer({ url, title, onProgress, autoPlay = false }: AdvancedPlayerProps) {
    const [playing, setPlaying] = useState(autoPlay);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(autoPlay); // Start muted if autoplaying to bypass browser blocks
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showControls, setShowControls] = useState(true);
    const playerRef = useRef<any>(null);
    const controlsTimeoutRef = useRef<any>();

    useEffect(() => {
        if (autoPlay && url) {
            setPlaying(true);
            setMuted(true);
        }
    }, [url, autoPlay]);

    const handlePlayPause = () => setPlaying(!playing);

    const handleProgress = (state: any) => {
        setPlayed(state.played);
        if (onProgress) onProgress(state);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setPlayed(value);
        playerRef.current?.seekTo(value);
    };

    const toggleFullscreen = () => {
        const element = document.getElementById("player-wrapper");
        if (element?.requestFullscreen) {
            element.requestFullscreen();
        }
    };

    const isBunnyStream = url.includes("iframe.mediadelivery.net");
    const Player = ReactPlayer as any;

    return (
        <div
            id="player-wrapper"
            className="relative group bg-black rounded-[32px] overflow-hidden shadow-2xl aspect-video border border-white/5"
            onMouseMove={() => {
                setShowControls(true);
                if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
            }}
        >
            {isBunnyStream ? (
                <iframe
                    src={url}
                    loading="lazy"
                    className="w-full h-full border-none"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen"
                    allowFullScreen
                />
            ) : (
                <div className="relative w-full h-full">
                    <Player
                        ref={playerRef}
                        url={url}
                        width="100%"
                        height="100%"
                        playing={playing}
                        volume={volume}
                        muted={muted}
                        playsinline={true}
                        onProgress={handleProgress}
                        onDuration={(d: any) => setDuration(d)}
                        onError={() => setError("The cinematic stream failed to initialize.")}
                        config={{
                            file: {
                                attributes: {
                                    controlsList: 'nodownload',
                                    playsInline: true
                                }
                            }
                        }}
                    />

                    {/* Custom Controls for Direct Video */}
                    <AnimatePresence>
                        {showControls && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-8"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#e9c49a] font-bold uppercase tracking-[0.3em]">Now Resonating</p>
                                        <h2 className="text-xl font-display font-light text-white">{title || "Cinematic Original"}</h2>
                                    </div>
                                    <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                                        <Settings className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group/seek">
                                        <input
                                            type="range"
                                            min={0}
                                            max={0.999999}
                                            step="any"
                                            value={played}
                                            onChange={handleSeek}
                                            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#e9c49a]"
                                        />
                                        <div
                                            className="absolute top-0 left-0 h-1 bg-[#e9c49a] rounded-full pointer-events-none"
                                            style={{ width: `${played * 100}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-8">
                                            <button onClick={handlePlayPause} className="text-white hover:text-[#e9c49a] transition-all">
                                                {playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                                            </button>
                                            <div className="flex items-center gap-4 text-white/40 font-mono text-xs">
                                                <span>{Math.floor(played * duration / 60)}:{(Math.floor(played * duration % 60)).toString().padStart(2, '0')}</span>
                                                <span className="text-white/10">/</span>
                                                <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-4 group/vol">
                                                <button onClick={() => setMuted(!muted)} className="text-white/60 hover:text-white">
                                                    {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                                </button>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={1}
                                                    step="any"
                                                    value={volume}
                                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                    className="w-20 h-1 bg-white/20 rounded-full appearance-none accent-white group-hover/vol:opacity-100 transition-all opacity-0 group-hover/vol:bg-white/40"
                                                />
                                            </div>
                                            <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-all">
                                                <Maximize className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <div className="space-y-1">
                        <p className="text-white font-medium">{error}</p>
                        <p className="text-white/40 text-sm">Please check your connection or try again later.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
