import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users,
    Heart,
    MessageCircle,
    Share2,
    ShieldCheck,
    Calendar,
    Globe,
    Zap,
    ArrowLeft,
    Play,
    Sparkles,
    UserPlus,
    Lock
} from "lucide-react";
import { doc, getDoc, collection, getDocs, query, where, limit, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userVideos, setUserVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'about'>('content');
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [privacyLoading, setPrivacyLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUser({ id: user.uid, ...userDoc.data() });
                }
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (!userId) return;

        // Real-time Follower Count
        const q = query(collection(db, "follows"), where("followingId", "==", userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setFollowerCount(snapshot.size);
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        if (!userId || !currentUser?.id) return;

        // Check if following
        const followDocId = `${currentUser.id}_${userId}`;
        const unsub = onSnapshot(doc(db, "follows", followDocId), (doc) => {
            setIsFollowing(doc.exists());
        });

        return () => unsub();
    }, [userId, currentUser?.id]);

    useEffect(() => {
        if (!userId || !currentUser?.id) return;

        // Check if follow request is pending
        const q = query(
            collection(db, "notifications"),
            where("type", "==", "follow_request"),
            where("senderId", "==", currentUser.id),
            where("recipientId", "==", userId),
            where("status", "==", "pending")
        );
        const unsub = onSnapshot(q, (snapshot) => {
            setRequestPending(!snapshot.empty);
        });

        return () => unsub();
    }, [userId, currentUser?.id]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                // Fetch User Profile
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({ id: userDoc.id, ...data });
                    setIsPrivate(data.isPrivate || false);
                }

                // Fetch User Content
                const q = query(collection(db, "gallery_videos"), where("creatorId", "==", userId));
                const snap = await getDocs(q);

                if (snap.empty) {
                    // Fallback to featured for now if no creator content
                    const fallbackQ = query(collection(db, "gallery_videos"), limit(12));
                    const fallbackSnap = await getDocs(fallbackQ);
                    setUserVideos(fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } else {
                    setUserVideos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }

            } catch (error) {
                console.error("Profile resonance failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleFollow = async () => {
        if (!currentUser || !userId || !profile) return;
        setFollowLoading(true);
        const followDocId = `${currentUser.id}_${userId}`;

        try {
            if (isFollowing) {
                await deleteDoc(doc(db, "follows", followDocId));
            } else if (profile.isPrivate) {
                if (requestPending) {
                    // Optionally cancel request
                } else {
                    // Create Follow Request Notification
                    const notifId = `REQ-${Date.now()}-${currentUser.id}`;
                    await setDoc(doc(db, "notifications", notifId), {
                        id: notifId,
                        type: "follow_request",
                        senderId: currentUser.id,
                        senderName: currentUser.fullName || "Anonymous Citizen",
                        senderPhoto: currentUser.photoURL || "",
                        recipientId: userId,
                        status: "pending",
                        createdAt: serverTimestamp()
                    });
                    toast.success("Identity Request Transmitted", {
                        description: "Your resonance request is awaiting citizen approval."
                    });
                }
            } else {
                await setDoc(doc(db, "follows", followDocId), {
                    followerId: currentUser.id,
                    followingId: userId,
                    createdAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Follow protocol failed:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const togglePrivacy = async () => {
        if (!currentUser || currentUser.id !== userId) return;
        setPrivacyLoading(true);
        const newPrivacy = !isPrivate;
        try {
            await setDoc(doc(db, "users", userId), { isPrivate: newPrivacy }, { merge: true });
            setIsPrivate(newPrivacy);
            toast.success(newPrivacy ? "Privacy Protocol Active" : "Public Resonance Enabled", {
                description: newPrivacy ? "Your profile is now de-indexed from unauthorized scouts." : "Your archival artifacts are now visible to the planetary grid."
            });
        } catch (error) {
            console.error("Privacy toggle failed:", error);
        } finally {
            setPrivacyLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold animate-pulse">Scanning Identity Frequency...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-4xl font-display font-light mb-4">Identity Not Found</h1>
                <p className="text-white/40 mb-8 uppercase tracking-widest text-[10px]">The requested citizen does not exist in the planetary registry.</p>
                <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full px-8">Return to Nexus</Button>
            </div>
        );
    }

    return (
        <DashboardLayout user={currentUser}>
            <div className="space-y-12 pb-20">
                {/* Cinematic Header */}
                <header className="relative h-[400px] rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5">
                    {/* Banner Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={profile.bannerURL || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80"}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                            alt="Profile Banner"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/40 to-transparent" />
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-8 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all group/back"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
                    </button>

                    {/* Profile Overlay */}
                    <div className="absolute bottom-12 left-12 right-12 z-10 flex flex-col md:flex-row items-end justify-between gap-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                            {/* Avatar */}
                            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-[#0B0F1A] shadow-2xl relative translate-y-6">
                                <img
                                    src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&background=random`}
                                    className="w-full h-full object-cover"
                                    alt={profile.fullName}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>

                            <div className="space-y-3 mb-4 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h1 className="text-4xl lg:text-5xl font-display font-light tracking-tight">{profile.fullName}</h1>
                                    <div className="flex flex-col gap-1">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-[0.2em] border w-fit",
                                            profile.plan === 'elite' ? "bg-[#e9c49a]/10 text-[#e9c49a] border-[#e9c49a]/20" :
                                                profile.plan === 'pro' ? "bg-blue-500/10 text-blue-400 border-blue-400/20" :
                                                    profile.plan === 'creator' ? "bg-purple-500/10 text-purple-400 border-purple-400/20" : "bg-white/5 text-white/40 border-white/10"
                                        )}>
                                            {profile.plan || 'Free'} Protocol
                                        </span>
                                        {profile.id === currentUser?.id && (
                                            <button
                                                onClick={togglePrivacy}
                                                disabled={privacyLoading}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-bold border transition-all",
                                                    isPrivate ? "bg-red-500/10 text-red-400 border-red-400/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-400/20"
                                                )}
                                            >
                                                <Lock className="w-3 h-3" /> {isPrivate ? "Private Identity" : "Public Identity"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-white/40 text-[11px] uppercase tracking-[0.3em] font-medium flex items-center justify-center md:justify-start gap-3">
                                    <Globe className="w-3.5 h-3.5 text-[#e9c49a]" />
                                    Citizenship: {profile.id.slice(0, 8).toUpperCase()}-AMR
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            {currentUser?.id !== userId && (
                                <Button
                                    onClick={handleFollow}
                                    disabled={followLoading || (requestPending && !isFollowing)}
                                    className={cn(
                                        "h-12 px-8 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl",
                                        isFollowing
                                            ? "bg-white/10 text-white border border-white/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/20"
                                            : requestPending
                                                ? "bg-white/5 text-white/40 border border-white/10 cursor-not-allowed"
                                                : "bg-[#e9c49a] text-black hover:bg-white"
                                    )}
                                >
                                    {isFollowing ? "Unfollow Citizen" : requestPending ? "Frequency Requested" : profile.isPrivate ? "Request Resonance" : "Follow Citizen"}
                                </Button>
                            )}
                            {(isFollowing || currentUser?.id === userId) && (
                                <Button
                                    onClick={() => navigate("/messages")}
                                    variant="outline"
                                    className="h-12 w-12 rounded-full p-0 border-white/10 bg-white/5 hover:bg-white/10"
                                >
                                    <MessageCircle className="w-5 h-5 text-white/60" />
                                </Button>
                            )}
                            <Button variant="outline" className="h-12 w-12 rounded-full p-0 border-white/10 bg-white/5 hover:bg-white/10">
                                <Share2 className="w-5 h-5 text-white/60" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Profile Tabs & Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Stats */}
                    <aside className="space-y-8">
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Immersive Bio</p>
                                <p className="text-sm text-white/60 font-light leading-relaxed">
                                    {profile.bio || "This citizen is currently navigating the deep space resonance of Amora. Identity verified within the planetary registry."}
                                </p>
                            </div>

                            <hr className="border-white/5" />

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest text-[#e9c49a] font-bold">Followers</p>
                                    <p className="text-xl font-display font-light">{followerCount.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest text-[#e9c49a] font-bold">Resonance</p>
                                    <p className="text-xl font-display font-light">85%</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 text-xs text-white/40">
                                    <Calendar className="w-4 h-4" /> Joined Dec 2025
                                </div>
                                <div className="flex items-center gap-4 text-xs text-white/40">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Identity Verified
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 space-y-6">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#e9c49a]" /> Shared Artifacts
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                {userVideos.slice(0, 6).map((vid) => (
                                    <div key={vid.id} className="aspect-square rounded-xl bg-black overflow-hidden border border-white/5 hover:border-[#e9c49a]/40 transition-all cursor-pointer group/art">
                                        <img src={vid.imageUrl} className="w-full h-full object-cover opacity-60 group-hover/art:opacity-100 transition-opacity" alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-10">
                        {/* Tab Navigation */}
                        <div className="flex items-center gap-10 border-b border-white/5 px-4">
                            {[
                                { id: 'content', label: 'Cinematic Feed', icon: Play },
                                { id: 'about', label: 'Registry Details', icon: Globe },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "pb-6 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-3 transition-all relative",
                                        activeTab === tab.id ? "text-white" : "text-white/20 hover:text-white/40"
                                    )}
                                >
                                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-[#e9c49a]" : "")} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e9c49a]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {activeTab === 'content' ? (
                                userVideos.length > 0 ? (
                                    userVideos.map((video) => (
                                        <div
                                            key={video.id}
                                            onClick={() => navigate(`/watch?id=${video.id}`)}
                                            className="group relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5 hover:border-[#e9c49a]/30 transition-all cursor-pointer shadow-xl"
                                        >
                                            <img src={video.imageUrl} className="w-full h-full object-cover grayscale-50 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                                                <div className="flex items-center gap-3 mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                    <span className="px-2 py-0.5 rounded-md bg-[#e9c49a] text-black text-[8px] font-bold uppercase tracking-widest">Original</span>
                                                    <span className="text-white/60 text-[10px] uppercase tracking-widest">14m 20s</span>
                                                </div>
                                                <h5 className="text-xl font-display font-light text-white group-hover:text-[#e9c49a] transition-colors">{video.title}</h5>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                <Play className="w-6 h-6 text-white fill-current" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto">
                                            <Zap className="w-8 h-8 text-white/10" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white/40 font-light italic">No public artifacts detected.</p>
                                            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">This citizen has not shared content with the planetary grid.</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { label: "Identity Hash", val: profile.id, icon: ShieldCheck },
                                        { label: "Contact Protocol", val: profile.email, icon: Globe },
                                        { label: "Resonance Plan", val: `${profile.plan || 'Free'} Member`, icon: Zap },
                                        { label: "Status", val: "Operational Resonance", icon: Sparkles },
                                    ].map((item, i) => (
                                        <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#e9c49a]/5 border border-[#e9c49a]/10 flex items-center justify-center text-[#e9c49a]">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">{item.label}</p>
                                            </div>
                                            <p className="text-sm text-white/60 font-mono truncate">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
