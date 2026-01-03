import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    Settings as SettingsIcon,
    Bell,
    Shield,
    Zap,
    Smartphone,
    Check,
    AlertCircle,
    User
} from "lucide-react";
import { useLiteMode } from "@/contexts/LiteModeContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Settings() {
    const { user: userData } = useOutletContext<{ user: any }>();
    const navigate = useNavigate();
    const { isLiteMode, isDataSaver, setLiteMode, setDataSaver } = useLiteMode();
    const [pushEnabled, setPushEnabled] = useState(Notification.permission === "granted");

    const togglePush = async () => {
        if (Notification.permission === "default") {
            const permission = await Notification.requestPermission();
            setPushEnabled(permission === "granted");
            if (permission === "granted") {
                toast.success("Notifications Enabled", {
                    description: "You will now receive directorial updates."
                });
            }
        } else if (Notification.permission === "denied") {
            toast.error("Permission Blocked", {
                description: "Please enable notifications in your browser settings."
            });
        } else {
            setPushEnabled(!pushEnabled);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-10">
            <header className="space-y-2">
                <div className="flex items-center gap-3 text-[#e9c49a]">
                    <SettingsIcon className="w-6 h-6" />
                    <h1 className="text-3xl font-display font-light text-white uppercase tracking-wider">System Config</h1>
                </div>
                <p className="text-white/40 text-sm font-light uppercase tracking-widest">Adjust your directorial immersion parameters.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Settings */}
                <section className="space-y-6">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold border-b border-white/5 pb-4">Immersion & Performance</h2>

                    <div className="space-y-4">
                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-[#e9c49a]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Lite Mode</p>
                                        <p className="text-[10px] text-white/20">Optimizes for battery and slow CPUs.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setLiteMode(!isLiteMode)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative",
                                        isLiteMode ? "bg-[#e9c49a]" : "bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                        isLiteMode ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Smartphone className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Data Saver</p>
                                        <p className="text-[10px] text-white/20">Compresses high-res 4K artifacts.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDataSaver(!isDataSaver)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative",
                                        isDataSaver ? "bg-blue-500" : "bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                        isDataSaver ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notification Settings */}
                <section className="space-y-6">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold border-b border-white/5 pb-4">Communication Protocol</h2>

                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-[#e9c49a]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Resonance Alerts</p>
                                    <p className="text-[10px] text-white/20">Browser-level push notifications.</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <button
                                    onClick={togglePush}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative",
                                        pushEnabled ? "bg-[#e9c49a]" : "bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                        pushEnabled ? "left-7" : "left-1"
                                    )} />
                                </button>
                                <button
                                    onClick={() => {
                                        new Notification("Resonance Test", { body: "Your synchronization link is active." });
                                        toast.success("Test Signal Sent");
                                    }}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-widest text-[#e9c49a] hover:bg-[#e9c49a]/10 transition-all font-display"
                                >
                                    Test Signal
                                </button>
                            </div>
                        </div>

                        {Notification.permission === 'denied' && (
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                <p className="text-[10px] text-red-200/60 leading-relaxed font-light">
                                    Our system signals are currently blocked by your browser. Enable notifications in your site settings to restore resonance.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Account Protocol */}
                <section className="space-y-6">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold border-b border-white/5 pb-4">Auth Frequency</h2>
                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 rounded-xl">
                                <AvatarImage src={userData?.photoURL} />
                                <AvatarFallback className="bg-white/5">{userData?.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-bold text-white">{userData?.fullName}</p>
                                <p className="text-[9px] text-[#e9c49a] uppercase font-bold tracking-widest">{userData?.plan} Protocol Active</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/profile')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-widest hover:bg-white/10 transition-all text-white/40 hover:text-white">Edit Essence</button>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold border-b border-white/5 pb-4">Security Protocol</h2>
                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between opacity-40">
                            <div className="flex items-center gap-4">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-sm font-bold text-white">E2E Encryption</p>
                                    <p className="text-[10px] text-white/20">Archived sync is always secure.</p>
                                </div>
                            </div>
                            <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
