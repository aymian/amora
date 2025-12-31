import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle2,
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
    RefreshCw,
    ShieldCheck,
    Zap
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
    verifiedAt?: Timestamp;
    verifiedBy?: string;
    verificationNotes?: string;
}

const planDetails: Record<string, { name: string; price: string; color: string }> = {
    pro: { name: "Pro Protocol", price: "17,000 FRW", color: "#e9c49a" },
    elite: { name: "Elite Protocol", price: "34,000 FRW", color: "#d4af37" },
    creator: { name: "Creator Protocol", price: "65,000 FRW", color: "#c0c0c0" }
};

export default function PaymentApproval() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [filterStatus, setFilterStatus] = useState<"verified" | "approved">("verified");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "payments"),
            where("status", "==", "verified")
        );

        // Note: For now we fetch all and filter in UI to avoid complexity with indices
        const allQuery = query(collection(db, "payments"));

        const unsubscribe = onSnapshot(allQuery, (snapshot) => {
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

    const filteredPayments = payments.filter(payment => {
        const matchesStatus = payment.status === filterStatus;
        const matchesSearch =
            payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleAction = async (paymentId: string, action: "approve" | "reject") => {
        if (!selectedPayment) return;

        try {
            const workerEmail = auth.currentUser?.email || localStorage.getItem("amora_worker_email") || "approver";

            if (action === "approve") {
                // 1. Mark as approved (final state)
                await updateDoc(doc(db, "payments", paymentId), {
                    status: "approved", // This is the 'completed' state now
                    finalApprovedAt: serverTimestamp(),
                    finalApprovedBy: workerEmail
                });

                // 2. Trigger Plan Upgrade
                await updateDoc(doc(db, "users", selectedPayment.userId), {
                    plan: selectedPayment.plan,
                    lastUpgradeAt: serverTimestamp(),
                    isSubscribed: true
                });

                toast.success("Payment Approved", {
                    description: `User plan upgraded to ${selectedPayment.plan.toUpperCase()}.`
                });
            } else {
                await updateDoc(doc(db, "payments", paymentId), {
                    status: "rejected",
                    rejectedAt: serverTimestamp(),
                    rejectedBy: workerEmail
                });
                toast.error("Payment Rejected");
            }

            setSelectedPayment(null);
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Process Failed");
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
                    <button onClick={() => navigate("/workers/dashboard")} className="flex items-center gap-3 text-white/40 hover:text-[#e9c49a] transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Back</span>
                    </button>
                    <div className="h-8 w-px bg-white/5" />
                    <Logo className="h-6 opacity-80" />
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Active Protocol</span>
                        <span className="text-sm font-medium text-[#e9c49a]">Payment Approver</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9c49a]/10 border border-[#e9c49a]/20">
                    <Zap className="w-3 h-3 text-[#e9c49a]" />
                    <span className="text-[9px] uppercase tracking-widest text-[#e9c49a] font-bold">Upgrade Rights Active</span>
                </div>
            </header>

            <div className="max-w-[1800px] mx-auto p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            type="text"
                            placeholder="Search verified payments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-[#e9c49a]/40"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 p-1 rounded-2xl">
                        {["verified", "approved"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold font-sans",
                                    filterStatus === status ? "bg-[#e9c49a] text-black" : "text-white/40 hover:text-white"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 px-2">Approval Queue</h2>
                        <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    onClick={() => setSelectedPayment(payment)}
                                    className={cn(
                                        "p-6 rounded-[2rem] border cursor-pointer transition-all",
                                        selectedPayment?.id === payment.id ? "bg-[#e9c49a]/10 border-[#e9c49a]/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{payment.userName}</span>
                                        <span className="text-lg font-display text-[#e9c49a]">{payment.amount}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] text-white/30">
                                        <span className="flex items-center gap-1 font-mono uppercase"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified</span>
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
                                    <div className="p-6 rounded-2xl bg-[#e9c49a]/5 border border-[#e9c49a]/10">
                                        <div className="flex items-center gap-2 text-[#e9c49a] mb-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold">Plan Upgrade Protocol</span>
                                        </div>
                                        <p className="text-sm text-white/80">
                                            Approving this will instantly upgrade the user to <strong>{planDetails[selectedPayment.plan]?.name}</strong>.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase tracking-widest text-white/30">User</label>
                                            <p className="text-white">{selectedPayment.userName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase tracking-widest text-white/30">Target Plan</label>
                                            <p className="text-[#e9c49a]">{planDetails[selectedPayment.plan]?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase tracking-widest text-white/30">Amount</label>
                                            <p className="text-white">{selectedPayment.amount}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase tracking-widest text-white/30">Verified By</label>
                                            <p className="text-white/60 text-xs truncate">{selectedPayment.verifiedBy || "System"}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => handleAction(selectedPayment.id, "reject")}
                                            className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold hover:bg-red-500/20 transition-all"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedPayment.id, "approve")}
                                            className="flex-1 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Approve & Upgrade
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-[#070707] border border-white/10 rounded-[3rem] p-20 text-center">
                                    <ShieldCheck className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                    <p className="text-white/20 text-sm">Select a verified payment to finalize</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
