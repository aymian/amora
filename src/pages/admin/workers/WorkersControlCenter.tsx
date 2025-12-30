import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    MoreVertical,
    ShieldAlert,
    Activity,
    CheckCircle2,
    XCircle,
    Lock,
    Clock,
    Filter,
    ArrowUpRight,
    PlayCircle
} from 'lucide-react';
import { collection, query, getDocs, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';

interface Worker {
    id: string;
    name: string;
    email: string;
    roles: string[];
    isActive: boolean;
    lastActive?: any;
    currentTask?: string;
    createdAt?: any;
}

const WorkersControlCenter = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const q = query(collection(db, 'workers'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const workerData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Worker[];
            setWorkers(workerData);
        } catch (error) {
            console.error("Error fetching workers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendWorker = async (workerId: string, currentStatus: boolean) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this worker?`)) return;

        try {
            await updateDoc(doc(db, 'workers', workerId), {
                isActive: !currentStatus
            });
            setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, isActive: !currentStatus } : w));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDeleteWorker = async (workerId: string) => {
        if (!window.confirm("WARNING: This will permanently delete the worker profile. Continue?")) return;

        try {
            await deleteDoc(doc(db, 'workers', workerId));
            setWorkers(prev => prev.filter(w => w.id !== workerId));
            setSelectedWorker(null);
        } catch (error) {
            console.error("Error deleting worker:", error);
        }
    };

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-10">
            {/* Header */}
            <header className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-[#e9c49a]" />
                        <h1 className="text-2xl font-display font-light tracking-tight">Workers Control Center</h1>
                    </div>
                    <p className="text-white/40 text-xs font-light tracking-wide pl-8">
                        System Administration // Total Workforce: {workers.length}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#e9c49a] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search operatives..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#e9c49a]/50 w-64 transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Workers List Table */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-white/30 font-bold">Identity</th>
                                        <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-white/30 font-bold">Role Assignment</th>
                                        <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-white/30 font-bold">Status</th>
                                        <th className="px-6 py-4 text-[9px] uppercase tracking-widest text-white/30 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredWorkers.map((worker) => (
                                        <tr
                                            key={worker.id}
                                            onClick={() => setSelectedWorker(worker)}
                                            className={cn(
                                                "hover:bg-white/[0.02] cursor-pointer transition-colors group",
                                                selectedWorker?.id === worker.id ? "bg-[#e9c49a]/5" : ""
                                            )}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-[#e9c49a]">
                                                        {worker.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white/90 group-hover:text-white">{worker.name}</div>
                                                        <div className="text-[10px] text-white/40">{worker.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {worker.roles?.[0] ? (
                                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase tracking-wide text-white/60">
                                                            {worker.roles[0].replace(/_/g, ' ')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-white/20 text-[10px] italic">Unassigned</span>
                                                    )}
                                                    {worker.roles?.length > 1 && (
                                                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/40">
                                                            +{worker.roles.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", worker.isActive ? "bg-emerald-500" : "bg-red-500")} />
                                                    <span className={cn("text-[10px] uppercase font-bold tracking-wider", worker.isActive ? "text-emerald-500" : "text-red-500")}>
                                                        {worker.isActive ? 'Active' : 'Suspended'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Live Activity Feed & Quick View */}
                <div className="space-y-6">
                    {/* Live Feed Panel */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-500" /> Live Operations
                            </h3>
                            <button className="text-[9px] text-[#e9c49a] uppercase font-bold hover:text-white transition-colors">View All Logs</button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white/10" />
                                    <div className="space-y-1">
                                        <p className="text-xs text-white/80 leading-relaxed">
                                            <span className="text-[#e9c49a]">Worker_{12 + i}</span> approved payment for user <span className="text-white/40">#8821</span>
                                        </p>
                                        <p className="text-[9px] text-white/20 font-mono">1{i} mins ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Worker Quick Actions */}
                    <AnimatePresence mode="wait">
                        {selectedWorker ? (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#e9c49a] text-black flex items-center justify-center font-bold">
                                            {selectedWorker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white leading-none mb-1">{selectedWorker.name}</h3>
                                            <p className="text-[10px] text-white/40 uppercase tracking-wide">ID: {selectedWorker.id.slice(0, 6)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/nexus/workers/${selectedWorker.id}`)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                                        <p className="text-[8px] uppercase text-white/20 font-bold">Tasks Today</p>
                                        <p className="text-xl font-display">24</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                                        <p className="text-[8px] uppercase text-white/20 font-bold">Avg Speed</p>
                                        <p className="text-xl font-display text-emerald-500">2m 30s</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleSuspendWorker(selectedWorker.id, selectedWorker.isActive)}
                                        className={cn(
                                            "w-full py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all",
                                            selectedWorker.isActive
                                                ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black"
                                                : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black"
                                        )}
                                    >
                                        {selectedWorker.isActive ? 'Suspend Access' : 'Reactivate Access'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteWorker(selectedWorker.id)}
                                        className="w-full py-3 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-all"
                                    >
                                        Revoke & Delete
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-[#0a0a0a] border border-white/5 border-dashed rounded-[2rem] p-6 h-[280px] flex flex-col items-center justify-center text-center space-y-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                    <PlayCircle className="w-5 h-5 text-white/20" />
                                </div>
                                <p className="text-sm text-white/40 font-light">Select an operative to inspect metrics and controls.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default WorkersControlCenter;
