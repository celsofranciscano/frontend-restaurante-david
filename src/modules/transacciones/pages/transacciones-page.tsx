import { useNavigate } from "react-router-dom";
import { Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";
import { TransaccionesTable } from "../components/transacciones-table";
import { UnifiedTransactionView } from "../components/unified-transaction-view";
import { PaymentDialog } from "../components/payment-dialog";
import { OrderDetailsDialog } from "../components/order-details-dialog";
import { AddItemDialog } from "../components/add-item-dialog";
import { ManageExtrasDialog } from "../components/manage-extras-dialog";
import { useTransaccionesPage } from "../hooks/use-transacciones-page";
import { TransaccionesStatsTabs } from "../components/transacciones-stats-tabs";
import { CocinaTabContent } from "../components/cocina-tab-content";

export function TransaccionesPage() {
    const navigate = useNavigate();
    const {
        // State
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
    } = useTransaccionesPage();

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

                            <TransaccionesStatsTabs counts={counts} />

                            {["todos", "pendiente", "abierto", "cerrado"].map((tab) => (
                                <TabsContent key={tab} value={tab} className="mt-6">
                                    {loading ? (
                                        <div className="text-center py-8">Cargando transacciones...</div>
                                    ) : (
                                        <TransaccionesTable
                                            transacciones={filteredTransacciones(tab)}
                                            onView={handleView}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onPay={handlePay}
                                        />
                                    )}
                                </TabsContent>
                            ))}

                            <TabsContent value="cocina" className="mt-6">
                                <CocinaTabContent
                                    pedidos={pedidosCocina}
                                    loading={loadingCocina}
                                    processingId={processingId}
                                    onCompletar={handleCompletarOrden}
                                />
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
                    onAddItem={() => setAddItemDialogOpen(true)} // Pass the setter or handler
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
