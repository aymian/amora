import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Type,
    Zap,
    Shield,
    Palette,
    Star,
    ChevronDown,
    Check,
    Loader2,
    Sparkles,
    Eye,
    Globe,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const CATEGORIES = ["Images", "Featured", "Daily Muse", "Exclusive Set"];
const CORE_MOODS = ["Confident", "Calm", "Magnetic", "Soft", "Dark", "Elegant", "Powerful", "Mysterious"];
const STYLES = ["Casual", "Elegant", "Night", "Editorial", "Minimal"];
const PLANS = ["free", "pro", "elite", "creator"];

const ImageSynchronizer = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        category: 'Images',
        coreMood: 'Elegant',
        style: 'Editorial',
        is18Plus: false,
        planVisibility: ['free', 'pro', 'elite', 'creator'],
        narrativeFragment: '',
        ageConfirmed: false,
        consentConfirmed: false,
        policyAcknowledged: false
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                toast.error('Invalid Artifact Format');
            }
        }
    };

    const handleUpload = async () => {
        if (!imageFile || !formData.title) {
            toast.error("Missing critical artifact metadata.");
            return;
        }
        if (!formData.ageConfirmed || !formData.consentConfirmed || !formData.policyAcknowledged) {
            toast.error("Compliance protocols not initialized.");
            return;
        }

        setLoading(true);
        try {
            const cloudName = 'dwm2smxdk';
            const apiKey = '229614895851864';
            const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';
            const timestamp = Math.round(new Date().getTime() / 1000);

            const paramString = `folder=amora_gallery&timestamp=${timestamp}${apiSecret}`;
            const encoder = new TextEncoder();
            const data = encoder.encode(paramString);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const uploadData = new FormData();
            uploadData.append('file', imageFile);
            uploadData.append('api_key', apiKey);
            uploadData.append('timestamp', timestamp.toString());
            uploadData.append('signature', signature);
            uploadData.append('folder', 'amora_gallery');

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: uploadData
            });

            if (!response.ok) throw new Error('Cloudinary node rejection');
            const result = await response.json();

            const assetId = `img-${Math.random().toString(36).substr(2, 9)}`;

            await setDoc(doc(db, "gallery_images", assetId), {
                id: assetId,
                imageUrl: result.secure_url,
                publicId: result.public_id,
                status: 'Approved',
                uploadedBy: auth.currentUser?.email || 'Worker',
                uploaderId: auth.currentUser?.uid || 'worker',
                createdAt: serverTimestamp(),
                ...formData,
                stats: { views: 0, saves: 0, reactions: 0, reports: 0 }
            });

            toast.success("Artifact synchronized with the Nexus.");
            setImageFile(null);
            setPreviewUrl(null);
            setFormData({
                title: '',
                caption: '',
                category: 'Images',
                coreMood: 'Elegant',
                style: 'Editorial',
                is18Plus: false,
                planVisibility: ['free', 'pro', 'elite', 'creator'],
                narrativeFragment: '',
                ageConfirmed: false,
                consentConfirmed: false,
                policyAcknowledged: false
            });
        } catch (error: any) {
            toast.error("Sync Failure: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ num, title, icon: Icon }: { num: number, title: string, icon: any }) => (
        <div
            onClick={() => setActiveSection(activeSection === num ? 0 : num)}
            className={cn(
                "flex items-center justify-between p-6 rounded-3xl cursor-pointer transition-all border",
                activeSection === num ? "bg-white/[0.04] border-[#e9c49a]/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.03]"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                    activeSection === num ? "bg-[#e9c49a] border-transparent text-black" : "bg-white/5 border-white/10 text-white/30"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold block mb-0.5">Step {num}</span>
                    <h3 className="text-sm font-medium text-white/90">{title}</h3>
                </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform", activeSection === num && "rotate-180")} />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Column */}
            <div className="lg:col-span-12 space-y-6">
                <SectionHeader num={1} title="Identity Artifact" icon={Upload} />
                <AnimatePresence>
                    {activeSection === 1 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-8 mt-2">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "w-full h-48 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden",
                                        previewUrl ? "border-[#e9c49a]/40 bg-black" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                                    )}
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover opacity-60" alt="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <Upload className="w-8 h-8 text-white/10 group-hover:text-[#e9c49a] transition-all" />
                                            <p className="text-xs text-white/30 font-light">Select Visual Artifact</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input
                                        type="text"
                                        placeholder="Codename/Title"
                                        value={formData.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#e9c49a]/40"
                                    />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => updateField('category', e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm outline-none"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <SectionHeader num={2} title="Aura Configuration" icon={Zap} />
                <AnimatePresence>
                    {activeSection === 2 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-8 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Core Mood</p>
                                        <div className="flex flex-wrap gap-2">
                                            {CORE_MOODS.map(m => (
                                                <button key={m} onClick={() => updateField('coreMood', m)} className={cn("px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-all", formData.coreMood === m ? "bg-[#e9c49a] text-black border-transparent" : "bg-white/5 border-white/5 text-white/30")}>{m}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Visual Style</p>
                                        <div className="flex flex-wrap gap-2">
                                            {STYLES.map(s => (
                                                <button key={s} onClick={() => updateField('style', s)} className={cn("px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-all", formData.style === s ? "bg-white/10 border-white/10 text-white" : "bg-white/5 border-white/5 text-white/30")}>{s}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <SectionHeader num={3} title="Safety Protocols" icon={Shield} />
                <AnimatePresence>
                    {activeSection === 3 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 mt-2">
                                {[
                                    { label: "Subject Age Verification (18+)", field: 'ageConfirmed' },
                                    { label: "Explicit Interaction Consent", field: 'consentConfirmed' },
                                    { label: "Nexus Compliance Agreement", field: 'policyAcknowledged' },
                                ].map(item => (
                                    <button
                                        key={item.field}
                                        onClick={() => updateField(item.field, !(formData as any)[item.field])}
                                        className="w-full flex items-center gap-4 text-left group"
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                                            (formData as any)[item.field] ? "bg-[#e9c49a] border-transparent" : "bg-white/5 border-white/10"
                                        )}>
                                            {(formData as any)[item.field] && <Check className="w-4 h-4 text-black" />}
                                        </div>
                                        <span className={cn("text-xs transition-colors", (formData as any)[item.field] ? "text-white" : "text-white/30")}>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleUpload}
                    disabled={loading || !imageFile || !formData.title}
                    className={cn(
                        "w-full h-16 rounded-[2rem] font-bold uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 mt-4",
                        loading || !imageFile || !formData.title ? "bg-white/5 text-white/20" : "bg-[#e9c49a] text-black shadow-[0_20px_40px_rgba(233,196,154,0.15)] hover:bg-white"
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    Synchronize Artifact
                </button>
            </div>
        </div>
    );
};

export default ImageSynchronizer;
