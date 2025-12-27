import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";
import { CinematicPlayer } from "@/components/video/CinematicPlayer";

const stories = [
  {
    id: 1,
    title: "Whispers of Dawn",
    duration: "12:34",
    gradient: "from-rose-600/90 to-orange-500/90",
    category: "Emotional",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: 2,
    title: "Ocean's Lullaby",
    duration: "8:45",
    gradient: "from-cyan-600/90 to-blue-600/90",
    category: "Calm",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: 3,
    title: "Forest Memories",
    duration: "15:20",
    gradient: "from-emerald-600/90 to-teal-500/90",
    category: "Nature",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: 4,
    title: "Starlit Dreams",
    duration: "10:12",
    gradient: "from-violet-600/90 to-purple-600/90",
    category: "Fantasy",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: 5,
    title: "Urban Poetry",
    duration: "7:55",
    gradient: "from-amber-600/90 to-yellow-500/90",
    category: "Urban",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
];

export function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { transitionDuration, colorIntensity } = useMood();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="stories" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-background" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-6 mb-16">
          <div className="flex items-end justify-between">
            <div className="space-y-4">
              <span className="text-xs font-medium text-primary uppercase tracking-widest">Curated for you</span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light">
                Cinematic <span className="text-gradient-primary font-medium">Stories</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Visual journeys that speak to the quiet places in your heart
              </p>
            </div>
            
            {/* Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="rounded-full border-white/10 hover:bg-white/5 hover:border-white/20"
                style={{ transition: `all ${transitionDuration}ms` }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="rounded-full border-white/10 hover:bg-white/5 hover:border-white/20"
                style={{ transition: `all ${transitionDuration}ms` }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stories Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Left padding for container alignment */}
          <div className="shrink-0 w-[calc((100vw-1400px)/2+1.5rem)] hidden 2xl:block" />
          
          {stories.map((story) => (
            <div
              key={story.id}
              className="shrink-0 w-80 sm:w-96 snap-start group cursor-pointer"
              onMouseEnter={() => setHoveredId(story.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div 
                className="relative aspect-video rounded-2xl overflow-hidden mb-4"
                style={{
                  boxShadow: hoveredId === story.id 
                    ? `0 20px 60px hsla(350, 70%, 50%, ${0.25 * colorIntensity})`
                    : "0 10px 40px hsla(0, 0%, 0%, 0.4)",
                  transition: `all ${transitionDuration}ms ease-out`
                }}
              >
                {/* Background Gradient (fallback) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${story.gradient}`} />
                
                {/* Noise Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                
                {/* Play Button */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    opacity: hoveredId === story.id ? 1 : 0,
                    transform: hoveredId === story.id ? "scale(1)" : "scale(0.8)",
                    transition: `all ${transitionDuration}ms ease-out`
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: `hsla(350, 70%, ${60 * colorIntensity}%, 0.9)`,
                      boxShadow: `0 0 50px hsla(350, 70%, 60%, 0.5)`,
                    }}
                  >
                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div 
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium"
                  style={{
                    opacity: hoveredId === story.id ? 0 : 1,
                    transition: `opacity ${transitionDuration}ms`
                  }}
                >
                  <Clock className="w-3 h-3" />
                  {story.duration}
                </div>
              </div>

              {/* Story Info */}
              <div className="space-y-2">
                <span 
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: `hsl(350, 70%, ${60 * colorIntensity}%)` }}
                >
                  {story.category}
                </span>
                <h3 
                  className="font-display text-xl font-medium text-foreground"
                  style={{
                    transform: hoveredId === story.id ? "translateX(4px)" : "translateX(0)",
                    transition: `transform ${transitionDuration}ms ease-out`
                  }}
                >
                  {story.title}
                </h3>
              </div>
            </div>
          ))}

          {/* Right padding */}
          <div className="shrink-0 w-6" />
        </div>
      </div>
    </section>
  );
}
