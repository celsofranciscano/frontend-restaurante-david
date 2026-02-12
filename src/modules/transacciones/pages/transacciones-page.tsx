import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CheckCircle, RefreshCw, Timer, ChefHat, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";
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
import { TransaccionesTable } from "../components/transacciones-table";
import { UnifiedTransactionView } from "../components/unified-transaction-view";
import { PaymentDialog } from "../components/payment-dialog";
import { OrderDetailsDialog } from "../components/order-details-dialog";
import { AddItemDialog } from "../components/add-item-dialog";
import { ManageExtrasDialog } from "../components/manage-extras-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TransaccionesPage() {
    const navigate = useNavigate();
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);
    const [pedidosCocina, setPedidosCocina] = useState<Transaccion[]>([]);
    const [loadingCocina, setLoadingCocina] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Dialog states
    const [unifiedViewOpen, setUnifiedViewOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [extrasDialogOpen, setExtrasDialogOpen] = useState(false);

    // Current entities
    const [payingTransaccion, setPayingTransaccion] = useState<Transaccion | null>(null);
    const [viewingTransaccion, setViewingTransaccion] = useState<Transaccion | null>(null);
    const [currentItemForExtras, setCurrentItemForExtras] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [itemExtras, setItemExtras] = useState<DetalleItemExtra[]>([]);

    const [pagos, setPagos] = useState<Pago[]>([]);
    const [activeTab, setActiveTab] = useState<string>("todos");

    const [cajaAbiertaId, setCajaAbiertaId] = useState<number | null>(null);

    const fetchTransacciones = useCallback(async () => {
        try {
            setLoading(true);
            // 1. Obtener caja actual
            const caja = await cajaService.obtenerCajaAbierta();

            if (caja) {
                setCajaAbiertaId(caja.id);
                // 2. Si hay caja, obtener transacciones de esa caja
                const data = await transaccionesService.getByCaja(caja.id);
                setTransacciones(data);
            } else {
                setCajaAbiertaId(null);
                setTransacciones([]); // No hay caja, no mostrar transacciones activas
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
            // Silenciar error si es problema de red/cancelación
        } finally {
            setLoadingCocina(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            if (mounted) {
                await fetchTransacciones();
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [fetchTransacciones]);

    useEffect(() => {
        let mounted = true;

        const loadCocina = async () => {
            if (activeTab === "cocina" && mounted) {
                await fetchPedidosCocina();
            }
        };

        loadCocina();

        return () => {
            mounted = false;
        };
    }, [activeTab, fetchPedidosCocina]);

    const handleCreate = () => {
        setUnifiedViewOpen(true);
    };

    const handleEdit = (transaccion: Transaccion) => {
        // For now, editing still uses the order details dialog
        setViewingTransaccion(transaccion);
        setOrderDetailsOpen(true);
    };

    const handleView = (transaccion: Transaccion) => {
        setViewingTransaccion(transaccion);
        setOrderDetailsOpen(true);
    };

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
            // Create transaction
            const created = await transaccionesService.create(transaccion);

            // Add all items
            for (const item of items) {
                await transaccionesService.addItem(created.id, item);
            }

            // Process payment if provided
            if (pago) {
                await transaccionesService.addPago(created.id, pago);

                if (pago.metodo_pago === "efectivo" && pago.monto_recibido) {
                    const cambio = pago.monto_recibido - pago.monto;
                    if (cambio > 0) {
                        toast.success(
                            `Transacción creada y pagada. Cambio: Bs ${cambio.toFixed(2)}`,
                            { duration: 5000 }
                        );
                    } else {
                        toast.success("Transacción creada y pagada correctamente");
                    }
                } else {
                    toast.success("Transacción creada y pagada correctamente");
                }
            } else {
                toast.success("Transacción creada correctamente");
            }

            fetchTransacciones();
        } catch (error) {
            console.error(error);
            throw error; // Re-throw to let the component handle it
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

            if (values.metodo_pago === "efectivo" && values.monto_recibido) {
                const cambio = values.monto_recibido - values.monto;
                if (cambio > 0) {
                    toast.success(
                        `Pago registrado. Cambio: Bs ${cambio.toFixed(2)}`,
                        { duration: 5000 }
                    );
                } else {
                    toast.success("Pago registrado correctamente");
                }
            } else {
                toast.success("Pago registrado correctamente");
            }

            fetchTransacciones();
            setPaymentDialogOpen(false);

            // If we're viewing the order details, refresh it
            if (viewingTransaccion?.id === payingTransaccion.id) {
                const updated = await transaccionesService.getOne(payingTransaccion.id);
                setViewingTransaccion(updated);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar pago");
        }
    };

    const handleAddItem = () => {
        setAddItemDialogOpen(true);
    };

    const handleAddItemSubmit = async (dto: AddItemDto) => {
        if (!viewingTransaccion) return;

        try {
            await transaccionesService.addItem(viewingTransaccion.id, dto);
            toast.success("Item agregado correctamente");

            // Refresh transaction
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
            await transaccionesService.addExtra(
                viewingTransaccion.id,
                currentItemForExtras.id,
                dto
            );
            toast.success("Extra agregado correctamente");

            // Refresh extras
            const extras = await transaccionesService.getExtras(
                viewingTransaccion.id,
                currentItemForExtras.id
            );
            setItemExtras(extras);

            // Refresh transaction
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
            await transaccionesService.removeExtra(
                viewingTransaccion.id,
                currentItemForExtras.id,
                extraId
            );
            toast.success("Extra eliminado correctamente");

            // Refresh extras
            const extras = await transaccionesService.getExtras(
                viewingTransaccion.id,
                currentItemForExtras.id
            );
            setItemExtras(extras);

            // Refresh transaction
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
        if (processingId !== null) return; // Evitar múltiples clicks

        try {
            setProcessingId(id);
            await transaccionesService.completarOrdenCocina(id);
            toast.success("Pedido marcado como terminado");
            // Actualizar lista eliminando el pedido completado
            setPedidosCocina((prev) => prev.filter((p) => p.id !== id));
            // Refresh transacciones para actualizar estado
            fetchTransacciones();
        } catch (error) {
            console.error("Error al completar pedido:", error);
            toast.error("Error al completar el pedido");
        } finally {
            setProcessingId(null);
        }
    };

    const calculateElapsedMinutes = (fechaStr?: string, horaStr?: string) => {
        if (!fechaStr || !horaStr) return 0;
        try {
            let fechaHora: Date;

            if (horaStr.includes(' - ')) {
                const [hora, fecha] = horaStr.split(' - ');
                const [horas, minutos] = hora.split(':');
                const [dia, mes, anio] = fecha.split('/');
                fechaHora = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia), parseInt(horas), parseInt(minutos));
            } else {
                fechaHora = new Date(horaStr);
            }

            const now = new Date();
            const diffMs = now.getTime() - fechaHora.getTime();
            return Math.floor(diffMs / 60000);
        } catch (e) {
            console.error('Error calculando tiempo transcurrido:', e);
            return 0;
        }
    };

    // Calculate next nro_reg
    const nextNroReg = transacciones.length > 0
        ? Math.max(...transacciones.map((t) => t.nro_reg)) + 1
        : 1;

    // Filter transacciones by estado (usa el campo de la BD directamente)
    const filteredTransacciones = (estado: string) => {
        if (estado === "todos") return transacciones;
        return transacciones.filter((t) => t.estado === estado);
    };

    // Count by status (usa el campo de la BD directamente)
    const counts = {
        todos: transacciones.length,
        pendiente: transacciones.filter((t) => t.estado === "pendiente").length,
        abierto: transacciones.filter((t) => t.estado === "abierto").length,
        cerrado: transacciones.filter((t) => t.estado === "cerrado").length,
        cocina: pedidosCocina.length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Transacciones (POS)</h2>
                        <p className="text-muted-foreground">
                            Sistema de punto de venta - Gestiona pedidos, items y pagos.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/transacciones/historial")}>
                            <History className="mr-2 h-4 w-4" /> Historial
                        </Button>
                        <Button onClick={handleCreate} disabled={!cajaAbiertaId}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Transacción
                        </Button>
                    </div>
                </div>

                {!cajaAbiertaId && !loading && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 dark:bg-yellow-900/10">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                    No hay una caja abierta. Debe abrir una caja para registrar nuevas ventas.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Transacciones</CardTitle>
                        <CardDescription>
                            Pedidos y órdenes del restaurante organizados por estado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList variant="line" className="w-full justify-start border-b">
                                <TabsTrigger value="todos">
                                    Todos ({counts.todos})
                                </TabsTrigger>
                                <TabsTrigger value="pendiente">
                                    Pendientes ({counts.pendiente})
                                </TabsTrigger>
                                <TabsTrigger value="abierto">
                                    Abiertos ({counts.abierto})
                                </TabsTrigger>
                                <TabsTrigger value="cerrado">
                                    Cerrados ({counts.cerrado})
                                </TabsTrigger>
                                <TabsTrigger value="cocina">
                                    <ChefHat className="h-4 w-4 mr-2" />
                                    Cocina ({counts.cocina})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="todos" className="mt-6">
                                {loading ? (
                                    <div className="text-center py-8">Cargando transacciones...</div>
                                ) : (
                                    <TransaccionesTable
                                        transacciones={filteredTransacciones("todos")}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onPay={handlePay}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="pendiente" className="mt-6">
                                {loading ? (
                                    <div className="text-center py-8">Cargando transacciones...</div>
                                ) : (
                                    <TransaccionesTable
                                        transacciones={filteredTransacciones("pendiente")}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onPay={handlePay}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="abierto" className="mt-6">
                                {loading ? (
                                    <div className="text-center py-8">Cargando transacciones...</div>
                                ) : (
                                    <TransaccionesTable
                                        transacciones={filteredTransacciones("abierto")}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onPay={handlePay}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="cerrado" className="mt-6">
                                {loading ? (
                                    <div className="text-center py-8">Cargando transacciones...</div>
                                ) : (
                                    <TransaccionesTable
                                        transacciones={filteredTransacciones("cerrado")}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onPay={handlePay}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="cocina" className="mt-6">
                                {loadingCocina ? (
                                    <div className="text-center py-8">Cargando pedidos de cocina...</div>
                                ) : pedidosCocina.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                        <h3 className="text-lg font-medium">No hay pedidos pendientes en cocina</h3>
                                        <p>Los nuevos pedidos aparecerán aquí automáticamente.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Hora</TableHead>
                                                    <TableHead className="w-[80px] text-center"># Items</TableHead>
                                                    <TableHead className="w-[150px]">Mesa/Para</TableHead>
                                                    <TableHead className="w-[80px]">Nro</TableHead>
                                                    <TableHead>Detalle del Pedido</TableHead>
                                                    <TableHead className="w-[120px] text-right">Acción</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pedidosCocina.map((pedido) => {
                                                    const minutosTranscurridos = calculateElapsedMinutes(pedido.fecha, pedido.hora);
                                                    const esTardado = minutosTranscurridos > 20;

                                                    return (
                                                        <TableRow
                                                            key={pedido.id}
                                                            className={cn(
                                                                esTardado ? "bg-red-50/50 hover:bg-red-50" : ""
                                                            )}
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex flex-col">
                                                                    <span>
                                                                        {pedido.hora ? pedido.hora.split(' - ')[0] : "--:--"}
                                                                    </span>
                                                                    <Badge
                                                                        variant={esTardado ? "destructive" : "secondary"}
                                                                        className="w-fit mt-1 text-[10px] px-1 py-0 h-5"
                                                                    >
                                                                        <Timer className="h-3 w-3 mr-1" />
                                                                        {minutosTranscurridos} min
                                                                    </Badge>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-lg">
                                                                {pedido.items?.length || 0}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-semibold text-lg">
                                                                    {pedido.mesa || "Sin mesa"}
                                                                </div>
                                                                {pedido.cliente && (
                                                                    <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                                        {pedido.cliente}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-muted-foreground">
                                                                #{pedido.nro_reg}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="space-y-2 py-1">
                                                                    {pedido.items?.map((item) => (
                                                                        <div key={item.id} className="flex flex-col border-b last:border-0 pb-2 last:pb-0 border-dashed border-gray-200">
                                                                            <div className="flex items-baseline gap-2">
                                                                                <span className="font-bold text-lg min-w-[30px]">
                                                                                    {Math.floor(parseFloat(item.cantidad))}x
                                                                                </span>
                                                                                <span className="font-medium text-base">
                                                                                    {item.nombre || "Item desconocido"}
                                                                                </span>
                                                                            </div>

                                                                            {item.notas && (
                                                                                <div className="text-sm text-red-600 font-medium ml-[38px] bg-red-50 p-1 rounded w-fit px-2">
                                                                                    ⚠️ {item.notas}
                                                                                </div>
                                                                            )}

                                                                            {item.extras && item.extras.length > 0 && (
                                                                                <div className="ml-[38px] text-sm text-green-700 space-y-0.5 mt-1">
                                                                                    {item.extras.map((extra) => (
                                                                                        <div key={extra.id} className="flex items-center gap-1">
                                                                                            <span className="font-bold">+</span>
                                                                                            {extra.nombre || "Extra"}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right align-middle">
                                                                <Button
                                                                    onClick={() => handleCompletarOrden(pedido.id)}
                                                                    disabled={processingId === pedido.id}
                                                                    className={cn(
                                                                        "w-full font-bold transition-all",
                                                                        processingId === pedido.id
                                                                            ? "opacity-50 cursor-not-allowed"
                                                                            : "hover:scale-105 active:scale-95 shadow-md"
                                                                    )}
                                                                    variant="default"
                                                                    size="lg"
                                                                >
                                                                    {processingId === pedido.id ? (
                                                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="h-5 w-5 mr-2" />
                                                                            Terminar
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Dialogs */}
                <UnifiedTransactionView
                    open={unifiedViewOpen}
                    onOpenChange={setUnifiedViewOpen}
                    onSubmit={handleUnifiedSubmit}
                    nextNroReg={nextNroReg}
                />

                <OrderDetailsDialog
                    open={orderDetailsOpen}
                    onOpenChange={setOrderDetailsOpen}
                    transaccion={viewingTransaccion}
                    onUpdate={fetchTransacciones}
                    onAddItem={handleAddItem}
                    onPay={handlePayFromDetails}
                    onManageExtras={handleManageExtras}
                />

                <AddItemDialog
                    open={addItemDialogOpen}
                    onOpenChange={setAddItemDialogOpen}
                    onSubmit={handleAddItemSubmit}
                />

                <ManageExtrasDialog
                    open={extrasDialogOpen}
                    onOpenChange={setExtrasDialogOpen}
                    itemId={currentItemForExtras?.id || null}
                    itemName={currentItemForExtras?.name || ""}
                    extras={itemExtras}
                    onAddExtra={handleAddExtra}
                    onRemoveExtra={handleRemoveExtra}
                />

                <PaymentDialog
                    open={paymentDialogOpen}
                    onOpenChange={setPaymentDialogOpen}
                    transaccion={payingTransaccion}
                    pagos={pagos}
                    onSubmit={handlePaymentSubmit}
                />
            </div>
        </DashboardLayout>
    );
}
