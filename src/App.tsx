import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
import Transactions from "./pages/Transactions";
import CreateShort from "./pages/admin/CreateShort";
import MoodsUpload from "./pages/admin/MoodsUpload";
import HappyUpload from "./pages/admin/HappyUpload";
import MoodsWatch from "./pages/MoodsWatch";
import AIGuide from "./pages/AIGuide";
import EmotionAI from "./pages/EmotionAI";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Happy from "./pages/Happy";
import Sad from "./pages/Sad";
import Updates from "./pages/Updates";
import Help from "./pages/Help";
import AdminHelps from "./pages/admin/AdminHelps";
import NotFound from "./pages/NotFound";
import Terms from "./pages/terms";
import PrivacyPolicy from "./pages/privacy-policy";
import WorkerLogin from "./pages/workers/WorkerLogin";
import WorkerSignup from "./pages/workers/WorkerSignup";
import RoleSelection from "./pages/workers/RoleSelection";
import WorkerDashboard from "./pages/workers/WorkerDashboard";
import PaymentVerification from "./pages/workers/PaymentVerification";
import PaymentApproval from "./pages/workers/PaymentApproval";
import PaymentRejection from "./pages/workers/PaymentRejection";
import MoodContentUploader from "./pages/workers/MoodContentUploader";
import ShortUpload from './pages/workers/ShortUpload';
import WorkersControlCenter from "./pages/admin/workers/WorkersControlCenter";
import WorkerProfile from "./pages/admin/workers/WorkerProfile";
import DashboardLayout from "./components/layout/DashboardLayout";

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
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Dashboard Shell - Persistent Layout */}
          <Route element={<DashboardLayout user={null} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/images" element={<Gallery />} />
            <Route path="/short-videos" element={<ShortVideos />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/user-profile/:userId" element={<UserProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/create-short" element={<CreateShort />} />
            <Route path="/moods-uploads" element={<MoodsUpload />} />
            <Route path="/happy-upload" element={<HappyUpload />} />
            <Route path="/moods-watch/:id" element={<MoodsWatch />} />
            <Route path="/ai" element={<AIGuide />} />
            <Route path="/emotion-ai" element={<EmotionAI />} />
            <Route path="/happy" element={<Happy />} />
            <Route path="/sad" element={<Sad />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/help" element={<Help />} />
          </Route>

          <Route path="/video-player" element={<VideoPlayer />} />
          <Route path="/manager" element={<AdminLogin />} />
          <Route path="/manager/nexus" element={<AdminNexus />} />
          <Route path="/admin/nexus/workers" element={<WorkersControlCenter />} />
          <Route path="/admin/nexus/workers/:id" element={<WorkerProfile />} />
          <Route path="/manager/upload" element={<MediaUpload />} />
          <Route path="/manager/contents" element={<Contents />} />
          <Route path="/manager/image-upload" element={<ImageUpload />} />
          <Route path="/manager/helps" element={<AdminHelps />} />

          {/* Worker System Routes */}
          <Route path="/workers/login" element={<WorkerLogin />} />
          <Route path="/workers/signup" element={<WorkerSignup />} />
          <Route path="/workers/select-role" element={<RoleSelection />} />
          <Route path="/workers/dashboard" element={<WorkerDashboard />} />
          <Route path="/workers/payment-verification" element={<PaymentVerification />} />
          <Route path="/workers/payment-approval" element={<PaymentApproval />} />
          <Route path="/workers/payment-rejection" element={<PaymentRejection />} />
          <Route path="/workers/mood-upload" element={<MoodContentUploader />} />
          <Route path="/workers/upload-short" element={<ShortUpload />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
