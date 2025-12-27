import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const stories = [
  {
    id: 1,
    title: "Whispers of Dawn",
    duration: "12:34",
    gradient: "from-rose-600/90 to-orange-500/90",
    category: "Emotional",
  },
  {
    id: 2,
    title: "Ocean's Lullaby",
    duration: "8:45",
    gradient: "from-cyan-600/90 to-blue-600/90",
    category: "Calm",
  },
  {
    id: 3,
    title: "Forest Memories",
    duration: "15:20",
    gradient: "from-emerald-600/90 to-teal-500/90",
    category: "Nature",
  },
  {
    id: 4,
    title: "Starlit Dreams",
    duration: "10:12",
    gradient: "from-violet-600/90 to-purple-600/90",
    category: "Fantasy",
  },
  {
    id: 5,
    title: "Urban Poetry",
    duration: "7:55",
    gradient: "from-amber-600/90 to-yellow-500/90",
    category: "Urban",
  },
  {
    id: 6,
    title: "Silent Snow",
    duration: "11:30",
    gradient: "from-slate-500/90 to-zinc-600/90",
    category: "Winter",
  },
];

export function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="stories" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-6 mb-12">
          <div className="flex items-end justify-between">
            <div className="space-y-4">
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light">
                Featured <span className="text-gradient-primary font-medium">Stories</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Cinematic journeys that touch the soul
              </p>
            </div>
            
            {/* Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="rounded-full"
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
              className="shrink-0 w-72 sm:w-80 snap-start group cursor-pointer"
              onMouseEnter={() => setHoveredId(story.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${story.gradient}`} />
                
                {/* Noise Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Play Button */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${hoveredId === story.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                  <div className="w-16 h-16 rounded-full bg-foreground/90 flex items-center justify-center shadow-glow animate-pulse-glow">
                    <Play className="w-6 h-6 text-background ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {story.duration}
                </div>
              </div>

              {/* Story Info */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {story.category}
                </span>
                <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors duration-300">
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
