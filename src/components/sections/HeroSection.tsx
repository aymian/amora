import { Button } from "@/components/ui/button";
import { Play, Compass, Sparkles, Activity } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";

export function HeroSection() {
  const { transitionDuration, motionSpeed } = useMood();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const q = query(collection(db, "shorts"), orderBy("createdAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const images = querySnapshot.docs.map(doc => doc.data().imageUrl).filter(img => img);
        setHeroImages(images);
      } catch (error) {
        console.error("Error fetching hero content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroContent();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 bg-[#050505]">
      {/* Ambient Glow Effects */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[200px]"
        style={{
          top: "10%",
          left: "20%",
          background: `radial-gradient(circle, hsla(38, 50%, 50%, 0.08), transparent 70%)`,
          opacity: 0.6,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-10 text-center lg:text-left">
            {/* Tagline */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-up"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: `#e9c49a`, boxShadow: '0 0 10px #e9c49a' }}
              />
              <span className="text-sm text-white/60 tracking-wider">A quiet space for your emotions</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-8xl xl:text-9xl font-light leading-[1.05] tracking-tight animate-fade-up [animation-delay:0.1s]">
              <span className="block text-white/90">Stories that</span>
              <span
                className="block font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#f3e3cc] via-[#e9c49a] to-[#a67c52]"
                style={{
                  backgroundImage: `linear-gradient(135deg, #f3e3cc, #e9c49a, #b48c5c)`,
                }}
              >
                feel like you
              </span>
            </h1>

            {/* Poetic Subtext */}
            <p className="text-lg sm:text-xl text-white/40 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light animate-fade-up [animation-delay:0.2s]">
              Let visuals speak to your heart. Discover cinematic moments
              crafted for the way you feel right now.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8 animate-fade-up [animation-delay:0.3s]">
              <Button
                onClick={() => navigate("/gallery")}
                className="h-16 px-10 rounded-2xl bg-[#e9c49a] text-black hover:bg-white transition-all gap-3 font-bold text-lg group shadow-[0_20px_40px_rgba(233,196,154,0.15)]"
              >
                <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                Begin Exploring
              </Button>
              <Button
                variant="outline"
                className="h-16 px-10 rounded-2xl bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-[#e9c49a]/40 transition-all gap-3 font-light text-lg group"
                onClick={() => navigate("/short-videos")}
              >
                <Play className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" />
                Watch Stories
              </Button>
            </div>
          </div>

          {/* Right Column: Triple Card Layout */}
          <div className="relative flex justify-center items-center h-[500px] lg:h-[700px] animate-fade-up [animation-delay:0.4s]">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Activity className="w-12 h-12 text-[#e9c49a] animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.5em] text-[#e9c49a]/60 font-bold">Initializing Visuals...</span>
              </div>
            ) : heroImages.length > 0 ? (
              <div className="relative w-full max-w-lg">
                {/* Background Cards with Parallax/Float */}
                {heroImages.slice(0, 3).map((img, idx) => {
                  const offsets = [
                    { x: -60, y: -40, rotate: -12, scale: 0.85, opacity: 0.3 },
                    { x: 60, y: 110, rotate: 8, scale: 0.9, opacity: 0.5 },
                    { x: 0, y: 30, rotate: 0, scale: 1, opacity: 1 },
                  ];
                  const pos = offsets[idx];

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 100, rotate: 20 }}
                      animate={{
                        opacity: pos.opacity,
                        x: pos.x + (mousePosition.x * (idx + 1) * 0.2),
                        y: pos.y + (mousePosition.y * (idx + 1) * 0.2),
                        rotate: pos.rotate,
                        scale: pos.scale
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        delay: 0.5 + (idx * 0.15)
                      }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[380px] aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] group"
                      style={{ zIndex: idx }}
                    >
                      {/* Image */}
                      <img src={img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />

                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

                      {/* Premium Details */}
                      {idx === 2 && (
                        <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-[#e9c49a]" />
                            </div>
                            <div className="h-px flex-1 bg-white/10" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-white font-display text-2xl font-light">Ethereal Archive</h4>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Artifact-0{idx + 1}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 uppercase tracking-[0.5em] text-[10px] font-bold">
                No Artifacts Available
              </div>
            )}
          </div>
        </div>

        {/* Quiet indicator */}
        <div
          className="pt-24 lg:pt-16 flex justify-center"
          style={{
            animation: `fadeUp 1s ease-out 0.6s forwards`,
            opacity: 0,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-muted-foreground/60 uppercase tracking-widest text-center">Scroll to discover</span>
            <div
              className="w-px h-12"
              style={{
                background: `linear-gradient(180deg, #e9c49a, transparent)`,
                animation: `breathe ${3 / motionSpeed}s ease-in-out infinite`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
