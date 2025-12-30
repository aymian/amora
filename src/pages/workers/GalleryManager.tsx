import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    Eye,
    MoreVertical,
    Search,
    Filter,
    Clock,
    User,
    Shield,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const GalleryManager = () => {
    const [artifacts, setArtifacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedArtifact, setSelectedArtifact] = useState<any>(null);

    const fetchArtifacts = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "gallery_images"),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArtifacts(list);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to index Nexus artifacts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtifacts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Permanently wipe this artifact from the Nexus?")) return;
        try {
            await deleteDoc(doc(db, "gallery_images", id));
            setArtifacts(prev => prev.filter(a => a.id !== id));
            toast.success("Artifact neutralized.");
            setSelectedArtifact(null);
        } catch (error) {
            toast.error("Wipe procedure failed.");
        }
    };

    const filteredArtifacts = artifacts.filter(a =>
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-[#e9c49a] transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan identities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs text-white outline-none focus:border-[#e9c49a]/30 transition-all font-sans"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchArtifacts}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <Clock className="w-4 h-4 text-white/40" />
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                        <Filter className="w-4 h-4" /> Filter Protocol
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredArtifacts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredArtifacts.map((artifact) => (
                        <motion.div
                            key={artifact.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedArtifact(artifact)}
                            className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/5 bg-black cursor-pointer hover:border-[#e9c49a]/30 transition-all"
                        >
                            <img
                                src={artifact.imageUrl}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                                alt={artifact.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-5 left-5 right-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                                <p className="text-[10px] font-bold text-[#e9c49a] uppercase tracking-widest mb-1">{artifact.category}</p>
                                <h4 className="text-sm font-medium text-white truncate">{artifact.title}</h4>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center space-y-4 rounded-[3rem] border border-dashed border-white/5">
                    <AlertCircle className="w-12 h-12 text-white/10" />
                    <p className="text-white/20 text-sm font-light italic">No matching artifacts indexed.</p>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedArtifact && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl bg-[#080808] border border-white/10 rounded-[3rem] overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative"
                        >
                            <button
                                onClick={() => setSelectedArtifact(null)}
                                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all z-10"
                            >
                                <X className="w-5 h-5 text-white/40" />
                            </button>

                            <div className="aspect-[3/4] bg-black">
                                <img src={selectedArtifact.imageUrl} className="w-full h-full object-cover" alt="" />
                            </div>

                            <div className="p-12 flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full bg-[#e9c49a]/10 text-[#e9c49a] text-[8px] font-bold uppercase tracking-widest border border-[#e9c49a]/20">
                                                {selectedArtifact.category}
                                            </span>
                                            {selectedArtifact.is18Plus && (
                                                <span className="px-2 py-0.5 rounded bg-red-500/80 text-white text-[8px] font-bold">18+</span>
                                            )}
                                        </div>
                                        <h2 className="text-4xl font-display font-light text-white">{selectedArtifact.title}</h2>
                                        <p className="text-white/40 text-sm font-light leading-relaxed">{selectedArtifact.caption || "No narrative established for this artifact."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                            <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Resonance Mood</p>
                                            <p className="text-xs text-white/60 font-medium">{selectedArtifact.coreMood}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                            <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Visual Style</p>
                                            <p className="text-xs text-white/60 font-medium">{selectedArtifact.style}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                                <User className="w-4 h-4 text-[#e9c49a]" />
                                            </div>
                                            <div>
                                                <p className="text-[7px] uppercase tracking-widest text-white/20 font-bold">Synchronized By</p>
                                                <p className="text-[10px] text-white/60 truncate max-w-[150px]">{selectedArtifact.uploadedBy}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex gap-4">
                                    <button
                                        onClick={() => handleDelete(selectedArtifact.id)}
                                        className="flex-1 py-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                    >
                                        <Trash2 className="w-4 h-4 inline-block mr-2" />
                                        Neutralize Artifact
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryManager;
