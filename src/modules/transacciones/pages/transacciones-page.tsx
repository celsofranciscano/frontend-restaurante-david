import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type {
    Transaccion,
    CreateTransaccionDto,
    UpdateTransaccionDto,
    Pago,
    CreatePagoDto,
    AddItemDto,
    AddExtraDto,
    DetalleItemExtra,
} from "../types/transaccion.types";
import { TransaccionesTable } from "../components/transacciones-table";
import { TransaccionDialog } from "../components/transaccion-dialog";
import { PaymentDialog } from "../components/payment-dialog";
import { OrderDetailsDialog } from "../components/order-details-dialog";
import { AddItemDialog } from "../components/add-item-dialog";
import { ManageExtrasDialog } from "../components/manage-extras-dialog";
import { toast } from "sonner";

export function TransaccionesPage() {
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [extrasDialogOpen, setExtrasDialogOpen] = useState(false);

    // Current entities
    const [editingTransaccion, setEditingTransaccion] = useState<Transaccion | null>(null);
    const [payingTransaccion, setPayingTransaccion] = useState<Transaccion | null>(null);
    const [viewingTransaccion, setViewingTransaccion] = useState<Transaccion | null>(null);
    const [currentItemForExtras, setCurrentItemForExtras] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [itemExtras, setItemExtras] = useState<DetalleItemExtra[]>([]);

    const [pagos, setPagos] = useState<Pago[]>([]);
    const [activeTab, setActiveTab] = useState<string>("todos");

    const fetchTransacciones = async () => {
        try {
            setLoading(true);
            const data = await transaccionesService.getAll();
            setTransacciones(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar transacciones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransacciones();
    }, []);

    const handleCreate = () => {
        setEditingTransaccion(null);
        setDialogOpen(true);
    };

    const handleEdit = (transaccion: Transaccion) => {
        setEditingTransaccion(transaccion);
        setDialogOpen(true);
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

    const handleSubmit = async (values: CreateTransaccionDto | UpdateTransaccionDto) => {
        try {
            if (editingTransaccion) {
                // Only send fields that are allowed in UpdateTransaccionDto
                const updateDto: UpdateTransaccionDto = {
                    concepto: values.concepto,
                    mesa: values.mesa,
                    cliente: values.cliente,
                    estado: values.estado,
                    // caja_id is NOT allowed in update
                };

                await transaccionesService.update(
                    editingTransaccion.id,
                    updateDto
                );
                toast.success("Transacción actualizada correctamente");
            } else {
                await transaccionesService.create(values as CreateTransaccionDto);
                toast.success("Transacción creada correctamente");
            }
            fetchTransacciones();
            setDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar transacción");
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

    // Calculate next nro_reg
    const nextNroReg = transacciones.length > 0
        ? Math.max(...transacciones.map((t) => t.nro_reg)) + 1
        : 1;

    // Filter transacciones by estado
    const filteredTransacciones = (estado: string) => {
        if (estado === "todos") return transacciones;
        return transacciones.filter((t) => t.estado === estado);
    };

    // Count by status
    const counts = {
        todos: transacciones.length,
        pendiente: transacciones.filter((t) => t.estado === "pendiente").length,
        abierto: transacciones.filter((t) => t.estado === "abierto").length,
        cerrado: transacciones.filter((t) => t.estado === "cerrado").length,
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
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Transacción
                    </Button>
                </div>

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
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Dialogs */}
                <TransaccionDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    transaccionToEdit={editingTransaccion}
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
