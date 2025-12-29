import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Sparkles,
    Play,
    Heart,
    CheckCircle2,
    Search,
    ChevronRight,
    Activity,
    Clock,
    Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const MOOD_CATEGORIES = [
    {
        name: "Core Emotional Moods",
        moods: ["Happy", "Sad", "Heartbroken", "In Love", "Lonely", "Emotional", "Calm", "Peaceful", "Hopeful", "Motivated", "Confident", "Inspired", "Grateful", "Joyful", "Overwhelmed", "Confused", "Anxious", "Healing", "Comforting", "Warm", "Soft Feelings"]
    },
    {
        name: "Energy-Based & Time Moods",
        moods: ["Chill", "Relaxing", "Late Night", "Morning Vibes", "Night Vibes", "Sunset Mood", "Rainy Day", "Focus", "Sleepy", "Deep Thinking", "Slow Vibes", "High Energy", "Low Energy", "Fresh Start", "Weekend Mood", "After Midnight", "Quiet Time"]
    },
    {
        name: "Entertainment & Lifestyle",
        moods: ["Funny", "Comedy", "Cute", "Aesthetic", "Romantic", "Story Time", "POV", "Vlogs", "Fashion", "Beauty", "Fitness", "Travel", "Daily Life", "Glow Up", "Self Care", "Luxury Life", "Minimal Life", "Urban Life", "Creative Life"]
    },
    {
        name: "Dark / Intense / Real Emotions",
        moods: ["Toxic", "Savage", "Dark", "Pain", "Regret", "Revenge", "Reality", "Life Lessons", "Broken Trust", "Betrayal", "Jealousy", "Inner Battles", "Loneliness at Night", "Silent Pain", "Crying Inside", "Cold Love", "Harsh Truth", "Unspoken Words"]
    },
    {
        name: "Love, Relationships & Human Connection",
        moods: ["First Love", "True Love", "Real Love", "One-Sided Love", "Long Distance", "Missing You", "Breakup", "Moving On", "Love & Pain", "Dating Stories", "Relationship Advice", "Couple Goals", "Marriage Talks", "Love Confessions", "Love Letters", "Love After Pain", "Healing Love"]
    },
    {
        name: "Motivation, Growth & Mindset",
        moods: ["Self Growth", "Discipline", "Mindset", "Never Give Up", "Hustle", "Dream Big", "Life Advice", "Mental Strength", "Focus on Yourself", "Be Better", "No Excuses", "Winning Mindset", "Silent Work", "Success Journey", "Rise Again"]
    },
    {
        name: "Music & Sound-Based Moods",
        moods: ["Gospel", "Worship", "Praise", "Afrobeat", "Hip-Hop", "Drill", "R&B", "Love Songs", "Sad Songs", "Breakup Songs", "Instrumental", "Lo-Fi", "Acoustic", "Chill Beats", "Deep Beats", "Night Beats", "Motivation Beats"]
    },
    {
        name: "Adult (17+ but Safe)",
        moods: ["Mature Talks", "Real Conversations", "Relationship Reality", "Love Psychology", "Emotional Intelligence", "Dating Stories", "Understanding Women", "Understanding Men", "Boundaries", "Respect in Love", "Hard Truths About Love"]
    },
    {
        name: "Visual & Aesthetic Feelings",
        moods: ["Cinematic", "Slow Motion", "Moody Lighting", "Soft Lights", "Dark Tones", "Warm Colors", "Cold Colors", "Minimal", "Dreamy", "Vintage", "Modern", "Artistic", "Clean Visual"]
    }
];

export default function Moods() {
    const [userData, setUserData] = useState<any>(null);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const { doc, getDoc } = await import("firebase/firestore");
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData({ id: user.uid, ...userDoc.data() });
                }
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                let q;
                if (selectedMood) {
                    q = query(
                        collection(db, "mood_content"),
                        where("moods", "array-contains", selectedMood),
                        orderBy("createdAt", "desc"),
                        limit(24)
                    );
                } else {
                    q = query(
                        collection(db, "mood_content"),
                        orderBy("createdAt", "desc"),
                        limit(24)
                    );
                }

                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setContent(items);
            } catch (error) {
                console.error("Error fetching moods content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [selectedMood]);

    return (
        <DashboardLayout user={userData}>
            <div className="space-y-16 pb-40">
                {/* Header Phase */}
                <div className="relative pt-10">
                    <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-[#e9c49a]/5 blur-[150px] rounded-full pointer-events-none" />

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative z-10">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-[10px] uppercase tracking-[0.4em] font-black text-[#e9c49a]"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Neural Frequency Index
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl lg:text-8xl font-display font-light tracking-tighter leading-[0.9]"
                            >
                                Emotional <br />
                                <span className="text-white/20 italic">Architectures</span>
                            </motion.h1>
                        </div>

                        <div className="lg:max-w-md w-full space-y-6">
                            <p className="text-white/40 font-light leading-relaxed text-sm">
                                Synchronize your perception with the Amora Cinematic Multiverse. Navigate through categorized emotional resonance to find matching visual artifacts.
                            </p>
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search frequency..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 text-xs font-bold tracking-widest outline-none focus:border-[#e9c49a]/30 transition-all placeholder:text-white/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mood Taxonomy Grid */}
                <div className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black">Taxonomy of Human Experience</span>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {MOOD_CATEGORIES.map((category, idx) => (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="space-y-6 p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] transition-all duration-700"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#e9c49a]">
                                        {category.name}
                                    </h3>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/20">
                                        {category.moods.length}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {category.moods
                                        .filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(mood => (
                                            <button
                                                key={mood}
                                                onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border",
                                                    selectedMood === mood
                                                        ? "bg-[#e9c49a] text-black border-[#e9c49a] shadow-[0_10px_20px_rgba(233,196,154,0.2)]"
                                                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                                                )}
                                            >
                                                {mood}
                                            </button>
                                        ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Content Stream Phase */}
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-display font-light text-white">
                                {selectedMood ? (
                                    <>Artifacts for <span className="text-[#e9c49a] italic">{selectedMood}</span></>
                                ) : searchQuery ? (
                                    <>Results for <span className="text-white/40 italic">{searchQuery}</span></>
                                ) : (
                                    <>Universal <span className="text-white/40 italic">Resonance</span></>
                                )}
                            </h2>
                            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">
                                {content.filter(item =>
                                    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    item.moods?.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase()))
                                ).length} High-Fidelity Artifacts Synchronized
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-[9/16] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                                ))}
                            </motion.div>
                        ) : content.filter(item =>
                            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.moods?.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {content
                                    .filter(item =>
                                        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        item.moods?.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase()))
                                    )
                                    .map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => navigate(`/moods-watch/${item.id}`)}
                                            className="group relative aspect-[9/16] cursor-pointer rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0A0A0A] hover:border-[#e9c49a]/30 transition-all duration-700"
                                        >
                                            <img
                                                src={item.thumbnailUrl}
                                                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
                                                alt={item.title}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                                                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-[#e9c49a]">
                                                    {item.category?.split(' ')[0]}
                                                </div>
                                                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-white/40" />
                                                    <span className="text-[9px] font-bold">105m</span>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-10 left-8 right-8 space-y-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.moods?.slice(0, 3).map((m: any) => (
                                                        <span key={m} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/30">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-display font-light text-white leading-tight group-hover:text-[#e9c49a] transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.3em]">
                                                        {item.language} Transmission
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white fill-current" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-40 flex flex-col items-center justify-center space-y-6 text-center"
                            >
                                <Activity className="w-12 h-12 text-white/5 animate-pulse" />
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">No Frequency Matches Detected</p>
                                    <p className="text-sm text-white/40 font-light">The neural network could not find artifacts matching your current criteria.</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedMood(null); setSearchQuery(""); }}
                                    className="px-6 py-2 rounded-full border border-white/10 text-[10px] uppercase font-bold tracking-widest hover:bg-white/5"
                                >
                                    Reset Resonance
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}

