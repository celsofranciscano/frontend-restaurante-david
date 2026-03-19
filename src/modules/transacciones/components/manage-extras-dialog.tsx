
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { DetalleItemExtra, AddExtraDto } from "../types/transaccion.types";


const formSchema = z.object({
    precio: z.number().min(0, "El precio debe ser mayor o igual a 0"),
});

type FormValues = z.infer<typeof formSchema>;

type ManageExtrasDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemId: number | null;
    itemName: string;
    extras: DetalleItemExtra[];
    onAddExtra: (dto: AddExtraDto) => Promise<void>;
    onRemoveExtra: (extraId: number) => Promise<void>;
};

export function ManageExtrasDialog({
    open,
    onOpenChange,
    itemId,
    itemName,
    extras,
    onAddExtra,
    onRemoveExtra,
}: ManageExtrasDialogProps) {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            precio: 0,
        },
    });



    // Note: Ingredientes don't have precio field, so price must be entered manually

    const handleSubmit = async (values: FormValues) => {
        const dto: AddExtraDto = {
            descripcion: "Extra",
            precio: values.precio,
            cantidad: 1,
        };

        await onAddExtra(dto);
        form.reset();
    };

    const handleRemove = async (extraId: number) => {
        await onRemoveExtra(extraId);
    };

    if (!itemId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-warning" />
                        Gestionar Extras - {itemName}
                    </DialogTitle>
                </DialogHeader>

                {/* Current Extras */}
                <div className="space-y-3">
                    <h4 className="font-medium text-sm">Extras Actuales:</h4>
                    {extras.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                            No hay extras agregados
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {extras.map((extra) => (
                                <div
                                    key={extra.id}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">
                                            {extra.nombre || extra.descripcion}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Cantidad: {extra.cantidad}
                                        </p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar extra?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Se eliminará "{extra.nombre || extra.descripcion}" de
                                                    este item.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRemove(extra.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Add Extra Form */}
                <div className="space-y-3">
                    <h4 className="font-medium text-sm">Agregar Nuevo Extra:</h4>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="precio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Extra (Instructivos / Extras)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1"
                                >
                                    Cerrar
                                </Button>
                                <Button type="submit" className="flex-1">
                                    <Plus className="h-4 w-4 mr-1" /> Agregar Extra
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
