import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingBag, Utensils, Sparkles } from "lucide-react";
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

    const montoPendiente = Number(transaccion.monto_pendiente);
    const montoTotal = Number(transaccion.monto_total);
    const montoPagado = Number(transaccion.monto_pagado);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Gestionar Pedido #{transaccion.nro_reg}
                    </DialogTitle>
                    <DialogDescription className="space-y-1">
                        <div>
                            {transaccion.mesa && <span className="font-medium">{transaccion.mesa}</span>}
                            {transaccion.cliente && <span> - {transaccion.cliente}</span>}
                        </div>
                        <div className="flex gap-4 text-xs">
                            <span>📅 {formatDate(transaccion.fecha)}</span>
                            <span>🕐 {formatTime(transaccion.hora)}</span>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Estado:</span>
                        <Badge
                            variant={
                                transaccion.estado === "cerrado"
                                    ? "outline"
                                    : transaccion.estado === "abierto"
                                        ? "default"
                                        : "secondary"
                            }
                        >
                            {transaccion.estado}
                        </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <span className="font-semibold">Bs {montoTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pagado:</span>
                        <span className="text-green-600 font-medium">
                            Bs {montoPagado.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Pendiente:</span>
                        <span
                            className={`text-lg font-bold ${montoPendiente > 0 ? "text-orange-600" : "text-muted-foreground"
                                }`}
                        >
                            Bs {montoPendiente.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Items del Pedido</h3>
                        {!readOnly && (
                            <Button size="sm" onClick={onAddItem}>
                                <Plus className="h-4 w-4 mr-1" /> Agregar Item
                            </Button>
                        )}
                    </div>

                    {loadingItems ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Cargando items...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay items en este pedido
                        </div>
                    ) : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-center">Cant.</TableHead>
                                        <TableHead className="text-right">Precio</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                        <TableHead className="text-right w-[100px]">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <>
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            {item.producto_id ? (
                                                                <ShoppingBag className="h-4 w-4 text-blue-600" />
                                                            ) : (
                                                                <Utensils className="h-4 w-4 text-orange-600" />
                                                            )}
                                                            <span className="font-medium">{item.nombre}</span>
                                                        </div>
                                                        {item.notas && (
                                                            <span className="text-sm text-muted-foreground italic">
                                                                {item.notas}
                                                            </span>
                                                        )}
                                                        {itemExtras[item.id] && itemExtras[item.id].length > 0 && (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="h-auto p-0 text-xs"
                                                                onClick={() => handleToggleExtras(item.id)}
                                                            >
                                                                {expandedItemId === item.id ? "Ocultar" : "Ver"} extras (
                                                                {itemExtras[item.id].length})
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">{item.cantidad}</TableCell>
                                                <TableCell className="text-right">
                                                    Bs {Number(item.precio_unitario).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    Bs {Number(item.subtotal).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => onManageExtras(item.id, item.nombre || "Item")}
                                                            title="Gestionar extras"
                                                            disabled={readOnly}
                                                        >
                                                            <Sparkles className="h-4 w-4 text-yellow-600" />
                                                        </Button>
                                                        {!readOnly && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Eliminar item?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Se eliminará "{item.nombre}" del pedido.
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
                                            {expandedItemId === item.id && itemExtras[item.id] && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="bg-muted/30">
                                                        <div className="pl-8 py-2 space-y-1">
                                                            <p className="text-sm font-medium text-muted-foreground">
                                                                Extras:
                                                            </p>
                                                            {itemExtras[item.id].map((extra) => (
                                                                <div
                                                                    key={extra.id}
                                                                    className="flex justify-between text-sm"
                                                                >
                                                                    <span>
                                                                        + {extra.nombre || extra.descripcion} (x
                                                                        {extra.cantidad})
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        Bs {Number(extra.precio).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ))}
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

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cerrar
                    </Button>
                    {montoPendiente > 0 && !readOnly && (
                        <Button onClick={onPay} className="flex-1">
                            Procesar Pago
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
