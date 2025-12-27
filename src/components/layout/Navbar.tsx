import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";

const navLinks = [
  { name: "Discover", href: "#discover" },
  { name: "Stories", href: "#stories" },
  { name: "Feelings", href: "#mood" },
  { name: "About", href: "#about" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { transitionDuration, colorIntensity } = useMood();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50`}
        style={{
          transition: `all ${transitionDuration}ms ease-out`,
          background: isScrolled 
            ? `hsla(240, 15%, 6%, 0.85)` 
            : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled ? "1px solid hsla(0, 0%, 100%, 0.05)" : "none",
          padding: isScrolled ? "0.75rem 0" : "1.5rem 0"
        }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(350, 70%, ${55 * colorIntensity}%), hsl(320, 65%, ${50 * colorIntensity}%))`,
                boxShadow: `0 0 30px hsla(350, 70%, 60%, ${0.3 * colorIntensity})`,
                transition: `all ${transitionDuration}ms`
              }}
            >
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
              {/* Subtle pulse animation */}
              <div 
                className="absolute inset-0 bg-white/20 animate-pulse-glow"
                style={{ opacity: 0.3 }}
              />
            </div>
            <span 
              className="font-display text-2xl font-semibold tracking-wide"
              style={{
                background: `linear-gradient(135deg, hsl(0, 0%, 95%), hsl(350, 70%, 80%))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Amora
            </span>
          </a>

          {/* Center Navigation - Desktop */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground group"
                style={{ transition: `color ${transitionDuration}ms` }}
              >
                {link.name}
                <span 
                  className="absolute -bottom-1 left-0 w-0 h-[2px] group-hover:w-full"
                  style={{
                    background: `linear-gradient(90deg, hsl(350, 70%, 60%), hsl(320, 65%, 55%))`,
                    transition: `width ${transitionDuration}ms ease-out`
                  }}
                />
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              Sign In
            </Button>
            <Button 
              variant="premium" 
              size="sm"
              className="hidden sm:inline-flex"
            >
              Begin Journey
            </Button>
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ transition: `background ${transitionDuration}ms` }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden`}
        style={{
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
          transition: `opacity ${transitionDuration}ms`
        }}
      >
        <div 
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div 
          className="absolute top-20 left-6 right-6 p-6 rounded-2xl glass-strong"
          style={{
            transform: isMobileMenuOpen ? "translateY(0)" : "translateY(-20px)",
            transition: `transform ${transitionDuration}ms ease-out`
          }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-foreground py-3 border-b border-white/5 last:border-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="ghost" className="w-full justify-center">
                Sign In
              </Button>
              <Button variant="premium" className="w-full justify-center">
                Begin Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
