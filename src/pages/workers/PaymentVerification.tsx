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
    Image as ImageIcon,
    Smartphone,
    ArrowLeft,
    Filter,
    Search,
    RefreshCw,
    Flag
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
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
    status: "pending" | "verified" | "approved" | "rejected";
    createdAt: Timestamp;
    verifiedAt?: Timestamp;
    verifiedBy?: string;
    verificationNotes?: string;
    flags?: string[];
}

const planDetails: Record<string, { name: string; price: string; color: string }> = {
    pro: { name: "Pro Protocol", price: "17,000 FRW", color: "#e9c49a" },
    elite: { name: "Elite Protocol", price: "34,000 FRW", color: "#d4af37" },
    creator: { name: "Creator Protocol", price: "65,000 FRW", color: "#c0c0c0" }
};

export default function PaymentVerification() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [verificationNotes, setVerificationNotes] = useState("");
    const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const flagOptions = [
        "Duplicate Payment",
        "Amount Mismatch",
        "Invalid Screenshot",
        "Name Mismatch",
        "Suspicious Activity",
        "Incomplete Information"
    ];

    useEffect(() => {
        const q = query(
            collection(db, "payments")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPayments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Payment[];

            // Sort client-side to avoid index requirements
            fetchedPayments.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                return bTime - aTime; // Descending order (newest first)
            });

            setPayments(fetchedPayments);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredPayments = payments.filter(payment => {
        const matchesStatus = filterStatus === "all" ||
            payment.status === filterStatus ||
            (filterStatus === 'approved' && payment.status === 'verified');
        const matchesSearch =
            payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.momoNumber.includes(searchQuery) ||
            payment.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleVerify = async (paymentId: string, action: "verify" | "reject") => {
        if (!selectedPayment) return;

        try {
            const workerEmail = localStorage.getItem("amora_worker_email") || "unknown";

            // 1. Update Payment Record
            await updateDoc(doc(db, "payments", paymentId), {
                status: action === "verify" ? "approved" : "rejected",
                approvedAt: action === "verify" ? serverTimestamp() : null,
                verifiedAt: serverTimestamp(),
                verifiedBy: workerEmail,
                verificationNotes: verificationNotes || null,
                flags: selectedFlags.length > 0 ? selectedFlags : null
            });

            // 2. If verified/approved, auto-upgrade User Plan in real-time
            if (action === "verify") {
                await updateDoc(doc(db, "users", selectedPayment.userId), {
                    plan: selectedPayment.plan,
                    lastUpgradeAt: serverTimestamp(),
                    isSubscribed: true
                });
            }

            toast.success(
                action === "verify" ? "Payment Approved" : "Payment Rejected",
                {
                    description: action === "verify"
                        ? `User plan has been upgraded to ${selectedPayment.plan.toUpperCase()}.`
                        : "Payment has been flagged and rejected."
                }
            );

            setSelectedPayment(null);
            setVerificationNotes("");
            setSelectedFlags([]);
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Bridge Link Failed", {
                description: "Failed to synchronize status. Please check your connection."
            });
        }
    };

    const getTimeElapsed = (timestamp: Timestamp) => {
        if (!timestamp) return "Unknown";
        const now = Date.now();
        const created = timestamp.toMillis();
        const diff = now - created;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return "Just now";
    };

    const pendingCount = payments.filter(p => p.status === "pending").length;
    const approvedCount = payments.filter(p => p.status === "approved" || p.status === "verified").length;
    const rejectedCount = payments.filter(p => p.status === "rejected").length;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Header */}
            <header className="h-20 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/workers/dashboard")}
                        className="flex items-center gap-3 text-white/40 hover:text-[#e9c49a] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Back to Dashboard</span>
                    </button>
                    <div className="h-8 w-px bg-white/5" />
                    <Logo className="h-6 opacity-80" />
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Active Protocol</span>
                        <span className="text-sm font-medium text-[#e9c49a]">Payment Verifier</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] uppercase tracking-widest text-white/40">Live Queue</span>
                    </div>
                </div>
            </header>

            <div className="max-w-[1800px] mx-auto p-10 pb-20">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-[#070707] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Pending</span>
                            <Clock className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="text-3xl font-display text-yellow-500">{pendingCount}</div>
                    </div>
                    <div className="bg-[#070707] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Approved</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-display text-emerald-500">{approvedCount}</div>
                    </div>
                    <div className="bg-[#070707] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Rejected</span>
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="text-3xl font-display text-red-500">{rejectedCount}</div>
                    </div>
                    <div className="bg-[#070707] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total</span>
                            <FileText className="w-4 h-4 text-[#e9c49a]" />
                        </div>
                        <div className="text-3xl font-display text-[#e9c49a]">{payments.length}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or payment ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-[#e9c49a]/40 transition-colors placeholder:text-white/20"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 p-1 rounded-2xl">
                        {["all", "pending", "approved"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all",
                                    filterStatus === status || (status === 'approved' && filterStatus as string === 'verified')
                                        ? "bg-[#e9c49a] text-black"
                                        : "text-white/40 hover:text-white"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <button className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all">
                        <RefreshCw className="w-4 h-4 text-white/40" />
                    </button>
                </div>

                {/* Payment List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* List View */}
                    <div className="space-y-4">
                        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 px-2">
                            Payment Queue ({filteredPayments.length})
                        </h2>
                        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar pr-2">
                            {loading ? (
                                <div className="text-center py-20 text-white/20">Loading payments...</div>
                            ) : filteredPayments.length === 0 ? (
                                <div className="text-center py-20 text-white/20">No payments found</div>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <motion.div
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setSelectedPayment(payment)}
                                        className={cn(
                                            "p-6 rounded-[2rem] border cursor-pointer transition-all",
                                            selectedPayment?.id === payment.id
                                                ? "bg-[#e9c49a]/10 border-[#e9c49a]/30"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-white">{payment.userName}</span>
                                                    <span className={cn(
                                                        "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md border font-bold",
                                                        payment.status === "pending" ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" :
                                                            (payment.status === "approved" || payment.status === "verified") ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" :
                                                                "text-red-400 border-red-400/20 bg-red-400/5"
                                                    )}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-white/40 font-mono">{payment.userEmail}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-display text-[#e9c49a]">{payment.amount}</div>
                                                <div className="text-[9px] text-white/30 uppercase tracking-widest">
                                                    {planDetails[payment.plan]?.name || payment.plan}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] text-white/30">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getTimeElapsed(payment.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Hash className="w-3 h-3" />
                                                {payment.id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Detail View */}
                    <div className="sticky top-32">
                        <AnimatePresence mode="wait">
                            {selectedPayment ? (
                                <motion.div
                                    key={selectedPayment.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-[#070707] border border-white/10 rounded-[3rem] p-8 space-y-8"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-display text-white">Payment Details</h3>
                                        <button
                                            onClick={() => setSelectedPayment(null)}
                                            className="p-2 rounded-xl hover:bg-white/5 transition-all"
                                        >
                                            <XCircle className="w-5 h-5 text-white/40" />
                                        </button>
                                    </div>

                                    {/* Screenshot Preview */}
                                    {selectedPayment.screenshotUrl && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">
                                                Payment Screenshot
                                            </label>
                                            <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
                                                <img
                                                    src={selectedPayment.screenshotUrl}
                                                    alt="Payment proof"
                                                    className="w-full h-auto"
                                                />
                                                <a
                                                    href={selectedPayment.screenshotUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <Eye className="w-8 h-8 text-white" />
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                <User className="w-3 h-3" /> User Name
                                            </label>
                                            <p className="text-sm text-white">{selectedPayment.userName}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                <User className="w-3 h-3" /> Sender Name
                                            </label>
                                            <p className="text-sm text-white">{selectedPayment.senderName}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                <Smartphone className="w-3 h-3" /> MoMo Number
                                            </label>
                                            <p className="text-sm text-white font-mono">{selectedPayment.momoNumber}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                <DollarSign className="w-3 h-3" /> Amount
                                            </label>
                                            <p className="text-sm text-[#e9c49a] font-display">{selectedPayment.amount}</p>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Submitted
                                            </label>
                                            <p className="text-sm text-white">
                                                {selectedPayment.createdAt?.toDate().toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Flags */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                            <Flag className="w-3 h-3" /> Flag Issues (Optional)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {flagOptions.map((flag) => (
                                                <button
                                                    key={flag}
                                                    onClick={() => {
                                                        setSelectedFlags(prev =>
                                                            prev.includes(flag)
                                                                ? prev.filter(f => f !== flag)
                                                                : [...prev, flag]
                                                        );
                                                    }}
                                                    className={cn(
                                                        "px-3 py-2 rounded-xl text-[9px] uppercase tracking-widest font-bold border transition-all",
                                                        selectedFlags.includes(flag)
                                                            ? "bg-red-500/20 border-red-500/40 text-red-400"
                                                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                                    )}
                                                >
                                                    {flag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">
                                            Verification Notes
                                        </label>
                                        <textarea
                                            value={verificationNotes}
                                            onChange={(e) => setVerificationNotes(e.target.value)}
                                            placeholder="Add internal notes about this verification..."
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#e9c49a]/40 transition-colors placeholder:text-white/20 min-h-[100px] resize-none"
                                        />
                                    </div>

                                    {/* Actions */}
                                    {selectedPayment.status === "pending" && (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleVerify(selectedPayment.id, "reject")}
                                                className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleVerify(selectedPayment.id, "verify")}
                                                className="flex-1 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Approve
                                            </button>
                                        </div>
                                    )}

                                    {selectedPayment.status !== "pending" && (
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-2 text-[10px] text-white/40">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>
                                                    {(selectedPayment.status === "approved" || selectedPayment.status === "verified") ? "Approved" : "Rejected"} by{" "}
                                                    <strong className="text-white">{selectedPayment.verifiedBy}</strong>
                                                </span>
                                            </div>
                                            {selectedPayment.verificationNotes && (
                                                <p className="mt-2 text-sm text-white/60 italic">
                                                    "{selectedPayment.verificationNotes}"
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-[#070707] border border-white/10 rounded-[3rem] p-20 text-center"
                                >
                                    <Eye className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                    <p className="text-white/20 text-sm">Select a payment to view details</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
