export type Transaccion = {
    id: number;
    nro_reg: number;
    fecha: string;
    hora: string;
    tipo: string;
    concepto: string;
    monto_total: string;
    monto_pagado: string;
    monto_pendiente: string;
    mesa?: string | null;
    cliente?: string | null;
    estado: 'pendiente' | 'abierto' | 'cerrado';
    estado_cocina?: 'pendiente' | 'terminado';
    caja_id?: number | null;
    usuario_id: string;
    creado_en: string;
    actualizado_en: string;
    borrado_en?: string | null;

    // Relaciones extendidas (opcionales)
    items?: DetalleItem[];
    pagos?: Pago[];
};

export type DetalleItem = {
    id: number;
    transaccion_id: number;
    producto_id?: string | null;
    plato_id?: string | null;
    cantidad: string;
    precio_unitario: string;
    subtotal: string;
    notas?: string | null;
    // Joined fields from backend
    nombre?: string;
    producto_nombre?: string | null;
    plato_nombre?: string | null;
    tipo?: 'producto' | 'plato';

    // Relaciones (opcionales para cocina)
    producto?: { nombre: string; precio: number };
    plato?: { nombre: string; precio: number };
    extras?: DetalleItemExtra[];
    ingrediente?: { nombre: string };
};

export type DetalleItemExtra = {
    id: number;
    detalle_item_id: number;
    ingrediente_id?: string | null;
    descripcion?: string | null;
    precio: string;
    cantidad: string;
    // Joined fields from backend
    nombre?: string;
    ingrediente_nombre?: string | null;

    // Relaciones
    ingrediente?: { nombre: string };
};

export type Pago = {
    id: number;
    transaccion_id: number;
    metodo_pago: 'efectivo' | 'qr';
    monto: string;
    monto_recibido?: string | null;
    cambio?: string | null;
    referencia_qr?: string | null;
    usuario_id: string;
    creado_en: string;
};

// DTOs for API requests
export type CreateTransaccionDto = {
    nro_reg: number;
    tipo?: string;
    concepto: string;
    mesa?: string;
    cliente?: string;
    estado?: 'pendiente' | 'abierto' | 'cerrado';
    caja_id?: number;
};

export type UpdateTransaccionDto = {
    concepto?: string;
    mesa?: string;
    cliente?: string;
    estado?: 'pendiente' | 'abierto' | 'cerrado';
};

export type AddItemDto = {
    producto_id?: string;
    plato_id?: string;
    cantidad: number;
    notas?: string;
};

export type AddExtraDto = {
    ingrediente_id?: string;
    descripcion?: string;
    precio: number;
    cantidad?: number;
};

export type CreatePagoDto = {
    metodo_pago: 'efectivo' | 'qr';
    monto: number;
    monto_recibido?: number;
    referencia_qr?: string;
};
