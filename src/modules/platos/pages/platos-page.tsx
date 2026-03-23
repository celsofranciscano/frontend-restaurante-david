import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/layouts/dashboard-layout";
import { platosService } from "../services/platos.service";
import type { CreatePlatoDto, Plato } from "../types/plato.types";
import { PlatoDialog } from "../components/plato-dialog";
import { ManageIngredientesDialog } from "../components/manage-ingredientes-dialog";
import { PlatosTable } from "../components/platos-table";
import { toast } from "sonner";

export function PlatosPage() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ingredientesDialogOpen, setIngredientesDialogOpen] = useState(false);
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);
  const [managingPlatoIngredientes, setManagingPlatoIngredientes] = useState<Plato | null>(null);

  const fetchPlatos = async () => {
    try {
      setLoading(true);
      const data = await platosService.getAll();
      setPlatos(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar platos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatos();
  }, []);

  const handleCreate = () => {
    setEditingPlato(null);
    setDialogOpen(true);
  };

  const handleEdit = (plato: Plato) => {
    setEditingPlato(plato);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await platosService.delete(id);
      toast.success("Plato eliminado correctamente");
      fetchPlatos();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar plato");
    }
  };

  const handleSubmit = async (values: CreatePlatoDto) => {
    try {
      if (editingPlato) {
        await platosService.update(editingPlato.id, values);
        toast.success("Plato actualizado correctamente");
      } else {
        await platosService.create(values);
        toast.success("Plato registrado correctamente");
      }
      fetchPlatos();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar los datos del plato");
    }
  };

  const handleManageIngredientes = (plato: Plato) => {
    setManagingPlatoIngredientes(plato);
    setIngredientesDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Platos</h2>
            <p className="text-muted-foreground">
              Gestiona el menú y la carta del restaurante.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Plato
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Platos</CardTitle>
            <CardDescription>
              Menú disponible para la venta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Cargando platos...</div>
            ) : (
              <PlatosTable
                platos={platos}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageIngredientes={handleManageIngredientes}
              />
            )}
          </CardContent>
        </Card>

        <PlatoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          platoToEdit={editingPlato}
        />

        <ManageIngredientesDialog
          open={ingredientesDialogOpen}
          onOpenChange={setIngredientesDialogOpen}
          plato={managingPlatoIngredientes}
          onIngredientsUpdated={fetchPlatos}
        />
      </div>
    </DashboardLayout>
  );
}
