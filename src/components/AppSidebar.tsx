import {
  LayoutDashboard,
  Users,
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
  Briefcase,
  DollarSign,
  UserMinus,
  CalendarDays,
  FileText,
  UserSearch,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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

const pessoasSubItems = [
  { title: "Colaboradores", url: "/colaboradores", icon: Users },
  { title: "Cargos e Salários", url: "/cargos-salarios", icon: DollarSign },
  { title: "Desligamentos", url: "/desligamentos", icon: UserMinus },
  { title: "Férias e Solicitações", url: "/ferias-solicitacoes", icon: CalendarDays },
  { title: "Relatórios", url: "/pessoas-relatorios", icon: FileText },
  { title: "Recrutamento e Seleção", url: "/recrutamento-selecao", icon: UserSearch },
];

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

const gestaoItems = [
  { title: "Feedbacks", url: "/feedbacks", icon: MessageSquare },
  { title: "Reuniões 1:1", url: "/reunioes", icon: HandshakeIcon },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Avaliações", url: "/avaliacoes", icon: ClipboardCheck },
  { title: "Treinamentos", url: "/treinamentos", icon: GraduationCap },
];

const pdiSubItems = [
  { title: "Gestão PDI", url: "/pdi" },
  { title: "Meu PDI", url: "/meu-pdi" },
];

const pesquisasSubItems = [
  { title: "Pesquisa de Satisfação", url: "/pesquisas/satisfacao" },
  { title: "Pesquisa Rápida", url: "/pesquisas/rapida" },
  { title: "Super Pesquisa", url: "/pesquisas/super" },
  { title: "Pesquisa de Engajamento", url: "/pesquisas/engajamento" },
  { title: "Pesquisa de Desligamento", url: "/pesquisas/desligamento" },
  { title: "Planos de Ação", url: "/pesquisas/planos-acao" },
];

const insightsItems = [
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
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-3 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <PessoasMenuItem collapsed={collapsed} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {gestaoItems.map((item) => (
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
              <HoverSubMenuItem
                collapsed={collapsed}
                label="PDI"
                icon={TrendingUp}
                subItems={pdiSubItems}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
            Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <HoverSubMenuItem
                collapsed={collapsed}
                label="Pesquisas"
                icon={ClipboardList}
                subItems={pesquisasSubItems}
              />
              {insightsItems.map((item) => (
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

function HoverSubMenuItem({
  collapsed,
  label,
  icon: Icon,
  subItems,
}: {
  collapsed: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems: { title: string; url: string; icon?: React.ComponentType<{ className?: string }> }[];
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = subItems.some((item) => location.pathname.startsWith(item.url));

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopupStyle({
        position: "fixed",
        top: rect.top,
        left: rect.right + 4,
        zIndex: 9999,
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <SidebarMenuItem>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarMenuButton
          className={`rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full cursor-pointer ${
            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
          }`}
        >
          <Icon className="mr-3 h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">{label}</span>
              <ChevronRight className="h-3 w-3 ml-auto text-sidebar-foreground/50" />
            </>
          )}
        </SidebarMenuButton>

        {open && createPortal(
          <div
            style={popupStyle}
            className="w-64 rounded-lg border bg-popover p-1.5 shadow-lg"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {subItems.map((sub) => {
              const active = location.pathname.startsWith(sub.url);
              return (
                <button
                  key={sub.title}
                  onClick={() => {
                    navigate(sub.url);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    active ? "bg-accent text-accent-foreground font-medium" : "text-popover-foreground"
                  }`}
                >
                  {sub.icon && <sub.icon className="h-4 w-4 shrink-0" />}
                  <span>{sub.title}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
      </div>
    </SidebarMenuItem>
  );
}

function PessoasMenuItem({ collapsed }: { collapsed: boolean }) {
  return (
    <HoverSubMenuItem
      collapsed={collapsed}
      label="Pessoas"
      icon={Briefcase}
      subItems={pessoasSubItems}
    />
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