import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { format, isValid } from "date-fns";
import { cajaService } from "../services/caja.service";
import { transaccionesService } from "@/modules/transacciones/services/transacciones.service";
import type { ResumenCierre } from "../types/caja.types";
import DashboardLayout from "@/layouts/dashboard-layout";

interface ItemResumen {
    nombre: string;
    cantidad: number;
    total: number;
    tipo: "producto" | "plato";
}

const formatDateSafe = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    // Check if it's already in backend format "HH:mm - dd/MM/yyyy"
    if (dateStr.includes(" - ")) {
        return dateStr;
    }
    const date = new Date(dateStr);
    return isValid(date) ? format(date, "HH:mm dd/MM/yyyy") : "-";
};

const formatTimeSafe = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    // Check if it's already in "HH:mm" or "HH:mm - dd/MM/yyyy" format
    if (dateStr.includes(" - ")) {
        return dateStr.split(" - ")[0];
    }
    const date = new Date(dateStr);
    return isValid(date) ? format(date, "HH:mm") : "-";
};

const calculateTotalArqueo = (caja: ResumenCierre['caja']) => {
    let total = 0;
    // Billetes
    const billetes = [200, 100, 50, 20, 10, 5];
    billetes.forEach(val => {
        const key = `b${val}` as keyof typeof caja;
        const count = Number(caja[key]) || 0;
        total += count * val;
    });
    // Monedas
    const monedas = [2, 1, 0.50, 0.20, 0.10];
    monedas.forEach(val => {
        const keyMap: Record<number, string> = { 2: 'm2', 1: 'm1', 0.5: 'm050', 0.2: 'm020', 0.1: 'm010' };
        const key = keyMap[val] as keyof typeof caja;
        const count = Number(caja[key]) || 0;
        total += count * val;
    });
    return total;
};

export function CajaDetallePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ResumenCierre | null>(null);
    const [items, setItems] = useState<ItemResumen[]>([]);

    useEffect(() => {
        if (id) {
            loadData(Number(id));
        }
    }, [id]);

    useEffect(() => {
        if (data) {
            console.log("DEBUG: CajaDetallePage Data:", data);
            console.log("DEBUG: Hora Cierre:", data.caja.hora_cierre);
            console.log("DEBUG: B200:", data.caja.b200);
        }
    }, [data]);

    const loadData = async (cajaId: number) => {
        try {
            setLoading(true);
            const [cajaData, itemsData] = await Promise.all([
                cajaService.obtenerDetalleCaja(cajaId),
                transaccionesService.getResumenItems(cajaId),
            ]);
            setData(cajaData);
            setItems(itemsData);
        } catch (error) {
            console.error("Error al cargar detalles de caja", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout>
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
                    <p className="text-destructive">No se pudo cargar la información o la caja no existe.</p>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detalle de Caja #{id}</h1>
                        <p className="text-muted-foreground">
                            Fecha: {formatDateSafe(data.caja.fecha)} - Responsable: {data.caja.usuario_id || "N/A"}
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="resumen" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
                        <TabsTrigger value="resumen">Resumen</TabsTrigger>
                        <TabsTrigger value="ventas">Ventas ({items.length})</TabsTrigger>
                        <TabsTrigger value="gastos">Gastos ({data.gastos.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumen" className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Flujo de Dinero</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Monto Inicial:</span>
                                        <span className="font-mono">Bs {data.resumen.monto_inicial.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>+ Ventas Efectivo:</span>
                                        <span className="font-mono">Bs {data.resumen.ventas_efectivo.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>- Gastos Efectivo:</span>
                                        <span className="font-mono">Bs {data.resumen.gastos_efectivo.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold">
                                        <span>Efectivo Esperado:</span>
                                        <span>Bs {data.resumen.efectivo_esperado.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-purple-600 font-medium">
                                        <span>(Arqueo) Efectivo Real:</span>
                                        <span className="font-mono">Bs {calculateTotalArqueo(data.caja).toFixed(2)}</span>
                                    </div>
                                    <div className={`flex justify-between text-sm font-bold ${calculateTotalArqueo(data.caja) - data.resumen.efectivo_esperado >= 0
                                        ? "text-blue-600"
                                        : "text-red-600"
                                        }`}>
                                        <span>Diferencia:</span>
                                        <span className="font-mono">
                                            Bs {(calculateTotalArqueo(data.caja) - data.resumen.efectivo_esperado).toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Digital (QR)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm text-blue-600">
                                        <span>+ Ventas QR:</span>
                                        <span className="font-mono">Bs {data.resumen.ventas_qr.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>- Gastos QR:</span>
                                        <span className="font-mono">Bs {data.resumen.gastos_qr.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold text-blue-700">
                                        <span>Total QR:</span>
                                        <span>Bs {data.resumen.total_qr.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className={data.caja.cerrada ? "bg-muted/30" : "bg-yellow-50 dark:bg-yellow-900/10"}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Estado del Cierre</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Estado:</span>
                                    <Badge variant={data.caja.cerrada ? "default" : "secondary"}>
                                        {data.caja.cerrada ? "Cerrada" : "Abierta"}
                                    </Badge>
                                </div>
                                {data.caja.cerrada && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span>Hora Cierre:</span>
                                            <span>{formatDateSafe(data.caja.hora_cierre)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Observaciones:</span>
                                            <span className="italic text-muted-foreground">{data.caja.cierre_obs || "Ninguna"}</span>
                                        </div>

                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Arqueo de Caja</CardTitle>
                                <CardDescription>Detalle de billetes y monedas contados en el cierre.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-semibold mb-4 text-sm">Billetes</h4>
                                        <ul className="space-y-2 text-sm">
                                            {[200, 100, 50, 20, 10, 5].map((val) => {
                                                const key = `b${val}` as keyof typeof data.caja;
                                                const count = Number(data.caja[key]) || 0;
                                                const total = count * val;
                                                return (
                                                    <li key={val} className="flex justify-between border-b pb-2">
                                                        <span>{val} Bs</span>
                                                        <div className="flex gap-4">
                                                            <span className="font-mono text-muted-foreground">{count}</span>
                                                            <span className="font-mono font-bold w-20 text-right">
                                                                {total > 0 ? `Bs ${total.toFixed(2)}` : '-'}
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-4 text-sm">Monedas</h4>
                                        <ul className="space-y-2 text-sm">
                                            {[2, 1, 0.50, 0.20, 0.10].map((val) => {
                                                const keyMap: Record<number, string> = { 2: 'm2', 1: 'm1', 0.5: 'm050', 0.2: 'm020', 0.1: 'm010' };
                                                const key = keyMap[val] as keyof typeof data.caja;
                                                const count = Number(data.caja[key]) || 0;
                                                const total = count * val;
                                                return (
                                                    <li key={val} className="flex justify-between border-b pb-2">
                                                        <span>{val.toFixed(2)} Bs</span>
                                                        <div className="flex gap-4">
                                                            <span className="font-mono text-muted-foreground">{count}</span>
                                                            <span className="font-mono font-bold w-20 text-right">
                                                                {total > 0 ? `Bs ${total.toFixed(2)}` : '-'}
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t flex justify-end">
                                    <div className="text-xl font-bold">
                                        Total Arqueo: <span className="text-primary">Bs {calculateTotalArqueo(data.caja).toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ventas" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalle de Ventas</CardTitle>
                                <CardDescription>Productos y platos vendidos en este turno.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto/Plato</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Cant.</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.nombre}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.tipo}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">{item.cantidad}</TableCell>
                                                <TableCell className="text-right font-mono font-bold">Bs {item.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No hay ventas registradas en esta caja.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="gastos" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalle de Gastos</CardTitle>
                                <CardDescription>Gastos registrados durante este turno.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead>Hora</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.gastos.map((gasto) => (
                                            <TableRow key={gasto.id}>
                                                <TableCell>{gasto.descripcion}</TableCell>
                                                <TableCell>
                                                    <Badge variant={gasto.metodo_pago === 'efectivo' ? 'outline' : 'secondary'}>
                                                        {gasto.metodo_pago}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatTimeSafe(gasto.creado_en)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-red-600">
                                                    - Bs {gasto.monto.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {data.gastos.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No hay gastos registrados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

            </div>
        </DashboardLayout>
    );
}
