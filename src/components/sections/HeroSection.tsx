import { Button } from "@/components/ui/button";
import { Play, Compass } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";
import { useState, useEffect } from "react";

export function HeroSection() {
  const { transitionDuration, colorIntensity, motionSpeed } = useMood();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient Glow Effects */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[200px]"
        style={{
          top: "20%",
          left: "30%",
          background: `radial-gradient(circle, hsla(350, 70%, 50%, ${0.15 * colorIntensity}), transparent 70%)`,
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: `transform ${transitionDuration * 2}ms ease-out`,
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[180px]"
        style={{
          bottom: "10%",
          right: "20%",
          background: `radial-gradient(circle, hsla(280, 60%, 45%, ${0.1 * colorIntensity}), transparent 70%)`,
          transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
          transition: `transform ${transitionDuration * 2}ms ease-out`,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Tagline */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass"
            style={{
              animation: `fadeUp 0.8s ease-out forwards`,
              opacity: 0,
            }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: `hsl(350, 70%, ${60 * colorIntensity}%)` }}
            />
            <span className="text-sm text-muted-foreground">A quiet space for your emotions</span>
          </div>

          {/* Main Headline */}
          <h1 
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] tracking-tight"
            style={{
              animation: `fadeUp 1s ease-out 0.1s forwards`,
              opacity: 0,
            }}
          >
            <span className="block text-foreground/90">Stories that</span>
            <span 
              className="block font-medium"
              style={{
                background: `linear-gradient(135deg, hsl(350, 70%, ${65 * colorIntensity}%), hsl(320, 65%, ${60 * colorIntensity}%))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              feel like you
            </span>
          </h1>

          {/* Poetic Subtext */}
          <p 
            className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed font-light"
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
            className="flex flex-wrap justify-center gap-5 pt-6"
            style={{
              animation: `fadeUp 1s ease-out 0.3s forwards`,
              opacity: 0,
            }}
          >
            <Button 
              variant="premium" 
              size="xl" 
              className="group gap-3"
            >
              <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" style={{ transitionDuration: `${transitionDuration}ms` }} />
              Begin Exploring
            </Button>
            <Button 
              variant="hero" 
              size="xl" 
              className="group gap-3"
            >
              <Play className="w-5 h-5 transition-transform group-hover:scale-110" style={{ transitionDuration: `${transitionDuration}ms` }} fill="currentColor" />
              Watch a Story
            </Button>
          </div>

          {/* Quiet indicator */}
          <div 
            className="pt-16"
            style={{
              animation: `fadeUp 1s ease-out 0.5s forwards`,
              opacity: 0,
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Scroll to discover</span>
              <div 
                className="w-px h-12"
                style={{
                  background: `linear-gradient(180deg, hsl(350, 70%, ${50 * colorIntensity}%), transparent)`,
                  animation: `breathe ${3 / motionSpeed}s ease-in-out infinite`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
