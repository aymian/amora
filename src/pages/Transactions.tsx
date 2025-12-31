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
    Calendar,
    Hash,
    Flag,
    Download,
    RefreshCw,
    ArrowLeft,
    Shield,
    Smartphone,
    User
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

interface Transaction {
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

export default function Transactions() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserData({ id: user.uid, email: user.email });

                // Fetch user's transactions
                const q = query(
                    collection(db, "payments"),
                    where("userId", "==", user.uid)
                );

                const unsubTransactions = onSnapshot(q, (snapshot) => {
                    const fetchedTransactions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Transaction[];

                    // Sort client-side to avoid composite index requirements
                    fetchedTransactions.sort((a, b) => {
                        const aTime = a.createdAt?.toMillis() || 0;
                        const bTime = b.createdAt?.toMillis() || 0;
                        return bTime - aTime; // Descending order (newest first)
                    });

                    setTransactions(fetchedTransactions);
                    setLoading(false);
                });

                return () => unsubTransactions();
            } else {
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "verified":
                return <Shield className="w-5 h-5 text-blue-500" />;
            case "approved":
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case "rejected":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-white/20" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "text-yellow-400 border-yellow-400/20 bg-yellow-400/5";
            case "verified":
                return "text-blue-400 border-blue-400/20 bg-blue-400/5";
            case "approved":
                return "text-emerald-400 border-emerald-400/20 bg-emerald-400/5";
            case "rejected":
                return "text-red-400 border-red-400/20 bg-red-400/5";
            default:
                return "text-white/40 border-white/10 bg-white/5";
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case "pending":
                return "Your payment is being reviewed by our verification team.";
            case "verified":
                return "Your payment has been verified and is awaiting final approval.";
            case "approved":
                return "Your payment has been verified! Your account has been upgraded.";
            case "rejected":
                return "Your payment was rejected. Please review the notes below.";
            default:
                return "Status unknown";
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

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return "Just now";
    };

    const pendingCount = transactions.filter(t => t.status === "pending").length;
    const verifiedCount = transactions.filter(t => t.status === "approved" || t.status === "verified").length;
    const rejectedCount = transactions.filter(t => t.status === "rejected").length;

    if (loading) {
        return (
            <DashboardLayout user={userData}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-white/20">Loading transactions...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={userData}>
            <div className="min-h-screen py-20 px-6 max-w-7xl mx-auto space-y-12 pb-40">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-3 text-white/40 hover:text-[#e9c49a] transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Back to Dashboard</span>
                        </button>
                    </div>
                    <h1 className="text-4xl font-display font-light text-white tracking-tight">
                        Payment <span className="text-[#e9c49a] italic">Transactions</span>
                    </h1>
                    <p className="text-white/40 text-sm font-light">
                        Track all your payment submissions and their verification status.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total</span>
                            <FileText className="w-4 h-4 text-[#e9c49a]" />
                        </div>
                        <div className="text-3xl font-display text-[#e9c49a]">{transactions.length}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Pending</span>
                            <Clock className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="text-3xl font-display text-yellow-500">{pendingCount}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Verified</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-display text-emerald-500">{verifiedCount}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Rejected</span>
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="text-3xl font-display text-red-500">{rejectedCount}</div>
                    </div>
                </div>

                {/* Transactions List */}
                {transactions.length === 0 ? (
                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-20 text-center">
                        <FileText className="w-16 h-16 text-white/10 mx-auto mb-6" />
                        <h3 className="text-xl font-display text-white/40 mb-2">No Transactions Yet</h3>
                        <p className="text-white/20 text-sm mb-8">
                            You haven't made any payment submissions yet.
                        </p>
                        <button
                            onClick={() => navigate("/upgrade")}
                            className="px-8 py-4 rounded-2xl bg-[#e9c49a] text-black font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-white transition-all"
                        >
                            Upgrade Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* List View */}
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedTransaction(transaction)}
                                    className={cn(
                                        "p-6 rounded-[2rem] border cursor-pointer transition-all",
                                        selectedTransaction?.id === transaction.id
                                            ? "bg-[#e9c49a]/10 border-[#e9c49a]/30"
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(transaction.status)}
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-white">
                                                        {planDetails[transaction.plan]?.name || transaction.plan}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md border font-bold",
                                                        getStatusColor(transaction.status)
                                                    )}>
                                                        {transaction.status === 'approved' ? 'verified' : transaction.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-white/40">
                                                    {getTimeElapsed(transaction.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-display text-[#e9c49a]">{transaction.amount}</div>
                                        </div>
                                    </div>

                                    {transaction.flags && transaction.flags.length > 0 && (
                                        <div className="flex items-center gap-2 mt-3 p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <Flag className="w-3 h-3 text-red-400" />
                                            <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold">
                                                {transaction.flags.length} Flag{transaction.flags.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-[10px] text-white/30 mt-3">
                                        <span className="flex items-center gap-1">
                                            <Hash className="w-3 h-3" />
                                            {transaction.id.slice(-8).toUpperCase()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {transaction.createdAt?.toDate().toLocaleDateString()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Detail View */}
                        <div className="sticky top-32">
                            <AnimatePresence mode="wait">
                                {selectedTransaction ? (
                                    <motion.div
                                        key={selectedTransaction.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 space-y-8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-display text-white">Transaction Details</h3>
                                            <button
                                                onClick={() => setSelectedTransaction(null)}
                                                className="p-2 rounded-xl hover:bg-white/5 transition-all"
                                            >
                                                <XCircle className="w-5 h-5 text-white/40" />
                                            </button>
                                        </div>

                                        {/* Status Banner */}
                                        <div className={cn(
                                            "p-6 rounded-2xl border",
                                            selectedTransaction.status === "approved" ? "bg-emerald-500/10 border-emerald-500/20" :
                                                selectedTransaction.status === "rejected" ? "bg-red-500/10 border-red-500/20" :
                                                    selectedTransaction.status === "verified" ? "bg-blue-500/10 border-blue-500/20" :
                                                        "bg-yellow-500/10 border-yellow-500/20"
                                        )}>
                                            <div className="flex items-center gap-3 mb-2">
                                                {getStatusIcon(selectedTransaction.status)}
                                                <span className="text-sm font-medium text-white uppercase tracking-widest">
                                                    {selectedTransaction.status === 'approved' ? 'verified' : selectedTransaction.status}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-white/60 leading-relaxed">
                                                {getStatusMessage(selectedTransaction.status)}
                                            </p>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">
                                                Payment Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                        <DollarSign className="w-3 h-3" /> Plan
                                                    </label>
                                                    <p className="text-sm text-white">{planDetails[selectedTransaction.plan]?.name}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                        <DollarSign className="w-3 h-3" /> Amount
                                                    </label>
                                                    <p className="text-sm text-[#e9c49a] font-display">{selectedTransaction.amount}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                        <Smartphone className="w-3 h-3" /> MoMo Number
                                                    </label>
                                                    <p className="text-sm text-white font-mono">{selectedTransaction.momoNumber}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                        <User className="w-3 h-3" /> Sender Name
                                                    </label>
                                                    <p className="text-sm text-white">{selectedTransaction.senderName}</p>
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" /> Submitted
                                                    </label>
                                                    <p className="text-sm text-white">
                                                        {selectedTransaction.createdAt?.toDate().toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Flags */}
                                        {selectedTransaction.flags && selectedTransaction.flags.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                    <Flag className="w-3 h-3" /> Flagged Issues
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedTransaction.flags.map((flag, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                                                        >
                                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                                            <span className="text-[11px] text-red-400 font-medium">{flag}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Verification Notes */}
                                        {selectedTransaction.verificationNotes && (
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 flex items-center gap-2">
                                                    <FileText className="w-3 h-3" /> Verification Notes
                                                </h4>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <p className="text-sm text-white/80 italic leading-relaxed">
                                                        "{selectedTransaction.verificationNotes}"
                                                    </p>
                                                    {selectedTransaction.verifiedBy && (
                                                        <p className="text-[9px] text-white/30 uppercase tracking-widest mt-3">
                                                            — Verified by {selectedTransaction.verifiedBy}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Screenshot */}
                                        {selectedTransaction.screenshotUrl && (
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30">
                                                    Payment Screenshot
                                                </h4>
                                                <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
                                                    <img
                                                        src={selectedTransaction.screenshotUrl}
                                                        alt="Payment proof"
                                                        className="w-full h-auto"
                                                    />
                                                    <a
                                                        href={selectedTransaction.screenshotUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <Eye className="w-8 h-8 text-white" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {selectedTransaction.status === "rejected" && (
                                            <button
                                                onClick={() => navigate("/upgrade")}
                                                className="w-full py-4 rounded-2xl bg-[#e9c49a] text-black font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-white transition-all"
                                            >
                                                Submit New Payment
                                            </button>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-20 text-center"
                                    >
                                        <Eye className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                        <p className="text-white/20 text-sm">Select a transaction to view details</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
