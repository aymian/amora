import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";

export function CTASection() {
  const { transitionDuration, colorIntensity, motionSpeed } = useMood();

  return (
    <section className="relative py-40 overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, hsla(350, 70%, 50%, 0.05), transparent 70%)`,
          }}
        />
      </div>

      {/* Floating ambient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[150px]"
        style={{
          background: `hsla(350, 70%, 50%, 0.06)`,
          animation: `breathe ${8 / motionSpeed}s ease-in-out infinite`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[120px]"
        style={{
          background: `hsla(280, 60%, 45%, ${0.08 * colorIntensity})`,
          animation: `breathe ${10 / motionSpeed}s ease-in-out infinite 2s`,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          {/* Quiet, poetic headline */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.1]">
            <span className="text-foreground/80">A quiet place</span>
            <br />
            <span
              className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#ff3366] to-[#ff00cc]"
              style={{
                backgroundImage: `linear-gradient(135deg, hsl(350, 70%, 65%), hsl(320, 65%, 60%))`,
              }}
            >
              for your feelings
            </span>
          </h2>

          {/* Minimal subtext */}
          <p
            className="text-xl text-muted-foreground font-light max-w-md mx-auto"
            style={{ opacity: 0.8 }}
          >
            Stories that listen. Visuals that understand. A space that feels like home.
          </p>

          {/* Single calm CTA */}
          <div className="pt-6">
            <Button
              variant="premium"
              size="xl"
              className="group gap-3"
            >
              <Compass
                className="w-5 h-5"
                style={{
                  transition: `transform ${transitionDuration}ms`,
                }}
              />
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
