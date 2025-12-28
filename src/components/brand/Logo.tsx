import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e9c49a] to-[#8b6544] flex items-center justify-center shadow-[0_0_20px_rgba(233,196,154,0.3)]">
                <span className="font-display font-bold text-white text-lg">A</span>
            </div>
            <span className="font-display font-light text-xl tracking-tighter text-white">
                Amora <span className="text-[#e9c49a] italic">Pro</span>
            </span>
        </div>
    );
}
