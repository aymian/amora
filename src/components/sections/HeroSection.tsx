import { Button } from "@/components/ui/button";
import { Play, Compass } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const { transitionDuration, motionSpeed } = useMood();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* Ambient Glow Effects - Updated to Gold/Neutral */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[200px]"
        style={{
          top: "10%",
          left: "20%",
          background: `radial-gradient(circle, hsla(38, 50%, 50%, 0.08), transparent 70%)`,
          opacity: 0.6,
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
        style={{
          bottom: "5%",
          right: "10%",
          background: `radial-gradient(circle, hsla(40, 30%, 30%, 0.05), transparent 70%)`,
          opacity: 0.4,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-10 text-center lg:text-left">
            {/* Tagline */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
              style={{
                animation: `fadeUp 0.8s ease-out forwards`,
                opacity: 0,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: `#e9c49a`, boxShadow: '0 0 10px #e9c49a' }}
              />
              <span className="text-sm text-white/60 tracking-wider">A quiet space for your emotions</span>
            </div>

            {/* Main Headline */}
            <h1
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-8xl xl:text-9xl font-light leading-[1.05] tracking-tight"
              style={{
                animation: `fadeUp 1s ease-out 0.1s forwards`,
                opacity: 0,
              }}
            >
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
            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-light"
              style={{
                animation: `fadeUp 1s ease-out 0.2s forwards`,
                opacity: 0,
              }}
            >
              Let visuals speak to your heart. Discover cinematic moments
              crafted for the way you feel right now.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8"
              style={{
                animation: `fadeUp 1s ease-out 0.3s forwards`,
                opacity: 0,
              }}
            >
              <Button
                className="h-14 px-10 rounded-xl bg-gradient-to-r from-[#8b6544] to-[#4a2c2a] text-white border border-[#e9c49a]/40 shadow-[0_0_30px_rgba(139,101,68,0.2)] hover:shadow-[0_0_40px_rgba(139,101,68,0.4)] hover:scale-[1.02] transition-all gap-3 font-light text-lg"
              >
                <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
                Begin Exploring
              </Button>
              <Button
                variant="outline"
                className="h-14 px-10 rounded-xl bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all gap-3 font-light text-lg group"
                onClick={() => navigate("/video-player")}
              >
                <Play className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" />
                Watch a Story
              </Button>
            </div>
          </div>

          {/* Right Column: iPhone Mockup */}
          <div
            className="relative flex justify-center lg:justify-end"
            style={{
              animation: `fadeUp 1.2s ease-out 0.4s forwards`,
              opacity: 0,
            }}
          >
            {/* Ambient glow behind device */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#e9c49a]/10 blur-[100px] rounded-full pointer-events-none" />

            {/* iPhone Frame */}
            <div className="relative w-[280px] h-[580px] sm:w-[320px] sm:h-[660px] rounded-[3rem] border-[12px] border-[#1a1c23] bg-[#000] shadow-[0_50px_100px_-20px_rgba(0,0,0,1),0_0_0_2px_rgba(233,196,154,0.1)] overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1c23] rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-white/10 rounded-full" />
              </div>

              {/* Screen Content */}
              <div className="absolute inset-0 z-10">
                <img
                  src="/app-interface.png"
                  alt="Amora App Interface"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Reflections/Glares */}
              <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
            </div>

            {/* Floating elements around phone */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 glass rounded-2xl flex items-center justify-center p-4 text-center z-40 hidden sm:flex"
              style={{ animation: `breathe 6s ease-in-out infinite` }}
            >
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-widest">Premium Visuals</p>
            </div>
            <div
              className="absolute -bottom-6 -left-6 w-40 h-24 glass rounded-2xl flex items-center justify-center p-4 z-40 hidden sm:flex"
              style={{ animation: `breathe 8s ease-in-out infinite 1s` }}
            >
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-[#e9c49a]/20 flex items-center justify-center">
                  <Play className="w-3 h-3 text-[#e9c49a]" fill="currentColor" />
                </div>
                <div className="space-y-1">
                  <div className="w-20 h-1.5 bg-white/20 rounded-full" />
                  <div className="w-12 h-1 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
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
