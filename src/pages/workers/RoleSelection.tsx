import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Briefcase, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import { WORKER_ROLES, WorkerRole } from '@/types/roles';

const RoleSelection = () => {
    const [loading, setLoading] = useState(true);
    const [assignedRoles, setAssignedRoles] = useState<WorkerRole[]>([]);
    const [selectedRole, setSelectedRole] = useState<WorkerRole | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkerProfile = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate('/workers/login');
                return;
            }

            try {
                // Find worker document
                const q = query(collection(db, 'workers'), where('uid', '==', user.uid));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    navigate('/workers/login');
                    return;
                }

                const data = snapshot.docs[0].data();
                setAssignedRoles(data.roles || []);
            } catch (error) {
                console.error("Error fetching worker profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkerProfile();
    }, [navigate]);

    const handleConfirmRole = () => {
        if (!selectedRole) return;

        // Set active role for session
        localStorage.setItem('amora_active_worker_role', selectedRole);
        navigate('/workers/dashboard');
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/workers/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#e9c49a]/20 border-t-[#e9c49a] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12">
            <header className="flex items-center justify-between max-w-7xl mx-auto mb-20">
                <div className="flex items-center gap-4 opacity-80">
                    <Logo className="h-6" />
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Role Assignment</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-3 h-3" /> Terminate Session
                </button>
            </header>

            <main className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-display font-light">Select Operational Protocol</h1>
                    <p className="text-white/40 font-light max-w-xl">
                        Identify your active role for this session. You may only activate one operational protocol at a time to ensure system integrity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {WORKER_ROLES.filter(r => assignedRoles.includes(r.id)).map((role) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedRole(role.id)}
                            className={cn(
                                "p-8 rounded-[2rem] border cursor-pointer relative overflow-hidden transition-all duration-300 group",
                                selectedRole === role.id
                                    ? "bg-[#e9c49a] border-[#e9c49a] text-black"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                            )}
                        >
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className={cn(
                                        "p-3 rounded-2xl",
                                        selectedRole === role.id ? "bg-black/10 text-black" : "bg-white/5 text-[#e9c49a]"
                                    )}>
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    {selectedRole === role.id && (
                                        <CheckCircle2 className="w-6 h-6 text-black" />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <span className={cn(
                                        "text-[9px] uppercase tracking-[0.2em] font-bold",
                                        selectedRole === role.id ? "text-black/40" : "text-white/20"
                                    )}>
                                        {role.category}
                                    </span>
                                    <h3 className="text-2xl font-display font-medium tracking-tight leading-none">
                                        {role.label}
                                    </h3>
                                    <p className={cn(
                                        "text-xs leading-relaxed",
                                        selectedRole === role.id ? "text-black/60 font-medium" : "text-white/40 font-light"
                                    )}>
                                        {role.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {assignedRoles.length === 0 && (
                        <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-[2rem]">
                            <p className="text-white/30 text-sm">No roles assigned. Contact Administration.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-8">
                    <button
                        onClick={handleConfirmRole}
                        disabled={!selectedRole}
                        className="px-10 py-5 bg-emerald-500 text-black rounded-2xl font-bold text-xs uppercase tracking-[0.25em] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                    >
                        Initialize Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RoleSelection;
