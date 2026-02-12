import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cajaService } from '../services/caja.service';
import { type CajaTurnoResponse, type GastoCajaResponse } from '../types/caja.types';
import { AbrirCajaForm } from '../components/abrir-caja-form';
import { CajaDashboard } from '../components/caja-dashboard';
import { CerrarCajaForm } from '../components/cerrar-caja-form';
import { HistorialCajasTable } from '../components/historial-cajas-table';
import { HistorialGastosTable } from '../components/historial-gastos-table';
import { Archive, DollarSign, History } from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard-layout';

export function CajaPage() {
  const [cajaAbierta, setCajaAbierta] = useState<CajaTurnoResponse | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data for history tabs
  const [historialCajas, setHistorialCajas] = useState<CajaTurnoResponse[]>([]);
  const [historialGastos, setHistorialGastos] = useState<GastoCajaResponse[]>([]);

  const fetchEstadoCaja = async () => {
    try {
      setLoading(true);
      const data = await cajaService.obtenerCajaAbierta();
      setCajaAbierta(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const [cajas, gastos] = await Promise.all([
        cajaService.obtenerHistorial(),
        cajaService.obtenerHistorialGastos()
      ]);
      setHistorialCajas(cajas);
      setHistorialGastos(gastos);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEstadoCaja();
    loadHistory();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-center">Cargando sistema de caja...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Caja</h1>
            <p className="text-muted-foreground">Control de efectivo, aperturas y cierres de turno.</p>
          </div>
        </div>

        <Tabs defaultValue="gestion" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gestion" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Caja Actual
            </TabsTrigger>
            <TabsTrigger value="historial-cajas" className="gap-2" onClick={loadHistory}>
              <Archive className="h-4 w-4" />
              Historial Cierres
            </TabsTrigger>
            <TabsTrigger value="historial-gastos" className="gap-2" onClick={loadHistory}>
              <History className="h-4 w-4" />
              Historial Gastos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gestion" className="space-y-4">
            {cajaAbierta ? (
              isClosing ? (
                <CerrarCajaForm
                  onCajaClosed={() => {
                    setIsClosing(false);
                    fetchEstadoCaja();
                    loadHistory();
                  }}
                  onCancel={() => setIsClosing(false)}
                />
              ) : (
                <CajaDashboard
                  caja={cajaAbierta}
                  onCerrarCajaClick={() => setIsClosing(true)}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center w-full py-2">
                <div className="text-center space-y-2 ">
                  <h2 className="text-2xl font-bold text-muted-foreground/50">Caja Cerrada</h2>
                  <p className="text-muted-foreground">Debes abrir la caja para comenzar a registrar ventas y gastos.</p>
                </div>
                <AbrirCajaForm onCajaOpened={fetchEstadoCaja} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial-cajas">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Turnos</CardTitle>
                <CardDescription>Registro de aperturas y cierres de caja anteriores.</CardDescription>
              </CardHeader>
              <CardContent>
                <HistorialCajasTable cajas={historialCajas} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial-gastos">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Gastos</CardTitle>
                <CardDescription>Todos los gastos registrados en el sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <HistorialGastosTable gastos={historialGastos} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
