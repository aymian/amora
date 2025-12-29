import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Play as PlayIcon,
  Apple as AppleIcon,
  Mail,
  ArrowRight
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Product: [
    { name: "Experience", href: "/#stories" },
    { name: "Emotion AI", href: "/emotion-ai" },
    { name: "Creator Lab", href: "/#creator" },
    { name: "Pricing", href: "/upgrade" },
  ],
  Company: [
    { name: "About Us", href: "/#about" },
    { name: "Manifesto", href: "/#manifesto" },
    { name: "Careers", href: "/#careers" },
    { name: "Contact", href: "/#contact" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/#privacy" },
    { name: "Terms of Service", href: "/#terms" },
    { name: "Cookie Policy", href: "/#cookies" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", name: "Instagram" },
  { icon: Twitter, href: "#", name: "Twitter" },
  { icon: Linkedin, href: "#", name: "LinkedIn" },
  { icon: Github, href: "#", name: "GitHub" },
];

const AppleStoreIcon = () => (
  <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const PlayStoreIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      fill="#4285F4"
      d="M3.609 1.814L13.792 12 3.61 22.186c-.18.18-.329.155-.329-.1v-20.17c0-.255.15-.28.329-.102z"
    />
    <path
      fill="#EA4335"
      d="M16.909 8.88l-4.482 4.482L3.609 1.814c.148-.148.4-.108.694.058l12.606 7.008z"
    />
    <path
      fill="#FBBC05"
      d="M20.391 10.814l-3.482-1.934-1.365 1.365 1.365 1.365 3.482-1.934c.4-.222.4-.584 0-.806z"
    />
    <path
      fill="#34A853"
      d="M3.609 22.186l8.818-8.818 4.482 4.482-12.606 7.008c-.294.166-.546.206-.694.058z"
    />
  </svg>
);

export function Footer() {
  return (
    <footer className="relative pt-24 pb-12 overflow-hidden bg-[#050505] border-t border-white/5">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e9c49a]/30 to-transparent" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#e9c49a]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block group">
              <Logo size="lg" showTagline={true} className="flex-col items-start" />
            </Link>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">
              Creating a world where stories adapt to your emotions. Join the elite circle of cinematic explorers and experience the future of digital narrative.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-[#e9c49a] hover:border-[#e9c49a]/40 hover:bg-[#e9c49a]/5 transition-all group"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white/20">
                  {title}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm border-b border-transparent text-white/40 hover:text-white hover:border-white/20 transition-all font-light"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* App Download / Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={80} className="text-[#e9c49a]" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-display font-light text-white">Download Our App</h4>
                <p className="text-white/40 text-sm font-light">Experience Amora anywhere, anytime with our mobile application.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="h-14 flex-1 bg-black border border-white/10 hover:bg-white/5 text-white rounded-xl gap-3 transition-all">
                  <AppleStoreIcon />
                  <div className="text-left">
                    <div className="text-[9px] uppercase leading-none opacity-60 font-bold">Download on the</div>
                    <div className="text-sm font-bold leading-none mt-1">App Store</div>
                  </div>
                </Button>
                <Button className="h-14 flex-1 bg-black border border-white/10 hover:bg-white/5 text-white rounded-xl gap-3 transition-all">
                  <PlayStoreIcon />
                  <div className="text-left">
                    <div className="text-[9px] uppercase leading-none opacity-60 font-bold">GET IT ON</div>
                    <div className="text-sm font-bold leading-none mt-1">Google Play</div>
                  </div>
                </Button>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-[#e9c49a] transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-12 text-xs focus:outline-none focus:border-[#e9c49a]/40 transition-all"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-medium">
            © {new Date().getFullYear()} Amora Experience. All rights reserved.
          </p>
          <div className="flex items-center gap-2 group cursor-none">
            <span className="text-[10px] uppercase tracking-widest text-white/20">Designed with</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#e9c49a] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-white/20">Precision & Emotion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Add this import to the top if not present, but it seems I need Sparkles
import { Sparkles } from "lucide-react";
