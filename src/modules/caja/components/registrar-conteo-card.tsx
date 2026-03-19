import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Banknote, Coins, Check, AlertTriangle } from 'lucide-react';

type DineroKey = 'b200' | 'b100' | 'b50' | 'b20' | 'b10' | 'b5' | 'm2' | 'm1' | 'm050' | 'm020' | 'm010';

interface DineroExtra {
  key: DineroKey;
  label: string;
  valor: number;
}

const BILLETES: DineroExtra[] = [
  { key: 'b200', label: 'Bs 200', valor: 200 },
  { key: 'b100', label: 'Bs 100', valor: 100 },
  { key: 'b50', label: 'Bs 50', valor: 50 },
  { key: 'b20', label: 'Bs 20', valor: 20 },
  { key: 'b10', label: 'Bs 10', valor: 10 },
];

const MONEDAS: DineroExtra[] = [
  { key: 'b5', label: 'Bs 5', valor: 5 },
  { key: 'm2', label: 'Bs 2', valor: 2 },
  { key: 'm1', label: 'Bs 1', valor: 1 },
  { key: 'm050', label: 'Bs 0.50', valor: 0.5 },
  { key: 'm020', label: 'Bs 0.20', valor: 0.2 },
  { key: 'm010', label: 'Bs 0.10', valor: 0.1 },
];

interface ConteoDineroValues {
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

interface RegistrarConteoDialogProps {
  valoresIniciales?: ConteoDineroValues;
  efectivoEsperado: number;
  onGuardar: (valores: ConteoDineroValues, total: number) => void;
  className?: string;
}

export function RegistrarConteoCard({
  valoresIniciales,
  efectivoEsperado,
  onGuardar,
  className
}: RegistrarConteoDialogProps) {
  const [enabled, setEnabled] = useState(false);
  const [values, setValues] = useState<ConteoDineroValues>(
    valoresIniciales || {
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
      b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
    }
  );
  const [saved, setSaved] = useState(false);

  const calcularTotal = () => {
    let total = 0;
    [...BILLETES, ...MONEDAS].forEach(({ key, valor }) => {
      const cantidad = values[key] || 0;
      total += cantidad * valor;
    });
    return total;
  };

  const handleChange = (key: DineroKey, value: string) => {
    setSaved(false);
    setValues(prev => ({
      ...prev,
      [key]: value === '' ? 0 : parseFloat(value) || 0
    }));
  };

  const handleGuardar = () => {
    const total = calcularTotal();
    onGuardar(values, total);
    setSaved(true);
  };

  const total = calcularTotal();
  const diferencia = total - efectivoEsperado;
  const esExacto = Math.abs(diferencia) < 0.01;
  const esSobrante = diferencia > 0;
  const esFaltante = diferencia < 0;

  if (!enabled) {
    return (
      <Card className={cn("bg-muted/30", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Registrar Conteo de Caja</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="registrar-conteo"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="registrar-conteo" className="text-sm text-muted-foreground">
                Habilitar
              </Label>
            </div>
          </div>
          <CardDescription>
            Activa para registrar el conteo físico de dinero en cualquier momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/30 bg-primary/5", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Registrar Conteo de Caja</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="registrar-conteo"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="registrar-conteo" className="text-sm text-muted-foreground">
              Desactivar
            </Label>
          </div>
        </div>
        <CardDescription>
          Registra el conteo físico actual. El sistema calculará la diferencia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Efectivo Esperado:</span>
            <span className="font-semibold">Bs {efectivoEsperado.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Billetes</span>
            </div>
            <div className="space-y-2">
              {BILLETES.map(({ key, label, valor }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={values[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-16 h-8 text-center border rounded-md bg-background text-sm"
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      Bs {((values[key] || 0) * valor).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Monedas</span>
            </div>
            <div className="space-y-2">
              {MONEDAS.map(({ key, label, valor }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={values[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-16 h-8 text-center border rounded-md bg-background text-sm"
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      Bs {((values[key] || 0) * valor).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={cn(
          "p-4 rounded-lg border text-center",
          esExacto && "bg-success-bg border-success-border",
          esSobrante && "bg-info-bg border-info-border",
          esFaltante && "bg-destructive/5 border-destructive/20",
          !esExacto && !esSobrante && !esFaltante && "bg-muted"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Contado</span>
            <Badge variant={esExacto ? "default" : esSobrante ? "secondary" : "destructive"}>
              {esExacto && <Check className="h-3 w-3 mr-1" />}
              {esFaltante && <AlertTriangle className="h-3 w-3 mr-1" />}
              {esExacto ? "Exacto" : esSobrante ? "Sobrante" : "Faltante"}
            </Badge>
          </div>
          <p className="text-2xl font-bold">Bs {total.toFixed(2)}</p>
          <p className={cn(
            "text-sm mt-1",
            esExacto && "text-success",
            esSobrante && "text-info",
            esFaltante && "text-destructive"
          )}>
            {esExacto && "¡Cuadre perfecto!"}
            {esSobrante && `Diferencia: +Bs ${diferencia.toFixed(2)}`}
            {esFaltante && `Diferencia: -Bs ${Math.abs(diferencia).toFixed(2)}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setValues({
              b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
              b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
            })}
          >
            Limpiar
          </Button>
          <Button
            className="flex-1"
            onClick={handleGuardar}
            disabled={saved}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Guardado
              </>
            ) : (
              'Guardar Conteo'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
