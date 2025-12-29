import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    Command
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Gallery() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get("search") || "";

    const [userData, setUserData] = useState<any>(null);
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState(urlSearch);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

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

    return (
        <DashboardLayout user={userData}>
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
            </div>

            {/* Lightbox - Side-by-Side Cinematic Control Panel */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/95 backdrop-blur-[60px] p-4 md:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Ambient Background Glow */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <img src={selectedImage.imageUrl} className="w-full h-full object-cover blur-[150px]" alt="" />
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative flex flex-col md:flex-row items-stretch rounded-[4rem] overflow-hidden bg-black/40 border border-white/10 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] max-h-[90vh] max-w-[95vw]"
                        >
                            {/* Left: Artifact Viewport (Vertical 9:16) */}
                            <div className="aspect-[9/16] h-[50vh] md:h-[80vh] relative overflow-hidden group/view bg-black">
                                <img
                                    src={selectedImage.imageUrl}
                                    alt={selectedImage.title}
                                    className="w-full h-full object-cover"
                                />

                                {/* Top Badges over image */}
                                <div className="absolute top-8 left-8 flex items-center gap-3">
                                    <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#e9c49a] animate-pulse" />
                                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/70">Verified Artifact</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white md:hidden"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Right: Directorial Intelligence Panel */}
                            <div className="w-full md:w-[450px] p-10 md:p-14 bg-[#070707] flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5 relative">
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-10 right-10 z-[110] w-12 h-12 rounded-full bg-white/5 border border-white/10 hidden md:flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]/40">Indexing Protocol</span>
                                            <div className="flex-1 h-[1px] bg-white/5" />
                                        </div>

                                        <div className="space-y-3">
                                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                                                {selectedImage.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                            </h2>
                                            <div className="flex items-center gap-8 py-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Resonance</span>
                                                    <div className="flex items-center gap-2 text-white/60 text-xs font-light">
                                                        <Activity className="w-3.5 h-3.5" /> High Alpha
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Session ID</span>
                                                    <div className="flex items-center gap-2 text-white/30 text-xs font-mono">
                                                        #{selectedImage.id.slice(-6).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[10px] uppercase tracking-[0.4em] text-[#e9c49a] font-bold flex items-center gap-3">
                                            Narrative Log
                                        </span>
                                        <p className="text-white/50 text-base md:text-lg font-light italic leading-relaxed font-serif">
                                            "{selectedImage.description}"
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-16 space-y-6">
                                    <button className="w-full group h-16 bg-[#e9c49a] text-black rounded-3xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_20px_40px_rgba(233,196,154,0.15)] flex items-center justify-center gap-3">
                                        <Download className="w-4 h-4" /> Sync Asset to Archive
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                            <Share2 className="w-4 h-4" /> Share
                                        </button>
                                        <button className="h-14 rounded-2xl bg-white/5 border border-white/10 text-[#e9c49a] font-bold text-[10px] uppercase tracking-widest hover:bg-[#e9c49a]/10 transition-all flex items-center justify-center gap-2">
                                            <Heart className="w-4 h-4" /> Archive
                                        </button>
                                    </div>

                                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative mt-8">
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "100%" }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e9c49a]/30 to-transparent w-2/3"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
