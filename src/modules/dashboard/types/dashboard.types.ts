export interface ActividadItem {
    id: number
    concepto: string
    mesa: string | null
    estado: string
    monto_total: string
    hora: string
}

export interface DashboardStats {
    totalUsuarios: number
    totalProductos: number
    totalPlatos: number
    transaccionesHoy: number
    ordenesAbiertas: number
    ingresosHoy: string
    actividadReciente: ActividadItem[]
}
