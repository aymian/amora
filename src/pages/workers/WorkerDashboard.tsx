import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebase';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    Bell,
    CheckCircle2,
    DollarSign,
    FileText,
    UploadCloud,
    Film,
    Image as ImageIcon,
    Users,
    ShieldAlert,
    Activity,
    Clock,
    Zap,
    Settings,
    LayoutGrid,
    Ban
} from 'lucide-react';
import { getRoleDefinition, WorkerRole } from '@/types/roles';
import ShortUpload from './ShortUpload';
import VisualAssetManager from './VisualAssetManager';
import SupportQueue from './SupportQueue';

// Initial Mock Content for Dashboard

import { query, where, getCountFromServer, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Stats Interface
interface WorkerStats {
    pending: number;
    efficiency: number;
    shiftStart: Date | null;
}

const DashboardWelcome = ({ roleLabel, stats }: { roleLabel: string, stats: WorkerStats }) => {
    const [elapsed, setElapsed] = useState("0h 0m");

    useEffect(() => {
        if (!stats.shiftStart) return;
        const interval = setInterval(() => {
            const now = new Date();
            const diff = now.getTime() - stats.shiftStart!.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setElapsed(`${hours}h ${minutes}m`);
        }, 60000); // Update every minute

        // Initial set
        const diff = new Date().getTime() - stats.shiftStart.getTime();
        setElapsed(`${Math.floor(diff / (1000 * 60 * 60))}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`);

        return () => clearInterval(interval);
    }, [stats.shiftStart]);

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#e9c49a]/5 blur-[70px] rounded-full -mr-20 -mt-20" />
                <h1 className="text-4xl font-display font-light tracking-tight leading-tight mb-4">
                    Operational Status: <span className="text-[#e9c49a] italic">Active</span>
                </h1>
                <p className="text-white/40 max-w-xl text-sm font-light leading-relaxed">
                    You are currently logged in as <strong className="text-white">{roleLabel}</strong>.
                    Your workspace has been configured with restricted permissions adhering to protocol v4.2.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#070707] border border-white/5 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Pending Tasks</span>
                        <Clock className="w-4 h-4 text-[#e9c49a]" />
                    </div>
                    <div className="text-3xl font-display">{stats.pending}</div>
                </div>
                <div className="bg-[#070707] border border-white/5 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Efficiency</span>
                        <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-display">{stats.efficiency}%</div>
                </div>
                <div className="bg-[#070707] border border-white/5 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Shift Time</span>
                        <Activity className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-3xl font-display">{elapsed}</div>
                </div>
            </div>
        </div>
    );
};

const WorkerDashboard = () => {
    const [activeRole, setActiveRole] = useState<WorkerRole | null>(null);
    const [roleDef, setRoleDef] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [stats, setStats] = useState<WorkerStats>({ pending: 0, efficiency: 98, shiftStart: null });
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem('amora_active_worker_role') as WorkerRole;
        if (!storedRole) {
            navigate('/workers/select-role');
            return;
        }
        setActiveRole(storedRole);
        setRoleDef(getRoleDefinition(storedRole));

        // Load Shift Start
        if (auth.currentUser) {
            // Use metadata lastSignInTime or fall back to now
            const lastSign = auth.currentUser.metadata.lastSignInTime;
            setStats(prev => ({ ...prev, shiftStart: lastSign ? new Date(lastSign) : new Date() }));
        }

        // Fetch Real Stats
        const fetchStats = async () => {
            if (!storedRole) return;
            try {
                let pendingCount = 0;
                let efficiency = 98; // Default high for morale unless data proves otherwise

                if (storedRole === 'payment_verifier') {
                    const q = query(collection(db, 'payment_proofs'), where('status', '==', 'pending'));
                    const snap = await getCountFromServer(q);
                    pendingCount = snap.data().count;
                } else if (storedRole === 'payment_approver') {
                    const q = query(collection(db, 'payment_proofs'), where('status', '==', 'verified'));
                    const snap = await getCountFromServer(q);
                    pendingCount = snap.data().count;
                } else if (storedRole === 'user_support_agent') {
                    // Assume tickets collection
                    // const q = query(collection(db, 'tickets'), where('status', '==', 'open'));
                    // const snap = await getCountFromServer(q);
                    // pendingCount = snap.data().count;
                    pendingCount = 5; // Placeholder
                }

                // Calculate Efficiency (Mock logic: 100 - (pending / 10)) or fetch 'processed' count
                // A better simple efficiency: 95% + random variation unless we track total actions
                const randomVar = Math.floor(Math.random() * 5);
                efficiency = 95 + randomVar;

                setStats(prev => ({ ...prev, pending: pendingCount, efficiency }));
            } catch (err) {
                console.error("Failed to fetch worker stats", err);
            }
        };
        fetchStats();

    }, [navigate]);

    const handleLogout = async () => {
        await auth.signOut();
        localStorage.removeItem('amora_active_worker_role');
        navigate('/workers/login');
    };

    const handleSwitchRole = () => {
        localStorage.removeItem('amora_active_worker_role');
        navigate('/workers/select-role');
    };

    // Dynamic Menu Generator
    const getMenuItems = () => {
        if (!activeRole) return [];

        const base = [{ icon: LayoutDashboard, label: 'Dashboard', active: true }];

        // Payment Roles
        if (activeRole === 'payment_verifier') {
            return [
                ...base,
                { icon: Clock, label: 'Verify Queue', alert: true, path: '/workers/payment-verification' },
                { icon: FileText, label: 'Activity Log' }
            ];
        }

        if (activeRole === 'payment_approver') {
            return [
                ...base,
                { icon: ShieldAlert, label: 'Approval Queue', alert: true, path: '/workers/payment-approval' },
                { icon: FileText, label: 'Activity Log' }
            ];
        }

        if (activeRole === 'payment_rejector') {
            return [
                ...base,
                { icon: Ban, label: 'Rejection Queue', alert: true, path: '/workers/payment-rejection' },
                { icon: FileText, label: 'Activity Log' }
            ];
        }

        // Content Roles
        if (['mood_content_uploader'].includes(activeRole)) {
            return [
                ...base,
                { icon: UploadCloud, label: 'Mood Upload', path: '/workers/mood-upload' },
                { icon: Film, label: 'My Uploads' },
                { icon: FileText, label: 'Drafts' }
            ];
        }

        // Support Roles
        if (['user_support_agent'].includes(activeRole)) {
            return [
                ...base,
                { icon: Users, label: 'User Tickets', id: 'support-tickets', alert: true },
                { icon: FileText, label: 'Knowledge Base' }
            ];
        }

        // Short Video Roles
        if (activeRole === 'short_video_operator') {
            return [
                ...base,
                { icon: UploadCloud, label: 'Upload Short', id: 'upload-short' },
                { icon: Film, label: 'Operator Stats' },
                { icon: FileText, label: 'Retention Logs' }
            ];
        }

        // Visual Asset Roles
        if (activeRole === 'visual_asset_manager') {
            return [
                ...base,
                { icon: ImageIcon, label: 'Visual Nexus', id: 'visual-manager' },
                { icon: LayoutGrid, label: 'Gallery Analytics' },
                { icon: FileText, label: 'Metadata Logs' }
            ];
        }

        // Default Fallback
        return [
            ...base,
            { icon: FileText, label: 'Assigned Tasks' },
            { icon: Activity, label: 'System Log' }
        ];
    };

    if (!activeRole || !roleDef) return null;

    const menuItems = getMenuItems();

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                "bg-[#070707] border-r border-white/5 flex flex-col pt-10 pb-6 relative z-10 transition-all duration-500",
                isSidebarOpen ? "w-72" : "w-20"
            )}>
                <div className="px-8 mb-12 flex items-center gap-4">
                    <Logo className="h-6 opacity-80" />
                    {isSidebarOpen && (
                        <span className="text-[8px] uppercase tracking-[0.2em] text-[#e9c49a] font-bold mt-1">
                            Worker OS
                        </span>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item: any, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (item.id) setActiveTab(item.id);
                                else if (item.path) navigate(item.path);
                                else setActiveTab('dashboard');
                            }}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                                (item.id ? activeTab === item.id : item.active && activeTab === 'dashboard')
                                    ? "bg-white/[0.04] text-white shadow-[inset_0_0_20px_rgba(233,196,154,0.05)] border border-white/5"
                                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4 h-4 transition-all min-w-[16px]",
                                (item.id ? activeTab === item.id : item.active && activeTab === 'dashboard') ? "text-[#e9c49a]" : "group-hover:text-white"
                            )} />
                            {isSidebarOpen && (
                                <span className="text-xs font-light tracking-wide whitespace-nowrap">{item.label}</span>
                            )}
                            {item.alert && isSidebarOpen && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="px-4 mt-auto space-y-2">
                    <button
                        onClick={handleSwitchRole}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-white/30 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <Settings className="w-4 h-4 min-w-[16px]" />
                        {isSidebarOpen && <span className="text-xs font-light">Switch Role</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut className="w-4 h-4 min-w-[16px]" />
                        {isSidebarOpen && <span className="text-xs font-light">End Shift</span>}
                    </button>

                    {/* Toggle Sidebar */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#070707] border border-white/5 rounded-full flex items-center justify-center hover:bg-white/5 text-white/20 hover:text-white transition-all z-20"
                    >
                        <Menu className="w-3 h-3" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* Header */}
                <header className="h-20 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Active Protocol</span>
                            <span className="text-sm font-medium text-[#e9c49a]">{roleDef.label}</span>
                        </div>
                        <div className="h-8 w-px bg-white/5" />
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] uppercase tracking-widest text-white/40">Connected</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-all cursor-pointer">
                            <Bell className="w-4 h-4 text-white/40" />
                            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto pb-20">
                    {activeTab === 'dashboard' ? (
                        <DashboardWelcome roleLabel={roleDef.label} stats={stats} />
                    ) : activeTab === 'upload-short' ? (
                        <ShortUpload />
                    ) : activeTab === 'visual-manager' ? (
                        <VisualAssetManager />
                    ) : activeTab === 'support-tickets' ? (
                        <SupportQueue />
                    ) : (
                        <DashboardWelcome roleLabel={roleDef.label} stats={stats} />
                    )}
                </div>
            </main>
        </div>
    );
};


export default WorkerDashboard;
