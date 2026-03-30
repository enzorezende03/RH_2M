import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  HandshakeIcon,
  Target,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  ClipboardList,
  Shield,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Colaboradores", url: "/colaboradores", icon: Users },
  { title: "Admissão", url: "/admissao", icon: UserPlus },
];

const gestaoItems = [
  { title: "Feedbacks", url: "/feedbacks", icon: MessageSquare },
  { title: "Reuniões 1:1", url: "/reunioes", icon: HandshakeIcon },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Avaliações", url: "/avaliacoes", icon: ClipboardCheck },
  { title: "PDI", url: "/pdi", icon: TrendingUp },
  { title: "Treinamentos", url: "/treinamentos", icon: GraduationCap },
];

const insightsItems = [
  { title: "Pesquisas", url: "/pesquisas", icon: ClipboardList },
  { title: "Ouvidoria", url: "/ouvidoria", icon: Shield },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const configItems = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            <Building2 className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-primary">Grupo 2M</span>
              <span className="text-xs text-sidebar-foreground">Gestão de Pessoas</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarNavGroup label="Principal" items={mainItems} collapsed={collapsed} />
        <SidebarNavGroup label="Gestão" items={gestaoItems} collapsed={collapsed} />
        <SidebarNavGroup label="Insights" items={insightsItems} collapsed={collapsed} />
        <SidebarNavGroup label="Sistema" items={configItems} collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-foreground">Logado como</p>
            <p className="text-sm font-medium text-sidebar-primary">Admin RH</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarNavGroup({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
  collapsed: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="mr-3 h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
