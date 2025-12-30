import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { MoodProvider } from "@/contexts/MoodContext";
import { AtmosphericBackground } from "@/components/three/AtmosphericBackground";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { MoodSection } from "@/components/sections/MoodSection";
import { StoriesSection } from "@/components/sections/StoriesSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8">
        <div className="w-20 h-20 border-[3px] border-[#e9c49a]/5 border-t-[#e9c49a] rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#e9c49a] font-bold animate-pulse">Initializing Identity Resonance</p>
      </div>
    );
  }

  return (
    <MoodProvider>
      <div className="min-h-screen bg-background relative">
        <AtmosphericBackground />
        <Navbar />
        <main className="relative z-10">
          <HeroSection />
          <StoriesSection />
          <MoodSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </MoodProvider>
  );
};

export default Index;
