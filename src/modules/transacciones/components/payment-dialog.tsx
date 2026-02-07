import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreditCard, Banknote, QrCode } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Transaccion, Pago, CreatePagoDto } from "../types/transaccion.types";

const formSchema = z.object({
    metodo_pago: z.enum(["efectivo", "qr"]),
    monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
    monto_recibido: z.number().optional(),
    referencia_qr: z.string().optional(),
}).refine(
    (data) => {
        if (data.metodo_pago === "efectivo" && data.monto_recibido) {
            return data.monto_recibido >= data.monto;
        }
        return true;
    },
    {
        message: "El monto recibido debe ser mayor o igual al monto a pagar",
        path: ["monto_recibido"],
    }
);

type FormValues = z.infer<typeof formSchema>;

type PaymentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaccion: Transaccion | null;
    pagos: Pago[];
    onSubmit: (values: CreatePagoDto) => Promise<void>;
};

export function PaymentDialog({
    open,
    onOpenChange,
    transaccion,
    pagos,
    onSubmit,
}: PaymentDialogProps) {
    const [cambioCalculado, setCambioCalculado] = useState<number>(0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            metodo_pago: "efectivo",
            monto: 0,
            monto_recibido: 0,
            referencia_qr: "",
        },
    });

    const metodoPago = form.watch("metodo_pago");
    const monto = form.watch("monto");
    const montoRecibido = form.watch("monto_recibido");

    useEffect(() => {
        if (transaccion && open) {
            const montoPendiente = Number(transaccion.monto_pendiente);
            form.reset({
                metodo_pago: "efectivo",
                monto: montoPendiente,
                monto_recibido: montoPendiente,
                referencia_qr: "",
            });
        }
    }, [transaccion, open, form]);

    useEffect(() => {
        if (metodoPago === "efectivo" && montoRecibido && monto) {
            const cambio = montoRecibido - monto;
            setCambioCalculado(cambio >= 0 ? cambio : 0);
        } else {
            setCambioCalculado(0);
        }
    }, [metodoPago, monto, montoRecibido]);

    const handleSubmit = async (values: FormValues) => {
        const dto: CreatePagoDto = {
            metodo_pago: values.metodo_pago,
            monto: values.monto,
            monto_recibido: values.metodo_pago === "efectivo" ? values.monto_recibido : undefined,
            referencia_qr: values.metodo_pago === "qr" ? values.referencia_qr : undefined,
        };

        await onSubmit(dto);
        onOpenChange(false);
        form.reset();
    };

    if (!transaccion) return null;

    // Safely parse monetary values with fallback
    const parseMoneyValue = (value: string | number | null | undefined): number => {
        if (value === null || value === undefined) return 0;
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(parsed) ? 0 : parsed;
    };

    const montoPendiente = parseMoneyValue(transaccion.monto_pendiente);
    const montoTotal = parseMoneyValue(transaccion.monto_total);
    const montoPagado = parseMoneyValue(transaccion.monto_pagado);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Procesar Pago
                    </DialogTitle>
                    <DialogDescription>
                        Transacción #{transaccion.nro_reg} - {transaccion.concepto}
                    </DialogDescription>
                </DialogHeader>

                {/* Payment Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
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
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Pendiente:</span>
                        <span className="text-xl font-bold text-orange-600">
                            Bs {montoPendiente.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Payment History */}
                {pagos.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Pagos anteriores:</h4>
                        <div className="space-y-1">
                            {pagos.map((pago) => (
                                <div
                                    key={pago.id}
                                    className="flex justify-between items-center text-sm bg-muted/30 rounded px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        {pago.metodo_pago === "efectivo" ? (
                                            <Banknote className="h-4 w-4" />
                                        ) : (
                                            <QrCode className="h-4 w-4" />
                                        )}
                                        <span className="capitalize">{pago.metodo_pago}</span>
                                    </div>
                                    <span className="font-medium">
                                        Bs {Number(pago.monto).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="metodo_pago"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione método" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="efectivo">
                                                <div className="flex items-center gap-2">
                                                    <Banknote className="h-4 w-4" />
                                                    Efectivo
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="qr">
                                                <div className="flex items-center gap-2">
                                                    <QrCode className="h-4 w-4" />
                                                    QR
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="monto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto a Pagar *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={montoPendiente}
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Máximo: Bs {montoPendiente.toFixed(2)}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {metodoPago === "efectivo" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="monto_recibido"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monto Recibido *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseFloat(e.target.value) || 0)
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {cambioCalculado > 0 && (
                                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                                Cambio a devolver:
                                            </span>
                                            <Badge variant="outline" className="text-lg font-bold text-green-600">
                                                Bs {cambioCalculado.toFixed(2)}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {metodoPago === "qr" && (
                            <FormField
                                control={form.control}
                                name="referencia_qr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referencia QR</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Código de transacción QR"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Código de confirmación de la transacción QR
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1">
                                Registrar Pago
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
