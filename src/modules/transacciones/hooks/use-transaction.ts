import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { productosService } from "@/modules/productos/services/productos.service";
import { platosService } from "@/modules/platos/services/platos.service";
import { cajaService } from "@/modules/caja/services/caja.service";
import type { Producto } from "@/modules/productos/types/producto.types";
import type { Plato } from "@/modules/platos/types/plato.types";
import type {
    CreateTransaccionDto,
    AddItemDto,
    CreatePagoDto,
    ItemRow,
    ItemExtra,
    TransaccionFormValues
} from "../types/transaccion.types";

const transaccionSchema = z.object({
    concepto: z.string().min(1, "El concepto es requerido"),
    mesa: z.string().optional(),
    cliente: z.string().optional(),
    estado: z.enum(["pendiente", "abierto", "cerrado"]),
});

interface UseTransactionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (transaccion: CreateTransaccionDto, items: AddItemDto[], pago?: CreatePagoDto) => Promise<void>;
    nextNroReg: number;
}

export function useTransaction({
    open,
    onOpenChange,
    onSubmit,
    nextNroReg,
}: UseTransactionProps) {
    // Data
    const [productos, setProductos] = useState<Producto[]>([]);
    const [platos, setPlatos] = useState<Plato[]>([]);
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
        precio: string;
    }>({
        precio: "",
    });

    // Payment
    const [showPayment, setShowPayment] = useState(false);
    const [metodoPago, setMetodoPago] = useState<"efectivo" | "qr">("efectivo");
    const [montoPago, setMontoPago] = useState<number>(0);
    const [montoRecibido, setMontoRecibido] = useState<number>(0);

    const [mesaOpen, setMesaOpen] = useState(false);

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
            const [productosData, platosData] = await Promise.all([
                productosService.getAll(),
                platosService.getAll(),
            ]);
            setProductos(productosData);
            setPlatos(platosData);
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

    const calculateSubtotal = (cantidad: number, precio: number, extras: ItemExtra[]) => {
        const extrasTotal = extras.reduce((sum, extra) => sum + (extra.precio * extra.cantidad), 0);
        return (precio + extrasTotal) * cantidad;
    };

    const updateRow = (id: string, updates: Partial<ItemRow>) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id === id) {
                    const updated = { ...row, ...updates };
                    updated.subtotal = calculateSubtotal(updated.cantidad, updated.precio, updated.extras);
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
        const precio = parseFloat(extraForm.precio);

        if (isNaN(precio) || precio <= 0) {
            toast.error("El precio debe ser mayor a 0");
            return;
        }

        const newExtra: ItemExtra = {
            id: crypto.randomUUID(),
            tipo: "custom",
            descripcion: "Extra",
            precio,
            cantidad: 1,
        };

        setRows((prev) =>
            prev.map((row) => {
                if (row.id === rowId) {
                    const updatedExtras = [...row.extras, newExtra];
                    const subtotal = calculateSubtotal(row.cantidad, row.precio, updatedExtras);
                    return { ...row, extras: updatedExtras, subtotal };
                }
                return row;
            })
        );

        // Reset form
        setExtraForm({
            precio: "",
        });

        toast.success("Extra agregado");
    };

    const removeExtraFromRow = (rowId: string, extraId: string) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id === rowId) {
                    const updatedExtras = row.extras.filter((e) => e.id !== extraId);
                    const subtotal = calculateSubtotal(row.cantidad, row.precio, updatedExtras);
                    return { ...row, extras: updatedExtras, subtotal };
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
            extras: row.extras.map(e => ({
                descripcion: e.descripcion,
                precio: e.precio,
                cantidad: e.cantidad,
                ingrediente_id: e.ingrediente_id
            }))
        }));

        let pagoDto: CreatePagoDto | undefined;
        if (showPayment && montoPago > 0) {
            pagoDto = {
                metodo_pago: metodoPago,
                monto: montoPago,
                monto_recibido: metodoPago === "efectivo" ? montoRecibido : undefined,
                referencia_qr: undefined,
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

    const ubicacion = ["Mesa", "Para llevar", "Auto", "Sala"];
    const total = rows.reduce((sum, row) => sum + row.subtotal, 0);
    const validItemCount = rows.filter((row) => row.item_id).length;
    const cambio = metodoPago === "efectivo" ? Math.max(0, montoRecibido - montoPago) : 0;

    return {
        // Data
        productos,
        platos,
        cajaActual,
        loading,
        submitting,

        // State
        rows,
        extrasPopoverOpen,
        setExtrasPopoverOpen,
        extraForm,
        setExtraForm,
        showPayment,
        setShowPayment,
        metodoPago,
        setMetodoPago,
        montoPago,
        setMontoPago,
        montoRecibido,
        setMontoRecibido,
        mesaOpen,
        setMesaOpen,

        // Refs
        cantidadInputRefs,
        notasInputRefs,

        // Form
        form,

        // Actions
        updateRow,
        selectItem,
        addNewRow,
        removeRow,
        addExtraToRow,
        removeExtraFromRow,
        handleKeyDown,
        handleSubmitTransaction,

        // Computed
        total,
        validItemCount,
        cambio,
        ubicacion,
    };
}
