import { Heart } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";

const footerLinks = [
  { name: "About", href: "#about" },
  { name: "Stories", href: "#stories" },
  { name: "Privacy", href: "#" },
  { name: "Terms", href: "#" },
];

export function Footer() {
  const { transitionDuration, colorIntensity } = useMood();

  return (
    <footer className="relative py-20 border-t border-white/5">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, hsl(350, 70%, ${55 * colorIntensity}%), hsl(320, 65%, ${50 * colorIntensity}%))`,
                boxShadow: `0 0 30px hsla(350, 70%, 60%, ${0.2 * colorIntensity})`,
                transition: `all ${transitionDuration}ms`,
              }}
            >
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-semibold tracking-wide text-foreground">
              Amora
            </span>
          </a>

          {/* Poetic tagline */}
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Where emotions find their visual voice. 
            <br />
            A quiet companion for your heart.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
                style={{ transition: `color ${transitionDuration}ms` }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="pt-8">
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Amora. Made with feeling.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
