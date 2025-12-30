import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VideoPlayer from "./pages/VideoPlayer";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminNexus from "./pages/admin/AdminNexus";
import MediaUpload from "./pages/admin/MediaUpload";
import Contents from "./pages/admin/Contents";
import ImageUpload from "./pages/admin/ImageUpload";
import Gallery from "./pages/Gallery";
import ShortVideos from "./pages/ShortVideos";
import Watch from "./pages/Watch";
import Upgrade from "./pages/Upgrade";
import Payment from "./pages/Payment";
import UserProfile from "./pages/UserProfile";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import CreateShort from "./pages/admin/CreateShort";
import MoodsUpload from "./pages/admin/MoodsUpload";
import HappyUpload from "./pages/admin/HappyUpload";
import Moods from "./pages/Moods";
import MoodsWatch from "./pages/MoodsWatch";
import AIGuide from "./pages/AIGuide";
import EmotionAI from "./pages/EmotionAI";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Happy from "./pages/Happy";
import Sad from "./pages/Sad";
import NotFound from "./pages/NotFound";
import WorkerLogin from "./pages/workers/WorkerLogin";
import WorkerSignup from "./pages/workers/WorkerSignup";
import RoleSelection from "./pages/workers/RoleSelection";
import WorkerDashboard from "./pages/workers/WorkerDashboard";
import WorkersControlCenter from "./pages/admin/workers/WorkersControlCenter";
import WorkerProfile from "./pages/admin/workers/WorkerProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/video-player" element={<VideoPlayer />} />
          <Route path="/manager" element={<AdminLogin />} />
          <Route path="/manager/nexus" element={<AdminNexus />} />
          <Route path="/admin/nexus/workers" element={<WorkersControlCenter />} />
          <Route path="/admin/nexus/workers/:id" element={<WorkerProfile />} />
          <Route path="/manager/upload" element={<MediaUpload />} />
          <Route path="/manager/contents" element={<Contents />} />
          <Route path="/manager/image-upload" element={<ImageUpload />} />
          <Route path="/images" element={<Gallery />} />
          <Route path="/short-videos" element={<ShortVideos />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/user-profile/:userId" element={<UserProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/create-short" element={<CreateShort />} />
          <Route path="/moods-uploads" element={<MoodsUpload />} />
          <Route path="/happy-upload" element={<HappyUpload />} />
          <Route path="/moods" element={<Moods />} />
          <Route path="/moods-watch/:id" element={<MoodsWatch />} />
          <Route path="/ai" element={<AIGuide />} />
          <Route path="/emotion-ai" element={<EmotionAI />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/happy" element={<Happy />} />
          <Route path="/sad" element={<Sad />} />

          {/* Worker System Routes */}
          <Route path="/workers/login" element={<WorkerLogin />} />
          <Route path="/workers/signup" element={<WorkerSignup />} />
          <Route path="/workers/select-role" element={<RoleSelection />} />
          <Route path="/workers/dashboard" element={<WorkerDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
