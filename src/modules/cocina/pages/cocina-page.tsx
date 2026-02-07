
import { useCocinaWebSocket } from "../hooks/use-cocina-websocket";
import { CocinaHeader } from "../components/cocina-header";
import { CocinaPedidosList } from "../components/cocina-pedidos-list";

export default function CocinaPage() {
    const { pedidos, loading, lastUpdate, isConnected, fetchPedidos } = useCocinaWebSocket();

    return (
        <div className="space-y-4 p-4">
            <CocinaHeader
                isConnected={isConnected}
                lastUpdate={lastUpdate}
                loading={loading}
                onRefresh={fetchPedidos}
            />
            <CocinaPedidosList pedidos={pedidos} />
        </div>
    );
}
