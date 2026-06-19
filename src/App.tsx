import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";
import { Wind } from "lucide-react";

// Eagerly load the landing page (the most common entry point); lazy-load the
// rest so the heavy PDF/charting libraries are split into per-route chunks
// instead of bloating the initial bundle.
import Index from "./pages/Index";

const Calculator = lazy(() => import("./pages/Calculator"));
const FastenerCalculator = lazy(() => import("./pages/FastenerCalculator"));
const StrapCalculator = lazy(() => import("./pages/StrapCalculator"));
const TileCalculator = lazy(() => import("./pages/TileCalculator"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const SampleReports = lazy(() => import("./pages/SampleReports"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PECredentials = lazy(() => import("./pages/PECredentials"));
const VerifyReport = lazy(() => import("./pages/VerifyReport"));
const FirmDashboard = lazy(() => import("./pages/FirmDashboard"));
const CreateFirm = lazy(() => import("./pages/CreateFirm"));
const MiamiDade = lazy(() => import("./pages/landing/MiamiDade"));
const Broward = lazy(() => import("./pages/landing/Broward"));
const PalmBeach = lazy(() => import("./pages/landing/PalmBeach"));
const Southwest = lazy(() => import("./pages/landing/Southwest"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Wind className="h-8 w-8 text-primary animate-pulse" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
