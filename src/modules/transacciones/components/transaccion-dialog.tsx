import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { cajaService } from "@/modules/caja/services/caja.service";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
import type {
    CreateTransaccionDto,
    Transaccion,
} from "../types/transaccion.types";

const formSchema = z.object({
    concepto: z.string().min(1, "El concepto es requerido"),
    mesa: z.string().optional(),
    cliente: z.string().optional(),
    estado: z.enum(["pendiente", "abierto", "cerrado"]).optional(),
    caja_id: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type TransaccionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateTransaccionDto) => Promise<void>;
    transaccionToEdit?: Transaccion | null;
    nextNroReg: number;
};



export function TransaccionDialog({
    open,
    onOpenChange,
    onSubmit,
    transaccionToEdit,
    nextNroReg,
}: TransaccionDialogProps) {
    const [cajaActual, setCajaActual] = useState<number | null>(null);
    const [showNoCajaAlert, setShowNoCajaAlert] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            concepto: "",
            mesa: "",
            cliente: "",
            estado: "pendiente",
            caja_id: undefined,
        },
    });

    // Fetch active caja when dialog opens
    useEffect(() => {
        if (open && !transaccionToEdit) {
            const checkCaja = async () => {
                try {
                    const caja = await cajaService.obtenerCajaAbierta();
                    if (!caja) {
                        // No hay caja abierta - mostrar AlertDialog
                        setShowNoCajaAlert(true);
                        onOpenChange(false);
                    } else {
                        setCajaActual(caja.id);
                        form.setValue("caja_id", caja.id);
                    }
                } catch (error) {
                    console.error('Error al verificar caja:', error);
                    setShowNoCajaAlert(true);
                    onOpenChange(false);
                }
            };

            checkCaja();
        }
    }, [open, transaccionToEdit, form, onOpenChange]);

    useEffect(() => {
        if (transaccionToEdit) {
            form.reset({
                concepto: transaccionToEdit.concepto,
                mesa: transaccionToEdit.mesa || "",
                cliente: transaccionToEdit.cliente || "",
                estado: transaccionToEdit.estado,
                caja_id: transaccionToEdit.caja_id || undefined,
            });
        } else {
            form.reset({
                concepto: "",
                mesa: "",
                cliente: "",
                estado: "pendiente",
                caja_id: cajaActual || undefined,
            });
        }
    }, [transaccionToEdit, form, open, cajaActual]);

    const handleSubmit = async (values: FormValues) => {
        const dto: CreateTransaccionDto = {
            nro_reg: transaccionToEdit?.nro_reg || nextNroReg,
            concepto: values.concepto,
            mesa: values.mesa || undefined,
            cliente: values.cliente || undefined,
            estado: values.estado || "pendiente",
            caja_id: values.caja_id || undefined,
        };

        await onSubmit(dto);
        onOpenChange(false);
        form.reset();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {transaccionToEdit ? "Editar Transacción" : "Nueva Transacción"}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="concepto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Concepto</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Concepto o descripción del pedido"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mesa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mesa/Ubicación</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej. Mesa 1, Para llevar, Delivery..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cliente"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre del cliente (opcional)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                                <SelectItem value="abierto">Abierto</SelectItem>
                                                <SelectItem value="cerrado">Cerrado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {cajaActual && !transaccionToEdit && (
                                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                    <span className="text-muted-foreground">Caja activa:</span>{" "}
                                    <span className="font-medium">Caja #{cajaActual}</span>
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
                                <Button type="submit">
                                    {transaccionToEdit ? "Actualizar" : "Crear"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* AlertDialog para caja no abierta */}
            <AlertDialog open={showNoCajaAlert} onOpenChange={setShowNoCajaAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <AlertTriangleIcon className="text-yellow-600" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>No hay una caja abierta</AlertDialogTitle>
                        <AlertDialogDescription>
                            Debe abrir la caja antes de crear transacciones.
                            Vaya a la sección de Caja para abrir una caja nueva.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowNoCajaAlert(false)}>
                            Entendido
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
