import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import type { Transaccion } from "@/modules/transacciones/types/transaccion.types";
import { CocinaPedidoCard } from "./cocina-pedido-card";
import { calculateElapsedMinutes } from "../utils/time-utils";

type CocinaPedidosListProps = {
    pedidos: Transaccion[];
};

export function CocinaPedidosList({ pedidos }: CocinaPedidosListProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Pedidos Pendientes</CardTitle>
                    <CardDescription>
                        {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {pedidos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <UtensilsCrossed className="h-16 w-16 mb-4 text-muted-foreground/20" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                            No hay pedidos pendientes
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Los nuevos pedidos aparecerán aquí automáticamente.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((pedido) => {
                            const minutosTranscurridos = calculateElapsedMinutes(
                                pedido.fecha, 
                                pedido.hora
                            );
                            const esTardado = minutosTranscurridos > 20;

                            return (
                                <CocinaPedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    minutosTranscurridos={minutosTranscurridos}
                                    esTardado={esTardado}
                                />
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
