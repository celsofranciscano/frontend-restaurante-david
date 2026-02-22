import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { transaccionesService } from "../services/transacciones.service";
import { cajaService } from "@/modules/caja/services/caja.service";
import type {
    Transaccion,
    CreateTransaccionDto,
    Pago,
    CreatePagoDto,
    AddItemDto,
    AddExtraDto,
    DetalleItemExtra,
} from "../types/transaccion.types";

export function useTransaccionesPage() {
    // Data States
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);
    const [pedidosCocina, setPedidosCocina] = useState<Transaccion[]>([]);
    const [loadingCocina, setLoadingCocina] = useState(false);
    const [cajaAbiertaId, setCajaAbiertaId] = useState<number | null>(null);
    const [pagos, setPagos] = useState<Pago[]>([]);

    // UI States
    const [activeTab, setActiveTab] = useState<string>("todos");
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Dialog States
    const [unifiedViewOpen, setUnifiedViewOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [extrasDialogOpen, setExtrasDialogOpen] = useState(false);

    // Selection States
    const [payingTransaccion, setPayingTransaccion] = useState<Transaccion | null>(null);
    const [viewingTransaccion, setViewingTransaccion] = useState<Transaccion | null>(null);
    const [currentItemForExtras, setCurrentItemForExtras] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [itemExtras, setItemExtras] = useState<DetalleItemExtra[]>([]);

    // Data Fetching
    const fetchTransacciones = useCallback(async () => {
        try {
            setLoading(true);
            const caja = await cajaService.obtenerCajaAbierta();

            if (caja) {
                setCajaAbiertaId(caja.id);
                const data = await transaccionesService.getByCaja(caja.id);
                setTransacciones(data);
            } else {
                setCajaAbiertaId(null);
                setTransacciones([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar transacciones");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPedidosCocina = useCallback(async () => {
        try {
            setLoadingCocina(true);
            const data = await transaccionesService.getPendientesCocina();
            setPedidosCocina(data);
        } catch (error) {
            console.error("Error al cargar pedidos de cocina:", error);
        } finally {
            setLoadingCocina(false);
        }
    }, []);

    // Effects
    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            if (mounted) await fetchTransacciones();
        };
        loadData();
        return () => { mounted = false; };
    }, [fetchTransacciones]);

    useEffect(() => {
        let mounted = true;
        const loadCocina = async () => {
            if (activeTab === "cocina" && mounted) {
                await fetchPedidosCocina();
            }
        };
        loadCocina();
        return () => { mounted = false; };
    }, [activeTab, fetchPedidosCocina]);

    // Handlers
    const handleCreate = () => setUnifiedViewOpen(true);

    const handleView = (transaccion: Transaccion) => {
        setViewingTransaccion(transaccion);
        setOrderDetailsOpen(true);
    };

    const handleEdit = (transaccion: Transaccion) => handleView(transaccion);

    const handleDelete = async (id: number) => {
        try {
            await transaccionesService.delete(id);
            toast.success("Transacción eliminada correctamente");
            fetchTransacciones();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar transacción");
        }
    };

    const handleUnifiedSubmit = async (
        transaccion: CreateTransaccionDto,
        items: AddItemDto[],
        pago?: CreatePagoDto
    ) => {
        try {
            const created = await transaccionesService.create(transaccion);
            for (const item of items) {
                await transaccionesService.addItem(created.id, item);
            }

            if (pago) {
                await transaccionesService.addPago(created.id, pago);
                const cambio = (pago.monto_recibido || 0) - pago.monto;
                if (pago.metodo_pago === "efectivo" && cambio > 0) {
                    toast.success(`Transacción creada y pagada. Cambio: Bs ${cambio.toFixed(2)}`);
                } else {
                    toast.success("Transacción creada y pagada correctamente");
                }
            } else {
                toast.success("Transacción creada correctamente");
            }
            fetchTransacciones();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handlePay = async (transaccion: Transaccion) => {
        try {
            setPayingTransaccion(transaccion);
            const pagosData = await transaccionesService.getPagos(transaccion.id);
            setPagos(pagosData);
            setPaymentDialogOpen(true);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar información de pagos");
        }
    };

    const handlePaymentSubmit = async (values: CreatePagoDto) => {
        if (!payingTransaccion) return;
        try {
            await transaccionesService.addPago(payingTransaccion.id, values);
            const cambio = (values.monto_recibido || 0) - values.monto;

            if (values.metodo_pago === "efectivo" && cambio > 0) {
                toast.success(`Pago registrado. Cambio: Bs ${cambio.toFixed(2)}`);
            } else {
                toast.success("Pago registrado correctamente");
            }

            fetchTransacciones();
            setPaymentDialogOpen(false);

            if (viewingTransaccion?.id === payingTransaccion.id) {
                const updated = await transaccionesService.getOne(payingTransaccion.id);
                setViewingTransaccion(updated);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar pago");
        }
    };

    const handleAddItem = () => setAddItemDialogOpen(true);

    const handleAddItemSubmit = async (dto: AddItemDto) => {
        if (!viewingTransaccion) return;
        try {
            await transaccionesService.addItem(viewingTransaccion.id, dto);
            toast.success("Item agregado correctamente");
            const updated = await transaccionesService.getOne(viewingTransaccion.id);
            setViewingTransaccion(updated);
            fetchTransacciones();
        } catch (error) {
            console.error(error);
            toast.error("Error al agregar item");
        }
    };

    const handleManageExtras = async (itemId: number, itemName: string) => {
        if (!viewingTransaccion) return;
        try {
            const extras = await transaccionesService.getExtras(viewingTransaccion.id, itemId);
            setItemExtras(extras);
            setCurrentItemForExtras({ id: itemId, name: itemName });
            setExtrasDialogOpen(true);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar extras");
        }
    };

    const handleAddExtra = async (dto: AddExtraDto) => {
        if (!viewingTransaccion || !currentItemForExtras) return;
        try {
            await transaccionesService.addExtra(viewingTransaccion.id, currentItemForExtras.id, dto);
            toast.success("Extra agregado correctamente");
            const extras = await transaccionesService.getExtras(viewingTransaccion.id, currentItemForExtras.id);
            setItemExtras(extras);
            const updated = await transaccionesService.getOne(viewingTransaccion.id);
            setViewingTransaccion(updated);
            fetchTransacciones();
        } catch (error) {
            console.error(error);
            toast.error("Error al agregar extra");
        }
    };

    const handleRemoveExtra = async (extraId: number) => {
        if (!viewingTransaccion || !currentItemForExtras) return;
        try {
            await transaccionesService.removeExtra(viewingTransaccion.id, currentItemForExtras.id, extraId);
            toast.success("Extra eliminado correctamente");
            const extras = await transaccionesService.getExtras(viewingTransaccion.id, currentItemForExtras.id);
            setItemExtras(extras);
            const updated = await transaccionesService.getOne(viewingTransaccion.id);
            setViewingTransaccion(updated);
            fetchTransacciones();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar extra");
        }
    };

    const handlePayFromDetails = () => {
        if (viewingTransaccion) {
            setOrderDetailsOpen(false);
            handlePay(viewingTransaccion);
        }
    };

    const handleCompletarOrden = async (id: number) => {
        if (processingId !== null) return;
        try {
            setProcessingId(id);
            await transaccionesService.completarOrdenCocina(id);
            toast.success("Pedido marcado como terminado");
            setPedidosCocina((prev) => prev.filter((p) => p.id !== id));
            fetchTransacciones();
        } catch (error) {
            console.error("Error al completar pedido:", error);
            toast.error("Error al completar el pedido");
        } finally {
            setProcessingId(null);
        }
    };

    // Computed
    const nextNroReg = transacciones.length > 0
        ? Math.max(...transacciones.map((t) => t.nro_reg)) + 1
        : 1;

    const filteredTransacciones = (estado: string) => {
        if (estado === "todos") return transacciones;
        if (estado === "pendiente") return transacciones.filter((t) => t.estado === "pendiente" || t.estado_cocina === "pendiente");
        if (estado === "abierto") return transacciones.filter((t) => t.estado === "abierto" && t.estado_cocina !== "pendiente");
        return transacciones.filter((t) => t.estado === estado);
    };

    const counts = {
        todos: transacciones.length,
        pendiente: transacciones.filter((t) => t.estado === "pendiente" || t.estado_cocina === "pendiente").length,
        abierto: transacciones.filter((t) => t.estado === "abierto" && t.estado_cocina !== "pendiente").length,
        cerrado: transacciones.filter((t) => t.estado === "cerrado").length,
        cocina: pedidosCocina.length,
    };

    return {
        // State
        transacciones,
        loading,
        pedidosCocina,
        loadingCocina,
        cajaAbiertaId,
        pagos,
        activeTab,
        setActiveTab,
        processingId,

        // Dialogs
        unifiedViewOpen, setUnifiedViewOpen,
        paymentDialogOpen, setPaymentDialogOpen,
        orderDetailsOpen, setOrderDetailsOpen,
        addItemDialogOpen, setAddItemDialogOpen,
        extrasDialogOpen, setExtrasDialogOpen,

        // Selection
        payingTransaccion,
        viewingTransaccion,
        currentItemForExtras,
        itemExtras,

        // Actions
        fetchTransacciones,
        handleCreate,
        handleView,
        handleEdit,
        handleDelete,
        handleUnifiedSubmit,
        handlePay,
        handlePaymentSubmit,
        handleAddItem,
        handleAddItemSubmit,
        handleManageExtras,
        handleAddExtra,
        handleRemoveExtra,
        handlePayFromDetails,
        handleCompletarOrden,

        // Helpers
        nextNroReg,
        filteredTransacciones,
        counts,
    };
}
