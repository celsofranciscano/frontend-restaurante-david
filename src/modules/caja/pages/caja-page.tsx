import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AbrirCajaForm } from '../components/abrir-caja-form';
import { CajaDashboard } from '../components/caja-dashboard';
import { CerrarCajaForm } from '../components/cerrar-caja-form';
import { HistorialCajasTable } from '../components/historial-cajas-table';
import { HistorialGastosTable } from '../components/historial-gastos-table';
import { Archive, DollarSign, History } from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { useCajaPage } from '../hooks/use-caja-page';
import { Skeleton } from '@/components/ui/skeleton';
// import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';

export function CajaPage() {
  const {
    cajaAbierta,
    isClosing,
    setIsClosing,
    loading,
    historialCajas,
    historialGastos,
    refreshdata,
    handleCajaOpened,
    handleCajaClosed,
  } = useCajaPage();

  //   const navigate = useNavigate();

  if (loading) return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Caja</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Control de efectivo, aperturas y cierres de turno.
            </p>
          </div>
        </div>

        <Tabs defaultValue="gestion" className="space-y-4 w-full">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="inline-flex min-w-full sm:min-w-0 w-auto justify-start">
              <TabsTrigger value="gestion" className="gap-2 flex-1 sm:flex-none min-w-[120px]">
                <DollarSign className="h-4 w-4" />
                Caja Actual
              </TabsTrigger>
              <TabsTrigger
                value="historial-cajas"
                className="gap-2 flex-1 sm:flex-none min-w-[140px]"
                onClick={refreshdata}
              >
                <Archive className="h-4 w-4" />
                Historial Cierres
              </TabsTrigger>
              <TabsTrigger
                value="historial-gastos"
                className="gap-2 flex-1 sm:flex-none min-w-[140px]"
                onClick={refreshdata}
              >
                <History className="h-4 w-4" />
                Historial Gastos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gestion" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
            {cajaAbierta ? (
              isClosing ? (
                <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                  <CerrarCajaForm
                    onCajaClosed={handleCajaClosed}
                    onCancel={() => setIsClosing(false)}
                  />
                </div>
              ) : (
                <CajaDashboard
                  caja={cajaAbierta}
                  onCerrarCajaClick={() => setIsClosing(true)}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2 mb-4 max-w-md mx-auto">
                  <div className="bg-muted/30 p-4 rounded-full w-fit mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Caja Cerrada</h2>
                  <p className="text-muted-foreground">
                    Para comenzar a registrar ventas y movimientos, es necesario realizar la apertura de caja del día.
                  </p>
                </div>
                <AbrirCajaForm onCajaOpened={handleCajaOpened} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial-cajas" className="focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Turnos</CardTitle>
                <CardDescription>Registro de aperturas y cierres de caja anteriores.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <HistorialCajasTable cajas={historialCajas} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial-gastos" className="focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Gastos</CardTitle>
                <CardDescription>Todos los gastos registrados en el sistema.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <HistorialGastosTable gastos={historialGastos} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
