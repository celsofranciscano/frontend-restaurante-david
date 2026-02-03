import { useAuth } from "@/modules/auth/hooks/useAuth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/layouts/dashboard-layout"
import { Users, Package, Utensils, TrendingUp } from "lucide-react"

export function DashboardPage() {
  const { usuario } = useAuth()

  const stats = [
    {
      title: "Usuarios Activos",
      value: "12",
      description: "En el sistema",
      icon: Users,
      trend: "+2 esta semana",
    },
    {
      title: "Productos",
      value: "48",
      description: "En inventario",
      icon: Package,
      trend: "+5 nuevos",
    },
    {
      title: "Platos",
      value: "24",
      description: "En el menú",
      icon: Utensils,
      trend: "3 populares",
    },
    {
      title: "Órdenes Hoy",
      value: "8",
      description: "En proceso",
      icon: TrendingUp,
      trend: "+20% vs ayer",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Bienvenida */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            ¡Bienvenido, {usuario?.nombre}!
          </h2>
          <p className="text-muted-foreground mt-2">
            Aquí está el resumen de tu restaurante hoy.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Información de Usuario</CardTitle>
              <CardDescription>Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-sm text-muted-foreground">
                    {usuario?.id}
                  </span>
                </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sistema iniciado correctamente. Todas las funcionalidades están
                operativas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>Módulos disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Usuarios</Badge>
                <Badge>Productos</Badge>
                <Badge>Órdenes</Badge>
                <Badge>Mesas</Badge>
                <Badge>Reportes</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
