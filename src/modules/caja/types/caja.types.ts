export interface CajaTurnoResponse {
  id: number;
  fecha: string;
  hora_apertura: string | null;
  hora_cierre: string | null;
  usuario_id: string | null;
  monto_inicial: number;
  b200: number | null;
  b100: number | null;
  b50: number | null;
  b20: number | null;
  b10: number | null;
  b5: number | null;
  m2: number | null;
  m1: number | null;
  m050: number | null;
  m020: number | null;
  m010: number | null;
  ventas_efectivo: number;
  ventas_qr: number;
  total_salidas: number;
  cerrada: boolean | null;
  cierre_obs: string | null;
}

export interface GastoCajaResponse {
  id: number;
  caja_id: number;
  usuario_id: string | null;
  descripcion: string;
  metodo_pago: 'efectivo' | 'qr';
  monto: number;
  creado_en: string | null;
  actualizado_en: string | null;
  borrado_en: string | null;
}

export interface ResumenCierre {
  caja: CajaTurnoResponse;
  resumen: {
    monto_inicial: number;
    ventas_efectivo: number;
    ventas_qr: number;
    gastos_efectivo: number;
    gastos_qr: number;
    efectivo_esperado: number;
    total_qr: number;
    total_del_dia: number;
    total_gastos: number;
    ventas_count?: number;
    promedio_venta?: number;
  };
  gastos: GastoCajaResponse[];
}

export interface CierreCajaResponse {
  caja_id: number;
  fecha: string;
  monto_contado: number;
  efectivo_esperado: number;
  diferencia: number;
  estado_diferencia: 'exacto' | 'sobrante' | 'faltante';
  resumen_completo: ResumenCierre;
}

export interface AbrirCajaDto {
  b200?: number;
  b100?: number;
  b50?: number;
  b20?: number;
  b10?: number;
  b5?: number;
  m2?: number;
  m1?: number;
  m050?: number;
  m020?: number;
  m010?: number;
}

export interface RegistrarGastoDto {
  descripcion: string;
  monto: number;
  metodo_pago: 'efectivo' | 'qr';
}

export interface CerrarCajaDto {
  b200: number;
  b100: number;
  b50: number;
  b20: number;
  b10: number;
  b5: number;
  m2: number;
  m1: number;
  m050: number;
  m020: number;
  m010: number;
  cierre_obs?: string;
}
