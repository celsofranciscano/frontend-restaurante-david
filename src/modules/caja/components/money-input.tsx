import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useFormContext, useWatch } from 'react-hook-form';
import { Banknote, Coins } from 'lucide-react';

interface MoneyInputProps {
  isReadOnly?: boolean;
}

const BILLETES = [
  { key: 'b200', label: 'Bs 200', valor: 200 },
  { key: 'b100', label: 'Bs 100', valor: 100 },
  { key: 'b50', label: 'Bs 50', valor: 50 },
  { key: 'b20', label: 'Bs 20', valor: 20 },
  { key: 'b10', label: 'Bs 10', valor: 10 },
] as const;

const MONEDAS = [
  { key: 'b5', label: 'Bs 5', valor: 5 },
  { key: 'm2', label: 'Bs 2', valor: 2 },
  { key: 'm1', label: 'Bs 1', valor: 1 },
  { key: 'm050', label: 'Bs 0.50', valor: 0.5 },
  { key: 'm020', label: 'Bs 0.20', valor: 0.2 },
  { key: 'm010', label: 'Bs 0.10', valor: 0.1 },
] as const;

// Función helper para convertir a número
const toNumber = (val: unknown): number => {
  if (val === undefined || val === null || val === '') return 0;
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

export function MoneyInput({ isReadOnly = false }: MoneyInputProps) {
  const { register, control } = useFormContext();

  // Usar useWatch para suscribirse a los cambios de manera eficiente
  const valores = useWatch({
    control,
  });

  // Calcular totales (derived state)
  const totalBilletes = BILLETES.reduce((acc, billete) => {
    const cantidad = toNumber(valores[billete.key]);
    return acc + cantidad * billete.valor;
  }, 0);

  const totalMonedas = MONEDAS.reduce((acc, moneda) => {
    const cantidad = toNumber(valores[moneda.key]);
    return acc + cantidad * moneda.valor;
  }, 0);

  const totalGeneral = totalBilletes + totalMonedas;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Grid Layout: Bills and Coins side by side on large screens */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Billetes Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              BILLETES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Denominación</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">Cantidad</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BILLETES.map((den) => {
                  const cantidad = toNumber(valores[den.key]);
                  const total = cantidad * den.valor;
                  return (
                    <TableRow key={den.key}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {den.label}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="0"
                          readOnly={isReadOnly}
                          className={`text-center h-7 sm:h-8 w-full max-w-[80px] mx-auto text-xs sm:text-sm ${isReadOnly ? 'bg-muted' : ''
                            }`}
                          {...register(den.key, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs sm:text-sm">
                        Bs {total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-info-bg dark:bg-info-bg font-bold">
                  <TableCell colSpan={2} className="text-xs sm:text-sm">
                    Total Billetes
                  </TableCell>
                  <TableCell className="text-right font-mono text-info text-xs sm:text-sm">
                    Bs {totalBilletes.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Monedas Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              MONEDAS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Denominación</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">Cantidad</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MONEDAS.map((den) => {
                  const cantidad = toNumber(valores[den.key]);
                  const total = cantidad * den.valor;
                  return (
                    <TableRow key={den.key}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {den.label}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="0"
                          readOnly={isReadOnly}
                          className={`text-center h-7 sm:h-8 w-full max-w-[80px] mx-auto text-xs sm:text-sm ${isReadOnly ? 'bg-muted' : ''
                            }`}
                          {...register(den.key, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs sm:text-sm">
                        Bs {total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-info-bg dark:bg-info-bg font-bold">
                  <TableCell colSpan={2} className="text-xs sm:text-sm">
                    Total Monedas
                  </TableCell>
                  <TableCell className="text-right font-mono text-info text-xs sm:text-sm">
                    Bs {totalMonedas.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Total General */}
      <Card className="bg-primary/10 dark:bg-primary/20 border-primary/20">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="font-bold text-base sm:text-lg">TOTAL EFECTIVO</span>
          <span className="font-mono font-bold text-xl sm:text-2xl text-primary">
            Bs {totalGeneral.toFixed(2)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}