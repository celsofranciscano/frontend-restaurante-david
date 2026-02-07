import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/modules/auth/context/auth.context"
import { ProtectedRoute } from "@/modules/auth/components/protected-route"
import LoginPage from "@/modules/auth/pages/login-page"
import { HomePage } from "@/pages/home-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { UsuariosPage } from "@/modules/usuarios/pages/usuarios-page"
import { CajaPage } from "@/modules/caja"
import { CajaReportePage } from "@/modules/caja/pages"
import { ProductosPage } from "@/modules/productos"
import { IngredientesPage } from "@/modules/ingredientes"
import { PlatosPage } from "@/modules/platos"
import { TransaccionesPage } from "@/modules/transacciones/pages/transacciones-page"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/usuarios"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/caja"
            element={
              <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                <CajaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/productos"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ingredientes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <IngredientesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/platos"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlatosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/transacciones"
            element={
              <ProtectedRoute allowedRoles={['admin', 'cajero']}>
                <TransaccionesPage />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto - redirigir a home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
