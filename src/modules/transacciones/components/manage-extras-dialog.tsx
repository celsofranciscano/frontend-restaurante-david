import { useState, useEffect } from "react";
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
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { ingredientesService } from "@/modules/ingredientes/services/ingredientes.service";
import type { Ingrediente } from "@/modules/ingredientes/types/ingrediente.types";
import type { DetalleItemExtra, AddExtraDto } from "../types/transaccion.types";
import { toast } from "sonner";

const formSchema = z.object({
    tipo: z.enum(["ingrediente", "custom"]),
    ingrediente_id: z.string().optional(),
    descripcion: z.string().optional(),
    precio: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    cantidad: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
}).refine(
    (data) => {
        if (data.tipo === "ingrediente") {
            return !!data.ingrediente_id;
        } else {
            return !!data.descripcion && data.descripcion.trim().length > 0;
        }
    },
    {
        message: "Debe seleccionar un ingrediente o ingresar una descripción",
        path: ["ingrediente_id"],
    }
);

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
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [loadingIngredientes, setLoadingIngredientes] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: "ingrediente",
            ingrediente_id: "",
            descripcion: "",
            precio: 0,
            cantidad: 1,
        },
    });

    const tipo = form.watch("tipo");

    useEffect(() => {
        if (open) {
            fetchIngredientes();
        }
    }, [open]);

    // Note: Ingredientes don't have precio field, so price must be entered manually

    const fetchIngredientes = async () => {
        try {
            setLoadingIngredientes(true);
            const data = await ingredientesService.getAll();
            setIngredientes(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar ingredientes");
        } finally {
            setLoadingIngredientes(false);
        }
    };

    const handleSubmit = async (values: FormValues) => {
        const dto: AddExtraDto = {
            ingrediente_id: values.tipo === "ingrediente" ? values.ingrediente_id : undefined,
            descripcion: values.tipo === "custom" ? values.descripcion : undefined,
            precio: values.precio,
            cantidad: values.cantidad,
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
                        <Sparkles className="h-5 w-5 text-yellow-600" />
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
                                            Cantidad: {extra.cantidad} | Precio: Bs{" "}
                                            {Number(extra.precio).toFixed(2)}
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
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Extra *</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                form.setValue("ingrediente_id", "");
                                                form.setValue("descripcion", "");
                                                form.setValue("precio", 0);
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ingrediente">
                                                    Ingrediente del inventario
                                                </SelectItem>
                                                <SelectItem value="custom">
                                                    Extra personalizado
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {tipo === "ingrediente" ? (
                                <FormField
                                    control={form.control}
                                    name="ingrediente_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ingrediente *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={
                                                                loadingIngredientes
                                                                    ? "Cargando..."
                                                                    : "Seleccione un ingrediente"
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {ingredientes.map((ingrediente) => (
                                                        <SelectItem key={ingrediente.id} value={ingrediente.id}>
                                                            {ingrediente.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="descripcion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: Extra queso, Doble carne"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Nombre del extra personalizado
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="precio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio *</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="cantidad"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cantidad *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="1"
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
                            </div>

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
