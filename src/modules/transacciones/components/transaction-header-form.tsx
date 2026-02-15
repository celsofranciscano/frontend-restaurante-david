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
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { TransaccionFormValues } from "../types/transaccion.types";

interface TransactionHeaderFormProps {
    form: UseFormReturn<TransaccionFormValues>;
    mesaOpen: boolean;
    setMesaOpen: (open: boolean) => void;
    ubicacion: string[];
}

export function TransactionHeaderForm({
    form,
    mesaOpen,
    setMesaOpen,
    ubicacion,
}: TransactionHeaderFormProps) {
    return (
        <Form {...form}>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="mesa"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Mesa/Ubicación</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input
                                        placeholder="Ej: Mesa 1, Para llevar..."
                                        {...field}
                                        className="pr-10"
                                    />
                                </FormControl>
                                <Popover open={mesaOpen} onOpenChange={setMesaOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            role="combobox"
                                            aria-expanded={mesaOpen}
                                            className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                                        >
                                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                            <span className="sr-only">Toggle options</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0" align="end">
                                        <Command>
                                            <CommandList>
                                                <CommandGroup>
                                                    {ubicacion.map((ubic) => (
                                                        <CommandItem
                                                            key={ubic}
                                                            value={ubic}
                                                            onSelect={(currentValue) => {
                                                                const originalValue = ubicacion.find((u) => u.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                                                                form.setValue("mesa", originalValue === field.value ? "" : originalValue);
                                                                setMesaOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    field.value === ubic
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {ubic}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
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
                                <Input placeholder="Nombre del cliente" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="concepto"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Pedido" {...field} hidden />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
