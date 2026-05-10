import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, BellOff, User, Network, Megaphone, FileEdit, Receipt, Briefcase, CalendarDays, CalendarRange, LogOut, CheckCheck, Plus, RefreshCw, Trash2, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificacoes } from "@/stores/notificacoesStore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";

const tipoIcon = {
  criacao: Plus,
  atualizacao: RefreshCw,
  exclusao: Trash2,
  info: Info,
};

const tipoCor = {
  criacao: "text-green-500",
  atualizacao: "text-blue-500",
  exclusao: "text-destructive",
  info: "text-muted-foreground",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } = useNotificacoes();
  const { nome: userNome, iniciais: userIniciais, email: userEmail } = useCurrentColaborador();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar colaborador, feedback..."
                  className="w-72 pl-9 h-9 bg-muted border-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {naoLidas > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {naoLidas > 9 ? "9+" : naoLidas}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-96 p-0">
                  <div className="border-b px-4 py-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold">Notificações</h3>
                    {naoLidas > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={marcarTodasComoLidas}>
                        <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como lidas
                      </Button>
                    )}
                  </div>
                  {notificacoes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Nenhuma notificação
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Suas notificações aparecerão aqui
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-80">
                      <div className="divide-y">
                        {notificacoes.map((n) => {
                          const Icon = tipoIcon[n.tipo];
                          return (
                            <button
                              key={n.id}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${!n.lida ? "bg-primary/5" : ""}`}
                              onClick={() => marcarComoLida(n.id)}
                            >
                              <div className={`mt-0.5 ${tipoCor[n.tipo]}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.lida ? "font-semibold" : "font-medium"} text-foreground truncate`}>
                                  {n.titulo}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.descricao}</p>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {formatDistanceToNow(n.criadaEm, { addSuffix: true, locale: ptBR })}
                                </p>
                              </div>
                              {!n.lida && (
                                <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {userIniciais}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/meu-perfil")}>
                    <User className="h-4 w-4" /> Meu perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/organograma")}>
                    <Network className="h-4 w-4" /> Organograma
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/comunicados")}>
                    <Megaphone className="h-4 w-4" /> Comunicados
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Cadastro</DropdownMenuLabel>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/atualizacao-cadastro")}>
                    <FileEdit className="h-4 w-4" /> Atualização de cadastro
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Minha Área</DropdownMenuLabel>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/holerites")}>
                    <Receipt className="h-4 w-4" /> Meus holerites
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/minha-carreira")}>
                    <Briefcase className="h-4 w-4" /> Minha carreira
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Recesso</DropdownMenuLabel>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/meu-recesso")}>
                    <CalendarDays className="h-4 w-4" /> Meu recesso
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/ferias-solicitacoes")}>
                    <CalendarRange className="h-4 w-4" /> Calendário de Férias e Recesso
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-3 text-destructive focus:text-destructive" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <ScrollArea className="flex-1">
            <main className="p-6 animate-fade-in">
              {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
