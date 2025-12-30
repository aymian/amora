import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Upload,
    Film,
    Image as ImageIcon,
    Type,
    FileText,
    Hash,
    Tag,
    Eye,
    Layers,
    Globe,
    CheckCircle2,
    Loader2,
    X,
    Play,
    Clock,
    ArrowLeft,
    Trash2,
    Save,
    Send,
    RotateCcw,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOOD_CATEGORIES = [
    {
        name: "Core Emotional Moods",
        moods: ["Happy", "Sad", "Heartbroken", "In Love", "Lonely", "Emotional", "Calm", "Peaceful", "Hopeful", "Motivated", "Confident", "Inspired", "Grateful", "Joyful", "Overwhelmed", "Confused", "Anxious", "Healing", "Comforting", "Warm", "Soft Feelings"]
    },
    {
        name: "Energy-Based & Time Moods",
        moods: ["Chill", "Relaxing", "Late Night", "Morning Vibes", "Night Vibes", "Sunset Mood", "Rainy Day", "Focus", "Sleepy", "Deep Thinking", "Slow Vibes", "High Energy", "Low Energy", "Fresh Start", "Weekend Mood", "After Midnight", "Quiet Time"]
    },
    {
        name: "Entertainment & Lifestyle",
        moods: ["Funny", "Comedy", "Cute", "Aesthetic", "Romantic", "Story Time", "POV", "Vlogs", "Fashion", "Beauty", "Fitness", "Travel", "Daily Life", "Glow Up", "Self Care", "Luxury Life", "Minimal Life", "Urban Life", "Creative Life"]
    },
    {
        name: "Dark / Intense / Real Emotions",
        moods: ["Toxic", "Savage", "Dark", "Pain", "Regret", "Revenge", "Reality", "Life Lessons", "Broken Trust", "Betrayal", "Jealousy", "Inner Battles", "Loneliness at Night", "Silent Pain", "Crying Inside", "Cold Love", "Harsh Truth", "Unspoken Words"]
    },
    {
        name: "Love, Relationships & Human Connection",
        moods: ["First Love", "True Love", "Real Love", "One-Sided Love", "Long Distance", "Missing You", "Breakup", "Moving On", "Love & Pain", "Dating Stories", "Relationship Advice", "Couple Goals", "Marriage Talks", "Love Confessions", "Love Letters", "Love After Pain", "Healing Love"]
    },
    {
        name: "Motivation, Growth & Mindset",
        moods: ["Self Growth", "Discipline", "Mindset", "Never Give Up", "Hustle", "Dream Big", "Life Advice", "Mental Strength", "Focus on Yourself", "Be Better", "No Excuses", "Winning Mindset", "Silent Work", "Success Journey", "Rise Again"]
    },
    {
        name: "Music & Sound-Based Moods",
        moods: ["Gospel", "Worship", "Praise", "Afrobeat", "Hip-Hop", "Drill", "R&B", "Love Songs", "Sad Songs", "Breakup Songs", "Instrumental", "Lo-Fi", "Acoustic", "Chill Beats", "Deep Beats", "Night Beats", "Motivation Beats"]
    },
    {
        name: "Adult (17+ but Safe)",
        moods: ["Mature Talks", "Real Conversations", "Relationship Reality", "Love Psychology", "Emotional Intelligence", "Dating Stories", "Understanding Women", "Understanding Men", "Boundaries", "Respect in Love", "Hard Truths About Love"]
    },
    {
        name: "Visual & Aesthetic Feelings",
        moods: ["Cinematic", "Slow Motion", "Moody Lighting", "Soft Lights", "Dark Tones", "Warm Colors", "Cold Colors", "Minimal", "Dreamy", "Vintage", "Modern", "Artistic", "Clean Visual"]
    }
];

const CATEGORIES = [
    "Short Story (≤105 min)", "Emotional Video", "POV Story",
    "Visual Story", "Music Story", "Silent Emotion"
];

const LANGUAGES = ["English", "Kinyarwanda", "Swahili", "Mixed", "No Dialog"];

export default function MoodsUpload() {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Form State
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [visibility, setVisibility] = useState("Public");
    const [priority, setPriority] = useState(5);
    const [language, setLanguage] = useState("English");

    // Preview URLs
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            setThumbPreview(URL.createObjectURL(file));
        }
    };

    const toggleMood = (mood: string) => {
        if (selectedMoods.includes(mood)) {
            setSelectedMoods(prev => prev.filter(m => m !== mood));
        } else if (selectedMoods.length < 3) {
            setSelectedMoods(prev => [...prev, mood]);
        } else {
            toast.error("Limit Reached", { description: "Maximum 3 moods allowed." });
        }
    };

    const resetForm = () => {
        setVideoFile(null);
        setThumbnailFile(null);
        setTitle("");
        setDescription("");
        setSelectedMoods([]);
        setVideoPreview(null);
        setThumbPreview(null);
        setProgress(0);
        setUploading(false);
    };

    const uploadToCloudinary = async (file: File, type: 'video' | 'image'): Promise<string> => {
        const cloudName = 'dwm2smxdk';
        const apiKey = '229614895851864';
        const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';
        const timestamp = Math.round(new Date().getTime() / 1000);

        const folder = type === 'video' ? 'amora_moods_videos' : 'amora_moods_thumbs';
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

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
            { method: "POST", body: formData }
        );

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Cloudinary upload failed");
        }

        const result = await response.json();
        return result.secure_url;
    };

    const handleSubmit = async (isDraft = false) => {
        if (!videoFile || !title || !description || selectedMoods.length === 0 || !thumbnailFile) {
            toast.error("Missing Data", { description: "Please complete all required fields." });
            return;
        }

        setUploading(true);
        setProgress(10);

        try {
            // 1. Upload Thumbnail
            setProgress(30);
            const thumbUrl = await uploadToCloudinary(thumbnailFile, 'image');

            // 2. Upload Video
            setProgress(50);
            const videoUrl = await uploadToCloudinary(videoFile, 'video');

            setProgress(80);

            // 3. Save to Firestore
            const assetId = `mood-${Math.random().toString(36).substr(2, 9)}`;
            await setDoc(doc(db, "mood_content", assetId), {
                id: assetId,
                title,
                description,
                videoUrl,
                thumbnailUrl: thumbUrl,
                moods: selectedMoods,
                category,
                visibility: isDraft ? "Draft" : visibility,
                priority,
                language,
                status: isDraft ? "draft" : "published",
                createdBy: auth.currentUser?.uid,
                createdAt: serverTimestamp(),
                metadata: {
                    type: videoFile.type,
                    size: videoFile.size,
                    uploadDate: new Date().toISOString()
                }
            });

            setProgress(100);
            toast.success(isDraft ? "Draft Saved" : "Artifact Published", {
                description: "Your cinematic frequency has been archived."
            });

            setTimeout(() => navigate("/manager/nexus"), 1500);

        } catch (error: any) {
            console.error(error);
            toast.error("Upload Interrupted", { description: error.message });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Top Admin Navbar */}
            <nav className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-display font-light tracking-tight">Mood Architecture</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold">Content Ingestion Protocol</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end px-4 border-r border-white/10">
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">System Status</span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase">Optimal Resonance</span>
                    </div>
                    <button
                        onClick={() => resetForm()}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        title="Reset Form"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={uploading}
                        className="px-6 h-11 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        <Save className="w-4 h-4 inline-block mr-2" /> Save Draft
                    </button>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={uploading}
                        className="px-8 h-11 rounded-xl bg-[#e9c49a] text-black text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(233,196,154,0.2)]"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 inline-block mr-2" />}
                        {uploading ? `Ingesting ${progress}%` : "Publish to Moods"}
                    </button>
                </div>
            </nav>

            <div className="max-w-[1600px] mx-auto p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Upload Form (Left/Center) */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Progress Bar */}
                    <AnimatePresence>
                        {uploading && (
                            <motion.div
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                exit={{ opacity: 0, scaleY: 0 }}
                                className="p-8 rounded-[2.5rem] bg-[#e9c49a]/5 border border-[#e9c49a]/20 space-y-4"
                            >
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-[#e9c49a]">
                                    <span>Transmitting Artifact to Cloudinary...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[#e9c49a] shadow-[0_0_20px_#e9c49a]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Video Upload Field */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black flex items-center gap-3">
                                <Film className="w-4 h-4" /> 1. Video Artifact (REQUIRED)
                            </label>
                            <div
                                onClick={() => videoInputRef.current?.click()}
                                className={cn(
                                    "aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all cursor-pointer group hover:bg-white/[0.02]",
                                    videoFile ? "border-[#e9c49a]/40 bg-[#e9c49a]/5" : "border-white/10"
                                )}
                            >
                                <input type="file" ref={videoInputRef} onChange={handleVideoChange} accept="video/*" className="hidden" />
                                {videoPreview ? (
                                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-3xl">
                                        <video src={videoPreview} className="max-h-full" muted />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Replace Artifact</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-white/20 mb-4 group-hover:text-[#e9c49a] transition-all" />
                                        <span className="text-xs font-bold text-white/60">Upload 4K Video</span>
                                        <span className="text-[9px] text-white/20 uppercase mt-2 tracking-widest">Max duration: 105 mins</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Upload Field */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black flex items-center gap-3">
                                <ImageIcon className="w-4 h-4" /> 6. Vertical Thumbnail (REQUIRED)
                            </label>
                            <div
                                onClick={() => thumbInputRef.current?.click()}
                                className={cn(
                                    "aspect-[9/16] h-[340px] mx-auto rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all cursor-pointer group hover:bg-white/[0.02]",
                                    thumbnailFile ? "border-[#e9c49a]/40 bg-[#e9c49a]/5" : "border-white/10"
                                )}
                            >
                                <input type="file" ref={thumbInputRef} onChange={handleThumbChange} accept="image/*" className="hidden" />
                                {thumbPreview ? (
                                    <div className="relative w-full h-full overflow-hidden rounded-3xl">
                                        <img src={thumbPreview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Replace Cover</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-white/20 mb-4 group-hover:text-[#e9c49a] transition-all" />
                                        <span className="text-xs font-bold text-white/60">Upload 9:16 Cover</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            {/* Title Field */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold flex items-center gap-3">
                                    <Type className="w-4 h-4" /> 2. Video Title (REQUIRED)
                                </label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. She smiled but her heart was broken"
                                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm outline-none focus:border-[#e9c49a]/40 transition-all"
                                />
                                <div className="flex justify-end text-[8px] uppercase tracking-widest text-white/20 font-bold">{title.length}/800</div>
                            </div>

                            {/* Description Field */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold flex items-center gap-3">
                                    <FileText className="w-4 h-4" /> 3. Story Context (REQUIRED)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Gives emotional meaning and context..."
                                    className="w-full min-h-[140px] bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-[#e9c49a]/40 transition-all resize-none"
                                />
                                <div className="flex justify-end text-[8px] uppercase tracking-widest text-white/20 font-bold">{description.length}/400</div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Category Select */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold flex items-center gap-3">
                                    <Layers className="w-4 h-4" /> 5. Content Category (REQUIRED)
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={cn(
                                                "h-12 rounded-xl text-left px-5 text-[11px] font-bold tracking-wide transition-all border",
                                                category === cat ? "bg-[#e9c49a] text-black border-[#e9c49a]" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mood Selection (Multi-select) */}
                    <div className="space-y-8">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold flex items-center gap-3">
                            <Tag className="w-4 h-4" /> 4. Mood Resonance (REQUIRED — MAX 3)
                        </label>

                        <div className="space-y-10">
                            {MOOD_CATEGORIES.map(category => (
                                <div key={category.name} className="space-y-4">
                                    <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#e9c49a] font-black border-l-2 border-[#e9c49a] pl-3">
                                        {category.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {category.moods.map(mood => (
                                            <button
                                                key={mood}
                                                onClick={() => toggleMood(mood)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border",
                                                    selectedMoods.includes(mood)
                                                        ? "bg-[#e9c49a] text-black border-[#e9c49a] shadow-[0_5px_15px_rgba(233,196,154,0.3)]"
                                                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                                                )}
                                            >
                                                {mood}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5">
                        {/* Visibility */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold flex items-center gap-3">
                                <Eye className="w-4 h-4" /> 7. Visibility
                            </label>
                            <div className="flex gap-2">
                                {["Public", "Private"].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setVisibility(v)}
                                        className={cn(
                                            "flex-1 h-12 rounded-xl text-[10px] font-bold uppercase transition-all border",
                                            visibility === v ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-white/40"
                                        )}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mood Priority */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold flex items-center gap-3">
                                <Hash className="w-4 h-4" /> 8. Mood Priority
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={priority}
                                onChange={(e) => setPriority(parseInt(e.target.value))}
                                className="w-full accent-[#e9c49a]"
                            />
                            <div className="flex justify-between text-[10px] font-black text-[#e9c49a]">
                                <span>Level 01</span>
                                <span className="bg-[#e9c49a] text-black px-2 rounded">{priority.toString().padStart(2, '0')}</span>
                                <span>Level 10</span>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold flex items-center gap-3">
                                <Globe className="w-4 h-4" /> 9. Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs outline-none text-white/60 appearance-none"
                            >
                                {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#050505]">{l}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Live Preview Panel (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-32 space-y-6">
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-[#e9c49a] font-black">
                            <Eye className="w-4 h-4" /> 6. Live Mood Preview
                        </div>

                        <div className="aspect-[9/16] w-full max-w-[360px] mx-auto rounded-[3rem] bg-[#0A0A0A] border border-white/10 relative overflow-hidden group shadow-2xl">
                            {thumbPreview ? (
                                <img src={thumbPreview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center">
                                        <Activity className="w-8 h-8 text-white/5 animate-pulse" />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold leading-relaxed">
                                        Synchronize Cover to Generate Visual Matrix
                                    </p>
                                </div>
                            )}

                            {/* Artifact Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-[#e9c49a]" />
                                    <span className="text-[9px] font-bold text-white/60">105:00</span>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-8 right-8 space-y-4">
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedMoods.length > 0 ? selectedMoods.map(m => (
                                        <span key={m} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/30">
                                            {m}
                                        </span>
                                    )) : (
                                        <span className="text-[8px] uppercase tracking-widest text-white/20 font-black italic">No Moods Linked</span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-display font-light text-white leading-tight">
                                        {title || "Artifact Title Resonance"}
                                    </h3>
                                    <p className="text-[#e9c49a] text-[9px] font-bold uppercase tracking-[0.3em]">
                                        {category}
                                    </p>
                                </div>
                            </div>

                            {/* Play Icon Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-white fill-current" />
                                </div>
                            </div>
                        </div>

                        {/* System Metadata Tags */}
                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <span className="text-[9px] uppercase tracking-widest text-white/20 font-black">Neural Metadata</span>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Resolution</p>
                                    <p className="text-[10px] text-[#e9c49a] font-bold">4K Cinema</p>
                                </div>
                                <div>
                                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Ratio</p>
                                    <p className="text-[10px] text-white/60 font-bold">9:16 Vertical</p>
                                </div>
                                <div>
                                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Visibility</p>
                                    <p className="text-[10px] text-white/60 font-bold">{visibility}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Language</p>
                                    <p className="text-[10px] text-white/60 font-bold">{language}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                input[type='range'] {
                    height: 4px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 2px;
                }
                select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
