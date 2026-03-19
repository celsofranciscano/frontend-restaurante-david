import {
  LayoutDashboard,
  Package,
  Soup,
  Utensils,
  ChevronRight,
  Building2,
  Users,
  LogOut,
  DollarSign,
  Receipt,
  ChefHat,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { Button } from "./ui/button"

type Rol = 'admin' | 'cajero' | 'mesero' | 'cocinero' | 'gerente';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Rol[];
}

const navigationItems: NavItem[] = [
  {
    title: "Panel de Control",
    url: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ['admin', 'gerente', 'cajero'],
  },
  {
    title: "Caja",
    url: "/caja",
    icon: DollarSign,
    allowedRoles: ['admin', 'gerente', 'cajero'],
  },
  {
    title: "Usuarios",
    url: "/dashboard/usuarios",
    icon: Users,
    allowedRoles: ['admin'],
  },
  {
    title: "Productos",
    url: "/dashboard/productos",
    icon: Package,
    allowedRoles: ['admin', 'gerente'],
  },
  {
    title: "Ingredientes",
    url: "/dashboard/ingredientes",
    icon: Soup,
    allowedRoles: ['admin', 'gerente'],
  },
  {
    title: "Platos o Recetas",
    url: "/dashboard/platos",
    icon: Utensils,
    allowedRoles: ['admin', 'gerente'],
  },
  {
    title: "Ventas",
    url: "/dashboard/ventas",
    icon: Receipt,
    allowedRoles: ['admin', 'gerente', 'cajero'],
  },
  {
    title: "Monitor de Cocina",
    url: "/dashboard/cocina",
    icon: ChefHat,
    allowedRoles: ['admin', 'gerente', 'cocinero'],
  },
  {
    title: "Historial de Ventas",
    url: "/ventas/historial",
    icon: Receipt,
    allowedRoles: ['admin', 'gerente', 'cajero'],
  },
]

const rolLabels: Record<Rol, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  cajero: 'Cajero',
  mesero: 'Mesero',
  cocinero: 'Cocinero',
};

const rolColors: Record<Rol, string> = {
  admin: 'bg-destructive/10 text-destructive',
  gerente: 'bg-primary/10 text-primary',
  cajero: 'bg-info/10 text-info',
  mesero: 'bg-warning/10 text-warning',
  cocinero: 'bg-secondary text-secondary-foreground',
};

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { logout, usuario } = useAuth()
  const currentYear = new Date().getFullYear()

  const userRole = (usuario?.rol?.toLowerCase() as Rol) || 'mesero';

  const visibleItems = navigationItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-11 rounded-xl bg-primary/10 border border-primary/20">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground tracking-tight">
              Restaurante V2
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Sistema de Gestión
            </span>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url))
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-10 px-3 rounded-lg transition-all duration-200 hover:bg-accent",
                        isActive && "bg-accent"
                      )}
                    >
                      <Link
                        to={item.url}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex items-center justify-center size-8 rounded-lg transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted group-hover:bg-accent"
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-4",
                                isActive && "text-primary-foreground"
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "font-medium text-sm",
                              isActive && "font-semibold"
                            )}
                          >
                            {item.title}
                          </span>
                        </div>
                        <ChevronRight
                          className={cn(
                            "size-3.5 text-muted-foreground transition-all opacity-0 -translate-x-1",
                            isActive && "opacity-100 text-primary",
                            "group-hover:opacity-100 group-hover:translate-x-0"
                          )}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 text-sm font-medium hover:bg-destructive/10 hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="size-4 mr-3" />
                  Cerrar Sesión
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-4 space-y-3">
          <div className="px-3 py-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Usuario
              </span>
              <Badge
                variant="secondary"
                className={cn("text-xs font-semibold h-5 px-1.5", rolColors[userRole] || 'bg-muted')}
              >
                {rolLabels[userRole] || usuario?.rol || 'Sin rol'}
              </Badge>
            </div>
            <div className="text-[11px] text-foreground font-medium truncate">
              {usuario?.nombre || 'Sin nombre'}
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Versión
              </span>
              <Badge
                variant="outline"
                className="text-xs font-semibold h-5 px-1.5"
              >
                v2.0.0
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              © {currentYear} Restaurante V2
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
