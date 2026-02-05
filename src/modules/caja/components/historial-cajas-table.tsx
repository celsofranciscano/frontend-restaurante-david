import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isValid } from "date-fns";

import { Badge } from "@/components/ui/badge";
import type { CajaTurnoResponse } from "../types/caja.types";

interface HistorialCajasTableProps {
  cajas: CajaTurnoResponse[];
}

const formatTime = (dateString: string | null) => {
  if (!dateString) return "-";
  // Si viene en formato "HH:mm - dd/MM/yyyy" (Backend Interceptor)
  if (dateString.includes(' - ')) {
    return dateString.split(' - ')[0]; // Retorna HH:mm
  }
  
  // Intenta parsear como ISO
  const date = new Date(dateString);
  if (isValid(date)) {
    return format(date, "HH:mm");
  }

  return dateString;
};

const formatDate = (dateString: string) => {
  // caja.fecha suele ser "YYYY-MM-DD"
  const date = new Date(dateString + 'T12:00:00');
  if (isValid(date)) {
    return format(date, "dd/MM/yyyy");
  }
  return dateString;
}

export function HistorialCajasTable({ cajas }: HistorialCajasTableProps) {
  if (cajas.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No hay historial de cajas.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Apertura</TableHead>
            <TableHead>Cierre</TableHead>
            <TableHead>Inicial</TableHead>
            <TableHead>Ventas</TableHead>
            <TableHead>Salidas</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cajas.map((caja) => (
            <TableRow key={caja.id}>
              <TableCell className="font-medium">
                {formatDate(caja.fecha)}
              </TableCell>
              <TableCell>
                {formatTime(caja.hora_apertura)}
              </TableCell>
              <TableCell>
                 {formatTime(caja.hora_cierre)}
              </TableCell>
              <TableCell>Bs {caja.monto_inicial.toFixed(2)}</TableCell>
              <TableCell className="text-green-600 font-semibold">
                Bs {(caja.ventas_efectivo + caja.ventas_qr).toFixed(2)}
              </TableCell>
              <TableCell className="text-red-600">
                Bs {caja.total_salidas.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant={caja.cerrada ? "default" : "destructive"}>
                  {caja.cerrada ? "Cerrada" : "Abierta"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
