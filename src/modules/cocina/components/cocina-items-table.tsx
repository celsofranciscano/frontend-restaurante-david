import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetalleItem } from "@/modules/transacciones/types/transaccion.types";

type CocinaItemsTableProps = {
    items: DetalleItem[];
};

export function CocinaItemsTable({ items }: CocinaItemsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">Cant.</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Detalles</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-bold text-xl text-center">
                                {Math.floor(parseFloat(item.cantidad))}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-semibold text-base">
                                        {item.nombre || "Item desconocido"}
                                    </div>
                                    {(item.producto_id || item.plato_id) && (
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-xs",
                                                item.producto_id && "bg-blue-50 border-blue-300",
                                                item.plato_id && "bg-purple-50 border-purple-300"
                                            )}
                                        >
                                            {item.producto_id ? "Producto" : "Plato"}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    {item.notas && (
                                        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-md p-2">
                                            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <span className="font-semibold text-destructive">Nota: </span>
                                                <span>{item.notas}</span>
                                            </div>
                                        </div>
                                    )}
                                    {item.extras && item.extras.length > 0 && (
                                        <div className="space-y-1">
                                            {item.extras.map((extra) => (
                                                <div 
                                                    key={extra.id}
                                                    className="text-sm text-muted-foreground flex items-center gap-1"
                                                >
                                                    <span className="text-green-600 font-bold">+</span>
                                                    <span>{extra.nombre || "Extra"}</span>
                                                    {extra.cantidad && parseFloat(extra.cantidad) > 1 && (
                                                        <span className="text-xs">
                                                            (x{Math.floor(parseFloat(extra.cantidad))})
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
