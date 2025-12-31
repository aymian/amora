import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/Logo";
import { Search, Info } from "lucide-react";

export default function ApplicationReply() {
    const [email, setEmail] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setSearched(false);
        setResult(null);

        try {
            const q = query(
                collection(db, "applications"),
                where("email", "==", email)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                // Get the most recent one
                const data = snapshot.docs.map(d => d.data()).sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
                setResult(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
                <header className="text-center space-y-4">
                    <Logo className="h-8 mx-auto" />
                    <h1 className="text-2xl font-display font-light">Application Status</h1>
                    <p className="text-white/40 text-sm">Enter you registered email to check for team updates.</p>
                </header>

                <form onSubmit={handleCheck} className="relative">
                    <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-2xl py-6 pl-6 pr-14 text-lg"
                    />
                    <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 w-12 bg-[#e9c49a] rounded-xl flex items-center justify-center text-black hover:bg-white transition-all disabled:opacity-50">
                        <Search className="w-5 h-5" />
                    </button>
                </form>

                {searched && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {result ? (
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-widest text-white/30">Applicant</p>
                                    <p className="text-lg font-light">{result.fullName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-widest text-white/30">Role Applied</p>
                                    <p className="text-[#e9c49a]">{result.role || result.otherRole}</p>
                                </div>
                                <div className="space-y-1 pt-4 border-t border-white/5">
                                    <p className="text-xs uppercase tracking-widest text-white/30">Current Status</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${result.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                result.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                            {result.status}
                                        </div>
                                    </div>
                                </div>
                                {result.reply && (
                                    <div className="bg-[#e9c49a]/5 border border-[#e9c49a]/10 p-4 rounded-2xl">
                                        <p className="text-xs uppercase tracking-widest text-[#e9c49a] mb-2 font-bold">Admin Reply</p>
                                        <p className="text-sm font-light leading-relaxed text-white/80">{result.reply}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-8 border border-dashed border-white/10 rounded-3xl">
                                <Info className="w-8 h-8 text-white/20 mx-auto mb-3" />
                                <p className="text-white/40">No application found for this email.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
