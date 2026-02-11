import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CajaTurnoResponse, ResumenCierre } from '../types/caja.types';
import { cajaService } from '../services/caja.service';
import { RegistrarGastoDialog } from './registrar-gasto-dialog';
import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
import { ArrowDownCircle, ArrowUpCircle, Wallet, CreditCard, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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



export function CajaDashboard({ caja, onCerrarCajaClick }: CajaDashboardProps) {
  const [resumen, setResumen] = useState<ResumenCierre | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (!resumen && loading) return <DashboardSkeleton />;

  if (!resumen) return <div>Error al cargar información de la caja.</div>;

  const { resumen: datos, gastos } = resumen;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Caja Abierta</h2>
          <p className="text-muted-foreground capitalize">
            {caja.fecha}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <RegistrarGastoDialog onGastoRegistrado={fetchResumen} />
          <Button variant="outline" onClick={() => navigate('/caja/reporte')} className="gap-2 flex-1 md:flex-none">
            <CreditCard className="h-4 w-4" />
            Reporte
          </Button>
          <Button variant="default" onClick={onCerrarCajaClick} className="gap-2 flex-1 md:flex-none">
            <Lock className="h-4 w-4" />
            Cerrar Caja
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Fondo Inicial"
          value={datos.monto_inicial}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatusCard
          title="Ventas Efectivo"
          value={datos.ventas_efectivo}
          icon={<ArrowUpCircle className="h-4 w-4 text-green-500" />}
          subValue={`+ ${datos.ventas_qr.toFixed(2)} QR`}
        />
        <StatusCard
          title="Gastos/Salidas"
          value={datos.total_gastos}
          icon={<ArrowDownCircle className="h-4 w-4 text-red-500" />}
          className="border-red-200 dark:border-red-900"
        />
        <StatusCard
          title="Efectivo Esperado"
          value={datos.efectivo_esperado}
          icon={<Wallet className="h-4 w-4 text-primary" />}
          highlight
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
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
              <div className="space-y-4">
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
                    <div className="font-bold text-red-500">
                      - Bs {gasto.monto.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Resumen Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="flex justify-between text-sm text-red-500">
                <span>Gastos Efectivo</span>
                <span>- {datos.gastos_efectivo.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Debe haber en Caja</span>
                <span>Bs {datos.efectivo_esperado.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="flex items-center gap-2"><CreditCard className="w-3 h-3" /> Total QR</span>
                <span>{datos.total_qr.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusCard({ title, value, icon, subValue, highlight, className }: StatusCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
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
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-50" />
          <Skeleton className="h-4 w-50" />
        </div>
        <Skeleton className="h-10 w-50" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-30" />
        ))}
      </div>
    </div>
  );
}
