import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    Image as ImageIcon,
    Type,
    FileText,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    Sparkles,
    Eye,
    Tag,
    Zap,
    Shield,
    Lock,
    Globe,
    AlertCircle,
    Info,
    Camera,
    Sun,
    Heart,
    Flame,
    Palette,
    Layers,
    Clock,
    User,
    Check,
    X,
    ChevronDown,
    Save,
    Star
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

// --- Constants for Select Options ---
const CATEGORIES = ["Images", "Featured", "Daily Muse", "Exclusive Set"];
const CORE_MOODS = ["Confident", "Calm", "Magnetic", "Soft", "Dark", "Elegant", "Powerful", "Mysterious"];
const SECONDARY_MOODS = ["Playful", "Stoic", "Whimsical", "Lethal", "Dreamy", "Sharp", "Ethereal", "Urban"];
const PRESENCE_TYPES = ["Soft Presence", "Alpha Presence", "Neutral Presence"];
const STYLES = ["Casual", "Elegant", "Night", "Editorial", "Minimal"];
const TONES = ["Warm", "Neutral", "Cold"];
const FRAMINGS = ["Close", "Mid", "Full"];
const LIGHTINGS = ["Natural", "Studio", "Low Light"];
const PLANS = ["free", "pro", "elite", "creator"];
const CLARITY_LEVELS = ["Normal", "Soft Blur (Free)", "Full Clarity (Paid)"];
const FEATURED_STATUSES = ["Normal", "Daily Feature", "Limited (time-boxed)"];
const COPYRIGHT_STATUSES = ["Owned", "Licensed", "Creator-submitted"];
const AURAS = ["Magnetic", "Rare", "Dangerous", "Soft Power"];

const ImageUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState(1);

    // --- Form State ---
    const [formData, setFormData] = useState({
        // 1. Basic Metadata
        title: '',
        caption: '',
        category: 'Images',

        // 2. Mood & Energy
        coreMood: 'Elegant',
        secondaryMoods: [] as string[],
        energyLevel: 50,
        presenceType: 'Neutral Presence',

        // 3. Visual Attributes
        style: 'Editorial',
        tone: 'Neutral',
        framing: 'Mid',
        lighting: 'Studio',

        // 4. Access &getVisibility
        is18Plus: false,
        planVisibility: ['free', 'pro', 'elite', 'creator'],
        clarityLevel: 'Normal',
        featuredStatus: 'Normal',

        // 5. Interaction
        allowPrivateSave: true,
        allowShare: true,
        allowReactions: true,
        disableComments: false,

        // 6. Story & Narrative
        narrativeFragment: '',
        auraDescriptor: 'Magnetic',

        // 7. Status & Trust
        verificationBadge: 'Admin Verified',
        curatedBy: 'Amora Studio',
        creatorName: '',
        copyrightStatus: 'Owned',

        // 9. Safety & Compliance
        ageConfirmed: false,
        consentConfirmed: false,
        policyAcknowledged: false
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSecondaryMood = (mood: string) => {
        setFormData(prev => {
            if (prev.secondaryMoods.includes(mood)) {
                return { ...prev, secondaryMoods: prev.secondaryMoods.filter(m => m !== mood) };
            }
            if (prev.secondaryMoods.length < 3) {
                return { ...prev, secondaryMoods: [...prev.secondaryMoods, mood] };
            }
            return prev;
        });
    };

    const togglePlan = (plan: string) => {
        setFormData(prev => {
            if (prev.planVisibility.includes(plan)) {
                return { ...prev, planVisibility: prev.planVisibility.filter(p => p !== plan) };
            }
            return { ...prev, planVisibility: [...prev.planVisibility, plan] };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                toast.error('Please select a valid image artifact.');
            }
        }
    };

    const handleUpload = async (status: 'published' | 'draft' = 'published') => {
        if (!imageFile) return toast.error("Artifact image is required.");
        if (!formData.title) return toast.error("Artifact title/codename is required.");
        if (!formData.ageConfirmed || !formData.consentConfirmed || !formData.policyAcknowledged) {
            return toast.error("Compliance confirmation required.");
        }

        setLoading(true);
        try {
            // 1. Cloudinary Integration
            const cloudName = 'dwm2smxdk';
            const apiKey = '229614895851864';
            const apiSecret = '7F_je2wrqmJO6nasNJZqb0uwmhU';
            const timestamp = Math.round(new Date().getTime() / 1000);

            const paramsToSign = {
                folder: 'amora_gallery',
                timestamp: timestamp
            };

            const paramString = `folder=${paramsToSign.folder}&timestamp=${timestamp}${apiSecret}`;
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

            // 2. Metadata Compilation & Firestore Sync
            const assetId = `img-${Math.random().toString(36).substr(2, 9)}`;
            const user = auth.currentUser;

            const finalPayload = {
                // System Identifiers
                id: assetId,
                imageUrl: result.secure_url,
                publicId: result.public_id,
                status: status === 'published' ? 'Approved' : 'Pending', // Moderation status
                publishStatus: status, // published / draft
                uploadedBy: user?.email || 'System',
                uploaderId: user?.uid || 'system',
                createdAt: serverTimestamp(),

                // Form Data
                ...formData,

                // Hidden/Auto Metrics
                stats: {
                    views: 0,
                    saves: 0,
                    reactions: 0,
                    reports: 0
                }
            };

            await addDoc(collection(db, "gallery_images"), finalPayload);

            toast.success(status === 'published' ? 'Artifact published to Nexus' : 'Draft saved in encrypted storage');
            navigate('/manager/nexus');
        } catch (error: any) {
            console.error('Nural link failure:', error);
            toast.error(error.message || 'Synchronization failed');
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
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold block mb-0.5">Section {num}</span>
                    <h3 className="text-lg font-medium text-white/90">{title}</h3>
                </div>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-white/20 transition-transform", activeSection === num && "rotate-180")} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#e9c49a]/[0.03] blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/[0.03] blur-[150px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-10 h-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/manager/nexus')}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-px bg-white/5" />
                    <Logo className="h-6 opacity-80" />
                    <h1 className="text-sm font-light tracking-[0.2em] uppercase text-white/40 ml-4">
                        Image / <span className="text-[#e9c49a] italic">Synchronizer</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleUpload('draft')}
                        className="px-6 py-2.5 rounded-xl border border-white/10 text-white/40 text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 transition-all"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleUpload('published')}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-[#e9c49a] text-black text-[10px] uppercase font-bold tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(233,196,154,0.2)]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Publish Now
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 pb-40">
                {/* Left Column: Form Sections */}
                <div className="lg:col-span-7 space-y-4">

                    {/* Section 1: Basic Metadata */}
                    <div className="space-y-4">
                        <SectionHeader num={1} title="Basic Metadata" icon={Type} />
                        <AnimatePresence>
                            {activeSection === 1 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 mt-2">

                                        {/* Image Upload Area */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Artifact Core (Image)</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "w-full h-48 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group overflow-hidden relative",
                                                    imageFile ? "border-[#e9c49a]/40 bg-black" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#e9c49a]/20"
                                                )}
                                            >
                                                {previewUrl ? (
                                                    <>
                                                        <img src={previewUrl} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" alt="Preview" />
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Upload className="w-8 h-8 text-white mb-2" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Re-initialize Artifact</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Upload className="w-8 h-8 text-white/10 group-hover:text-[#e9c49a] transition-all" />
                                                        <p className="text-xs text-white/30">Drag visual artifact or click to browse</p>
                                                        <p className="text-[8px] text-white/10 uppercase tracking-[0.3em] font-bold italic">Max 50MB // Neutral EXIF Strip Active</p>
                                                    </div>
                                                )}
                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Codename / Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="zelda.artifact"
                                                    value={formData.title}
                                                    onChange={(e) => updateField('title', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Identity Category</label>
                                                <div className="flex gap-2">
                                                    {CATEGORIES.map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={(e) => { e.preventDefault(); updateField('category', cat); }}
                                                            className={cn(
                                                                "px-3 py-2 rounded-xl text-[9px] uppercase tracking-widest font-bold border transition-all",
                                                                formData.category === cat ? "bg-[#e9c49a] text-black border-transparent" : "bg-white/5 border-white/5 text-white/30 hover:border-white/10"
                                                            )}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Editorial Caption (Optional)</label>
                                            <textarea
                                                placeholder="Enter the short narrative caption..."
                                                value={formData.caption}
                                                onChange={(e) => updateField('caption', e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-3xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 transition-all h-24 resize-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section 2: Mood & Energy */}
                    <div className="space-y-4">
                        <SectionHeader num={2} title="Mood & Energy Tagging" icon={Zap} />
                        <AnimatePresence>
                            {activeSection === 2 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 mt-2">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Primary Core Mood</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CORE_MOODS.map(mood => (
                                                    <button
                                                        key={mood}
                                                        onClick={(e) => { e.preventDefault(); updateField('coreMood', mood); }}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest font-bold border transition-all",
                                                            formData.coreMood === mood ? "bg-[#e9c49a] text-black border-transparent" : "bg-white/5 border-white/5 text-white/40"
                                                        )}
                                                    >
                                                        {mood}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Secondary Moods (Max 3)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {SECONDARY_MOODS.map(mood => (
                                                    <button
                                                        key={mood}
                                                        onClick={(e) => { e.preventDefault(); toggleSecondaryMood(mood); }}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest font-bold border transition-all",
                                                            formData.secondaryMoods.includes(mood) ? "bg-white/20 text-white border-white/20" : "bg-white/5 border-white/5 text-white/20"
                                                        )}
                                                    >
                                                        {mood}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1 flex justify-between">
                                                    Energy Level <span>{formData.energyLevel}%</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={formData.energyLevel}
                                                    onChange={(e) => updateField('energyLevel', parseInt(e.target.value))}
                                                    className="w-full accent-[#e9c49a] h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                                                />
                                                <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/10 font-bold">
                                                    <span>Passive</span>
                                                    <span>Intense</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Presence Type</label>
                                                <div className="flex flex-col gap-2">
                                                    {PRESENCE_TYPES.map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={(e) => { e.preventDefault(); updateField('presenceType', type); }}
                                                            className={cn(
                                                                "w-full px-6 py-3 rounded-2xl text-[10px] uppercase font-bold tracking-widest text-left border transition-all",
                                                                formData.presenceType === type ? "bg-[#e9c49a]/10 border-[#e9c49a]/30 text-[#e9c49a]" : "bg-white/5 border-white/5 text-white/20"
                                                            )}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section 3: Visual Attributes */}
                    <div className="space-y-4">
                        <SectionHeader num={3} title="Visual Attributes" icon={Palette} />
                        <AnimatePresence>
                            {activeSection === 3 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] grid grid-cols-2 gap-8 mt-2">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Photographic Style</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {STYLES.map(s => (
                                                    <button key={s} onClick={() => updateField('style', s)} className={cn("px-4 py-3 rounded-xl text-[10px] font-bold border transition-all", formData.style === s ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent text-white/20")}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Visual Tone</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {TONES.map(t => (
                                                    <button key={t} onClick={() => updateField('tone', t)} className={cn("px-4 py-3 rounded-xl text-[10px] font-bold border transition-all", formData.tone === t ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent text-white/20")}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Camera Framing</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {FRAMINGS.map(f => (
                                                    <button key={f} onClick={() => updateField('framing', f)} className={cn("px-4 py-3 rounded-xl text-[10px] font-bold border transition-all", formData.framing === f ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent text-white/20")}>{f}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Lighting Architecture</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {LIGHTINGS.map(l => (
                                                    <button key={l} onClick={() => updateField('lighting', l)} className={cn("px-4 py-3 rounded-xl text-[10px] font-bold border transition-all", formData.lighting === l ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent text-white/20")}>{l}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section 4: Access & Visibility */}
                    <div className="space-y-4">
                        <SectionHeader num={4} title="Access & Visibility Controls" icon={Shield} />
                        <AnimatePresence>
                            {activeSection === 4 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 mt-2">
                                        <div className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Sensitive Content Protocol</p>
                                                    <p className="text-[11px] text-white/40">Restricts artifact to citizens aged 18 and above.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => updateField('is18Plus', !formData.is18Plus)}
                                                className={cn(
                                                    "w-14 h-8 rounded-full p-1 transition-all",
                                                    formData.is18Plus ? "bg-red-500" : "bg-white/10"
                                                )}
                                            >
                                                <div className={cn("w-6 h-6 rounded-full bg-white transition-all shadow-xl", formData.is18Plus ? "translate-x-6" : "translate-x-0")} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Authorized Plan Access</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {PLANS.map(plan => (
                                                    <button
                                                        key={plan}
                                                        onClick={() => togglePlan(plan)}
                                                        className={cn(
                                                            "py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                                                            formData.planVisibility.includes(plan) ? "bg-[#e9c49a] text-black border-transparent shadow-[0_5px_15px_rgba(233,196,154,0.1)]" : "bg-white/5 border-white/5 text-white/20"
                                                        )}
                                                    >
                                                        {plan} access
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Resonance Clarity Level</label>
                                                <div className="flex flex-col gap-2">
                                                    {CLARITY_LEVELS.map(level => (
                                                        <button key={level} onClick={() => updateField('clarityLevel', level)} className={cn("px-6 py-3 rounded-xl text-[10px] font-bold text-left border transition-all", formData.clarityLevel === level ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-transparent text-white/20")}>{level}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Featured Status</label>
                                                <div className="flex flex-col gap-2">
                                                    {FEATURED_STATUSES.map(status => (
                                                        <button key={status} onClick={() => updateField('featuredStatus', status)} className={cn("px-6 py-3 rounded-xl text-[10px] font-bold text-left border transition-all", formData.featuredStatus === status ? "bg-[#e9c49a]/10 border-[#e9c49a]/30 text-[#e9c49a]" : "bg-white/5 border-transparent text-white/20")}>{status}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section 5: Interaction Settings */}
                    <div className="space-y-4">
                        <SectionHeader num={5} title="Interaction Settings" icon={Heart} />
                        <AnimatePresence>
                            {activeSection === 5 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        {[
                                            { label: 'Allow Private Save', field: 'allowPrivateSave' },
                                            { label: 'Allow Global Share', field: 'allowShare' },
                                            { label: 'Enabled Reactions', field: 'allowReactions' },
                                            { label: 'Disable Comments', field: 'disableComments' },
                                        ].map(item => (
                                            <div key={item.field} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">{item.label}</span>
                                                <button
                                                    onClick={() => updateField(item.field, !(formData as any)[item.field])}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full p-1 transition-all",
                                                        (formData as any)[item.field] ? "bg-emerald-500" : "bg-white/10"
                                                    )}
                                                >
                                                    <div className={cn("w-4 h-4 rounded-full bg-white transition-all", (formData as any)[item.field] ? "translate-x-6" : "translate-x-0")} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section 6 & 7: Story & Narrative / Status & Trust */}
                    <div className="space-y-4">
                        <SectionHeader num={6} title="Story & Status" icon={Star} />
                        <AnimatePresence>
                            {activeSection === 6 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 mt-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Narrative Fragment</label>
                                                <input
                                                    type="text"
                                                    placeholder="Example: Unapologetic."
                                                    value={formData.narrativeFragment}
                                                    onChange={(e) => updateField('narrativeFragment', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Aura Aura Descriptor</label>
                                                <select
                                                    value={formData.auraDescriptor}
                                                    onChange={(e) => updateField('auraDescriptor', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                                                >
                                                    {AURAS.map(a => <option key={a} value={a} className="bg-[#050505]">{a}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Creator Name / Attribution</label>
                                                <input
                                                    type="text"
                                                    placeholder="Amora Original"
                                                    value={formData.creatorName}
                                                    onChange={(e) => updateField('creatorName', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">Copyright Protocol</label>
                                                <select
                                                    value={formData.copyrightStatus}
                                                    onChange={(e) => updateField('copyrightStatus', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 appearance-none"
                                                >
                                                    {COPYRIGHT_STATUSES.map(c => <option key={c} value={c} className="bg-[#050505]">{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section 9: Safety & Compliance (Required) */}
                    <div className="p-8 bg-white/[0.04] border border-[#e9c49a]/10 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-[#e9c49a]" />
                            <h3 className="text-lg font-medium text-white">Compliance Protocols</h3>
                        </div>

                        {[
                            { label: "All human subjects are 18 years of age or older", field: 'ageConfirmed' },
                            { label: "Explicit consent for global resonance exists", field: 'consentConfirmed' },
                            { label: "I acknowledge and follow Amora Content Standards", field: 'policyAcknowledged' },
                        ].map(item => (
                            <button
                                key={item.field}
                                onClick={() => updateField(item.field, !(formData as any)[item.field])}
                                className="w-full flex items-center gap-4 text-left group"
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                                    (formData as any)[item.field] ? "bg-[#e9c49a] border-transparent" : "bg-white/5 border-white/10 group-hover:border-[#e9c49a]/40"
                                )}>
                                    {(formData as any)[item.field] && <Check className="w-4 h-4 text-black" />}
                                </div>
                                <span className={cn("text-xs transition-colors", (formData as any)[item.field] ? "text-white" : "text-white/30")}>{item.label}</span>
                            </button>
                        ))}
                    </div>

                </div>

                {/* Right Column: Sticky Preview & Final Actions */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="sticky top-28 space-y-8">
                        {/* Final Pulse View (Preview) */}
                        <div className="p-1.5 bg-[#080808] border border-white/5 rounded-[3rem] shadow-2xl relative group">
                            <div className="absolute inset-0 bg-[#e9c49a]/5 blur-[60px] rounded-[3rem] -z-10 group-hover:bg-[#e9c49a]/10 transition-all" />
                            <div className="aspect-[3/4] rounded-[2.8rem] bg-white/[0.02] overflow-hidden border border-white/5 relative">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                                        <ImageIcon className="w-12 h-12 text-white/5 mb-2" />
                                        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Artifact Preview Pending</p>
                                    </div>
                                )}

                                {/* Preview Overlays */}
                                <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            {formData.is18Plus && <span className="px-2 py-0.5 rounded bg-red-500/80 text-white text-[8px] font-bold">18+</span>}
                                            <span className="px-2 py-0.5 rounded bg-[#e9c49a]/20 backdrop-blur-md border border-[#e9c49a]/30 text-[#e9c49a] text-[8px] font-bold uppercase tracking-widest">{formData.category}</span>
                                        </div>
                                        <h4 className="text-2xl font-light text-white drop-shadow-lg">{formData.title || 'Artifact Name'}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-white/60 text-[10px]">
                                                <Zap className="w-3 h-3 text-[#e9c49a]" />
                                                {formData.coreMood}
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <div className="text-white/40 text-[10px]">
                                                {formData.creatorName || 'Amora Studio'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-full backdrop-blur-3xl bg-white/10 border border-white/20 flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div className="w-12 h-12 rounded-full backdrop-blur-3xl bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                                            98
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Console */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-white/60">Synchronization Pulse</h3>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-500">Node Online</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => handleUpload('published')}
                                    disabled={loading}
                                    className="w-full h-16 bg-[#e9c49a] text-black hover:bg-white transition-all rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(233,196,154,0.1)] active:scale-95"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                                    Synchronize Artifact
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleUpload('draft')}
                                        className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Save Draft
                                    </button>
                                    <button className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase font-bold tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2">
                                        <X className="w-4 h-4" /> Archive
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] text-white/20 text-center leading-relaxed font-light italic mt-4">
                                High-priority metadata strips selected subjects from legacy archives and redistributes them into the planetary neural network.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(233, 196, 154, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(233, 196, 154, 0.2); }
            `}</style>
        </div>
    );
};

export default ImageUpload;
