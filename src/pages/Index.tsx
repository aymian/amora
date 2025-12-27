import { MoodProvider } from "@/contexts/MoodContext";
import { AtmosphericBackground } from "@/components/three/AtmosphericBackground";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { MoodSection } from "@/components/sections/MoodSection";
import { StoriesSection } from "@/components/sections/StoriesSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
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
