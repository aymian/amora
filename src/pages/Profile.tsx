import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Edit,
    Settings,
    Share2,
    MapPin,
    Calendar,
    Link as LinkIcon,
    Camera,
    Grid,
    Heart,
    Bookmark,
    Activity,
    Zap,
    Crown,
    ShieldCheck,
    LogOut,
    TrendingUp,
    DollarSign,
    Play,
    User
} from "lucide-react";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'saved'>('posts');

    // Edit Form State
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        bio: "",
        location: "",
        website: ""
    });

    // Content State
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [likedPosts, setLikedPosts] = useState<any[]>([]);

    // Stats State
    const [stats, setStats] = useState({
        followers: 1240,
        following: 45,
        likes: 8500,
        views: '45.2K'
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                // Fetch full user profile
                const userDoc = await getDoc(doc(db, "users", authUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const fullName = userData.fullName || "";
                    const [first, ...last] = fullName.split(" ");

                    const profileData = {
                        uid: authUser.uid,
                        email: authUser.email,
                        photoURL: userData.photoURL || authUser.photoURL,
                        bannerURL: userData.bannerURL || "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop",
                        ...userData
                    };

                    setUser(profileData);
                    setEditForm({
                        firstName: first || "",
                        lastName: last.join(" ") || "",
                        username: userData.username || `user_${authUser.uid.slice(0, 6)}`,
                        bio: userData.bio || "Digital explorer in the Amora Nexus.",
                        location: userData.location || "Planetary Grid",
                        website: userData.website || ""
                    });

                    // Fetch User Content & Calculate Stats
                    fetchUserContent(authUser.uid, userData);
                }
            } else {
                navigate("/login");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchUserContent = async (uid: string, userData: any) => {
        try {
            // Fetch Images & Videos
            const qVideos = query(collection(db, "gallery_videos"), where("creatorId", "==", uid));
            const qImages = query(collection(db, "gallery_images"), where("creatorId", "==", uid));

            const [snapVideos, snapImages] = await Promise.all([getDocs(qVideos), getDocs(qImages)]);

            const videos = snapVideos.docs.map(d => ({ id: d.id, ...d.data(), type: 'video' }));
            const images = snapImages.docs.map(d => ({ id: d.id, ...d.data(), type: 'image' }));

            const allContent = [...videos, ...images].sort((a: any, b: any) => {
                const tA = a.createdAt?.toMillis() || 0;
                const tB = b.createdAt?.toMillis() || 0;
                return tB - tA; // Descending
            });

            if (allContent.length > 0) {
                setMyPosts(allContent);
            } else {
                setMyPosts([]);
            }

            // Calculate Real Stats
            const totalLikes = allContent.reduce((acc, curr: any) => acc + (curr.likes || 0), 0);
            const totalViews = allContent.reduce((acc, curr: any) => acc + (curr.views || 0), 0);

            // Format Views (e.g., 1200 -> 1.2K)
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

            // Mock Likes for UI Showcase (To be replaced with real liked posts query later)
            setLikedPosts([
                { id: 'l1', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80', views: '1.2M' },
                { id: 'l2', imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80', views: '856K' },
                { id: 'l3', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80', views: '2.1M' },
            ]);

        } catch (e) {
            console.error("Error fetching content:", e);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            const fullName = `${editForm.firstName} ${editForm.lastName}`.trim();
            await updateDoc(doc(db, "users", user.uid), {
                fullName,
                username: editForm.username,
                bio: editForm.bio,
                location: editForm.location,
                website: editForm.website
            });
            setUser({ ...user, fullName, ...editForm });
            setIsEditing(false);
            toast.success("Profile Protocol Updated");
        } catch (error) {
            console.error(error);
            toast.error("Update Failed");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoURL' | 'bannerURL') => {
        if (!e.target.files?.[0] || !user) return;
        const file = e.target.files[0];
        const fileRef = ref(storage, `users/${user.uid}/${field}_${Date.now()}`);

        try {
            toast.promise(
                async () => {
                    await uploadBytes(fileRef, file);
                    const url = await getDownloadURL(fileRef);
                    await updateDoc(doc(db, "users", user.uid), { [field]: url });
                    setUser({ ...user, [field]: url });
                },
                {
                    loading: 'Uploading Artifact...',
                    success: 'Visual Matrix Updated',
                    error: 'Upload Failed'
                }
            );
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                    <p className="text-[#e9c49a] tracking-[0.3em] text-xs font-bold animate-pulse">AUTHENTICATING...</p>
                </div>
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505] z-10" />
                <img
                    src={user?.bannerURL}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                    alt="Cover"
                />

                {/* Banner Edit Button */}
                <label className="absolute top-6 right-6 z-20 cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'bannerURL')} accept="image/*" />
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-3 rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-all hover:scale-110">
                        <Camera className="w-5 h-5" />
                    </div>
                </label>

                {/* Profile Info Overlay */}
                <div className="absolute -bottom-20 left-0 right-0 z-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8">
                    {/* Avatar Group */}
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] border-4 border-[#050505] overflow-hidden shadow-2xl bg-[#0a0a0a] relative">
                            <img
                                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`}
                                className="w-full h-full object-cover"
                                alt="Avatar"
                            />
                            {/* Avatar Edit Overlay */}
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'photoURL')} accept="image/*" />
                                <Camera className="w-8 h-8 text-white" />
                            </label>
                        </div>
                        {/* Status Indicator */}
                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-[#050505] rounded-full" title="Online" />
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 mb-4 text-center md:text-left space-y-2">
                        <h1 className="text-4xl md:text-5xl font-display font-light text-white tracking-tight flex items-center gap-3 justify-center md:justify-start">
                            {user?.fullName}
                            {user?.plan !== 'free' && <Crown className="w-6 h-6 text-[#e9c49a] fill-current" />}
                        </h1>
                        <p className="text-white/40 font-mono text-sm tracking-widest uppercase">@{user?.username || 'user'}</p>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-white/60 mt-4 flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#e9c49a]" /> {user?.location || 'Unknown Location'}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#e9c49a]" /> Joined {new Date().getFullYear()}</span>
                            {user?.website && (
                                <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#e9c49a] hover:underline">
                                    <LinkIcon className="w-3 h-3" /> {user.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-white text-black hover:bg-gray-200 rounded-full font-bold px-6 h-12 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
                        >
                            Edit Profile
                        </Button>
                        <Button variant="outline" className="rounded-full h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10 p-0">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" className="rounded-full h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10 p-0" onClick={() => navigate('/settings')}>
                            <Settings className="w-5 h-5" />
                        </Button>
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
                            <p className="text-white/70 font-light leading-relaxed">{user?.bio || "No bio established."}</p>
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
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Total Likes</div>
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
                        user?.plan === 'elite' ? "bg-gradient-to-br from-[#e9c49a]/20 to-black border border-[#e9c49a]/30" : "bg-gradient-to-br from-white/5 to-black border border-white/10"
                    )}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Current Plan</h3>
                            {user?.plan === 'elite' && <Crown className="w-5 h-5 text-[#e9c49a]" />}
                        </div>
                        <div className="text-3xl font-display font-light text-white uppercase">{user?.plan || 'Free'}</div>
                        <p className="text-xs text-white/40 leading-relaxed">
                            {user?.plan === 'elite'
                                ? "You have maximum resonance on the planetary grid."
                                : "Upgrade your clearance to access advanced Amora features including Neural Core AI."}
                        </p>
                        {user?.plan !== 'elite' && (
                            <Button onClick={() => navigate('/upgrade')} className="w-full bg-[#e9c49a] text-black font-bold uppercase tracking-widest hover:bg-white">
                                Upgrade Profile
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Content: Tabs & Feeds */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Custom Tab Navigation */}
                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full w-fit">
                        {[
                            { id: 'posts', label: 'My Artifacts', icon: Grid },
                            { id: 'likes', label: 'Resonances', icon: Heart },
                            { id: 'saved', label: 'Saved', icon: Bookmark },
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
                                    myPosts.length > 0 ? (
                                        myPosts.map((post) => (
                                            <div key={post.id} className="aspect-[3/4] rounded-2xl bg-[#0A0A0A] border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => navigate(`/view/${post.id}`)}>
                                                <img src={post.imageUrl || post.videoUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                    <div className="text-white text-sm font-bold truncate">{post.title}</div>
                                                    <div className="flex items-center gap-2 text-xs text-white/60">
                                                        <Play className="w-3 h-3 fill-current" /> {post.views || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                            <Grid className="w-12 h-12 mb-4" />
                                            <p className="text-sm font-light">No artifacts uploaded yet.</p>
                                        </div>
                                    )
                                )}

                                {activeTab === 'likes' && (
                                    likedPosts.map((post) => (
                                        <div key={post.id} className="aspect-square rounded-2xl bg-[#0A0A0A] border border-white/5 overflow-hidden relative group cursor-pointer hover:border-[#e9c49a]/30 transition-all">
                                            <img src={post.imageUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                <Heart className="w-5 h-5 text-[#e9c49a] fill-current" />
                                            </div>
                                        </div>
                                    ))
                                )}

                                {activeTab === 'saved' && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                        <Bookmark className="w-12 h-12 mb-4" />
                                        <p className="text-sm font-light">Collections are private.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0f0f0f] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative"
                        >
                            <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>

                            <h2 className="text-2xl font-display font-light mb-8">Edit Profile Protocol</h2>

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">First Name</label>
                                        <input
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-[#e9c49a] outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Last Name</label>
                                        <input
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-[#e9c49a] outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Username</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-white/20">@</span>
                                        <input
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-8 text-white focus:border-[#e9c49a] outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Bio</label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        rows={4}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-[#e9c49a] outline-none transition-colors resize-none"
                                        maxLength={160}
                                    />
                                    <div className="text-right text-[10px] text-white/20">{editForm.bio.length}/160</div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Location</label>
                                    <input
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-[#e9c49a] outline-none transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Website</label>
                                    <input
                                        value={editForm.website}
                                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                        placeholder="https://"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-[#e9c49a] outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <Button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateProfile}
                                    className="flex-1 bg-[#e9c49a] hover:bg-[#d6b086] text-black font-bold h-12 rounded-xl"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
