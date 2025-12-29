import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
    Waves
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

export default function EmotionAI() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserData({ id: user.uid, plan: "pro" }); // Fallback or fetch actual
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const runAnalysis = async () => {
        if (!input.trim()) return;

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
        }, 50);

        // Simulated AI Logic: Map keywords to moods
        const moodKeywords: { [key: string]: string } = {
            "sad": "Sad",
            "happy": "Happy",
            "joy": "Happy",
            "lonely": "Lonely",
            "chill": "Calm",
            "relax": "Calm",
            "stress": "Anxious",
            "angry": "Angry",
            "love": "Romantic",
            "dark": "Dark",
            "energetic": "Hype",
            "motivated": "Inspired"
        };

        const foundMoods = Object.keys(moodKeywords).filter(k => input.toLowerCase().includes(k));
        const detectedMood = foundMoods.length > 0 ? moodKeywords[foundMoods[0]] : "Peaceful";

        setTimeout(async () => {
            setIsAnalyzing(false);
            setAnalysisResult({
                primaryEmotion: detectedMood,
                resonanceLevel: "98.4%",
                neuralPattern: "Stable Alpha-Wave",
                recommendationNote: `Our neural core has detected a significant ${detectedMood} frequency. We suggest synchronizing with the following artifacts to balance your current state.`
            });

            // Fetch real recommendations based on detected mood
            try {
                const q = query(
                    collection(db, "mood_content"),
                    where("moods", "array-contains", detectedMood),
                    limit(3)
                );
                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setRecommendations(items);
            } catch (err) {
                console.error("Failed to fetch recommendations", err);
            }
        }, 3000);
    };

    return (
        <DashboardLayout user={userData}>
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                {/* Hero Header */}
                <div className="text-center space-y-4 pt-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-[0.3em]"
                    >
                        <Brain className="w-4 h-4" />
                        Neural Emotion Interface v2.0
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-display font-light tracking-tight text-white">
                        Synchronize Your <span className="text-blue-500 italic">Core</span>
                    </h1>
                    <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
                        Access our advanced emotion synthesis AI. Describe your current state, and let the neural network curate a cinematic resonance tailored to your frequency.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Input Phase */}
                    <div className="space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 space-y-8 relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

                            <div className="space-y-4 relative">
                                <label className="text-[10px] uppercase font-black text-white/30 tracking-[0.4em] ml-2">Neural Input Channel</label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="How are you feeling right now? Describe your internal landscape..."
                                    className="w-full h-48 bg-black/40 border border-white/5 rounded-[32px] p-8 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/30 transition-all resize-none font-light leading-relaxed"
                                />
                            </div>

                            <button
                                onClick={runAnalysis}
                                disabled={isAnalyzing || !input.trim()}
                                className={cn(
                                    "w-full h-16 rounded-full flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-500",
                                    isAnalyzing ? "bg-white/5 text-white/20 cursor-wait" :
                                        input.trim() ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]" :
                                            "bg-white/5 text-white/20 cursor-not-allowed"
                                )}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Analyzing Biometrics...
                                    </>
                                ) : (
                                    <>
                                        <Scan className="w-4 h-4" />
                                        Initiate Neural Scan
                                    </>
                                )}
                            </button>

                            {isAnalyzing && (
                                <div className="space-y-3">
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30">
                                        <span>Decoding Synaptic Patterns</span>
                                        <span>{progress}%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Telemetry Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Activity, label: "Pulse Rate", value: isAnalyzing ? "Variable" : "Resting" },
                                { icon: Waves, label: "Resonance", value: isAnalyzing ? "Scanning" : "Wait" },
                                { icon: Cpu, label: "Core Temp", value: "32.4°C" },
                                { icon: ShieldCheck, label: "Encryption", value: "Active" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
                                    <stat.icon className="w-4 h-4 text-white/20" />
                                    <div>
                                        <p className="text-[8px] uppercase font-black tracking-widest text-white/20">{stat.label}</p>
                                        <p className="text-sm font-light text-white/60">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Result Phase */}
                    <AnimatePresence mode="wait">
                        {analysisResult ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-[40px] p-10 md:p-12 space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[18px] bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                                                <Zap className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-display font-light text-white">Analysis Complete</h2>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-blue-400">Stable Resonance Locked</p>
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.3em]">Detected Frequency</p>
                                                <span className="text-3xl font-display font-light text-[#e9c49a] italic">{analysisResult.primaryEmotion}</span>
                                            </div>
                                            <div className="h-px w-full bg-white/5" />
                                            <p className="text-sm text-white/50 font-light leading-relaxed italic">
                                                {analysisResult.recommendationNote}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] uppercase font-black text-white/30 tracking-[0.4em] ml-2">Neural Recommendations</h4>
                                        <div className="space-y-4">
                                            {recommendations.length > 0 ? (
                                                recommendations.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => navigate(`/moods-watch/${item.id}`)}
                                                        className="group bg-white/[0.01] border border-white/5 rounded-[28px] p-4 flex items-center gap-6 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer"
                                                    >
                                                        <div className="w-24 aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/5">
                                                            <img src={item.thumbnailUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[7px] font-black uppercase tracking-widest border border-blue-500/20">Artifact</span>
                                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">A-{(Math.random() * 99).toFixed(0)}</span>
                                                            </div>
                                                            <h5 className="font-medium text-white group-hover:text-blue-400 transition-colors">{item.title}</h5>
                                                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{item.category}</p>
                                                        </div>
                                                        <Play className="w-5 h-5 text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all mr-2" />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 rounded-[28px] border border-dashed border-white/10 flex items-center justify-center text-center">
                                                    <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Searching Deep Archive...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setAnalysisResult(null)}
                                        className="w-full py-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
                                    >
                                        Recalibrate Neural Core
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="hidden lg:flex flex-col items-center justify-center py-20 text-center space-y-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
                                    <Brain className="w-32 h-32 text-white/5 relative z-10" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase font-black text-white/20 tracking-[0.5em]">System Status: Idle</h3>
                                    <p className="text-sm text-white/20 font-light max-w-xs mx-auto">Input your emotional parameters to initiate the synchronization sequence.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
