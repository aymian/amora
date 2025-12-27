import { Sparkles } from "lucide-react";

const footerLinks = [
  { name: "About", href: "#" },
  { name: "Privacy", href: "#" },
  { name: "Terms", href: "#" },
  { name: "Contact", href: "#" },
];

const socialLinks = [
  { name: "Twitter", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "Discord", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative py-16 border-t border-border/50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <a href="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold tracking-wide">
                Amora
              </span>
            </a>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Where emotions find their visual voice. Cinematic stories that touch the soul.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8 md:justify-center">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Links</h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4 md:text-right">
            <h4 className="text-sm font-medium text-foreground">Follow Us</h4>
            <div className="flex gap-4 md:justify-end">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Amora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
