import { Heart, Leaf, Zap, Moon, Sunrise } from "lucide-react";

const moods = [
  {
    name: "Love",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    bgGradient: "from-rose-900/40 to-pink-900/40",
  },
  {
    name: "Calm",
    icon: Leaf,
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-900/40 to-teal-900/40",
  },
  {
    name: "Power",
    icon: Zap,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-900/40 to-orange-900/40",
  },
  {
    name: "Lonely",
    icon: Moon,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-900/40 to-purple-900/40",
  },
  {
    name: "Hope",
    icon: Sunrise,
    gradient: "from-sky-400 to-blue-600",
    bgGradient: "from-sky-900/40 to-blue-900/40",
  },
];

export function MoodSection() {
  return (
    <section id="mood" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light">
            Choose Your <span className="text-gradient-primary font-medium">Mood</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Let your emotions guide you to the perfect visual experience
          </p>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {moods.map((mood, index) => (
            <div
              key={mood.name}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.bgGradient} transition-all duration-500`} />
              
              {/* Hover Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-0 group-hover:opacity-30 transition-all duration-500`} />
              
              {/* Border Glow */}
              <div className={`absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all duration-500`} />
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[inset_0_0_30px_rgba(255,255,255,0.1)]`} />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mood.gradient} flex items-center justify-center mb-4 transform group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                  <mood.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-medium text-foreground transform group-hover:-translate-y-1 transition-all duration-500">
                  {mood.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  Explore stories
                </p>
              </div>

              {/* Noise texture */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
