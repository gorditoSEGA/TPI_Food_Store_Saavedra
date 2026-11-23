import Card from "../../../shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  /** Clases de color para el valor (por defecto, texto principal). */
  colorValor?: string;
}

export default function ResumenCard({ titulo, valor, colorValor = "text-ink" }: ResumenCardProps) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-extrabold tabular-nums ${colorValor}`}>{valor}</p>
    </Card>
  );
}
