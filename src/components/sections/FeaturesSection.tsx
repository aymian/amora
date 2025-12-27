import { Sparkles, Eye, Crown } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Cinematic Stories",
    description: "Intelligent narratives that adapt to your emotions and preferences",
    gradient: "from-primary/20 to-accent/20",
    iconGradient: "from-primary to-accent",
  },
  {
    icon: Eye,
    title: "Curated Visual Beauty",
    description: "Handpicked aesthetics that transform every frame into art",
    gradient: "from-violet-500/20 to-purple-600/20",
    iconGradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Crown,
    title: "Premium Experience",
    description: "Exclusive access to the finest collection of visual stories",
    gradient: "from-amber-500/20 to-orange-600/20",
    iconGradient: "from-amber-500 to-orange-600",
  },
];

export function FeaturesSection() {
  return (
    <section id="creators" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light">
            Why <span className="text-gradient-primary font-medium">Amora</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            An experience crafted for those who seek beauty in every moment
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-3xl glass transition-all duration-500 hover:shadow-glow-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
              
              {/* Content */}
              <div className="relative z-10 space-y-6">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Text */}
                <div className="space-y-3">
                  <h3 className="font-display text-2xl font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Decorative Border */}
              <div className="absolute inset-0 rounded-3xl border border-white/5 group-hover:border-white/10 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
