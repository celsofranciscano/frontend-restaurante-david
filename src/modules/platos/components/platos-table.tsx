import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Utensils } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useState } from "react";
import { platosService } from "../services/platos.service";
import type { Plato } from "../types/plato.types";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PlatoIngrediente } from "../types/plato.types";

interface PlatosTableProps {
  platos: Plato[];
  onEdit: (plato: Plato) => void;
  onDelete: (id: string) => void;
  onManageIngredientes?: (plato: Plato) => void;
}

export function PlatosTable({
  platos,
  onEdit,
  onDelete,
  onManageIngredientes
}: PlatosTableProps) {
  const IngredientsHover = ({ platoId }: { platoId: string }) => {
    const [ingredientes, setIngredientes] = useState<PlatoIngrediente[] | null>(null);
    const [loading, setLoading] = useState(false);

    const load = async () => {
      if (ingredientes || loading) return;
      setLoading(true);
      try {
        const data = await platosService.getIngredientes(platoId);
        setIngredientes(data);
      } catch {
        setIngredientes([]);
      } finally {
        setLoading(false);
      }
    };

    const preview = ingredientes && ingredientes.length > 0
      ? ingredientes.slice(0, 2).map((i) => i.nombre || "Desconocido").join(", ") + (ingredientes.length > 2 ? ` +${ingredientes.length - 2}` : "")
      : "-";

    return (
      <div className="flex items-center gap-2">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onMouseEnter={load}
              aria-label="Ver ingredientes"
            >
              <Utensils className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="space-y-2">
              <h4 className="font-semibold">Ingredientes</h4>
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : !ingredientes || ingredientes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay ingredientes</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {ingredientes.map((ing) => (
                    <li key={ing.ingrediente_id} className="flex justify-between">
                      <span className="truncate">{ing.nombre || "Desconocido"}</span>
                      <span className="text-muted-foreground">{ing.cantidad} {ing.unidad || ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
        <span className="text-sm text-muted-foreground">{preview}</span>
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Ingredientes</TableHead>
            <TableHead>Precio (Bs)</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {platos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No hay platos registrados.
              </TableCell>
            </TableRow>
          ) : (
            platos.map((plato) => (
              <TableRow key={plato.id}>
                <TableCell className="font-medium">{plato.nombre}</TableCell>
                <TableCell>
                  <IngredientsHover platoId={plato.id} />
                </TableCell>
                <TableCell>{Number(plato.precio).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onManageIngredientes && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onManageIngredientes(plato)}
                            >
                              <Utensils className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Gestionar Ingredientes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(plato)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el plato permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(plato.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
