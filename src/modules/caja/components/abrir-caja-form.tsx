import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { cajaService } from '../services/caja.service';
import { useState, useEffect } from 'react';
import { History, Banknote, Coins, Info } from 'lucide-react';

const abrirCajaSchema = z.object({
  b200: z.number().min(0).optional(),
  b100: z.number().min(0).optional(),
  b50: z.number().min(0).optional(),
  b20: z.number().min(0).optional(),
  b10: z.number().min(0).optional(),
  b5: z.number().min(0).optional(),
  m2: z.number().min(0).optional(),
  m1: z.number().min(0).optional(),
  m050: z.number().min(0).optional(),
  m020: z.number().min(0).optional(),
  m010: z.number().min(0).optional(),
});

type AbrirCajaFormValues = z.infer<typeof abrirCajaSchema>;

type DineroKey = 'b200' | 'b100' | 'b50' | 'b20' | 'b10' | 'b5' | 'm2' | 'm1' | 'm050' | 'm020' | 'm010';

type DineroExtra = {
  key: DineroKey;
  label: string;
  valor: number;
};

const BILLETES: DineroExtra[] = [
  { key: 'b200', label: 'Bs 200', valor: 200 },
  { key: 'b100', label: 'Bs 100', valor: 100 },
  { key: 'b50', label: 'Bs 50', valor: 50 },
  { key: 'b20', label: 'Bs 20', valor: 20 },
  { key: 'b10', label: 'Bs 10', valor: 10 },
];

const MONEDAS: DineroExtra[] = [
  { key: 'b5', label: 'Bs 5', valor: 5 },
  { key: 'm2', label: 'Bs 2', valor: 2 },
  { key: 'm1', label: 'Bs 1', valor: 1 },
  { key: 'm050', label: 'Bs 0.50', valor: 0.5 },
  { key: 'm020', label: 'Bs 0.20', valor: 0.2 },
  { key: 'm010', label: 'Bs 0.10', valor: 0.1 },
];

interface UltimoCierre {
  fecha: string;
  monto_inicial: number;
  ventas_efectivo: number;
  ventas_qr: number;
  total_gastos: number;
  efectivo_esperado: number;
  efectivo_contado?: number;
  diferencia?: number;
  b200?: number;
  b100?: number;
  b50?: number;
  b20?: number;
  b10?: number;
  b5?: number;
  m2?: number;
  m1?: number;
  m050?: number;
  m020?: number;
  m010?: number;
}

interface AbrirCajaFormProps {
  onCajaOpened: () => void;
}

export function AbrirCajaForm({ onCajaOpened }: AbrirCajaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ultimoCierre, setUltimoCierre] = useState<UltimoCierre | null>(null);
  const [loadingLast, setLoadingLast] = useState(true);
  const [applyLastData, setApplyLastData] = useState(true);

  const form = useForm<AbrirCajaFormValues>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: {
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
      b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
    },
  });

  useEffect(() => {
    let mounted = true;
    const fetchLastBox = async () => {
      try {
        setLoadingLast(true);
        const historial = await cajaService.obtenerHistorial(1);
        if (mounted && historial && historial.length > 0) {
          const lastCaja = historial[0];
          
          if (lastCaja.cerrada) {
            const detalle = await cajaService.obtenerDetalleCaja(lastCaja.id);
            setUltimoCierre({
              fecha: lastCaja.fecha,
              monto_inicial: lastCaja.monto_inicial,
              ventas_efectivo: detalle.resumen.ventas_efectivo,
              ventas_qr: detalle.resumen.ventas_qr,
              total_gastos: detalle.resumen.total_gastos,
              efectivo_esperado: detalle.resumen.efectivo_esperado,
              b200: lastCaja.b200 || 0,
              b100: lastCaja.b100 || 0,
              b50: lastCaja.b50 || 0,
              b20: lastCaja.b20 || 0,
              b10: lastCaja.b10 || 0,
              b5: lastCaja.b5 || 0,
              m2: lastCaja.m2 || 0,
              m1: lastCaja.m1 || 0,
              m050: lastCaja.m050 || 0,
              m020: lastCaja.m020 || 0,
              m010: lastCaja.m010 || 0,
            });

            if (applyLastData) {
              form.reset({
                b200: lastCaja.b200 || 0,
                b100: lastCaja.b100 || 0,
                b50: lastCaja.b50 || 0,
                b20: lastCaja.b20 || 0,
                b10: lastCaja.b10 || 0,
                b5: lastCaja.b5 || 0,
                m2: lastCaja.m2 || 0,
                m1: lastCaja.m1 || 0,
                m050: lastCaja.m050 || 0,
                m020: lastCaja.m020 || 0,
                m010: lastCaja.m010 || 0,
              });
            }
          } else {
            setUltimoCierre({
              fecha: lastCaja.fecha,
              monto_inicial: lastCaja.monto_inicial,
              ventas_efectivo: 0,
              ventas_qr: 0,
              total_gastos: 0,
              efectivo_esperado: lastCaja.monto_inicial,
            });
          }
        }
      } catch (error) {
        console.error("Error obteniendo la última caja:", error);
      } finally {
        if (mounted) setLoadingLast(false);
      }
    };
    fetchLastBox();
    return () => { mounted = false; };
  }, [form, applyLastData]);

  const watchedValues = form.watch();

  const calcularTotal = () => {
    let total = 0;
    [...BILLETES, ...MONEDAS].forEach(({ key, valor }) => {
      const cantidad = watchedValues[key as keyof AbrirCajaFormValues] || 0;
      total += cantidad * valor;
    });
    return total;
  };

  const onSubmit = async (values: AbrirCajaFormValues) => {
    try {
      setIsSubmitting(true);
      await cajaService.abrirCaja(values);
      toast.success('Caja abierta exitosamente');
      onCajaOpened();
    } catch (error) {
      console.error(error);
      toast.error('Error al abrir la caja. Es posible que ya exista una abierta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = calcularTotal();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Apertura de Caja</CardTitle>
        </div>
        <CardDescription>
          Ingresa el conteo inicial de efectivo para abrir la caja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ultimoCierre && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Último Cierre ({ultimoCierre.fecha})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Ventas Efectivo:</span>
                <p className="font-semibold text-success">Bs {ultimoCierre.ventas_efectivo.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ventas QR:</span>
                <p className="font-semibold text-info">Bs {ultimoCierre.ventas_qr.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gastos:</span>
                <p className="font-semibold text-destructive">Bs {ultimoCierre.total_gastos.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fondo Inicial Anterior:</span>
                <p className="font-semibold">Bs {ultimoCierre.monto_inicial.toFixed(2)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-muted-foreground">Efectivo Esperado:</span>
                <p className="font-semibold text-primary">Bs {ultimoCierre.efectivo_esperado.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t">
              <input
                type="checkbox"
                id="apply-last-data"
                checked={applyLastData}
                onChange={(e) => {
                  setApplyLastData(e.target.checked);
                  if (e.target.checked && ultimoCierre) {
                    form.reset({
                      b200: ultimoCierre.b200 || 0,
                      b100: ultimoCierre.b100 || 0,
                      b50: ultimoCierre.b50 || 0,
                      b20: ultimoCierre.b20 || 0,
                      b10: ultimoCierre.b10 || 0,
                      b5: ultimoCierre.b5 || 0,
                      m2: ultimoCierre.m2 || 0,
                      m1: ultimoCierre.m1 || 0,
                      m050: ultimoCierre.m050 || 0,
                      m020: ultimoCierre.m020 || 0,
                      m010: ultimoCierre.m010 || 0,
                    });
                  } else {
                    form.reset({
                      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
                      b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
                    });
                  }
                }}
                className="h-4 w-4"
              />
              <label htmlFor="apply-last-data" className="text-sm">
                Usar valores del último cierre como punto de partida
              </label>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Billetes</span>
                </div>
                <div className="space-y-2">
                  {BILLETES.map(({ key, label, valor }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          {...form.register(key as DineroKey, { valueAsNumber: true })}
                          className="w-20 h-8 text-center border rounded-md bg-background"
                          placeholder="0"
                        />
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          Bs {((watchedValues[key] || 0) * valor).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Monedas</span>
                </div>
                <div className="space-y-2">
                  {MONEDAS.map(({ key, label, valor }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(key as DineroKey, { valueAsNumber: true })}
                          className="w-20 h-8 text-center border rounded-md bg-background"
                          placeholder="0"
                        />
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          Bs {((watchedValues[key] || 0) * valor).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
              <p className="text-sm font-medium text-muted-foreground">Total Inicial</p>
              <p className="text-3xl font-bold text-primary">Bs {total.toFixed(2)}</p>
              {ultimoCierre && (
                <p className="text-xs text-muted-foreground mt-1">
                  {ultimoCierre.efectivo_esperado > 0 
                    ? `Último cierre: Bs ${ultimoCierre.efectivo_esperado.toFixed(2)}`
                    : 'Sin datos de cierre anterior'}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || loadingLast}>
              {isSubmitting ? 'Abriendo caja...' : 'Confirmar Apertura'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
