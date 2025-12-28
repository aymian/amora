import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    Film,
    Type,
    FileText,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    Video,
    Flame
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

const MediaUpload = () => {
    const [loading, setLoading] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('video/')) {
                setVideoFile(file);
            } else {
                toast.error('Please select a valid video file.');
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile || !title || !description) {
            toast.error('Please fill in all fields and select a video.');
            return;
        }

        setLoading(true);
        try {
            // 1. Prepare Cloudinary Upload
            const cloudName = 'dwm2smxdk';
            const apiKey = '229614895851864';
            const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';
            const timestamp = Math.round(new Date().getTime() / 1000);

            // Parameters to sign (must be sorted alphabetically)
            const paramsToSign = {
                folder: 'amora_cinematics',
                timestamp: timestamp
            };

            const paramString = `folder=${paramsToSign.folder}&timestamp=${timestamp}${apiSecret}`;

            // Generate SHA-1 Signature using browser crypto
            const encoder = new TextEncoder();
            const data = encoder.encode(paramString);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const formData = new FormData();
            formData.append('file', videoFile);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', 'amora_cinematics');

            // 2. Transmit to Cloudinary
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Cloudinary transmission failed');
            }

            const result = await response.json();
            const videoUrl = result.secure_url;

            // 3. Generate Unique Asset ID
            const assetId = `amora-${Math.random().toString(36).substr(2, 9)}`;

            // 4. Save metadata to Firestore (as the global hero video)
            await setDoc(doc(db, "site_content", "hero"), {
                id: assetId,
                videoUrl: videoUrl,
                publicId: result.public_id,
                title,
                description,
                updatedAt: new Date().toISOString(),
                provider: 'cloudinary'
            });

            // 5. Also register in the Gallery Archive (for the Contents manager)
            await addDoc(collection(db, "gallery_videos"), {
                id: assetId,
                videoUrl: videoUrl,
                publicId: result.public_id,
                imageUrl: videoUrl.replace(/\.[^/.]+$/, ".jpg"), // Cloudinary auto-thumbnail trick
                title,
                description,
                createdAt: serverTimestamp(),
                type: 'video',
                provider: 'cloudinary'
            });

            toast.success('Hero Cinema updated successfully via Cloudinary');
            navigate('/manager/nexus');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to initialize lab upload');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-10 flex items-center justify-center relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-2xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
                <button
                    onClick={() => navigate('/manager/nexus')}
                    className="flex items-center gap-2 text-white/40 hover:text-[#e9c49a] transition-all mb-10 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Return to Nexus</span>
                </button>

                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#e9c49a]/10 border border-[#e9c49a]/20 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-[#e9c49a]" />
                        </div>
                        <h1 className="text-3xl font-display font-light tracking-tight">Media <span className="text-[#e9c49a] italic">Lab</span></h1>
                    </div>
                    <p className="text-white/30 text-sm font-light leading-relaxed">
                        Initialize a new cinematic asset for the main immersion hero. This will replace the current active sequence globally.
                    </p>
                </div>

                <form onSubmit={handleUpload} className="space-y-8">
                    <div className="space-y-6">
                        <div className="relative group/input">
                            <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] ml-1 mb-2 block font-bold">Asset Title</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-[#e9c49a] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="The Echoes of Silence..."
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.08] transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative group/input">
                            <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] ml-1 mb-2 block font-bold">Narrative Description</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-6 w-4 h-4 text-white/10 group-focus-within/input:text-[#e9c49a] transition-colors" />
                                <textarea
                                    placeholder="Describe the cinematic journey..."
                                    className="w-full bg-white/5 border border-white/5 rounded-3xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.08] transition-all h-32 resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] ml-1 mb-2 block font-bold">Cinematic File</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "w-full h-40 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group",
                                    videoFile ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#e9c49a]/20"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="video/*"
                                />
                                {videoFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        <span className="text-xs font-medium text-white/60">{videoFile.name}</span>
                                        <span className="text-[10px] text-white/20 uppercase tracking-widest">Spectral Scan Ready</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <Video className="w-8 h-8 text-white/10 group-hover:text-[#e9c49a] transition-all" />
                                        <p className="text-xs text-white/30">Drag cinematic file or click to browse</p>
                                        <p className="text-[8px] text-white/10 uppercase tracking-[0.3em] font-bold">MAX // 500MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-[#e9c49a] text-black hover:bg-white transition-all rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(233,196,154,0.1)] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Synchronizing Lab...</span>
                            </>
                        ) : (
                            <>
                                <Flame className="w-5 h-5" />
                                <span>Initialize Lab Upload</span>
                            </>
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default MediaUpload;
