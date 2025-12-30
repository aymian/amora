import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Sparkles, KeyRound, RefreshCcw } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    updateDoc,
    doc
} from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    useEffect(() => {
        if (!authLoading && !email) {
            navigate("/forgot-password");
        }
    }, [email, navigate, authLoading]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const verifyOtp = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length !== 6) {
            toast.error("Please enter the full 6-digit code.");
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, "password_resets"),
                where("email", "==", email),
                where("code", "==", fullOtp),
                where("used", "==", false),
                orderBy("createdAt", "desc"),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error("Invalid or expired code.");
                return;
            }

            const resetDoc = querySnapshot.docs[0];
            const data = resetDoc.data();

            if (data.expiresAt.toDate() < new Date()) {
                toast.error("Code has expired. Please request a new one.");
                return;
            }

            // OTP is valid
            setIsOtpVerified(true);
            toast.success("Identity verified. Set your new password.");
        } catch (error: any) {
            console.error(error);
            toast.error("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, "password_resets"),
                where("email", "==", email),
                where("code", "==", otp.join("")),
                where("used", "==", false),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await updateDoc(doc(db, "password_resets", querySnapshot.docs[0].id), {
                    used: true
                });
            }

            toast.success("Password successfully synchronized.");
            setTimeout(() => navigate("/login"), 2000);

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
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-[#e9c49a]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-blue-900/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-md w-full relative z-10 space-y-12">
                <div className="space-y-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-3 text-[#e9c49a]"
                    >
                        <KeyRound className="w-6 h-6" />
                    </motion.div>
                    <h1 className="text-4xl font-display font-light text-white tracking-tight">
                        {isOtpVerified ? "Configure Security." : "Verify Identity."}
                    </h1>
                    <p className="text-white/40 font-light text-sm">
                        {isOtpVerified
                            ? "Establish your new security credentials for the archive."
                            : `A 6-digit resonance code was sent to ${email}`}
                    </p>
                </div>

                {!isOtpVerified ? (
                    <div className="space-y-8">
                        <div className="flex justify-between gap-3">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={el => inputRefs.current[idx] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className="w-12 h-16 sm:w-14 sm:h-20 bg-white/[0.03] border border-white/10 rounded-2xl text-center text-2xl text-white font-display focus:outline-none focus:border-[#e9c49a] focus:bg-white/[0.06] transition-all"
                                    value={digit}
                                    onChange={e => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={e => handleKeyDown(idx, e)}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={verifyOtp}
                            disabled={loading}
                            className="w-full h-14 bg-white hover:bg-[#e9c49a] text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? "Verifying..." : "Validate Code"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <button
                            className="w-full text-white/20 hover:text-white text-xs font-light transition-colors flex items-center justify-center gap-2"
                            onClick={() => navigate("/forgot-password")}
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Resend Transmission
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#e9c49a] transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#e9c49a]/40 focus:bg-white/[0.06] transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#e9c49a] hover:bg-white text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-[0_20px_40px_rgba(233,196,154,0.1)]"
                        >
                            {loading ? "Synchronizing..." : "Finalize Reset"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
