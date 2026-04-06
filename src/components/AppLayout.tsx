import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, BellOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [notifOpen, setNotifOpen] = useState(false);

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
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  RH
                </AvatarFallback>
              </Avatar>
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
