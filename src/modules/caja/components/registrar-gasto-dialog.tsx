import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cajaService } from "../services/caja.service";
import { toast } from "sonner";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

const registrarGastoSchema = z.object({
  descripcion: z
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres"),
  monto: z
    .string()
    .min(1, "El monto es obligatorio")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0.5, {
      message: "El monto mínimo es 0.50",
    }),
  metodo_pago: z.enum(["efectivo", "qr"]),
});

type RegistrarGastoFormValues = z.infer<typeof registrarGastoSchema>;

interface RegistrarGastoDialogProps {
  onGastoRegistrado: () => void;
}

export function RegistrarGastoDialog({
  onGastoRegistrado,
}: RegistrarGastoDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<RegistrarGastoFormValues>({
    resolver: zodResolver(registrarGastoSchema),
    defaultValues: {
      descripcion: "",
      monto: "",
      metodo_pago: "efectivo",
    },
  });

  const onSubmit: SubmitHandler<RegistrarGastoFormValues> = async (values) => {
    const payload = {
      ...values,
      monto: Number(values.monto),
    };

    await cajaService.registrarGasto(payload);
    toast.success("Gasto registrado exitosamente");
    setOpen(false);
    form.reset();
    onGastoRegistrado();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Registrar Salida/Gasto
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Gasto de Caja</DialogTitle>
          <DialogDescription>
            Registra una salida de dinero. Si seleccionas QR, no afectará el
            saldo en efectivo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Compra de hielo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (Bs)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metodo_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="efectivo">
                        Efectivo (Caja Física)
                      </SelectItem>
                      {/* <SelectItem value="qr">QR / Transferencia</SelectItem> */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
