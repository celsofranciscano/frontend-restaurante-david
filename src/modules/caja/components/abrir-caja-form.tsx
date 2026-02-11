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
import { MoneyInput } from './money-input';
import { useState } from 'react';

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

interface AbrirCajaFormProps {
  onCajaOpened: () => void;
}

export function AbrirCajaForm({ onCajaOpened }: AbrirCajaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AbrirCajaFormValues>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: {
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0, b5: 0,
      m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
    },
  });

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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Apertura de Caja</CardTitle>
        <CardDescription>
          Ingresa el conteo inicial de efectivo para abrir la caja del día.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <MoneyInput />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Abriendo caja...' : 'Confirmar Apertura'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
