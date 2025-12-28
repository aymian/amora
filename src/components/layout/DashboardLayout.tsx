import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutGrid,
    Compass,
    TrendingUp,
    Heart,
    Clock,
    Settings,
    LogOut,
    Menu,
    Command,
    Search,
    Bell,
    ChevronDown,
    BarChart3,
    Video,
    Users,
    Crown,
    Home,
    Image,
    Zap,
    Smile,
    Star,
    Brain,
    Activity,
    Download,
    Sparkles,
    MessageSquare,
    PieChart,
    Rocket,
    Film,
    Check,
    X,
    UserPlus,
    PlusSquare,
    Library,
    DollarSign,
    Lock,
    Flame,
    Globe,
    ArrowLeft,
    ShieldAlert,
    User,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp,
    getDoc,
    getDocs
} from "firebase/firestore";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface DashboardLayoutProps {
    children: React.ReactNode;
    user: any;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allArtifacts, setAllArtifacts] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", user.id),
            limit(20)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort to avoid index requirements temporarily
            fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setNotifications(fetched);
        });

        return () => unsub();
    }, [user?.id]);

    const handleApprove = async (notif: any) => {
        if (!user?.id) return;
        try {
            const followDocId = `${notif.senderId}_${user.id}`;
            await setDoc(doc(db, "follows", followDocId), {
                followerId: notif.senderId,
                followingId: user.id,
                createdAt: serverTimestamp()
            });

            await setDoc(doc(db, "notifications", notif.id), { status: "approved" }, { merge: true });

            // Send confirmation back
            const confirmationId = `SYNC-${Date.now()}`;
            await setDoc(doc(db, "notifications", confirmationId), {
                id: confirmationId,
                type: "alert",
                senderId: user.id,
                senderName: user.fullName || "Citizen",
                senderPhoto: user.photoURL || "",
                recipientId: notif.senderId,
                message: "approved your resonance request. You are now following each other.",
                status: "read",
                createdAt: serverTimestamp()
            });

            toast.success("Resonance Approved", {
                description: `You have successfully synchronized with ${notif.senderName}.`
            });
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };

    const handleDecline = async (notif: any) => {
        if (!user?.id) return;
        try {
            await setDoc(doc(db, "notifications", notif.id), { status: "declined" }, { merge: true });
            toast.error("Frequency Refused", {
                description: "The identity request has been terminated."
            });
        } catch (error) {
            console.error("Decline failed:", error);
        }
    };

    // Temporal Pulse Logic for Free Citizens
    const [timerPhase, setTimerPhase] = useState<'access' | 'upgrade' | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (user?.plan !== 'free') {
            setTimerPhase(null);
            return;
        }

        const tick = () => {
            let phase = localStorage.getItem('amora_timer_phase') as 'access' | 'upgrade' | null;
            let targetStr = localStorage.getItem('amora_timer_target');
            let target = targetStr ? parseInt(targetStr) : 0;
            let now = Date.now();

            // Safety Check: If the stored target is vastly larger than possible (e.g. from the old 3h logic)
            // or if we simply want to force the 20s reset for the user.
            const maxPossible = 25 * 60 * 60 * 1000; // 25 hours max
            const diff = target - now;

            if (!phase || !targetStr || now > target || diff > maxPossible || (phase === 'access' && diff > 20 * 1000)) {
                // Determine next phase
                const newPhase = phase === 'access' ? 'upgrade' : 'access';
                const duration = newPhase === 'access' ? 20 * 1000 : 24 * 60 * 60 * 1000;

                phase = newPhase;
                target = Date.now() + duration;

                localStorage.setItem('amora_timer_phase', phase);
                localStorage.setItem('amora_timer_target', target.toString());
            }

            setTimerPhase(phase);
            setTimeLeft(Math.max(0, Math.floor((target - now) / 1000)));
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [user?.plan]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const fetchIndex = async () => {
            if (isSearchOpen && allArtifacts.length === 0) {
                const { collection, getDocs, query, doc, getDoc, limit } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const fetchPromises: Promise<any>[] = [
                    getDocs(query(collection(db, "gallery_images"), limit(20))),
                    getDocs(query(collection(db, "gallery_videos"), limit(20))),
                    getDoc(doc(db, "site_content", "hero"))
                ];

                const isAdvanced = user?.plan === 'pro' || user?.plan === 'elite' || user?.plan === 'creator';
                if (isAdvanced) {
                    fetchPromises.push(getDocs(query(collection(db, "users"), limit(50))));
                }

                const responses = await Promise.all(fetchPromises);

                const images = responses[0].docs.map((doc: any) => ({ id: doc.id, ...doc.data(), type: 'image', title: doc.data().title || 'Untitled' }));
                const videos = responses[1].docs.map((doc: any) => ({ id: doc.id, ...doc.data(), type: 'video', title: doc.data().title || 'Untitled' }));

                let hero: any[] = [];
                if (responses[2].exists()) {
                    const data = responses[2].data();
                    hero = [{
                        id: data.id || "main-hero",
                        ...data,
                        type: 'video',
                        title: data.title || 'Featured Hero',
                        imageUrl: data.imageUrl || (data.videoUrl ? data.videoUrl.replace(/\.[^/.]+$/, ".jpg") : undefined)
                    }];
                }

                let users: any[] = [];
                if (isAdvanced && responses[3]) {
                    users = responses[3].docs.map((doc: any) => ({
                        id: doc.id,
                        ...doc.data(),
                        type: 'user',
                        title: doc.data().fullName || doc.data().email
                    }));
                }

                setAllArtifacts([...users, ...images, ...videos, ...hero]);
            }
        };
        fetchIndex();
    }, [isSearchOpen, allArtifacts.length, user?.plan]);

    // Real-time filtering (YouTube-style autocomplete)
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSuggestions([]);
            return;
        }
        const filtered = allArtifacts.filter(art => {
            const queryLower = searchQuery.toLowerCase();
            if (art.type === 'user') {
                return (art.fullName?.toLowerCase().includes(queryLower) ||
                    art.email?.toLowerCase().includes(queryLower));
            }
            return (art.title?.toLowerCase().includes(queryLower) ||
                art.description?.toLowerCase().includes(queryLower));
        }).slice(0, 8); // Expanded set for better cross-node navigation
        setSuggestions(filtered);
    }, [searchQuery, allArtifacts]);

    useEffect(() => {
        if (!isSearchOpen) {
            setSearchQuery("");
            setSuggestions([]);
        }
    }, [isSearchOpen]);

    const getMenuItems = () => {
        const plan = user?.plan || "free";

        switch (plan) {
            case "free":
                return [
                    {
                        label: "Main",
                        items: [
                            { icon: Home, label: "Home", path: "/dashboard" },
                            { icon: Compass, label: "Explore", path: "/explore" },
                            { icon: Image, label: "Images", path: "/images" },
                            { icon: Video, label: "Short Stories (Limited)", path: "/short-videos" },
                        ]
                    },
                    {
                        label: "Experience",
                        items: [
                            { icon: Smile, label: "Mood Feed", path: "/mood", locked: true },
                            { icon: Sparkles, label: "Exclusive Stories", path: "/exclusive", locked: true },
                        ]
                    },
                    {
                        label: "Social",
                        items: [
                            { icon: Heart, label: "Favorites (Limited)", path: "/favorites" },
                        ]
                    },
                    {
                        label: "Account",
                        items: [
                            { icon: Sparkles, label: "Unlock Full Access", path: "/upgrade", special: true },
                            { icon: User, label: "My Profile", path: "/profile" },
                            { icon: HelpCircle, label: "Help & Terms", path: "/help" },
                        ]
                    }
                ];
            case "pro":
                return [
                    {
                        label: "Main",
                        items: [
                            { icon: Home, label: "Home", path: "/dashboard" },
                            { icon: Compass, label: "Explore", path: "/explore" },
                            { icon: Image, label: "Images", path: "/images" },
                            { icon: Video, label: "Short Stories", path: "/short-videos" },
                            { icon: Film, label: "Videos", path: "/short-videos" },
                        ]
                    },
                    {
                        label: "Experience",
                        items: [
                            { icon: Smile, label: "Mood Feed (Manual)", path: "/mood" },
                        ]
                    },
                    {
                        label: "Social",
                        items: [
                            { icon: Heart, label: "Favorites", path: "/favorites" },
                            { icon: Clock, label: "History", path: "/history" },
                        ]
                    },
                    {
                        label: "Account",
                        items: [
                            { icon: ShieldAlert, label: "Pro Access ✅", path: "/upgrade", special: true },
                            { icon: User, label: "My Profile", path: "/profile" },
                            { icon: User, label: "Support", path: "/support" },
                            { icon: Settings, label: "Settings", path: "/settings" },
                        ]
                    }
                ];
            case "elite":
                return [
                    {
                        label: "Main",
                        items: [
                            { icon: Home, label: "Home", path: "/dashboard" },
                            { icon: Compass, label: "Explore", path: "/explore" },
                            { icon: Image, label: "Images", path: "/images" },
                            { icon: Video, label: "Short Stories", path: "/short-videos" },
                            { icon: Film, label: "Videos", path: "/watch" },
                            { icon: Sparkles, label: "Exclusive Stories ✨", path: "/exclusive", special: true },
                        ]
                    },
                    {
                        label: "Experience",
                        items: [
                            { icon: Brain, label: "Emotion AI 🧠", path: "/emotion-ai" },
                            { icon: Activity, label: "Mood Timeline", path: "/mood-timeline" },
                        ]
                    },
                    {
                        label: "Social",
                        items: [
                            { icon: Heart, label: "Favorites", path: "/favorites" },
                            { icon: Clock, label: "History", path: "/history" },
                        ]
                    },
                    {
                        label: "Account",
                        items: [
                            { icon: Crown, label: "Elite Badge 👑", path: "/upgrade", special: true },
                            { icon: User, label: "My Profile", path: "/profile" },
                            { icon: Settings, label: "Settings", path: "/settings" },
                        ]
                    }
                ];
            case "creator":
                return [
                    {
                        label: "Creator Studio",
                        items: [
                            { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
                            { icon: PlusSquare, label: "Upload Content", path: "/upload" },
                            { icon: Film, label: "Manage Stories", path: "/manager/contents" },
                            { icon: Library, label: "Content Status", path: "/manager/nexus" },
                            { icon: DollarSign, label: "Earnings 💰", path: "/earnings" },
                            { icon: BarChart3, label: "Analytics 📊", path: "/analytics" },
                        ]
                    },
                    {
                        label: "Social",
                        items: [
                            { icon: Users, label: "Followers", path: "/followers" },
                        ]
                    },
                    {
                        label: "Account",
                        items: [
                            { icon: Star, label: "Verified Creator ⭐", path: "/upgrade", special: true },
                            { icon: User, label: "My Profile", path: "/profile" },
                            { icon: Settings, label: "Settings", path: "/settings" },
                        ]
                    }
                ];
            default:
                return [{ label: "Navigation", items: [{ icon: Home, label: "Home", path: "/dashboard" }] }];
        }
    };

    const menuItems = getMenuItems();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col font-sans">

            {/* Search Overlay - Arbiter Global Indexing Engine */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 backdrop-blur-[40px] bg-black/70 animate-in fade-in duration-300"
                    >
                        <div
                            className="absolute inset-0 cursor-pointer"
                            onClick={() => setIsSearchOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            className="w-full max-w-2xl bg-[#0D121F]/90 border border-white/10 rounded-[40px] overflow-hidden shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center gap-5">
                                <Search className="w-7 h-7 text-[#e9c49a] animate-pulse" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Index planetary artifacts..."
                                    className="flex-1 bg-transparent border-none outline-none text-2xl font-light placeholder:text-white/5 text-white active:ring-0 focus:ring-0"
                                />
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] text-white/30 uppercase font-bold tracking-widest">
                                    ESC
                                </div>
                            </div>

                            <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                                {searchQuery.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="px-4 text-[9px] uppercase tracking-[0.3em] text-[#e9c49a]/40 font-bold mb-4">Resonance Suggestions</p>
                                        {suggestions.length > 0 ? (
                                            suggestions.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => {
                                                        const isPhaseLocked = user?.plan === 'free' && timerPhase === 'upgrade';
                                                        if (isPhaseLocked && item.path !== '/upgrade') {
                                                            toast.error("Temporal Access Locked: Upgrade to continue exploration.");
                                                            return;
                                                        }
                                                        setIsSearchOpen(false);
                                                        setSearchQuery("");
                                                        if (item.type === 'video') {
                                                            navigate(`/watch?id=${item.id}`);
                                                        } else if (item.type === 'user') {
                                                            navigate(`/user-profile/${item.id}`);
                                                        } else {
                                                            navigate(`/images?search=${item.title}`);
                                                        }
                                                    }}
                                                    className="flex items-center justify-between px-6 py-5 rounded-[2rem] hover:bg-[#e9c49a]/5 border border-transparent hover:border-[#e9c49a]/10 cursor-pointer group transition-all duration-300"
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className={cn(
                                                            "w-14 h-14 rounded-2xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-[#e9c49a]/30 transition-all relative",
                                                            item.type === 'user' && "rounded-full"
                                                        )}>
                                                            <img src={item.photoURL || item.imageUrl || `https://ui-avatars.com/api/?name=${item.fullName || 'User'}&background=random`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {item.type === 'video' ? <Video className="w-5 h-5 text-white" /> :
                                                                    item.type === 'user' ? <Users className="w-5 h-5 text-white" /> : <Image className="w-5 h-5 text-white" />}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-light text-white/60 group-hover:text-white transition-colors">
                                                                    {item.type === 'user' ? (item.fullName || item.email) : item.title.toLowerCase().replace(/\s+/g, '_')}.{item.type === 'user' ? 'citizen' : 'artifact'}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                                                    item.type === 'video' ? "text-[#e9c49a] border-[#e9c49a]/20 bg-[#e9c49a]/5" :
                                                                        item.type === 'user' ? "text-purple-400 border-purple-400/20 bg-purple-400/5" : "text-blue-400 border-blue-400/20 bg-blue-400/5"
                                                                )}>
                                                                    {item.type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-white/20 font-bold">
                                                                {item.type === 'user' ? (
                                                                    <><Globe className="w-3 h-3" /> {item.plan || 'Free'} Protocol</>
                                                                ) : (
                                                                    <><Activity className="w-3 h-3" /> ID: {item.id.slice(-6).toUpperCase()}</>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Sparkles className="w-4 h-4 text-white/0 group-hover:text-[#e9c49a]/40 transition-all transform group-hover:rotate-12" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-6 py-10 text-center space-y-3">
                                                <p className="text-white/20 text-sm font-light italic">No matching resonance detected in the archive.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="px-4 text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold mb-4">Directorial Quick-Links</p>
                                            <div className="grid grid-cols-2 gap-3 px-2">
                                                {[
                                                    { label: 'Cinematic Gallery', path: '/images', icon: Image },
                                                    { label: 'Theater Portal', path: '/watch', icon: Film },
                                                    { label: 'Emotion Lab', path: '/emotion-ai', icon: Brain },
                                                    { label: 'Executive Status', path: '/upgrade', icon: Star }
                                                ].map((link) => (
                                                    <button
                                                        key={link.label}
                                                        onClick={() => { navigate(link.path); setIsSearchOpen(false); }}
                                                        className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-[#e9c49a]/5 hover:border-[#e9c49a]/20 transition-all text-left group"
                                                    >
                                                        <link.icon className="w-4 h-4 text-white/20 group-hover:text-[#e9c49a] transition-colors" />
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 group-hover:text-white">{link.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-black/40 p-5 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <span className="flex items-center gap-2 text-[9px] text-white/10 font-bold uppercase tracking-[0.5em] leading-none">
                                        <Command className="w-3 h-3" /> Arbiter Navigation Suite
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono text-white/5">v4.0.21_HYPERION</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navbar */}
            <header className="fixed top-0 left-0 right-0 h-16 z-50 glass border-b border-white/5 px-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => navigate("/")}>
                        <Logo className="h-6 w-auto" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-full">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#e9c49a] transition-all group"
                        >
                            <Search className="w-5 h-5 group-active:scale-90 transition-transform" />
                        </button>

                        {(user?.plan === 'pro' || user?.plan === 'elite' || user?.plan === 'creator') && (
                            <button
                                onClick={() => navigate("/messages")}
                                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#e9c49a] transition-all group"
                            >
                                <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </button>
                        )}

                        {(user?.plan === 'free' && timerPhase) && (
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-500",
                                timerPhase === 'access'
                                    ? "bg-white/[0.02] border-white/5"
                                    : "bg-red-500/10 border-red-500/20 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                            )}>
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] uppercase tracking-[0.2em] font-bold text-white/30 leading-none mb-0.5">
                                        {timerPhase === 'access' ? 'Free Access' : 'Upgrade Required'}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-mono font-bold tracking-wider leading-none",
                                        timerPhase === 'access' ? "text-[#e9c49a]" : "text-red-400"
                                    )}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border",
                                    timerPhase === 'access' ? "bg-white/5 border-white/10" : "bg-red-500 text-white border-transparent"
                                )}>
                                    <Clock className={cn("w-3.5 h-3.5", timerPhase === 'access' ? "text-white/40" : "animate-spin-slow")} />
                                </div>
                                {timerPhase === 'upgrade' && (
                                    <button
                                        onClick={() => navigate("/upgrade")}
                                        className="ml-1 px-3 py-1 bg-red-500 text-white text-[8px] uppercase font-bold tracking-widest rounded-full hover:bg-white hover:text-black transition-all"
                                    >
                                        Sync Now
                                    </button>
                                )}
                            </div>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#e9c49a] transition-all">
                                    <Bell className="w-5 h-5" />
                                    {notifications.filter(n => n.status === 'pending').length > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse">
                                            {notifications.filter(n => n.status === 'pending').length}
                                        </span>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 bg-[#0D121F]/90 backdrop-blur-3xl border-white/5 p-4 rounded-[2rem] shadow-2xl space-y-4">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20">Identity Alerts</span>
                                    <span className="text-[10px] uppercase font-bold text-[#e9c49a]">{notifications.length} Nodes</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 group hover:bg-white/[0.04] transition-all">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8 rounded-xl border border-white/5">
                                                        <AvatarImage src={notif.senderPhoto} />
                                                        <AvatarFallback className="bg-white/5 text-[8px]">{notif.senderName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-medium text-white/80 leading-tight">
                                                            <span className="font-bold text-white">{notif.senderName}</span>
                                                            {notif.type === 'follow_request' ? " requested resonance access." : ` ${notif.message}`}
                                                        </p>
                                                        <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-1">
                                                            {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {notif.type === 'follow_request' && notif.status === 'pending' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleDecline(notif)}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(notif)}
                                                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {(notif.type === 'alert' || (notif.type === 'follow_request' && notif.status === 'approved')) && (
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => navigate("/messages")}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e9c49a]/10 text-[#e9c49a] hover:bg-[#e9c49a] hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest"
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5" /> Start Conversation
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center space-y-3">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                                <Bell className="w-4 h-4 text-white/10" />
                                            </div>
                                            <p className="text-[10px] text-white/20 italic font-light">No active frequencies detected.</p>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="h-8 w-[1px] bg-white/5 mx-2" />

                    {/* Shadcn Dropdown Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all group">
                                <Avatar className="w-8 h-8 rounded-full ring-1 ring-white/10 group-hover:ring-[#e9c49a]/30 transition-all">
                                    <AvatarImage src={user?.photoURL} />
                                    <AvatarFallback className="bg-[#8b6544] text-[10px] uppercase">
                                        {user?.fullName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden lg:block text-left mr-1">
                                    <p className="text-[11px] font-medium text-white/80 leading-tight truncate max-w-[100px]">
                                        {user?.fullName || "Elite Member"}
                                    </p>
                                    <p className={cn(
                                        "text-[9px] uppercase tracking-widest font-bold",
                                        user?.plan === 'pro' ? "text-[#e9c49a]" :
                                            user?.plan === 'elite' ? "text-[#d4af37]" :
                                                user?.plan === 'creator' ? "text-purple-400" : "text-white/40"
                                    )}>
                                        {user?.plan === 'pro' ? "Pro Verified" :
                                            user?.plan === 'elite' ? "Elite Sovereign" :
                                                user?.plan === 'creator' ? "Master Creator" : "Free Explorer"}
                                    </p>
                                </div>
                                <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-white transition-colors mr-2" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#0D121F] border-white/10 text-white p-2 rounded-2xl" align="end" sideOffset={10}>
                            <DropdownMenuLabel className="font-light text-white/40 text-[10px] uppercase tracking-[0.2em] px-3 py-2">Account Control</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 focus:bg-white/5 cursor-pointer transition-all group">
                                <Users className="w-4 h-4 text-white/40 group-hover:text-[#e9c49a] transition-colors" />
                                <span className="text-sm font-light">Public Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 focus:bg-white/5 cursor-pointer transition-all group">
                                <Settings className="w-4 h-4 text-white/40 group-hover:text-[#e9c49a] transition-colors" />
                                <span className="text-sm font-light">Billing & Plan</span>
                            </DropdownMenuItem>
                            {user?.plan !== 'creator' && (
                                <DropdownMenuItem onClick={() => navigate("/upgrade")} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#e9c49a]/10 hover:bg-[#e9c49a]/20 focus:bg-[#e9c49a]/20 cursor-pointer transition-all group mt-1">
                                    <Crown className="w-4 h-4 text-[#e9c49a]" />
                                    <span className="text-sm font-medium text-[#e9c49a]">
                                        {user?.plan === 'free' ? "Upgrade to Pro" :
                                            user?.plan === 'pro' ? "Upgrade to Elite" : "Unlock Creator Toolset"}
                                    </span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-white/5 mt-1" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 cursor-pointer transition-all group"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-light">Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        className="md:hidden p-2 text-white/60 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 pt-16 h-screen overflow-hidden relative">

                {/* Fixed Sidebar */}
                <aside className={cn(
                    "fixed top-16 left-0 w-[240px] h-[calc(100vh-64px)] transform transition-all duration-500 ease-in-out z-40 bg-gradient-to-b from-[#0D121F] to-[#0B0F1A] border-r border-white/5 pt-8",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}>
                    <div className="flex flex-col h-full px-4 pb-8 justify-between overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col gap-6">
                            {getMenuItems().map((group: any) => (
                                <div key={group.label} className="space-y-1">
                                    <p className="px-4 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold mb-2">{group.label}</p>
                                    {group.items.map((item: any) => {
                                        const isActive = location.pathname === item.path;
                                        const isLocked = item.locked;
                                        const isSpecial = item.special;

                                        return (
                                            <button
                                                key={item.label}
                                                onClick={() => {
                                                    const isLockedCurrent = user?.plan === 'free' && timerPhase === 'upgrade';
                                                    if (isLockedCurrent && item.path !== '/upgrade') {
                                                        toast.error("Protocol Locked: Complete synchronization to regain access.");
                                                        return;
                                                    }
                                                    if (!isLocked) navigate(item.path);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden",
                                                    isActive
                                                        ? "bg-white/[0.04] text-white shadow-[inset_0_0_20px_rgba(233,196,154,0.05)]"
                                                        : isLocked
                                                            ? "opacity-50 cursor-not-allowed grayscale"
                                                            : "text-white/40 hover:text-white hover:bg-white/[0.02]",
                                                    isSpecial && !isActive && "text-[#e9c49a] bg-[#e9c49a]/5 border border-[#e9c49a]/10",
                                                    (user?.plan === 'free' && timerPhase === 'upgrade' && !['/upgrade', '/payment'].some(p => item.path.startsWith(p))) && "grayscale opacity-30 pointer-events-none"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#e9c49a] rounded-r-full shadow-[0_0_10px_#e9c49a]" />
                                                    )}
                                                    <item.icon className={cn(
                                                        "w-4 h-4 transition-all",
                                                        isActive || isSpecial ? "text-[#e9c49a] drop-shadow-[0_0_8px_rgba(233,196,154,0.5)]" : "group-hover:text-[#e9c49a]"
                                                    )} />
                                                    <span className="text-xs font-light tracking-wide">{item.label}</span>
                                                </div>

                                                {isLocked && (
                                                    <div className="flex items-center gap-2">
                                                        <Lock className="w-3 h-3 text-[#e9c49a]/60" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/5">
                            <div className="px-4 py-4 rounded-2xl bg-gradient-to-tr from-[#e9c49a]/10 to-transparent border border-[#e9c49a]/10">
                                <p className="text-[10px] text-[#e9c49a] font-bold uppercase tracking-widest mb-1">
                                    {user?.plan === 'free' ? 'Explorer Status' :
                                        user?.plan === 'pro' ? 'Resonance Tier' :
                                            user?.plan === 'elite' ? 'Elite Sovereign' :
                                                user?.plan === 'creator' ? 'Master Architect' : 'Citizen Status'}
                                </p>
                                <p className="text-[9px] text-white/40 font-light leading-relaxed">
                                    {user?.plan === 'free' ? 'Unlock the full potential of cinematic immersion.' :
                                        user?.plan === 'pro' ? 'Daily synchronization and social resonance active.' :
                                            user?.plan === 'elite' ? 'You are among our most exclusive contributors.' :
                                                user?.plan === 'creator' ? 'Your creativity is the heart of Amora.' :
                                                    'Welcome to the future of cinematic narrative.'}
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/50 hover:text-red-400 hover:bg-red-400/5 transition-all group"
                            >
                                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                <span className="text-xs font-light">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 md:ml-[240px] overflow-y-auto bg-[#0B0F1A] custom-scrollbar relative">
                    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 relative min-h-full">
                        {children}

                        {/* Orbital Upgrade Blocker - Absolute Phase Lock */}
                        <AnimatePresence>
                            {(user?.plan === 'free' && timerPhase === 'upgrade' && !['/upgrade', '/payment'].some(p => location.pathname.startsWith(p))) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[#0B0F1A]/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                        animate={{ scale: 1, y: 0, opacity: 1 }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        className="w-full max-w-lg bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 text-center space-y-8 relative shadow-2xl overflow-hidden"
                                    >
                                        {/* Background Effects */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] -z-10" />
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e9c49a]/5 blur-[100px] -z-10" />

                                        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto relative">
                                            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-20" />
                                            <Lock className="w-10 h-10 text-red-500" />
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-display font-light tracking-tight text-white/90">Temporal Access <span className="text-red-400 italic">Locked</span></h2>
                                            <p className="text-white/30 text-sm font-light leading-relaxed">
                                                Your 20-second immersion window has finished. To maintain archival frequency and access the complete planetary registry, you must synchronize with a premium protocol.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <Button
                                                onClick={() => navigate("/upgrade")}
                                                className="h-16 rounded-2xl bg-[#e9c49a] text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-xl group"
                                            >
                                                Sync Identity Protocol <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                            <div className="flex items-center justify-between px-6 py-4 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Resync Available In</span>
                                                <span className="text-sm font-mono font-bold text-red-400">{formatTime(timeLeft)}</span>
                                            </div>
                                        </div>

                                        <p className="text-[9px] uppercase tracking-[0.4em] text-white/10 font-bold">Identity Registry // Phase v4.0.21</p>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Subtle Background Accent */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8b6544]/5 blur-[150px] -z-10 pointer-events-none rounded-full" />
                </main>
            </div>

            <style>{`
        .glass {
          background: rgba(13, 18, 31, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    );
}
