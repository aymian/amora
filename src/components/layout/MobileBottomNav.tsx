import { useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    Compass,
    Video,
    Image as ImageIcon,
    User,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            icon: Home,
            label: "Home",
            path: "/dashboard",
            color: "text-blue-400"
        },
        {
            icon: Compass,
            label: "Explore",
            path: "/explore",
            color: "text-purple-400"
        },
        {
            icon: Video,
            label: "Shorts",
            path: "/short-videos",
            color: "text-[#e9c49a]",
            isMain: true
        },
        {
            icon: ImageIcon,
            label: "Gallery",
            path: "/images",
            color: "text-pink-400"
        },
        {
            icon: User,
            label: "Profile",
            path: "/profile",
            color: "text-emerald-400"
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Gradient Fade for smooth content transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />

            {/* Nav Bar */}
            <div className="relative bg-black/40 backdrop-blur-xl border-t border-white/5 pb-safe-area-inset-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300",
                                    isActive ? "text-white" : "text-white/40 hover:text-white/60"
                                )}
                            >
                                {/* Active Indicator Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className={cn(
                                            "absolute inset-0 bg-white/5 rounded-2xl -z-10 blur-md",
                                            item.isMain ? "bg-[#e9c49a]/20" : "bg-white/5"
                                        )}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                {/* Icon */}
                                <div className={cn(
                                    "relative transition-all duration-300",
                                    isActive && "scale-110",
                                    item.isMain && "mb-1"
                                )}>
                                    <item.icon
                                        className={cn(
                                            "w-6 h-6 transition-colors duration-300",
                                            isActive ? item.color : "currentColor",
                                            item.isMain && !isActive && "text-[#e9c49a]"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />

                                    {/* Dot indicator for active state */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-dot"
                                            className={cn(
                                                "absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                                                item.color.replace('text-', 'bg-')
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <span className={cn(
                                    "text-[9px] font-medium tracking-wide transition-all duration-300",
                                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 hidden"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
