import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    showTagline?: boolean;
}

export function Logo({ className, size = "md", showTagline = false }: LogoProps) {
    const sizes = {
        sm: { icon: "w-8 h-8", text: "text-lg", iconInner: "w-5 h-5", tagline: "text-[8px]" },
        md: { icon: "w-10 h-10", text: "text-2xl", iconInner: "w-6 h-6", tagline: "text-[10px]" },
        lg: { icon: "w-12 h-12", text: "text-3xl", iconInner: "w-8 h-8", tagline: "text-[12px]" }
    };

    const currentSize = sizes[size as keyof typeof sizes] || sizes.md;

    return (
        <Link to="/dashboard" className={cn("flex items-center gap-3 group cursor-pointer", className)}>
            <div className={cn(
                "relative rounded-xl overflow-hidden flex items-center justify-center transition-all duration-500",
                currentSize.icon
            )}>
                {/* Architectural Monolith Background */}
                <div className="absolute inset-0 bg-[#050505] border border-white/5 group-hover:border-[#e9c49a]/40 transition-colors duration-500" />

                {/* Dynamic Radiance */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e9c49a]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                {/* Elite Brand Mark (The Monolith A) */}
                <svg
                    viewBox="0 0 24 24"
                    className={cn("relative z-10 transition-all duration-700 ease-out group-hover:scale-110", currentSize.iconInner)}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 2L3 20H7L12 10L17 20H21L12 2Z"
                        fill="url(#gold-shine)"
                    />
                    <path
                        d="M12 10L9 16H15L12 10Z"
                        fill="black"
                        fillOpacity="0.5"
                    />
                    <defs>
                        <linearGradient id="gold-shine" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#f3e3cc" />
                            <stop offset="0.5" stopColor="#e9c49a" />
                            <stop offset="1" stopColor="#876445" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="flex flex-col -space-y-1.5">
                <span className={cn(
                    "font-display font-light tracking-[0.25em] text-white uppercase transition-all duration-700 group-hover:tracking-[0.35em] group-hover:text-white/90",
                    currentSize.text
                )}>
                    amora
                </span>
                {showTagline && (
                    <span className={cn("text-[#e9c49a]/30 font-bold uppercase tracking-[0.4em] font-sans", currentSize.tagline)}>
                        Cinematic Archive
                    </span>
                )}
                <div className="h-[1px] w-0 bg-gradient-to-r from-[#e9c49a]/60 via-[#e9c49a]/20 to-transparent group-hover:w-full transition-all duration-1000 ease-out" />
            </div>
        </Link>
    );
}
