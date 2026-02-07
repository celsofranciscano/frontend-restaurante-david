import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ChefHat,
  Search,
  Check,
  X,
  Edit2,
  Package
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { platosService } from "../services/platos.service";
import { ingredientesService } from "../../ingredientes/services/ingredientes.service";
import type { Plato, PlatoIngrediente } from "../types/plato.types";
import type { Ingrediente } from "../../ingredientes/types/ingrediente.types";

type ManageIngredientesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plato: Plato | null;
  onIngredientsUpdated?: () => void;
};

export function ManageIngredientesDialog({
  open,
  onOpenChange,
  plato,
  onIngredientsUpdated,
}: ManageIngredientesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [platoIngredientes, setPlatoIngredientes] = useState<
    PlatoIngrediente[]
  >([]);
  const [availableIngredientes, setAvailableIngredientes] = useState<
    Ingrediente[]
  >([]);

  // Form state
  const [selectedIngredienteId, setSelectedIngredienteId] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCantidad, setEditingCantidad] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      if (!plato) return;

      try {
        setLoading(true);
        const [ingredientes, allIngredientes] = await Promise.all([
          platosService.getIngredientes(plato.id),
          ingredientesService.getAll(),
        ]);
        setPlatoIngredientes(ingredientes);
        setAvailableIngredientes(allIngredientes);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar ingredientes");
      } finally {
        setLoading(false);
      }
    };

    if (open && plato) {
      loadData();
      // Reset form when dialog opens
      setSelectedIngredienteId("");
      setCantidad("");
      setSearchTerm("");
      setEditingId(null);
    }
  }, [open, plato]);

  const handleAddIngrediente = async () => {
    if (!plato || !selectedIngredienteId) {
      toast.error("Por favor seleccione un ingrediente");
      return;
    }

    const cantidadNum = Number(cantidad);
    if (!cantidad || cantidadNum <= 0 || !Number.isInteger(cantidadNum)) {
      toast.error("Por favor ingrese una cantidad válida (número entero mayor a 0)");
      return;
    }

    try {
      setIsAdding(true);
      await platosService.addIngrediente(plato.id, {
        ingrediente_id: selectedIngredienteId,
        cantidad: cantidadNum,
      });

      const ingredienteNombre = availableIngredientes.find(
        ing => ing.id === selectedIngredienteId
      )?.nombre;

      toast.success(`${ingredienteNombre} agregado correctamente`);
      setSelectedIngredienteId("");
      setCantidad("");

      // Reload data
      const [ingredientes, allIngredientes] = await Promise.all([
        platosService.getIngredientes(plato.id),
        ingredientesService.getAll(),
      ]);
      setPlatoIngredientes(ingredientes);
      setAvailableIngredientes(allIngredientes);

      // Notify parent to refresh platos list
      onIngredientsUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar ingrediente");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveIngrediente = async (ingredienteId: string, nombre: string) => {
    if (!plato) return;

    try {
      await platosService.removeIngrediente(plato.id, ingredienteId);
      toast.success(`${nombre} eliminado correctamente`);

      // Reload data
      const [ingredientes, allIngredientes] = await Promise.all([
        platosService.getIngredientes(plato.id),
        ingredientesService.getAll(),
      ]);
      setPlatoIngredientes(ingredientes);
      setAvailableIngredientes(allIngredientes);

      // Notify parent to refresh platos list
      onIngredientsUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar ingrediente");
    }
  };

  const handleStartEdit = (ingredienteId: string, currentCantidad: number) => {
    setEditingId(ingredienteId);
    setEditingCantidad(currentCantidad.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCantidad("");
  };

  const handleSaveEdit = async (ingredienteId: string, nombre: string) => {
    if (!plato) return;

    const cantidadNum = Number(editingCantidad);
    if (!editingCantidad || cantidadNum <= 0 || !Number.isInteger(cantidadNum)) {
      toast.error("Por favor ingrese una cantidad válida (número entero mayor a 0)");
      return;
    }

    try {
      // Update quantity directly
      await platosService.updateIngrediente(plato.id, ingredienteId, cantidadNum);

      toast.success(`Cantidad de ${nombre} actualizada`);
      setEditingId(null);
      setEditingCantidad("");

      // Reload data
      const ingredientes = await platosService.getIngredientes(plato.id);
      setPlatoIngredientes(ingredientes);

      // Notify parent to refresh platos list
      onIngredientsUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar cantidad");
    }
  };

  // Filter out already added ingredients
  const availableToAdd = availableIngredientes.filter(
    (ing) => !platoIngredientes.some((pi) => pi.ingrediente_id === ing.id),
  );

  // Filter ingredients based on search
  const filteredAvailableToAdd = availableToAdd.filter((ing) =>
    ing.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Enter key for adding ingredient
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selectedIngredienteId && Number(cantidad) > 0) {
      handleAddIngrediente();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                {plato?.nombre}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Gestiona los ingredientes necesarios para preparar este plato
              </DialogDescription>
            </div>
            {platoIngredientes.length > 0 && (
              <Badge variant="secondary" className="text-sm font-medium">
                {platoIngredientes.length} {platoIngredientes.length === 1 ? "ingrediente" : "ingredientes"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Add ingredient form */}
          <div className="bg-muted/50 rounded-lg p-4 sm:p-6 border border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-base">Agregar Ingrediente</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr,140px,auto] gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ingrediente-select" className="text-sm font-medium">
                    Ingrediente
                  </Label>
                  <div className="relative">
                    <Select
                      value={selectedIngredienteId}
                      onValueChange={setSelectedIngredienteId}
                      disabled={isAdding}
                    >
                      <SelectTrigger id="ingrediente-select" className="h-10">
                        <SelectValue placeholder="Seleccione un ingrediente" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Buscar ingrediente..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8 h-8"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        {filteredAvailableToAdd.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {searchTerm ? "No se encontraron ingredientes" : "No hay ingredientes disponibles"}
                          </div>
                        ) : (
                          filteredAvailableToAdd.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span className="font-medium">{ing.nombre}</span>
                                <Badge variant="outline" className="text-xs">
                                  {ing.unidad}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad-input" className="text-sm font-medium">
                    Cantidad
                  </Label>
                  <Input
                    id="cantidad-input"
                    type="number"
                    step="1"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="0"
                    className="h-10"
                    disabled={isAdding}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium opacity-0 hidden sm:block">Acción</Label>
                  <Button
                    onClick={handleAddIngrediente}
                    disabled={!selectedIngredienteId || !cantidad || Number(cantidad) <= 0 || isAdding}
                    className="w-full h-10"
                    size="default"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isAdding ? "Agregando..." : "Agregar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Current ingredients list */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-base">Ingredientes Actuales</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Cargando ingredientes...</p>
              </div>
            ) : platoIngredientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No hay ingredientes agregados
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Agrega ingredientes usando el formulario de arriba
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Ingrediente</TableHead>
                      <TableHead className="font-semibold w-[140px]">Cantidad</TableHead>
                      <TableHead className="font-semibold w-[100px]">Unidad</TableHead>
                      <TableHead className="text-right font-semibold w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platoIngredientes.map((pi) => {
                      const isEditing = editingId === pi.ingrediente_id;

                      return (
                        <TableRow key={pi.ingrediente_id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {pi.nombre || "Desconocido"}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                step="1"
                                min="1"
                                value={editingCantidad}
                                onChange={(e) => setEditingCantidad(e.target.value)}
                                className="h-8 w-full"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveEdit(pi.ingrediente_id, pi.nombre || "");
                                  } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-sm">
                                {Number(pi.cantidad).toFixed(0)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {pi.unidad || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleSaveEdit(pi.ingrediente_id, pi.nombre || "")}
                                    title="Guardar"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={handleCancelEdit}
                                    title="Cancelar"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleStartEdit(pi.ingrediente_id, Number(pi.cantidad))}
                                    title="Editar cantidad"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Eliminar ingrediente"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar ingrediente?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Se eliminará <span className="font-semibold">{pi.nombre}</span> de la lista de ingredientes de este plato. Esta acción no se puede deshacer.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleRemoveIngrediente(pi.ingrediente_id, pi.nombre || "")}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}