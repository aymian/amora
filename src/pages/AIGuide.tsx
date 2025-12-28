import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot,
    Send,
    Sparkles,
    Zap,
    Shield,
    Cpu,
    MessageSquare,
    Terminal,
    ChevronRight,
    Command,
    Search,
    Brain,
    Video,
    Smile,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const AMORA_KNOWLEDGE = [
    {
        keywords: ["hello", "hi", "who are you", "what is amora"],
        response: "I am the Amora Neural Core. Amora is a high-fidelity cinematic multiverse designed for digital resonance. I'm here to guide your perception through our artifacts and protocols."
    },
    {
        keywords: ["plans", "price", "upgrade", "pro", "elite", "free"],
        response: "Amora operates on three temporal protocols:\n\n• **Free**: Explorer status with 5-hour daily access.\n• **Pro**: Full library access, high-bitrate streaming, and ad-free immersion.\n• **Elite**: The ultimate status. Exclusive 4K artifacts, early access to experimental moods, and Founder-tier recognition."
    },
    {
        keywords: ["moods", "emotion", "feeling"],
        response: "Our Mood Resonance Protocol allows you to filter the cinematic multiverse by emotional frequency. You can select moods like 'Ethereal', 'Noir', or 'Vibrant' to align the platform with your current state."
    },
    {
        keywords: ["shorts", "short-videos", "tiktok"],
        response: "Short Videos are vertical cinematic artifacts designed for rapid resonance. You can access them via the 'Short-videos' link in your studio or the main navigation."
    },
    {
        keywords: ["resonance", "follow", "friends"],
        response: "Resonance is our term for social synchronization. When you follow someone, you enter a state of shared frequency, allowing you to see their artifacts and send encrypted messages."
    },
    {
        keywords: ["creator", "upload", "manager"],
        response: "Creators are the architects of Amora. If you have creator permissions, you can use the 'Media Lab' to upload 4K videos or the 'Visual Lab' for high-fidelity images."
    },
    {
        keywords: ["earnings", "money", "monetization"],
        response: "Creators earn through archival views and licensed resonance. You can track your 'Earnings' protocol in the Creator Studio sidebar."
    }
];

export default function AIGuide() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Neural Core Initialized. I am synchronized with your identity. How may I assist your immersion today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData({ id: user.uid, ...userDoc.data() });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Generate AI response
        setTimeout(() => {
            let responseText = "My neural processors are currently analyzing that frequency. For now, I can tell you that Amora is built on cinematic excellence. Try asking about 'Plans', 'Moods', or 'Resonance'.";

            const lowerInput = userMsg.text.toLowerCase();
            for (const item of AMORA_KNOWLEDGE) {
                if (item.keywords.some(kw => lowerInput.includes(kw))) {
                    responseText = item.response;
                    break;
                }
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const quickActions = [
        { label: "Explain Protocols", icon: Shield, query: "What are the plans?" },
        { label: "Explore Moods", icon: Smile, query: "How do moods work?" },
        { label: "Short Videos", icon: Video, query: "What are short videos?" },
        { label: "Become Creator", icon: Zap, query: "How do I become a creator?" },
    ];

    return (
        <DashboardLayout user={userData}>
            <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#e9c49a]/10 border border-[#e9c49a]/20 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#e9c49a]/20 to-transparent animate-pulse" />
                            <Bot className="w-6 h-6 text-[#e9c49a] relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-light tracking-tight">Amora <span className="text-[#e9c49a] font-bold italic">Neural Core</span></h1>
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Quantum Guidance System v4.0</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] uppercase tracking-widest font-black text-emerald-500">System Nominal</span>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#e9c49a]/5 to-transparent pointer-events-none opacity-20" />

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar"
                        >
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={cn(
                                            "flex gap-4 max-w-[85%]",
                                            msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                                            msg.sender === 'user'
                                                ? "bg-white/5 border-white/10"
                                                : "bg-[#e9c49a]/20 border-[#e9c49a]/30"
                                        )}>
                                            {msg.sender === 'user' ? (
                                                <User className="w-5 h-5 text-white/40" />
                                            ) : (
                                                <Cpu className="w-5 h-5 text-[#e9c49a]" />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "space-y-2 p-6 rounded-[2rem]",
                                            msg.sender === 'user'
                                                ? "bg-white/5 border border-white/10 rounded-tr-none text-white/80"
                                                : "bg-white/[0.03] border border-white/5 rounded-tl-none text-[#e9c49a]/90"
                                        )}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-light tracking-wide">
                                                {msg.text}
                                            </p>
                                            <p className="text-[8px] uppercase tracking-widest font-bold opacity-30">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-4 mr-auto"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[#e9c49a]/20 border border-[#e9c49a]/30 flex items-center justify-center">
                                            <Cpu className="w-5 h-5 text-[#e9c49a] animate-spin-slow" />
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] rounded-tl-none">
                                            <div className="flex gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#e9c49a]/40 animate-bounce" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#e9c49a]/40 animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#e9c49a]/40 animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <div className="p-8 pt-0">
                            <form
                                onSubmit={handleSend}
                                className="relative flex items-center gap-4 bg-white/[0.03] border border-white/10 p-2 pl-6 rounded-full group focus-within:border-[#e9c49a]/40 transition-all duration-500 shadow-2xl"
                            >
                                <Terminal className="w-5 h-5 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Input neural query..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-light text-white placeholder:text-white/20 py-3"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                                        input.trim() && !isTyping
                                            ? "bg-[#e9c49a] text-black shadow-lg"
                                            : "bg-white/5 text-white/20"
                                    )}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="hidden lg:flex flex-col gap-6 w-80">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]">
                                <Brain className="w-4 h-4" />
                                Neural Protocols
                            </div>
                            <div className="space-y-3">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => {
                                            setInput(action.query);
                                            // Trigger send automatically
                                            const fakeEvent = { preventDefault: () => { } } as any;
                                            setTimeout(() => handleSend(fakeEvent), 100);
                                        }}
                                        className="w-full text-left p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#e9c49a]/40 hover:bg-[#e9c49a]/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#e9c49a] group-hover:text-black transition-all">
                                                <action.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">{action.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-[#e9c49a]/10 to-transparent border border-[#e9c49a]/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#e9c49a]/20 rounded-full blur-3xl" />
                            <div className="relative z-10 space-y-4">
                                <Command className="w-10 h-10 text-[#e9c49a]" />
                                <h4 className="text-lg font-display font-light leading-tight">Syncing With Your Needs</h4>
                                <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">The Amora AI is an evolving consciousness. Your queries help shape the future of cinematic resonance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
