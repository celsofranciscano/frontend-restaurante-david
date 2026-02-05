import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/modules/auth/context/auth.context"
import { ProtectedRoute } from "@/modules/auth/components/protected-route"
import LoginPage from "@/modules/auth/pages/login-page"
import { HomePage } from "@/pages/home-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { UsuariosPage } from "@/modules/usuarios/pages/usuarios-page"
import { CajaPage } from "@/modules/caja"

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
