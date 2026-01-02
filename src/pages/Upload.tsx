import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Film, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle, Crown, Lock } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS, GLOBAL_RULES } from "@/types/plans";

export default function Create() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<'image' | 'video'>('video');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'elite' | 'creator'>('free');
    const [usage, setUsage] = useState({ images: 0, videos: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    // Initial Plan & Stats Check
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                try {
                    // 1. Get Plan
                    const { doc, getDoc } = await import("firebase/firestore");
                    const userDoc = await getDoc(doc(db, "users", authUser.uid));
                    const userData = userDoc.data();
                    const plan = (userData?.plan || 'free') as 'free' | 'pro' | 'elite' | 'creator';
                    setUserPlan(plan);

                    // 2. Check Weekly Usage (Client-side filtering to avoid index issues)
                    const oneWeekAgoMillis = Date.now() - 7 * 24 * 60 * 60 * 1000;

                    const qImages = query(
                        collection(db, "gallery_images"),
                        where("creatorId", "==", authUser.uid)
                    );
                    const qVideos = query(
                        collection(db, "gallery_videos"),
                        where("creatorId", "==", authUser.uid)
                    );

                    const [snapImages, snapVideos] = await Promise.all([getDocs(qImages), getDocs(qVideos)]);

                    const validImages = snapImages.docs.filter(d => {
                        const date = d.data().createdAt?.toMillis?.() || 0;
                        return date >= oneWeekAgoMillis;
                    });

                    const validVideos = snapVideos.docs.filter(d => {
                        const date = d.data().createdAt?.toMillis?.() || 0;
                        return date >= oneWeekAgoMillis;
                    });

                    setUsage({
                        images: validImages.length,
                        videos: validVideos.length
                    });
                } catch (error) {
                    console.error("Error fetching stats:", error);
                } finally {
                    setLoadingStats(false);
                }
            } else {
                setLoadingStats(false);
                // navigate('/login'); // Optional: redirect if forced
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const limits = PLAN_LIMITS[userPlan];

    const isLimitReached = () => {
        if (type === 'image') return usage.images >= limits.imagesPerWeek;
        return usage.videos >= limits.videosPerWeek;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Reset
        setFile(null);

        // 1. Size Check
        const sizeMB = selectedFile.size / (1024 * 1024);
        const limitMB = type === 'image' ? limits.imageSizeMB : limits.videoSizeMB;

        if (sizeMB > limitMB) {
            toast.error(`File Too Large for ${userPlan.toUpperCase()} Plan`, {
                description: `Max size: ${limitMB}MB. Upgrade to verify larger artifacts.`
            });
            return;
        }

        // 2. Video Duration Check
        if (type === 'video') {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function () {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;
                if (duration > GLOBAL_RULES.maxVideoDurationSeconds) {
                    toast.error("Temporal Limit Exceeded", {
                        description: "Maximum video duration is 5 minutes."
                    });
                    setFile(null);
                } else {
                    setFile(selectedFile);
                }
            }
            video.src = URL.createObjectURL(selectedFile);
        } else {
            setFile(selectedFile);
        }
    };

    const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
        // Reuse credential logic (In a real app, move to a utility or backend proxy!)
        const cloudName = 'dwm2smxdk';
        const apiKey = '229614895851864';
        const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

        const encoder = new TextEncoder();
        const data = encoder.encode(paramString);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const resourceType = type === 'image' ? 'image' : 'video';
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            { method: "POST", body: formData }
        );

        if (!response.ok) throw new Error("Cloudinary upload failed");
        const result = await response.json();
        return result.secure_url;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        if (isLimitReached()) {
            navigate('/upgrade');
            return;
        }

        if (!title.trim() || !file) {
            toast.error("Incomplete Data", { description: "Please provide both title and artifact." });
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            // Upload
            setUploadProgress(30);
            const folder = type === 'image' ? 'amora_images' : 'amora_videos';
            const url = await uploadToCloudinary(file, folder);

            setUploadProgress(70);

            // Save to Firestore
            const collectionName = type === 'image' ? "gallery_images" : "gallery_videos";
            await addDoc(collection(db, collectionName), {
                title,
                description: description.trim(),
                [`${type}Url`]: url,
                creatorId: auth.currentUser.uid,
                creatorName: auth.currentUser.displayName || "Unknown Citizen",
                createdAt: serverTimestamp(),
                sizeBytes: file.size,
                planAtUpload: userPlan,
                showWatermark: limits.watermark,
                inExplore: limits.explore, // As per Plan Logic
                views: 0,
                likes: 0
            });

            setUploadProgress(100);
            toast.success("Artifact Uploaded", { description: "Your contribution has been added to the registry." });

            // Redirect to profile
            setTimeout(() => {
                navigate('/profile');
            }, 1000);

        } catch (error: any) {
            console.error(error);
            toast.error("Upload Failed", { description: error.message });
        } finally {
            setUploading(false);
        }
    };

    if (loadingStats) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#e9c49a] animate-spin" />
        </div>;
    }

    const limitReached = isLimitReached();
    const currentLimit = type === 'image' ? limits.imagesPerWeek : limits.videosPerWeek;
    const currentUsage = type === 'image' ? usage.images : usage.videos;
    const remaining = Math.max(0, currentLimit - currentUsage);

    return (
        <div className="min-h-screen bg-[#050505] text-white py-20 px-6">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-display font-light">Upload Artifact</h1>
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border",
                                userPlan === 'free' ? "bg-white/5 border-white/10 text-white/40" : "bg-[#e9c49a]/10 border-[#e9c49a]/20 text-[#e9c49a]"
                            )}>
                                {userPlan} Plan Active
                            </span>
                            {limitReached && (
                                <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold uppercase tracking-widest">
                                    <AlertTriangle className="w-3 h-3" /> Limit Reached
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => { setType('video'); setFile(null); }}
                            className={cn(
                                "px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                type === 'video' ? "bg-[#e9c49a] text-black" : "text-white/40 hover:text-white"
                            )}
                        >
                            Video
                        </button>
                        <button
                            onClick={() => { setType('image'); setFile(null); }}
                            className={cn(
                                "px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                type === 'image' ? "bg-[#e9c49a] text-black" : "text-white/40 hover:text-white"
                            )}
                        >
                            Image
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Upload Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* File Input */}
                            <div className={cn(
                                "relative p-10 rounded-[2.5rem] border-2 border-dashed transition-all group",
                                limitReached ? "border-red-500/20 bg-red-500/5 cursor-not-allowed" :
                                    file ? "border-[#e9c49a]/40 bg-[#e9c49a]/5 cursor-default" : "border-white/10 hover:border-[#e9c49a]/20 hover:bg-white/[0.02] cursor-pointer"
                            )}>
                                {!limitReached && (
                                    <input
                                        type="file"
                                        accept={type === 'image' ? "image/*" : "video/*"}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                )}

                                <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                                    {limitReached ? (
                                        <>
                                            <Lock className="w-12 h-12 text-red-400" />
                                            <div>
                                                <p className="text-lg font-bold text-red-400">Upload Limit Reached</p>
                                                <p className="text-xs text-white/40 mt-1">Upgrade your plan to continue contributing this week.</p>
                                            </div>
                                        </>
                                    ) : file ? (
                                        <>
                                            <CheckCircle2 className="w-12 h-12 text-[#e9c49a]" />
                                            <div>
                                                <p className="text-lg font-bold text-[#e9c49a]">{file.name}</p>
                                                <p className="text-xs text-white/40 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • {type === 'video' ? 'Video' : 'Image'}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {type === 'image' ? <ImageIcon className="w-12 h-12 text-white/20" /> : <Film className="w-12 h-12 text-white/20" />}
                                            <div>
                                                <p className="text-sm font-bold text-white/60">Tap to Select {type === 'image' ? 'Image' : 'Video'}</p>
                                                <p className="text-xs text-white/30 mt-1">
                                                    Max {type === 'image' ? limits.imageSizeMB : limits.videoSizeMB}MB • {type === 'video' ? '< 5 mins' : 'Any Format'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Inputs */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#e9c49a] transition-colors"
                                        placeholder="Artifact Title..."
                                        disabled={uploading || limitReached}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#e9c49a] transition-colors min-h-[100px] resize-none"
                                        placeholder="Contextual data..."
                                        disabled={uploading || limitReached}
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            {limitReached ? (
                                <button
                                    type="button"
                                    onClick={() => navigate('/upgrade')}
                                    className="w-full h-16 rounded-2xl bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                                >
                                    <Crown className="w-5 h-5" /> Upgrade to Pro to Upload
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={uploading || !file || !title.trim()}
                                    className={cn(
                                        "w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all",
                                        uploading || !file || !title.trim()
                                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                                            : "bg-[#e9c49a] text-black hover:bg-white shadow-lg"
                                    )}
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading... {uploadProgress}%</span>
                                    ) : "Upload to Registry"}
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Right: Plan Info */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6 sticky top-24">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#e9c49a]">Your Limits ({userPlan})</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/60">Weekly Images</span>
                                        <span className={usage.images >= limits.imagesPerWeek ? "text-red-400" : "text-white"}>{usage.images} / {limits.imagesPerWeek < 999 ? limits.imagesPerWeek : '∞'}</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#e9c49a]" style={{ width: `${Math.min(100, (usage.images / (limits.imagesPerWeek || 1)) * 100)}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/60">Weekly Videos</span>
                                        <span className={usage.videos >= limits.videosPerWeek ? "text-red-400" : "text-white"}>{usage.videos} / {limits.videosPerWeek < 999 ? limits.videosPerWeek : '∞'}</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#e9c49a]" style={{ width: `${Math.min(100, (usage.videos / (limits.videosPerWeek || 1)) * 100)}%` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-3">
                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Plan Benefits</p>
                                <ul className="space-y-2 text-xs text-white/60">
                                    <li className="flex items-center gap-2">
                                        {limits.watermark ? <AlertTriangle className="w-3 h-3 text-yellow-500" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                        {limits.watermark ? "Watermarked Content" : "No Watermark"}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        {limits.explore ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                                        {limits.explore ? "Visible in Explore" : "Hidden from Explore"}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        Max Video: 5 Minutes
                                    </li>
                                </ul>
                            </div>

                            {userPlan === 'free' && (
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#e9c49a]/20 to-transparent border border-[#e9c49a]/20">
                                    <p className="text-xs font-light text-white/80 italic mb-3">
                                        "Upgrade to Pro to upload 3 more videos this week."
                                    </p>
                                    <button onClick={() => navigate('/upgrade')} className="w-full py-2 bg-[#e9c49a] text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-colors">
                                        Unlock Pro
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
