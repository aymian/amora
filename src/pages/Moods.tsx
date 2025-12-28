import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Sparkles,
    Wind,
    Zap,
    Moon,
    Sun,
    Flame,
    Droplets,
    CloudIcon,
    Play,
    ArrowRight,
    Heart,
    Share2,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const MOODS = [
    { id: 'cinematic', label: 'Cinematic', icon: Play, color: 'from-orange-500/20 to-red-600/20', accent: 'text-orange-400', desc: 'Epic narratives and high-fidelity visuals.' },
    { id: 'ethereal', label: 'Ethereal', icon: Wind, color: 'from-blue-400/20 to-indigo-500/20', accent: 'text-blue-300', desc: 'Dreamy environments and transcendent flows.' },
    { id: 'vibrant', label: 'Vibrant', icon: Zap, color: 'from-yellow-400/20 to-orange-500/20', accent: 'text-yellow-400', desc: 'High energy, saturated colors, and dynamic motion.' },
    { id: 'noir', label: 'Noir', icon: Moon, color: 'from-gray-800/40 to-black/60', accent: 'text-gray-400', desc: 'Shadow-heavy, mysterious, and high-contrast.' },
    { id: 'radiant', label: 'Radiant', icon: Sun, color: 'from-amber-400/20 to-yellow-600/20', accent: 'text-amber-400', desc: 'Warm, positive, and light-filled compositions.' },
    { id: 'intense', label: 'Intense', icon: Flame, color: 'from-red-600/20 to-rose-700/20', accent: 'text-red-500', desc: 'Powerful, aggressive, and highly emotive.' },
    { id: 'serene', label: 'Serene', icon: Droplets, color: 'from-teal-400/20 to-emerald-500/20', accent: 'text-teal-400', desc: 'Calming, peaceful, and fluid experiences.' },
    { id: 'mystic', label: 'Mystic', icon: CloudIcon, color: 'from-purple-500/20 to-fuchsia-600/20', accent: 'text-purple-400', desc: 'Enigmatic, surreal, and deep-space vibes.' },
];

export default function Moods() {
    const [userData, setUserData] = useState<any>(null);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const { doc, getDoc } = await import("firebase/firestore");
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData({ id: user.uid, ...userDoc.data() });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                // Fetch from gallery_videos as a base for moods
                const q = query(
                    collection(db, "gallery_videos"),
                    orderBy("createdAt", "desc"),
                    limit(20)
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setContent(items);
            } catch (error) {
                console.error("Error fetching moods content:", error);
            } finally {
                setTimeout(() => setLoading(false), 800);
            }
        };

        fetchContent();
    }, [selectedMood]);

    return (
        <DashboardLayout user={userData}>
            <div className="space-y-12 pb-20">
                {/* Header */}
                <div className="relative">
                    <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#e9c49a]/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-[10px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]">
                            <Sparkles className="w-3.5 h-3.5" />
                            Mood Resonance Protocol
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-display font-light tracking-tight leading-none">
                            Emotional <br />
                            <span className="text-white/20 italic">Architectures</span>
                        </h1>
                        <p className="max-w-xl text-white/40 font-light leading-relaxed">
                            Navigate the cinematic multiverse through emotional frequencies. Select a mood to synchronize your perception with matching artifacts.
                        </p>
                    </div>
                </div>

                {/* Mood Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {MOODS.map((mood) => {
                        const Icon = mood.icon;
                        const isSelected = selectedMood === mood.id;

                        return (
                            <motion.button
                                key={mood.id}
                                onClick={() => setSelectedMood(isSelected ? null : mood.id)}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative h-48 rounded-[2.5rem] p-6 text-left transition-all duration-500 overflow-hidden group border",
                                    isSelected
                                        ? "border-[#e9c49a] shadow-[0_20px_40px_rgba(233,196,154,0.15)]"
                                        : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                                )}
                            >
                                {/* Background Gradient */}
                                <div className={cn(
                                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br",
                                    mood.color,
                                    isSelected && "opacity-100"
                                )} />

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                        isSelected ? "bg-[#e9c49a] text-black" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <h3 className={cn(
                                            "text-lg font-bold tracking-wide transition-colors duration-300",
                                            isSelected ? "text-white" : "text-white/60 group-hover:text-white"
                                        )}>
                                            {mood.label}
                                        </h3>
                                        <p className="text-[10px] text-white/30 font-medium leading-tight mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {mood.desc}
                                        </p>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="absolute top-6 right-6">
                                        <CheckCircle2 className="w-5 h-5 text-[#e9c49a]" />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Content Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-display font-light flex items-center gap-4">
                            <span className="w-12 h-px bg-[#e9c49a]/40" />
                            {selectedMood ? `${MOODS.find(m => m.id === selectedMood)?.label} Sequences` : 'Universal Resonance'}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-video rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {content.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => navigate(`/watch?id=${item.id}`)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 group-hover:border-[#e9c49a]/30 transition-all duration-700 shadow-2xl">
                                        <img
                                            src={item.imageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80"}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white fill-white" />
                                            </div>
                                        </div>

                                        {/* Meta Stats */}
                                        <div className="absolute top-6 right-6 flex gap-2">
                                            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                                <span className="text-[10px] font-bold">{Math.floor(Math.random() * 500) + 100}</span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-full bg-[#e9c49a]/20 border border-[#e9c49a]/30 text-[#e9c49a] text-[8px] uppercase tracking-widest font-black">
                                                    Original
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-display font-light tracking-wide group-hover:text-[#e9c49a] transition-colors">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
