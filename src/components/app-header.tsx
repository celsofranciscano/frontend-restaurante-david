import AppUser from "./app-user"
import { SidebarTrigger } from "./ui/sidebar"
import { useLocation } from "react-router-dom"
import { Separator } from "./ui/separator"
// import { Button } from "./ui/button"
// import { Sun, Moon } from "lucide-react"
// import { useTheme } from "./theme-provider"

const routeTitles: Record<string, string> = {
  "/dashboard": "Panel de Control",
  "/dashboard/usuarios": "Gestión de Usuarios",
  "/dashboard/productos": "Gestión de Productos",
  "/dashboard/ingredientes": "Gestión de Ingredientes",
  "/dashboard/platos": "Platos y Recetas",
  "/dashboard/mesas": "Gestión de Mesas",
  "/dashboard/ordenes": "Órdenes",
  "/dashboard/configuracion": "Configuración",
}

export default function AppHeader() {
  const location = useLocation()
  const title = routeTitles[location.pathname] || "Dashboard"
  // const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button> */}
        <AppUser />
      </div>
    </header>
  )
}

