import { useState, useEffect } from "react"
import { toast } from "sonner"
import { dashboardService } from "../services/dashboard.service"
import type { DashboardStats } from "../types/dashboard.types"

interface UseDashboardStatsReturn {
    stats: DashboardStats | null
    isLoading: boolean
    error: string | null
    refetch: () => void
}

export function useDashboardStats(): UseDashboardStatsReturn {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fetchTrigger, setFetchTrigger] = useState(0)

    useEffect(() => {
        let cancelled = false

        const fetchStats = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const data = await dashboardService.getStats()
                if (!cancelled) {
                    setStats(data)
                }
            } catch {
                if (!cancelled) {
                    const mensaje = "No se pudieron cargar las estadísticas del dashboard"
                    setError(mensaje)
                    toast.error(mensaje)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        void fetchStats()

        return () => {
            cancelled = true
        }
    }, [fetchTrigger])

    const refetch = () => setFetchTrigger((prev) => prev + 1)

    return { stats, isLoading, error, refetch }
}
