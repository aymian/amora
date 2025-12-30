import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";
import { Logo } from "@/components/brand/Logo";

const navLinks = [
  { name: "Explore", href: "#" },
  { name: "Stories", href: "#stories", active: true },
  { name: "Mood", href: "#mood" },
  { name: "Creators", href: "#" },
];

export function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { transitionDuration } = useMood();

  return (
    <>
      <nav
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6"
        style={{ transition: `all ${transitionDuration}ms ease-out` }}
      >
        <div
          className="w-full max-w-6xl flex items-center justify-between px-6 md:px-8 py-3 rounded-[20px] bg-[#1a1c23]/40 backdrop-blur-xl border border-[#e9c49a]/20 shadow-2xl"
          style={{
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)",
          }}
        >
          {/* Logo */}
          <Logo size="sm" className="flex-shrink-0" />

          {/* Navigation - Desktop */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link, i) => (
              <a
                key={`${link.name}-${i}`}
                href={link.href}
                className={`relative text-[13px] font-normal tracking-[0.05em] transition-colors ${link.active ? "text-white" : "text-white/60 hover:text-white"
                  }`}
              >
                {link.name}
                {link.active && (
                  <span
                    className="absolute -bottom-1.5 left-0 w-full h-[1px] bg-[#e9c49a]"
                  />
                )}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hidden sm:flex text-white/50 hover:text-[#e9c49a] transition-colors text-[11px] font-bold uppercase tracking-[0.2em]"
              onClick={() => navigate("/login")}
            >
              Welcome Back
            </Button>
            <Button
              className="hidden sm:flex h-11 px-8 rounded-xl bg-gradient-to-br from-[#e9c49a] via-[#b48c5c] to-[#876445] text-black text-[11px] font-bold uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(233,196,154,0.15)] hover:shadow-[0_15px_30px_rgba(233,196,154,0.25)] hover:scale-[1.02] transition-all"
              onClick={() => navigate("/signup")}
            >
              Begin Your Story
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden pointer-events-none transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-28 left-6 right-6 p-8 rounded-2xl bg-[#1a1c23] border border-[#e9c49a]/20 shadow-2xl pointer-events-auto transition-transform duration-500 ${isMobileMenuOpen ? "translate-y-0" : "-translate-y-10"}`}
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link, i) => (
              <a
                key={`${link.name}-mob-${i}`}
                href={link.href}
                className="text-lg font-light text-white/80 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-center text-white/70"
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Welcome Back
              </Button>
              <Button
                className="w-full justify-center bg-gradient-to-r from-[#8b6544] to-[#4a2c2a] border-[#e9c49a]/30"
                onClick={() => {
                  navigate("/signup");
                  setIsMobileMenuOpen(false);
                }}
              >
                Begin Your Story
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
