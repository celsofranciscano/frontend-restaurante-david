import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Plus,
    Trash2,
    Save,
    X,
    ShoppingBag,
    Utensils,
    CreditCard,
    Sparkles,
    Receipt,
    NotebookTabs,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { productosService } from "@/modules/productos/services/productos.service";
import { platosService } from "@/modules/platos/services/platos.service";
import { cajaService } from "@/modules/caja/services/caja.service";
import { ingredientesService } from "@/modules/ingredientes/services/ingredientes.service";
import type { Producto } from "@/modules/productos/types/producto.types";
import type { Plato } from "@/modules/platos/types/plato.types";
import type { Ingrediente } from "@/modules/ingredientes/types/ingrediente.types";
import type { CreateTransaccionDto, AddItemDto, CreatePagoDto } from "../types/transaccion.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Form schema for transaction header
const transaccionSchema = z.object({
    concepto: z.string().min(1, "El concepto es requerido"),
    mesa: z.string().optional(),
    cliente: z.string().optional(),
    estado: z.enum(["pendiente", "abierto", "cerrado"]),
});

type TransaccionFormValues = z.infer<typeof transaccionSchema>;

// Extra type for items
type ItemExtra = {
    id: string;
    tipo: "ingrediente" | "custom";
    ingrediente_id?: string;
    ingrediente_nombre?: string;
    descripcion?: string;
    precio: number;
    cantidad: number;
};

// Row type for items table
type ItemRow = {
    id: string;
    tipo: "producto" | "plato" | "";
    item_id: string;
    item_nombre: string;
    cantidad: number;
    precio: number;
    notas: string;
    extras: ItemExtra[];
    subtotal: number;
};

type UnifiedTransactionViewProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (transaccion: CreateTransaccionDto, items: AddItemDto[], pago?: CreatePagoDto) => Promise<void>;
    nextNroReg: number;
};

export function UnifiedTransactionView({
    open,
    onOpenChange,
    onSubmit,
    nextNroReg,
}: UnifiedTransactionViewProps) {
    // Data
    const [productos, setProductos] = useState<Producto[]>([]);
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [cajaActual, setCajaActual] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Items table
    const [rows, setRows] = useState<ItemRow[]>([
        {
            id: crypto.randomUUID(),
            tipo: "",
            item_id: "",
            item_nombre: "",
            cantidad: 1,
            precio: 0,
            extras: [],
            notas: "",
            subtotal: 0,
        },
    ]);

    // Extras management
    const [extrasPopoverOpen, setExtrasPopoverOpen] = useState<{ [key: string]: boolean }>({});
    const [extraForm, setExtraForm] = useState<{
        tipo: "ingrediente" | "custom";
        ingrediente_id: string;
        descripcion: string;
        precio: number;
        cantidad: number;
    }>({
        tipo: "ingrediente",
        ingrediente_id: "",
        descripcion: "",
        precio: 0,
        cantidad: 1,
    });

    // Payment
    const [showPayment, setShowPayment] = useState(false);
    const [metodoPago, setMetodoPago] = useState<"efectivo" | "qr">("efectivo");
    const [montoPago, setMontoPago] = useState<number>(0);
    const [montoRecibido, setMontoRecibido] = useState<number>(0);
    const [referenciaQr, setReferenciaQr] = useState<string>("");

    // Refs for keyboard navigation
    const cantidadInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const notasInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Form for transaction header
    const form = useForm<TransaccionFormValues>({
        resolver: zodResolver(transaccionSchema),
        defaultValues: {
            concepto: "Pedido",
            mesa: "",
            cliente: "",
            estado: "abierto",
        },
    });

    useEffect(() => {
        if (open) {
            fetchData();
            checkCaja();
        }
    }, [open]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productosData, platosData, ingredientesData] = await Promise.all([
                productosService.getAll(),
                platosService.getAll(),
                ingredientesService.getAll(),
            ]);
            setProductos(productosData);
            setPlatos(platosData);
            setIngredientes(ingredientesData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const checkCaja = async () => {
        try {
            const caja = await cajaService.obtenerCajaAbierta();
            if (!caja) {
                toast.error("No hay una caja abierta. Debe abrir la caja primero.");
                onOpenChange(false);
            } else {
                setCajaActual(caja.id);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al verificar caja");
            onOpenChange(false);
        }
    };

    const updateRow = (id: string, updates: Partial<ItemRow>) => {
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
        const newRow: ItemRow = {
            id: crypto.randomUUID(),
            tipo: "",
            item_id: "",
            item_nombre: "",
            cantidad: 1,
            precio: 0,
            extras: [],
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

    // Extras management functions
    const addExtraToRow = (rowId: string) => {
        const { tipo, ingrediente_id, descripcion, precio, cantidad } = extraForm;

        if (tipo === "ingrediente" && !ingrediente_id) {
            toast.error("Seleccione un ingrediente");
            return;
        }
        if (tipo === "custom" && !descripcion.trim()) {
            toast.error("Ingrese una descripción");
            return;
        }
        if (precio <= 0) {
            toast.error("El precio debe ser mayor a 0");
            return;
        }

        const ingrediente = ingredientes.find((i) => i.id === ingrediente_id);
        const newExtra: ItemExtra = {
            id: crypto.randomUUID(),
            tipo,
            ingrediente_id: tipo === "ingrediente" ? ingrediente_id : undefined,
            ingrediente_nombre: tipo === "ingrediente" ? ingrediente?.nombre : undefined,
            descripcion: tipo === "custom" ? descripcion : undefined,
            precio,
            cantidad,
        };

        setRows((prev) =>
            prev.map((row) => {
                if (row.id === rowId) {
                    return { ...row, extras: [...row.extras, newExtra] };
                }
                return row;
            })
        );

        // Reset form
        setExtraForm({
            tipo: "ingrediente",
            ingrediente_id: "",
            descripcion: "",
            precio: 0,
            cantidad: 1,
        });

        toast.success("Extra agregado");
    };

    const removeExtraFromRow = (rowId: string, extraId: string) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id === rowId) {
                    return { ...row, extras: row.extras.filter((e) => e.id !== extraId) };
                }
                return row;
            })
        );
        toast.success("Extra eliminado");
    };

    const handleKeyDown = (
        e: KeyboardEvent,
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

    const handleSubmitTransaction = async (values: TransaccionFormValues) => {
        const validRows = rows.filter((row) => row.item_id && row.cantidad > 0);

        if (validRows.length === 0) {
            toast.error("Agregue al menos un item al pedido");
            return;
        }

        const transaccionDto: CreateTransaccionDto = {
            nro_reg: nextNroReg,
            concepto: values.concepto,
            mesa: values.mesa || undefined,
            cliente: values.cliente || undefined,
            estado: values.estado,
            caja_id: cajaActual || undefined,
        };

        const itemsDto: AddItemDto[] = validRows.map((row) => ({
            producto_id: row.tipo === "producto" ? row.item_id : undefined,
            plato_id: row.tipo === "plato" ? row.item_id : undefined,
            cantidad: row.cantidad,
            notas: row.notas || undefined,
        }));

        let pagoDto: CreatePagoDto | undefined;
        if (showPayment && montoPago > 0) {
            pagoDto = {
                metodo_pago: metodoPago,
                monto: montoPago,
                monto_recibido: metodoPago === "efectivo" ? montoRecibido : undefined,
                referencia_qr: metodoPago === "qr" ? referenciaQr : undefined,
            };
        }

        try {
            setSubmitting(true);
            await onSubmit(transaccionDto, itemsDto, pagoDto);
            toast.success("Transacción creada exitosamente");
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear transacción");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        form.reset();
        setRows([
            {
                id: crypto.randomUUID(),
                tipo: "",
                item_id: "",
                item_nombre: "",
                cantidad: 1,
                precio: 0,
                extras: [],
                notas: "",
                subtotal: 0,
            },
        ]);
        setShowPayment(false);
        setMontoPago(0);
        setMontoRecibido(0);
        setReferenciaQr("");
    };

    const total = rows.reduce((sum, row) => sum + row.subtotal, 0);
    const validItemCount = rows.filter((row) => row.item_id).length;
    const cambio = metodoPago === "efectivo" ? Math.max(0, montoRecibido - montoPago) : 0;

    // Auto-set payment amount to total
    useEffect(() => {
        if (showPayment && montoPago === 0) {
            setMontoPago(total);
            setMontoRecibido(total);
        }
    }, [showPayment, total]);

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[95vw] max-h-[95vh]">
                    <div className="text-center py-8">Cargando...</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[54vw]">

                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-2xl flex items-center justify-between">

                        <span>

                            Nueva Transacción #{nextNroReg}</span>
                        <Badge variant="outline">Caja #{cajaActual}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Transaction Header Form */}
                    <Form {...form}>
                        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="mesa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mesa/Ubicación</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Mesa 1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cliente"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del cliente" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="concepto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Concepto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Pedido" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>

                    <Separator />

                    {/* Items Table */}
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
                                        <TableHead className="w-[120px]">Precio Unit.</TableHead>
                                        <TableHead className="w-[120px]">Subtotal</TableHead>
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
                                                <Select
                                                    value={row.item_id}
                                                    onValueChange={(value) => selectItem(row.id, value)}
                                                >
                                                    <SelectTrigger
                                                        className={cn(row.item_id && "font-medium")}
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
                                                                    <Utensils className="h-4 w-4 text-orange-600" />
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
                                                                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                                                                    {producto.nombre} - Bs{" "}
                                                                    {Number(producto.precio).toFixed(2)}
                                                                </div>
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
                                                        updateRow(row.id, {
                                                            cantidad: parseFloat(e.target.value) || 0,
                                                        })
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(e, row.id, index, "cantidad")
                                                    }
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
                                                                <Sparkles className="h-4 w-4 text-yellow-600" />
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
                                                                <Select
                                                                    value={extraForm.tipo}
                                                                    onValueChange={(v: "ingrediente" | "custom") =>
                                                                        setExtraForm({
                                                                            ...extraForm,
                                                                            tipo: v,
                                                                            ingrediente_id: "",
                                                                            descripcion: "",
                                                                        })
                                                                    }
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="ingrediente">
                                                                            Ingrediente
                                                                        </SelectItem>
                                                                        <SelectItem value="custom">
                                                                            Personalizado
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>

                                                                {extraForm.tipo === "ingrediente" ? (
                                                                    <Select
                                                                        value={extraForm.ingrediente_id}
                                                                        onValueChange={(v) =>
                                                                            setExtraForm({
                                                                                ...extraForm,
                                                                                ingrediente_id: v,
                                                                            })
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-8 text-xs">
                                                                            <SelectValue placeholder="Seleccionar..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {ingredientes.map((ing) => (
                                                                                <SelectItem
                                                                                    key={ing.id}
                                                                                    value={ing.id}
                                                                                >
                                                                                    {ing.nombre}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <Input
                                                                        placeholder="Descripción"
                                                                        value={extraForm.descripcion}
                                                                        onChange={(e) =>
                                                                            setExtraForm({
                                                                                ...extraForm,
                                                                                descripcion: e.target.value,
                                                                            })
                                                                        }
                                                                        className="h-8 text-xs"
                                                                    />
                                                                )}

                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Precio"
                                                                        step="0.01"
                                                                        min="0"
                                                                        value={extraForm.precio || ""}
                                                                        onChange={(e) =>
                                                                            setExtraForm({
                                                                                ...extraForm,
                                                                                precio:
                                                                                    parseFloat(e.target.value) || 0,
                                                                            })
                                                                        }
                                                                        className="h-8 text-xs"
                                                                    />
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Cant"
                                                                        step="0.01"
                                                                        min="0.01"
                                                                        value={extraForm.cantidad}
                                                                        onChange={(e) =>
                                                                            setExtraForm({
                                                                                ...extraForm,
                                                                                cantidad:
                                                                                    parseFloat(e.target.value) || 1,
                                                                            })
                                                                        }
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
                                                        notasInputRefs.current[row.id] = el;
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

                    <Separator />

                    {/* Totals and Payment */}
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Items:</span>
                                <span className="font-medium">{validItemCount}</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Total:</span>
                                <span className="text-2xl">Bs {total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="space-y-3">
                            <Button
                                variant={showPayment ? "secondary" : "outline"}
                                onClick={() => setShowPayment(!showPayment)}
                                className="w-full"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                {showPayment ? "Ocultar Pago" : "Procesar Pago Ahora"}
                            </Button>

                            {showPayment && (
                                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Método de Pago</label>
                                            <Select
                                                value={metodoPago}
                                                onValueChange={(v: "efectivo" | "qr") =>
                                                    setMetodoPago(v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                                                    <SelectItem value="qr">📱 QR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Monto a Pagar</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={montoPago}
                                                onChange={(e) =>
                                                    setMontoPago(parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </div>
                                    </div>

                                    {metodoPago === "efectivo" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Monto Recibido
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={montoRecibido}
                                                    onChange={(e) =>
                                                        setMontoRecibido(parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Cambio</label>
                                                <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center font-semibold">
                                                    Bs {cambio.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {metodoPago === "qr" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Referencia QR</label>
                                            <Input
                                                placeholder="Código de referencia"
                                                value={referenciaQr}
                                                onChange={(e) => setReferenciaQr(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t px-6 py-4 flex gap-2 justify-end bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button
                        onClick={form.handleSubmit(handleSubmitTransaction)}
                        disabled={validItemCount === 0 || submitting}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {submitting
                            ? "Guardando..."
                            : showPayment
                                ? "Guardar y Pagar"
                                : "Guardar Pedido"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
