import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/brand/Logo';
import { AlertCircle, ChevronRight, UserPlus } from 'lucide-react';
import { WORKER_ROLES } from '@/types/roles';

const WorkerSignup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passcode, setPasscode] = useState('');
    const [name, setName] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (selectedRoles.length === 0) {
            setError("Must assign at least one role.");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create Worker Profile in Firestore
            await addDoc(collection(db, 'workers'), {
                uid: user.uid,
                email: email,
                name: name,
                roles: selectedRoles,
                passcode: passcode, // Storing plain for this demo/MVP flow as requested
                createdAt: serverTimestamp(),
                isActive: true
            });

            // 3. Navigate
            navigate('/workers/login');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = (roleId: string) => {
        if (selectedRoles.includes(roleId)) {
            setSelectedRoles(selectedRoles.filter(id => id !== roleId));
        } else {
            setSelectedRoles([...selectedRoles, roleId]);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-4xl space-y-12">
                <div className="flex flex-col items-center space-y-4">
                    <Logo className="h-8 opacity-80" />
                    <h1 className="text-3xl font-display font-light">Worker Registration</h1>
                </div>

                <form onSubmit={handleSignup} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40">Full Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#e9c49a]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#e9c49a]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40">Set Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#e9c49a]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40">Set 6-Digit 2FA Passcode</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#e9c49a] tracking-[0.5em] font-mono text-center"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm flex items-center gap-3">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#e9c49a] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Create Worker Profile'}
                        </button>
                    </div>

                    <div className="space-y-6 h-[500px] overflow-y-auto custom-scrollbar p-1">
                        <h3 className="text-sm uppercase tracking-widest text-white/40 font-bold sticky top-0 bg-[#050505] pb-4 z-10">Assign Roles</h3>
                        <div className="space-y-3">
                            {WORKER_ROLES.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => toggleRole(role.id)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedRoles.includes(role.id)
                                        ? 'bg-[#e9c49a]/10 border-[#e9c49a] text-white'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider">{role.label}</span>
                                        {selectedRoles.includes(role.id) && <div className="w-2 h-2 bg-[#e9c49a] rounded-full" />}
                                    </div>
                                    <p className="text-[10px] opacity-60 leading-relaxed">{role.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkerSignup;
