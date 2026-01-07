import { useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    ArrowLeft,
    Upload,
    X,
    Music,
    Image as ImageIcon,
    Video as VideoIcon,
    Sparkles,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CreateStory = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useOutletContext<any>();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const mediaInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            toast.success(`Music attached: ${file.name}`);
        }
    };

    const handlePublish = async () => {
        if (!mediaFile || !currentUser?.id) {
            toast.error("Please select a photo or video for your story");
            return;
        }

        setUploading(true);
        try {
            // 1. Upload Media
            const mediaRef = ref(storage, `stories/${currentUser.id}/media_${Date.now()}`);
            await uploadBytes(mediaRef, mediaFile);
            const mediaUrl = await getDownloadURL(mediaRef);

            // 2. Upload Audio if exists
            let audioUrl = "";
            if (audioFile) {
                const audioRef = ref(storage, `stories/${currentUser.id}/audio_${Date.now()}`);
                await uploadBytes(audioRef, audioFile);
                audioUrl = await getDownloadURL(audioRef);
            }

            // 3. Save to Firestore (using 'shorts' as requested or new 'stories' collection)
            // User requested "add ring to story", typically stories go to a specific collection
            await addDoc(collection(db, "stories"), {
                userId: currentUser.id,
                userName: currentUser.fullName || currentUser.username,
                userPhoto: currentUser.photoURL || "",
                title,
                description,
                mediaUrl,
                mediaType,
                audioUrl,
                createdAt: serverTimestamp(),
                viewedBy: [] // To track who saw it for the "ring" logic
            });

            toast.success("Story Published to the Nexus");
            navigate("/dashboard");
        } catch (err) {
            console.error("Story pub failed:", err);
            toast.error("Story transmission failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-12 relative overflow-hidden flex flex-col items-center">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e9c49a]/5 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="w-full max-w-4xl z-10 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#e9c49a] hover:bg-white/5 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-display font-light text-white tracking-tight">Create <span className="text-[#e9c49a] italic">Story</span></h1>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Transmit a fleeting moment to the nexus</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Input Form */}
                    <div className="space-y-8">
                        <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Story Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="A name for this moment..."
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:border-[#e9c49a] outline-none transition-all placeholder:text-white/10 font-light"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Context / Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the frequency..."
                                    rows={4}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:border-[#e9c49a] outline-none transition-all resize-none placeholder:text-white/10 font-light"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => mediaInputRef.current?.click()}
                                    className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center gap-3 transition-all"
                                >
                                    <ImageIcon className="w-5 h-5 text-[#e9c49a]" />
                                    <span>Upload Media</span>
                                </Button>
                                <input
                                    type="file"
                                    ref={mediaInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={handleMediaChange}
                                />

                                <Button
                                    variant="outline"
                                    onClick={() => audioInputRef.current?.click()}
                                    className={cn(
                                        "w-14 h-14 rounded-2xl border-white/10 flex items-center justify-center transition-all",
                                        audioFile ? "bg-[#e9c49a] text-black border-transparent" : "bg-white/5 text-white/60 hover:text-white"
                                    )}
                                >
                                    <Music className="w-5 h-5 font-bold" />
                                </Button>
                                <input
                                    type="file"
                                    ref={audioInputRef}
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                />
                            </div>
                        </div>

                        <Button
                            disabled={uploading || !mediaFile}
                            onClick={handlePublish}
                            className="w-full h-16 rounded-[2rem] bg-[#e9c49a] text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-[0_20px_40px_rgba(233,196,154,0.2)] group"
                        >
                            {uploading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    MODULATING PATTERNS...
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    TRANSMIT TO NEXUS
                                    <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </div>

                    {/* Right: Preview Area */}
                    <div className="relative aspect-[9/16] lg:h-[600px] mx-auto w-full group">
                        <div className="absolute inset-0 rounded-[3rem] border border-white/10 overflow-hidden bg-[#0A0A0A] shadow-2xl">
                            {mediaPreview ? (
                                <>
                                    {mediaType === 'video' ? (
                                        <video src={mediaPreview} autoPlay loop muted className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 p-8 flex flex-col justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border-2 border-[#e9c49a] p-0.5">
                                                <div className="w-full h-full rounded-full bg-white/10" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-white text-xs font-bold font-mono tracking-wider">PREVIEW_MODE</p>
                                                <p className="text-white/40 text-[8px] uppercase tracking-widest font-black">Identity synchronized</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-display font-light text-white">{title || "Pattern Label"}</h3>
                                            <p className="text-sm text-white/60 font-light leading-relaxed">{description || "Frequency context waiting to be established..."}</p>

                                            {audioFile && (
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#e9c49a]/20 border border-[#e9c49a]/30 w-fit backdrop-blur-md">
                                                    <Music className="w-3 h-3 text-[#e9c49a] animate-pulse" />
                                                    <span className="text-[10px] text-[#e9c49a] font-bold uppercase tracking-widest truncate max-w-[120px]">{audioFile.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setMediaFile(null);
                                            setMediaPreview(null);
                                            setMediaType(null);
                                        }}
                                        className="absolute top-8 right-8 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500 hover:border-transparent transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] font-black">Awaiting Visual Artifact</p>
                                </div>
                            )}
                        </div>

                        {/* Aesthetic Frame */}
                        <div className="absolute -inset-4 border border-[#e9c49a]/10 rounded-[4rem] -z-10 blur-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStory;
