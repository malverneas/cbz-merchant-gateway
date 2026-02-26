import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationDetail from "./pages/ApplicationDetail";
import MerchantApplications from "./pages/MerchantApplications";
import OnboardingReview from "./pages/OnboardingReview";
import ComplianceReview from "./pages/ComplianceReview";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminAllApplications from "./pages/AdminAllApplications";
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply" element={<ApplicationForm />} />
            <Route path="/apply/:id" element={<ApplicationForm />} />
            <Route path="/applications" element={<MerchantApplications />} />
            <Route path="/application/:id" element={<ApplicationDetail />} />
            <Route path="/onboarding/review" element={<OnboardingReview />} />
            <Route path="/compliance/review" element={<ComplianceReview />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/applications" element={<AdminAllApplications />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
