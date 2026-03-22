import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import AlterarSenha from "./pages/AlterarSenha";
import AulaExperimental from "./pages/AulaExperimental";
import Dashboard from "./pages/Dashboard";
import Agendamento from "./pages/Agendamento";
import Avaliacao from "./pages/Avaliacao";
import Perfil from "./pages/Perfil";
import Plano from "./pages/Plano";
import Financeiro from "./pages/Financeiro";
import Pagamento from "./pages/Pagamento";
import FAQ from "./pages/FAQ";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="ctreact-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/alterar-senha" element={<ProtectedRoute><AlterarSenha /></ProtectedRoute>} />
              <Route path="/aula-experimental" element={<AulaExperimental />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/agendamento" element={<ProtectedRoute><Agendamento /></ProtectedRoute>} />
              <Route path="/avaliacao" element={<ProtectedRoute><Avaliacao /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="/plano" element={<ProtectedRoute><Plano /></ProtectedRoute>} />
              <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
              <Route path="/pagamento" element={<ProtectedRoute><Pagamento /></ProtectedRoute>} />
              <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
