import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingBag, Utensils, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, formatTime } from "@/utils/date-format";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { transaccionesService } from "../services/transacciones.service";
import type { Transaccion, DetalleItem, DetalleItemExtra } from "../types/transaccion.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type OrderDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaccion: Transaccion | null;
    onUpdate: () => void;
    onAddItem: () => void;
    onPay: () => void;
    onManageExtras: (itemId: number, itemName: string) => void;
    readOnly?: boolean;
};

export function OrderDetailsDialog({
    open,
    onOpenChange,
    transaccion,
    onUpdate,
    onAddItem,
    onPay,
    onManageExtras,
    readOnly,
}: OrderDetailsDialogProps) {
    const [items, setItems] = useState<DetalleItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
    const [itemExtras, setItemExtras] = useState<Record<number, DetalleItemExtra[]>>({});

    useEffect(() => {
        if (transaccion && open) {
            fetchItems();
            setExpandedItemId(null);
            setItemExtras({});
        }
    }, [transaccion, open]);

    const fetchItems = async () => {
        if (!transaccion) return;

        try {
            setLoadingItems(true);
            const data = await transaccionesService.getItems(transaccion.id);
            setItems(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar items del pedido");
        } finally {
            setLoadingItems(false);
        }
    };

    const fetchExtras = async (itemId: number) => {
        if (!transaccion) return;

        try {
            const data = await transaccionesService.getExtras(transaccion.id, itemId);
            setItemExtras((prev) => ({ ...prev, [itemId]: data }));
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar extras");
        }
    };

    const handleToggleExtras = async (itemId: number) => {
        if (expandedItemId === itemId) {
            setExpandedItemId(null);
        } else {
            setExpandedItemId(itemId);
            if (!itemExtras[itemId]) {
                await fetchExtras(itemId);
            }
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!transaccion) return;

        try {
            await transaccionesService.removeItem(transaccion.id, itemId);
            toast.success("Item eliminado correctamente");
            fetchItems();
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar item");
        }
    };

    if (!transaccion) return null;

    // Helper for safe number parsing
    const parseNumber = (val: string | number | undefined | null) => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
    };

    const montoPendiente = parseNumber(transaccion.monto_pendiente);
    const montoTotal = parseNumber(transaccion.monto_total);
    const montoPagado = parseNumber(transaccion.monto_pagado);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-4">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            Gestionar Pedido <Badge variant="outline" className="text-lg">#{transaccion.nro_reg}</Badge>
                        </DialogTitle>
                        <Badge
                            variant={
                                transaccion.estado === "cerrado"
                                    ? "secondary" // Changed from outline to secondary for better visibility
                                    : transaccion.estado === "abierto"
                                        ? "default"
                                        : "destructive" // Assuming 'pendiente' or others might want attention
                            }
                            className="text-sm px-3 py-1 capitalize"
                        >
                            {transaccion.estado}
                        </Badge>
                    </div>
                    <DialogDescription className="space-y-1 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                            <span className="font-semibold text-foreground">
                                {transaccion.mesa ? `Mesa: ${transaccion.mesa}` : "Para Llevar"}
                            </span>
                            {transaccion.cliente && (
                                <span className="text-muted-foreground">
                                    Cliente: <span className="text-foreground">{transaccion.cliente}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>📅 {formatDate(transaccion.fecha)}</span>
                            <span>🕐 {formatTime(transaccion.hora)}</span>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                {/* Order Summary */}
                <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total</span>
                        <div className="text-xl font-bold">Bs {montoTotal.toFixed(2)}</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pagado</span>
                        <div className="text-xl font-bold text-success">Bs {montoPagado.toFixed(2)}</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pendiente</span>
                        <div className={cn("text-xl font-bold", montoPendiente > 0 ? "text-warning" : "text-muted-foreground")}>
                            Bs {montoPendiente.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 space-y-3 min-h-[200px]">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Items del Pedido
                        </h3>
                        {!readOnly && (
                            <Button size="sm" onClick={onAddItem} className="h-8">
                                <Plus className="h-4 w-4 mr-1" /> Agregar Item
                            </Button>
                        )}
                    </div>

                    {loadingItems ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
                            <span className="loading loading-spinner loading-md"></span> {/* Assuming DaisyUI or just text */}
                            Cargando items...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Utensils className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            No hay items en este pedido
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[40%]">Item</TableHead>
                                        <TableHead className="text-center w-[15%]">Cant.</TableHead>
                                        <TableHead className="text-right w-[20%]">Precio</TableHead>
                                        <TableHead className="text-right w-[25%]">Subtotal</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <>
                                            <TableRow key={item.id} className="group hover:bg-muted/20">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-base">{item.nombre}</span>
                                                        </div>
                                                        {item.notas && (
                                                            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded w-fit italic border border-amber-100">
                                                                Nota: {item.notas}
                                                            </span>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-0 text-xs text-muted-foreground w-fit hover:text-primary justify-start"
                                                            onClick={() => handleToggleExtras(item.id)}
                                                        >
                                                            {expandedItemId === item.id ? (
                                                                <ChevronUp className="h-3 w-3 mr-1" />
                                                            ) : (
                                                                <ChevronDown className="h-3 w-3 mr-1" />
                                                            )}
                                                            {expandedItemId === item.id ? "Ocultar" : "Ver"} extras
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {Number(item.cantidad)}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    Bs {Number(item.precio_unitario).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    Bs {Number(item.subtotal).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-warning"
                                                            onClick={() => onManageExtras(item.id, item.nombre || "Item")}
                                                            title="Gestionar extras"
                                                            disabled={readOnly}
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                        </Button>
                                                        {!readOnly && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Eliminar item?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Se eliminará "{item.nombre}" del pedido. Esta acción no se puede deshacer.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleRemoveItem(item.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {expandedItemId === item.id && (
                                                <TableRow className="bg-muted/10 hover:bg-muted/15 border-t-0">
                                                    <TableCell colSpan={5} className="p-0">
                                                        <div className="px-4 py-3 bg-muted/20 border-b border-dashed">
                                                            {itemExtras[item.id] && itemExtras[item.id].length > 0 ? (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                                        Extras Agregados
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {itemExtras[item.id].map((extra) => (
                                                                            <Badge
                                                                                key={extra.id}
                                                                                variant="secondary"
                                                                                className="px-2 py-1 flex items-center gap-2 border bg-background"
                                                                            >
                                                                                <span>{extra.nombre || "Extra"}</span>
                                                                                <span className="text-xs font-normal text-muted-foreground">x{extra.cantidad}</span>
                                                                                <Separator orientation="vertical" className="h-3" />
                                                                                <span className="font-semibold text-success">
                                                                                    +Bs {Number(extra.precio).toFixed(2)}
                                                                                </span>
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                                    <Sparkles className="h-3 w-3" />
                                                                    No hay extras agregados a este item.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
                        Cerrar
                    </Button>
                    {montoPendiente > 0 && !readOnly && (
                        <Button
                            onClick={onPay}
                            className="sm:flex-[2] bg-success hover:bg-success/90 text-success-foreground shadow-md"
                        >
                            Procesar Pago (Bs {montoPendiente.toFixed(2)})
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
