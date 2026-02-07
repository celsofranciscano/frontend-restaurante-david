import { useEffect, useState } from "react";
import { Banknote, QrCode, TrendingUp, Calendar, DollarSign, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/layouts/dashboard-layout";
import { cajaService } from "../services/caja.service";
import { transaccionesService } from "@/modules/transacciones/services/transacciones.service";
import type { CajaTurnoResponse, ResumenCierre } from "../types/caja.types";
import type { Transaccion } from "@/modules/transacciones/types/transaccion.types";
import { TransaccionesTable } from "@/modules/transacciones/components/transacciones-table";
import { toast } from "sonner";

export function CajaReportePage() {
    const [caja, setCaja] = useState<CajaTurnoResponse | null>(null);
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [resumen, setResumen] = useState<ResumenCierre | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCajaActual();
    }, []);

    const fetchCajaActual = async () => {
        try {
            setLoading(true);
            const cajaData = await cajaService.obtenerCajaAbierta();

            if (!cajaData) {
                toast.error("No hay una caja abierta");
                setLoading(false);
                return;
            }

            setCaja(cajaData);

            // Obtener transacciones de esta caja
            const txs = await transaccionesService.getByCaja(cajaData.id);
            setTransacciones(txs);

            // Obtener resumen
            const res = await cajaService.obtenerResumenCierre();
            setResumen(res);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos de caja");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <p className="text-muted-foreground">Cargando reporte de caja...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!caja) {
        return (
            <DashboardLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Reporte de Caja</CardTitle>
                        <CardDescription>
                            No hay una caja abierta. Debe abrir una caja para ver el reporte.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reporte de Caja</h2>
                    <p className="text-muted-foreground">
                        Resumen de ventas y transacciones del día
                    </p>
                </div>

                {/* Resumen de Ventas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Fecha
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{caja.fecha}</div>
                            <p className="text-xs text-muted-foreground">
                                Caja #{caja.id}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ventas Efectivo
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Bs {resumen?.resumen.ventas_efectivo.toFixed(2) || "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pagos en efectivo
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ventas QR
                            </CardTitle>
                            <QrCode className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Bs {resumen?.resumen.ventas_qr.toFixed(2) || "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pagos digitales
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total del Día
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Bs {resumen?.resumen.total_del_dia.toFixed(2) || "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Efectivo + QR
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detalles Adicionales */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Monto Inicial
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                Bs {resumen?.resumen.monto_inicial.toFixed(2) || "0.00"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Gastos
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-red-600">
                                Bs {resumen?.resumen.total_gastos.toFixed(2) || "0.00"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Efectivo Esperado
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-600">
                                Bs {resumen?.resumen.efectivo_esperado.toFixed(2) || "0.00"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Transacciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transacciones del Día</CardTitle>
                        <CardDescription>
                            {transacciones.length} transacciones registradas en esta caja
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transacciones.length > 0 ? (
                            <TransaccionesTable
                                transacciones={transacciones}
                                onView={() => { }}
                                onEdit={() => { }}
                                onDelete={() => { }}
                                onPay={() => { }}
                            />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No hay transacciones registradas en esta caja
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
