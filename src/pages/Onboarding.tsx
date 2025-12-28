import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    ArrowRight,
    Upload,
    Instagram,
    Twitter,
    Link as LinkIcon,
    Camera,
    Check,
    ChevronLeft
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const steps = [
    { title: "The Beginning", description: "Select your cinematic resonance." },
    { title: "Identity", description: "Craft your digital persona." },
    { title: "Social", description: "Connect your creative network." },
    { title: "Review", description: "Finalize your cinematic journey." }
];

const interests = [
    "Abstract Narrative", "Cyberpunk Noir", "Surrealism", "Modern Minimalism",
    "Time Dilation", "Emotional Echoes", "Visual Poetry", "Cinematic Soundscapes"
];

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [bio, setBio] = useState("");
    const [socials, setSocials] = useState({ instagram: "", twitter: "", website: "" });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleInterestToggle = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFinish = async () => {
        if (!auth.currentUser) return;
        setLoading(true);

        try {
            let photoURL = auth.currentUser.photoURL;

            if (profileImage) {
                const fileName = `${auth.currentUser.uid}-${Date.now()}`;
                const { data, error } = await supabase.storage
                    .from('home videos')
                    .upload(`avatars/${fileName}`, profileImage);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('home videos')
                    .getPublicUrl(`avatars/${fileName}`);

                photoURL = publicUrl;
                await updateProfile(auth.currentUser, { photoURL });
            }

            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                interests: selectedInterests,
                bio,
                socials,
                photoURL,
                onboardingCompleted: true,
                plan: "free"
            });

            toast.success("Profile finalized.");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 font-sans overflow-hidden relative">
            {/* Background Gradient */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />

            <div className="max-w-2xl w-full space-y-12 relative z-10">
                {/* Progress Bar */}
                <div className="flex gap-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-[#e9c49a]" : "bg-white/5"}`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-display font-light">Choose Resonance.</h2>
                                <p className="text-white/40 font-light">Select the themes that pulse with your creative frequency.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {interests.map(interest => (
                                    <button
                                        key={interest}
                                        onClick={() => handleInterestToggle(interest)}
                                        className={`p-4 rounded-2xl border transition-all text-left text-xs font-medium tracking-wide ${selectedInterests.includes(interest)
                                                ? "bg-[#e9c49a] border-[#e9c49a] text-black"
                                                : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                                            }`}
                                    >
                                        {interest}
                                        {selectedInterests.includes(interest) && <Check className="w-3 h-3 float-right" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-display font-light">Define Identity.</h2>
                                <p className="text-white/40 font-light">Your visual signature and cinematic bio.</p>
                            </div>
                            <div className="flex flex-col items-center gap-6">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-32 h-32 rounded-[2.5rem] bg-white/5 border border-dashed border-white/20 flex items-center justify-center cursor-pointer group hover:bg-white/[0.08] transition-all relative overflow-hidden"
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white/20 group-hover:text-[#e9c49a] transition-colors" />
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                </div>
                                <textarea
                                    placeholder="Write your cinematic bio..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.08] transition-all resize-none"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-display font-light">Creative Network.</h2>
                                <p className="text-white/40 font-light">Integrate your social presence.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="Instagram Username"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-[#e9c49a]/40 transition-all"
                                        value={socials.instagram}
                                        onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="Twitter Username"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-[#e9c49a]/40 transition-all"
                                        value={socials.twitter}
                                        onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="url"
                                        placeholder="Portfolio/Website"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-[#e9c49a]/40 transition-all"
                                        value={socials.website}
                                        onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-[#e9c49a]/10 border border-[#e9c49a]/20 flex items-center justify-center mx-auto mb-8">
                                <Sparkles className="w-8 h-8 text-[#e9c49a]" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-display font-light">Finalize Journey.</h2>
                                <p className="text-white/40 font-light max-w-sm mx-auto">
                                    Your profile is curated. Ready to enter the cinematic emotion lab?
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-4 pt-8">
                    {step > 0 && (
                        <Button
                            variant="ghost"
                            onClick={() => setStep(step - 1)}
                            className="h-14 flex-1 rounded-2xl border border-white/5 hover:bg-white/5 text-white/60"
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" /> Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            className="h-14 flex-1 bg-white hover:bg-[#e9c49a] text-black font-bold rounded-2xl transition-all"
                        >
                            Continue <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleFinish}
                            disabled={loading}
                            className="h-14 flex-1 bg-[#e9c49a] hover:bg-white text-black font-bold rounded-2xl transition-all"
                        >
                            {loading ? "Finalizing..." : "Enter Amora"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
