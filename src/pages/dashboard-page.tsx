import { useAuth } from "@/modules/auth/hooks/useAuth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/layouts/dashboard-layout"
import {
  Users,
  Package,
  Utensils,
  TrendingUp,
  ClipboardList,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDashboardStats } from "@/modules/dashboard/hooks/use-dashboard-stats"

// Mapa de estado de transacción a color de badge
const estadoBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendiente: "secondary",
  abierto: "default",
  cerrado: "outline",
}

export function DashboardPage() {
  const { usuario } = useAuth()
  const { stats, isLoading, refetch } = useDashboardStats()

  const statCards = [
    {
      title: "Usuarios Activos",
      value: stats?.totalUsuarios ?? 0,
      description: "Registrados en el sistema",
      icon: Users,
    },
    {
      title: "Productos",
      value: stats?.totalProductos ?? 0,
      description: "En inventario",
      icon: Package,
    },
    {
      title: "Platos del Menú",
      value: stats?.totalPlatos ?? 0,
      description: "Disponibles hoy",
      icon: Utensils,
    },
    {
      title: "Órdenes Hoy",
      value: stats?.transaccionesHoy ?? 0,
      description: `${stats?.ordenesAbiertas ?? 0} abiertas actualmente`,
      icon: TrendingUp,
    },
    {
      title: "Órdenes Abiertas",
      value: stats?.ordenesAbiertas ?? 0,
      description: "Pendientes o en proceso",
      icon: ClipboardList,
    },
    {
      title: "Ingresos Hoy",
      value: `Bs ${Number(stats?.ingresosHoy ?? 0).toFixed(2)}`,
      description: "De transacciones cerradas",
      icon: DollarSign,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Bienvenida */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Bienvenido, {usuario?.nombre}
            </h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Resumen en tiempo real de tu restaurante.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
            Actualizar
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-24 mb-1" />
                    <Skeleton className="h-3 w-36" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fila inferior */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Usuario</CardTitle>
              <CardDescription>Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-sm text-muted-foreground truncate max-w-[160px]">
                    {usuario?.id}
                  </span>
                </div> */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Nombre:</span>
                  <span className="text-sm text-muted-foreground">
                    {usuario?.nombre}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Usuario:</span>
                  <span className="text-sm text-muted-foreground">
                    {usuario?.nombre_usuario}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rol:</span>
                  <Badge variant="secondary" className="capitalize">
                    {usuario?.rol}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas transacciones del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-8 w-full" />
                  ))}
                </div>
              ) : (stats?.actividadReciente?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm">Sin actividad registrada hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats?.actividadReciente.map((actividad) => (
                    <div
                      key={actividad.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
                          {actividad.concepto}
                        </span>
                        {actividad.mesa && (
                          <span className="text-xs text-muted-foreground">
                            {actividad.mesa}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <Badge
                          variant={
                            estadoBadgeVariant[actividad.estado] ?? "secondary"
                          }
                          className="capitalize text-xs"
                        >
                          {actividad.estado}
                        </Badge>
                        <span className="text-sm font-semibold tabular-nums">
                          Bs {Number(actividad.monto_total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
