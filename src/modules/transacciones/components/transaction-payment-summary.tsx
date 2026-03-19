import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionPaymentSummaryProps {
    validItemCount: number;
    total: number;
    showPayment: boolean;
    setShowPayment: (show: boolean) => void;
    metodoPago: "efectivo" | "qr";
    setMetodoPago: (metodo: "efectivo" | "qr") => void;
    montoPago: number;
    setMontoPago: (monto: number) => void;
    montoRecibido: number;
    setMontoRecibido: (monto: number) => void;
    cambio: number;
}

export function TransactionPaymentSummary({
    validItemCount,
    total,
    showPayment,
    setShowPayment,
    metodoPago,
    setMetodoPago,
    montoPago,
    setMontoPago,
    montoRecibido,
    setMontoRecibido,
    cambio,
}: TransactionPaymentSummaryProps) {
    if (validItemCount === 0) return null;

    return (
        <Card className="bg-muted/30">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>Resumen de Pago</span>
                    <span className="text-2xl">Bs {total.toFixed(2)}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                    <Switch
                        id="show-payment"
                        checked={showPayment}
                        onCheckedChange={setShowPayment}
                    />
                    <Label htmlFor="show-payment">Registrar pago ahora</Label>
                </div>

                {showPayment && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Método de Pago</Label>
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
                                        <SelectItem value="efectivo">
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-4 w-4" />
                                                Efectivo
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="qr">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                QR / Transferencia
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Monto a Pagar</Label>
                                <Input
                                    type="number"
                                    value={montoPago}
                                    onChange={(e) =>
                                        setMontoPago(parseFloat(e.target.value) || 0)
                                    }
                                    min="0"
                                    max={total}
                                />
                            </div>
                        </div>

                        {metodoPago === "efectivo" && (
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                <div className="space-y-2">
                                    <Label>Monto Recibido</Label>
                                    <Input
                                        type="number"
                                        value={montoRecibido}
                                        onChange={(e) =>
                                            setMontoRecibido(
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cambio</Label>
                                    <div
                                        className={cn(
                                            "h-10 px-3 py-2 rounded-md border flex items-center font-bold text-lg",
                                            cambio < 0
                                                ? "text-destructive bg-destructive/5"
                                                : "text-success bg-success-bg"
                                        )}
                                    >
                                        Bs {cambio.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
