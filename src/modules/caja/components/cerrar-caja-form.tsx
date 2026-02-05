import { useEffect, useState } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cajaService } from '../services/caja.service';
import { MoneyInput } from './money-input';
import type{ ResumenCierre } from '../types/caja.types';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const cerrarCajaSchema = z.object({
  b200: z.number().min(0),
  b100: z.number().min(0),
  b50: z.number().min(0),
  b20: z.number().min(0),
  b10: z.number().min(0),
  b5: z.number().min(0),
  m2: z.number().min(0),
  m1: z.number().min(0),
  m050: z.number().min(0),
  m020: z.number().min(0),
  m010: z.number().min(0),
  cierre_obs: z.string().optional(),
});

type CerrarCajaFormValues = z.infer<typeof cerrarCajaSchema>;

interface CerrarCajaFormProps {
  onCajaClosed: () => void;
  onCancel: () => void;
}

export function CerrarCajaForm({ onCajaClosed, onCancel }: CerrarCajaFormProps) {
  const [resumen, setResumen] = useState<ResumenCierre | null>(null);
  const [totalContado, setTotalContado] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<CerrarCajaFormValues | null>(null);

  const form = useForm<CerrarCajaFormValues>({
    resolver: zodResolver(cerrarCajaSchema),
    defaultValues: {
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, b5: 0,
      m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
      cierre_obs: '',
    },
  });

  // Calcular total contado en tiempo real
  const values = form.watch();
  useEffect(() => {
    const calc = 
      (values.b200 || 0) * 200 +
      (values.b100 || 0) * 100 +
      (values.b50 || 0) * 50 +
      (values.b20 || 0) * 20 +
      (values.b10 || 0) * 10 +
      (values.b5 || 0) * 5 +
      (values.m2 || 0) * 2 +
      (values.m1 || 0) * 1 +
      (values.m050 || 0) * 0.5 +
      (values.m020 || 0) * 0.2 +
      (values.m010 || 0) * 0.1;
    setTotalContado(calc);
  }, [values]);

  useEffect(() => {
    cajaService.obtenerResumenCierre().then(setResumen).catch(console.error);
  }, []);

  const onSubmit = (values: CerrarCajaFormValues) => {
    setPendingValues(values);
    setShowConfirmDialog(true);
  };

  const handleConfirmClose = async () => {
    if (!pendingValues) return;
    
    try {
      setIsSubmitting(true);
      await cajaService.cerrarCaja(pendingValues);
      toast.success('Caja cerrada exitosamente');
      onCajaClosed();
    } catch (error) {
      console.error(error);
      toast.error('Error al cerrar la caja');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  if (!resumen) return <div>Cargando datos de cierre...</div>;

  const diferencia = totalContado - resumen.resumen.efectivo_esperado;
  const esExacto = Math.abs(diferencia) < 0.1;
  const esSobrante = diferencia > 0;

  return (
    <Card className="w-full max-w-4xl mx-auto border-t-4 border-t-red-500">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Cierre de Caja</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        </CardTitle>
        <CardDescription>
          Realiza el conteo físico final. El sistema comparará con el efectivo esperado.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        
        {/* Columna Izquierda: Formulario de Conteo */}
        <div className="space-y-6">
          <Form {...form}>
            <form id="cierre-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <MoneyInput register={form.register} watch={form.watch} />
              
              <FormField
                control={form.control}
                name="cierre_obs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ej: Sobró dinero porque no se registró una venta manual..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Columna Derecha: Resumen y Comparación */}
        <div className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Arqueo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total en QR (Banco):</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Bs {resumen.resumen.total_qr.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Efectivo Esperado:</span>
                <span className="font-semibold">Bs {resumen.resumen.efectivo_esperado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Efectivo Contado:</span>
                <span className="font-semibold">Bs {totalContado.toFixed(2)}</span>
              </div>
              
              <Separator />

              <div className={`p-4 rounded-md flex items-start gap-3 ${
                esExacto ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                esSobrante ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {esExacto ? <CheckCircle className="w-5 h-5 mt-0.5" /> : 
                 esSobrante ? <Info className="w-5 h-5 mt-0.5" /> : 
                 <AlertTriangle className="w-5 h-5 mt-0.5" />}
                
                <div className="flex-1">
                  <p className="font-bold text-sm">
                    {esExacto ? 'Cuadre Perfecto' : esSobrante ? 'Sobrante' : 'Faltante'}
                  </p>
                  <p className="text-2xl font-bold">
                    {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)} Bs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            form="cierre-form" 
            className="w-full" 
            size="lg" 
            variant={esExacto ? 'default' : 'destructive'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cerrando...' : 'Confirmar Cierre'}
          </Button>
        </div>

      </CardContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de cerrar la caja?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción finalizará el turno actual y registrará el arqueo de caja. 
              No podrá deshacer esta operación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose} className="bg-red-600 hover:bg-red-700">
              Confirmar Cierre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
