import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Film, Type, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateShort() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("video/")) {
                setVideoFile(file);
            } else {
                toast.error("Invalid File", {
                    description: "Please select a valid video file."
                });
            }
        }
    };

    const uploadToCloudinary = async (file: File): Promise<string> => {
        // Use signed upload with same credentials as MediaUpload
        const cloudName = 'dwm2smxdk';
        const apiKey = '229614895851864';
        const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';
        const timestamp = Math.round(new Date().getTime() / 1000);

        // Parameters to sign (must be sorted alphabetically)
        const paramString = `folder=amora_shorts&timestamp=${timestamp}${apiSecret}`;

        // Generate SHA-1 Signature using browser crypto
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
        formData.append("folder", "amora_shorts");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Cloudinary upload failed");
        }

        const result = await response.json();
        return result.secure_url;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !videoFile) {
            toast.error("Missing Fields", {
                description: "Please provide a title and video file."
            });
            return;
        }

        if (!auth.currentUser) {
            toast.error("Authentication Required", {
                description: "You must be logged in to create shorts."
            });
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            // Upload video to Cloudinary
            setUploadProgress(30);
            const videoUrl = await uploadToCloudinary(videoFile);

            setUploadProgress(70);

            // Save to Firestore
            await addDoc(collection(db, "shorts"), {
                title,
                description: description.trim() || "",
                videoUrl,
                cloudinaryPublicId: videoUrl.split("/").pop()?.split(".")[0] || "",
                createdBy: auth.currentUser.uid,
                creatorName: auth.currentUser.displayName || "Creator",
                creatorPhoto: auth.currentUser.photoURL || "",
                createdAt: serverTimestamp(),
                views: 0,
                likes: 0
            });

            setUploadProgress(100);

            toast.success("Short Created", {
                description: "Your short video has been published successfully!"
            });

            // Reset form
            setTitle("");
            setDescription("");
            setVideoFile(null);
            setUploadProgress(0);

            // Navigate to short videos
            setTimeout(() => {
                navigate("/short-videos");
            }, 1500);

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload Failed", {
                description: error.message || "Failed to create short. Please try again."
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white py-20 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#e9c49a]/20 to-transparent border border-[#e9c49a]/20 flex items-center justify-center">
                            <Film className="w-8 h-8 text-[#e9c49a]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-display font-light tracking-tight">Create Short</h1>
                            <p className="text-sm text-white/40 uppercase tracking-[0.3em] font-bold">Vertical Resonance Protocol</p>
                        </div>
                    </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Video Upload */}
                    <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]/40">
                            <Upload className="w-4 h-4" />
                            Video Artifact
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="hidden"
                                id="video-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="video-upload"
                                className={cn(
                                    "block w-full p-12 rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer group",
                                    videoFile
                                        ? "border-[#e9c49a]/40 bg-[#e9c49a]/5"
                                        : "border-white/10 hover:border-[#e9c49a]/20 hover:bg-white/[0.02]",
                                    uploading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className="flex flex-col items-center gap-4 text-center">
                                    {videoFile ? (
                                        <>
                                            <CheckCircle2 className="w-12 h-12 text-[#e9c49a]" />
                                            <div>
                                                <p className="text-lg font-bold text-[#e9c49a]">{videoFile.name}</p>
                                                <p className="text-xs text-white/40 mt-1">
                                                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Film className="w-12 h-12 text-white/20 group-hover:text-[#e9c49a]/40 transition-colors" />
                                            <div>
                                                <p className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                                                    Click to upload video
                                                </p>
                                                <p className="text-xs text-white/30 mt-1">MP4, MOV, AVI (Max 500MB)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/40 uppercase tracking-widest font-bold">Uploading...</span>
                                    <span className="text-[#e9c49a] font-bold">{uploadProgress}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#e9c49a]/50 to-[#e9c49a] transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
                            <Type className="w-4 h-4" />
                            Title
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter short title..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#e9c49a]/40 transition-all placeholder:text-white/20"
                            disabled={uploading}
                            maxLength={100}
                        />
                        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                            {title.length}/100 characters
                        </p>
                    </div>

                    {/* Description */}
                    <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
                            <FileText className="w-4 h-4" />
                            Description (Optional)
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#e9c49a]/40 transition-all placeholder:text-white/20 min-h-[120px] resize-none"
                            disabled={uploading}
                            maxLength={500}
                        />
                        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                            {description.length}/500 characters
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading || !title.trim() || !videoFile}
                        className={cn(
                            "w-full h-16 rounded-[2rem] font-bold uppercase tracking-[0.3em] text-sm transition-all relative overflow-hidden group",
                            uploading || !title.trim() || !videoFile
                                ? "bg-white/5 text-white/20 cursor-not-allowed"
                                : "bg-[#e9c49a] text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_60px_rgba(233,196,154,0.3)]"
                        )}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Publishing Short...
                                </>
                            ) : (
                                <>
                                    <Film className="w-5 h-5" />
                                    Publish Short
                                </>
                            )}
                        </span>
                        {!uploading && title.trim() && videoFile && (
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
