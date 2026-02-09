import { Eye, Edit, Trash2, CreditCard, CheckCircle2, Clock, ChefHat, AlertCircle } from "lucide-react";
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
import type { Transaccion } from "../types/transaccion.types";
import { formatDate, formatTime } from "@/utils/date-format";

type TransaccionesTableProps = {
    transacciones: Transaccion[];
    onView: (transaccion: Transaccion) => void;
    onEdit: (transaccion: Transaccion) => void;
    onDelete: (id: number) => void;
    onPay: (transaccion: Transaccion) => void;
};

const getEstadoBadge = (estado: string) => {
    switch (estado) {
        case "pendiente":
            return (
                <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pendiente
                </Badge>
            );
        case "abierto":
            return (
                <Badge variant="default" className="gap-1 bg-blue-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Abierto
                </Badge>
            );
        case "cerrado":
            return (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Cerrado
                </Badge>
            );
        default:
            return <Badge variant="secondary">{estado}</Badge>;
    }
};

const getPendientesBadges = (montoPendiente: string, estadoCocina?: string) => {
    const pendientePago = parseFloat(montoPendiente) > 0;
    const pendienteCocina = estadoCocina === 'pendiente';
    
    if (!pendientePago && !pendienteCocina) {
        return (
            <div className="flex items-center gap-1">
                <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Completo
                </Badge>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-1">
            {pendienteCocina && (
                <Badge variant="destructive" className="gap-1 text-xs">
                    <ChefHat className="h-3 w-3" />
                    Falta terminar en cocina
                </Badge>
            )}
            {pendientePago && (
                <Badge variant="destructive" className="gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    Falta pagar
                </Badge>
            )}
        </div>
    );
};

export function TransaccionesTable({
    transacciones,
    onView,
    onEdit,
    onDelete,
    onPay,
}: TransaccionesTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Nro.</TableHead>
                        <TableHead className="w-[100px]">Fecha</TableHead>
                        <TableHead className="w-[80px]">Hora</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Mesa</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Pendiente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Pendientes</TableHead>
                        <TableHead className="text-right w-[250px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transacciones.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                No hay transacciones registradas
                            </TableCell>
                        </TableRow>
                    ) : (
                        transacciones.map((transaccion) => {
                            const montoPendiente = parseFloat(transaccion.monto_pendiente);
                            const isPagado = !isNaN(montoPendiente) && montoPendiente === 0;
                            const isCerrado = transaccion.estado === "cerrado";

                            return (
                                <TableRow key={transaccion.id}>
                                    <TableCell className="font-medium">
                                        #{transaccion.nro_reg}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(transaccion.fecha)}
                                    </TableCell>
                                    <TableCell>
                                        {formatTime(transaccion.hora)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {/* {transaccion.mesa && (
                                                <div className="font-medium">{transaccion.concepto}</div>
                                            )} */}
                                            {transaccion.cliente && (
                                                <div className="text-sm text-muted-foreground">
                                                    {transaccion.cliente}
                                                </div>
                                            )}
                                            {!transaccion.mesa && !transaccion.cliente && (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{transaccion.concepto}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        Bs {parseFloat(transaccion.monto_total).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isNaN(montoPendiente) ? (
                                            <span className="text-destructive">Error</span>
                                        ) : (
                                            <span className={montoPendiente > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                                                Bs {montoPendiente.toFixed(2)}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getEstadoBadge(transaccion.estado)}
                                    </TableCell>
                                    <TableCell>
                                        {getPendientesBadges(transaccion.monto_pendiente, transaccion.estado_cocina)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onView(transaccion)}
                                                title="Ver detalles del pedido"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Registrar pedidos
                                            </Button>

                                            {!isPagado && !isCerrado && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => onPay(transaccion)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                    title="Procesar pago"
                                                >
                                                    <CreditCard className="h-4 w-4 mr-1" />
                                                    Pagar
                                                </Button>
                                            )}

                                            {!isCerrado && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(transaccion)}
                                                    title="Editar transacción"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm("¿Está seguro de eliminar esta transacción?")) {
                                                        onDelete(transaccion.id);
                                                    }
                                                }}
                                                className="text-destructive hover:text-destructive"
                                                title="Eliminar transacción"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
