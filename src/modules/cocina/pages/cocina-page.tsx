
import { useCocinaWebSocket } from "../hooks/use-cocina-websocket";
import { CocinaPedidosList } from "../components/cocina-pedidos-list";

export default function CocinaPage() {
    const { pedidos } = useCocinaWebSocket();

    return (
        <div className="space-y-0">
            {/* <CocinaHeader
                isConnected={isConnected}
                lastUpdate={lastUpdate}
                loading={loading}
                onRefresh={fetchPedidos}
            /> */}
            <CocinaPedidosList pedidos={pedidos} />
        </div>
    );
}
