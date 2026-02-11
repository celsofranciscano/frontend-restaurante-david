import { useState, useEffect, useCallback } from 'react';
import { cajaService } from '../services/caja.service';
import type { CajaTurnoResponse, GastoCajaResponse } from '../types/caja.types';
import { toast } from 'sonner';

export function useCajaPage() {
    const [cajaAbierta, setCajaAbierta] = useState<CajaTurnoResponse | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data for history tabs
    const [historialCajas, setHistorialCajas] = useState<CajaTurnoResponse[]>([]);
    const [historialGastos, setHistorialGastos] = useState<GastoCajaResponse[]>([]);

    const fetchEstadoCaja = useCallback(async () => {
        try {
            setLoading(true);
            const data = await cajaService.obtenerCajaAbierta();
            setCajaAbierta(data);
        } catch (error) {
            console.error(error);
            // No mostrar error si simplemente no hay caja abierta (404 o similar), 
            // pero si es error de red sí. 
            // Asumimos que el servicio maneja errores graves o devuelve null.
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const [cajas, gastos] = await Promise.all([
                cajaService.obtenerHistorial(),
                cajaService.obtenerHistorialGastos()
            ]);
            setHistorialCajas(cajas);
            setHistorialGastos(gastos);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar historial');
        }
    }, []);

    useEffect(() => {
        fetchEstadoCaja();
        loadHistory();
    }, [fetchEstadoCaja, loadHistory]);

    const handleCajaOpened = () => {
        fetchEstadoCaja();
        loadHistory();
    };

    const handleCajaClosed = () => {
        setIsClosing(false);
        fetchEstadoCaja();
        loadHistory();
    };

    return {
        cajaAbierta,
        isClosing,
        setIsClosing,
        loading,
        historialCajas,
        historialGastos,
        refreshdata: loadHistory,
        handleCajaOpened,
        handleCajaClosed,
    };
}
