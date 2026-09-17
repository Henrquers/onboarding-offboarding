export function Etiqueta({
  children,
  classe,
}: {
  children: React.ReactNode;
  classe?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classe ?? ""}`}
    >
      {children}
    </span>
  );
}
