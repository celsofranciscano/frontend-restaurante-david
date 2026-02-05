import axiosInstance from '@/lib/axios';
import type {   AbrirCajaDto,
  CajaTurnoResponse,
  CerrarCajaDto,
  CierreCajaResponse,
  GastoCajaResponse,
  RegistrarGastoDto,
  ResumenCierre, } from '../types/caja.types';

export const cajaService = {
  abrirCaja: async (dto: AbrirCajaDto): Promise<CajaTurnoResponse> => {
    const { data } = await axiosInstance.post('/caja/abrir', dto);
    return data;
  },

  obtenerCajaAbierta: async (): Promise<CajaTurnoResponse | null> => {
    // Si retorna 200 con body null es que no hay caja, si retorna 200 con objeto es la caja.
    // El backend dice: status 200, schema type object OR null.
    const { data } = await axiosInstance.get('/caja/actual');
    return data || null;
  },

  registrarGasto: async (dto: RegistrarGastoDto): Promise<GastoCajaResponse> => {
    const { data } = await axiosInstance.post('/caja/gastos', dto);
    return data;
  },

  obtenerResumenCierre: async (): Promise<ResumenCierre> => {
    const { data } = await axiosInstance.get('/caja/resumen');
    return data;
  },

  cerrarCaja: async (dto: CerrarCajaDto): Promise<CierreCajaResponse> => {
    const { data } = await axiosInstance.post('/caja/cerrar', dto);
    return data;
  },

  obtenerHistorial: async (limit = 10): Promise<CajaTurnoResponse[]> => {
    const { data } = await axiosInstance.get(`/caja/historial?limit=${limit}`);
    return data;
  },
  
  obtenerHistorialGastos: async (limit = 50): Promise<GastoCajaResponse[]> => {
    const { data } = await axiosInstance.get(`/caja/gastos/historial?limit=${limit}`);
    return data;
  }
};
