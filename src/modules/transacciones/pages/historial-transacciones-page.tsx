import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    Calendar, 
    DollarSign, 
    Receipt,
    FileText,
    TrendingUp,
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    Printer,
    Download,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Collapsible,
    CollapsibleContent,
} from "@/components/ui/collapsible";
import DashboardLayout from "@/layouts/dashboard-layout";
import { transaccionesService } from "../services/transacciones.service";
import { cajaService } from "@/modules/caja/services/caja.service";
import type { Transaccion } from "../types/transaccion.types";
import type { CajaTurnoResponse, ResumenCierre } from "@/modules/caja/types/caja.types";
import { TransaccionesTable } from "../components/transacciones-table";
import { OrderDetailsDialog } from "../components/order-details-dialog";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { generateCajaReportPDF, generateGeneralReportPDF } from "@/modules/caja/services/pdf-report.service";

interface CajaGroupData {
    caja: CajaTurnoResponse;
    ventas: Transaccion[];
    resumen: {
        monto_inicial: number;
        ventas_efectivo: number;
        ventas_qr: number;
        gastos_efectivo: number;
        gastos_qr: number;
        efectivo_esperado: number;
        total_qr: number;
        total_del_dia: number;
        total_gastos: number;
    };
    gastos: any[];
    expanded: boolean;
}

export function HistorialTransaccionesPage() {
    const navigate = useNavigate();
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [cajas, setCajas] = useState<CajaTurnoResponse[]>([]);
    const [cajaDetails, setCajaDetails] = useState<Record<number, ResumenCierre>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"cajas" | "fecha">("cajas");
    const [expandedCajas, setExpandedCajas] = useState<Record<number, boolean>>({});

    // View details state
    const [viewingTransaccion, setViewingTransaccion] = useState<Transaccion | null>(null);
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [transaccionesData, cajasData] = await Promise.all([
                transaccionesService.getAll(),
                cajaService.obtenerHistorial(100),
            ]);
            setTransacciones(transaccionesData);
            setCajas(cajasData);

            // Load details for each caja
            const detailsPromises = cajasData.map(async (caja) => {
                try {
                    const detail = await cajaService.obtenerDetalleCaja(caja.id);
                    return { id: caja.id, detail };
                } catch {
                    return { id: caja.id, detail: null };
                }
            });

            const detailsResults = await Promise.all(detailsPromises);
            const detailsMap: Record<number, ResumenCierre> = {};
            detailsResults.forEach(({ id, detail }) => {
                if (detail) {
                    detailsMap[id] = detail;
                }
            });
            setCajaDetails(detailsMap);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar el historial");
        } finally {
            setLoading(false);
        }
    };

    // Group transactions by caja
    const groupedByCaja = useMemo((): CajaGroupData[] => {
        return cajas.map((caja) => {
            const cajaVentas = transacciones.filter(t => t.caja_id === caja.id);
            const detail = cajaDetails[caja.id];
            
            return {
                caja,
                ventas: cajaVentas,
                resumen: detail?.resumen || {
                    monto_inicial: caja.monto_inicial || 0,
                    ventas_efectivo: caja.ventas_efectivo || 0,
                    ventas_qr: caja.ventas_qr || 0,
                    gastos_efectivo: 0,
                    gastos_qr: 0,
                    efectivo_esperado: (caja.monto_inicial || 0) + (caja.ventas_efectivo || 0),
                    total_qr: caja.ventas_qr || 0,
                    total_del_dia: (caja.ventas_efectivo || 0) + (caja.ventas_qr || 0),
                    total_gastos: 0,
                },
                gastos: detail?.gastos || [],
                expanded: expandedCajas[caja.id] || false,
            };
        }).sort((a, b) => b.caja.id - a.caja.id);
    }, [cajas, transacciones, cajaDetails, expandedCajas]);

    // Group transactions by date (for alternate view)
    const groupedByFecha = useMemo(() => {
        const groups: Record<string, Transaccion[]> = {};

        transacciones.forEach(t => {
            let dateKey = t.fecha;
            if (!dateKey) dateKey = "Sin Fecha";
            if (dateKey.includes("T")) dateKey = dateKey.split("T")[0];

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(t);
        });

        return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(date => {
            const items = groups[date];
            const totalDia = items.reduce((sum, t) => sum + parseFloat(t.monto_total), 0);
            return {
                date,
                items,
                total: totalDia,
                count: items.length
            };
        });
    }, [transacciones]);

    const toggleCaja = (cajaId: number) => {
        setExpandedCajas(prev => ({
            ...prev,
            [cajaId]: !prev[cajaId]
        }));
    };

    const handleView = (transaccion: Transaccion) => {
        setViewingTransaccion(transaccion);
        setOrderDetailsOpen(true);
    };

    const formatDateHeading = (dateStr: string) => {
        if (dateStr === "Sin Fecha") return dateStr;
        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            if (!isValid(date)) return dateStr;
            return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            return format(date, "HH:mm");
        } catch {
            return "N/A";
        }
    };

    const handleExportPDF = async (cajaId?: number) => {
        try {
            if (cajaId) {
                const cajaData = groupedByCaja.find(c => c.caja.id === cajaId);
                if (cajaData) {
                    generateCajaReportPDF({
                        caja: {
                            id: cajaData.caja.id,
                            fecha: cajaData.caja.fecha,
                            hora_apertura: cajaData.caja.hora_apertura,
                            hora_cierre: cajaData.caja.hora_cierre,
                            monto_inicial: cajaData.caja.monto_inicial,
                            cerrada: cajaData.caja.cerrada ?? false,
                            usuario_nombre: "Usuario",
                        },
                        resumen: cajaData.resumen,
                        ventas: cajaData.ventas,
                        gastos: cajaData.gastos,
                    });
                    toast.success("PDF generado exitosamente");
                }
            } else {
                // Export all cajas
                const allData = groupedByCaja.map(c => ({
                    caja: {
                        id: c.caja.id,
                        fecha: c.caja.fecha,
                        hora_apertura: c.caja.hora_apertura,
                        hora_cierre: c.caja.hora_cierre,
                        monto_inicial: c.caja.monto_inicial,
                        cerrada: c.caja.cerrada ?? false,
                        usuario_nombre: "Usuario",
                    },
                    resumen: c.resumen,
                    ventas: c.ventas,
                    gastos: c.gastos,
                }));
                generateGeneralReportPDF(allData);
                toast.success("Reporte general generado");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al generar el PDF");
        }
    };

    // Calculate totals
    const totalGeneral = useMemo(() => {
        return groupedByCaja.reduce((acc, caja) => ({
            ventas: acc.ventas + caja.resumen.total_del_dia,
            gastos: acc.gastos + caja.resumen.total_gastos,
            inicial: acc.inicial + caja.resumen.monto_inicial,
            count: acc.count + caja.ventas.length,
        }), { ventas: 0, gastos: 0, inicial: 0, count: 0 });
    }, [groupedByCaja]);

    return (
        <DashboardLayout>
            <div className="space-y-6 container mx-auto py-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/ventas")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
                            <p className="text-muted-foreground">
                                Registro completo de ventas organizadas por caja y fecha.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => handleExportPDF()}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Exportar Todo
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cajas</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cajas.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {cajas.filter(c => c.cerrada).length} cerradas
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-success/30 bg-success/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                            <TrendingUp className="h-4 w-4 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">
                                Bs {totalGeneral.ventas.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {totalGeneral.count} ventas registradas
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                Bs {totalGeneral.gastos.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Egresos registrados
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monto Inicial</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Bs {totalGeneral.inicial.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                En todas las cajas
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* View Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList>
                        <TabsTrigger value="cajas" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Por Caja
                        </TabsTrigger>
                        <TabsTrigger value="fecha" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Por Fecha
                        </TabsTrigger>
                    </TabsList>

                    {/* By Caja View */}
                    <TabsContent value="cajas" className="mt-6">
                        {loading ? (
                            <div className="text-center py-10">Cargando historial...</div>
                        ) : groupedByCaja.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No hay cajas registradas.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groupedByCaja.map((group) => (
                                    <Card key={group.caja.id} className="overflow-hidden">
                                        {/* Caja Header */}
                                        <div 
                                            className={cn(
                                                "p-4 cursor-pointer transition-colors",
                                                group.caja.cerrada 
                                                    ? "bg-muted/50 hover:bg-muted" 
                                                    : "bg-warning/10 hover:bg-warning/20"
                                            )}
                                            onClick={() => toggleCaja(group.caja.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "flex items-center justify-center size-12 rounded-lg",
                                                        group.caja.cerrada 
                                                            ? "bg-primary/10" 
                                                            : "bg-warning/20"
                                                    )}>
                                                        <FileText className={cn(
                                                            "h-6 w-6",
                                                            group.caja.cerrada 
                                                                ? "text-primary" 
                                                                : "text-warning"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg">
                                                                Caja #{group.caja.id}
                                                            </h3>
                                                            <span className={cn(
                                                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                                                group.caja.cerrada 
                                                                    ? "bg-success/20 text-success" 
                                                                    : "bg-warning/20 text-warning"
                                                            )}>
                                                                {group.caja.cerrada ? "Cerrada" : "Abierta"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {group.caja.fecha}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(group.caja.hora_apertura)} - {formatTime(group.caja.hora_cierre)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Receipt className="h-3 w-3" />
                                                                {group.ventas.length} ventas
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-6">
                                                    {/* Summary Badges */}
                                                    <div className="hidden md:flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="text-xs text-muted-foreground">Inicial</div>
                                                            <div className="font-semibold">Bs {group.resumen.monto_inicial.toFixed(2)}</div>
                                                        </div>
                                                        <div className="h-8 w-px bg-border" />
                                                        <div className="text-center">
                                                            <div className="text-xs text-muted-foreground">Ventas</div>
                                                            <div className="font-semibold text-success">Bs {group.resumen.total_del_dia.toFixed(2)}</div>
                                                        </div>
                                                        <div className="h-8 w-px bg-border" />
                                                        <div className="text-center">
                                                            <div className="text-xs text-muted-foreground">Gastos</div>
                                                            <div className="font-semibold text-destructive">Bs {group.resumen.total_gastos.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExportPDF(group.caja.id);
                                                            }}
                                                            title="Exportar PDF"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                        {expandedCajas[group.caja.id] ? (
                                                            <ChevronUp className="h-5 w-5" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <Collapsible open={expandedCajas[group.caja.id]} onOpenChange={() => toggleCaja(group.caja.id)}>
                                            <CollapsibleContent>
                                                <div className="p-4 border-t">
                                                    {/* Financial Summary */}
                                                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
                                                        <div className="bg-muted/30 rounded-lg p-3">
                                                            <div className="text-xs text-muted-foreground mb-1">Monto Inicial</div>
                                                            <div className="font-semibold">Bs {group.resumen.monto_inicial.toFixed(2)}</div>
                                                        </div>
                                                        <div className="bg-success/10 rounded-lg p-3">
                                                            <div className="text-xs text-success mb-1">Ventas Efectivo</div>
                                                            <div className="font-semibold text-success">Bs {group.resumen.ventas_efectivo.toFixed(2)}</div>
                                                        </div>
                                                        <div className="bg-info/10 rounded-lg p-3">
                                                            <div className="text-xs text-info mb-1">Ventas QR</div>
                                                            <div className="font-semibold text-info">Bs {group.resumen.ventas_qr.toFixed(2)}</div>
                                                        </div>
                                                        <div className="bg-success/10 rounded-lg p-3 border border-success/20">
                                                            <div className="text-xs text-success mb-1">Total Ventas</div>
                                                            <div className="font-semibold text-success">Bs {group.resumen.total_del_dia.toFixed(2)}</div>
                                                        </div>
                                                        <div className="bg-destructive/10 rounded-lg p-3">
                                                            <div className="text-xs text-destructive mb-1">Total Gastos</div>
                                                            <div className="font-semibold text-destructive">Bs {group.resumen.total_gastos.toFixed(2)}</div>
                                                        </div>
                                                        <div className="bg-primary/10 rounded-lg p-3">
                                                            <div className="text-xs text-primary mb-1">Efectivo Esperado</div>
                                                            <div className="font-semibold text-primary">Bs {group.resumen.efectivo_esperado.toFixed(2)}</div>
                                                        </div>
                                                    </div>

                                                    {/* Sales Table */}
                                                    {group.ventas.length > 0 ? (
                                                        <div className="mb-6">
                                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                <Receipt className="h-4 w-4" />
                                                                Ventas ({group.ventas.length})
                                                            </h4>
                                                            <TransaccionesTable
                                                                transacciones={group.ventas}
                                                                onView={handleView}
                                                                readOnly={true}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg mb-6">
                                                            No hay ventas en esta caja
                                                        </div>
                                                    )}

                                                    {/* Expenses */}
                                                    {group.gastos.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                <ShoppingBag className="h-4 w-4" />
                                                                Gastos ({group.gastos.length})
                                                            </h4>
                                                            <div className="border rounded-lg overflow-hidden">
                                                                <table className="w-full">
                                                                    <thead className="bg-muted">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Descripción</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Método</th>
                                                                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Monto</th>
                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fecha</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y">
                                                                        {group.gastos.map((gasto) => (
                                                                            <tr key={gasto.id} className="hover:bg-muted/50">
                                                                                <td className="px-4 py-2 text-sm">{gasto.id}</td>
                                                                                <td className="px-4 py-2 text-sm">{gasto.descripcion}</td>
                                                                                <td className="px-4 py-2 text-sm">
                                                                                    <span className={cn(
                                                                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                                                                        gasto.metodo_pago === 'efectivo' 
                                                                                            ? "bg-success/20 text-success" 
                                                                                            : "bg-info/20 text-info"
                                                                                    )}>
                                                                                        {gasto.metodo_pago.toUpperCase()}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-2 text-sm text-right font-semibold">
                                                                                    Bs {gasto.monto.toFixed(2)}
                                                                                </td>
                                                                                <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                                    {gasto.creado_en ? format(new Date(gasto.creado_en), "dd/MM/yyyy HH:mm") : "N/A"}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* By Date View */}
                    <TabsContent value="fecha" className="mt-6">
                        {loading ? (
                            <div className="text-center py-10">Cargando historial...</div>
                        ) : groupedByFecha.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No hay ventas registradas.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groupedByFecha.map((group) => (
                                    <Card key={group.date}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                                    <CardTitle className="text-lg capitalize">
                                                        {formatDateHeading(group.date)}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        {group.count} ventas
                                                    </span>
                                                    <span className="font-bold text-success bg-success/10 px-3 py-1 rounded-full">
                                                        Bs {group.total.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <TransaccionesTable
                                                transacciones={group.items}
                                                onView={handleView}
                                                readOnly={true}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Read-only view dialog */}
                <OrderDetailsDialog
                    open={orderDetailsOpen}
                    onOpenChange={setOrderDetailsOpen}
                    transaccion={viewingTransaccion}
                    onUpdate={() => { }}
                    onAddItem={() => { }}
                    onPay={() => { }}
                    onManageExtras={() => { }}
                    readOnly={true}
                />
            </div>
        </DashboardLayout>
    );
}
