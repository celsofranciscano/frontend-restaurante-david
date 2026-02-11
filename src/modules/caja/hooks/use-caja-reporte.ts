import { useState, useEffect, useCallback } from 'react';
import { cajaService } from '../services/caja.service';
import { transaccionesService } from '@/modules/transacciones/services/transacciones.service';
import type { CajaTurnoResponse, ResumenCierre } from '../types/caja.types';
import type { Transaccion } from '@/modules/transacciones/types/transaccion.types';
import { toast } from 'sonner';

export function useCajaReporte() {
    const [caja, setCaja] = useState<CajaTurnoResponse | null>(null);
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [resumen, setResumen] = useState<ResumenCierre | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCajaActual = useCallback(async () => {
        try {
            setLoading(true);
            const cajaData = await cajaService.obtenerCajaAbierta();

            if (!cajaData) {
                // No hay caja abierta, está bien, el componente manejará esto
                setLoading(false);
                return;
            }

            setCaja(cajaData);

            // Obtener transacciones y resumen en paralelo
            const [txs, res] = await Promise.all([
                transaccionesService.getByCaja(cajaData.id),
                cajaService.obtenerResumenCierre()
            ]);

            setTransacciones(txs);
            setResumen(res);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos de caja');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCajaActual();
    }, [fetchCajaActual]);

    return {
        caja,
        transacciones,
        resumen,
        loading,
        refreshData: fetchCajaActual
    };
}
