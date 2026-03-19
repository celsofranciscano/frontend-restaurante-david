import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, RefreshCw, CheckCircle, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaccion } from "../types/transaccion.types";

interface CocinaTabContentProps {
    pedidos: Transaccion[];
    loading: boolean;
    processingId: number | null;
    onCompletar: (id: number) => void;
}

export function CocinaTabContent({
    pedidos,
    loading,
    processingId,
    onCompletar,
}: CocinaTabContentProps) {
    const calculateElapsedMinutes = (fechaStr?: string, horaStr?: string) => {
        if (!fechaStr || !horaStr) return 0;
        try {
            let fechaHora: Date;

            if (horaStr.includes(' - ')) {
                const [hora, fecha] = horaStr.split(' - ');
                const [horas, minutos] = hora.split(':');
                const [dia, mes, anio] = fecha.split('/');
                fechaHora = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia), parseInt(horas), parseInt(minutos));
            } else {
                fechaHora = new Date(horaStr);
            }

            const now = new Date();
            const diffMs = now.getTime() - fechaHora.getTime();
            return Math.floor(diffMs / 60000);
        } catch (e) {
            console.error('Error calculando tiempo transcurrido:', e);
            return 0;
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando pedidos de cocina...</div>;
    }

    if (pedidos.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No hay pedidos pendientes en cocina</h3>
                <p>Los nuevos pedidos aparecerán aquí automáticamente.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[100px]">Hora</TableHead>
                        <TableHead className="w-[80px] text-center"># Items</TableHead>
                        <TableHead className="w-[150px]">Mesa/Para</TableHead>
                        <TableHead className="w-[80px]">Nro</TableHead>
                        <TableHead>Detalle del Pedido</TableHead>
                        <TableHead className="w-[120px] text-right">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pedidos.map((pedido) => {
                        const minutosTranscurridos = calculateElapsedMinutes(pedido.fecha, pedido.hora);
                        const esTardado = minutosTranscurridos > 20;

                        return (
                            <TableRow
                                key={pedido.id}
                                className={cn(
                                    esTardado ? "bg-destructive/5 hover:bg-destructive/10" : ""
                                )}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>
                                            {pedido.hora ? pedido.hora.split(' - ')[0] : "--:--"}
                                        </span>
                                        <Badge
                                            variant={esTardado ? "destructive" : "secondary"}
                                            className="w-fit mt-1 text-[10px] px-1 py-0 h-5"
                                        >
                                            <Timer className="h-3 w-3 mr-1" />
                                            {minutosTranscurridos} min
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-bold text-lg">
                                    {pedido.items?.length || 0}
                                </TableCell>
                                <TableCell>
                                    <div className="font-semibold text-lg">
                                        {pedido.mesa || "Sin mesa"}
                                    </div>
                                    {pedido.cliente && (
                                        <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                            {pedido.cliente}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-muted-foreground">
                                    #{pedido.nro_reg}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-2 py-1">
                                        {pedido.items?.map((item) => (
                                            <div key={item.id} className="flex flex-col border-b last:border-0 pb-2 last:pb-0 border-dashed border-gray-200">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-bold text-lg min-w-[30px]">
                                                        {Math.floor(parseFloat(item.cantidad))}x
                                                    </span>
                                                    <span className="font-medium text-base">
                                                        {item.nombre || "Item desconocido"}
                                                    </span>
                                                </div>

                                                {item.notas && (
                                                    <div className="text-sm text-destructive font-medium ml-[38px] bg-destructive/5 p-1 rounded w-fit px-2">
                                                        ⚠️ {item.notas}
                                                    </div>
                                                )}

                                                {item.extras && item.extras.length > 0 && (
                                                    <div className="ml-[38px] text-sm text-success space-y-0.5 mt-1">
                                                        {item.extras.map((extra) => (
                                                            <div key={extra.id} className="flex items-center gap-1">
                                                                <span className="font-bold">+</span>
                                                                {extra.nombre || "Extra"}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right align-middle">
                                    <Button
                                        onClick={() => onCompletar(pedido.id)}
                                        disabled={processingId === pedido.id}
                                        className={cn(
                                            "w-full font-bold transition-all",
                                            processingId === pedido.id
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:scale-105 active:scale-95 shadow-md"
                                        )}
                                        variant="default"
                                        size="lg"
                                    >
                                        {processingId === pedido.id ? (
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Terminar
                                            </>
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
