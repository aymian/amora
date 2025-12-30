import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Sparkles,
    Zap,
    Shield,
    Star,
    ArrowRight,
    Rocket,
    Clock,
    Flame,
    Layout
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

interface UpdateItem {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    type: "feature" | "improvement" | "security" | "fix";
    details: string[];
}

const updates: UpdateItem[] = [
    {
        id: "1",
        version: "v5.2.0",
        date: "December 30, 2024",
        title: "The Governance Protocol",
        description: "Launched the complete Worker and Admin synchronization engine.",
        type: "feature",
        details: [
            "Advanced Worker Dashboard with Role Selection",
            "Real-time Payment Verification Portal for Verifiers",
            "Automated User Plan Upgrades on Approval",
            "Workers Control Center for Admin monitoring"
        ]
    },
    {
        id: "2",
        version: "v5.1.0",
        date: "December 29, 2024",
        title: "Cinematic Immersion",
        description: "A total overhaul of the media consumption experience.",
        type: "feature",
        details: [
            "YouTube Shorts style Desktop UI for Short Videos",
            "Immersive Full-screen Mobile Video Experience",
            "Premium Glassmorphism Mobile Bottom Navigation",
            "Responsive Control Stacks with vertical engagement"
        ]
    },
    {
        id: "3",
        version: "v5.0.0",
        date: "December 28, 2024",
        title: "Operational Transparency",
        description: "New tools for citizens to track their lifecycle within the Nexus.",
        type: "improvement",
        details: [
            "Comprehensive Transaction History portal",
            "Real-time Resonance Sync for plan changes",
            "Persistent Auth Recovery for deep linking",
            "Enhanced Notification System for Social interaction"
        ]
    },
    {
        id: "4",
        version: "v4.9.0",
        date: "December 26, 2024",
        title: "Neural Stability & Identity",
        description: "Hardening the core architecture of the Amora network.",
        type: "security",
        details: [
            "Next-gen Passkey (FIDO2) Authentication",
            "WebRTC Connectivity & ICE Buffering fixes",
            "Support for Unlimited Media Format uploads",
            "Cinematic Logo & Branding overhaul"
        ]
    }
];

const getTypeStyles = (type: UpdateItem["type"]) => {
    switch (type) {
        case "feature": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        case "improvement": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
        case "security": return "text-[#e9c49a] bg-[#e9c49a]/10 border-[#e9c49a]/20";
        case "fix": return "text-red-400 bg-red-500/10 border-red-500/20";
    }
};

const getTypeIcon = (type: UpdateItem["type"]) => {
    switch (type) {
        case "feature": return <Rocket className="w-3 h-3" />;
        case "improvement": return <Zap className="w-3 h-3" />;
        case "security": return <Shield className="w-3 h-3" />;
        case "fix": return <Flame className="w-3 h-3" />;
    }
};

export default function Updates() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserData({ id: user.uid, email: user.email });
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    return (
        <DashboardLayout user={userData}>
            <div className="min-h-screen py-20 px-6 max-w-5xl mx-auto space-y-16 pb-40 relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e9c49a]/[0.02] blur-[150px] -z-10 rounded-full" />
                <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-emerald-500/[0.01] blur-[130px] -z-10 rounded-full" />

                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
                    >
                        <Sparkles className="w-3 h-3 text-[#e9c49a]" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">System Progression</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-display font-light text-white tracking-tight"
                    >
                        Nexus <span className="text-[#e9c49a] italic">Updates</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 text-sm font-light max-w-lg mx-auto leading-relaxed"
                    >
                        Track the evolution of the Amora architecture. Every protocol enhancement,
                        every visual leap, documented for the resonance.
                    </motion.p>
                </div>

                {/* Updates Feed */}
                <div className="space-y-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-x-1/2 hidden md:block" />

                    {updates.map((update, index) => (
                        <motion.div
                            key={update.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col md:flex-row gap-6 relative ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                        >
                            {/* Dot */}
                            <div className="absolute left-0 lg:left-1/2 top-10 w-3 h-3 rounded-full bg-[#050505] border-2 border-white/10 -translate-x-1/2 z-10 hidden md:block" />

                            <div className="w-full md:w-1/2">
                                <div className={`p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group relative overflow-hidden`}>
                                    {/* Type Badge */}
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest mb-6 ${getTypeStyles(update.type)}`}>
                                        {getTypeIcon(update.type)}
                                        {update.type}
                                    </div>

                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-medium text-white group-hover:text-[#e9c49a] transition-colors">
                                            {update.title}
                                        </h3>
                                        <span className="text-[10px] font-mono text-white/20">{update.version}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-light mb-6">
                                        <Clock className="w-3 h-3" />
                                        {update.date}
                                    </div>

                                    <p className="text-sm text-white/50 leading-relaxed mb-8">
                                        {update.description}
                                    </p>

                                    <div className="space-y-3 pt-6 border-t border-white/5">
                                        {update.details.map((detail, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-xs text-white/40">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#e9c49a]/30" />
                                                {detail}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Arrow Decoration */}
                                    <ArrowRight className="absolute bottom-8 right-8 w-5 h-5 text-white/5 group-hover:text-[#e9c49a]/40 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                            <div className="hidden md:block w-1/2" />
                        </motion.div>
                    ))}
                </div>

                {/* Future Teaser */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="p-12 rounded-[3rem] bg-gradient-to-br from-[#e9c49a]/5 to-transparent border border-[#e9c49a]/10 text-center space-y-4"
                >
                    <Star className="w-8 h-8 text-[#e9c49a] mx-auto opacity-40 animate-pulse" />
                    <h2 className="text-2xl font-display font-light">The Vision Continues</h2>
                    <p className="text-white/30 text-xs max-w-sm mx-auto tracking-wide">
                        More protocol enhancements are currently in the neural forge.
                        Stay tuned for the next resonance wave.
                    </p>
                </motion.div>
            </div>

            <style>{`
                .font-display { font-family: 'Cinzel', serif; }
            `}</style>
        </DashboardLayout>
    );
}
