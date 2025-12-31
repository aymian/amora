import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    XCircle,
    Clock,
    AlertTriangle,
    Eye,
    FileText,
    DollarSign,
    User,
    Calendar,
    Hash,
    Smartphone,
    ArrowLeft,
    Search,
    Flag,
    AlertOctagon,
    Ban,
    RefreshCw,

} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

interface Payment {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    senderName: string;
    plan: string;
    amount: string;
    method: string;
    momoNumber: string;
    screenshotUrl: string;
    status: "pending" | "verified" | "approved" | "rejected" | "investigating" | "verifying";
    createdAt: Timestamp;
}

const REJECTION_REASONS = [
    "Invalid Screenshot / Blur",
    "Amount Mismatch",
    "Sender Name Mismatch",
    "Duplicate Transaction",
    "Old / Reused Receipt",
    "Transaction Not Found in MoMo",
    "Wrong Payment Method",
    "Suspected Fraud"
];

export default function PaymentRejection() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [customReason, setCustomReason] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "payments"),
            where("status", "==", "investigating")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPayments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Payment[];

            fetchedPayments.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                return bTime - aTime;
            });

            setPayments(fetchedPayments);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredPayments = payments.filter(payment =>
        payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleReason = (reason: string) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(selectedReasons.filter(r => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const handleAction = async (action: "reject" | "verify") => {
        if (!selectedPayment) return;

        try {
            const workerEmail = auth.currentUser?.email || localStorage.getItem("amora_worker_email") || "rejector";

            if (action === "reject") {
                if (selectedReasons.length === 0 && !customReason) {
                    toast.error("Please provide at least one reason for rejection.");
                    return;
                }

                await updateDoc(doc(db, "payments", selectedPayment.id), {
                    status: "rejected",
                    rejectedAt: serverTimestamp(),
                    rejectedBy: workerEmail,
                    rejectionReasons: selectedReasons,
                    verificationNotes: customReason || null,
                    flags: selectedReasons
                });

                toast.error("Payment Rejected");
            } else {
                await updateDoc(doc(db, "payments", selectedPayment.id), {
                    status: "verifying",
                    investigatedAt: serverTimestamp(),
                    investigatedBy: workerEmail,
                    investigationNotes: "Marked as valid by Rejector. Returning to Verifier."
                });
                toast.success("Sent to Verifier", {
                    description: "Proof marks as valid. Returning to Verification queue."
                });
            }

            setSelectedPayment(null);
            setSelectedReasons([]);
            setCustomReason("");
        } catch (error) {
            console.error("Action error:", error);
            toast.error("Process failed.");
        }
    };

    const getTimeElapsed = (timestamp: Timestamp) => {
        if (!timestamp) return "Unknown";
        const diff = Date.now() - timestamp.toMillis();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            <header className="h-20 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate("/workers/dashboard")} className="flex items-center gap-3 text-white/40 hover:text-red-400 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Back</span>
                    </button>
                    <div className="h-8 w-px bg-white/5" />
                    <Logo className="h-6 opacity-80" />
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Active Protocol</span>
                        <span className="text-sm font-medium text-red-400">Payment Rejector</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <AlertOctagon className="w-3 h-3 text-red-400" />
                    <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold">Enforcement Active</span>
                </div>
            </header>

            <div className="max-w-[1800px] mx-auto p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            type="text"
                            placeholder="Identify invalid payments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-500/40"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 px-2">Investigation Queue</h2>
                        <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    onClick={() => setSelectedPayment(payment)}
                                    className={cn(
                                        "p-6 rounded-[2rem] border cursor-pointer transition-all",
                                        selectedPayment?.id === payment.id ? "bg-red-500/10 border-red-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{payment.userName}</span>
                                        <span className="text-lg font-display text-white/60">{payment.amount}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] text-white/30">
                                        <span className="flex items-center gap-1 font-mono uppercase text-orange-400"><AlertTriangle className="w-3 h-3" /> Investigating</span>
                                        <span>{getTimeElapsed(payment.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sticky top-32">
                        <AnimatePresence mode="wait">
                            {selectedPayment ? (
                                <motion.div
                                    key={selectedPayment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#070707] border border-white/10 rounded-[3rem] p-8 space-y-6"
                                >
                                    {/* Proof Preview */}
                                    <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black flex items-center justify-center group">
                                        <img src={selectedPayment.screenshotUrl} alt="Invalid Proof" className="w-full h-full object-contain" />
                                        <a href={selectedPayment.screenshotUrl} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <Eye className="w-8 h-8 text-white" />
                                        </a>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Select Rejection Reasons</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {REJECTION_REASONS.map(reason => (
                                                <button
                                                    key={reason}
                                                    onClick={() => toggleReason(reason)}
                                                    className={cn(
                                                        "p-3 rounded-xl text-[10px] text-left border transition-all",
                                                        selectedReasons.includes(reason) ? "bg-red-500/20 border-red-500 text-red-500" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                                                    )}
                                                >
                                                    {reason}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Additional Feedback (Optional)</label>
                                        <textarea
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder="Write specific notes to the user..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-red-500/50 min-h-[100px] resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleAction("verify")}
                                            className="flex-1 py-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" /> Send to Verifier
                                        </button>
                                        <button
                                            onClick={() => handleAction("reject")}
                                            className="flex-2 py-5 rounded-2xl bg-red-500 text-white font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(239,68,68,0.2)]"
                                        >
                                            <Ban className="w-4 h-4" /> Finalize Rejection
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-[#070707] border border-white/10 rounded-[3rem] p-20 text-center">
                                    <XCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                    <p className="text-white/20 text-sm">Select a payment to process rejection</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
