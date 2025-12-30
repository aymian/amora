import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Activity,
    CreditCard,
    UploadCloud,
    LayoutDashboard,
    Users,
    Film,
    Video,
    Flame,
    Settings,
    LogOut,
    ChevronRight,
    Plus,
    Bell,
    Search,
    CheckCircle2,
    XCircle,
    Heart,
    Image as ImageIcon,
    Sun
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const AdminNexus = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [citizens, setCitizens] = useState<any[]>([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [payments, setPayments] = useState<any[]>([]);
    const [fetchingPayments, setFetchingPayments] = useState(false);
    const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('amora_admin_token');
        if (!token) {
            navigate('/manager');
        }
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'users') {
            const fetchUsers = async () => {
                setFetchingUsers(true);
                try {
                    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
                    const { db } = await import('@/lib/firebase');
                    const querySnapshot = await getDocs(query(collection(db, "users"), orderBy('createdAt', 'desc')));
                    const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCitizens(userList);
                } catch (error) {
                    console.error("Error fetching citizens:", error);
                } finally {
                    setFetchingUsers(false);
                }
            };
            fetchUsers();
        }

        if (activeTab === 'payments') {
            const fetchPayments = async () => {
                setFetchingPayments(true);
                try {
                    const { collection, getDocs, query, where } = await import('firebase/firestore');
                    const { db } = await import('@/lib/firebase');
                    const q = query(collection(db, "payments"), where("status", "==", "pending"));
                    const querySnapshot = await getDocs(q);
                    const paymentList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // Client-side sort to avoid requiring composite indexes
                    paymentList.sort((a: any, b: any) => {
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    });

                    setPayments(paymentList);
                } catch (error) {
                    console.error("Error fetching payments:", error);
                } finally {
                    setFetchingPayments(false);
                }
            };
            fetchPayments();
        }
    }, [activeTab]);

    const handleApprovePayment = async (payment: any) => {
        try {
            const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            // 1. Update Payment Status
            await updateDoc(doc(db, "payments", payment.id), {
                status: 'approved',
                approvedAt: serverTimestamp()
            });

            // 2. Update User Plan
            await updateDoc(doc(db, "users", payment.userId), {
                plan: payment.plan
            });

            // 3. Refresh List
            setPayments(prev => prev.filter(p => p.id !== payment.id));
            alert(`Citizen ${payment.userName} has been successfully escalated to ${payment.plan} protocol.`);
        } catch (error) {
            console.error("Approval Error:", error);
        }
    };

    const handleRejectPayment = async (paymentId: string) => {
        if (!window.confirm("Are you sure you want to terminate this synchronization request?")) return;
        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            await updateDoc(doc(db, "payments", paymentId), {
                status: 'rejected'
            });
            setPayments(prev => prev.filter(p => p.id !== paymentId));
        } catch (error) {
            console.error("Rejection Error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('amora_admin_token');
        navigate('/manager');
    };

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Control Room' },
        { id: 'payments', icon: CreditCard, label: 'Pending Payments', alert: true },
        { id: 'upload', icon: UploadCloud, label: 'Media Lab', path: '/manager/upload' },
        { id: 'image-upload', icon: ImageIcon, label: 'Visual Lab', path: '/manager/image-upload' },
        { id: 'create-short', icon: Video, label: 'Create Short', path: '/create-short' },
        { id: 'moods-upload', icon: Heart, label: 'Mood Architecture', path: '/moods-uploads' },
        { id: 'happy-upload', icon: Film, label: 'Happy Lab', path: '/happy-upload' },
        { id: 'content', icon: Flame, label: 'Contents', path: '/manager/contents' },
        { id: 'users', icon: Users, label: 'Citizens' },
        { id: 'analytics', icon: Activity, label: 'System Pulse' },
        { id: 'settings', icon: Settings, label: 'Nexus Settings' },
    ];

    const handleNav = (item: any) => {
        if (item.path) {
            navigate(item.path);
        } else {
            setActiveTab(item.id);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden">

            {/* Cinematic Sidebar */}
            <aside className="w-72 bg-[#070707] border-r border-white/5 flex flex-col pt-10 pb-6 relative z-10 transition-all">
                {/* Glow behind logo */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-[#e9c49a]/5 blur-[40px] rounded-full pointer-events-none" />

                <div className="px-8 mb-12 relative">
                    <Logo className="h-6 opacity-80" />
                    <div className="mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[9px] uppercase tracking-[0.3em] text-[#e9c49a] font-bold">Nexus Command</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNav(item)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 group",
                                activeTab === item.id
                                    ? "bg-white/[0.04] text-white shadow-[inset_0_0_20px_rgba(233,196,154,0.05)] border border-white/5"
                                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={cn(
                                    "w-4 h-4 transition-all",
                                    activeTab === item.id ? "text-[#e9c49a] drop-shadow-[0_0_8px_#e9c49a]" : "group-hover:text-white"
                                )} />
                                <span className="text-xs font-light tracking-wide">{item.label}</span>
                            </div>

                            {item.alert && (
                                <div className="relative">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="px-4 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <span className="text-xs font-light">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Command Center */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* Background Ambient Lights */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/[0.03] blur-[150px] -z-10 rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/[0.02] blur-[100px] -z-10 rounded-full" />

                {/* Top Intelligence Bar */}
                <header className="h-20 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-20">
                    <div className="flex items-center gap-10">
                        <h2 className="text-sm font-light tracking-[0.2em] uppercase text-white/40">
                            Nexus / <span className="text-white text-medium">{activeTab.replace('-', ' ')}</span>
                        </h2>

                        <div className="h-6 w-[1px] bg-white/5" />

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-bold">Firebase: Online</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-bold">Supabase: Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 group cursor-pointer hover:border-white/20 transition-all">
                            <Search className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Global Scan..."
                                className="bg-transparent border-none outline-none text-xs text-white/60 placeholder:text-white/10 w-40"
                            />
                        </div>

                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-all cursor-pointer">
                            <Bell className="w-4 h-4 text-white/40" />
                            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="p-10 max-w-7xl mx-auto space-y-10 pb-20">

                    {activeTab === 'dashboard' && (
                        <>
                            {/* Welcome & System Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#e9c49a]/5 blur-[70px] rounded-full -mr-20 -mt-20" />

                                    <div className="relative space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 rounded-full bg-[#e9c49a]/10 border border-[#e9c49a]/20">
                                                <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#e9c49a]">Nexus v4.2 // Active</span>
                                            </div>
                                        </div>
                                        <h1 className="text-5xl font-display font-light tracking-tight leading-tight">
                                            Welcome back, <br /> <span className="text-[#e9c49a] italic">Director Yves.</span>
                                        </h1>
                                        <p className="text-white/30 text-sm font-light leading-relaxed max-w-md">
                                            The cinematic neural network is operating at 98% efficiency. 4 assets are currently awaiting manual spectral verification.
                                        </p>
                                    </div>

                                    <div className="relative pt-8 flex gap-6">
                                        <button className="flex items-center gap-3 px-6 py-3 bg-[#e9c49a] text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_20px_40px_rgba(233,196,154,0.1)]">
                                            <CreditCard className="w-4 h-4" /> Verify Payments
                                        </button>
                                        <button
                                            onClick={() => navigate('/manager/upload')}
                                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all font-sans"
                                        >
                                            <UploadCloud className="w-4 h-4" /> Lab Upload
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-[#070707] border border-white/5 p-10 rounded-[2.5rem] flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Resonance Load</span>
                                            <Activity className="w-4 h-4 text-[#e9c49a]" />
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'CPU Usage', val: '24%', color: 'bg-blue-500' },
                                                { label: 'Memory', val: '42%', color: 'bg-purple-500' },
                                                { label: 'Network', val: '12ms', color: 'bg-emerald-500' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-white/40">
                                                        <span>{stat.label}</span>
                                                        <span className="text-white/60">{stat.val}</span>
                                                    </div>
                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={cn("h-full", stat.color)}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: stat.val }}
                                                            transition={{ duration: 1, delay: 0.5 }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase tracking-widest text-[#e9c49a] font-bold">Node Status</span>
                                            <span className="text-xs font-light text-white/80">Alpha-Omega-4</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Verification Feed */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-xl font-display font-light tracking-tight">Pending Verifications</h2>
                                        <div className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
                                            <span className="text-[8px] uppercase font-bold text-red-500 leading-none">4 Awaiting</span>
                                        </div>
                                    </div>
                                    <button className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#e9c49a] hover:text-white transition-colors">See All Applications</button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 1, user: 'Seraphina Vale', plan: 'Elite', time: '14 min ago', status: 'Pending spectral verification' },
                                        { id: 2, user: 'Julian Thorne', plan: 'Creator', time: '2h ago', status: 'Payment screenshot uploaded' },
                                        { id: 3, user: 'Elara Moon', plan: 'Premium', time: '5h ago', status: 'Application submitted' },
                                        { id: 4, user: 'Kaelen Voss', plan: 'Elite', time: '1d ago', status: 'Manual upgrade request' }
                                    ].map((item) => (
                                        <div key={item.id} className="group bg-white/[0.01] border border-white/5 rounded-[2rem] p-6 flex items-center gap-8 hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer">
                                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#e9c49a] font-bold text-sm">
                                                {item.user.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-medium text-white/90 group-hover:text-white transition-colors">{item.user}</h4>
                                                    <span className="px-2 py-0.5 rounded-full bg-[#e9c49a]/10 text-[#e9c49a] text-[8px] uppercase font-bold tracking-widest">{item.plan}</span>
                                                </div>
                                                <p className="text-[10px] text-white/40 italic font-light">{item.status}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mb-3">{item.time}</p>
                                                <div className="flex items-center gap-3">
                                                    <button className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'payments' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-display font-light tracking-tight">Pending Synchronizations</h2>
                                <p className="text-white/30 text-xs font-light tracking-widest uppercase">Directorial Verification Hub // {payments.length} Requests</p>
                            </div>

                            {fetchingPayments ? (
                                <div className="h-64 flex items-center justify-center">
                                    <div className="w-10 h-10 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                                </div>
                            ) : payments.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="group bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all flex flex-col lg:flex-row gap-10">
                                            {/* Screenshot Preview */}
                                            <div className="w-full lg:w-72 h-48 lg:h-auto rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 relative group/img">
                                                {payment.screenshotUrl ? (
                                                    <img src={payment.screenshotUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Proof" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/10 italic text-[10px]">No proof artifact</div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all">View Full Artifact</a>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div className="space-y-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-xl font-medium text-white/90">{payment.userName}</h3>
                                                                <span className="px-3 py-1 rounded-full bg-[#e9c49a]/10 text-[#e9c49a] text-[9px] uppercase font-bold tracking-[0.2em]">{payment.plan} Protocol</span>
                                                            </div>
                                                            <p className="text-[10px] text-white/20 font-light tracking-widest uppercase flex items-center gap-2">
                                                                <Activity className="w-3 h-3" /> ID: {payment.id}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-display font-light text-[#e9c49a]">{payment.amount}</span>
                                                            <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-1">Verification Required</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                                        <div className="space-y-1">
                                                            <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Sender Resonance</p>
                                                            <p className="text-xs text-white/60 font-medium">{payment.senderName || 'Unspecified'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Synchronizer Node</p>
                                                            <p className="text-xs text-white/60 font-medium">{payment.momoNumber || 'Credit System'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Method</p>
                                                            <span className="text-[9px] text-[#e9c49a] uppercase font-bold">{payment.method}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 pt-8">
                                                    <button
                                                        onClick={() => handleApprovePayment(payment)}
                                                        className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all active:scale-95 shadow-[0_15px_30px_rgba(16,185,129,0.15)]"
                                                    >
                                                        Authorize Ascension
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectPayment(payment.id)}
                                                        className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white/10" />
                                    </div>
                                    <p className="text-white/20 text-sm font-light italic text-center">All citizen synchronizations are currently finalized.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-display font-light tracking-tight">Citizens Database</h2>
                                    <p className="text-white/30 text-xs font-light tracking-widest uppercase">System Index // {citizens.length} Identities</p>
                                </div>
                                <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                    <Plus className="w-5 h-5 text-[#e9c49a]" />
                                </button>
                            </div>

                            {fetchingUsers ? (
                                <div className="h-64 flex items-center justify-center">
                                    <div className="w-10 h-10 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {citizens.map((citizen) => (
                                        <div
                                            key={citizen.id}
                                            onClick={() => setSelectedCitizen(citizen)}
                                            className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-start gap-6 font-sans cursor-pointer"
                                        >
                                            <div className="w-20 h-20 rounded-[2rem] overflow-hidden border border-white/10 bg-black/40">
                                                {citizen.photoURL ? (
                                                    <img src={citizen.photoURL} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-display">
                                                        {citizen.fullName?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-medium text-white/90 group-hover:text-white transition-all">{citizen.fullName || 'Anonymous User'}</h3>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-[7px] uppercase font-bold tracking-widest",
                                                            citizen.plan === 'elite' ? "bg-[#e9c49a]/10 text-[#e9c49a]" :
                                                                citizen.plan === 'pro' ? "bg-blue-500/10 text-blue-400" :
                                                                    citizen.plan === 'creator' ? "bg-purple-500/10 text-purple-400" : "bg-white/5 text-white/40"
                                                        )}>
                                                            {citizen.plan || 'Free Member'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-white/20 truncate max-w-[200px]">{citizen.email}</p>
                                                </div>

                                                <div className="flex items-center gap-6 pt-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Onboarding</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", citizen.onboardingCompleted ? "bg-emerald-500" : "bg-red-500")} />
                                                            <span className="text-[9px] text-white/60 font-light">{citizen.onboardingCompleted ? 'Complete' : 'Pending'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Resonance Status</p>
                                                        <span className="text-[9px] text-white/60 font-light truncate">Operational</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Citizen Resonance Modal */}
                            <AnimatePresence>
                                {selectedCitizen && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                            className="w-full max-w-2xl bg-[#0D121F] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative"
                                        >
                                            <button
                                                onClick={() => setSelectedCitizen(null)}
                                                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all z-10"
                                            >
                                                <XCircle className="w-5 h-5 text-white/40" />
                                            </button>

                                            <div className="p-12 space-y-10">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border border-[#e9c49a]/30 shadow-[0_0_30px_rgba(233,196,154,0.1)]">
                                                        {selectedCitizen.photoURL ? (
                                                            <img src={selectedCitizen.photoURL} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-display">
                                                                {selectedCitizen.fullName?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <h2 className="text-3xl font-display font-light">{selectedCitizen.fullName}</h2>
                                                            <span className="px-3 py-1 rounded-full bg-[#e9c49a]/10 border border-[#e9c49a]/20 text-[#e9c49a] text-[9px] uppercase font-bold tracking-widest">
                                                                {selectedCitizen.plan || 'Free'} protocol
                                                            </span>
                                                        </div>
                                                        <p className="text-white/40 text-sm font-light uppercase tracking-widest">{selectedCitizen.email}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
                                                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Identity ID</p>
                                                        <p className="text-xs text-white/60 font-mono truncate">{selectedCitizen.id}</p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
                                                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Synchronization Date</p>
                                                        <p className="text-xs text-white/60">
                                                            {selectedCitizen.createdAt?.seconds
                                                                ? new Date(selectedCitizen.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                                : 'Initial Registry'}
                                                        </p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
                                                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Immersion Path</p>
                                                        <p className="text-xs text-white/60 font-medium">
                                                            {selectedCitizen.onboardingCompleted ? 'Pathway Verified' : 'Incomplete Initialization'}
                                                        </p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
                                                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Directorial Status</p>
                                                        <div className="flex items-center gap-2">
                                                            <Activity className="w-3 h-3 text-emerald-500" />
                                                            <span className="text-xs text-white/60">Operational Resonance</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <button className="flex-1 py-4 rounded-2xl bg-[#e9c49a] text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl active:scale-95">
                                                        Modify Protocol
                                                    </button>
                                                    <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
                                                        Restrict Access
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(233, 196, 154, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(233, 196, 154, 0.1);
        }
      `}</style>
        </div>
    );
};

export default AdminNexus;
