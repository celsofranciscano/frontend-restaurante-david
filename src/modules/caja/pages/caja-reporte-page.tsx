import { Banknote, QrCode, TrendingUp, Calendar, DollarSign, ShoppingCart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/dashboard-layout";
import { TransaccionesTable } from "@/modules/transacciones/components/transacciones-table";
import { useCajaReporte } from "../hooks/use-caja-reporte";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CajaReportePage() {
    const navigate = useNavigate();
    const { caja, transacciones, resumen, loading } = useCajaReporte();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-6 space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-[400px]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!caja) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-10 px-4">
                    <Card className="max-w-2xl mx-auto text-center py-10">
                        <CardHeader>
                            <div className="bg-muted/30 p-4 rounded-full w-fit mx-auto mb-4">
                                <DollarSign className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <CardTitle className="text-2xl">No hay caja abierta</CardTitle>
                            <CardDescription className="text-lg mt-2">
                                Para ver el reporte de movimientos y ventas, primero debes realizar la apertura de caja.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    // Datos seguros para renderizar
    const datos = resumen?.resumen || {
        ventas_efectivo: 0,
        ventas_qr: 0,
        total_del_dia: 0,
        monto_inicial: 0,
        total_gastos: 0,
        efectivo_esperado: 0,
        gastos_efectivo: 0,
        total_qr: 0
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-7xl animate-in fade-in duration-500">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate("/caja")}
                            className="gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver</span>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Reporte de Caja</h2>
                            <p className="text-muted-foreground capitalize">
                                {caja.fecha}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumen de Ventas - Key Metrics */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Fecha / Caja"
                        value={caja.fecha}
                        subValue={`Turno #${caja.id}`}
                        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    />
                    <MetricCard
                        title="Ventas Efectivo"
                        value={`Bs ${datos.ventas_efectivo.toFixed(2)}`}
                        subValue="Pagos recibidos en efectivo"
                        icon={<Banknote className="h-4 w-4 text-success" />}
                        valueClassName="text-success"
                    />
                    <MetricCard
                        title="Ventas QR"
                        value={`Bs ${datos.ventas_qr.toFixed(2)}`}
                        subValue="Pagos digitales verificados"
                        icon={<QrCode className="h-4 w-4 text-info" />}
                        valueClassName="text-info"
                    />
                    <MetricCard
                        title="Total Generado"
                        value={`Bs ${datos.total_del_dia.toFixed(2)}`}
                        subValue="Suma total de ventas (Efectivo + QR)"
                        icon={<TrendingUp className="h-4 w-4 text-primary" />}
                        className="border-primary/20 bg-primary/5"
                        valueClassName="text-primary"
                    />
                </div>

                {/* Detalles Financieros y Flujo de Caja */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 grid gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Flujo de Efectivo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Monto Inicial</span>
                                    </div>
                                    <span className="font-mono font-bold">Bs {datos.monto_inicial.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-destructive/5 dark:bg-destructive/10 rounded-lg border border-destructive/20 dark:border-destructive/30">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4 text-destructive" />
                                        <span className="text-sm font-medium">Gastos Totales</span>
                                    </div>
                                    <span className="font-mono font-bold text-destructive">
                                        - Bs {datos.total_gastos.toFixed(2)}
                                    </span>
                                </div>
                                <div className="pt-4 border-t mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm">Efectivo Esperado en Caja</span>
                                        <span className="font-mono text-xl font-bold text-primary">
                                            Bs {datos.efectivo_esperado.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 text-right">
                                        (Inicial + Ventas Efec. - Gastos Efec.)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Ventas del Turno</span>
                                    <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                        {transacciones.length} registros
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    Detalle completo de todas las operaciones registradas en esta caja.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 sm:p-6 overflow-hidden">
                                <div className="overflow-x-auto">
                                    {transacciones.length > 0 ? (
                                        <TransaccionesTable
                                            transacciones={transacciones}
                                            onView={() => { }}
                                            onEdit={() => { }}
                                            onDelete={() => { }}
                                            onPay={() => { }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/5 rounded-lg border border-dashed m-4">
                                            <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                                            <p>No hay ventas registradas aún.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function MetricCard({
    title,
    value,
    subValue,
    icon,
    className,
    valueClassName
}: {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ReactNode;
    className?: string;
    valueClassName?: string;
}) {
    return (
        <Card className={cn("transition-all hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
                {subValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subValue}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
