import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import ColaboradorPerfil from "./pages/ColaboradorPerfil";
import Feedbacks from "./pages/Feedbacks";
import Reunioes from "./pages/Reunioes";
import Metas from "./pages/Metas";
import ModulePlaceholder from "./pages/ModulePlaceholder";
import Ouvidoria from "./pages/Ouvidoria";
import Comunicados from "./pages/Comunicados";
import NotFound from "./pages/NotFound";
import {
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  ClipboardList,
  Shield,
  BarChart3,
  Settings,
} from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/colaboradores/:id" element={<ColaboradorPerfil />} />
            <Route path="/admissao" element={<ModulePlaceholder title="Admissão" description="Fluxo de admissão de novos colaboradores" icon={UserPlus} />} />
            <Route path="/feedbacks" element={<Feedbacks />} />
            <Route path="/reunioes" element={<Reunioes />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/avaliacoes" element={<ModulePlaceholder title="Avaliações" description="Avaliações de desempenho 90°, 180° e 360°" icon={ClipboardCheck} />} />
            <Route path="/pdi" element={<ModulePlaceholder title="PDI" description="Plano de Desenvolvimento Individual" icon={TrendingUp} />} />
            <Route path="/treinamentos" element={<ModulePlaceholder title="Treinamentos" description="Registro e acompanhamento de treinamentos" icon={GraduationCap} />} />
            <Route path="/pesquisas" element={<ModulePlaceholder title="Pesquisas" description="Pesquisas internas e pulse surveys" icon={ClipboardList} />} />
            <Route path="/comunicados" element={<Comunicados />} />
            <Route path="/ouvidoria" element={<Ouvidoria />} />
            <Route path="/relatorios" element={<ModulePlaceholder title="Relatórios" description="Relatórios e People Analytics" icon={BarChart3} />} />
            <Route path="/configuracoes" element={<ModulePlaceholder title="Configurações" description="Configurações do sistema" icon={Settings} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
