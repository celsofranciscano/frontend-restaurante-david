import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { usuariosService } from "../services/usuarios.service";
import type { UpdateUsuarioDto, Usuario } from "../types/usuario.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AxiosError } from "axios";

const ROLES = ["admin", "cajero"] as const;
type Rol = (typeof ROLES)[number];

const usuarioSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres")
    .optional()
    .or(z.literal("")),
  nombre_usuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede superar los 30 caracteres")
    .regex(
      /^[a-z0-9_]+$/,
      "Solo minúsculas, números y guiones bajos permitidos",
    )
    .optional()
    .or(z.literal("")),
  contrasena: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  rol: z.enum(ROLES).optional(),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface EditUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export function EditUsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: EditUsuarioDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: "",
      nombre_usuario: "",
      contrasena: "",
      rol: undefined,
    },
  });

  useEffect(() => {
    if (usuario) {
      reset({
        nombre: usuario.nombre ?? "",
        nombre_usuario: usuario.nombre_usuario ?? "",
        contrasena: "",
        rol: (usuario.rol as Rol) ?? undefined,
      });
    } else {
      reset({ nombre: "", nombre_usuario: "", contrasena: "", rol: undefined });
    }
  }, [usuario, reset]);

  const onSubmit = async (data: UsuarioFormData) => {
    if (!usuario) return;

    try {
      setIsSubmitting(true);

      // Filtrar campos vacíos
      const updateData: UpdateUsuarioDto = {};
      if (data.nombre && data.nombre.trim()) updateData.nombre = data.nombre;
      if (data.nombre_usuario && data.nombre_usuario.trim())
        updateData.nombre_usuario = data.nombre_usuario;
      if (data.contrasena && data.contrasena.trim())
        updateData.contrasena = data.contrasena;
      if (data.rol) updateData.rol = data.rol;

      await usuariosService.update(usuario.id, updateData);
      toast.success("Usuario actualizado exitosamente");
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      let message = "Error al actualizar el usuario";
      if (error instanceof AxiosError) {
        message =
          error.response?.data?.message ||
          error.response?.statusText ||
          message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario. Deja la contraseña vacía para no
            cambiarla.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Nombre completo"
              {...register("nombre")}
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre_usuario">Nombre de Usuario</Label>
            <Input
              id="nombre_usuario"
              placeholder="juanperez"
              {...register("nombre_usuario")}
              disabled={isSubmitting}
            />
            {errors.nombre_usuario && (
              <p className="text-sm text-destructive">
                {errors.nombre_usuario.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Nueva Contraseña (opcional)</Label>
            <Input
              id="contrasena"
              type="password"
              placeholder="Dejar vacío para no cambiar"
              {...register("contrasena")}
              disabled={isSubmitting}
            />
            {errors.contrasena && (
              <p className="text-sm text-destructive">{errors.contrasena.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Controller
              name="rol"
              control={control}
              render={({ field }) => (
                <Select
                  value={(field.value as string) ?? ""}
                  onValueChange={(val) => field.onChange(val === "" ? undefined : (val as Rol))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="cajero">Cajero</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.rol && (
              <p className="text-sm text-destructive">{errors.rol.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
