import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background with Noise */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-primary/5 to-background noise-overlay" />
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.1]">
            Step Into a World of{" "}
            <span className="text-gradient-primary font-medium">Visual Stories</span>
          </h2>
          
          {/* Subtext */}
          <p className="text-xl sm:text-2xl text-muted-foreground font-light max-w-xl mx-auto">
            Feel more. See more. Experience beauty.
          </p>
          
          {/* CTA Button */}
          <div className="pt-4">
            <Button variant="premium" size="xl" className="group">
              Start Exploring
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
