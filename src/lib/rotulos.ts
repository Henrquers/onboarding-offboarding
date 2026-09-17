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

export const classeStatusTarefa: Record<
  keyof typeof rotuloStatusTarefa,
  string
> = {
  PENDENTE: "etiqueta-pendente",
  SOLICITADA: "etiqueta-solicitada",
  CONCLUIDA: "etiqueta-concluida",
  NAO_APLICAVEL: "etiqueta-na",
  BLOQUEADA: "etiqueta-bloqueada",
};

export const classeStatusProcesso: Record<
  keyof typeof rotuloStatusProcesso,
  string
> = {
  EM_ANDAMENTO: "etiqueta-solicitada",
  CONCLUIDO: "etiqueta-concluida",
  CANCELADO: "etiqueta-na",
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
