import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldAlert, KeyRound, UserCircle2, Sparkles } from 'lucide-react';

const AdminLogin = () => {
    const [form, setForm] = useState({ user: '', pass: '' });
    const [status, setStatus] = useState<null | 'authorized' | 'denied'>(null);
    const navigate = useNavigate();

    const handleEntry = (e: React.FormEvent) => {
        e.preventDefault();
        // THE MASTER KEY
        if (form.user === 'amora2050' && form.pass === 'yves2050') {
            setStatus('authorized');
            localStorage.setItem('amora_admin_token', 'session_active_2050');
            toast.success('Nexus Session Initialized');
            navigate('/manager/nexus');
        } else {
            setStatus('denied');
            toast.error('Access Denied: Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans overflow-hidden relative">
            {/* Cinematic Ambient Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#e9c49a]/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 w-full max-w-sm p-10 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e9c49a]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="text-center mb-10 relative">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#e9c49a] to-[#8b6544] flex items-center justify-center shadow-[0_0_30px_rgba(233,196,154,0.2)]">
                            <Sparkles className="w-8 h-8 text-black" />
                        </div>
                    </motion.div>
                    <h1 className="text-4xl font-extralight tracking-[0.4em] text-white uppercase mb-1">AMORA</h1>
                    <p className="text-[#e9c49a] text-[9px] tracking-[0.5em] font-bold uppercase opacity-60">Nexus Command</p>
                </div>

                <form onSubmit={handleEntry} className="space-y-6 relative">
                    <div className="space-y-2">
                        <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] ml-1 font-bold">Admin ID</label>
                        <div className="relative group/input">
                            <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-[#e9c49a] transition-colors" />
                            <input
                                type="text"
                                autoComplete="off"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 text-white text-sm focus:border-[#e9c49a]/30 focus:bg-black/60 outline-none transition-all placeholder:text-white/5"
                                placeholder="Enter Identity"
                                onChange={(e) => setForm({ ...form, user: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] ml-1 font-bold">Access Key</label>
                        <div className="relative group/input">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-[#e9c49a] transition-colors" />
                            <input
                                type="password"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 text-white text-sm focus:border-[#e9c49a]/30 focus:bg-black/60 outline-none transition-all placeholder:text-white/5"
                                placeholder="••••••••"
                                onChange={(e) => setForm({ ...form, pass: e.target.value })}
                            />
                        </div>
                    </div>

                    {status === 'denied' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                        >
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">Invalid Access Key</p>
                        </motion.div>
                    )}

                    <button className="w-full bg-white text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#e9c49a] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:shadow-[#e9c49a]/20 active:scale-[0.98]">
                        Initialize Session
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[8px] text-white/10 uppercase tracking-[0.3em] font-medium leading-relaxed">
                        Proprietary System • Restricted to authorized Creative Directors only.<br />
                        © 2050 Amora Cinematic Guild
                    </p>
                </div>
            </motion.div>

            {/* Background Micro-particles overlay can be added here */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute h-[1px] w-[1px] bg-white rounded-full top-[15%] left-[25%] animate-pulse" />
                <div className="absolute h-[1px] w-[1px] bg-white rounded-full top-[45%] left-[85%] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute h-[2px] w-[2px] bg-[#e9c49a] rounded-full top-[75%] left-[15%] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
        </div>
    );
};

export default AdminLogin;
