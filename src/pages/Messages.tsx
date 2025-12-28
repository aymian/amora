import { useState, useEffect } from "react";
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
    Sparkles
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData({ id: user.uid, ...userDoc.data() });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
                lastMessageAt: serverTimestamp()
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

    if (loading) return null;

    return (
        <DashboardLayout user={userData}>
            <div className="h-[calc(100vh-160px)] flex gap-6 overflow-hidden">
                {/* Chat Sidebar */}
                <aside className="w-80 flex flex-col gap-4">
                    <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-display font-light">Resonance</h2>
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white/40" />
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Citizens..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs outline-none focus:border-[#e9c49a]/40 transition-all placeholder:text-white/10"
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
                                        "w-full p-4 rounded-3xl flex items-center gap-4 transition-all group",
                                        activeChat?.id === chat.id ? "bg-[#e9c49a]/10 border border-[#e9c49a]/20" : "bg-white/[0.01] border border-transparent hover:bg-white/[0.03]"
                                    )}
                                >
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
                <main className="flex-1 flex flex-col rounded-[3rem] bg-white/[0.02] border border-white/5 overflow-hidden">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
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
                            <footer className="p-6 bg-black/20 border-t border-white/5">
                                <form onSubmit={handleSendMessage} className="relative group">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Transmit Message..."
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 px-8 pr-16 text-sm outline-none focus:border-[#e9c49a]/30 transition-all font-light"
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#e9c49a] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-sm">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-[#e9c49a]/5 blur-3xl animate-pulse" />
                                <MessageSquare className="w-10 h-10 text-white/5" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-display font-light">Select a <span className="text-[#e9c49a] italic">Resonance</span></h3>
                                <p className="text-white/20 text-xs font-light max-w-xs mx-auto">Choose a citizen from the planetary registry to establish a secure directorial comm-link.</p>
                            </div>
                        </div>
                    )}
                </main>

                {/* Info Panel */}
                <aside className="w-64 hidden xl:flex flex-col gap-6">
                    <div className="p-8 rounded-[3rem] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 text-center space-y-6">
                        <div className="w-24 h-24 rounded-full mx-auto relative group">
                            <img
                                src={`https://ui-avatars.com/api/?name=${userData?.fullName || 'User'}&background=random`}
                                className="w-full h-full rounded-full object-cover grayscale transition-all group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#e9c49a]/20 group-hover:animate-spin-slow" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-display font-light">{userData?.fullName || "Citizen"}</h4>
                            <p className="text-[9px] uppercase tracking-widest text-[#e9c49a] font-bold">{userData?.plan || 'Free'} Protocol</p>
                        </div>
                        <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/5">
                            <div className="text-center">
                                <p className="text-[8px] uppercase tracking-tighter text-white/20 font-bold">Artifacts</p>
                                <p className="text-sm font-display font-light text-white">12</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] uppercase tracking-tighter text-white/20 font-bold">Resonance</p>
                                <p className="text-sm font-display font-light text-white">85%</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40">
                            <Lock className="w-3 h-3 text-[#e9c49a]" /> Security
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest leading-relaxed">E2E SHIELD-V4 ENCRYPTION ACTIVE</p>
                            </div>
                            <p className="text-[10px] text-white/20 font-light italic">All directorial transmissions are filtered through the planetary security grid.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}
