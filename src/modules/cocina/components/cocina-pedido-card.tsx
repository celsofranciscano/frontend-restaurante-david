import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaccion } from "@/modules/transacciones/types/transaccion.types";
import { CocinaItemsTable } from "./cocina-items-table";

type CocinaPedidoCardProps = {
    pedido: Transaccion;
    minutosTranscurridos: number;
    esTardado: boolean;
};
export function CocinaPedidoCard({
    pedido,
    minutosTranscurridos,
    esTardado
}: CocinaPedidoCardProps) {
    return (
        <Card
            className={cn(
                "border-2",
                esTardado ? "border-destructive bg-destructive/5" : ""
            )}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className="text-xl font-mono font-bold px-3 py-1"
                        >
                            #{pedido.nro_reg}
                        </Badge>

                        <span className="text-3xl font-extrabold">
                            {pedido.mesa || pedido.concepto || "Sin mesa"}
                        </span>

                        {pedido.cliente && (
                            <span className="text-lg text-muted-foreground">
                                ({pedido.cliente})
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge
                            variant={esTardado ? "destructive" : "secondary"}
                            className="text-xl px-3 py-1"
                        >
                            <Timer className="h-5 w-5 mr-2" />
                            {minutosTranscurridos} min
                        </Badge>

                        <span className="text-xl font-mono font-bold text-primary">
                            {pedido.hora ? pedido.hora.split(" - ")[0] : "--:--"}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <CocinaItemsTable items={pedido.items || []} />
            </CardContent>
        </Card>
    );
}
