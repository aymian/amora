import { useState, useEffect, useRef } from "react";
import {
    Search,
    Plus,
    MoreVertical,
    Send,
    Smile,
    Mic,
    ArrowLeft,
    Phone,
    Video as VideoIcon,
    Heart,
    MessageCircle,
    Home,
    Menu,
    X,
    Image as ImageIcon,
    Check,
    CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc,
    limit,
    getDocs,
    Timestamp,
    setDoc,
    increment
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

// Interfaces
interface User {
    uid: string;
    id?: string;
    fullName: string;
    photoURL: string;
    email?: string;
    bio?: string;
    status?: string;
    lastSeen?: any;
}

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
    read?: boolean;
}

interface Conversation {
    id: string;
    participants: string[];
    lastMessage: string;
    lastMessageSenderId: string;
    lastMessageAt: any;
    updatedAt: any;
    otherUser: User;
    unread?: boolean;
    unreadCounts?: { [key: string]: number };
    typing?: { [key: string]: boolean };
}

interface Story {
    id: string;
    userId: string;
    userName: string;
    userPhoto: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: any;
    viewedBy?: string[];
    isSeen?: boolean;
}

const Message = () => {
    const navigate = useNavigate();
    // Standalone auth state
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch full profile
                try {
                    const docSnap = await getDoc(doc(db, "users", user.uid));
                    if (docSnap.exists()) {
                        setCurrentUser({ uid: user.uid, id: user.uid, ...docSnap.data() });
                    } else {
                        setCurrentUser(user);
                    }
                } catch (e) {
                    console.error("Auth profile fetch failed", e);
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
                // navigate("/login");
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [view, setView] = useState<'list' | 'chat'>(window.innerWidth < 1024 ? 'list' : 'chat');

    // Search State
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);

    // Typing State
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isLocalTyping, setIsLocalTyping] = useState(false);

    // Derived State for other user typing
    const isOtherUserTyping = selectedConv?.typing?.[selectedConv?.otherUser?.uid || ''] || false;

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Responsive handling
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile && view === 'list') setView('chat');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [view]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 1. Fetch Conversations
    useEffect(() => {
        if (!currentUser?.id) return;

        console.log("Setting up conversation listener for:", currentUser.id);

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", currentUser.id),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const convs = await Promise.all(snapshot.docs.map(async (d) => {
                const data = d.data();
                const otherId = data.participants.find((p: string) => p !== currentUser.id);

                let otherUser: User = {
                    uid: otherId,
                    fullName: "Unknown User",
                    photoURL: ""
                };

                if (otherId) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", otherId));
                        if (userDoc.exists()) {
                            otherUser = { uid: userDoc.id, ...userDoc.data() } as User;
                        }
                    } catch (err) {
                        console.error("Error fetching user:", err);
                    }
                }

                return {
                    id: d.id,
                    ...data,
                    otherUser
                } as Conversation;
            }));

            setConversations(convs);

            // Auto-select first conversation on desktop if none selected
            if (!selectedConv && convs.length > 0 && !isMobile) {
                // Check if we have a hash param or state to select specific user? 
                // For now just select the first one
                setSelectedConv(convs[0]);
            }
        }, (err) => {
            console.error("Conversations sync error:", err);
            // If index is missing, this will trigger
            if (err.message.includes("indexes")) {
                toast.error("System Indexing Required. Check console.");
            }
        });

        return () => unsubscribe();
    }, [currentUser?.id, isMobile]);

    // 1.5 Sync Selected Conversation & Listen for Real-time Presence/Typing
    useEffect(() => {
        if (!selectedConv || conversations.length === 0) return;

        const freshConv = conversations.find(c => c.id === selectedConv.id);
        if (freshConv) {
            // Only update if there are meaningful changes to avoid loops, 
            // but for typing/presence we want React to re-render.
            // We use JSON stringify for a cheap deep compare or just set it.
            // To prevent cursor jumping if input is inside, be careful. 
            // Luckily input state is separate.
            if (JSON.stringify(freshConv) !== JSON.stringify(selectedConv)) {
                setSelectedConv(freshConv);
            }
        }
    }, [conversations, selectedConv?.id]); // Depend on conversations (which updates from snapshot)

    // 2. Fetch Messages for Selected Conversation
    useEffect(() => {
        if (!selectedConv?.id) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, `conversations/${selectedConv.id}/messages`),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Message[];
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [selectedConv?.id]);

    // 2.5 Mark Messages as Read & Update Typing Status
    useEffect(() => {
        const markAsRead = async () => {
            if (!selectedConv?.id || !currentUser?.id || messages.length === 0) return;

            const unreadMessages = messages.filter(
                m => !m.read && m.senderId !== currentUser.id
            );

            if (unreadMessages.length > 0) {
                unreadMessages.forEach(async (msg) => {
                    try {
                        await updateDoc(doc(db, `conversations/${selectedConv.id}/messages`, msg.id), {
                            read: true,
                            readAt: serverTimestamp()
                        });
                    } catch (e) {
                        console.error("Error marking read:", e);
                    }
                });

                // Reset Unread Count for Me
                try {
                    await updateDoc(doc(db, "conversations", selectedConv.id), {
                        [`unreadCounts.${currentUser.id}`]: 0
                    });
                } catch (e) {
                    console.error("Error resetting counts:", e);
                }
            }
        };
        markAsRead();
    }, [messages, selectedConv?.id, currentUser?.id]);

    // 3. Fetch Stories
    useEffect(() => {
        if (!currentUser?.id) return;

        // Fetch recent stories (last 24h logic could be added here)
        const q = query(
            collection(db, "stories"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedStories = snapshot.docs.map(doc => {
                const data = doc.data();
                const isSeen = data.viewedBy?.includes(currentUser.id);
                return { id: doc.id, ...data, isSeen } as Story;
            });
            setStories(fetchedStories);
        });

        return () => unsubscribe();
    }, [currentUser?.id]);


    // Handlers
    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConv?.id || !currentUser?.id) return;

        const text = messageInput;
        setMessageInput(""); // Optimistic clear

        try {
            // Add to messages sub-collection
            await addDoc(collection(db, `conversations/${selectedConv.id}/messages`), {
                text,
                senderId: currentUser.id,
                createdAt: serverTimestamp(),
                read: false
            });

            // Update conversation document
            await updateDoc(doc(db, "conversations", selectedConv.id), {
                lastMessage: text,
                lastMessageSenderId: currentUser.id,
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                [`unreadCounts.${selectedConv.otherUser.uid || selectedConv.otherUser.id}`]: increment(1),
                [`typing.${currentUser.id}`]: false // Stop typing on send
            });

        } catch (err) {
            console.error("Send failed:", err);
            toast.error("Message transmission failed");
            setMessageInput(text); // Revert on failure
        }
    };

    const handleSearchUsers = async (val: string) => {
        setSearchQuery(val);
        const term = val.trim();

        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const termLower = term.toLowerCase();
            const termCap = term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();

            // Parallel queries for better UX
            const [
                nameResults,
                nameLowerResults,
                nameCapResults,
                emailResults,
                bioResults
            ] = await Promise.all([
                getDocs(query(collection(db, "users"), where("fullName", ">=", term), where("fullName", "<=", term + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, "users"), where("fullName", ">=", termLower), where("fullName", "<=", termLower + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, "users"), where("fullName", ">=", termCap), where("fullName", "<=", termCap + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, "users"), where("email", ">=", termLower), where("email", "<=", termLower + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, "users"), where("bio", ">=", term), where("bio", "<=", term + "\uf8ff"), limit(5)))
            ]);

            const allDocs = [
                ...nameResults.docs,
                ...nameLowerResults.docs,
                ...nameCapResults.docs,
                ...emailResults.docs,
                ...bioResults.docs
            ];

            // Deduplicate
            const uniqueUsers = Array.from(new Map(allDocs.map(d => [d.id, { uid: d.id, ...d.data() } as User])).values())
                .filter(u => u.uid !== currentUser?.id);

            setSearchResults(uniqueUsers);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setSearching(false);
        }
    };

    const startConversation = async (otherUser: User) => {
        if (!currentUser?.id) {
            toast.error("Authorization required");
            return;
        }

        try {
            // Check existing locally first to save read
            const existing = conversations.find(c =>
                c.participants.includes(otherUser.uid || otherUser.id!)
            );

            if (existing) {
                setSelectedConv(existing);
                setIsNewChatModalOpen(false);
                if (isMobile) setView('chat');
                return;
            }

            // Construct Deterministic Conversation ID
            const otherId = otherUser.uid || otherUser.id!;
            const convId = currentUser.id < otherId
                ? `${currentUser.id}_${otherId}`
                : `${otherId}_${currentUser.id}`;

            // Check if exists in DB (if not in local list yet)
            const convDoc = await getDoc(doc(db, "conversations", convId));

            if (convDoc.exists()) {
                // It exists but maybe we weren't a listener yet or it's loading, just set it
                const data = convDoc.data();
                setSelectedConv({
                    id: convDoc.id,
                    ...data,
                    otherUser
                } as Conversation);
            } else {
                // Create New
                const newConvData = {
                    participants: [currentUser.id, otherId],
                    lastMessage: "Conversation started",
                    lastMessageSenderId: currentUser.id,
                    lastMessageAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp()
                };

                await setDoc(doc(db, "conversations", convId), newConvData);

                setSelectedConv({
                    id: convId,
                    ...newConvData,
                    otherUser
                } as Conversation);
            }

            setIsNewChatModalOpen(false);
            if (isMobile) setView('chat');

        } catch (err) {
            console.error("Start conversation error:", err);
            toast.error("Failed to establish frequency");
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatLastSeen = (timestamp: any) => {
        if (!timestamp) return "Offline";
        const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 2) return "Active Now";
        if (minutes < 60) return `Active ${minutes}m ago`;
        if (minutes < 1440) return `Active ${Math.floor(minutes / 60)}h ago`;
        return `Last seen ${date.toLocaleDateString()}`;
    };

    return (
        <div className="flex h-full w-full overflow-hidden text-white relative font-sans">


            {/* Conversations List Panel */}
            <motion.div
                className={cn(
                    "relative z-10 w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-black/20 backdrop-blur-xl border-r border-[#e9c49a]/10 transition-all duration-500",
                    isMobile && view === 'chat' ? "hidden" : "flex"
                )}
            >
                {/* Header */}
                {/* Header */}
                <div className="p-6 pt-12 md:p-8 md:pb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-light text-white tracking-tight">Messages</h1>
                        {/* <p className="text-[#e9c49a]/60 text-xs uppercase tracking-widest mt-1 font-medium">Neural Feed</p> */}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsNewChatModalOpen(true)}
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#e9c49a] hover:bg-white/5 transition-all"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsNewChatModalOpen(true)}
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#e9c49a] hover:bg-white/5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stories Section */}
                {stories.length > 0 && (
                    <div className="px-8 py-6 overflow-x-auto no-scrollbar">
                        <div className="flex gap-5">
                            <div onClick={() => navigate('/create-story')} className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
                                <div className="w-[68px] h-[68px] rounded-full border border-dashed border-white/20 flex items-center justify-center group-hover:border-[#e9c49a] transition-colors bg-white/5">
                                    <Plus className="w-6 h-6 text-[#e9c49a]" />
                                </div>
                                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wide">Add Story</span>
                            </div>

                            {stories.map(story => (
                                <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
                                    <div className={cn(
                                        "w-[68px] h-[68px] rounded-full p-[2px] transition-all",
                                        story.isSeen
                                            ? "border border-white/10"
                                            : "bg-gradient-to-tr from-[#e9c49a] via-[#f59e0b] to-[#d97706] shadow-[0_0_15px_rgba(233,196,154,0.3)] animate-pulse-slow"
                                    )}>
                                        <div className="w-full h-full rounded-full border-[3px] border-black overflow-hidden relative">
                                            <img src={story.userPhoto} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-medium uppercase tracking-wide truncate max-w-[70px]",
                                        story.isSeen ? "text-white/30" : "text-white"
                                    )}>
                                        {story.userName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 px-4 pb-4">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-40">
                            <MessageCircle className="w-12 h-12 mb-4 text-[#e9c49a]" />
                            <p className="text-sm font-light">No frequencies established.</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => {
                                    setSelectedConv(conv);
                                    if (isMobile) setView('chat');
                                }}
                                className={cn(
                                    "group p-4 rounded-3xl cursor-pointer transition-all duration-300 border border-transparent",
                                    selectedConv?.id === conv.id
                                        ? "bg-[#e9c49a]/10 border-[#e9c49a]/20 shadow-[0_0_30px_rgba(233,196,154,0.1)]"
                                        : "hover:bg-white/5 hover:border-white/5"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="w-14 h-14 rounded-full ring-2 ring-transparent group-hover:ring-[#e9c49a]/30 transition-all">
                                            <AvatarImage src={conv.otherUser.photoURL} />
                                            <AvatarFallback className="bg-[#1a100a] text-[#e9c49a]">
                                                {conv.otherUser.fullName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Status Dot (Mock) */}
                                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={cn(
                                                "font-medium text-lg truncate transition-colors",
                                                selectedConv?.id === conv.id ? "text-[#e9c49a]" : "text-white/90 group-hover:text-white"
                                            )}>
                                                {conv.otherUser.fullName}
                                            </h3>
                                            <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
                                                {formatTime(conv.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={cn(
                                                "text-sm truncate font-light flex-1 pr-4",
                                                selectedConv?.id === conv.id ? "text-white/60" : "text-white/40 group-hover:text-white/60",
                                                conv.unreadCounts?.[currentUser?.id || ''] && "font-medium text-white"
                                            )}>
                                                {conv.typing?.[conv.otherUser.uid || '']
                                                    ? <span className="text-[#e9c49a] animate-pulse">Typing...</span>
                                                    : <>{conv.lastMessageSenderId === currentUser?.id ? "You: " : ""}{conv.lastMessage}</>
                                                }
                                            </p>
                                            {/* Unread Counter */}
                                            {(conv.unreadCounts?.[currentUser?.id || ''] || 0) > 0 && (
                                                <div className="w-5 h-5 rounded-full bg-[#e9c49a] text-black text-[10px] font-bold flex items-center justify-center">
                                                    {conv.unreadCounts?.[currentUser?.id || '']}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Floating New Chat Button (Mobile/Tablet highlight) */}
                <div className="p-6 pt-2">
                    <Button
                        onClick={() => setIsNewChatModalOpen(true)}
                        className="w-full h-14 rounded-full bg-white/5 border border-[#e9c49a]/20 text-[#e9c49a] hover:bg-[#e9c49a] hover:text-black hover:border-[#e9c49a] transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg"
                    >
                        <Plus className="w-5 h-5 mr-3" /> New Frequency
                    </Button>
                </div>

                {/* Mobile Bottom Nav - Only for List View */}
                {isMobile && view === 'list' && (
                    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#080808]/90 backdrop-blur-md border-t border-white/5 flex items-center justify-around z-50 pb-safe">
                        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors">
                            <Home className="w-5 h-5" />
                            <span className="text-[9px] font-medium tracking-wide">Home</span>
                        </button>
                        <button onClick={() => navigate('/explore')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                            <span className="text-[9px] font-medium tracking-wide">Explore</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-[#e9c49a]">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-[9px] font-medium tracking-wide">Chats</span>
                        </button>
                        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors">
                            <Avatar className="w-6 h-6 border border-white/10">
                                <AvatarImage src={currentUser?.photoURL} />
                                <AvatarFallback>{currentUser?.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-[9px] font-medium tracking-wide">Profile</span>
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Chat Area (Right Panel) */}
            <motion.div
                className={cn(
                    "flex-1 flex flex-col bg-[#050505] relative transition-all duration-300",
                    isMobile ? (view === 'chat' ? "fixed inset-0 z-[200]" : "hidden") : "flex"
                )}
            >
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        {/* Chat Header */}
                        <div className={cn(
                            "flex items-center justify-between px-6 py-4 border-b border-[#e9c49a]/10 bg-black/40 backdrop-blur-xl absolute top-0 left-0 right-0 z-20",
                            isMobile ? "h-[80px] pt-8" : "h-[100px]"
                        )}>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setView('list')}
                                    className={cn(
                                        "p-2 -ml-2 text-white/50 hover:text-white transition-colors rounded-full active:bg-white/10",
                                        !isMobile && "hidden"
                                    )}
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>

                                <div className="flex items-center gap-3" onClick={() => navigate(`/@${selectedConv.otherUser.fullName}`)}>
                                    <div className="relative">
                                        <Avatar className="w-10 h-10 md:w-12 md:h-12 ring-2 ring-[#e9c49a]/20">
                                            <AvatarImage src={selectedConv.otherUser.photoURL} />
                                            <AvatarFallback>{selectedConv.otherUser.fullName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black",
                                            formatLastSeen(selectedConv.otherUser.lastSeen) === 'Active Now' ? "bg-emerald-500" : "bg-white/20"
                                        )} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-xl font-medium text-white tracking-wide flex items-center gap-2">
                                            {selectedConv.otherUser.fullName}
                                            <Heart className="w-3 h-3 text-[#e9c49a] fill-current" />
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                                                {isOtherUserTyping ? (
                                                    <span className="text-[#e9c49a] animate-pulse">Typing...</span>
                                                ) : (
                                                    formatLastSeen(selectedConv.otherUser.lastSeen)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 md:gap-2">
                                <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white/30 hover:text-[#e9c49a] hover:bg-white/5 transition-all">
                                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white/30 hover:text-[#e9c49a] hover:bg-white/5 transition-all">
                                    <VideoIcon className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white/30 hover:text-[#e9c49a] hover:bg-white/5 transition-all">
                                    <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Feed */}
                        {/* Messages Feed */}
                        <div className={cn(
                            "flex-1 overflow-y-auto space-y-6 scroll-smooth no-scrollbar relative",
                            isMobile ? "p-4 pt-[100px] pb-[100px]" : "p-8 pt-[120px] pb-[100px]"
                        )}>
                            {/* Ambient background glow in chat */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#e9c49a]/5 rounded-full blur-[100px] pointer-events-none" />

                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={cn(
                                            "flex w-full",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex max-w-[80%] lg:max-w-[65%] gap-4",
                                            isMe ? "flex-row-reverse" : "flex-row"
                                        )}>
                                            {!isMe && (
                                                <Avatar className="w-8 h-8 rounded-full flex-shrink-0 mt-auto shadow-lg">
                                                    <AvatarImage src={selectedConv.otherUser.photoURL} />
                                                    <AvatarFallback>{selectedConv.otherUser.fullName[0]}</AvatarFallback>
                                                </Avatar>
                                            )}

                                            <div className="flex flex-col gap-1">
                                                <div className={cn(
                                                    "p-5 text-[15px] leading-relaxed relative group transition-all duration-300",
                                                    isMe
                                                        ? "bg-gradient-to-br from-[#3d2918] to-[#1f120c] text-[#ffefe0] rounded-[24px] rounded-br-[4px] border border-[#e9c49a]/20 shadow-[0_5px_20px_rgba(0,0,0,0.2)]"
                                                        : "bg-[#1a1a1a]/80 backdrop-blur-md text-white/90 rounded-[24px] rounded-bl-[4px] border border-white/5 shadow-lg"
                                                )}>
                                                    {/* Glass shine effect */}
                                                    <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                                    {msg.text}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] text-white/20 px-2 font-medium tracking-wide",
                                                    isMe ? "text-right" : "text-left"
                                                )}>
                                                    {formatTime(msg.createdAt)}
                                                    {isMe && (
                                                        <span className="ml-1 inline-flex items-center">
                                                            {msg.read ? (
                                                                <CheckCheck className="w-3 h-3 text-blue-400" />
                                                            ) : (
                                                                <CheckCheck className="w-3 h-3 text-white/30" />
                                                            )}
                                                        </span>
                                                    )}
                                                    {isMe && msg.read && idx === messages.length - 1 && (
                                                        <span className="block text-[8px] text-white/20 text-right mt-0.5">
                                                            Seen {formatTime(msg.createdAt)} {/* Ideally readAt but using createdAt fallback for now */}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />

                            {/* Typing Indicator */}
                            <AnimatePresence>
                                {isOtherUserTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-24 left-8 bg-[#1a1a1a] border border-[#e9c49a]/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-20"
                                    >
                                        <Avatar className="w-5 h-5 rounded-full">
                                            <AvatarImage src={selectedConv.otherUser.photoURL} />
                                            <AvatarFallback>{selectedConv.otherUser.fullName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex gap-1">
                                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-[#e9c49a] rounded-full" />
                                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#e9c49a] rounded-full" />
                                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#e9c49a] rounded-full" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <div className={cn(
                            "p-4 pt-2 bg-[#050505]/80 backdrop-blur-xl absolute bottom-0 left-0 right-0 z-20 border-t border-white/5",
                            isMobile ? "pb-8 mb-[env(safe-area-inset-bottom)]" : "pb-8"
                        )}>
                            <div className="max-w-4xl mx-auto flex items-end gap-3">
                                <button className="p-3 mb-1 rounded-full text-white/40 hover:text-[#e9c49a] hover:bg-white/5 transition-colors">
                                    <Plus className="w-6 h-6" />
                                </button>

                                <div className="flex-1 bg-[#1a1a1a]/50 border border-white/10 rounded-[24px] p-1 px-2 flex items-center shadow-inner min-h-[50px]">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={async (e) => {
                                            setMessageInput(e.target.value);
                                            // Typing Logic
                                            if (!selectedConv?.id || !currentUser?.id) return;

                                            if (!isLocalTyping) {
                                                setIsLocalTyping(true);
                                                await updateDoc(doc(db, "conversations", selectedConv.id), {
                                                    [`typing.${currentUser.id}`]: true
                                                });
                                            }

                                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

                                            typingTimeoutRef.current = setTimeout(async () => {
                                                setIsLocalTyping(false);
                                                await updateDoc(doc(db, "conversations", selectedConv.id), {
                                                    [`typing.${currentUser.id}`]: false
                                                });
                                            }, 2000);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-white/20 px-4 py-3 h-auto max-h-32"
                                    />
                                    <button className="p-2 text-white/40 hover:text-[#e9c49a]">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim()}
                                    className={cn(
                                        "p-3 mb-1 rounded-full bg-[#e9c49a] text-black shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:bg-white/10 disabled:text-white/20",
                                        messageInput.trim() ? "translate-y-0 opacity-100" : "opacity-50"
                                    )}
                                >
                                    {messageInput.trim() ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50 space-y-6">
                        <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#e9c49a]/10 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border border-[#e9c49a]/20 animate-ping-slow" />
                            <MessageCircle className="w-10 h-10 text-[#e9c49a]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-light text-white mb-2">Neural Interface Ready</h3>
                            <p className="text-white/40 max-w-sm mx-auto font-light">Select a frequency from the feed or initialize a new transmission.</p>
                        </div>
                        <Button
                            onClick={() => setIsNewChatModalOpen(true)}
                            variant="outline"
                            className="border-[#e9c49a]/30 text-[#e9c49a] hover:bg-[#e9c49a] hover:text-black mt-4"
                        >
                            Start Transmission
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Search Modal */}
            <AnimatePresence>
                {isNewChatModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setIsNewChatModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#0f0f0f] border border-[#e9c49a]/20 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        >
                            <div className="p-6 pb-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-light text-white ml-2">New Message</h2>
                                    <button onClick={() => setIsNewChatModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#e9c49a] transition-colors" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchUsers(e.target.value)}
                                        placeholder="Search name, email, or bio..."
                                        className="w-full h-14 bg-[#1a1a1a] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-[#e9c49a]/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto p-4 space-y-1 custom-scrollbar">
                                {searching ? (
                                    <div className="py-12 flex justify-center">
                                        <div className="w-8 h-8 rounded-full border-2 border-[#e9c49a]/20 border-t-[#e9c49a] animate-spin" />
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <div
                                            key={user.uid || user.id}
                                            onClick={() => startConversation(user)}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                                        >
                                            <Avatar className="w-12 h-12 rounded-full ring-1 ring-white/10 group-hover:ring-[#e9c49a]/30">
                                                <AvatarImage src={user.photoURL} />
                                                <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium group-hover:text-[#e9c49a] transition-colors">{user.fullName}</h4>
                                                <p className="text-xs text-white/40 truncate">{user.email}</p>
                                                {user.bio && <p className="text-xs text-white/30 truncate mt-0.5">{user.bio}</p>}
                                            </div>
                                            <MessageCircle className="w-5 h-5 text-[#e9c49a] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                    ))
                                ) : searchQuery.length > 1 ? (
                                    <p className="text-center py-10 text-white/20 text-sm font-light">No beings found matching this signature.</p>
                                ) : (
                                    <div className="text-center py-10 text-white/20 text-sm font-light space-y-2">
                                        <p>Type to search the directory.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes particleFloat {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Message;
