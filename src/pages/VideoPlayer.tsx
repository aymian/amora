import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Info } from "lucide-react";
import AdvancedPlayer from "@/components/video/AdvancedPlayer";

export default function VideoPlayer() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
            {/* Minimal Header */}
            <header className="h-20 px-8 flex items-center justify-between relative z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-white/40 hover:text-white transition-all"
                >
                    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-light tracking-widest uppercase">Return to Gallery</span>
                </button>

                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Immersion Area */}
            <main className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-6xl">
                    <AdvancedPlayer
                        url="https://iframe.mediadelivery.net/play/331393/631484be-9ca8-4712-b258-3932a353d89d"
                        title="The Echoes of Neon Nights"
                    />
                </div>
            </main>

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#e9c49a]/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full" />
            </div>
        </div>
    );
}
