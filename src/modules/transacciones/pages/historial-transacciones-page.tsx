import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import DashboardLayout from "@/layouts/dashboard-layout";
import { transaccionesService } from "../services/transacciones.service";
import type { Transaccion } from "../types/transaccion.types";
import { TransaccionesTable } from "../components/transacciones-table";
import { OrderDetailsDialog } from "../components/order-details-dialog";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

export function HistorialTransaccionesPage() {
    const navigate = useNavigate();
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);

    // View details state
    const [viewingTransaccion, setViewingTransaccion] = useState<Transaccion | null>(null);
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await transaccionesService.getAll();
            setTransacciones(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar el historial de transacciones");
        } finally {
            setLoading(false);
        }
    };

    // Group transactions by date
    const groupedTransacciones = useMemo(() => {
        const groups: Record<string, Transaccion[]> = {};

        transacciones.forEach(t => {
            // Assumes t.fecha is YYYY-MM-DD or ISO
            let dateKey = t.fecha;
            if (!dateKey) dateKey = "Sin Fecha";
            // Normalizar si viene con hora
            if (dateKey.includes("T")) dateKey = dateKey.split("T")[0];

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(t);
        });

        // Sort keys descending (newest first)
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

    const handleView = (transaccion: Transaccion) => {
        setViewingTransaccion(transaccion);
        setOrderDetailsOpen(true);
    };

    const formatDateHeading = (dateStr: string) => {
        if (dateStr === "Sin Fecha") return dateStr;
        try {
            // Parse YYYY-MM-DD
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            if (!isValid(date)) return dateStr;
            return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
        } catch {
            return dateStr;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 container mx-auto py-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/transacciones")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Historial de Transacciones</h1>
                        <p className="text-muted-foreground">
                            Registro completo de todas las ventas ordenadas por fecha.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-10">Cargando historial...</div>
                    ) : groupedTransacciones.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No hay transacciones registradas.
                        </div>
                    ) : (
                        <Accordion type="multiple" className="w-full space-y-4">
                            {groupedTransacciones.map((group) => (
                                <AccordionItem key={group.date} value={group.date} className="border rounded-lg px-4 bg-card">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex flex-1 items-center justify-between pr-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-semibold capitalize text-lg">
                                                    {formatDateHeading(group.date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                                    <span>{group.count} Ventas</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-bold text-success bg-success-bg px-2 py-1 rounded-full border border-success-border">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>Bs {group.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4">
                                        <TransaccionesTable
                                            transacciones={group.items}
                                            onView={handleView}
                                            readOnly={true}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>

                {/* Read-only view dialog */}
                <OrderDetailsDialog
                    open={orderDetailsOpen}
                    onOpenChange={setOrderDetailsOpen}
                    transaccion={viewingTransaccion}
                    onUpdate={() => { }} // Read only
                    onAddItem={() => { }}
                    onPay={() => { }}
                    onManageExtras={() => { }}
                    readOnly={true} // We might need to implement this prop in OrderDetailsDialog
                />
            </div>
        </DashboardLayout>
    );
}
