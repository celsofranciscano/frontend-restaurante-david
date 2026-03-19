import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShoppingBag, Utensils, Plus, AlertTriangle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productosService } from "@/modules/productos/services/productos.service";
import { platosService } from "@/modules/platos/services/platos.service";
import type { Producto } from "@/modules/productos/types/producto.types";
import type { Plato } from "@/modules/platos/types/plato.types";
import type { AddItemDto } from "../types/transaccion.types";
import { toast } from "sonner";

const formSchema = z.object({
    tipo: z.enum(["producto", "plato"]),
    item_id: z.string().min(1, "Debe seleccionar un item"),
    cantidad: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    notas: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AddItemDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: AddItemDto) => Promise<void>;
};

export function AddItemDialog({
    open,
    onOpenChange,
    onSubmit,
}: AddItemDialogProps) {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [selectedItemPrice, setSelectedItemPrice] = useState<number>(0);
    const [selectedItemStock, setSelectedItemStock] = useState<number | null>(null);
    const [selectedItemUnidad, setSelectedItemUnidad] = useState<string>("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: "producto",
            item_id: "",
            cantidad: 1,
            notas: "",
        },
    });

    const tipo = form.watch("tipo");
    const itemId = form.watch("item_id");
    const cantidad = form.watch("cantidad");

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        // Update price and stock when item selection changes
        if (tipo === "producto") {
            const producto = productos.find((p) => p.id === itemId);
            if (producto) {
                setSelectedItemPrice(Number(producto.precio));
                setSelectedItemStock(producto.stock);
                setSelectedItemUnidad(producto.unidad);
            } else {
                setSelectedItemPrice(0);
                setSelectedItemStock(null);
                setSelectedItemUnidad("");
            }
        } else {
            const plato = platos.find((p) => p.id === itemId);
            setSelectedItemPrice(plato ? Number(plato.precio) : 0);
            setSelectedItemStock(null); // Platos don't have stock
            setSelectedItemUnidad("");
        }
    }, [tipo, itemId, productos, platos]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const [productosData, platosData] = await Promise.all([
                productosService.getAll(),
                platosService.getAll(),
            ]);
            setProductos(productosData);
            setPlatos(platosData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar productos y platos");
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (values: FormValues) => {
        const dto: AddItemDto = {
            producto_id: values.tipo === "producto" ? values.item_id : undefined,
            plato_id: values.tipo === "plato" ? values.item_id : undefined,
            cantidad: values.cantidad,
            notas: values.notas || undefined,
        };

        await onSubmit(dto);
        onOpenChange(false);
        form.reset();
    };

    const subtotal = selectedItemPrice * cantidad;
    const currentItems = tipo === "producto" ? productos : platos;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Agregar Item al Pedido
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tipo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Item *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            form.setValue("item_id", ""); // Reset item selection
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="producto">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="h-4 w-4 text-info" />
                                                    Producto
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="plato">
                                                <div className="flex items-center gap-2">
                                                    <Utensils className="h-4 w-4 text-plato" />
                                                    Plato
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="item_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {tipo === "producto" ? "Producto" : "Plato"} *
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        loadingData
                                                            ? "Cargando..."
                                                            : `Seleccione un ${tipo}`
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {currentItems.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No hay {tipo}s disponibles
                                                </div>
                                            ) : (
                                                currentItems.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        <div className="flex items-center justify-between gap-4 w-full">
                                                            <span>{item.nombre}</span>
                                                            <Badge variant="outline" className="ml-auto">
                                                                Bs {Number(item.precio).toFixed(2)}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
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

                        <FormField
                            control={form.control}
                            name="notas"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Especiales</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Sin cebolla, punto medio, etc."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Instrucciones especiales para la cocina
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Stock Warning for Productos */}
                        {tipo === "producto" && selectedItemStock !== null && itemId && (
                            <div className={`rounded-lg p-3 text-sm ${selectedItemStock < cantidad
                                ? "bg-destructive/10 border border-destructive/20"
                                : "bg-muted/50"
                                }`}>
                                <div className="flex items-center gap-2">
                                    {selectedItemStock < cantidad && (
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className="text-muted-foreground">Stock disponible:</span>
                                    <Badge variant={selectedItemStock < cantidad ? "destructive" : "secondary"}>
                                        {selectedItemStock} {selectedItemUnidad}
                                    </Badge>
                                </div>
                                {selectedItemStock < cantidad && (
                                    <p className="text-destructive text-xs mt-2">
                                        ⚠️ Stock insuficiente. Disponible: {selectedItemStock} {selectedItemUnidad}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Price Preview */}
                        {selectedItemPrice > 0 && (
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Precio unitario:</span>
                                    <span className="font-medium">
                                        Bs {selectedItemPrice.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Cantidad:</span>
                                    <span className="font-medium">{cantidad}</span>
                                </div>
                                <div className="flex justify-between font-semibold pt-2 border-t">
                                    <span>Subtotal:</span>
                                    <span className="text-lg">Bs {subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Agregar Item</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
