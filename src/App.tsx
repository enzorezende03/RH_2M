import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificacoesProvider } from "@/stores/notificacoesStore";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import RedefinirSenha from "./pages/RedefinirSenha";
import { CargosProvider } from "@/stores/cargosStore";
import { ColaboradoresProvider } from "@/stores/colaboradoresStore";
import { CelebracoesProvider } from "@/stores/celebracoesStore";
import { HumorProvider } from "@/stores/humorStore";
import { RelatoriosPersonalizadosProvider } from "@/stores/relatoriosPersonalizadosStore";
import { LembretesProvider } from "@/stores/lembretesStore";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import ColaboradorPerfil from "./pages/ColaboradorPerfil";
import Feedbacks from "./pages/Feedbacks";
import Reunioes from "./pages/Reunioes";
import Metas from "./pages/Metas";
import Desligamentos from "./pages/Desligamentos";
import CargosESalarios from "./pages/CargosESalarios";
import Pesquisas from "./pages/Pesquisas";
import Ouvidoria from "./pages/Ouvidoria";
import Comunicados from "./pages/Comunicados";
import CriarComunicado from "./pages/CriarComunicado";
import FeriasSolicitacoes from "./pages/FeriasSolicitacoes";
import Holerites from "./pages/Holerites";
import MinhaCarreira from "./pages/MinhaCarreira";
import MeuPerfil from "./pages/MeuPerfil";
import EditarPerfil from "./pages/EditarPerfil";
import Organograma from "./pages/Organograma";
import AtualizacaoCadastro from "./pages/AtualizacaoCadastro";
import MeuRecesso from "./pages/MeuRecesso";
import Relatorios from "./pages/Relatorios";
import CriarRelatorioPersonalizado from "./pages/CriarRelatorioPersonalizado";
import PesquisaSatisfacao from "./pages/PesquisaSatisfacao";
import PesquisaRapida from "./pages/PesquisaRapida";
import SuperPesquisa from "./pages/SuperPesquisa";
import PesquisaEngajamento from "./pages/PesquisaEngajamento";
import PesquisaDesligamento from "./pages/PesquisaDesligamento";
import PlanosAcao from "./pages/PlanosAcao";
import Avaliacoes from "./pages/Avaliacoes";
import PDI from "./pages/PDI";
import MeuPDI from "./pages/MeuPDI";
import Treinamentos from "./pages/Treinamentos";
import RecrutamentoSelecao from "./pages/RecrutamentoSelecao";
import AdmissaoPublica from "./pages/AdmissaoPublica";
import Celebracoes from "./pages/Celebracoes";
import HoleritesRH from "./pages/HoleritesRH";
import FeriasRecessoRH from "./pages/FeriasRecessoRH";
import ControleVisualizacaoSaldos from "./pages/ControleVisualizacaoSaldos";
import GestaoSaldosPeriodos from "./pages/GestaoSaldosPeriodos";
import FeriasColetivas from "./pages/FeriasColetivas";
import AssinaturaDigital from "./pages/AssinaturaDigital";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <NotificacoesProvider>
          <LembretesProvider>
          <CargosProvider>
            <ColaboradoresProvider>
              <CelebracoesProvider>
              <HumorProvider>
              <RelatoriosPersonalizadosProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                  <Route path="/admissao/:token" element={<AdmissaoPublica />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/colaboradores" element={<Colaboradores />} />
                          <Route path="/colaboradores/:id" element={<ColaboradorPerfil />} />
                          <Route path="/cargos-salarios" element={<CargosESalarios />} />
                          <Route path="/desligamentos" element={<Desligamentos />} />
                          <Route path="/ferias-solicitacoes" element={<FeriasSolicitacoes />} />
                          <Route path="/pessoas-relatorios" element={<Relatorios />} />
                          <Route path="/recrutamento-selecao" element={<RecrutamentoSelecao />} />
                          <Route path="/feedbacks" element={<Feedbacks />} />
                          <Route path="/reunioes" element={<Reunioes />} />
                          <Route path="/metas" element={<Metas />} />
                          <Route path="/avaliacoes" element={<Avaliacoes />} />
                          <Route path="/pdi" element={<PDI />} />
                          <Route path="/meu-pdi" element={<MeuPDI />} />
                          <Route path="/treinamentos" element={<Treinamentos />} />
                          <Route path="/pesquisas" element={<Pesquisas />} />
                          <Route path="/pesquisas/satisfacao" element={<PesquisaSatisfacao />} />
                          <Route path="/pesquisas/rapida" element={<PesquisaRapida />} />
                          <Route path="/pesquisas/super" element={<SuperPesquisa />} />
                          <Route path="/pesquisas/engajamento" element={<PesquisaEngajamento />} />
                          <Route path="/pesquisas/desligamento" element={<PesquisaDesligamento />} />
                          <Route path="/pesquisas/planos-acao" element={<PlanosAcao />} />
                          <Route path="/comunicados" element={<Comunicados />} />
                          <Route path="/comunicados/criar" element={<CriarComunicado />} />
                          <Route path="/holerites" element={<Holerites />} />
                          <Route path="/minha-carreira" element={<MinhaCarreira />} />
                          <Route path="/meu-perfil" element={<MeuPerfil />} />
                          <Route path="/meu-perfil/editar" element={<EditarPerfil />} />
                          <Route path="/organograma" element={<Organograma />} />
                          <Route path="/atualizacao-cadastro" element={<AtualizacaoCadastro />} />
                          <Route path="/meu-recesso" element={<MeuRecesso />} />
                          <Route path="/ouvidoria" element={<Ouvidoria />} />
                          <Route path="/relatorios" element={<Relatorios />} />
                          <Route path="/relatorios/novo" element={<CriarRelatorioPersonalizado />} />
                          <Route path="/celebracoes" element={<Celebracoes />} />
                          <Route path="/pessoas-holerites" element={<HoleritesRH />} />
                          <Route path="/pessoas-ferias-recesso" element={<FeriasRecessoRH />} />
                          <Route path="/controle-visualizacao-saldos" element={<ControleVisualizacaoSaldos />} />
                          <Route path="/gestao-saldos-periodos/:id" element={<GestaoSaldosPeriodos />} />
                          <Route path="/pessoas-ferias-coletivas" element={<FeriasColetivas />} />
                          <Route path="/pessoas-assinatura-digital" element={<AssinaturaDigital />} />
                          
                          
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </TooltipProvider>
              </RelatoriosPersonalizadosProvider>
              </HumorProvider>
              </CelebracoesProvider>
            </ColaboradoresProvider>
          </CargosProvider>
          </LembretesProvider>
        </NotificacoesProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
