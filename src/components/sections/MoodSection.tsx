import { Heart, Leaf, Sparkles, Moon, Sun } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";

const moods = [
  {
    name: "Calm",
    description: "Find peace",
    icon: Leaf,
    gradient: "from-emerald-500/20 to-teal-600/20",
    iconColor: "from-emerald-400 to-teal-500",
    glow: "emerald",
  },
  {
    name: "Hope",
    description: "See light",
    icon: Sun,
    gradient: "from-amber-500/20 to-orange-600/20",
    iconColor: "from-amber-400 to-orange-500",
    glow: "amber",
  },
  {
    name: "Strength",
    description: "Feel power",
    icon: Sparkles,
    gradient: "from-violet-500/20 to-purple-600/20",
    iconColor: "from-violet-400 to-purple-500",
    glow: "violet",
  },
];

export function MoodSection() {
  const { transitionDuration, colorIntensity } = useMood();

  return (
    <section id="mood" className="relative py-32 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <span className="text-xs font-medium text-primary uppercase tracking-widest">How are you feeling?</span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light">
            Discover by <span className="text-gradient-primary font-medium">Feeling</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Let your emotions guide you to stories that understand
          </p>
        </div>

        {/* Mood Cards - Large, minimal, emotional */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {moods.map((mood, index) => (
            <div
              key={mood.name}
              className="group relative cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className="relative p-10 rounded-3xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(240, 12%, 10%), hsl(240, 15%, 8%))`,
                  border: "1px solid hsla(0, 0%, 100%, 0.05)",
                  transition: `all ${transitionDuration}ms ease-out`,
                }}
              >
                {/* Hover Gradient */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-0 group-hover:opacity-100`}
                  style={{ transition: `opacity ${transitionDuration}ms` }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  {/* Icon */}
                  <div 
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mood.iconColor} flex items-center justify-center`}
                    style={{
                      transform: "scale(1)",
                      boxShadow: `0 0 0 hsla(0, 0%, 100%, 0)`,
                      transition: `all ${transitionDuration}ms ease-out`,
                    }}
                  >
                    <mood.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Text */}
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-medium text-foreground">
                      {mood.name}
                    </h3>
                    <p 
                      className="text-muted-foreground text-sm"
                      style={{
                        opacity: 0.7,
                        transform: "translateY(0)",
                        transition: `all ${transitionDuration}ms ease-out`,
                      }}
                    >
                      {mood.description}
                    </p>
                  </div>
                </div>

                {/* Border glow on hover */}
                <div 
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 1px hsla(0, 0%, 100%, 0.05)",
                    transition: `box-shadow ${transitionDuration}ms`,
                  }}
                />
              </div>
              
              {/* Ambient glow under card on hover */}
              <div 
                className="absolute -inset-4 -z-10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${mood.glow === "emerald" ? "hsl(160, 60%, 40%)" : mood.glow === "amber" ? "hsl(40, 80%, 50%)" : "hsl(280, 60%, 50%)"}, transparent)`,
                  transition: `opacity ${transitionDuration}ms`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
