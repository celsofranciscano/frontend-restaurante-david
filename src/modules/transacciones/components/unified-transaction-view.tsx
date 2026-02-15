import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useTransaction } from "../hooks/use-transaction";
import { TransactionHeaderForm } from "./transaction-header-form";
import { TransactionItemsTable } from "./transaction-items-table";
import { TransactionPaymentSummary } from "./transaction-payment-summary";
import type { CreateTransaccionDto, AddItemDto, CreatePagoDto } from "../types/transaccion.types";

interface UnifiedTransactionViewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (
        transaccion: CreateTransaccionDto,
        items: AddItemDto[],
        pago?: CreatePagoDto
    ) => Promise<void>;
    nextNroReg: number;
}

export function UnifiedTransactionView({
    open,
    onOpenChange,
    onSubmit,
    nextNroReg,
}: UnifiedTransactionViewProps) {
    const {
        // Data
        productos,
        platos,
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
    } = useTransaction({ open, onOpenChange, onSubmit, nextNroReg });

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100vw] h-[100vh] sm:max-w-[95vw] sm:h-[90vh] md:max-w-6xl p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-4 border-b border-border/60 bg-primary/5 shrink-0">
                    <DialogTitle className="text-xl md:text-2xl font-bold flex items-center justify-between text-foreground/90">
                        <span>Nueva Transacción #{nextNroReg}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Complete los detalles de la transacción.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-lg">Cargando datos...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background/50">
                        <TransactionHeaderForm
                            form={form}
                            mesaOpen={mesaOpen}
                            setMesaOpen={setMesaOpen}
                            ubicacion={ubicacion}
                        />

                        <TransactionItemsTable
                            rows={rows}
                            platos={platos}
                            productos={productos}
                            selectItem={selectItem}
                            updateRow={updateRow}
                            addNewRow={addNewRow}
                            removeRow={removeRow}
                            addExtraToRow={addExtraToRow}
                            removeExtraFromRow={removeExtraFromRow}
                            handleKeyDown={handleKeyDown}
                            extrasPopoverOpen={extrasPopoverOpen}
                            setExtrasPopoverOpen={setExtrasPopoverOpen}
                            extraForm={extraForm}
                            setExtraForm={setExtraForm}
                            cantidadInputRefs={cantidadInputRefs}
                            notasInputRefs={notasInputRefs}
                        />

                        <TransactionPaymentSummary
                            validItemCount={validItemCount}
                            total={total}
                            showPayment={showPayment}
                            setShowPayment={setShowPayment}
                            metodoPago={metodoPago}
                            setMetodoPago={setMetodoPago}
                            montoPago={montoPago}
                            setMontoPago={setMontoPago}
                            montoRecibido={montoRecibido}
                            setMontoRecibido={setMontoRecibido}
                            cambio={cambio}
                        />
                    </div>
                )}

                <div className="p-4 border-t bg-muted/20 shrink-0 flex items-center justify-end gap-3 filter backdrop-blur-sm">
                    <div className="mr-auto text-sm text-muted-foreground">
                        {validItemCount} items • Total: Bs {total.toFixed(2)}
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={form.handleSubmit(handleSubmitTransaction)}
                        disabled={submitting || validItemCount === 0}
                        className="px-8 font-semibold shadow-md active:scale-95 transition-transform"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Transacción
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
