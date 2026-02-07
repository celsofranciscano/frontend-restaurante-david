import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/layouts/dashboard-layout";
import { productosService } from "../services/productos.service";
import type { Producto, CreateProductoDto } from "../types/producto.types";
import { ProductosTable } from "../components/productos-table";
import { ProductoDialog } from "../components/producto-dialog";
import { toast } from "sonner"; // Assuming sonner is used as in caja

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleCreate = () => {
    setEditingProducto(null);
    setDialogOpen(true);
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await productosService.delete(id);
      toast.success("Producto eliminado correctamente");
      fetchProductos();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar producto");
    }
  };

  const handleSubmit = async (values: CreateProductoDto) => {
    try {
      if (editingProducto) {
        await productosService.update(editingProducto.id, values);
        toast.success("Producto actualizado correctamente");
      } else {
        await productosService.create(values);
        toast.success("Producto creado correctamente");
      }
      fetchProductos();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar producto");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
            <p className="text-muted-foreground">
              Gestiona el catálogo de productos para la venta.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Productos</CardTitle>
            <CardDescription>
              Visualiza y administra todos los productos registrados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Cargando productos...</div>
            ) : (
              <ProductosTable
                productos={productos}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        <ProductoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          productoToEdit={editingProducto}
        />
      </div>
    </DashboardLayout>
  );
}
