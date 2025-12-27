import { useState, useEffect } from "react";

const heroImages = [
  {
    id: 1,
    gradient: "from-rose-500/80 to-purple-600/80",
    title: "Eternal Sunrise",
    category: "Calm",
  },
  {
    id: 2,
    gradient: "from-amber-500/80 to-rose-500/80",
    title: "Golden Hour",
    category: "Hope",
  },
  {
    id: 3,
    gradient: "from-violet-500/80 to-indigo-600/80",
    title: "Midnight Dreams",
    category: "Mystery",
  },
];

export function HeroCards() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {heroImages.map((image, index) => {
        const offsetX = index * 15 - 15;
        const offsetY = index * 30 - 30;
        const rotation = (index - 1) * 8;
        const zIndex = heroImages.length - index;
        const scale = 1 - index * 0.05;

        return (
          <div
            key={image.id}
            className={`absolute w-64 sm:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-card transition-transform duration-500 ease-out ${
              index === 0 ? "animate-float" : index === 1 ? "animate-float-delayed" : "animate-float-slow"
            }`}
            style={{
              zIndex,
              transform: `
                translateX(calc(${offsetX}px + ${mousePosition.x * (0.5 + index * 0.2)}px))
                translateY(calc(${offsetY}px + ${mousePosition.y * (0.5 + index * 0.2)}px))
                rotate(${rotation}deg)
                scale(${scale})
              `,
            }}
          >
            {/* Card Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${image.gradient}`} />
            
            {/* Noise Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
            
            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="text-xs font-medium text-foreground/70 uppercase tracking-wider">
                {image.category}
              </span>
              <h3 className="font-display text-lg font-medium text-foreground mt-1">
                {image.title}
              </h3>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
          </div>
        );
      })}

      {/* Background Glow for Cards */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-60" />
    </div>
  );
}
