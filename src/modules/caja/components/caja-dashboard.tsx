import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CajaTurnoResponse, ResumenCierre } from '../types/caja.types';
import { cajaService } from '../services/caja.service';
import { RegistrarGastoDialog } from './registrar-gasto-dialog';
import { RegistrarConteoCard } from './registrar-conteo-card';
import { CuadrarCajaDialog } from './cuadrar-caja-dialog';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, Wallet, CreditCard, Lock, Eye, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { transaccionesService } from '../../transacciones/services/transacciones.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DineroValues {
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

interface CajaDashboardProps {
  caja: CajaTurnoResponse;
  onCerrarCajaClick: () => void;
}

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subValue?: string | React.ReactNode;
  highlight?: boolean;
  className?: string;
}

function StatusCard({ title, value, icon, subValue, highlight, className }: StatusCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-xl sm:text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
          Bs {value.toFixed(2)}
        </div>
        {subValue && (
          <div className="text-xs text-muted-foreground mt-1">
            {subValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

export function CajaDashboard({ caja, onCerrarCajaClick }: CajaDashboardProps) {
  const [resumen, setResumen] = useState<ResumenCierre | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const fetchResumen = async () => {
    try {
      setLoading(true);
      const data = await cajaService.obtenerResumenCierre();
      setResumen(data);
    } catch (error) {
      console.error('Error al cargar resumen', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
  }, [caja.id]);

  const handleCerrarCaja = async () => {
    try {
      setIsVerifying(true);
      const transacciones = await transaccionesService.getByCaja(caja.id);
      const hasPending = transacciones.some(t =>
        t.estado === 'pendiente' ||
        t.estado === 'abierto' ||
        Number(t.monto_pendiente) > 0 ||
        t.estado_cocina === 'pendiente'
      );

      if (hasPending) {
        toast.error("Hay pedidos pendientes, abiertos, por pagar o en cocina. Termínelos antes de cerrar caja.");
        return;
      }

      onCerrarCajaClick();
    } catch (error) {
      console.error('Error al validar caja:', error);
      toast.error('Error al verificar pedidos pendientes.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConteoGuardado = (values: DineroValues, total: number) => {
    console.log('Conteo regitrados:', values, total);
    toast.success('Conteo guardado exitosamente');
    fetchResumen();
  };

  if (!resumen && loading) return <DashboardSkeleton />;

  if (!resumen) return <div>Error al cargar información de la caja.</div>;

  const { resumen: datos, gastos } = resumen;

  const valoresIniciales: DineroValues = {
    b200: caja.b200 || 0,
    b100: caja.b100 || 0,
    b50: caja.b50 || 0,
    b20: caja.b20 || 0,
    b10: caja.b10 || 0,
    b5: caja.b5 || 0,
    m2: caja.m2 || 0,
    m1: caja.m1 || 0,
    m050: caja.m050 || 0,
    m020: caja.m020 || 0,
    m010: caja.m010 || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Caja Abierta</h2>
            <Badge variant="default" className="bg-success">Activa</Badge>
          </div>
          <p className="text-muted-foreground capitalize mt-1">
            {caja.fecha} • Hora apertura: {caja.hora_apertura?.split(' - ')[0] || '--:--'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <RegistrarGastoDialog onGastoRegistrado={fetchResumen} />
          <Button variant="outline" onClick={fetchResumen} className="gap-2" disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <CuadrarCajaDialog 
            efectivoEsperado={datos.efectivo_esperado} 
            onCuadrado={fetchResumen}
            cajaId={caja.id}
          />
          <Button variant="outline" onClick={() => navigate('/caja/reporte')} className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Reporte</span>
          </Button>
          <Button variant="destructive" onClick={handleCerrarCaja} disabled={isVerifying} className="gap-2">
            <Lock className="h-4 w-4" />
            {isVerifying ? "Verificando..." : "Cerrar Caja"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Fondo Inicial"
          value={datos.monto_inicial}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatusCard
          title="Ventas Efectivo"
          value={datos.ventas_efectivo}
          icon={<ArrowUpCircle className="h-4 w-4 text-success" />}
          subValue={`+ ${datos.ventas_qr.toFixed(2)} QR`}
        />
        <StatusCard
          title="Gastos/Salidas"
          value={datos.total_gastos}
          icon={<ArrowDownCircle className="h-4 w-4 text-destructive" />}
          className="border-destructive/20 dark:border-destructive/40"
        />
        <StatusCard
          title="Efectivo Esperado"
          value={datos.efectivo_esperado}
          icon={<Wallet className="h-4 w-4 text-primary" />}
          highlight
        />
      </div>

      <RegistrarConteoCard
        efectivoEsperado={datos.efectivo_esperado}
        onGuardar={handleConteoGuardado}
        valoresIniciales={valoresIniciales}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes (Gastos)</CardTitle>
            <CardDescription>Últimos gastos registrados en este turno.</CardDescription>
          </CardHeader>
          <CardContent>
            {gastos.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No hay gastos registrados hoy.
              </p>
            ) : (
              <div className="space-y-3">
                {gastos.slice(0, 5).map((gasto) => (
                  <div key={gasto.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{gasto.descripcion}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={gasto.metodo_pago === 'efectivo' ? 'secondary' : 'outline'} className="text-[10px] h-5 px-1">
                          {gasto.metodo_pago === 'efectivo' ? 'Efectivo' : 'QR'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {gasto.creado_en && gasto.creado_en.includes(' - ')
                            ? gasto.creado_en.split(' - ')[0]
                            : (gasto.creado_en ? format(new Date(gasto.creado_en), 'HH:mm') : '')}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-destructive">
                      - Bs {gasto.monto.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ventas Totales</span>
              <span className="font-bold">Bs {datos.total_del_dia.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Efectivo (Inicial + Ventas)</span>
                <span>{(datos.monto_inicial + datos.ventas_efectivo).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span>Gastos Efectivo</span>
                <span>- {datos.gastos_efectivo.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Debe haber en Caja</span>
                <span className="text-primary">Bs {datos.efectivo_esperado.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="flex items-center gap-2"><CreditCard className="w-3 h-3" /> Monto Total QR</span>
                <span>{datos.total_qr.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
