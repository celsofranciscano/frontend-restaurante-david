import { useEffect, useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cajaService } from '../services/caja.service';
import { type CajaTurnoResponse, type GastoCajaResponse } from '../types/caja.types';
import { AbrirCajaForm } from '../components/abrir-caja-form';
import { CajaDashboard } from '../components/caja-dashboard';
import { CerrarCajaForm } from '../components/cerrar-caja-form';
import { HistorialCajasTable } from '../components/historial-cajas-table';
import { HistorialGastosTable } from '../components/historial-gastos-table';
import { Archive, DollarSign, History, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { cn } from '@/lib/utils';

type TabValue = 'gestion' | 'historial-cajas' | 'historial-gastos';

const tabsConfig = {
  'gestion': { label: 'Caja Actual', icon: DollarSign },
  'historial-cajas': { label: 'Historial Cierres', icon: Archive },
  'historial-gastos': { label: 'Historial Gastos', icon: History },
} as const;

export function CajaPage() {
  const [cajaAbierta, setCajaAbierta] = useState<CajaTurnoResponse | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('gestion');

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

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    if (value !== 'gestion') {
      loadHistory();
    }
  };

  const goBack = () => {
    if (activeTab === 'historial-gastos') {
      setActiveTab('historial-cajas');
    } else if (activeTab === 'historial-cajas') {
      setActiveTab('gestion');
    }
  };

  const goForward = () => {
    if (activeTab === 'gestion') {
      setActiveTab('historial-cajas');
    } else if (activeTab === 'historial-cajas') {
      setActiveTab('historial-gastos');
    }
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'gestion':
        return 'Gestión de Caja';
      case 'historial-cajas':
        return 'Historial de Cierres';
      case 'historial-gastos':
        return 'Historial de Gastos';
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-center">Cargando sistema de caja...</div>
    </DashboardLayout>
  );

  const tabOrder: TabValue[] = ['gestion', 'historial-cajas', 'historial-gastos'];
  const currentIndex = tabOrder.indexOf(activeTab);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < tabOrder.length - 1;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 sm:py-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Caja</h1>
            <p className="text-muted-foreground text-sm mt-1">{getBreadcrumb()}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goBack}
              disabled={!canGoBack}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {tabOrder.map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "gap-1 sm:gap-2 px-2 sm:px-3",
                    activeTab === tab && "shadow-sm"
                  )}
                >
                  {(() => {
                    const Icon = tabsConfig[tab].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  <span className="hidden sm:inline text-xs sm:text-sm">{tabsConfig[tab].label}</span>
                  <span className="sm:hidden text-xs">{tab === 'gestion' ? 'Caja' : tab === 'historial-cajas' ? 'Cierres' : 'Gastos'}</span>
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goForward}
              disabled={!canGoForward}
              className="gap-1"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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
                  <div className="text-center space-y-2 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-muted-foreground/50">Caja Cerrada</h2>
                    <p className="text-muted-foreground text-sm">Abre la caja para comenzar a registrar ventas y gastos.</p>
                  </div>
                  <AbrirCajaForm onCajaOpened={fetchEstadoCaja} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="historial-cajas">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setActiveTab('gestion')} className="h-8 w-8">
                      <Home className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle>Historial de Turnos</CardTitle>
                      <CardDescription>Registro de aperturas y cierres de caja.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <HistorialCajasTable cajas={historialCajas} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historial-gastos">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setActiveTab('gestion')} className="h-8 w-8">
                      <Home className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle>Historial de Gastos</CardTitle>
                      <CardDescription>Todos los gastos registrados en el sistema.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <HistorialGastosTable gastos={historialGastos} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
