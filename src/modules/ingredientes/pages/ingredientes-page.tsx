import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/layouts/dashboard-layout";
import { ingredientesService } from "../services/ingredientes.service";
import type{ Ingrediente, CreateIngredienteDto } from "../types/ingrediente.types";
import { IngredientesTable } from "../components/ingredientes-table";
import { IngredienteDialog } from "../components/ingrediente-dialog";
import { toast } from "sonner"; // Assuming sonner is used as in caja

export function IngredientesPage() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      const data = await ingredientesService.getAll();
      setIngredientes(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar ingredientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredientes();
  }, []);

  const handleCreate = () => {
    setEditingIngrediente(null);
    setDialogOpen(true);
  };

  const handleEdit = (ingrediente: Ingrediente) => {
    setEditingIngrediente(ingrediente);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await ingredientesService.delete(id);
      toast.success("Ingrediente eliminado correctamente");
      fetchIngredientes();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar ingrediente");
    }
  };

  const handleSubmit = async (values: CreateIngredienteDto) => {
    try {
      if (editingIngrediente) {
        await ingredientesService.update(editingIngrediente.id, values);
        toast.success("Ingrediente actualizado correctamente");
      } else {
        await ingredientesService.create(values);
        toast.success("Ingrediente creado correctamente");
      }
      fetchIngredientes();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar ingrediente");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ingredientes</h2>
            <p className="text-muted-foreground">
              Gestiona el inventario de insumos e ingredientes.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Ingrediente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Ingredientes</CardTitle>
            <CardDescription>
              Control de stock y alertas de ingredientes mínimos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Cargando ingredientes...</div>
            ) : (
              <IngredientesTable
                ingredientes={ingredientes}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        <IngredienteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          ingredienteToEdit={editingIngrediente}
        />
      </div>
    </DashboardLayout>
  );
}
