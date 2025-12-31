import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Brain,
    Activity,
    Cpu,
    Scan,
    Sparkles,
    Play,
    RefreshCw,
    MessageSquare,
    Zap,
    ShieldCheck,
    Waves,
    Loader2
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

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
        name: "Visual & Aesthetic Feelings",
        moods: ["Cinematic", "Slow Motion", "Moody Lighting", "Soft Lights", "Dark Tones", "Warm Colors", "Cold Colors", "Minimal", "Dreamy", "Vintage", "Modern", "Artistic", "Clean Visual"]
    }
];

export default function EmotionAI() {
    const { user: userData } = useOutletContext<{ user: any }>();
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const navigate = useNavigate();

    // AI Logic initialized from context
    useEffect(() => {
        if (!userData && !auth.currentUser) {
            // Wait for potential auth recovery or redirect
        }
    }, [userData]);

    const runAnalysis = async (autoMood?: string) => {
        const targetInput = autoMood || input;
        if (!targetInput.trim()) return;

        setIsAnalyzing(true);
        setProgress(0);
        setAnalysisResult(null);

        // Simulation of neural processing
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        // Simulated AI Logic: Map keywords to moods
        const moodKeywords: { [key: string]: string } = {
            "sad": "Sad",
            "happy": "Happy",
            "joy": "Happy",
            "lonely": "Lonely",
            "chill": "Chill",
            "relax": "Relaxing",
            "stress": "Anxious",
            "angry": "Angry",
            "love": "True Love",
            "romantic": "Romantic",
            "dark": "Dark",
            "energetic": "High Energy",
            "motivated": "Motivated"
        };

        const foundMoods = Object.keys(moodKeywords).filter(k => targetInput.toLowerCase().includes(k));
        const detectedMood = autoMood || (foundMoods.length > 0 ? moodKeywords[foundMoods[0]] : "Peaceful");

        setTimeout(async () => {
            setIsAnalyzing(false);
            setAnalysisResult({
                primaryEmotion: detectedMood,
                resonanceLevel: "98.4%",
                neuralPattern: "Stable Alpha-Wave",
                recommendationNote: `Our neural core has synchronized with the ${detectedMood} frequency. We've matched your current state with high-fidelity cinematic artifacts.`
            });

            try {
                let q = query(
                    collection(db, "mood_content"),
                    where("moods", "array-contains", detectedMood),
                    limit(4)
                );
                let snapshot = await getDocs(q);
                let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                // Fallback: If no results found for specific mood, fetch available artifacts
                if (items.length === 0) {
                    const fallbackQ = query(
                        collection(db, "mood_content"),
                        limit(4)
                    );
                    const fallbackSnapshot = await getDocs(fallbackQ);
                    items = fallbackSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                    setAnalysisResult((prev: any) => ({
                        ...prev,
                        recommendationNote: `Note: While seeking ${detectedMood}, we found these high-resonance artifacts that synchronize with your current neural profile.`
                    }));
                }

                setRecommendations(items);
            } catch (err) {
                console.error("Failed to fetch recommendations", err);
            }
        }, 2000);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-20 pb-40">
            {/* Hero Header */}
            <div className="text-center space-y-6 pt-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-[0.4em] relative z-10"
                >
                    <Brain className="w-4 h-4" />
                    Neural Emotion Interface v2.5
                </motion.div>
                <h1 className="text-6xl md:text-8xl font-display font-light tracking-tighter text-white leading-tight">
                    Map Your <span className="text-blue-500 italic">Emotional</span> <br />Landscape
                </h1>
                <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-lg font-light leading-relaxed">
                    Access our advanced emotion synthesis AI. Transmit your current state via text or frequency selection to initiate visual resonance.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Input Phase */}
                <div className="space-y-10">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-14 space-y-10 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000" />

                        <div className="space-y-6 relative">
                            <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.5em] ml-2">Neural Input Channel</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe your current internal landscape..."
                                className="w-full h-56 bg-black/40 border border-white/5 rounded-[2.5rem] p-10 text-lg text-white placeholder:text-white/5 focus:outline-none focus:border-blue-500/30 transition-all resize-none font-light leading-relaxed scrollbar-hide"
                            />
                        </div>

                        <button
                            onClick={() => runAnalysis()}
                            disabled={isAnalyzing || !input.trim()}
                            className={cn(
                                "w-full h-20 rounded-full flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] transition-all duration-700",
                                isAnalyzing ? "bg-white/5 text-white/20 cursor-wait" :
                                    input.trim() ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:-translate-y-1" :
                                        "bg-white/5 text-white/20 cursor-not-allowed"
                            )}
                        >
                            {isAnalyzing ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Decoding Synaptic Patterns...
                                </>
                            ) : (
                                <>
                                    <Scan className="w-5 h-5" />
                                    Initiate Neural Scan
                                </>
                            )}
                        </button>

                        {isAnalyzing && (
                            <div className="space-y-4 pt-4">
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                                    <span>Analyzing Emotional Depth</span>
                                    <span>{progress}%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Frequency Grid (The requested feature) */}
                    <div className="space-y-12 pt-10">
                        <div className="flex items-center gap-6">
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Frequency Taxonomy</span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {MOOD_CATEGORIES.slice(0, 4).map((cat, idx) => (
                                <motion.div
                                    key={cat.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/[0.01] border border-white/5 p-6 rounded-[2rem] space-y-4 hover:bg-white/[0.02] transition-colors group"
                                >
                                    <p className="text-[9px] uppercase tracking-widest text-blue-500/50 font-black">{cat.name}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.moods.slice(0, 8).map(mood => (
                                            <button
                                                key={mood}
                                                onClick={() => {
                                                    setSelectedMood(mood);
                                                    runAnalysis(mood);
                                                }}
                                                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[8px] font-bold uppercase tracking-widest text-white/30 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
                                            >
                                                {mood}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Result Phase */}
                <div className="lg:sticky lg:top-32">
                    <AnimatePresence mode="wait">
                        {analysisResult ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-[3.5rem] p-10 md:p-14 space-y-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                                    <div className="space-y-8 relative">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center shadow-[0_15px_40px_rgba(37,99,235,0.4)]">
                                                <Zap className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-display font-light text-white">Neural Match Found</h2>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-blue-400 mt-1">Synchronization Successful</p>
                                            </div>
                                        </div>

                                        <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6 group hover:border-blue-500/20 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.4em]">Primary Resonance</p>
                                                <div className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest leading-none">
                                                    98.4% Match
                                                </div>
                                            </div>
                                            <h3 className="text-4xl md:text-6xl font-display font-light text-[#e9c49a] italic leading-none group-hover:translate-x-2 transition-transform duration-700">
                                                {analysisResult.primaryEmotion}
                                            </h3>
                                            <div className="h-px w-full bg-white/5" />
                                            <p className="text-sm md:text-base text-white/40 font-light leading-relaxed">
                                                {analysisResult.recommendationNote}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-[10px] uppercase font-black text-white/30 tracking-[0.5em]">Curated Artifacts</h4>
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-blue-500" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {recommendations.length > 0 ? (
                                                recommendations.map((item, i) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        onClick={() => navigate(`/moods-watch/${item.id}`)}
                                                        className="group bg-white/[0.02] border border-white/5 rounded-[2rem] p-5 flex items-center gap-6 hover:bg-blue-600/10 hover:border-blue-600/30 transition-all cursor-pointer overflow-hidden relative"
                                                    >
                                                        <div className="w-24 aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/5 shrink-0">
                                                            <img src={item.thumbnailUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="" />
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{item.category?.split(' ')[0]} Artifact</span>
                                                            </div>
                                                            <h5 className="text-lg font-display font-light text-white group-hover:text-blue-400 transition-colors leading-tight">{item.title}</h5>
                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                {item.moods?.slice(0, 2).map((m: string) => (
                                                                    <span key={m} className="px-2 py-0.5 rounded-full bg-white/5 text-[7px] text-white/40 uppercase font-bold tracking-widest">{m}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
                                                            <Play className="w-5 h-5 text-blue-400 fill-current" />
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="py-20 rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center gap-4">
                                                    <Loader2 className="w-8 h-8 text-white/5 animate-spin" />
                                                    <p className="text-[10px] uppercase font-black text-white/10 tracking-[0.4em]">Synchronizing Archive...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setAnalysisResult(null)}
                                        className="w-full h-16 rounded-3xl border border-white/5 bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Reset Neural Matrix
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="hidden lg:flex flex-col items-center justify-center min-h-[600px] text-center space-y-10 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full animate-pulse group-hover:bg-blue-600/30 transition-all duration-1000" />
                                    <div className="relative z-10 p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 group-hover:border-blue-500/20 transition-all duration-1000">
                                        <Brain className="w-32 h-32 text-white/[0.03] group-hover:text-white/10 transition-colors duration-1000" />
                                    </div>
                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="absolute -inset-4 border border-dashed border-white/5 rounded-[5rem] pointer-events-none"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[11px] uppercase font-black text-white/10 tracking-[0.6em]">Core Status: Receptive</h3>
                                    <p className="text-base text-white/20 font-light max-w-xs mx-auto leading-relaxed">
                                        Transmit your emotional frequency to initiate the visualization sequence.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-1 h-1 rounded-full bg-blue-500/20" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Final Taxonomic Grid (The detailed bottom section as in /moods) */}
            <div className="space-y-16 pt-20 border-t border-white/5">
                <div className="space-y-6 text-center">
                    <h2 className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">Taxonomy of Human Frequency</h2>
                    <p className="text-white/40 text-sm font-light uppercase tracking-widest">Select a direct frequency to bypass neural interpretation</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {MOOD_CATEGORIES.map((category, idx) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="space-y-8 p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] transition-all duration-700 group"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-500 group-hover:text-white transition-colors">
                                    {category.name}
                                </h3>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/20">
                                    {category.moods.length}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {category.moods.map(mood => (
                                    <button
                                        key={mood}
                                        onClick={() => {
                                            setSelectedMood(mood);
                                            runAnalysis(mood);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border border-white/5 bg-white/[0.03] text-white/30 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95"
                                    >
                                        {mood}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            <style>{styles}</style>
        </div>
    );
}

// Global styles for scrollbar and range input
const styles = `
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

