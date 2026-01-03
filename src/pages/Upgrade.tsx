import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Check,
    Sparkles,
    Zap,
    Crown,
    Rocket,
    Shield,
    Lock,
    ArrowRight,
    Play,
    Activity,
    Globe,
    Cpu
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Free",
        protocol: "Discovery",
        price: "0 Frw",
        description: "Discovery & habit building for new citizens entering the Amora atmosphere.",
        icon: Globe,
        badge: "Explorer",
        features: [
            { text: "4K Images (Limited Daily)", status: 'included' },
            { text: "4K Short Stories (Limited)", status: 'included' },
            { text: "Explore Feed Access", status: 'included' },
            { text: "Like & Save (Limited)", status: 'included' },
            { text: "Messaging Interface", status: 'locked' },
            { text: "Emotion AI Feed", status: 'locked' },
            { text: "Exclusive Stories", status: 'locked' }
        ],
        buttonText: "Stay Discovery",
        color: "white",
        tier: "free",
        strategy: "Discovery Protocol"
    },
    {
        name: "Pro",
        protocol: "Resonance",
        price: "17,000 Frw",
        description: "Social connection & high-fidelity immersion for serious viewers.",
        icon: Zap,
        badge: "✔️ Pro Verified",
        features: [
            { text: "Unlimited 4K Images", status: 'included' },
            { text: "Unlimited 4K Short Stories", status: 'included' },
            { text: "Unlimited 4K Videos", status: 'included' },
            { text: "Direct Messaging Enabled", status: 'included' },
            { text: "Pro Verified Status", status: 'included' },
            { text: "Favorites & Full History", status: 'included' },
            { text: "Emotion AI", status: 'locked' }
        ],
        buttonText: "Ascend to Pro",
        color: "#e9c49a",
        tier: "pro",
        popular: true
    },
    {
        name: "Elite",
        protocol: "Sovereign",
        price: "34,000 Frw",
        description: "Emotional & exclusive experience with AI-enhanced mood synchronization.",
        icon: Crown,
        badge: "👑 Elite Sovereign",
        features: [
            { text: "Exclusive Elite Stories", status: 'included' },
            { text: "Emotion-Based Feed", status: 'included' },
            { text: "AI Comfort & Mood Responses", status: 'included' },
            { text: "Personal Mood Timeline", status: 'included' },
            { text: "Early Access to Content", status: 'included' },
            { text: "Priority Direct Messaging", status: 'included' },
            { text: "Elite Badge & UI Status", status: 'included' }
        ],
        buttonText: "Claim Sovereignty",
        color: "#d4af37",
        tier: "elite"
    },
    {
        name: "Creator",
        protocol: "Architect",
        price: "65,000 Frw",
        description: "Architectural tools for influencers and content directors.",
        icon: Cpu,
        badge: "⭐ Master Creator",
        features: [
            { text: "Upload 4K Images/Videos", status: 'included' },
            { text: "Upload Short Stories (≤15m)", status: 'included' },
            { text: "Creator Suite Dashboard", status: 'included' },
            { text: "Profile & Content Boost", status: 'included' },
            { text: "Full Analytics & Insights", status: 'included' },
            { text: "Featured Eligibility", status: 'included' },
            { text: "Verified Creator Status", status: 'included' }
        ],
        buttonText: "Begin Architecture",
        color: "#c0c0c0",
        tier: "creator"
    }
];

export default function Upgrade() {
    const navigate = useNavigate();
    const { user: userData, loading: authLoading } = useOutletContext<{ user: any, loading: boolean }>();
    const [localUserData, setLocalUserData] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (userData) setLocalUserData(userData);
    }, [userData]);

    const planHierarchy: Record<string, number> = {
        'free': 0,
        'pro': 1,
        'elite': 2,
        'creator': 3
    };

    const handlePlanAction = async (targetTier: string) => {
        if (!userData || !auth.currentUser) return;
        if (userData.plan === targetTier) return;

        const currentRank = planHierarchy[userData.plan || 'free'];
        const targetRank = planHierarchy[targetTier];

        if (targetRank > currentRank) {
            // Upgrade flow
            navigate(`/payment?tier=${targetTier}`);
        } else {
            // Downgrade flow (Instant and Free)
            setProcessing(true);
            try {
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    plan: targetTier
                });

                setUserData({ ...userData, plan: targetTier });

                toast.success("Protocol Adjusted", {
                    description: `You have successfully shifted to the ${targetTier.toUpperCase()} frequency.`
                });
            } catch (error) {
                console.error("Downgrade failed:", error);
                toast.error("Frequency Shift Blocked", {
                    description: "Our core systems could not process the protocol change. Please retry."
                });
            } finally {
                setProcessing(false);
            }
        }
    };

    if (authLoading || !userData) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold animate-pulse">Synchronizing Resonance...</p>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen relative overflow-hidden px-6 lg:px-12 py-20 pb-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#e9c49a]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto space-y-24">
                    <header className="text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e9c49a]/20 bg-[#e9c49a]/5 text-[#e9c49a] text-[10px] uppercase tracking-[0.4em] font-bold"
                        >
                            <Sparkles className="w-3.5 h-3.5" /> Synchronize Your Status
                        </motion.div>
                        <h1 className="text-4xl md:text-7xl font-display font-light text-white tracking-tight leading-tight">
                            Elevate Your <span className="text-[#e9c49a] italic">Resonance</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-white/40 text-lg font-light leading-relaxed">
                            Choose the protocol that matches your level of immersion. Ascend to elite status and unlock the full potential of the Amora deep space.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className={cn(
                                    "relative p-8 rounded-[3rem] border flex flex-col justify-between group transition-all duration-700 h-full overflow-hidden",
                                    plan.popular ? "bg-gradient-to-b from-[#e9c49a]/10 to-transparent border-[#e9c49a]/30 shadow-[0_20px_50px_rgba(233,196,154,0.1)]" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                )}
                            >
                                {plan.tier === 'elite' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#d4af3715,transparent)] pointer-events-none" />}
                                {plan.tier === 'creator' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />}

                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                                            plan.popular ? "bg-[#e9c49a] text-black scale-110 shadow-[0_0_20px_#e9c49a40]" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
                                        )}>
                                            <plan.icon className="w-7 h-7" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/20">{plan.protocol}</p>
                                            <h3 className="text-2xl font-display font-light text-white">{plan.name}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-display font-light text-white">{plan.price}</span>
                                            <span className="text-white/20 text-[10px] uppercase tracking-widest font-bold">/ moon</span>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 inline-block">
                                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#e9c49a]">{plan.badge}</span>
                                        </div>
                                        <p className="text-[11px] text-white/40 leading-relaxed font-light italic">{plan.description}</p>
                                    </div>

                                    <div className="space-y-4">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className={cn(
                                                "flex items-center justify-between p-3 rounded-2xl border transition-all",
                                                feature.status === 'included' ? "bg-white/[0.03] border-white/5" : "bg-red-500/[0.02] border-red-500/10 opacity-40 grayscale"
                                            )}>
                                                <div className="flex items-center gap-3">
                                                    {feature.status === 'included' ? <Check className="w-3 h-3 text-[#e9c49a]" /> : <Shield className="w-3 h-3 text-red-500/40" />}
                                                    <span className="text-[10px] text-white/60 font-light tracking-wide">{feature.text}</span>
                                                </div>
                                                {feature.status === 'locked' && <Lock className="w-3 h-3 text-white/10" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {(() => {
                                    const currentRank = planHierarchy[(userData?.plan || 'free').toLowerCase()] ?? 0;
                                    const targetRank = planHierarchy[plan.tier];
                                    const isCurrent = localUserData?.plan === plan.tier;
                                    const isUpgrade = targetRank > currentRank;

                                    const baseClasses = cn(
                                        "w-full mt-12 py-5 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 group",
                                        isCurrent
                                            ? "bg-white/5 text-white/20 cursor-default"
                                            : !isUpgrade
                                                ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white"
                                                : plan.tier === 'creator'
                                                    ? "bg-white text-black hover:bg-[#e9c49a]"
                                                    : plan.popular
                                                        ? "bg-[#e9c49a] text-black hover:bg-white"
                                                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                    );

                                    if (isUpgrade) {
                                        return (
                                            <a
                                                href={`/payment?tier=${plan.tier}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/payment?tier=${plan.tier}`);
                                                }}
                                                className={baseClasses}
                                            >
                                                {plan.buttonText}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        );
                                    }

                                    return (
                                        <button
                                            onClick={() => handlePlanAction(plan.tier)}
                                            disabled={processing || isCurrent}
                                            className={baseClasses}
                                        >
                                            {processing && <Activity className="w-4 h-4 animate-spin" />}
                                            {isCurrent
                                                ? "Current Level"
                                                : "Request Sync (Free)"
                                            }
                                            {!isCurrent && !processing && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                        </button>
                                    );
                                })()}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-display font-light text-white">Feature Index</h2>
                            <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">Deep Space Protocol Comparison</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="py-8 px-6 text-[10px] uppercase tracking-widest text-white/20 font-bold">Feature</th>
                                        <th className="py-8 px-6 text-[10px] uppercase tracking-widest text-white/20 font-bold text-center">Free</th>
                                        <th className="py-8 px-6 text-[10px] uppercase tracking-widest text-[#e9c49a] font-bold text-center">Pro</th>
                                        <th className="py-8 px-6 text-[10px] uppercase tracking-widest text-[#d4af37] font-bold text-center">Elite</th>
                                        <th className="py-8 px-6 text-[10px] uppercase tracking-widest text-[#c0c0c0] font-bold text-center">Creator</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white/60">
                                    {[
                                        { label: "4K High-Fidelity Images", vals: ["Limited", "Unlimited", "Unlimited", "Unlimited"] },
                                        { label: "Cinematic Short Stories", vals: ["Limited", "Unlimited", "Unlimited", "Unlimited"] },
                                        { label: "Premium 4K Videos", vals: ["Limited", "Unlimited", "Unlimited", "Unlimited"] },
                                        { label: "Messaging Interface", vals: ["❌", "✅", "✅", "✅"] },
                                        { label: "Emotion-Sync AI", vals: ["❌", "❌", "✅", "✅"] },
                                        { label: "Exclusive Sovereignty Content", vals: ["❌", "❌", "✅", "✅"] },
                                        { label: "Architectural Content Upload", vals: ["❌", "❌", "❌", "✅"] },
                                        { label: "Resonance Verification Badge", vals: ["❌", "✔️", "👑", "⭐"] },
                                        { label: "Architect Pulse Analytics", vals: ["❌", "❌", "❌", "✅"] },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                                            <td className="py-6 px-6 text-xs font-light tracking-wide group-hover:text-white transition-colors">{row.label}</td>
                                            {row.vals.map((val, idx) => (
                                                <td key={idx} className="py-6 px-6 text-[10px] text-center font-bold tracking-widest">
                                                    <span className={cn(val === "❌" ? "text-white/10" : idx === 1 ? "text-[#e9c49a]" : idx === 2 ? "text-[#d4af37]" : idx === 3 ? "text-white" : "text-white/60")}>{val}</span>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-20 border-t border-white/5">
                            <div className="space-y-4">
                                <h4 className="text-lg font-display font-light text-white">Directorial Guarantee</h4>
                                <p className="text-sm text-white/30 font-light leading-relaxed">Every protocol upgrade is finalized through our secure spectral verification system.</p>
                            </div>
                            <div className="space-y-4 px-12 border-x border-white/5">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#e9c49a]" />
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#e9c49a]">Platform Pulse</span>
                                </div>
                                <p className="text-3xl font-display font-light text-white">4.9/5 Resonance</p>
                            </div>
                            <div className="flex flex-col justify-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-white/5 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full object-cover grayscale opacity-60" alt="" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-black bg-black flex items-center justify-center text-[8px] font-bold text-[#e9c49a]">+12k</div>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Synchronized Citizens Worldwide</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
