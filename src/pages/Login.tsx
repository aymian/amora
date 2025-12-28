import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, Github, Chrome, Sparkles } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { LuxuryScene } from "@/components/video/LuxuryScene";
import { Button } from "@/components/ui/button";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: ""
    });

    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

                if (userDoc.exists() && userDoc.data().onboardingCompleted) {
                    navigate("/dashboard");
                } else {
                    navigate("/onboarding");
                }
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                await updateProfile(userCredential.user, { displayName: formData.fullName });

                await setDoc(doc(db, "users", userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone || null,
                    createdAt: new Date().toISOString(),
                    role: "user",
                    plan: "free",
                    onboardingCompleted: false
                });

                navigate("/onboarding");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const userDoc = await getDoc(doc(db, "users", result.user.uid));

            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", result.user.uid), {
                    uid: result.user.uid,
                    fullName: result.user.displayName,
                    email: result.user.email,
                    createdAt: new Date().toISOString(),
                    role: "user",
                    plan: "free",
                    onboardingCompleted: false
                });
                navigate("/onboarding");
            } else if (userDoc.data().onboardingCompleted) {
                navigate("/dashboard");
            } else {
                navigate("/onboarding");
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex overflow-hidden font-sans">
            {/* Left Column: Cinematic Visuals */}
            <div className="hidden lg:block lg:w-1/2 relative bg-black">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/20 via-transparent to-[#050505]" />
                <div className="absolute inset-0">
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <LuxuryScene />
                    </Canvas>
                </div>
                <div className="absolute bottom-16 left-16 z-20 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="h-[1px] w-12 bg-[#e9c49a]" />
                        <h2 className="text-5xl font-display font-light text-white leading-tight tracking-tight">
                            The Future of <br />
                            <span className="text-[#e9c49a] italic">Cinematic Narrative.</span>
                        </h2>
                        <p className="text-white/40 text-sm font-light leading-relaxed tracking-wide">
                            Enter a world where stories adapt to your emotions. Every chapter is a unique journey crafted for your senses.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="max-w-md w-full space-y-12">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-[#e9c49a]"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Amora Experience</span>
                        </motion.div>
                        <h1 className="text-4xl font-display font-light text-white tracking-tight">
                            {isLogin ? "Welcome Back." : "Create Identity."}
                        </h1>
                        <p className="text-white/40 font-light text-sm">
                            {isLogin
                                ? "Sign in to continue your personalized cinematic journey."
                                : "Join the elite circle of cinematic explorers."}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-6 overflow-hidden"
                                >
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            required={!isLogin}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number (Optional)"
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-white hover:bg-[#e9c49a] text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-[#050505] px-4 text-white/20">Authorized Social Access</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] py-3.5 rounded-2xl transition-all group"
                            >
                                <Chrome className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                <span className="text-xs text-white/40 group-hover:text-white font-medium">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] py-3.5 rounded-2xl transition-all group">
                                <Github className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                <span className="text-xs text-white/40 group-hover:text-white font-medium">GitHub</span>
                            </button>
                        </div>

                        <p className="text-center text-white/20 text-xs font-light">
                            {isLogin ? "New to the experience?" : "Already an identity?"}{" "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white hover:text-[#e9c49a] font-medium transition-colors"
                            >
                                {isLogin ? "Join Amora" : "Sign In"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
