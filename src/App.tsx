import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Funnels from "./pages/Funnels";
import Triggers from "./pages/Triggers";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Backups from "./pages/Backups";
import FlowBuilder from "./pages/FlowBuilder";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/funnels" element={<ProtectedRoute><MainLayout><Funnels /></MainLayout></ProtectedRoute>} />
            <Route path="/triggers" element={<ProtectedRoute><MainLayout><Triggers /></MainLayout></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><MainLayout><Stats /></MainLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
            <Route path="/backups" element={<ProtectedRoute><MainLayout><Backups /></MainLayout></ProtectedRoute>} />
            <Route path="/flow-builder" element={<ProtectedRoute><FlowBuilder /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
