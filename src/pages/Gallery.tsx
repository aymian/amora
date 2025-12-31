import { collection, getDocs, query, orderBy, doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Sparkles,
    Image as ImageIcon,
    Search,
    Filter,
    Expand,
    Download,
    Heart,
    X,
    Maximize2,
    Share2,
    Calendar,
    ArrowUpRight,
    LucideIcon,
    Activity,
    Command,
    Shield,
    Zap,
    Lock,
    Globe,
    Palette,
    Layers,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    Camera,
    Sun,
    Trash2,
    Eye,
    Tag,
    Award,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function Gallery() {
    const { user: userData } = useOutletContext<{ user: any }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get("search") || "";
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState(urlSearch);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [userLikes, setUserLikes] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (userData) {
            setUserLikes(userData.likedGalleryImages || []);
        }
    }, [userData]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const fetchCollection = async (collName: string) => {
                    try {
                        const q = query(collection(db, collName), orderBy("createdAt", "desc"));
                        const snap = await getDocs(q);
                        if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                        // Fallback if empty (missing fields)
                        const q2 = query(collection(db, collName));
                        const snap2 = await getDocs(q2);
                        return snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    } catch (err) {
                        console.warn(`Gallery fetch failed for ${collName}, falling back`, err);
                        const q3 = query(collection(db, collName));
                        const snap3 = await getDocs(q3);
                        return snap3.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    }
                };

                // Try gallery_images first
                let imageList = await fetchCollection("gallery_images");

                // If gallery is empty, try videos and shorts
                if (imageList.length === 0) {
                    const [vList, sList] = await Promise.all([
                        fetchCollection("gallery_videos"),
                        fetchCollection("shorts")
                    ]);
                    imageList = [...vList, ...sList];
                }

                // Apply thumbnail logic for video assets
                const processedList = imageList.map((item: any) => ({
                    ...item,
                    imageUrl: item.imageUrl || (item.videoUrl ? item.videoUrl.replace(/\.[^/.]+$/, ".jpg") : null)
                })).filter(item => item.imageUrl);

                setImages(processedList);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setTimeout(() => setLoading(false), 600);
            }
        };

        fetchImages();
    }, []);

    // Respond to URL search changes
    useEffect(() => {
        setSearchQuery(urlSearch);
    }, [urlSearch]);

    // Autocomplete Logic
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSuggestions([]);
            return;
        }
        const filtered = images.filter(img =>
            img.title.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
    }, [searchQuery, images]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredImages = images.filter(img =>
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownload = async (imageUrl: string, title: string) => {
        try {
            toast.info("Initializing artifact download...");
            const response = await fetch(imageUrl);
            const blob = await response.json ? await response.blob() : await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_amora.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Artifact synchronized to local storage");
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback
            window.open(imageUrl, '_blank');
        }
    };

    const handleShare = async (image: any) => {
        const shareData = {
            title: `Amora Architecture: ${image.title}`,
            text: image.description || "Check out this visual artifact from Amora.",
            url: window.location.href + `?search=${encodeURIComponent(image.title)}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success("Transmission successful");
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast.success("Nexus link copied to clipboard");
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    const handleLike = async (image: any) => {
        if (!userData) {
            toast.error("Auth required for resonance");
            return;
        }

        const isLiked = userLikes.includes(image.id);
        const newLikes = isLiked
            ? userLikes.filter(id => id !== image.id)
            : [...userLikes, image.id];

        setUserLikes(newLikes);

        try {
            const imageRef = doc(db, "gallery_images", image.id);
            const userRef = doc(db, "users", userData.id);

            await Promise.all([
                updateDoc(imageRef, {
                    "stats.reactions": increment(isLiked ? -1 : 1)
                }),
                updateDoc(userRef, {
                    likedGalleryImages: isLiked ? arrayRemove(image.id) : arrayUnion(image.id)
                })
            ]);

            toast.success(isLiked ? "Resonance severed" : "Resonance established");
        } catch (error) {
            console.error("Like failed:", error);
            // Rollback
            setUserLikes(userLikes);
        }
    };

    return (
        <div className="space-y-12 pb-32">

            {/* Hero / Header Stage */}
            <div className="relative pt-8">
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#e9c49a]/5 blur-[100px] rounded-full -ml-32 -mt-32" />

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative">
                    <div className="space-y-6 flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-[#e9c49a] font-bold">Planetary Archive</span>
                            </div>
                            <div className="h-[1px] w-12 bg-white/10" />
                            <span className="text-[10px] uppercase tracking-widest text-white/20 font-medium">Verified Assets</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-display font-light tracking-tight leading-none"
                        >
                            Visual <span className="text-[#e9c49a] italic font-serif">Resonance</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/40 text-lg font-light max-w-xl leading-relaxed font-sans"
                        >
                            A consolidated museum of high-fidelity artifacts and cinematic stories. Every frame is a unique perspective.
                        </motion.p>
                    </div>

                    {/* Restored Hero Artifact Cards (Featured Selection) */}
                    <div className="hidden xl:flex items-center gap-6 h-[200px]">
                        {images.slice(0, 2).map((img, idx) => (
                            <motion.div
                                key={`hero-${idx}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + (idx * 0.1) }}
                                className="w-32 h-44 rounded-2xl overflow-hidden border border-white/10 relative group cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img.imageUrl} className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-3 left-3">
                                    <div className="w-1 h-8 bg-[#e9c49a] rounded-full" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center gap-4 relative"
                    >
                        <div
                            ref={searchRef}
                            className="relative group"
                        >
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-3xl px-6 py-4 focus-within:border-[#e9c49a]/40 focus-within:bg-white/[0.08] transition-all duration-500 min-w-[340px] relative z-20">
                                <Search className="w-5 h-5 text-white/20 group-focus-within:text-[#e9c49a]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Scan archive handle..."
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/10 w-full font-light"
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(""); setSearchParams({}); }} className="text-white/20 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* High-Fidelity Autocomplete Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-3 p-3 bg-[#0D121F]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-2 text-[8px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]/40 flex items-center gap-2">
                                            <Command className="w-3 h-3" /> Archive Resonance
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {suggestions.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        setSearchQuery(item.title);
                                                        setShowSuggestions(false);
                                                        setSearchParams({ search: item.title });
                                                    }}
                                                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 text-left group transition-all"
                                                >
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 group-hover:border-[#e9c49a]/30 transition-all">
                                                        <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">
                                                            {item.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                                        </p>
                                                        <p className="text-[9px] text-white/20 font-mono truncate">{item.id.toUpperCase()}</p>
                                                    </div>
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-white/0 group-hover:text-[#e9c49a] transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button className="h-14 w-14 flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 hover:border-[#e9c49a]/40 hover:bg-[#e9c49a]/5 text-white/30 hover:text-[#e9c49a] transition-all duration-500 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[#e9c49a]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Filter className="w-5 h-5 relative z-10" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Gallery Stage - Cinematic Vertical Feed */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-[9/16] rounded-[3rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : images.length > 0 ? (
                <div className="space-y-12">
                    {filteredImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredImages.map((image, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.8 }}
                                    key={image.id}
                                    onClick={() => setSelectedImage(image)}
                                    className="group relative aspect-[9/16] rounded-[3rem] overflow-hidden bg-[#070707] border border-white/5 cursor-pointer shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 active:scale-[0.98]"
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={image.title}
                                        className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110"
                                    />

                                    {/* High-Fidelity Shadow Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/20 opacity-60 group-hover:opacity-100 transition-all duration-700" />

                                    {/* Identity & Narrative Overlay (Bottom) */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">
                                                {image.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                            </h3>
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Sparkles className="w-3.5 h-3.5 text-[#e9c49a]" />
                                                <p className="text-[11px] font-light leading-relaxed line-clamp-1 italic font-serif">
                                                    {image.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action pulse bar (aesthetic decor) */}
                                        <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden relative">
                                            <motion.div
                                                initial={{ x: "-100%" }}
                                                animate={{ x: "100%" }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e9c49a]/40 to-transparent w-1/2"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                            <div className="flex items-center gap-3">
                                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#e9c49a] hover:text-black transition-all">
                                                    <Expand className="w-3.5 h-3.5" /> Synchronize
                                                </button>
                                            </div>
                                            <Heart className="w-5 h-5 text-white/30 hover:text-red-500 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Floating Resonance Badge */}
                                    <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[8px] uppercase tracking-[0.2em] text-[#e9c49a] font-bold">
                                        Archive #{image.id.slice(-4)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center space-y-10 bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem]">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-display font-light text-white/60 tracking-tight">Zero Resonance Detected</h3>
                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Refine your indexing query for "{searchQuery}"</p>
                                <button
                                    onClick={() => { setSearchQuery(""); setSearchParams({}); }}
                                    className="mt-6 px-6 py-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-[9px] font-bold uppercase tracking-[0.2em]"
                                >
                                    Clear Indexing Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center space-y-10 bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#e9c49a] blur-3xl opacity-10 animate-pulse" />
                        <div className="w-32 h-32 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center relative">
                            <Sparkles className="w-10 h-10 text-white/5" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-display font-light text-white/60 tracking-tight">Vivid Void Detected</h3>
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Awaiting Directorial Pulse</p>
                    </div>
                </div>
            )}

            {/* Lightbox - High-Fidelity Cinematic Intel Portal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/98 backdrop-blur-[80px] p-0 md:p-10"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Dynamic Background Aura */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <img src={selectedImage.imageUrl} className="w-full h-full object-cover blur-[200px] scale-125" alt="" />
                        </div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-[1400px] aspect-video md:h-[85vh] flex flex-col md:flex-row items-stretch rounded-none md:rounded-[4rem] overflow-hidden bg-[#0a0a0a] border-none md:border md:border-white/10 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)]"
                        >
                            {/* Left: Artifact Viewport */}
                            <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center group/artifact">
                                <img
                                    src={selectedImage.imageUrl}
                                    alt={selectedImage.title}
                                    className="w-full h-full object-contain"
                                />

                                {/* Image Overlay Badges */}
                                <div className="absolute top-10 left-10 flex flex-col gap-3">
                                    <div className="px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">Active Resonance</span>
                                    </div>
                                    {selectedImage.is18Plus && (
                                        <div className="px-4 py-2 rounded-2xl bg-red-500/20 backdrop-blur-3xl border border-red-500/30">
                                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-500">18+ Restricted</span>
                                        </div>
                                    )}
                                </div>

                                {/* Plan Badge */}
                                <div className="absolute bottom-10 left-10 flex items-center gap-3">
                                    <div className="px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center gap-3">
                                        <Award className="w-4 h-4 text-[#e9c49a]" />
                                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/50">
                                            {selectedImage.planVisibility?.[0] || 'Free'} PROTOCOL
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Directorial Intel Panel */}
                            <div className="w-full md:w-[500px] bg-[#070707] flex flex-col p-10 md:p-14 border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto custom-scrollbar relative">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all z-20 group"
                                >
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                </button>

                                <div className="space-y-12 pb-10">
                                    {/* Header Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Tag className="w-4 h-4 text-[#e9c49a]/40" />
                                            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/20">Artifact Identification</span>
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-4xl md:text-5xl font-display font-light text-white leading-tight lowercase">
                                                {selectedImage.title.replace(/\s+/g, '_')}.<span className="text-[#e9c49a] italic">artifact</span>
                                            </h2>
                                            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#e9c49a] font-bold">
                                                <Sparkles className="w-3.5 h-3.5" /> {selectedImage.category || 'General'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mood & Energy Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-px bg-white/5" />
                                            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">Emotional Core</span>
                                            <div className="flex-1 h-px bg-white/5" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-3">
                                                <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Primary Mood</label>
                                                <div className="flex items-center gap-2 text-white">
                                                    <Zap className="w-4 h-4 text-[#e9c49a]" />
                                                    <span className="text-sm font-medium">{selectedImage.coreMood || 'Balanced'}</span>
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-3">
                                                <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Aura Type</label>
                                                <div className="flex items-center gap-2 text-white">
                                                    <Activity className="w-4 h-4 text-purple-400" />
                                                    <span className="text-sm font-medium">{selectedImage.auraDescriptor || 'Magnetic'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Secondary Moods */}
                                        <div className="flex flex-wrap gap-2">
                                            {selectedImage.secondaryMoods?.map((mood: string) => (
                                                <span key={mood} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] uppercase font-bold tracking-widest text-white/40">
                                                    {mood}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Narrative Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <FileText className="w-4 h-4 text-white/20" />
                                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Narrative Fragment</span>
                                        </div>
                                        <div className="space-y-4">
                                            {selectedImage.narrativeFragment && (
                                                <p className="text-2xl font-serif italic text-white/80 leading-relaxed border-l-2 border-[#e9c49a]/30 pl-6">
                                                    "{selectedImage.narrativeFragment}"
                                                </p>
                                            )}
                                            <p className="text-sm font-light text-white/40 leading-relaxed pl-6">
                                                {selectedImage.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Technical Specs / Visual Attributes */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Camera className="w-4 h-4 text-white/20" />
                                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Visual Signature</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Style', val: selectedImage.style, icon: Palette },
                                                { label: 'Framing', val: selectedImage.framing, icon: Maximize2 },
                                                { label: 'Tone', val: selectedImage.tone, icon: Sun },
                                                { label: 'Lighting', val: selectedImage.lighting, icon: ImageIcon }
                                            ].map(spec => {
                                                const Icon = spec.icon;
                                                return (
                                                    <div key={spec.label} className="flex flex-col gap-1 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                                        <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{spec.label}</span>
                                                        <span className="text-xs text-white/60 font-medium flex items-center gap-2">
                                                            <Icon className="w-3 h-3 text-[#e9c49a]/40" />
                                                            {spec.val || 'Standard'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-10 flex flex-col gap-4">
                                        <button
                                            onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.title)}
                                            className="w-full group h-16 bg-[#e9c49a] text-black rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_20px_40px_rgba(233,196,154,0.15)] flex items-center justify-center gap-3"
                                        >
                                            <Download className="w-4 h-4" /> Synchronize Artifact
                                        </button>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleShare(selectedImage)}
                                                className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Share2 className="w-4 h-4" /> Transmit
                                            </button>
                                            <button
                                                onClick={() => handleLike(selectedImage)}
                                                className={cn(
                                                    "h-14 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                                    userLikes.includes(selectedImage.id)
                                                        ? "bg-red-500/10 border-red-500/30 text-red-500"
                                                        : "bg-white/5 border-white/10 text-[#e9c49a] hover:bg-[#e9c49a]/10"
                                                )}
                                            >
                                                <Heart className={cn("w-4 h-4", userLikes.includes(selectedImage.id) && "fill-current")} />
                                                {userLikes.includes(selectedImage.id) ? "Archived" : "Archive"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Attribution Footer */}
                                    <div className="pt-10 border-t border-white/5 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Curated By</span>
                                                <span className="text-[10px] text-white/50">{selectedImage.curatedBy || 'Amora Studio'}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Copyright</span>
                                                <span className="text-[10px] text-[#e9c49a]/60">{selectedImage.copyrightStatus || 'Licensed'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
