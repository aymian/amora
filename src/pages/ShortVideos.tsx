import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    Play,
    Filter,
    ChevronDown,
    Sparkles,
    Activity,
    Video,
    LayoutGrid,
    MoreHorizontal,
    Heart,
    Share2,
    Calendar,
    ArrowLeft
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface VideoArtifact {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    imageUrl: string;
    createdAt: any;
}

export default function ShortVideos() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQueryParam = searchParams.get("search") || "";

    const [videos, setVideos] = useState<VideoArtifact[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchQueryParam);
    const [localSuggestions, setLocalSuggestions] = useState<VideoArtifact[]>([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            try {
                if (user) {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        setUserData({ fullName: "Explorer", plan: "free" });
                    }
                    await fetchVideos();
                } else {
                    navigate("/login");
                }
            } catch (err) {
                console.error("Auth sync error:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        setSearchQuery(searchQueryParam);
    }, [searchQueryParam]);

    const fetchVideos = async () => {
        try {
            // 1. Fetch from the dedicated cinematic archive
            const q = query(collection(db, "gallery_videos"));
            const querySnapshot = await getDocs(q);
            let videoData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VideoArtifact[];

            // 2. Fallback: If archive is empty, check for the current global hero
            if (videoData.length === 0) {
                const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                if (heroDoc.exists()) {
                    const data = heroDoc.data();
                    videoData = [{
                        id: data.id || "current-hero",
                        title: data.title || "Current Hero Sequence",
                        description: data.description || "Active global hero cinematic",
                        videoUrl: data.videoUrl,
                        imageUrl: data.imageUrl || data.videoUrl.replace(/\.[^/.]+$/, ".jpg"),
                        createdAt: data.updatedAt ? { seconds: new Date(data.updatedAt).getTime() / 1000 } : null
                    }] as VideoArtifact[];
                }
            }

            // 3. Client-side Sort (Resilient to missing timestamps)
            const sorted = videoData.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setVideos(sorted);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };
    // Filter logic
    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setLocalSuggestions([]);
        } else {
            const suggestions = videos
                .filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5);
            setLocalSuggestions(suggestions);
        }
    }, [searchQuery, videos]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/short-videos?search=${searchQuery}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold animate-pulse">Scanning Frequencies...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout user={userData}>
            <div className="px-6 md:px-12 py-12 space-y-16">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[#e9c49a]/40">
                            <Video className="w-5 h-5 font-bold" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Archives // Cinematic</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-light text-white tracking-tight leading-tight">
                            Hero <span className="text-[#e9c49a] italic">Reflections</span>
                        </h1>
                        <p className="max-w-xl text-white/40 text-sm font-light leading-relaxed">
                            A curated feed of all global hero sequences. Synchronized artifacts from the Amora deep space, indexed for permanent archival discovery.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter cinematic artifacts..."
                                className="w-full md:w-96 bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                            />

                            <AnimatePresence>
                                {localSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-4 z-[60] p-4 rounded-3xl bg-[#0D121F] border border-white/10 shadow-2xl backdrop-blur-3xl"
                                    >
                                        <p className="px-4 py-2 text-[8px] uppercase tracking-widest text-[#e9c49a]/40 font-bold">Cinematic Resonance</p>
                                        <div className="space-y-1 pt-2">
                                            {localSuggestions.map(v => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => {
                                                        setSearchQuery(v.title);
                                                        setLocalSuggestions([]);
                                                        navigate(`/short-videos?search=${v.title}`);
                                                    }}
                                                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-black overflow-hidden border border-white/5 relative">
                                                        <img src={v.imageUrl || v.videoUrl.replace(/\.[^/.]+$/, ".jpg")} className="w-full h-full object-cover opacity-60" alt="" />
                                                        <Play className="absolute inset-0 m-auto w-3 h-3 text-white opacity-40" />
                                                    </div>
                                                    <span className="text-sm text-white/60">
                                                        {v.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </header>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredVideos.map((video, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={video.id}
                                onClick={() => navigate(`/watch?id=${video.id}`)}
                                className="group relative rounded-[2.5rem] overflow-hidden bg-black border border-white/5 hover:border-[#e9c49a]/20 transition-all duration-700 cursor-pointer shadow-2xl"
                            >
                                <div className="aspect-[16/9] relative overflow-hidden bg-white/[0.02]">
                                    <img
                                        src={video.imageUrl || video.videoUrl.replace(/\.[^/.]+$/, ".jpg")}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100"
                                        alt={video.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150 group-hover:scale-100">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                                        </div>
                                    </div>

                                    <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-[#e9c49a]" />
                                        <span className="text-[9px] uppercase tracking-widest font-bold text-white/50 group-hover:text-[#e9c49a] transition-colors duration-500">Hero Seq</span>
                                    </div>
                                </div>

                                <div className="p-8 space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold tracking-tight text-white group-hover:text-[#e9c49a] transition-colors duration-500 truncate">
                                            {video.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                        </h3>
                                        <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-white/20 font-bold">
                                            <Activity className="w-3 h-3" /> synced_{video.id.slice(-6).toLowerCase()}
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-white/40 font-light leading-relaxed line-clamp-2 italic">
                                        "{video.description}"
                                    </p>

                                    <div className="pt-4 flex items-center justify-between border-t border-white/5 text-white/20">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[8px] uppercase font-bold tracking-widest">Dec 28, 2025</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Heart className="w-4 h-4 hover:text-[#e9c49a] transition-colors" />
                                            <Share2 className="w-4 h-4 hover:text-[#e9c49a] transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredVideos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 space-y-8">
                        <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center animate-pulse">
                            <Activity className="w-8 h-8 text-white/10" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-light text-white/40">Zero Resonance Detected</h3>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/10 font-bold">The cinematic archives are silent</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
