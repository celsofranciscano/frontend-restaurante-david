import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat } from "lucide-react";

interface TransaccionesStatsTabsProps {
    counts: {
        todos: number;
        pendiente: number;
        abierto: number;
        cerrado: number;
        cocina: number;
    };
}

export function TransaccionesStatsTabs({ counts }: TransaccionesStatsTabsProps) {
    return (
        <TabsList variant="line" className="w-full justify-start border-b">
            <TabsTrigger value="todos">
                Todos ({counts.todos})
            </TabsTrigger>
            <TabsTrigger value="pendiente">
                Pendientes ({counts.pendiente})
            </TabsTrigger>
            <TabsTrigger value="abierto">
                Abiertos ({counts.abierto})
            </TabsTrigger>
            <TabsTrigger value="cerrado">
                Cerrados ({counts.cerrado})
            </TabsTrigger>
            <TabsTrigger value="cocina">
                <ChefHat className="h-4 w-4 mr-2" />
                Cocina ({counts.cocina})
            </TabsTrigger>
        </TabsList>
    );
}
