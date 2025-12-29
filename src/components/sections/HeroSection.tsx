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
        setLoading(true);
        // Helper to fetch documents with fallback for missing createdAt or index
        const fetchCollection = async (collName: string, max: number) => {
          try {
            // First try sorted
            const q = query(collection(db, collName), orderBy("createdAt", "desc"), limit(max));
            const snap = await getDocs(q);
            if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // If empty, try unsorted (maybe no createdAt field or index)
            const q2 = query(collection(db, collName), limit(max));
            const snap2 = await getDocs(q2);
            return snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } catch (err) {
            console.warn(`Ordered fetch failed for ${collName}, falling back to unsorted`, err);
            const q3 = query(collection(db, collName), limit(max));
            const snap3 = await getDocs(q3);
            return snap3.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
        };

        const imageAssets = await fetchCollection("gallery_images", 4);
        const videoAssets = await fetchCollection("gallery_videos", 4);
        const shortAssets = await fetchCollection("shorts", 4);

        let assets = [...imageAssets];
        if (assets.length < 3) assets = [...assets, ...videoAssets];
        if (assets.length < 3) assets = [...assets, ...shortAssets];

        // Map to image URLs with Cloudinary thumbnail fallback for videos
        const imageList = assets.map((asset: any) => {
          if (asset.imageUrl) return asset.imageUrl;
          if (asset.videoUrl) return asset.videoUrl.replace(/\.[^/.]+$/, ".jpg");
          return null;
        }).filter(url => url);

        setHeroImages(imageList);
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

          {/* Right Column: Triple Card Layout (Social Story Style) */}
          <div className="relative flex justify-center items-center h-[600px] lg:h-[800px] animate-fade-up [animation-delay:0.4s]">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Activity className="w-12 h-12 text-[#e9c49a] animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.5em] text-[#e9c49a]/60 font-bold">Initializing Visuals...</span>
              </div>
            ) : heroImages.length > 0 ? (
              <div className="relative w-full max-w-lg flex items-center justify-center">
                {/* Background Cards with Parallax/Float */}
                {heroImages.slice(0, 3).map((img, idx) => {
                  const offsets = [
                    { x: -140, y: -20, rotate: -8, scale: 0.9, opacity: 0.8 }, // Left
                    { x: 140, y: 40, rotate: 6, scale: 0.9, opacity: 0.8 },   // Right
                    { x: 0, y: 10, rotate: 0, scale: 1, opacity: 1 },        // Center (Main)
                  ];

                  const pos = offsets[idx];

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 100, rotate: 10 }}
                      animate={{
                        opacity: pos.opacity,
                        x: pos.x + (mousePosition.x * (idx + 1) * 0.1),
                        y: pos.y + (mousePosition.y * (idx + 1) * 0.1),
                        rotate: pos.rotate,
                        scale: pos.scale
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 15,
                        delay: 0.5 + (idx * 0.1)
                      }}
                      className="absolute w-[280px] sm:w-[340px] aspect-[9/16] rounded-[2.5rem] overflow-visible border border-white/10 shadow-[20px_40px_80px_rgba(0,0,0,0.6)]"
                      style={{ zIndex: idx === 2 ? 30 : idx === 1 ? 20 : 10 }}
                    >
                      <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                        <img src={img} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                      </div>

                      {/* --- Left Card Specific Decor (idx 0) --- */}
                      {idx === 0 && (
                        <motion.div
                          className="absolute -left-10 top-1/2 w-16 h-16 pointer-events-none"
                          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-[#ff2d55] to-[#ff375f] shadow-[0_10px_30px_rgba(255,45,85,0.4)] flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                          </div>
                        </motion.div>
                      )}

                      {/* --- Right Card Specific Decor (idx 1) --- */}
                      {idx === 1 && (
                        <>
                          <motion.div
                            className="absolute -right-8 top-20 flex items-center gap-2 bg-[#00d26a] px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,210,106,0.3)]"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                            </div>
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-none stroke-[3] stroke-current"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </motion.div>

                          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full p-1.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 shadow-xl overflow-hidden">
                            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black/40">
                              <img src={heroImages[idx % heroImages.length]} className="w-full h-full object-cover" alt="" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* --- Center Main Card Specific Decor (idx 2) --- */}
                      {idx === 2 && (
                        <div className="absolute inset-0 p-6 flex flex-col pointer-events-none">
                          {/* Story Progress Bars */}
                          <div className="flex gap-1.5 mb-6">
                            <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
                              <div className="h-full w-2/3 bg-white" />
                            </div>
                            <div className="h-1 flex-1 bg-white/20 rounded-full" />
                          </div>

                          {/* Reaction Bubble (Emoji Group) */}
                          <motion.div
                            className="bg-white rounded-[2rem] p-3 px-5 shadow-2xl flex items-center gap-3 w-fit"
                            initial={{ scale: 0, x: -20 }}
                            animate={{ scale: 1, x: 0 }}
                            transition={{ delay: 1, type: "spring" }}
                          >
                            <span className="text-xl">🔥</span>
                            <span className="text-xl">🪞</span>
                            <span className="text-xl">💜</span>
                            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white rotate-45" />
                          </motion.div>

                          <div className="mt-auto space-y-4">
                            {/* Input Glass Bar */}
                            <div className="h-14 rounded-full glass border border-white/20 flex items-center px-6 justify-between">
                              <div className="w-32 h-1 bg-white/20 rounded-full" />
                              <div className="flex items-center gap-2">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white stroke-[2] stroke-current fill-none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                              </div>
                            </div>
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
