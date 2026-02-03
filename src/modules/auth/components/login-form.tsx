import { useState } from "react"
import { UtensilsCrossed } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "../hooks/useAuth"

// Schema de validación con Zod
const loginSchema = z.object({
  nombre_usuario: z.string().min(1, "El nombre de usuario es requerido"),
  contrasena: z.string().min(1, "La contraseña es requerida"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      await login(data)
    } catch (error) {
      console.error('Error en login:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <UtensilsCrossed className="size-6" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Restaurante V2</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para continuar
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <p className="font-medium">Usuarios de prueba:</p>
              <p>👤 admin / Admin123!</p>
              <p>👤 cajero1 / Cajero123!</p>
            </div>
          </div>
          
          <Field>
            <FieldLabel htmlFor="nombre_usuario">Nombre de Usuario</FieldLabel>
            <Input
              id="nombre_usuario"
              type="text"
              placeholder="usuario"
              {...register("nombre_usuario")}
              disabled={isSubmitting}
            />
            {errors.nombre_usuario && (
              <p className="text-sm text-destructive">{errors.nombre_usuario.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
            <Input
              id="contrasena"
              type="password"
              placeholder="••••••••"
              {...register("contrasena")}
              disabled={isSubmitting}
            />
            {errors.contrasena && (
              <p className="text-sm text-destructive">{errors.contrasena.message}</p>
            )}
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
