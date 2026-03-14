import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import FastenerCalculator from "./pages/FastenerCalculator";
import StrapCalculator from "./pages/StrapCalculator";
import TileCalculator from "./pages/TileCalculator";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SampleReports from "./pages/SampleReports";
import PaymentSuccess from "./pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import PECredentials from "./pages/PECredentials";
import VerifyReport from "./pages/VerifyReport";
import FirmDashboard from "./pages/FirmDashboard";
import CreateFirm from "./pages/CreateFirm";
import MiamiDade from "./pages/landing/MiamiDade";
import Broward from "./pages/landing/Broward";
import PalmBeach from "./pages/landing/PalmBeach";
import Southwest from "./pages/landing/Southwest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/fastener" element={<FastenerCalculator />} />
            <Route path="/strap" element={<StrapCalculator />} />
            <Route path="/tile" element={<TileCalculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pe-credentials" element={<PECredentials />} />
            <Route path="/sample-reports" element={<SampleReports />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/verify/:reportId" element={<VerifyReport />} />
            <Route path="/firm" element={<FirmDashboard />} />
            <Route path="/create-firm" element={<CreateFirm />} />
            <Route path="/miami-dade" element={<MiamiDade />} />
            <Route path="/broward" element={<Broward />} />
            <Route path="/palm-beach" element={<PalmBeach />} />
            <Route path="/southwest-florida" element={<Southwest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
