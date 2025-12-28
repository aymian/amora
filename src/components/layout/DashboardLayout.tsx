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
    X,
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
    PlusSquare,
    Library,
    DollarSign,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase";
import { Logo } from "@/components/brand/Logo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

    // Fetch artifacts for global search index
    useEffect(() => {
        if (isSearchOpen && allArtifacts.length === 0) {
            const fetchIndex = async () => {
                const { collection, getDocs, query, doc, getDoc } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const [imagesSnap, videosSnap, heroSnap] = await Promise.all([
                    getDocs(query(collection(db, "gallery_images"))),
                    getDocs(query(collection(db, "gallery_videos"))),
                    getDoc(doc(db, "site_content", "hero"))
                ]);

                const images = imagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'image' }));
                const videos = videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'video' }));

                let hero: any[] = [];
                if (heroSnap.exists()) {
                    const data = heroSnap.data();
                    hero = [{
                        id: data.id || "main-hero",
                        ...data,
                        type: 'video',
                        imageUrl: data.imageUrl || (data.videoUrl ? data.videoUrl.replace(/\.[^/.]+$/, ".jpg") : undefined)
                    }];
                }

                setAllArtifacts([...images, ...videos, ...hero]);
            };
            fetchIndex();
        }
    }, [isSearchOpen, allArtifacts.length]);

    // Real-time filtering (YouTube-style autocomplete)
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSuggestions([]);
            return;
        }
        const filtered = allArtifacts.filter(art =>
            art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            art.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5); // Limit to top 5 for elite performance
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
                    { icon: Home, label: "Home", path: "/dashboard" },
                    { icon: Compass, label: "Explore", path: "/explore" },
                    { icon: Image, label: "Images", path: "/images" },
                    { icon: Video, label: "Short Videos", path: "/short-videos" },
                    { icon: Smile, label: "Mood (Limited)", path: "/mood", locked: true },
                    { icon: Heart, label: "Favorites", path: "/favorites", locked: true },
                    { icon: Star, label: "Upgrade", path: "/upgrade", special: true },
                ];
            case "pro":
                return [
                    { icon: Home, label: "Home", path: "/dashboard" },
                    { icon: Compass, label: "Explore", path: "/explore" },
                    { icon: Image, label: "Images", path: "/images" },
                    { icon: Video, label: "Short Videos", path: "/short-videos" },
                    { icon: Smile, label: "Mood (Manual)", path: "/mood" },
                    { icon: Heart, label: "Favorites", path: "/favorites" },
                    { icon: Clock, label: "History", path: "/history" },
                    { icon: Star, label: "Upgrade", path: "/upgrade", special: true },
                ];
            case "premium":
                return [
                    { icon: Home, label: "Home", path: "/dashboard" },
                    { icon: Compass, label: "Explore", path: "/explore" },
                    { icon: Image, label: "Images", path: "/images" },
                    { icon: Video, label: "Short Videos", path: "/short-videos" },
                    { icon: LayoutGrid, label: "Stories (HD)", path: "/stories" },
                    { icon: Brain, label: "Emotion AI", path: "/emotion-ai" },
                    { icon: Activity, label: "Mood Timeline", path: "/mood-timeline" },
                    { icon: Heart, label: "Favorites", path: "/favorites" },
                    { icon: Download, label: "Downloads", path: "/downloads" },
                    { icon: Settings, label: "Settings", path: "/settings" },
                ];
            case "elite":
                return [
                    { icon: Home, label: "Home", path: "/dashboard" },
                    { icon: Compass, label: "Explore", path: "/explore" },
                    { icon: Image, label: "Images", path: "/images" },
                    { icon: Sparkles, label: "Exclusive Stories", path: "/exclusive", special: true },
                    { icon: MessageSquare, label: "AI Companion", path: "/ai-companion" },
                    { icon: PieChart, label: "Emotion Analytics", path: "/analytics" },
                    { icon: Rocket, label: "Early Access", path: "/early-access" },
                    { icon: Download, label: "Downloads", path: "/downloads" },
                    { icon: Settings, label: "Settings", path: "/settings" },
                ];
            case "creator":
                return [
                    { icon: Home, label: "Home", path: "/dashboard" },
                    { icon: Film, label: "Creator Studio", path: "/creator-studio", special: true },
                    { icon: Image, label: "Images", path: "/images" },
                    { icon: PlusSquare, label: "Upload Content", path: "/upload" },
                    { icon: Library, label: "Stories Manager", path: "/manager" },
                    { icon: Users, label: "Followers", path: "/followers" },
                    { icon: DollarSign, label: "Earnings", path: "/earnings" },
                    { icon: BarChart3, label: "Analytics", path: "/analytics" },
                    { icon: TrendingUp, label: "Boost Content", path: "/boost" },
                    { icon: Settings, label: "Settings", path: "/settings" },
                ];
            default:
                return [{ icon: Home, label: "Home", path: "/dashboard" }];
        }
    };

    const menuItems = getMenuItems();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/login");
    };

    const isPro = user?.plan === "pro";

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
                                                        setIsSearchOpen(false);
                                                        setSearchQuery("");
                                                        if (item.type === 'video') {
                                                            navigate(`/watch?id=${item.id}`);
                                                        } else {
                                                            navigate(`/images?search=${item.title}`);
                                                        }
                                                    }}
                                                    className="flex items-center justify-between px-6 py-5 rounded-[2rem] hover:bg-[#e9c49a]/5 border border-transparent hover:border-[#e9c49a]/10 cursor-pointer group transition-all duration-300"
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-[#e9c49a]/30 transition-all relative">
                                                            <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {item.type === 'video' ? <Video className="w-5 h-5 text-white" /> : <Image className="w-5 h-5 text-white" />}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-light text-white/60 group-hover:text-white transition-colors">
                                                                    {item.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                                                </span>
                                                                <span className={cn(
                                                                    "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                                                    item.type === 'video' ? "text-[#e9c49a] border-[#e9c49a]/20 bg-[#e9c49a]/5" : "text-blue-400 border-blue-400/20 bg-blue-400/5"
                                                                )}>
                                                                    {item.type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-white/20 font-bold">
                                                                <Activity className="w-3 h-3" /> ID: {item.id.slice(-6).toUpperCase()}
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
                        <button className="relative w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-[#e9c49a] transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#e9c49a] rounded-full" />
                        </button>
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
                                        isPro ? "text-[#e9c49a]" : "text-white/40"
                                    )}>
                                        {isPro ? "Pro Plan" : "Free Plan"}
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
                            {!isPro && (
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#e9c49a]/10 hover:bg-[#e9c49a]/20 focus:bg-[#e9c49a]/20 cursor-pointer transition-all group mt-1">
                                    <Crown className="w-4 h-4 text-[#e9c49a]" />
                                    <span className="text-sm font-medium text-[#e9c49a]">Upgrade to Pro</span>
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
                    "fixed top-16 left-0 w-[240px] h-[calc(100vh-64px)] transform transition-transform duration-300 ease-in-out z-40 bg-gradient-to-b from-[#0D121F] to-[#0B0F1A] border-r border-white/5 pt-8",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}>
                    <div className="flex flex-col h-full px-4 pb-8 justify-between overflow-y-auto custom-scrollbar">
                        <div className="space-y-1">
                            <p className="px-4 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold mb-4">Navigation</p>
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const isLocked = (item as any).locked;
                                const isSpecial = (item as any).special;

                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => !isLocked && navigate(item.path)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden",
                                            isActive
                                                ? "bg-white/[0.04] text-white shadow-[inset_0_0_20px_rgba(233,196,154,0.05)]"
                                                : isLocked
                                                    ? "opacity-50 cursor-not-allowed grayscale"
                                                    : "text-white/40 hover:text-white hover:bg-white/[0.02]",
                                            isSpecial && !isActive && "text-[#e9c49a] bg-[#e9c49a]/5 border border-[#e9c49a]/10"
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
                                                <span className="text-[8px] uppercase tracking-tighter text-[#e9c49a]/50 font-bold hidden lg:block group-hover:block transition-all">Unlock Premium</span>
                                                <Lock className="w-3 h-3 text-[#e9c49a]/60" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/5">
                            <div className="px-4 py-4 rounded-2xl bg-gradient-to-tr from-[#e9c49a]/10 to-transparent border border-[#e9c49a]/10">
                                <p className="text-[10px] text-[#e9c49a] font-bold uppercase tracking-widest mb-1">
                                    {user?.plan === 'elite' ? 'Elite Status' :
                                        user?.plan === 'creator' ? 'Cinema Partner' :
                                            user?.plan === 'premium' ? 'Premium Tier' : 'Explorer Status'}
                                </p>
                                <p className="text-[9px] text-white/40 font-light leading-relaxed">
                                    {user?.plan === 'elite' ? 'You are among our most exclusive contributors.' :
                                        user?.plan === 'creator' ? 'Your creativity is the heart of Amora.' :
                                            user?.plan === 'free' ? 'Unlock the full potential of cinematic immersion.' :
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
                    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
                        {children}
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
