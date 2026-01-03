
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, getDocs, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Heart, Eye, Play, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useLiteMode } from "@/contexts/LiteModeContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ExploreItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    title: string;
    views: number;
    likes: number;
    creatorName?: string;
}

export default function Explore() {
    const navigate = useNavigate();
    const { isLiteMode, isDataSaver } = useLiteMode();
    const [items, setItems] = useState<ExploreItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExploreContent = async () => {
            try {
                // Increased limit for a more comprehensive explore view
                const maxAssets = isLiteMode ? 12 : 200;

                // Fetch Images 
                const imagesQuery = query(
                    collection(db, "gallery_images"),
                    orderBy("views", "desc"),
                    limit(maxAssets)
                );

                // Fetch Videos 
                const videosQuery = query(
                    collection(db, "gallery_videos"),
                    orderBy("views", "desc"),
                    limit(maxAssets)
                );

                const [imagesSnap, videosSnap] = await Promise.all([
                    getDocs(imagesQuery),
                    getDocs(videosQuery)
                ]);

                const fetchedImages = imagesSnap.docs
                    .map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            type: 'image',
                            url: data.imageUrl,
                            title: data.title,
                            views: data.views || 0,
                            likes: data.likes || 0,
                            creatorName: data.creatorName,
                            inExplore: data.inExplore
                        } as any;
                    })
                    .filter(item => item.inExplore !== false);

                const fetchedVideos = videosSnap.docs
                    .map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            type: 'video',
                            url: data.videoUrl,
                            title: data.title,
                            views: data.views || 0,
                            likes: data.likes || 0,
                            creatorName: data.creatorName,
                            inExplore: data.inExplore
                        } as any;
                    })
                    .filter(item => item.inExplore !== false);

                // Merge and Sort by Views
                const allItems = [...fetchedImages, ...fetchedVideos].sort((a, b) => b.views - a.views);

                setItems(allItems);
            } catch (error: any) {
                console.error("Error fetching explore content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExploreContent();
    }, [isLiteMode]);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 pb-24 md:p-10">
            {/* Header */}
            <header className="mb-10 flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-light">Explore Nexus</h1>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Trending Artifacts</p>
                </div>
            </header>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[9/16] w-full rounded-2xl bg-white/5" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-16 bg-white/5" />
                                <Skeleton className="h-4 w-32 bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(`/view/${item.id}`)}
                            className="relative group rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 cursor-pointer hover:border-[#e9c49a]/30 transition-all aspect-[9/16]"
                        >
                            {/* Media */}
                            {item.type === 'video' ? (
                                <div className="w-full h-full relative">
                                    <video
                                        src={item.url}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        onMouseOver={e => e.currentTarget.play()}
                                        onMouseOut={e => e.currentTarget.pause()}
                                    />
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                                        <Play className="w-3 h-3 text-white" />
                                    </div>

                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    alt={item.title}
                                />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-[10px] text-white/70">
                                            <Eye className="w-3 h-3" /> {item.views}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-[#e9c49a]">
                                            <Heart className="w-3 h-3" /> {item.likes}
                                        </div>
                                    </div>
                                    <Zap className="w-3 h-3 text-[#e9c49a]" />
                                </div>
                                <div className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">{item.creatorName}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
