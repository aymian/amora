import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Search,
    Send,
    User,
    CheckCheck,
    MoreVertical,
    Activity,
    Lock,
    Sparkles,
    Menu
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit,
    addDoc,
    serverTimestamp,
    setDoc,
    getDocs,
    updateDoc,
    writeBatch
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Messages() {
    const { user: userData, loading: authLoading, toggleSidebar } = useOutletContext<{ user: any, loading: boolean, toggleSidebar: () => void }>();
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);



    // Fetch Conversations
    useEffect(() => {
        if (!userData?.id) return;

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", userData.id)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort by lastMessageAt
            setConversations(data.sort((a: any, b: any) => {
                const timeA = a.lastMessageAt?.seconds || 0;
                const timeB = b.lastMessageAt?.seconds || 0;
                return timeB - timeA;
            }));
        });

        return () => unsub();
    }, [userData?.id]);

    // Index all users for autocomplete
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const snap = await getDocs(query(collection(db, "users"), limit(100)));
                setAllUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Index fetch failed:", error);
            }
        };
        fetchAll();
    }, []);

    // Local Search Autocomplete
    useEffect(() => {
        if (searchQuery.length < 1) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = allUsers.filter(u =>
            u.id !== userData?.id &&
            (u.fullName?.toLowerCase().includes(query) ||
                u.username?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query))
        ).slice(0, 8);

        setSearchResults(filtered);
    }, [searchQuery, allUsers, userData?.id]);

    // Active Chat Message Listener
    useEffect(() => {
        if (!activeChat?.id) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, `conversations/${activeChat.id}/messages`),
            orderBy("createdAt", "asc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsub();
    }, [activeChat?.id]);

    // Mark messages as read when viewing conversation
    useEffect(() => {
        if (!activeChat?.id || !userData?.id) return;

        const markAsRead = async () => {
            try {
                const messagesRef = collection(db, `conversations/${activeChat.id}/messages`);
                const q = query(messagesRef, where("senderId", "!=", userData.id));
                const snapshot = await getDocs(q);

                const batch = writeBatch(db);
                snapshot.docs.forEach(msgDoc => {
                    if (!msgDoc.data().read) {
                        batch.update(msgDoc.ref, { read: true });
                    }
                });

                await batch.commit();
            } catch (error) {
                console.error("Mark as read failed:", error);
            }
        };

        markAsRead();
    }, [activeChat?.id, userData?.id]);

    const handleSelectUser = async (user: any) => {
        setSearchQuery("");
        setSearchResults([]);

        // Check if conversation exists
        const existing = conversations.find(c => c.participants.includes(user.id));
        if (existing) {
            setActiveChat(existing);
            return;
        }

        // Create new
        const newConv = {
            participants: [userData.id, user.id],
            participantDetails: {
                [userData.id]: { name: userData.fullName, photo: userData.photoURL || "" },
                [user.id]: { name: user.fullName, photo: user.photoURL || "" }
            },
            lastMessageAt: serverTimestamp(),
            lastMessage: "No messages yet"
        };

        const docRef = await addDoc(collection(db, "conversations"), newConv);
        setActiveChat({ id: docRef.id, ...newConv });
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !activeChat || !userData) return;

        const text = messageInput;
        setMessageInput("");

        try {
            await addDoc(collection(db, `conversations/${activeChat.id}/messages`), {
                text,
                senderId: userData.id,
                createdAt: serverTimestamp()
            });

            await setDoc(doc(db, "conversations", activeChat.id), {
                lastMessage: text,
                lastMessageAt: serverTimestamp(),
                lastSenderId: userData.id
            }, { merge: true });
        } catch (error) {
            console.error("Transmission failed:", error);
        }
    };

    const getOtherParticipant = (chat: any) => {
        if (!chat?.participants || !chat?.participantDetails) return { name: "Unknown", photo: "" };
        const otherId = chat.participants.find((id: string) => id !== userData?.id);
        return chat.participantDetails[otherId] || { name: "Citizen", photo: "" };
    };

    if (authLoading) return null;

    return (
        <div className="relative min-h-[calc(100vh-64px)] p-6">
            {/* Cinematic Background Theme */}
            <div className="absolute inset-0 -z-10 bg-[#020202]">
                {/* Deep Nebula Base */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(60,40,20,0.2),transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-200 mix-blend-overlay" />

                {/* Gold Dust/Stars */}
                <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(233,196,154,0.15),transparent_70%)]" />
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        radial-gradient(1px 1px at 10% 10%, rgba(255, 255, 255, 0.3) 100%, transparent),
                        radial-gradient(1px 1px at 20% 20%, rgba(233, 196, 154, 0.3) 100%, transparent),
                        radial-gradient(2px 2px at 40% 40%, rgba(255, 255, 255, 0.4) 100%, transparent),
                        radial-gradient(1.5px 1.5px at 60% 60%, rgba(233, 196, 154, 0.4) 100%, transparent),
                        radial-gradient(1px 1px at 80% 80%, rgba(255, 255, 255, 0.3) 100%, transparent)
                    `,
                    backgroundSize: '400px 400px'
                }} />

                {/* Ambient Glows */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#e9c49a]/[0.05] blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#8b6544]/[0.05] blur-[120px] rounded-full mix-blend-screen" />
            </div>

            {/* Floating Menu Button */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={toggleSidebar}
                    className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-[#e9c49a]/20 flex items-center justify-center text-[#e9c49a] hover:bg-[#e9c49a]/10 transition-all group shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                    <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            <div className="h-[calc(100vh-160px)] flex gap-6 overflow-hidden relative z-10 pl-16">
                {/* Chat Sidebar */}
                <aside className="w-80 flex flex-col gap-4">
                    <div className="p-8 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-[#e9c49a]/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e9c49a]/20 to-transparent" />
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-display font-light tracking-wide">Resonance</h2>
                            <div className="w-10 h-10 rounded-full bg-[#e9c49a]/5 border border-[#e9c49a]/10 flex items-center justify-center shadow-inner">
                                <MessageSquare className="w-5 h-5 text-[#e9c49a]/60" />
                            </div>
                        </div>

                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e9c49a]/30 group-focus-within/search:text-[#e9c49a] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Citizens..."
                                className="w-full bg-black/40 border border-[#e9c49a]/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs outline-none focus:border-[#e9c49a]/40 focus:bg-black/60 transition-all placeholder:text-white/10"
                            />

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                                    >
                                        {searchResults.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                                            >
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback className="bg-white/5 text-[10px]">{user.fullName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-[11px] font-bold text-white group-hover:text-[#e9c49a] transition-colors">{user.fullName}</p>
                                                    <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Resonance Index</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                        {conversations.length > 0 ? conversations.map((chat) => {
                            const other = getOtherParticipant(chat);
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => setActiveChat(chat)}
                                    className={cn(
                                        "w-full p-4 rounded-3xl flex items-center gap-4 transition-all group relative overflow-hidden",
                                        activeChat?.id === chat.id
                                            ? "bg-[#e9c49a]/10 border border-[#e9c49a]/20 shadow-[inset_0_0_20px_rgba(233,196,154,0.05)]"
                                            : "bg-black/20 border border-white/5 hover:bg-black/40 hover:border-[#e9c49a]/20"
                                    )}
                                >
                                    {activeChat?.id === chat.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#e9c49a] rounded-r-full shadow-[0_0_15px_#e9c49a]" />
                                    )}
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 rounded-2xl border border-white/10">
                                            <AvatarImage src={other?.photo} />
                                            <AvatarFallback className="bg-gradient-to-br from-[#8b6544] to-[#4a3624] text-sm font-bold">
                                                {other?.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B0F1A] shadow-lg" />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs font-bold text-white group-hover:text-[#e9c49a] transition-colors truncate">{other?.name}</p>
                                            <span className="text-[9px] text-white/20 uppercase font-bold whitespace-nowrap">
                                                {chat.lastMessageAt?.seconds ? new Date(chat.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/30 truncate">{chat.lastMessage}</p>
                                    </div>
                                </button>
                            );
                        }) : (
                            <div className="py-20 text-center space-y-4 px-8">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                    <MessageSquare className="w-5 h-5 text-white/10" />
                                </div>
                                <p className="text-[10px] text-white/20 font-light italic leading-relaxed">No active frequencies. Search a citizen to begin resonance.</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-[#e9c49a]/10 overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e9c49a]/30 to-transparent" />
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="p-6 border-b border-[#e9c49a]/10 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-10 h-10 rounded-xl border border-white/10">
                                        <AvatarImage src={getOtherParticipant(activeChat)?.photo} />
                                        <AvatarFallback className="bg-gradient-to-br from-[#8b6544] to-[#4a3624] text-xs font-bold">
                                            {getOtherParticipant(activeChat)?.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{getOtherParticipant(activeChat)?.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                            <span className="text-[9px] text-[#e9c49a] uppercase font-bold tracking-widest">Active Resonance</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-xl hover:bg-white/5 text-white/40"><Activity className="w-4 h-4" /></button>
                                    <button className="p-2 rounded-xl hover:bg-white/5 text-white/40"><MoreVertical className="w-4 h-4" /></button>
                                </div>
                            </header>

                            {/* Messages Grid */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar flex flex-col">
                                <div className="flex justify-center mb-8">
                                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/20 uppercase font-bold tracking-[0.2em]">Archival Protocol Synchronized</span>
                                </div>

                                <div className="flex flex-col gap-6 flex-1">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId === userData?.id;
                                        return (
                                            <div key={msg.id} className={cn("flex gap-4 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                                <Avatar className="w-8 h-8 rounded-lg flex-shrink-0">
                                                    <AvatarImage src={isMe ? userData?.photoURL : getOtherParticipant(activeChat)?.photo} />
                                                    <AvatarFallback className="bg-white/5 text-[10px] uppercase">{isMe ? userData?.fullName?.[0] : getOtherParticipant(activeChat)?.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "p-4 rounded-2xl space-y-2",
                                                    isMe ? "bg-[#e9c49a]/10 border border-[#e9c49a]/20 rounded-tr-none text-right" : "bg-white/5 border border-white/5 rounded-tl-none"
                                                )}>
                                                    <p className={cn("text-xs leading-relaxed", isMe ? "text-[#e9c49a] font-medium" : "text-white/60 font-light italic")}>
                                                        {msg.text}
                                                    </p>
                                                    <div className={cn("flex items-center gap-2", isMe ? "justify-end" : "")}>
                                                        <span className="text-[8px] text-white/20 uppercase font-bold">
                                                            {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                        </span>
                                                        {isMe && <CheckCheck className="w-3 h-3 text-[#e9c49a]/40" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Input Area */}
                            <footer className="p-6 bg-black/40 border-t border-[#e9c49a]/10 backdrop-blur-xl">
                                <form onSubmit={handleSendMessage} className="relative group">
                                    <div className="absolute inset-0 bg-[#e9c49a]/5 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Transmit a message..."
                                        className="w-full bg-black/60 border border-[#e9c49a]/20 rounded-[2.5rem] py-5 px-8 pr-16 text-sm outline-none focus:border-[#e9c49a]/50 transition-all font-light placeholder:text-[#e9c49a]/20 relative z-10"
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#e9c49a] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(233,196,154,0.3)] z-20">
                                        <Send className="w-5 h-5 shadow-sm" />
                                    </button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-[#e9c49a]/10 flex items-center justify-center relative shadow-2xl">
                                <div className="absolute inset-0 bg-[#e9c49a]/5 blur-3xl animate-pulse" />
                                <MessageSquare className="w-10 h-10 text-[#e9c49a]/20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-display font-light">Select a <span className="text-[#e9c49a] italic">Resonance</span></h3>
                                <p className="text-white/20 text-xs font-light max-w-xs mx-auto">Choose a citizen from the planetary registry to establish a secure directorial comm-link.</p>
                            </div>
                        </div>
                    )}
                </main>

                {/* Info Panel */}
                <aside className="w-72 hidden xl:flex flex-col gap-6">
                    <div className="p-10 rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-[#e9c49a]/10 text-center space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e9c49a]/30 to-transparent" />

                        <div className="w-32 h-32 rounded-full mx-auto relative group">
                            <div className="absolute inset-[-4px] rounded-full bg-gradient-to-b from-[#e9c49a] to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
                            <img
                                src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.fullName || 'User'}&background=8b6544&color=fff`}
                                className="w-full h-full rounded-full object-cover border-4 border-black box-content relative z-10"
                            />
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#e9c49a]/40 group-hover:animate-spin-slow z-20" />
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-2xl font-display font-light text-white">{userData?.fullName || "Citizen"}</h4>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9c49a]/10 border border-[#e9c49a]/20">
                                <Sparkles className="w-3 h-3 text-[#e9c49a]" />
                                <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] font-bold">{userData?.plan || 'Free'} Protocol</p>
                            </div>
                        </div>

                        <div className="pt-8 grid grid-cols-2 gap-8 border-t border-[#e9c49a]/10">
                            <div className="text-center group-hover:scale-105 transition-transform">
                                <p className="text-[10px] uppercase tracking-widest text-[#e9c49a]/40 font-bold mb-1">Artifacts</p>
                                <p className="text-2xl font-display font-light text-white">21</p>
                            </div>
                            <div className="text-center group-hover:scale-105 transition-transform">
                                <p className="text-[10px] uppercase tracking-widest text-[#e9c49a]/40 font-bold mb-1">Resonance</p>
                                <p className="text-2xl font-display font-light text-[#e9c49a]">92%</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-[#e9c49a]/10 space-y-6 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#e9c49a]">
                            <Lock className="w-4 h-4" /> Security
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-inner">
                                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em] leading-relaxed text-center">E2E SHIELD-V4 ENCRYPTION ACTIVE</p>
                            </div>
                            <p className="text-[10px] text-white/30 font-light italic text-center leading-relaxed">
                                All resonance transmissions are synchronized through the planetary lattice.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Counter Decoration - Animated like the screenshot */}
            <div className="mt-12 flex justify-center">
                <div className="px-12 py-6 rounded-full bg-black/40 backdrop-blur-3xl border border-[#e9c49a]/10 shadow-[0_0_50px_rgba(233,196,154,0.05)] flex items-center gap-3 group">
                    <span className="text-xl font-display font-light text-white/40">Join</span>
                    <span className="text-3xl font-display font-light text-[#e9c49a] animate-pulse">1,232,462+</span>
                    <span className="text-xl font-display font-light text-white/40">Citizens Resonating Today</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e9c49a]/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            <style>{`
                .font-display { font-family: 'Cinzel', serif; }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div >
    );
}
