import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemo } from 'react';
import type {
  FieldValues,
  Path,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';

interface MoneyInputProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  isReadOnly?: boolean;
}

const DENOMINACIONES = [
  { key: 'b200', label: '200 Bs', valor: 200 },
  { key: 'b100', label: '100 Bs', valor: 100 },
  { key: 'b50', label: '50 Bs', valor: 50 },
  { key: 'b20', label: '20 Bs', valor: 20 },
  { key: 'b10', label: '10 Bs', valor: 10 },
  { key: 'b5', label: '5 Bs', valor: 5 },
  { key: 'm2', label: '2 Bs', valor: 2 },
  { key: 'm1', label: '1 Bs', valor: 1 },
  { key: 'm050', label: '0.50 Bs', valor: 0.5 },
  { key: 'm020', label: '0.20 Bs', valor: 0.2 },
  { key: 'm010', label: '0.10 Bs', valor: 0.1 },
] as const;


export function MoneyInput<T extends FieldValues>({
  register,
  watch,
  isReadOnly = false,
}: MoneyInputProps<T>) {
  const values = watch();

  const total = useMemo(() => {
    return DENOMINACIONES.reduce((acc, den) => {
      const value = values?.[den.key as keyof T];
      const cantidad = typeof value === 'number' ? value : 0;
      return acc + cantidad * den.valor;
    }, 0);
  }, [values]);

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
        <span className="font-semibold text-lg">Total Efectivo:</span>
        <span className="font-bold text-2xl text-primary">
          Bs {total.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {DENOMINACIONES.map((den) => (
          <div key={den.key} className="space-y-2">
            <Label
              htmlFor={den.key}
              className="text-xs text-muted-foreground font-medium"
            >
              {den.label}
            </Label>

            <div className="relative">
              <Input
                id={den.key}
                type="number"
                min={0}
                step={1}
                placeholder="0"
                readOnly={isReadOnly}
                className={isReadOnly ? 'bg-muted' : ''}
                {...register(den.key as Path<T>, {
                  valueAsNumber: true,
                })}
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                x {den.valor}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
