import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface StoryVideo {
  id: string;
  title: string;
  duration?: string;
  gradient: string;
  category: string;
  videoUrl: string;
  imageUrl?: string;
  description?: string;
}

const FALLBACK_GRADIENTS = [
  "from-rose-600/90 to-orange-500/90",
  "from-cyan-600/90 to-blue-600/90",
  "from-emerald-600/90 to-teal-500/90",
  "from-violet-600/90 to-purple-600/90",
  "from-amber-600/90 to-yellow-500/90",
];

const CATEGORIES = ["Emotional", "Calm", "Nature", "Fantasy", "Urban", "Cinematic"];

export function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { transitionDuration, colorIntensity } = useMood();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(collection(db, "shorts"), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const fetchedStories = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled Echo",
            duration: data.duration || "0:30",
            gradient: data.gradient || FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
            category: data.category || CATEGORIES[index % CATEGORIES.length],
            videoUrl: data.videoUrl,
            imageUrl: data.imageUrl,
            description: data.description
          };
        });
        setStories(fetchedStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="stories" className="relative py-32 overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-background" />

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-6 mb-16">
          <div className="flex items-end justify-between">
            <div className="space-y-4">
              <span className="text-xs font-medium text-[#e9c49a] uppercase tracking-widest">Curated for you</span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-white">
                Cinematic <span className="text-[#e9c49a] italic">Stories</span>
              </h2>
              <p className="text-white/40 text-lg max-w-md font-light">
                Visual journeys that speak to the quiet places in your heart
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="rounded-full border-white/10 hover:bg-white/5 hover:border-[#e9c49a]/40 group"
              >
                <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="rounded-full border-white/10 hover:bg-white/5 hover:border-[#e9c49a]/40 group"
              >
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stories Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-6 snap-x snap-mandatory min-h-[400px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Left padding for container alignment */}
          <div className="shrink-0 w-[calc((100vw-1400px)/2+1.5rem)] hidden 2xl:block" />

          {loading ? (
            <div className="w-full flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Activity className="w-8 h-8 text-[#e9c49a] animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-[#e9c49a]/60 font-bold">Synchronizing Artifacts...</span>
              </div>
            </div>
          ) : stories.length === 0 ? (
            <div className="w-full flex items-center justify-center h-64">
              <p className="text-white/20 text-sm font-light uppercase tracking-widest">No cinematic stories found in the archives.</p>
            </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.id}
                className="shrink-0 w-80 sm:w-96 snap-start group cursor-pointer"
                onMouseEnter={() => setHoveredId(story.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className="relative aspect-video rounded-2xl overflow-hidden mb-6"
                  style={{
                    boxShadow: hoveredId === story.id
                      ? `0 20px 60px hsla(35, 68%, 76%, 0.15)`
                      : "0 15px 45px hsla(0, 0%, 0%, 0.6)",
                    transition: `all ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  }}
                >
                  {/* Autoplaying Video */}
                  <video
                    src={story.videoUrl}
                    poster={story.imageUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Noise Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Duration Badge */}
                  <div
                    className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-tighter text-white z-20"
                  >
                    <Clock className="w-3 h-3 text-[#e9c49a]" />
                    {story.duration}
                  </div>
                </div>

                {/* Story Info */}
                <div className="space-y-3 px-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-white/[0.03] border border-white/5"
                      style={{ color: '#e9c49a' }}
                    >
                      {story.category}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <h3
                    className="font-display text-2xl font-light text-white tracking-tight"
                    style={{
                      transform: hoveredId === story.id ? "translateX(6px)" : "translateX(0)",
                      transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    }}
                  >
                    {story.title}
                  </h3>
                  {story.description && (
                    <p className="text-white/20 text-xs font-light line-clamp-1 group-hover:text-white/40 transition-colors">
                      {story.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Right padding */}
          <div className="shrink-0 w-6" />
        </div>
      </div>
    </section>
  );
}
