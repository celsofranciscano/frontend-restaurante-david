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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
    Plus,
    Trash2,
    ShoppingBag,
    Utensils,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ItemRow } from "../types/transaccion.types";
import type { Plato } from "@/modules/platos/types/plato.types";
import type { Producto } from "@/modules/productos/types/producto.types";
import type { KeyboardEvent, RefObject } from "react";

interface TransactionItemsTableProps {
    rows: ItemRow[];
    platos: Plato[];
    productos: Producto[];
    selectItem: (rowId: string, itemId: string) => void;
    updateRow: (id: string, updates: Partial<ItemRow>) => void;
    addNewRow: () => void;
    removeRow: (id: string) => void;
    addExtraToRow: (rowId: string) => void;
    removeExtraFromRow: (rowId: string, extraId: string) => void;
    handleKeyDown: (e: KeyboardEvent, rowId: string, rowIndex: number, cell: "cantidad" | "notas") => void;
    extrasPopoverOpen: { [key: string]: boolean };
    setExtrasPopoverOpen: (open: React.SetStateAction<{ [key: string]: boolean }>) => void;
    extraForm: { precio: string };
    setExtraForm: (form: { precio: string }) => void;
    cantidadInputRefs: RefObject<{ [key: string]: HTMLInputElement | null }>;
    notasInputRefs: RefObject<{ [key: string]: HTMLInputElement | null }>;
}

export function TransactionItemsTable({
    rows,
    platos,
    productos,
    selectItem,
    updateRow,
    addNewRow,
    removeRow,
    addExtraToRow,
    removeExtraFromRow,
    handleKeyDown,
    extrasPopoverOpen,
    setExtrasPopoverOpen,
    extraForm,
    setExtraForm,
    cantidadInputRefs,
    notasInputRefs,
}: TransactionItemsTableProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg"> Items del Pedido</h3>
                <Button onClick={addNewRow} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Nueva Fila
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[40px]">#</TableHead>
                            <TableHead className="min-w-[300px]">
                                Item (Producto/Plato)
                            </TableHead>
                            <TableHead className="w-[120px]">Cantidad</TableHead>
                            <TableHead className="w-[100px]">Extras</TableHead>
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
                                    <div className="flex flex-col gap-1">
                                        <Select
                                            value={row.item_id}
                                            onValueChange={(value) => selectItem(row.id, value)}
                                        >
                                            <SelectTrigger
                                                className={cn("h-9", row.item_id && "font-medium")}
                                            >
                                                <SelectValue placeholder="Seleccionar item..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                    Platos
                                                </div>
                                                {platos.map((plato) => (
                                                    <SelectItem key={plato.id} value={plato.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Utensils className="h-4 w-4 text-plato" />
                                                            {plato.nombre} - Bs{" "}
                                                            {Number(plato.precio).toFixed(2)}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                                                    Productos
                                                </div>
                                                {productos.map((producto) => (
                                                    <SelectItem
                                                        key={producto.id}
                                                        value={producto.id}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <ShoppingBag className="h-4 w-4 text-info" />
                                                            {producto.nombre} - Bs{" "}
                                                            {Number(producto.precio).toFixed(2)}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Inline Extras Display */}
                                        {row.extras.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {row.extras.map((extra) => (
                                                    <Badge
                                                        key={extra.id}
                                                        variant="secondary"
                                                        className="px-1.5 py-0.5 text-xs font-normal"
                                                    >
                                                        + {extra.descripcion} : {extra.precio > 0 ? `Bs ${extra.precio.toFixed(2)}` : "Gratis"}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Cantidad */}
                                <TableCell>
                                    <Input
                                        ref={(el) => {
                                            if (cantidadInputRefs.current) {
                                                cantidadInputRefs.current[row.id] = el;
                                            }
                                        }}
                                        type="number"
                                        min="0"
                                        step="0"
                                        value={row.cantidad}
                                        onChange={(e) =>
                                            updateRow(row.id, {
                                                cantidad: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(e, row.id, index, "cantidad")
                                        }
                                        className="text-center"
                                    />
                                </TableCell>

                                {/* Extras */}
                                <TableCell>
                                    <Popover
                                        open={extrasPopoverOpen[row.id] || false}
                                        onOpenChange={(open) =>
                                            setExtrasPopoverOpen((prev) => ({
                                                ...prev,
                                                [row.id]: open,
                                            }))
                                        }
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-full"
                                                disabled={!row.item_id}
                                            >
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                {row.extras.length > 0
                                                    ? `${row.extras.length}`
                                                    : "+"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-96" align="start">
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-warning" />
                                                    Extras - {row.item_nombre}
                                                </h4>

                                                {/* Current extras */}
                                                {row.extras.length > 0 && (
                                                    <div className="space-y-2">
                                                        {row.extras.map((extra) => (
                                                            <div
                                                                key={extra.id}
                                                                className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                                                            >
                                                                <div className="flex-1">
                                                                    <p className="font-medium">
                                                                        {extra.ingrediente_nombre ||
                                                                            extra.descripcion}
                                                                    </p>
                                                                    <p className="text-muted-foreground">
                                                                        Cant: {extra.cantidad} | Bs{" "}
                                                                        {extra.precio.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-destructive"
                                                                    onClick={() =>
                                                                        removeExtraFromRow(
                                                                            row.id,
                                                                            extra.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <Separator />

                                                {/* Add extra form */}
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <label className="text-xs font-medium">Precio Extra (Instructivos / Extras)</label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Precio"
                                                            step="0.01"
                                                            min="0"
                                                            value={extraForm.precio}
                                                            onChange={(e) =>
                                                                setExtraForm({
                                                                    ...extraForm,
                                                                    precio: e.target.value,
                                                                })
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    addExtraToRow(row.id);
                                                                }
                                                            }}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        className="w-full h-8 text-xs"
                                                        onClick={() => addExtraToRow(row.id)}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Agregar
                                                    </Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>

                                {/* Notas */}
                                <TableCell>
                                    <Input
                                        ref={(el) => {
                                            if (notasInputRefs.current) {
                                                notasInputRefs.current[row.id] = el;
                                            }
                                        }}
                                        value={row.notas}
                                        onChange={(e) =>
                                            updateRow(row.id, { notas: e.target.value })
                                        }
                                        placeholder="Notas..."
                                        onKeyDown={(e) =>
                                            handleKeyDown(e, row.id, index, "notas")
                                        }
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
        </div>
    );
}
