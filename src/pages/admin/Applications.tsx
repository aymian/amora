import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { Search, CheckCircle, XCircle, Trash2, Mail, ExternalLink, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AdminApplications() {
    const navigate = useNavigate();
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyMode, setReplyMode] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        // Auth check
        const token = localStorage.getItem('amora_admin_token');
        if (token !== 'session_active_2050') {
            navigate('/manager');
            return;
        }
        fetchApps();
    }, [navigate]);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateDoc(doc(db, "applications", id), { status });
            setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            toast.success(`Marked as ${status}`);
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleSendReply = async (id: string) => {
        try {
            await updateDoc(doc(db, "applications", id), {
                reply: replyText,
                status: 'replied' // Or keep existing? user context implies reply updates it
            });
            setApps(prev => prev.map(a => a.id === id ? { ...a, reply: replyText } : a));
            toast.success("Reply sent (saved to DB)");
            setReplyMode(null);
            setReplyText("");
        } catch (error) {
            toast.error("Failed to save reply");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "applications", id));
            setApps(prev => prev.filter(a => a.id !== id));
            toast.success("Application removed");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
            <header className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-display font-light">Team Applications</h1>
                    <p className="text-white/40 text-sm mt-1">Review and manage inbound candidate requests.</p>
                </div>
                <button onClick={fetchApps} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <RefreshCcw className="w-5 h-5 text-white/60" />
                </button>
            </header>

            <div className="max-w-7xl mx-auto grid gap-6">
                {loading ? (
                    <div className="text-center py-20 text-white/30">Loading...</div>
                ) : apps.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                        <p className="text-white/40">No applications received yet.</p>
                    </div>
                ) : (
                    apps.map((app) => (
                        <div key={app.id} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group">
                            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                                {/* Info */}
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold">{app.fullName}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-500' :
                                                app.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-yellow-500/20 text-yellow-500'
                                            }`}>{app.status}</span>
                                        <span className="text-xs text-white/30 font-mono">
                                            {app.createdAt?.seconds ? format(new Date(app.createdAt.seconds * 1000), 'MMM d, h:mm a') : 'Just now'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/60">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] mb-1">Role</p>
                                            {app.role || app.otherRole}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] mb-1">Location</p>
                                            {app.location}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] mb-1">Age</p>
                                            {app.age}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-[#e9c49a] mb-1">Contact</p>
                                            {app.email}<br />{app.phone}
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.02] p-4 rounded-xl space-y-3 border border-white/5">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Skills</p>
                                            <p className="text-sm font-light">{app.skills}</p>
                                        </div>
                                        {app.experience && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Experience</p>
                                                <p className="text-sm font-light">{app.experience}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Links</p>
                                            <div className="flex gap-4 text-xs">
                                                {app.portfolio_drive && <a href={app.portfolio_drive} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline"><ExternalLink className="w-3 h-3" /> Drive</a>}
                                                {app.portfolio_social && <a href={app.portfolio_social} target="_blank" className="flex items-center gap-1 text-pink-400 hover:underline"><ExternalLink className="w-3 h-3" /> Social</a>}
                                                {app.portfolio_web && <a href={app.portfolio_web} target="_blank" className="flex items-center gap-1 text-emerald-400 hover:underline"><ExternalLink className="w-3 h-3" /> Web</a>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Motivation</p>
                                            <p className="text-sm italic opacity-60">"{app.motivation}"</p>
                                        </div>
                                    </div>

                                    {/* Existing Reply Display */}
                                    {app.reply && (
                                        <div className="bg-[#e9c49a]/10 border border-[#e9c49a]/20 p-3 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-[#e9c49a] mb-1">Sent Reply:</p>
                                            <p className="text-sm">{app.reply}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col gap-2 min-w-[140px]">
                                    <button onClick={() => handleUpdateStatus(app.id, 'accepted')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-lg transition-all text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                                        <CheckCircle className="w-4 h-4" /> Accept
                                    </button>
                                    <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider border border-red-500/20">
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                    <button onClick={() => setReplyMode(app.id === replyMode ? null : app.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white/60 hover:bg-white/20 hover:text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider">
                                        <Mail className="w-4 h-4" /> {app.reply ? 'Edit Reply' : 'Reply'}
                                    </button>
                                    <button onClick={() => handleDelete(app.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-lg transition-all text-xs">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Reply Box */}
                            {replyMode === app.id && (
                                <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Write your response here..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm mb-2 h-24 focus:border-[#e9c49a]"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setReplyMode(null)} className="px-4 py-2 text-xs text-white/40 hover:text-white">Cancel</button>
                                        <button onClick={() => handleSendReply(app.id)} className="px-6 py-2 bg-[#e9c49a] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white">
                                            Send Response
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
