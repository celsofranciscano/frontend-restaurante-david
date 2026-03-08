import axiosInstance from "@/lib/axios"
import type { DashboardStats } from "../types/dashboard.types"

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const { data } = await axiosInstance.get<DashboardStats>("/dashboard/stats")
        return data
    },
}
