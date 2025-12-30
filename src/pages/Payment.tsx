import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CreditCard,
    ShieldCheck,
    Lock,
    ArrowLeft,
    Sparkles,
    Activity,
    Smartphone,
    Globe,
    CheckCircle2
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const planDetails = {
    pro: { name: "Pro Protocol", price: "17,000 FRW", color: "#e9c49a" },
    elite: { name: "Elite Protocol", price: "34,000 FRW", color: "#d4af37" },
    creator: { name: "Creator Protocol", price: "65,000 FRW", color: "#c0c0c0" }
};

export default function Payment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tier = searchParams.get("tier") as keyof typeof planDetails || "pro";

    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
    const [momoNumber, setMomoNumber] = useState("");
    const [senderName, setSenderName] = useState("");
    const [screenshot, setScreenshot] = useState<File | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData({ id: user.uid, ...userDoc.data() });
            } else {
                navigate("/login");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const activePlan = planDetails[tier] || planDetails.pro;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData || !auth.currentUser) return;

        setProcessing(true);
        try {
            let screenshotUrl = "";

            // 1. Upload Screenshot if using MoMo
            if (paymentMethod === 'momo' && screenshot) {
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

                const formData = new FormData();
                formData.append('file', screenshot);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);
                formData.append('folder', 'amora_gallery');

                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    screenshotUrl = result.secure_url;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || "Screenshot upload failed");
                }
            }

            // 2. Log payment request in Firestore for admin verification
            const paymentId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            await setDoc(doc(db, "payments", paymentId), {
                id: paymentId,
                userId: auth.currentUser.uid,
                userEmail: userData.email,
                userName: userData.fullName,
                senderName: paymentMethod === 'momo' ? senderName : userData.fullName,
                plan: tier,
                amount: activePlan.price,
                method: paymentMethod,
                momoNumber: paymentMethod === 'momo' ? momoNumber : null,
                screenshotUrl,
                status: "pending",
                createdAt: serverTimestamp()
            });

            toast.success("Synchronization Request Submitted", {
                description: "Our core systems are verifying your resonance. Ascension will complete shortly."
            });

            navigate("/dashboard");
        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error("Synchronization Failed", {
                description: error.message || "The planetary link was interrupted. Please retry the ascension."
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return null;

    return (
        <DashboardLayout user={userData}>
            <div className="min-h-screen py-20 px-6 max-w-5xl mx-auto space-y-12 pb-40">
                {/* Header Navigation */}
                <button
                    onClick={() => navigate("/upgrade")}
                    className="flex items-center gap-3 text-white/40 hover:text-[#e9c49a] transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Return to Protocols</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Payment Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-7 space-y-10"
                    >
                        <header className="space-y-4">
                            <h1 className="text-4xl font-display font-light text-white tracking-tight">
                                Finalize <span className="text-[#e9c49a] italic">Ascension</span>
                            </h1>
                            <p className="text-white/40 text-sm font-light">
                                Authenticate your planetary credit or mobile synchronization to unlock the {activePlan.name}.
                            </p>
                        </header>

                        <form onSubmit={handlePayment} className="space-y-8">
                            <div className="space-y-8">
                                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e9c49a]/5 blur-3xl pointer-events-none" />
                                    <div className="flex items-center gap-4 text-[#e9c49a]">
                                        <Smartphone className="w-6 h-6" />
                                        <h2 className="text-xl font-display font-light">Manual Monetary Protocol</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-white/40 text-xs leading-relaxed">
                                            To synchronize your identity, please transmit the exact resonance amount to either of the following MTN verified nodes:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Node Alpha</span>
                                                <p className="text-[#e9c49a] font-mono font-bold">+250 792 898 287</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Node Beta</span>
                                                <p className="text-[#e9c49a] font-mono font-bold">+250 732 539 470</p>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-[#e9c49a]/10 border border-[#e9c49a]/20 text-center space-y-3">
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-[#e9c49a] font-bold">Transmission Sequence</span>
                                            <p className="text-white font-mono text-sm leading-relaxed">
                                                DIAL <span className="text-[#e9c49a] font-bold">*182*1*1*NUMBER*AMOUNT*PIN#</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Inputs */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 px-1">Source Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="The MoMo number you sent from"
                                            value={momoNumber}
                                            onChange={(e) => setMomoNumber(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-[#e9c49a]/40 transition-colors placeholder:text-white/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 px-1">Sender's Registration Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name as registered on MoMo"
                                            value={senderName}
                                            onChange={(e) => setSenderName(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-[#e9c49a]/40 transition-colors placeholder:text-white/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 px-1">Evidence Transmission Screenshot</label>
                                        <div className="relative group">
                                            <input
                                                required
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-[#e9c49a]/30 transition-all">
                                                <div className="p-3 rounded-full bg-white/5 text-white/40 group-hover:text-[#e9c49a] transition-colors">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-white/20 group-hover:text-white transition-colors">
                                                    {screenshot ? screenshot.name : "Upload Payment Confirmation Message Screenshot"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={processing}
                                className="w-full py-6 rounded-3xl bg-[#e9c49a] text-black font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[0_20px_40px_rgba(233,196,154,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                {processing ? (
                                    <>
                                        <Activity className="w-4 h-4 animate-spin" /> Verifying Resonance...
                                    </>
                                ) : (
                                    <>
                                        Complete Synchronization <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-6 text-white/20 italic font-light text-[10px]">
                                <span className="flex items-center gap-2"><Lock className="w-3 h-3" /> Shield-V4 Encrypted</span>
                                <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Planetary Standard</span>
                            </div>
                        </form>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="sticky top-10 space-y-6">
                            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 space-y-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#e9c49a]/5 to-transparent pointer-events-none" />

                                <div className="space-y-1 relative z-10">
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#e9c49a]/40">Ascension Summary</p>
                                    <h3 className="text-2xl font-display font-light text-white">{activePlan.name}</h3>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-sm font-light">
                                        <span className="text-white/40 italic">Protocol Access</span>
                                        <span className="text-white">Active</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-light pb-6 border-b border-white/5">
                                        <span className="text-white/40 italic">Verification Fee</span>
                                        <span className="text-white/20 line-through">2,000 FRW</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Total Resonance</span>
                                        <span className="text-3xl font-display font-light text-[#e9c49a]">{activePlan.price}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 relative z-10">
                                    <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                                        <Sparkles className="w-4 h-4 text-[#e9c49a]" /> Unlocked Protocols
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {["4K Projection", "Direct Messaging", "Priority Indexing"].map(f => (
                                            <div key={f} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] uppercase tracking-widest text-[#e9c49a] font-bold">
                                                <CheckCircle2 className="w-3 h-3" /> {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-[9px] uppercase tracking-tighter text-white/10 font-bold px-10">
                                By completing the synchronization, you agree to the Amora Directorial Terms of Service and planetary privacy protocols.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
