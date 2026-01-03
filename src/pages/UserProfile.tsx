
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Share2,
    MapPin,
    Calendar,
    Link as LinkIcon,
    Grid,
    Heart,
    Activity,
    Zap,
    Crown,
    ShieldCheck,
    MessageCircle,
    UserPlus,
    UserMinus,
    Lock,
    ArrowLeft,
    ChevronDown
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null); // The profile being viewed
    const [currentUser, setCurrentUser] = useState<any>(null); // The logged in user
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
    const [userContent, setUserContent] = useState<any[]>([]);

    // Interaction State
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [stats, setStats] = useState({
        followers: 0,
        following: 0,
        likes: 0,
        views: '0'
    });

    // 1. Auth Check & Fetch Profile
    useEffect(() => {
        // System paths redirection if they somehow hit this wildcard route
        const systemPaths = ['settings', 'history', 'favorites', 'favourites', 'profile', 'dashboard', 'explore'];
        const cleanPath = username?.replace('@', '')?.toLowerCase();

        if (cleanPath && systemPaths.includes(cleanPath)) {
            navigate(`/${cleanPath}`);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setCurrentUser(authUser);
            } else {
                // Allow viewing public profiles even if logged out? 
                // For now, let's keep it open, but buttons won't work or will redirect.
                setCurrentUser(null);
            }

            if (username) {
                await fetchProfileByUsername(username, authUser);
            }
        });
        return () => unsubscribe();
    }, [username]);

    const fetchProfileByUsername = async (usernameParam: string, authUser: any) => {
        setLoading(true);
        try {
            // Strip '@' if present
            const cleanUsername = usernameParam.startsWith('@') ? usernameParam.slice(1) : usernameParam;

            // Query by username
            const q = query(collection(db, "users"), where("username", "==", cleanUsername));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setUser(null);
                setLoading(false);
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const viewedUser = { uid: userDoc.id, ...userData };
            setUser(viewedUser);

            // Fetch Content & Stats
            await fetchUserContent(viewedUser.uid, viewedUser);

            // Check Follow Status
            if (authUser) {
                const followDocId = `${authUser.uid}_${viewedUser.uid}`;
                const followDoc = await getDoc(doc(db, "follows", followDocId));
                setIsFollowing(followDoc.exists());

                // Check for pending follow request
                const requestQuery = query(
                    collection(db, "notifications"),
                    where("type", "==", "follow_request"),
                    where("fromUserId", "==", authUser.uid),
                    where("toUserId", "==", viewedUser.uid),
                    where("status", "==", "pending")
                );
                const requestSnap = await getDocs(requestQuery);
                setRequestPending(!requestSnap.empty);
            }

        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserContent = async (uid: string, userData: any) => {
        try {
            // Fetch Images & Videos
            const qVideos = query(collection(db, "gallery_videos"), where("creatorId", "==", uid));
            const qImages = query(collection(db, "gallery_images"), where("creatorId", "==", uid));

            const [snapVideos, snapImages] = await Promise.all([getDocs(qVideos), getDocs(qImages)]);

            const videos = snapVideos.docs.map(d => ({ id: d.id, ...d.data(), type: 'video' }));
            const images = snapImages.docs.map(d => ({ id: d.id, ...d.data(), type: 'image' }));

            const allContent = [...videos, ...images].sort((a: any, b: any) => {
                const tA = a.createdAt?.toMillis?.() || 0;
                const tB = b.createdAt?.toMillis?.() || 0;
                return tB - tA; // Descending
            });

            setUserContent(allContent);

            // Calculate Real Stats
            const totalLikes = allContent.reduce((acc, curr: any) => acc + (curr.likes || 0), 0);
            const totalViews = allContent.reduce((acc, curr: any) => acc + (curr.views || 0), 0);

            const formatNumber = (num: number) => {
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                return num.toString();
            };

            setStats({
                followers: userData.followers?.length || 0,
                following: userData.following?.length || 0,
                likes: totalLikes,
                views: formatNumber(totalViews)
            });

        } catch (e) {
            console.error("Error fetching content:", e);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (!user) return;

        setFollowLoading(true);

        try {
            if (user.isPrivate) {
                // Send follow request for private account
                await addDoc(collection(db, "notifications"), {
                    type: "follow_request",
                    fromUserId: currentUser.uid,
                    fromUserName: currentUser.displayName || "Anonymous",
                    fromUserPhoto: currentUser.photoURL || "",
                    toUserId: user.uid,
                    status: "pending",
                    createdAt: serverTimestamp()
                });
                setRequestPending(true);
                toast.success("Follow request sent", {
                    description: "Waiting for approval from this private account."
                });
            } else {
                // Follow public account directly
                const followDocId = `${currentUser.uid}_${user.uid}`;
                await setDoc(doc(db, "follows", followDocId), {
                    followerId: currentUser.uid,
                    followingId: user.uid,
                    createdAt: serverTimestamp()
                });
                setIsFollowing(true);
                setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
                toast.success(`Following @${user.username}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Action Failed");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        if (!currentUser || !user) return;

        setFollowLoading(true);
        const followDocId = `${currentUser.uid}_${user.uid}`;

        try {
            await deleteDoc(doc(db, "follows", followDocId));
            setIsFollowing(false);
            setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
            toast.success(`Unfollowed @${user.username}`);
        } catch (error) {
            console.error(error);
            toast.error("Unfollow failed");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                    <p className="text-[#e9c49a] tracking-[0.3em] text-xs font-bold animate-pulse">LOCATING SUBJECT...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-4xl font-display font-light mb-4 text-white">Identity Not Found</h1>
                <p className="text-white/40 mb-8 uppercase tracking-widest text-xs">The requested citizen (@{username?.replace('@', '')}) does not exist in the planetary registry.</p>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-full px-8 border-white/10 text-white hover:bg-white/10">Return to Nexus</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pb-20 relative overflow-hidden">
            <Toaster position="bottom-right" theme="dark" />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e9c49a]/5 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            {/* Profile Header / Banner */}
            <div className="relative h-[350px] md:h-[450px] w-full group">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-8 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all group/back"
                >
                    <ArrowLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
                </button>

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505] z-10" />
                <img
                    src={user.bannerURL}
                    className="w-full h-full object-cover"
                    alt="Cover"
                />

                {/* Profile Info Overlay */}
                <div className="absolute -bottom-20 left-0 right-0 z-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8">
                    {/* Avatar Group */}
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] border-4 border-[#050505] overflow-hidden shadow-2xl bg-[#0a0a0a] relative">
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                                className="w-full h-full object-cover"
                                alt="Avatar"
                            />
                        </div>
                        {/* Status Indicator (Mock online for now) */}
                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-[#050505] rounded-full" title="Online" />
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 mb-4 text-center md:text-left space-y-2">
                        <h1 className="text-4xl md:text-5xl font-display font-light text-white tracking-tight flex items-center gap-3 justify-center md:justify-start">
                            {user.fullName}
                            {user.plan !== 'free' && <Crown className="w-6 h-6 text-[#e9c49a] fill-current" />}
                        </h1>
                        <p className="text-white/40 font-mono text-sm tracking-widest uppercase">@{user.username}</p>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-white/60 mt-4 flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#e9c49a]" /> {user.location || 'Unknown Location'}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#e9c49a]" /> Joined {new Date().getFullYear()}</span>
                            {user.website && (
                                <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#e9c49a] hover:underline">
                                    <LinkIcon className="w-3 h-3" /> {user.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        {currentUser?.uid !== user.uid && (
                            <>
                                {isFollowing ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                className="rounded-full font-bold px-8 h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center gap-2"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                Following
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0a] border-white/10 text-white">
                                            <DropdownMenuItem
                                                onClick={() => console.log('Mute')}
                                                className="cursor-pointer hover:bg-white/10"
                                            >
                                                Mute
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={handleUnfollow}
                                                className="text-red-400 focus:text-red-400 cursor-pointer hover:bg-red-500/10"
                                            >
                                                Unfollow
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button
                                        onClick={handleFollow}
                                        disabled={followLoading || requestPending}
                                        className={cn(
                                            "rounded-full font-bold px-8 h-12 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2",
                                            requestPending
                                                ? "bg-white/5 text-white/50 border border-white/10"
                                                : "bg-[#e9c49a] text-black hover:bg-white"
                                        )}
                                    >
                                        {requestPending ? (
                                            <>
                                                <UserMinus className="w-4 h-4" /> Requested
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4" /> Follow
                                            </>
                                        )}
                                    </Button>
                                )}
                            </>
                        )}

                        <Button variant="outline" className="rounded-full h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10 p-0">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        {isFollowing && (
                            <Button onClick={() => navigate('/messages')} variant="outline" className="rounded-full h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10 p-0">
                                <MessageCircle className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 mt-32 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Sidebar: Stats & Bio */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Bio Card */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50"><Activity className="w-24 h-24 text-white/5" /></div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#e9c49a] mb-2">My Bio</h3>
                            <p className="text-white/70 font-light leading-relaxed">{user.bio || "No bio established."}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="text-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-xl font-display font-medium text-white">{stats.followers}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Followers</div>
                            </div>
                            <div className="text-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-xl font-display font-medium text-white">{stats.following}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Following</div>
                            </div>
                            <div className="text-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-xl font-display font-medium text-white">{stats.likes}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Likes</div>
                            </div>
                            <div className="text-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-xl font-display font-medium text-white">{stats.views}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Impact</div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Card */}
                    <div className={cn(
                        "rounded-[2rem] p-8 space-y-4 relative overflow-hidden",
                        user.plan === 'elite' ? "bg-gradient-to-br from-[#e9c49a]/20 to-black border border-[#e9c49a]/30" : "bg-gradient-to-br from-white/5 to-black border border-white/10"
                    )}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Current Plan</h3>
                            {user.plan === 'elite' && <Crown className="w-5 h-5 text-[#e9c49a]" />}
                        </div>
                        <div className="text-3xl font-display font-light text-white uppercase">{user.plan || 'Free'}</div>
                        <p className="text-xs text-white/40 leading-relaxed">
                            {user.plan === 'elite'
                                ? "This citizen operates with maximum planetary resonance."
                                : "Standard citizen protocol active."}
                        </p>
                    </div>
                </div>

                {/* Right Content: Tabs & Feeds */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Custom Tab Navigation */}
                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full w-fit">
                        {[
                            { id: 'posts', label: 'Artifacts', icon: Grid },
                            { id: 'likes', label: 'Resonances', icon: Heart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                                    activeTab === tab.id ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                <tab.icon className="w-3 h-3" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            >
                                {activeTab === 'posts' && (
                                    userContent.length > 0 ? (
                                        userContent.map((post) => (
                                            <div key={post.id} className="aspect-[3/4] rounded-2xl bg-[#0A0A0A] border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => navigate(`/view/${post.id}`)}>
                                                <img src={post.imageUrl || post.videoUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                    <div className="text-white text-sm font-bold truncate">{post.title}</div>
                                                    <div className="flex items-center gap-2 text-xs text-white/60">
                                                        <Heart className="w-3 h-3 fill-current" /> {post.likes || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                            <Grid className="w-12 h-12 mb-4" />
                                            <p className="text-sm font-light">No public artifacts detected.</p>
                                        </div>
                                    )
                                )}

                                {activeTab === 'likes' && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                        <Heart className="w-12 h-12 mb-4" />
                                        <p className="text-sm font-light">Resonances are private.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
