import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, BellOff, User, Network, Megaphone, ShieldCheck, FileEdit, Receipt, Briefcase, CalendarDays, CalendarRange, LogOut } from "lucide-react";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

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
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-96 p-0">
                  <div className="border-b px-4 py-3">
                    <h3 className="text-base font-semibold">Notificações</h3>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Nenhuma notificação
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Suas notificações aparecerão aqui
                    </p>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        RH
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem className="gap-3">
                    <User className="h-4 w-4" /> Meu perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3">
                    <Network className="h-4 w-4" /> Organograma
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/comunicados")}>
                    <Megaphone className="h-4 w-4" /> Comunicados
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3">
                    <ShieldCheck className="h-4 w-4" /> Política de Privacidade
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Cadastro</DropdownMenuLabel>
                  <DropdownMenuItem className="gap-3">
                    <FileEdit className="h-4 w-4" /> Atualização de cadastro
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Minha Área</DropdownMenuLabel>
                  <DropdownMenuItem className="gap-3" onClick={() => navigate("/holerites")}>
                    <Receipt className="h-4 w-4" /> Meus holerites
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3">
                    <Briefcase className="h-4 w-4" /> Minha carreira
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Recesso</DropdownMenuLabel>
                  <DropdownMenuItem className="gap-3">
                    <CalendarDays className="h-4 w-4" /> Meu recesso
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3">
                    <CalendarRange className="h-4 w-4" /> Calendário de Férias e Recesso
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-3 text-destructive focus:text-destructive">
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
