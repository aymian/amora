import { useState, useRef, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMood } from "@/contexts/MoodContext";

interface CinematicPlayerProps {
  url: string;
  thumbnail?: string;
  title?: string;
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "9/16";
  onPlay?: () => void;
  onPause?: () => void;
}

export function CinematicPlayer({
  url,
  thumbnail,
  title,
  className,
  aspectRatio = "16/9",
  onPlay,
  onPause,
}: CinematicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(0.8);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { transitionDuration, colorIntensity } = useMood();

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      videoRef.current?.pause();
      onPause?.();
    } else {
      setIsPlaying(true);
      videoRef.current?.play();
      setIsMuted(false);
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(progress) ? 0 : progress);
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
    setProgress(percent * 100);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Handle hover preview
  useEffect(() => {
    if (isHovering && !isPlaying && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    } else if (!isHovering && !isPlaying && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovering, isPlaying]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl group cursor-pointer",
        "bg-card border border-white/5",
        className
      )}
      style={{ 
        aspectRatio,
        transition: `all ${transitionDuration}ms ease-out`
      }}
      onMouseEnter={() => {
        setIsHovering(true);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (!isPlaying) setShowControls(false);
      }}
      onClick={handlePlayPause}
    >
      {/* Video Player */}
      <ReactPlayer
        src={url}
        playing={isPlaying || isHovering}
        muted={!isPlaying || isMuted}
        loop
        style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none"
        style={{ opacity: showControls ? 1 : 0.5, transition: `opacity ${transitionDuration}ms` }}
      />

      {/* Title */}
      {title && (
        <div className="absolute top-4 left-4 right-4 pointer-events-none">
          <h3 
            className="font-display text-lg font-medium text-foreground drop-shadow-lg"
            style={{ 
              opacity: showControls ? 1 : 0,
              transform: showControls ? "translateY(0)" : "translateY(-10px)",
              transition: `all ${transitionDuration}ms ease-out`
            }}
          >
            {title}
          </h3>
        </div>
      )}

      {/* Center Play Button */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: isHovering ? 1 : 0.7,
            transition: `opacity ${transitionDuration}ms`
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `hsla(350, 70%, ${60 * colorIntensity}%, 0.9)`,
              boxShadow: `0 0 60px hsla(350, 70%, 60%, 0.5)`,
              transform: isHovering ? "scale(1.1)" : "scale(1)",
              transition: `transform ${transitionDuration}ms ease-out`
            }}
          >
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{
          opacity: showControls && isPlaying ? 1 : 0,
          transform: showControls && isPlaying ? "translateY(0)" : "translateY(10px)",
          transition: `all ${transitionDuration}ms ease-out`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <div 
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, hsl(350, 70%, 60%), hsl(320, 65%, 55%))`,
              transition: "width 100ms linear"
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-foreground" />
              ) : (
                <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
              )}
            </button>
            
            <button
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>

          <button
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-foreground" />
            ) : (
              <Maximize className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Glow Border on Hover */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: isHovering ? `inset 0 0 0 1px hsla(350, 70%, 60%, 0.3), 0 0 40px hsla(350, 70%, 60%, 0.2)` : "none",
          transition: `box-shadow ${transitionDuration}ms`
        }}
      />
    </div>
  );
}
