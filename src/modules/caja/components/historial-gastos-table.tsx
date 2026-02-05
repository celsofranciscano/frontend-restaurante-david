import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isValid } from "date-fns";
import type { GastoCajaResponse } from "../types/caja.types";
import { Badge } from "@/components/ui/badge";

interface HistorialGastosTableProps {
  gastos: GastoCajaResponse[];
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "-";
  
  if (dateString.includes(' - ')) {
    return dateString; // Ya viene formateada del backend
  }

  const date = new Date(dateString);
  if (isValid(date)) {
    return format(date, "dd/MM/yyyy HH:mm");
  }
  
  return dateString;
}

export function HistorialGastosTable({ gastos }: HistorialGastosTableProps) {
  if (gastos.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No hay gastos registrados.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gastos.map((gasto) => (
            <TableRow key={gasto.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {formatDateTime(gasto.creado_en)}
              </TableCell>
              <TableCell>{gasto.descripcion}</TableCell>
              <TableCell>
                <Badge variant={gasto.metodo_pago === 'efectivo' ? 'secondary' : 'outline'}>
                  {gasto.metodo_pago.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                 {gasto.usuario_id || 'N/A'}
              </TableCell>
              <TableCell className="text-right font-bold text-red-600">
                - {gasto.monto.toFixed(2)} Bs
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
