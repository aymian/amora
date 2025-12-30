import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, Sparkles } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { LuxuryScene } from "@/components/video/LuxuryScene";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/dashboard");
            } else {
                setAuthLoading(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

                if (userDoc.exists() && userDoc.data().onboardingCompleted) {
                    localStorage.setItem('amora_resonance_active', 'true');
                    navigate("/dashboard");
                } else {
                    localStorage.setItem('amora_resonance_active', 'true');
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

                localStorage.setItem('amora_resonance_active', 'true');
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
                localStorage.setItem('amora_resonance_active', 'true');
                navigate("/onboarding");
            } else if (userDoc.data().onboardingCompleted) {
                localStorage.setItem('amora_resonance_active', 'true');
                navigate("/dashboard");
            } else {
                localStorage.setItem('amora_resonance_active', 'true');
                navigate("/onboarding");
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex overflow-hidden font-sans">
            {/* Left Column: Cinematic Visuals */}
            <div className="hidden lg:block lg:w-1/2 relative bg-black">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/20 via-transparent to-[#050505]" />

                {/* Branding Overlap */}
                <div className="absolute top-12 left-12 z-30">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Logo size="md" />
                    </motion.div>
                </div>

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
                            {isLogin && (
                                <div className="flex justify-end px-2">
                                    <Link
                                        to="/forgot-password"
                                        className="text-[10px] uppercase tracking-widest text-white/20 hover:text-[#e9c49a] transition-colors font-bold"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}
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
                                <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                                    <GoogleIcon />
                                </div>
                                <span className="text-xs text-white/40 group-hover:text-white font-medium">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] py-3.5 rounded-2xl transition-all group">
                                <div className="text-white/40 group-hover:text-white transition-colors">
                                    <GithubIcon />
                                </div>
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

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const GithubIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);
