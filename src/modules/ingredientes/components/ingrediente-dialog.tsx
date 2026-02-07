import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import type { CreateIngredienteDto, Ingrediente } from "../types/ingrediente.types";
import { useEffect } from "react";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  unidad: z.string().min(1, "La unidad es requerida"),
  cantidad: z.number().min(0, "La cantidad debe ser mayor o igual a 0"),
  cantidad_minima: z.number().min(0, "La cantidad mínima debe ser mayor o igual a 0"),
});

interface IngredienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateIngredienteDto) => Promise<void>;
  ingredienteToEdit?: Ingrediente | null;
}

export function IngredienteDialog({
  open,
  onOpenChange,
  onSubmit,
  ingredienteToEdit,
}: IngredienteDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      unidad: "kg",
      cantidad: 0,
      cantidad_minima: 0,
    },
  });

  useEffect(() => {
    if (ingredienteToEdit) {
      form.reset({
        nombre: ingredienteToEdit.nombre,
        unidad: ingredienteToEdit.unidad,
        cantidad: Number(ingredienteToEdit.cantidad),
        cantidad_minima: Number(ingredienteToEdit.cantidad_minima),
      });
    } else {
      form.reset({
        nombre: "",
        unidad: "kg",
        cantidad: 0,
        cantidad_minima: 0,
      });
    }
  }, [ingredienteToEdit, form, open]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.2">
        <DialogHeader>
          <DialogTitle>
            {ingredienteToEdit ? "Editar Ingrediente" : "Crear Ingrediente"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Harina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. kg, lt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="cantidad_minima"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Mínima (Alerta)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {ingredienteToEdit ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}