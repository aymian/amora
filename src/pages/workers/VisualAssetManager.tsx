import React, { useState } from 'react';
import { Camera, Image as ImageIcon, LayoutGrid, UploadCloud, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import ImageSynchronizer from './ImageSynchronizer';
import GalleryManager from './GalleryManager';

const VisualAssetManager = () => {
    const [subTab, setSubTab] = useState('sync');

    return (
        <div className="space-y-12">
            {/* Header / Tab Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-[#e9c49a]/10 border border-[#e9c49a]/20 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#e9c49a]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-light">
                            Visual <span className="text-[#e9c49a] italic">Asset Manager</span>
                        </h1>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Nexus Optical Synchronization Engine</p>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5">
                    <button
                        onClick={() => setSubTab('sync')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            subTab === 'sync' ? "bg-[#e9c49a] text-black shadow-xl" : "text-white/30 hover:text-white/60"
                        )}
                    >
                        <UploadCloud className="w-4 h-4" /> Sync Artifact
                    </button>
                    <button
                        onClick={() => setSubTab('manage')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            subTab === 'manage' ? "bg-[#e9c49a] text-black shadow-xl" : "text-white/30 hover:text-white/60"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" /> Manage Nexus
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="mt-10">
                {subTab === 'sync' ? (
                    <ImageSynchronizer />
                ) : (
                    <GalleryManager />
                )}
            </div>
        </div>
    );
};

export default VisualAssetManager;
