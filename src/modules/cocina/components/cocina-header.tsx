import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type CocinaHeaderProps = {
    isConnected: boolean;
    lastUpdate: Date;
    loading: boolean;
    onRefresh: () => void;
};

export function CocinaHeader({
    isConnected,
    lastUpdate,
    loading,
    onRefresh,
}: CocinaHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold tracking-tight">Monitor de Cocina</h2>
                        {isConnected ? (
                            <Badge variant="default" className="bg-green-600">
                                <Wifi className="h-3 w-3 mr-1" />
                                En vivo
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                                <WifiOff className="h-3 w-3 mr-1" />
                                Sin conexión
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lastUpdate.toLocaleTimeString('es-BO', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                        })}
                    </p>
                </div>
            </div>
            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
            >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Actualizar
            </Button>
        </div>
    );
}
