
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { ArrowLeft, Share2, Heart, Download, Eye, Calendar, Sparkles, User, Shield, ThumbsDown, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ViewArtifact() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [artifact, setArtifact] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [collectionName, setCollectionName] = useState<string>("");
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [creatorUsername, setCreatorUsername] = useState<string>("");

    useEffect(() => {
        const fetchArtifact = async () => {
            if (!id) return;

            try {
                // Determine collection and fetch
                let col = "gallery_images";
                let docSnap = await getDoc(doc(db, col, id));

                if (!docSnap.exists()) {
                    col = "gallery_videos";
                    docSnap = await getDoc(doc(db, col, id));
                }
                if (!docSnap.exists()) {
                    col = "shorts";
                    docSnap = await getDoc(doc(db, col, id));
                }

                if (docSnap.exists()) {
                    const docData = docSnap.data();
                    setArtifact({ id: docSnap.id, ...docData });
                    setCollectionName(col);

                    // Fetch Creator Username
                    if (docData.creatorId) {
                        getDoc(doc(db, "users", docData.creatorId)).then(uSnap => {
                            if (uSnap.exists()) setCreatorUsername(uSnap.data().username || "");
                        });
                    }

                    // Check user interaction state if logged in
                    if (auth.currentUser) {
                        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
                        if (userSnap.exists()) {
                            const data = userSnap.data();
                            setIsLiked(data.likedGalleryImages?.includes(id) || data.likedGalleryVideos?.includes(id) || false);
                            setIsSaved(data.savedArtifacts?.includes(id) || false);
                            // Assuming we might add disliked array or just local toggle for now if not in schema
                            // For this feature request, we'll manage local state + backend update logic assuming fields exist or we create them
                            setIsDisliked(data.dislikedArtifacts?.includes(id) || false);
                        }
                    }


                    // Increment View Count (Once per session)
                    const viewKey = `viewed_artifact_${id}`;
                    if (!sessionStorage.getItem(viewKey)) {
                        updateDoc(doc(db, col, id), { views: increment(1) }).catch(console.error);
                        sessionStorage.setItem(viewKey, "true");
                    }
                } else {
                    toast.error("Artifact not found.");
                    navigate('/profile');
                }
            } catch (error) {
                console.error("Error fetching artifact:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtifact();
    }, [id, navigate]);

    const handleLike = async () => {
        if (!auth.currentUser || !artifact || !collectionName) {
            toast.error("Authentication required.");
            return;
        }

        // Optimistic UI
        const newLikeState = !isLiked;
        setIsLiked(newLikeState);
        if (newLikeState && isDisliked) setIsDisliked(false); // Remove dislike if liking

        try {
            const artifactRef = doc(db, collectionName, artifact.id);
            const userRef = doc(db, "users", auth.currentUser.uid);

            // Update artifact count
            await updateDoc(artifactRef, {
                likes: increment(newLikeState ? 1 : -1)
            });

            // Update user profile (different fields for images vs videos usually, or unified. 
            // Based on Gallery.tsx, it uses 'likedGalleryImages'. We'll try to be smart or generic.)
            const userField = collectionName === 'gallery_images' ? 'likedGalleryImages' : 'likedGalleryVideos';

            await updateDoc(userRef, {
                [userField]: newLikeState ? arrayUnion(artifact.id) : arrayRemove(artifact.id),
                dislikedArtifacts: arrayRemove(artifact.id) // Ensure dislike is removed
            });

            // Update local artifact state count
            setArtifact((prev: any) => ({
                ...prev,
                likes: (prev.likes || 0) + (newLikeState ? 1 : -1)
            }));

            toast.success(newLikeState ? "Resonance Established" : "Resonance Faded");

        } catch (error) {
            console.error(error);
            setIsLiked(!newLikeState); // Revert
            toast.error("Action failed");
        }
    };

    const handleDislike = async () => {
        if (!auth.currentUser || !artifact || !collectionName) return;

        const newDislikeState = !isDisliked;
        setIsDisliked(newDislikeState);
        if (newDislikeState && isLiked) {
            setIsLiked(false);
            // Decrement like count since we are removing the like
            setArtifact((prev: any) => ({ ...prev, likes: Math.max(0, (prev.likes || 1) - 1) }));
        }

        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            const artifactRef = doc(db, collectionName, artifact.id);

            // If we were liking, we need to remove the like from DB too
            if (isLiked) {
                await updateDoc(artifactRef, { likes: increment(-1) });
                const userField = collectionName === 'gallery_images' ? 'likedGalleryImages' : 'likedGalleryVideos';
                await updateDoc(userRef, { [userField]: arrayRemove(artifact.id) });
            }

            await updateDoc(userRef, {
                dislikedArtifacts: newDislikeState ? arrayUnion(artifact.id) : arrayRemove(artifact.id)
            });

            if (newDislikeState) toast.info("Dissonance Recorded");

        } catch (error) {
            console.error(error);
            setIsDisliked(!newDislikeState);
        }
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;
        const newState = !isSaved;
        setIsSaved(newState);

        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                savedArtifacts: newState ? arrayUnion(artifact.id) : arrayRemove(artifact.id)
            });
            toast.success(newState ? "Artifact Saved to Collection" : "Artifact Removed from Collection");
        } catch (err) {
            setIsSaved(!newState);
            toast.error("Save failed");
        }
    };

    const handleDownload = async () => {
        toast.info("Initializing download sequence...");
        try {
            const url = artifact.imageUrl || artifact.videoUrl;
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `amora_artifact_${artifact.title.replace(/\s+/g, '_')}.${collectionName.includes('video') ? 'mp4' : 'jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("Download Complete");
        } catch (error) {
            console.error(error);
            toast.error("Download failed", { description: "Opening in new tab instead." });
            window.open(artifact.imageUrl || artifact.videoUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
            </div>
        );
    }

    if (!artifact) return null;

    const url = artifact.imageUrl || artifact.videoUrl;
    const isVideo = collectionName.includes('video') || !!artifact.videoUrl;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Header / Nav */}
            <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#e9c49a] hover:text-black transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="pointer-events-auto flex gap-4">
                    <button className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#e9c49a] hover:bg-white/10 transition-colors">
                        {artifact.planAtUpload || 'FREE'} PROTOCOL
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row h-screen">

                {/* Visual Stage (Left/Top) */}
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    {/* Immersive Background Blur */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        {isVideo ? (
                            <video src={url} className="w-full h-full object-cover blur-[100px]" muted loop autoPlay />
                        ) : (
                            <img src={url} className="w-full h-full object-cover blur-[100px]" alt="" />
                        )}
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <div className="relative z-10 w-full h-full max-w-6xl max-h-screen p-4 lg:p-20 flex items-center justify-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className={cn(
                                "relative rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10 bg-[#0a0a0a]",
                                isVideo ? "aspect-video w-full" : "max-h-full max-w-full"
                            )}
                        >
                            {isVideo ? (
                                <video
                                    src={url}
                                    controls
                                    className="w-full h-full object-contain"
                                    autoPlay
                                    loop
                                />
                            ) : (
                                <img
                                    src={url}
                                    alt={artifact.title}
                                    className="w-full h-full object-contain max-h-[85vh]"
                                />
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Info Panel (Right/Bottom) */}
                <div className="w-full lg:w-[480px] bg-[#080808] border-l border-white/5 flex flex-col h-[50vh] lg:h-auto overflow-y-auto custom-scrollbar relative z-20">

                    <div className="p-10 space-y-10">
                        {/* Title & User */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-[#e9c49a]" />
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Artifact Details</span>
                                </div>
                                <h1 className="text-4xl font-display font-light leading-tight">
                                    {artifact.title || "Untitled Artifact"}
                                </h1>
                            </div>

                            <div
                                onClick={() => {
                                    if (creatorUsername) navigate(`/@${creatorUsername}`);
                                }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all group/creator",
                                    creatorUsername ? "cursor-pointer hover:bg-white/10 hover:scale-[1.02]" : ""
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#e9c49a] to-orange-500 flex items-center justify-center text-black font-bold text-xs overflow-hidden">
                                    {/* Try to show avatar if available in the future, for now initial */}
                                    {artifact.creatorName?.[0] || <User className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white group-hover/creator:text-[#e9c49a] transition-colors">{artifact.creatorName || "Unknown Creator"}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                        {creatorUsername ? `@${creatorUsername}` : `ID: ${artifact.creatorId?.slice(0, 8)}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest text-[#e9c49a] font-bold border-b border-[#e9c49a]/20 pb-2 inline-block">Narrative</h3>
                            <p className="text-sm font-light text-white/60 leading-relaxed font-sans">
                                {artifact.description || "No narrative data provided for this artifact."}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 items-center justify-center text-center">
                                <Heart className={cn("w-5 h-5 mb-1", isLiked ? "text-red-500 fill-red-500" : "text-white/40")} />
                                <span className="font-display text-lg">{artifact.likes || 0}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 items-center justify-center text-center">
                                <Eye className="w-5 h-5 mb-1 text-blue-400" />
                                <span className="font-display text-lg">{artifact.views || 0}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 items-center justify-center text-center">
                                <Calendar className="w-5 h-5 mb-1 text-white/40" />
                                <span className="text-[10px] font-mono text-white/60">{artifact.createdAt?.toDate?.().toLocaleDateString() || "N/A"}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 items-center justify-center text-center">
                                <Shield className="w-5 h-5 mb-1 text-white/40" />
                                <span className="text-[10px] font-mono text-white/60">{(artifact.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                        </div>

                        {/* Interactive Actions */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleLike}
                                    className={cn(
                                        "h-14 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all border",
                                        isLiked
                                            ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
                                            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} /> {isLiked ? 'Liked' : 'Like'}
                                </button>
                                <button
                                    onClick={handleDislike}
                                    className={cn(
                                        "h-14 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all border",
                                        isDisliked
                                            ? "bg-white/10 border-white/30 text-white"
                                            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <ThumbsDown className={cn("w-4 h-4", isDisliked && "fill-current")} /> Dislike
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleSave}
                                    className={cn(
                                        "h-14 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all border",
                                        isSaved
                                            ? "bg-[#e9c49a]/10 border-[#e9c49a]/50 text-[#e9c49a]"
                                            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} /> {isSaved ? 'Saved' : 'Save'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="h-14 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Decorative Footer */}
                    <div className="mt-auto p-10 border-t border-white/5 opacity-30 pointer-events-none">
                        <div className="text-[100px] font-display font-black text-white/5 leading-none absolute bottom-0 right-0 -mr-10 -mb-10 selection:bg-transparent">
                            AMR
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
