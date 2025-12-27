import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import { HeroCards } from "@/components/hero/HeroCards";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-6">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
                <span className="block">Feel Stories</span>
                <span className="block text-gradient-primary font-medium">
                  Like Never Before
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-md leading-relaxed font-light">
                Immerse yourself in cinematic visual journeys crafted to evoke 
                emotion, wonder, and deep connection.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="hero-primary" size="lg" className="group">
                Explore Stories
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button variant="hero" size="lg" className="group">
                <Play className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                Watch Preview
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-muted border-2 border-background"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
              </div>
              <div className="text-sm">
                <span className="text-foreground font-medium">50K+</span>{" "}
                <span className="text-muted-foreground">dreamers exploring</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Cards */}
          <div className="relative lg:h-[600px] animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <HeroCards />
          </div>
        </div>
      </div>
    </section>
  );
}
