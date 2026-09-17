export function Etiqueta({
  children,
  classe,
}: {
  children: React.ReactNode;
  classe?: string;
}) {
  return <span className={`etiqueta ${classe ?? ""}`}>{children}</span>;
}
