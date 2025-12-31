import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Lock, Mail, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';

const WorkerLogin = () => {
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [workerData, setWorkerData] = useState<any>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Authenticate with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Check if user is in 'workers' collection
            const q = query(collection(db, 'workers'), where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Not a worker - sign out immediately
                await auth.signOut();
                throw new Error("Access Denied: You are not authorized as a worker system operator.");
            }

            const data = querySnapshot.docs[0].data();
            setWorkerData(data);

            // 3. Move to 2FA Step
            setStep('2fa');
        } catch (err: any) {
            console.error("Worker Login Error:", err);
            setError(err.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    const handle2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Verify 2FA against the stored passcode in workerData
        if (workerData?.passcode && twoFACode === workerData.passcode) {
            // Success
            localStorage.setItem("amora_worker_email", email);
            navigate('/workers/select-role');
        } else {
            setError("Invalid authentication code.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/[0.03] blur-[150px] -z-10 rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#e9c49a]/[0.02] blur-[100px] -z-10 rounded-full" />

            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-10 space-y-4">
                    <Logo className="h-8 mb-4 opacity-80" />
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <ShieldCheck className="w-3 h-3 text-[#e9c49a]" />
                        <span className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-bold">Secure System Access</span>
                    </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 'credentials' ? (
                            <motion.form
                                key="credentials"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleLogin}
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center mb-8">
                                    <h2 className="text-xl font-display font-light uppercase tracking-tight">Worker Identity</h2>
                                    <p className="text-xs text-white/30">Enter your operator credentials to proceed.</p>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">{error}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-[#e9c49a]/50 transition-colors">
                                        <Mail className="w-4 h-4 text-white/30" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Operator ID (Email)"
                                            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full"
                                            required
                                        />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-[#e9c49a]/50 transition-colors">
                                        <Lock className="w-4 h-4 text-white/30" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Access Key"
                                            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#e9c49a] text-black h-12 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                >
                                    {loading ? 'Verifying...' : 'Initiate Handshake'}
                                    {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="2fa"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handle2FA}
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center mb-8">
                                    <h2 className="text-xl font-display font-light uppercase tracking-tight">Two-Factor Verify</h2>
                                    <p className="text-xs text-white/30">Enter the 6-digit code from your authenticator.</p>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">{error}</span>
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        value={twoFACode}
                                        onChange={(e) => setTwoFACode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="bg-black/50 border border-white/10 rounded-2xl w-full text-center text-3xl tracking-[0.5em] font-mono py-4 focus:border-[#e9c49a] transition-all outline-none"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || twoFACode.length < 6}
                                    className="w-full bg-[#e9c49a] text-black h-12 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Authenticating...' : 'Verify & Enter'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep('credentials')}
                                    className="w-full text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Return to Credentials
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="mt-8 text-center text-[10px] text-white/20 uppercase tracking-widest font-light">
                    Restricted Access Only // Amora Systems v4.2
                </p>
            </div>
        </div>
    );
};

export default WorkerLogin;
