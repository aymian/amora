import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bell, ShieldCheck, Tag, Send, Globe, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PopupManager() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetPlans, setTargetPlans] = useState<string[]>([]);
    const [type, setType] = useState("update");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Simple auth check
        const token = localStorage.getItem('amora_admin_token');
        if (token !== 'session_active_2050') {
            navigate('/manager');
        }
    }, [navigate]);

    const handleTogglePlan = (plan: string) => {
        setTargetPlans(prev =>
            prev.includes(plan)
                ? prev.filter(p => p !== plan)
                : [...prev, plan]
        );
    };

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim() || targetPlans.length === 0) {
            toast.error("Please fill all fields and select at least one target audience.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "global_popups"), {
                title,
                message,
                targetPlans,
                type,
                active: true,
                createdAt: serverTimestamp(),
                createdBy: "Admin"
            });
            toast.success("Broadcast Sent Successfully", {
                description: `Message sent to ${targetPlans.length} target groups.`
            });
            // Reset
            setTitle("");
            setMessage("");
            setTargetPlans([]);
        } catch (error: any) {
            console.error("Broadcast failed:", error);
            toast.error("Transmission Failed", {
                description: error.code ? `Error: ${error.code} - Check Console` : "Check your permissions."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 md:p-12 font-sans flex items-center justify-center">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e9c49a]/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-2xl w-full space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-light">Global <span className="text-[#e9c49a] italic">Broadcast</span></h1>
                        <p className="text-white/40 text-sm font-light mt-2">Transmit system-wide messages to the citizen registry.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-[#e9c49a]" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Content Section */}
                    <div className="space-y-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/20 mb-2">
                            <Tag className="w-3 h-3" /> Message Content
                        </div>
                        <Input
                            placeholder="Broadcast Title (e.g. System Update v4.0)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-black/40 border-white/10 text-lg px-6 py-6 rounded-2xl focus:border-[#e9c49a]/30"
                        />
                        <Textarea
                            placeholder="Message Body..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[150px] bg-black/40 border-white/10 px-6 py-4 rounded-2xl focus:border-[#e9c49a]/30 resize-none"
                        />
                    </div>

                    {/* Targeting Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/20">
                                <Users className="w-3 h-3" /> Target Audience
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['free', 'pro', 'elite', 'upgrade_candidate'].map((plan) => (
                                    <button
                                        key={plan}
                                        onClick={() => handleTogglePlan(plan)}
                                        className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all text-left ${targetPlans.includes(plan)
                                            ? "bg-[#e9c49a]/10 border-[#e9c49a] text-[#e9c49a]"
                                            : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"
                                            }`}
                                    >
                                        {plan === 'upgrade_candidate' ? 'Upgrade Needs' : plan}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/20">
                                <ShieldCheck className="w-3 h-3" /> Message Type
                            </div>
                            <div className="space-y-2">
                                {[
                                    { id: 'update', label: 'System Update', icon: Globe },
                                    { id: 'discount', label: 'Offer / Discount', icon: Star },
                                    { id: 'alert', label: 'Critical Alert', icon: Bell },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${type === t.id
                                            ? "bg-white/10 border-white/20 text-white"
                                            : "bg-transparent border-transparent text-white/40 hover:bg-white/5"
                                            }`}
                                    >
                                        <t.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleBroadcast}
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-[2rem] bg-[#e9c49a] text-black font-bold uppercase tracking-[0.2em] hover:bg-white transition-all text-sm shadow-[0_0_40px_rgba(233,196,154,0.1)]"
                    >
                        {isSubmitting ? "Transmitting..." : "Initiate Broadcast"} <Send className="w-4 h-4 ml-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
