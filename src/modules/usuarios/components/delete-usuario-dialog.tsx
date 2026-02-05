import { useState } from "react";
import { toast } from "sonner";
import { usuariosService } from "../services/usuarios.service";
import type { Usuario } from "../types/usuario.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AxiosError } from "axios";

interface DeleteUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export function DeleteUsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: DeleteUsuarioDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!usuario) return;

    try {
      setIsDeleting(true);
      await usuariosService.delete(usuario.id);
      toast.success("Usuario eliminado exitosamente");
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
        let message = "Error al eliminar el usuario";
        if(error instanceof AxiosError) {
            message = 
            error.response?.data?.messaage ||
            error.response?.statusText ||
            message;
        }
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el usuario{" "}
            <span className="font-semibold">{usuario?.nombre}</span> (
            {usuario?.nombre_usuario}). Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
