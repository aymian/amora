
import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Bell, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications() {
    const navigate = useNavigate();
    const { user }: { user: any } = useOutletContext();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(db, "notifications"),
            where("recipientId", "==", user.id),
            limit(50)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort
            fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setNotifications(fetched);
        });

        return () => unsub();
    }, [user?.id]);

    const handleApprove = async (notif: any) => {
        if (!user?.id) return;
        try {
            const followDocId = `${notif.senderId}_${user.id}`;
            await setDoc(doc(db, "follows", followDocId), {
                followerId: notif.senderId,
                followingId: user.id,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "notifications", notif.id), { status: "approved" });

            // Send confirmation back
            const confirmationId = `SYNC-${Date.now()}`;
            await setDoc(doc(db, "notifications", confirmationId), {
                id: confirmationId,
                type: "alert",
                senderId: user.id,
                senderName: user.fullName || "Citizen",
                senderPhoto: user.photoURL || "",
                recipientId: notif.senderId,
                message: "approved your resonance request. You are now following each other.",
                status: "read",
                createdAt: serverTimestamp()
            });

            toast.success("Resonance Approved", {
                description: `You have successfully synchronized with ${notif.senderName}.`
            });
        } catch (error) {
            console.error("Approval failed:", error);
            toast.error("Approval failed");
        }
    };

    const handleDecline = async (notif: any) => {
        if (!user?.id) return;
        try {
            await updateDoc(doc(db, "notifications", notif.id), { status: "declined" });
            toast.error("Frequency Refused", {
                description: "The identity request has been terminated."
            });
        } catch (error) {
            console.error("Decline failed:", error);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp?.seconds) return 'Just now';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString();
    };

    // Separate requests and other notifications, or just show mixed list with different UI?
    // User requested "showing all following requests". I should prioritize them or filter.
    // I will show a section for "Pending Requests" and then "Recent Activity".

    const pendingRequests = notifications.filter(n => n.type === 'follow_request' && n.status === 'pending');
    const otherNotifications = notifications.filter(n => !(n.type === 'follow_request' && n.status === 'pending'));

    return (
        <div className="w-full max-w-4xl mx-auto py-10 px-6 space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl font-light text-white tracking-tight flex items-center gap-4">
                    <Bell className="w-10 h-10 text-[#e9c49a]" />
                    Notifications
                </h1>
                <p className="text-white/40 font-light max-w-2xl">
                    Manage your incoming resonance frequencies and identity alerts.
                </p>
            </div>

            {/* Pending Requests Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#e9c49a]">Pending Requests</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#e9c49a]/20 to-transparent" />
                </div>

                <div className="grid gap-4">
                    <AnimatePresence>
                        {pendingRequests.length > 0 ? (
                            pendingRequests.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6 group hover:bg-white/[0.07] transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e9c49a]/5 blur-[50px] rounded-full pointer-events-none" />

                                    <Avatar
                                        className="w-16 h-16 rounded-2xl border border-white/10 shadow-xl cursor-pointer hover:border-[#e9c49a] transition-all"
                                        onClick={() => navigate(`/@${notif.senderName}`)}
                                    >
                                        <AvatarImage src={notif.senderPhoto} />
                                        <AvatarFallback className="bg-[#1a100a] text-[#e9c49a] text-xl">
                                            {notif.senderName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="text-lg font-medium text-white group-hover:text-[#e9c49a] transition-colors cursor-pointer hover:underline decoration-[#e9c49a]/50 underline-offset-4"
                                            onClick={() => navigate(`/@${notif.senderName}`)}
                                        >
                                            {notif.senderName}
                                        </h3>
                                        <p className="text-white/40 font-light text-sm mt-1">
                                            Requested permission to follow your resonance stream.
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/20 uppercase font-bold tracking-widest">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(notif.createdAt)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDecline(notif)}
                                            className="w-12 h-12 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                            title="Decline Request"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleApprove(notif)}
                                            className="h-12 px-6 rounded-full bg-[#e9c49a] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg hover:shadow-[#e9c49a]/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                                        >
                                            <Check className="w-4 h-4" /> Approve
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-10 rounded-[2rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                                <p className="text-white/20 text-sm font-light italic">No pending identity requests.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Other Notifications Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/20">Activity Log</h2>
                    <div className="h-[1px] flex-1 bg-white/5" />
                </div>

                <div className="space-y-4">
                    {otherNotifications.length > 0 ? (
                        otherNotifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={cn(
                                    "p-5 rounded-3xl border flex items-start gap-5 transition-all",
                                    notif.status === 'unread' ? "bg-white/[0.02] border-white/10" : "bg-transparent border-transparent hover:bg-white/[0.01]"
                                )}
                            >
                                <Avatar
                                    className="w-12 h-12 rounded-xl mt-1 border border-white/5 cursor-pointer hover:border-[#e9c49a] transition-all"
                                    onClick={() => navigate(`/@${notif.senderName}`)}
                                >
                                    <AvatarImage src={notif.senderPhoto} />
                                    <AvatarFallback className="bg-white/5 text-[10px]">{notif.senderName?.[0]}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <p className="text-sm text-white/80 leading-relaxed">
                                        <span
                                            className="font-bold text-white cursor-pointer hover:text-[#e9c49a] hover:underline transition-all"
                                            onClick={() => navigate(`/@${notif.senderName}`)}
                                        >
                                            {notif.senderName}
                                        </span>
                                        {notif.type === 'follow_request'
                                            ? (notif.status === 'approved' ? " is now following you." : " request was declined.")
                                            : ` ${notif.message}`
                                        }
                                    </p>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">{formatTime(notif.createdAt)}</p>
                                </div>

                                {(notif.type === 'alert' || (notif.type === 'follow_request' && notif.status === 'approved')) && (
                                    <button className="p-3 rounded-full bg-white/5 text-white/40 hover:text-[#e9c49a] hover:bg-[#e9c49a]/10 transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-white/20 font-light">Your frequency bands are clear.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
