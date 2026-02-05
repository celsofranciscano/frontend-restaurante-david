import { useState, useEffect } from "react";
import { usuariosService } from "../services/usuarios.service";
import type { Usuario } from "../types/usuario.types";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { UsuariosTable } from "../components/usuarios-table";
import { CreateUsuarioDialog } from "../components/create-usuario-dialog";
import { EditUsuarioDialog } from "../components/edit-usuario-dialog";
import { DeleteUsuarioDialog } from "../components/delete-usuario-dialog";
import { AxiosError } from "axios";

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

const loadUsuarios = async () => {
  try {
    setIsLoading(true);
    const data = await usuariosService.getAll();
    setUsuarios(data);
  } catch (error: unknown) {
    let message = "Error al cargar los usuarios";

    if (error instanceof AxiosError) {
      message =
        error.response?.data?.message ||
        error.response?.statusText ||
        message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    toast.error(message);
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
};

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUsuarios();
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditDialogOpen(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Gestión de Usuarios
            </h2>
            <p className="text-muted-foreground mt-2">
              Administra los usuarios del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <UsuariosTable
          usuarios={usuarios}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Diálogos */}
        <CreateUsuarioDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={loadUsuarios}
        />

        <EditUsuarioDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          usuario={selectedUsuario}
          onSuccess={loadUsuarios}
        />

        <DeleteUsuarioDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          usuario={selectedUsuario}
          onSuccess={loadUsuarios}
        />
      </div>
    </DashboardLayout>
  );
}
