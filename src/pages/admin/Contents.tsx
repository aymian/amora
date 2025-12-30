import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Filter,
    Image as ImageIcon,
    Video,
    MoreVertical,
    Trash2,
    Eye,
    Plus,
    LayoutGrid,
    List,
    ChevronRight,
    Loader2,
    ArrowLeft,
    Sparkles,
    Activity,
    Database,
    Cloud
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Artifact {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    publicId?: string;
    type: 'image' | 'video';
    createdAt: any;
}

export default function Contents() {
    const navigate = useNavigate();
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');

    useEffect(() => {
        fetchArtifacts();
    }, []);

    const fetchArtifacts = async () => {
        setLoading(true);
        try {
            // 1. Fetch Archives without strict orderBy to avoid index requirement failures
            const imagesSnap = await getDocs(query(collection(db, "gallery_images")));
            const videosSnap = await getDocs(query(collection(db, "gallery_videos")));

            const images = imagesSnap.docs.map(doc => ({
                ...doc.data(),
                id: doc.id, // Actual Firestore Document ID for deletion
                type: 'image'
            })) as Artifact[];

            let videos = videosSnap.docs.map(doc => ({
                ...doc.data(),
                id: doc.id, // Actual Firestore Document ID for deletion
                type: 'video'
            })) as Artifact[];

            // 2. Hero Fallback: If no videos in Archive, pull the current global hero
            if (videos.length === 0) {
                const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                if (heroDoc.exists()) {
                    const data = heroDoc.data();
                    videos = [{
                        ...data, // Spread existing data first
                        id: "hero", // Special ID to identify the site_content doc
                        title: data.title || "Current Hero",
                        description: data.description || "Active sequence",
                        videoUrl: data.videoUrl,
                        publicId: data.publicId, // Ensure publicId is included
                        imageUrl: data.imageUrl || (data.videoUrl ? data.videoUrl.replace(/\.[^/.]+$/, ".jpg") : undefined),
                        type: 'video',
                        createdAt: data.updatedAt ? { seconds: new Date(data.updatedAt).getTime() / 1000 } : null
                    }] as Artifact[];
                }
            }

            // 3. Resilient Client-side Sort
            const all = [...images, ...videos].sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setArtifacts(all);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to synchronize with archival index");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (artifact: Artifact) => {
        if (!window.confirm(`Are you sure you want to de-index ${artifact.title.toLowerCase()}? This will permanently remove it from the cloud and database.`)) return;

        const loadingToast = toast.loading(`Terminating ${artifact.type} resource...`);

        try {
            // 1. Cloudinary Termination Sequence
            const cloudName = 'dwm2smxdk';
            const apiKey = '229614895851864';
            const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';

            let publicId = artifact.publicId;

            // Fallback: If publicId is missing (legacy), try to extract it from URL
            if (!publicId) {
                const url = artifact.videoUrl || artifact.imageUrl;
                if (url && url.includes('cloudinary.com')) {
                    const parts = url.split('/');
                    const filename = parts[parts.length - 1].split('.')[0];
                    const folder = parts[parts.length - 2];
                    // Common folders: amora_cinematics, amora_gallery
                    if (folder === 'amora_cinematics' || folder === 'amora_gallery') {
                        publicId = `${folder}/${filename}`;
                    } else {
                        publicId = filename;
                    }
                }
            }

            if (publicId && !artifact.id.includes('main-hero')) {
                const timestamp = Math.round(new Date().getTime() / 1000);
                const paramString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

                const encoder = new TextEncoder();
                const data = encoder.encode(paramString);
                const hashBuffer = await crypto.subtle.digest('SHA-1', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                const formData = new FormData();
                formData.append('public_id', publicId);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);

                const cldResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${artifact.type}/destroy`, {
                    method: 'POST',
                    body: formData
                });

                if (!cldResponse.ok) {
                    console.error("Cloudinary purge failed, but proceeding with database de-indexing.");
                }
            }

            // 2. Database De-indexing
            if (artifact.id === "hero") {
                // If it's the site_content hero doc
                await deleteDoc(doc(db, "site_content", "hero"));
            } else {
                const collectionName = artifact.type === 'image' ? 'gallery_images' : 'gallery_videos';
                await deleteDoc(doc(db, collectionName, artifact.id));

                // Also check if this artifact is currently set as the hero by checking ID parity
                const heroDoc = await getDoc(doc(db, "site_content", "hero"));
                if (heroDoc.exists() && (heroDoc.data().id === artifact.id || heroDoc.data().videoUrl === artifact.videoUrl)) {
                    await deleteDoc(doc(db, "site_content", "hero"));
                }
            }

            setArtifacts(prev => prev.filter(a => a.id !== artifact.id));
            toast.dismiss(loadingToast);
            toast.success("Artifact terminated and de-indexed successfully");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Protocol violation: Failed to terminate artifact");
        }
    };

    const filteredArtifacts = artifacts.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || a.type === filterType;
        return matchesSearch && matchesType;
    });

    const suggestions = artifacts
        .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8">
                <div className="w-20 h-20 border-[3px] border-[#e9c49a]/5 border-t-[#e9c49a] rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-[#e9c49a] font-bold animate-pulse">Accessing Archival Vault</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 lg:p-20">
            {/* Header & Stats */}
            <header className="mb-16 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <button onClick={() => navigate('/manager/nexus')} className="flex items-center gap-3 text-white/40 hover:text-[#e9c49a] transition-all group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Return to Nexus</span>
                        </button>
                        <h1 className="text-4xl md:text-6xl font-display font-light tracking-tight">Archives <span className="text-[#e9c49a] italic">Index</span></h1>
                        <p className="text-white/30 text-sm max-w-xl font-light">
                            Manage the planetary visual registry. Synchronize, de-index, and audit all cinematic and visual artifacts from the Amora deep space.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => navigate('/manager/image-upload')}
                            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-[#e9c49a] transition-all shadow-xl active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> New Image
                        </button>
                        <button
                            onClick={() => navigate('/manager/upload')}
                            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-[#e9c49a]/10 border border-[#e9c49a]/20 text-[#e9c49a] text-[11px] font-bold uppercase tracking-widest hover:bg-[#e9c49a]/20 transition-all active:scale-95"
                        >
                            <Video className="w-4 h-4" /> New Cinematic
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: "Total Artifacts", value: artifacts.length, icon: Database, color: "text-[#e9c49a]" },
                        { label: "Visual Registry", value: artifacts.filter(a => a.type === 'image').length, icon: ImageIcon, color: "text-blue-400" },
                        { label: "Cinematic Core", value: artifacts.filter(a => a.type === 'video').length, icon: Video, color: "text-purple-400" }
                    ].map((metric, i) => (
                        <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold">{metric.label}</p>
                                <p className={cn("text-3xl font-display font-light", metric.color)}>{metric.value}</p>
                            </div>
                            <metric.icon className={cn("w-8 h-8 opacity-10 group-hover:opacity-30 transition-opacity", metric.color)} />
                        </div>
                    ))}
                </div>
            </header>

            {/* Control Bar & Sidebar Autocomplete */}
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 mb-12">
                <div className="flex-1 space-y-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Autocomplete Search Bar */}
                        <div className="relative flex-1 group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                                <Search className="w-5 h-5 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search the archival frequency..."
                                className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-[2rem] pl-16 pr-8 text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* Autocomplete Dropdown */}
                            <AnimatePresence>
                                {searchQuery.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-20 left-0 right-0 z-50 p-4 rounded-3xl bg-[#0D121F] border border-white/10 shadow-2xl backdrop-blur-3xl"
                                    >
                                        <p className="px-4 py-2 text-[9px] uppercase tracking-widest text-[#e9c49a]/40 font-bold">Resonance Matches</p>
                                        <div className="space-y-1 pt-2">
                                            {suggestions.length > 0 ? suggestions.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setSearchQuery(s.title)}
                                                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-left group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-black overflow-hidden border border-white/5">
                                                        <img src={s.imageUrl || '/video-placeholder.jpg'} className="w-full h-full object-cover opacity-60" alt="" />
                                                    </div>
                                                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                                                        {s.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                                    </span>
                                                </button>
                                            )) : (
                                                <p className="px-4 py-3 text-xs text-white/20 italic">No resonance detected</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Filter Switches */}
                        <div className="flex items-center p-2 rounded-2xl bg-white/[0.03] border border-white/5">
                            {(['all', 'image', 'video'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all",
                                        filterType === t ? "bg-[#e9c49a] text-black" : "text-white/30 hover:text-white"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.03] border border-white/5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-3 rounded-xl transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/20")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-white/20")}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Artifact Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredArtifacts.map((art, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                key={art.id}
                                className="group relative rounded-[2.5rem] overflow-hidden bg-black border border-white/5 hover:border-[#e9c49a]/20 transition-all duration-500 shadow-2xl"
                            >
                                <div className="aspect-[4/5] relative overflow-hidden">
                                    <img
                                        src={art.imageUrl}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        alt={art.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                    {/* Type Badge */}
                                    <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                        {art.type === 'video' ? <Video className="w-3 h-3 text-[#e9c49a]" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                                        <span className="text-[9px] uppercase tracking-widest font-bold text-white/60">{art.type}</span>
                                    </div>

                                    {/* Actions Overlay */}
                                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        <button
                                            onClick={() => art.type === 'video' ? navigate(`/watch?name=${encodeURIComponent(art.title)}&id=${art.id}`) : navigate(`/images`)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-black hover:bg-[#e9c49a] transition-all shadow-xl"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(art)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-xl backdrop-blur-md"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-8 space-y-3 bg-[#0a0a0a]">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold tracking-tight text-white/80 group-hover:text-white transition-colors truncate">
                                            {art.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                        </h3>
                                        <MoreVertical className="w-4 h-4 text-white/10" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#e9c49a]/30 font-bold">
                                        <Sparkles className="w-3 h-3" /> synced_{art.id.slice(-6).toLowerCase()}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredArtifacts.map((art) => (
                        <div key={art.id} className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-6 group hover:bg-white/[0.05] transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-black overflow-hidden border border-white/10">
                                <img src={art.imageUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-white group-hover:text-[#e9c49a] transition-colors">
                                    {art.title.toLowerCase().replace(/\s+/g, '_')}.artifact
                                </h4>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Indexed Dec 2025 // resonance_alpha</p>
                            </div>
                            <div className="hidden md:flex items-center gap-8 px-8">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Source</span>
                                    <span className="text-[10px] text-[#e9c49a] font-mono flex items-center gap-2">
                                        <Cloud className="w-3 h-3" /> CLOUDINARY_SYNC
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Resonance</span>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map(dot => <div key={dot} className={cn("w-1 h-1 rounded-full", dot < 4 ? "bg-[#e9c49a]" : "bg-white/10")} />)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDelete(art)}
                                    className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group/del"
                                >
                                    <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />
                                </button>
                                <button className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredArtifacts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 space-y-8">
                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-white/10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-light text-white/40">Zero Resonance Detected</h3>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/10 font-bold">The archival frequency is empty</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const tableHeaderClass = "text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold py-4 px-6 text-left";
