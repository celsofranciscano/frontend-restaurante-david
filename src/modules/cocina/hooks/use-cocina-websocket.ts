import { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";
import { transaccionesService } from "@/modules/transacciones/services/transacciones.service";
import type { Transaccion } from "@/modules/transacciones/types/transaccion.types";

export function useCocinaWebSocket() {
    const [pedidos, setPedidos] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const fetchPedidos = useCallback(async () => {
        try {
            const data = await transaccionesService.getPendientesCocina();
            setPedidos(data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error("Error al cargar pedidos de cocina:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const socketUrl = apiUrl.replace('/api', '');

        const socket = io(`${socketUrl}/cocina`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Conectado al servidor WebSocket de cocina');
            setIsConnected(true);
            toast.success('Conectado al sistema en tiempo real');
        });

        socket.on('disconnect', () => {
            console.log('❌ Desconectado del servidor WebSocket');
            setIsConnected(false);
            toast.error('Desconectado del servidor');
        });

        socket.on('connect_error', (error: Error) => {
            console.error('Error de conexión WebSocket:', error);
            setIsConnected(false);
        });

        socket.on('pedidos-actualizados', (pedidosActualizados: Transaccion[]) => {
            console.log('🔄 Pedidos actualizados recibidos:', pedidosActualizados.length);
            setPedidos(pedidosActualizados);
            setLastUpdate(new Date());
        });

        socket.on('pedido-completado', (pedidoId: number) => {
            console.log('✅ Pedido completado:', pedidoId);
            setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
            setLastUpdate(new Date());
        });

        socket.on('nuevo-pedido', (nuevoPedido: Transaccion) => {
            console.log('🆕 Nuevo pedido recibido:', nuevoPedido);
            toast.info(`Nuevo pedido: ${nuevoPedido.mesa || 'Sin mesa'}`);
            setPedidos((prev) => [...prev, nuevoPedido]);
            setLastUpdate(new Date());
        });

        return () => {
            console.log('Desconectando WebSocket...');
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    return {
        pedidos,
        loading,
        lastUpdate,
        isConnected,
        fetchPedidos,
    };
}
