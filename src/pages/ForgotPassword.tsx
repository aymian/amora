import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import emailjs from "@emailjs/browser";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Send Email, 2: Success Message
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

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Generate a 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // 2. Store OTP in Firestore (Matches your free security rules)
            await addDoc(collection(db, "password_resets"), {
                email: email.toLowerCase(),
                code: otpCode,
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
                used: false
            });

            // 3. EmailJS TRANSMISSION (100% Free Mode)
            const SERVICE_ID = "service_kb74jmv";
            const TEMPLATE_ID = "template_1hwn5za";
            const PUBLIC_KEY = "JN2NHWNzO5skAzoTv";

            if (SERVICE_ID !== "service_kb74jmv") {
                await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
                    to_email: email.toLowerCase(),
                    otp_code: otpCode,
                    app_name: "Amora Experience"
                }, PUBLIC_KEY);

                toast.success("Identity Resonance dispatched to your inbox.");
            } else {
                console.log("EmailJS IDs not configured. Bypass code:", otpCode);
                toast.success("Dev Mode: Check Console for code", {
                    description: `OTP: ${otpCode}`,
                    duration: 10000
                });
            }

            setTimeout(() => {
                navigate("/reset-password", { state: { email: email.toLowerCase() } });
            }, 3000);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 font-sans overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#e9c49a]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-purple-900/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-md w-full relative z-10 space-y-12">
                <div className="space-y-4 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center lg:justify-start gap-3 text-[#e9c49a]"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Security Nexus</span>
                    </motion.div>
                    <h1 className="text-4xl font-display font-light text-white tracking-tight">
                        Recover Identity.
                    </h1>
                    <p className="text-white/40 font-light text-sm max-w-sm mx-auto lg:mx-0">
                        Enter your email address and we'll transmit a secure OTP code to verify your access.
                    </p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-6">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-white hover:bg-[#e9c49a] text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                    >
                        {loading ? "Transmitting..." : "Send Reset Code"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                <div className="pt-4 text-center">
                    <Link
                        to="/login"
                        className="text-white/20 hover:text-[#e9c49a] text-xs font-light transition-colors flex items-center justify-center gap-2"
                    >
                        Return to Login Protocol
                    </Link>
                </div>
            </div>
        </div>
    );
}
