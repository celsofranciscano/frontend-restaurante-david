import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed } from "lucide-react";
import type { Transaccion } from "@/modules/transacciones/types/transaccion.types";

type CocinaPedidosListProps = {
    pedidos: Transaccion[];
};

export function CocinaPedidosList({ pedidos }: CocinaPedidosListProps) {
    if (pedidos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                <UtensilsCrossed className="h-16 w-16 mb-4 text-muted-foreground/20" />
                <h3 className="text-lg font-medium text-muted-foreground">
                    No hay pedidos pendientes
                </h3>
                <p className="text-sm text-muted-foreground">
                    Los nuevos pedidos aparecerán aquí automáticamente.
                </p>
            </div>
        );
    }


    return (
        <div className="rounded-xl border shadow-lg overflow-hidden bg-background flex flex-col h-[calc(100vh)]">
            <div className="flex-1 overflow-auto">
                <Table className="border-collapse relative">
                    <TableHeader className="bg-muted/90 sticky top-0 z-10 shadow-sm">
                        <TableRow className="border-b-2 border-border hover:bg-muted/90">
                            <TableHead className="text-center border-r font-bold text-lg py-3 w-[60px]">
                                #
                            </TableHead>
                            <TableHead className="text-center border-r font-bold text-lg py-3 w-[100px]">
                                Hora
                            </TableHead>
                            <TableHead className="border-r font-bold text-lg py-3 w-[200px]">
                                Mesa / Cliente
                            </TableHead>
                            <TableHead className="text-center border-r font-bold text-lg py-3 w-[80px]">
                                Cant.
                            </TableHead>
                            {/* <TableHead className="border-r font-bold text-lg py-3">
                                Plato
                            </TableHead> */}
                            <TableHead className="text-center border-r font-bold text-lg py-3 w-[100px]">
                                Precio
                            </TableHead>
                            <TableHead className="font-bold text-lg py-3 w-[45%] bg-yellow-100/80 dark:bg-yellow-900/40">
                                Instructivos / Extras
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {pedidos.map((pedido) => {
                            // Filter items to only show dishes (platos)
                            const items = (pedido.items || []).filter(item => item.plato_id);
                            if (items.length === 0) return null;

                            return items.map((item, index) => (
                                <TableRow
                                    key={`${pedido.id}-${item.id}`}
                                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                                >
                                    {index === 0 && (
                                        <>
                                            <TableCell
                                                rowSpan={items.length}
                                                className="text-center align-middle border-r bg-muted/5 py-2 px-1"
                                            >
                                                <Badge
                                                    variant="outline"
                                                    className="text-lg font-bold px-2 py-0.5 border-2"
                                                >
                                                    #{pedido.nro_reg}
                                                </Badge>
                                            </TableCell>

                                            <TableCell
                                                rowSpan={items.length}
                                                className="text-center align-middle border-r bg-muted/5 py-2 px-1"
                                            >
                                                <div className="font-mono text-lg font-semibold text-muted-foreground">
                                                    {pedido.hora
                                                        ? pedido.hora.split(" - ")[0]
                                                        : "--:--"}
                                                </div>
                                            </TableCell>

                                            <TableCell
                                                rowSpan={items.length}
                                                className="align-middle border-r bg-muted/5 py-2 px-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-xl whitespace-nowrap">
                                                        {pedido.mesa ||
                                                            pedido.concepto ||
                                                            "Sin mesa"}
                                                    </span>

                                                    {pedido.cliente && (
                                                        <>
                                                            <span className="text-muted-foreground"> / </span>
                                                            <span className="font-medium text-base text-muted-foreground truncate max-w-[180px]">
                                                                {pedido.cliente.toUpperCase()}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>

                                        </>
                                    )}

                                    <TableCell className="text-center align-middle border-r py-3 bg-background">
                                        <span className="font-black text-3xl leading-none text-primary">
                                            {Math.floor(parseFloat(item.cantidad))}
                                        </span>
                                    </TableCell>
                                    {/* 
                                    <TableCell className="align-middle border-r py-3 px-3 bg-background">
                                        <span className="font-bold text-xl leading-tight block">
                                            {item.nombre ||
                                                item.producto_nombre ||
                                                item.plato_nombre ||
                                                "Item"}
                                        </span>
                                    </TableCell> */}

                                    <TableCell className="text-center align-middle border-r py-3 bg-background">
                                        <span className="font-medium text-lg leading-none text-muted-foreground">
                                            Bs {parseFloat(item.precio_unitario).toFixed(2)}
                                        </span>
                                    </TableCell>

                                    <TableCell className="align-middle bg-yellow-50/40 dark:bg-yellow-900/10 py-2 px-3">
                                        <div className="space-y-2">
                                            {/* {item.extras && item.extras.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {item.extras.map((extra) => (
                                                        <div
                                                            key={extra.id}
                                                            className="flex items-center gap-1.5 bg-background border rounded px-2 py-1 shadow-sm"
                                                        >
                                                            <span className="text-green-600 font-bold text-lg leading-none">+</span>
                                                            <span className="font-bold text-base leading-none">
                                                                {extra.nombre ||
                                                                    extra.ingrediente_nombre ||
                                                                    extra.descripcion}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )} */}

                                            {item.notas && (
                                                <div className="flex items-center gap-2 text-destructive bg-destructive/5 px-2 py-1 rounded border border-destructive/10">
                                                    <span className="font-bold text-sm uppercase tracking-wide">
                                                        Nota: {item.notas}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ));
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );


}
