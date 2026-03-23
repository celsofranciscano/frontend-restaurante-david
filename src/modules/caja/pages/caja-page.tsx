import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cajaService } from "../services/caja.service";
import type { CajaTurnoResponse, GastoCajaResponse } from "../types/caja.types";
import { AbrirCajaForm } from "../components/abrir-caja-form";
import { CajaDashboard } from "../components/caja-dashboard";
import { CerrarCajaForm } from "../components/cerrar-caja-form";
import { HistorialCajasTable } from "../components/historial-cajas-table";
import { HistorialGastosTable } from "../components/historial-gastos-table";
import {
  Archive,
  DollarSign,
  History,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { cn } from "@/lib/utils";

type TabValue = "gestion" | "historial-cajas" | "historial-gastos";

interface TabConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortLabel: string;
}

const TABS: Record<TabValue, TabConfig> = {
  gestion: {
    label: "Caja Actual",
    shortLabel: "Caja",
    icon: DollarSign,
  },
  "historial-cajas": {
    label: "Historial Cierres",
    shortLabel: "Cierres",
    icon: Archive,
  },
  "historial-gastos": {
    label: "Historial Gastos",
    shortLabel: "Gastos",
    icon: History,
  },
} as const;

const TAB_ORDER: TabValue[] = [
  "gestion",
  "historial-cajas",
  "historial-gastos",
];

interface CajaPageState {
  cajaAbierta: CajaTurnoResponse | null;
  historialCajas: CajaTurnoResponse[];
  historialGastos: GastoCajaResponse[];
  isClosing: boolean;
  loading: boolean;
  activeTab: TabValue;
}

export function CajaPage() {
  const [state, setState] = useState<CajaPageState>({
    cajaAbierta: null,
    historialCajas: [],
    historialGastos: [],
    isClosing: false,
    loading: true,
    activeTab: "gestion",
  });

  const fetchEstadoCaja = useCallback(async () => {
    try {
      const data = await cajaService.obtenerCajaAbierta();
      setState((prev) => ({ ...prev, cajaAbierta: data }));
    } catch (err) {
      console.error("Error al obtener caja abierta:", err);
    }
  }, []);

  const fetchHistorial = useCallback(async () => {
    try {
      const [cajas, gastos] = await Promise.all([
        cajaService.obtenerHistorial(),
        cajaService.obtenerHistorialGastos(),
      ]);
      setState((prev) => ({
        ...prev,
        historialCajas: cajas,
        historialGastos: gastos,
      }));
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await Promise.all([fetchEstadoCaja(), fetchHistorial()]);
    setState((prev) => ({ ...prev, loading: false }));
  }, [fetchEstadoCaja, fetchHistorial]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleTabChange = (value: string) => {
    const newTab = value as TabValue;
    setState((prev) => ({ ...prev, activeTab: newTab }));

    if (newTab !== "gestion") {
      fetchHistorial();
    }
  };

  const navigateTab = (direction: "prev" | "next") => {
    setState((prev) => {
      const currentIdx = TAB_ORDER.indexOf(prev.activeTab);
      let nextIdx = currentIdx;

      if (direction === "prev" && currentIdx > 0) {
        nextIdx = currentIdx - 1;
      } else if (direction === "next" && currentIdx < TAB_ORDER.length - 1) {
        nextIdx = currentIdx + 1;
      }

      const nextTab = TAB_ORDER[nextIdx];
      if (nextTab !== prev.activeTab) {
        if (nextTab !== "gestion") {
          fetchHistorial();
        }
        return { ...prev, activeTab: nextTab };
      }
      return prev;
    });
  };

  const goBack = () => navigateTab("prev");
  const goForward = () => navigateTab("next");

  const getBreadcrumb = (tab: TabValue): string => {
    switch (tab) {
      case "gestion":
        return "Gestión de Caja";
      case "historial-cajas":
        return "Historial de Cierres";
      case "historial-gastos":
        return "Historial de Gastos";
    }
  };

  const currentIndex = TAB_ORDER.indexOf(state.activeTab);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < TAB_ORDER.length - 1;

  if (state.loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Cargando sistema de caja...</div>
      </DashboardLayout>
    );
  }

  const renderGestionContent = () => {
    if (state.cajaAbierta) {
      if (state.isClosing) {
        return (
          <CerrarCajaForm
            onCajaClosed={() => {
              setState((s) => ({ ...s, isClosing: false }));
              fetchEstadoCaja();
              fetchHistorial();
            }}
            onCancel={() => setState((s) => ({ ...s, isClosing: false }))}
          />
        );
      }

      return (
        <CajaDashboard
          caja={state.cajaAbierta}
          onCerrarCajaClick={() => setState((s) => ({ ...s, isClosing: true }))}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full py-8">
        <div className="text-center space-y-3 mb-6">
          <h2 className="text-2xl font-bold text-muted-foreground/70">
            Caja Cerrada
          </h2>
          <p className="text-muted-foreground">
            Abre la caja para comenzar a registrar ventas y gastos.
          </p>
        </div>
        <AbrirCajaForm onCajaOpened={fetchEstadoCaja} />
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 sm:py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Gestión de Caja
            </h1>
            <p className="text-muted-foreground mt-1">
              {getBreadcrumb(state.activeTab)}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            disabled={!canGoBack}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 border">
            {TAB_ORDER.map((tab) => {
              const { icon: Icon, label, shortLabel } = TABS[tab];
              const isActive = state.activeTab === tab;

              return (
                <Button
                  key={tab}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "gap-1.5 px-3 sm:px-4 transition-all",
                    isActive && "shadow-sm",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{label}</span>
                  <span className="sm:hidden text-xs">{shortLabel}</span>
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goForward}
            disabled={!canGoForward}
            className="gap-1.5"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <Tabs
          value={state.activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsContent value="gestion" className="mt-2 space-y-4">
            {renderGestionContent()}
          </TabsContent>

          <TabsContent value="historial-cajas">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTabChange("gestion")}
                    className="h-8 w-8"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle>Historial de Turnos</CardTitle>
                    <CardDescription>
                      Registro de aperturas y cierres de caja
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HistorialCajasTable cajas={state.historialCajas} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial-gastos">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTabChange("gestion")}
                    className="h-8 w-8"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle>Historial de Gastos</CardTitle>
                    <CardDescription>
                      Todos los gastos registrados en el sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HistorialGastosTable gastos={state.historialGastos} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
