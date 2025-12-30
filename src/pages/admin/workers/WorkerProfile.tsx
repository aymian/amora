import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Activity, ShieldAlert, Lock, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WORKER_ROLES } from '@/types/roles';

const WorkerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                // Fetch Worker Profile
                const workerDoc = await getDoc(doc(db, 'workers', id));
                if (workerDoc.exists()) {
                    setWorker({ id: workerDoc.id, ...workerDoc.data() });
                }

                // Fetch Worker Logs (Placeholder for now)
                // In prod, this would query a 'system_logs' collection
                setLogs([
                    { action: 'Approved Payment', target: 'User_992', timestamp: Date.now() - 3600000 },
                    { action: 'Login Success', target: 'Self', timestamp: Date.now() - 7200000 },
                    { action: 'Viewed Content', target: 'Video_112', timestamp: Date.now() - 12000000 },
                ]);

            } catch (error) {
                console.error("Error fetching worker details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleToggleActive = async () => {
        if (!worker) return;
        const newStatus = !worker.isActive;

        try {
            await updateDoc(doc(db, 'workers', worker.id), { isActive: newStatus });
            setWorker({ ...worker, isActive: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (loading) return null;
    if (!worker) return <div className="text-white">Worker not found</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12">
            <button
                onClick={() => navigate('/admin/nexus/workers')}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-xs uppercase tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Nexus
            </button>

            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-[#e9c49a] text-black flex items-center justify-center text-3xl font-bold">
                        {worker.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-display font-medium tracking-tight">{worker.name}</h1>
                            {worker.isActive ? (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold tracking-widest rounded-full border border-emerald-500/20">Active</span>
                            ) : (
                                <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-widest rounded-full border border-red-500/20">Suspended</span>
                            )}
                        </div>
                        <p className="text-white/40 text-sm font-light">{worker.email}</p>
                        <div className="flex items-center gap-2 pt-1">
                            {worker.roles.map((role: string) => (
                                <span key={role} className="text-[9px] uppercase tracking-widest px-2 py-1 bg-white/5 rounded border border-white/10 text-white/60">
                                    {role.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleToggleActive}
                        className={cn(
                            "px-6 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all flex items-center gap-2",
                            worker.isActive
                                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black"
                        )}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        {worker.isActive ? 'Suspend Access' : 'Reactivate'}
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-white/5 text-white/40 border border-white/10 hover:text-white hover:bg-white/10 transition-all text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Reset Key
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Metrics */}
                <div className="space-y-4">
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] space-y-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Tasks Completed</span>
                                <span className="text-xl font-display">1,248</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Avg Response Time</span>
                                <span className="text-xl font-display text-emerald-500">1m 42s</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">SLA Breach Rate</span>
                                <span className="text-xl font-display text-white/20">0.4%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] space-y-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Security Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-white/60">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                2FA Enabled
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/60">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Email Verified
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/60">
                                <Clock className="w-4 h-4 text-[#e9c49a]" />
                                Last Login: 2 hours ago
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-6">Activity Timeline</h3>
                    <div className="space-y-8 relative before:absolute before:left-2.5 before:top-4 before:h-full before:w-px before:bg-white/5">
                        {logs.map((log, idx) => (
                            <div key={idx} className="relative flex items-start gap-6">
                                <div className="absolute left-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#e9c49a]" />
                                <div className="space-y-1">
                                    <p className="text-sm text-white font-medium">{log.action}</p>
                                    <p className="text-xs text-white/40">Target: {log.target}</p>
                                    <p className="text-[10px] text-white/20 font-mono pt-1">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerProfile;
