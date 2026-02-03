import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/modules/auth/context/auth.context"
import { ProtectedRoute } from "@/modules/auth/components/protected-route"
import LoginPage from "@/modules/auth/pages/login-page"
import { HomePage } from "@/pages/home-page"
import { DashboardPage } from "@/pages/dashboard-page"

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
