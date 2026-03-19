import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { useState } from 'react';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

type DineroKey = 'b200' | 'b100' | 'b50' | 'b20' | 'b10' | 'b5' | 'm2' | 'm1' | 'm050' | 'm020' | 'm010';

const cuadrarCajaSchema = z.object({
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

type CuadrarCajaFormValues = z.infer<typeof cuadrarCajaSchema>;

interface DineroExtra {
  key: DineroKey;
  label: string;
  valor: number;
}

interface CuadrarCajaDialogProps {
  efectivoEsperado: number;
  onCuadrado?: () => void;
  cajaId: number;
}

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

export function CuadrarCajaDialog({ efectivoEsperado, onCuadrado }: CuadrarCajaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CuadrarCajaFormValues>({
    resolver: zodResolver(cuadrarCajaSchema),
    defaultValues: {
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
      b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
    },
  });

  const watchedValues = form.watch();

  const calcularTotal = (): number => {
    let total = 0;
    [...BILLETES, ...MONEDAS].forEach(({ key, valor }) => {
      const cantidad = watchedValues[key] || 0;
      total += cantidad * valor;
    });
    return total;
  };

  const totalContado = calcularTotal();
  const diferencia = totalContado - efectivoEsperado;
  const esExacto = Math.abs(diferencia) < 0.01;
  const esSobrante = diferencia > 0;
  const esFaltante = diferencia < 0;

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const total = calcularTotal();
      toast.success('Cuadre guardado exitosamente', {
        description: `Total contado: Bs ${total.toFixed(2)} - Diferencia: Bs ${diferencia.toFixed(2)}`
      });
      setOpen(false);
      form.reset();
      onCuadrado?.();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el cuadre');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Scale className="h-4 w-4" />
          Cuadrar Caja
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Cuadrar Caja
          </DialogTitle>
          <DialogDescription>
            Registra el conteo físico actual. Esto no cierra la caja, solo guarda el arqueo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Efectivo Esperado:</span>
              <span className="font-semibold">Bs {efectivoEsperado.toFixed(2)}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Billetes</h4>
                  <div className="space-y-2">
                    {BILLETES.map(({ key, label, valor }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            {...form.register(key, { valueAsNumber: true })}
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
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Monedas</h4>
                  <div className="space-y-2">
                    {MONEDAS.map(({ key, label, valor }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            {...form.register(key, { valueAsNumber: true })}
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

              <div className={cn(
                "p-4 rounded-lg border text-center",
                esExacto && "bg-success-bg border-success-border text-success",
                esSobrante && "bg-info-bg border-info-border text-info",
                esFaltante && "bg-destructive/5 border-destructive/20 text-destructive",
                !esExacto && !esSobrante && !esFaltante && "bg-muted"
              )}>
                <p className="text-sm font-medium">Total Contado</p>
                <p className="text-2xl font-bold">Bs {totalContado.toFixed(2)}</p>
                <p className="text-sm mt-1">
                  {esExacto && "¡Cuadre perfecto!"}
                  {esSobrante && `Sobrante: Bs ${diferencia.toFixed(2)}`}
                  {esFaltante && `Faltante: Bs ${Math.abs(diferencia).toFixed(2)}`}
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cuadre'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
