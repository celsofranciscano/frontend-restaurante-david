import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { productosService } from "@/modules/productos/services/productos.service";
import { platosService } from "@/modules/platos/services/platos.service";
import type { Producto } from "@/modules/productos/types/producto.types";
import type { Plato } from "@/modules/platos/types/plato.types";
import type { AddItemDto } from "../types/transaccion.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


type OrderRow = {
    id: string;
    tipo: "producto" | "plato" | "";
    item_id: string;
    item_nombre: string;
    cantidad: number;
    precio: number;
    notas: string;
    subtotal: number;
};

type QuickOrderTableProps = {
    onSubmitItems: (items: AddItemDto[]) => Promise<void>;
    onCancel: () => void;
};

export function QuickOrderTable({ onSubmitItems, onCancel }: QuickOrderTableProps) {
    const [rows, setRows] = useState<OrderRow[]>([
        {
            id: crypto.randomUUID(),
            tipo: "",
            item_id: "",
            item_nombre: "",
            cantidad: 1,
            precio: 0,
            notas: "",
            subtotal: 0,
        },
    ]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const cantidadInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const notasInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productosData, platosData] = await Promise.all([
                productosService.getAll(),
                platosService.getAll(),
            ]);
            setProductos(productosData);
            setPlatos(platosData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar productos y platos");
        } finally {
            setLoading(false);
        }
    };

    const updateRow = (id: string, updates: Partial<OrderRow>) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id === id) {
                    const updated = { ...row, ...updates };
                    updated.subtotal = updated.cantidad * updated.precio;
                    return updated;
                }
                return row;
            })
        );
    };

    const selectItem = (rowId: string, itemId: string) => {
        const producto = productos.find((p) => p.id === itemId);
        const plato = platos.find((p) => p.id === itemId);

        if (producto) {
            updateRow(rowId, {
                tipo: "producto",
                item_id: producto.id,
                item_nombre: producto.nombre,
                precio: Number(producto.precio),
            });
        } else if (plato) {
            updateRow(rowId, {
                tipo: "plato",
                item_id: plato.id,
                item_nombre: plato.nombre,
                precio: Number(plato.precio),
            });
        }
    };

    const addNewRow = () => {
        const newRow: OrderRow = {
            id: crypto.randomUUID(),
            tipo: "",
            item_id: "",
            item_nombre: "",
            cantidad: 1,
            precio: 0,
            notas: "",
            subtotal: 0,
        };
        setRows([...rows, newRow]);
    };

    const removeRow = (id: string) => {
        if (rows.length === 1) {
            toast.error("Debe haber al menos una fila");
            return;
        }
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        rowId: string,
        rowIndex: number,
        cell: "cantidad" | "notas"
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();

            // If we're on the last row and it has an item selected, add a new row
            if (rowIndex === rows.length - 1 && rows[rowIndex].item_id) {
                addNewRow();
            } else if (rowIndex < rows.length - 1) {
                // Move to the same cell in the next row
                const nextRowId = rows[rowIndex + 1].id;
                setTimeout(() => {
                    const input =
                        cell === "cantidad"
                            ? cantidadInputRefs.current[nextRowId]
                            : notasInputRefs.current[nextRowId];
                    if (input) input.focus();
                }, 50);
            }
        } else if (e.key === "Tab" && !e.shiftKey) {
            if (cell === "cantidad") {
                e.preventDefault();
                notasInputRefs.current[rowId]?.focus();
            } else if (cell === "notas" && rowIndex < rows.length - 1) {
                e.preventDefault();
                const nextRowId = rows[rowIndex + 1].id;
                cantidadInputRefs.current[nextRowId]?.focus();
            }
        }
    };

    const handleSubmit = async () => {
        const validRows = rows.filter((row) => row.item_id && row.cantidad > 0);

        if (validRows.length === 0) {
            toast.error("Agregue al menos un item válido");
            return;
        }

        const items: AddItemDto[] = validRows.map((row) => ({
            producto_id: row.tipo === "producto" ? row.item_id : undefined,
            plato_id: row.tipo === "plato" ? row.item_id : undefined,
            cantidad: row.cantidad,
            notas: row.notas || undefined,
        }));

        try {
            setSubmitting(true);
            await onSubmitItems(items);
            toast.success(`${validRows.length} item(s) agregado(s) al pedido`);
        } catch (error) {
            console.error(error);
            toast.error("Error al agregar items");
        } finally {
            setSubmitting(false);
        }
    };

    const total = rows.reduce((sum, row) => sum + row.subtotal, 0);
    const validItemCount = rows.filter((row) => row.item_id).length;

    if (loading) {
        return <div className="text-center py-8">Cargando...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">📊 Entrada Rápida de Pedido</h3>
                    <p className="text-sm text-muted-foreground">
                        Selecciona items, ajusta cantidades y presiona Tab/Enter para navegar
                    </p>
                </div>
                <Button onClick={addNewRow} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Nueva Fila
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[40px]">#</TableHead>
                            <TableHead className="min-w-[300px]">Item (Producto/Plato)</TableHead>
                            <TableHead className="w-[120px]">Cantidad</TableHead>
                            <TableHead className="w-[120px]">Precio Unit.</TableHead>
                            <TableHead className="w-[120px]">Subtotal</TableHead>
                            <TableHead className="min-w-[200px]">Notas</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={row.id} className="hover:bg-muted/30">
                                <TableCell className="font-mono text-muted-foreground">
                                    {index + 1}
                                </TableCell>

                                {/* Item Selection */}
                                <TableCell>
                                    <Select
                                        value={row.item_id}
                                        onValueChange={(value) => selectItem(row.id, value)}
                                    >
                                        <SelectTrigger className={cn(row.item_id && "font-medium")}>
                                            <SelectValue placeholder="Seleccionar item..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                Platos
                                            </div>
                                            {platos.map((plato) => (
                                                <SelectItem key={plato.id} value={plato.id}>
                                                    🍽️ {plato.nombre} - Bs {Number(plato.precio).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                                                Productos
                                            </div>
                                            {productos.map((producto) => (
                                                <SelectItem key={producto.id} value={producto.id}>
                                                    📦 {producto.nombre} - Bs {Number(producto.precio).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                {/* Cantidad */}
                                <TableCell>
                                    <Input
                                        ref={(el) => {
                                            cantidadInputRefs.current[row.id] = el;
                                        }}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={row.cantidad}
                                        onChange={(e) =>
                                            updateRow(row.id, { cantidad: parseFloat(e.target.value) || 0 })
                                        }
                                        onKeyDown={(e) => handleKeyDown(e, row.id, index, "cantidad")}
                                        className="text-center"
                                    />
                                </TableCell>

                                {/* Precio */}
                                <TableCell className="text-right font-medium">
                                    {row.precio > 0 ? `Bs ${row.precio.toFixed(2)}` : "-"}
                                </TableCell>

                                {/* Subtotal */}
                                <TableCell className="text-right font-bold">
                                    {row.subtotal > 0 ? `Bs ${row.subtotal.toFixed(2)}` : "-"}
                                </TableCell>

                                {/* Notas */}
                                <TableCell>
                                    <Input
                                        ref={(el) => {
                                            notasInputRefs.current[row.id] = el;
                                        }}
                                        value={row.notas}
                                        onChange={(e) => updateRow(row.id, { notas: e.target.value })}
                                        placeholder="Notas especiales..."
                                        onKeyDown={(e) => handleKeyDown(e, row.id, index, "notas")}
                                    />
                                </TableCell>

                                {/* Actions */}
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRow(row.id)}
                                        className="h-8 w-8 text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        {validItemCount} item(s) • {rows.length} fila(s)
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">Bs {total.toFixed(2)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onCancel} disabled={submitting}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={validItemCount === 0 || submitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {submitting ? "Guardando..." : `Guardar Pedido (${validItemCount})`}
                </Button>
            </div>
        </div>
    );
}
