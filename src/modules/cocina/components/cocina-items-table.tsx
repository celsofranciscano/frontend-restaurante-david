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
                        <TableHead className="w-20 text-xl font-bold text-center">
                            Cant.
                        </TableHead>
                        <TableHead className="text-xl font-bold">Item</TableHead>
                        <TableHead className="text-xl font-bold">Detalles</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-extrabold text-4xl text-center">
                                {Math.floor(parseFloat(item.cantidad))}
                            </TableCell>

                            <TableCell>
                                <div className="space-y-2">
                                    <div className="font-extrabold text-3xl leading-tight">
                                        {item.nombre || "Item desconocido"}
                                    </div>

                                    {(item.producto_id || item.plato_id) && (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-lg px-3 py-1 font-bold",
                                                item.producto_id && "bg-info-bg border-info",
                                                item.plato_id && "bg-accent border-plato"
                                            )}
                                        >
                                            {item.producto_id ? "Producto" : "Plato"}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-3">
                                    {item.notas && (
                                        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-md p-3">
                                            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                                            <div className="text-xl">
                                                <span className="font-extrabold text-destructive">
                                                    NOTA:
                                                </span>{" "}
                                                <span>{item.notas}</span>
                                            </div>
                                        </div>
                                    )}

                                    {item.extras && item.extras.length > 0 && (
                                        <div className="space-y-2">
                                            {item.extras.map((extra) => (
                                                <div
                                                    key={extra.id}
                                                    className="text-xl flex items-center gap-2"
                                                >
                                                    <span className="text-success font-extrabold text-2xl">
                                                        +
                                                    </span>
                                                    <span className="font-semibold">
                                                        {extra.nombre || "Extra"}
                                                    </span>
                                                    {extra.cantidad &&
                                                        parseFloat(extra.cantidad) > 1 && (
                                                            <span className="text-lg font-bold">
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
