import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Film, Type, FileText, Loader2, CheckCircle2, Sparkles, Activity } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ShortUpload() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
        }
    };

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const cloudName = 'dwm2smxdk';
        const apiKey = '229614895851864';
        const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';
        const timestamp = Math.round(new Date().getTime() / 1000);

        const paramString = `folder=amora_shorts&timestamp=${timestamp}${apiSecret}`;
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
            toast.error("Protocol Error: Missing required artifacts.");
            return;
        }

        if (!auth.currentUser) {
            toast.error("Auth Error: Neural link active session required.");
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            setUploadProgress(30);
            const videoUrl = await uploadToCloudinary(videoFile);

            setUploadProgress(70);
            const assetId = `short-${Math.random().toString(36).substr(2, 9)}`;

            await setDoc(doc(db, "shorts", assetId), {
                id: assetId,
                title,
                description: description.trim() || "",
                videoUrl,
                cloudinaryPublicId: videoUrl.split("/").pop()?.split(".")[0] || "",
                createdBy: auth.currentUser.uid,
                creatorName: auth.currentUser.displayName || "Operator",
                creatorPhoto: auth.currentUser.photoURL || "",
                createdAt: serverTimestamp(),
                views: 0,
                likes: 0,
                status: 'Approved',
                optimizedForRetention: true,
                origin: 'worker_upload'
            });

            setUploadProgress(100);
            toast.success("Artifact Synchronized: Short published to the Nexus.");

            setTitle("");
            setDescription("");
            setVideoFile(null);
            setUploadProgress(0);

            setTimeout(() => {
                navigate("/workers/dashboard");
            }, 1500);

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Sync Failure: " + (error.message || "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 rounded-[2rem] bg-[#e9c49a]/10 border border-[#e9c49a]/20 flex items-center justify-center">
                    <Film className="w-8 h-8 text-[#e9c49a]" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-light">Short Video <span className="text-[#e9c49a] italic">Operator</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Retention Optimization Protocol Active</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-12 space-y-8">
                    {/* Video Source */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-[#e9c49a]/60">
                                <Upload className="w-4 h-4" /> Artifact Source
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                <span className="text-[8px] uppercase font-bold text-emerald-500 tracking-widest">Optimized Encoding</span>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "relative w-full aspect-video rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group flex items-center justify-center overflow-hidden",
                                videoFile ? "border-[#e9c49a]/40 bg-black" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#e9c49a]/20"
                            )}
                            onClick={() => !uploading && document.getElementById('video-input')?.click()}
                        >
                            <input
                                id="video-input"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoChange}
                                disabled={uploading}
                            />

                            {videoFile ? (
                                <div className="flex flex-col items-center gap-3">
                                    <CheckCircle2 className="w-12 h-12 text-[#e9c49a]" />
                                    <p className="text-sm font-bold text-white/60">{videoFile.name}</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Spectral Scan Ready</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <Film className="w-12 h-12 text-white/5 group-hover:text-[#e9c49a]/40 transition-all duration-700" />
                                    <div>
                                        <p className="text-sm text-white/30">Select short format artifact</p>
                                        <p className="text-[10px] text-white/10 uppercase tracking-widest mt-2">Vertical MP4/MOV Preferred</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {uploading && (
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#e9c49a]">
                                    <span>Transmitting to Nexus...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[#e9c49a]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Meta: Title */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-6">
                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">
                                <Type className="w-4 h-4" /> Metadata Title
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter codename..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 transition-all"
                            />
                        </div>

                        {/* Meta: Description */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-6">
                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">
                                <FileText className="w-4 h-4" /> Narrative Fragment
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 transition-all h-24 resize-none"
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={uploading || !videoFile || !title}
                        className={cn(
                            "w-full h-20 rounded-[2.5rem] font-bold uppercase tracking-[0.4em] text-sm transition-all flex items-center justify-center gap-4 relative overflow-hidden group",
                            uploading || !videoFile || !title
                                ? "bg-white/5 text-white/20"
                                : "bg-[#e9c49a] text-black shadow-[0_20px_50px_rgba(233,196,154,0.15)] hover:bg-white active:scale-95"
                        )}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Encoding Pulse...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6" />
                                <span>Synchronize with Nexus</span>
                            </>
                        )}
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                    </button>

                    <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
                        Warning: All uploads are log-verified for retention compliance.
                    </p>
                </div>
            </form>
        </div>
    );
}
