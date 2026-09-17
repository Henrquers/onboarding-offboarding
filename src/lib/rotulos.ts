export const rotuloTipoProcesso = {
  ONBOARDING: "Onboarding",
  OFFBOARDING: "Offboarding",
} as const;

export const rotuloStatusProcesso = {
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
} as const;

export const rotuloStatusTarefa = {
  PENDENTE: "Pendente",
  SOLICITADA: "Solicitada",
  CONCLUIDA: "Concluída",
  NAO_APLICAVEL: "Não se aplica",
  BLOQUEADA: "Bloqueada",
} as const;

export const rotuloPapel = {
  ADMIN: "Administrador",
  SOCIO: "Sócio",
  ASSISTENTE: "Assistente",
} as const;

export const corStatusTarefa: Record<
  keyof typeof rotuloStatusTarefa,
  string
> = {
  PENDENTE: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  SOLICITADA: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  CONCLUIDA:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  NAO_APLICAVEL:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  BLOQUEADA: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

export const corStatusProcesso: Record<
  keyof typeof rotuloStatusProcesso,
  string
> = {
  EM_ANDAMENTO: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  CONCLUIDO:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  CANCELADO:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function formatarData(valor: Date | string | null | undefined) {
  if (!valor) return "–";
  const data = typeof valor === "string" ? new Date(`${valor}T12:00:00`) : valor;
  if (Number.isNaN(data.getTime())) return "–";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}

export function formatarDataHora(valor: Date | null | undefined) {
  if (!valor) return "–";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}
