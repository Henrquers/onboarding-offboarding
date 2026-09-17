"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { modelosTarefa } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth";

const esquema = z.object({
  tipo: z.enum(["ONBOARDING", "OFFBOARDING"]),
  titulo: z.string().trim().min(2, "Informe o título da providência."),
  descricao: z.string().trim().optional(),
  sistema: z.string().trim().optional(),
  responsavelId: z.string().uuid().nullable(),
  comoPedir: z.string().trim().optional(),
  prazoDias: z.number().int().min(0).max(365).nullable(),
  ordem: z.number().int().min(0).max(100000),
  obrigatoria: z.boolean(),
  ativa: z.boolean(),
});

function lerFormulario(formData: FormData) {
  const texto = (campo: string) => {
    const valor = formData.get(campo);
    const limpo = typeof valor === "string" ? valor.trim() : "";
    return limpo.length > 0 ? limpo : undefined;
  };
  const numero = (campo: string) => {
    const valor = texto(campo);
    if (valor === undefined) return null;
    const convertido = Number(valor);
    return Number.isFinite(convertido) ? convertido : null;
  };

  return esquema.parse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo"),
    descricao: texto("descricao"),
    sistema: texto("sistema"),
    responsavelId: texto("responsavelId") ?? null,
    comoPedir: texto("comoPedir"),
    prazoDias: numero("prazoDias"),
    ordem: numero("ordem") ?? 0,
    obrigatoria: formData.get("obrigatoria") === "on",
    ativa: formData.get("ativa") === "on",
  });
}

export async function criarModelo(formData: FormData) {
  await exigirUsuario();
  const dados = lerFormulario(formData);

  await db.insert(modelosTarefa).values({
    ...dados,
    descricao: dados.descricao ?? null,
    sistema: dados.sistema ?? null,
    comoPedir: dados.comoPedir ?? null,
  });

  revalidatePath("/catalogo");
}

export async function atualizarModelo(formData: FormData) {
  await exigirUsuario();
  const id = z.string().uuid().parse(formData.get("id"));
  const dados = lerFormulario(formData);

  await db
    .update(modelosTarefa)
    .set({
      ...dados,
      descricao: dados.descricao ?? null,
      sistema: dados.sistema ?? null,
      comoPedir: dados.comoPedir ?? null,
      atualizadoEm: new Date(),
    })
    .where(eq(modelosTarefa.id, id));

  revalidatePath("/catalogo");
}

export async function excluirModelo(formData: FormData) {
  await exigirUsuario();
  const id = z.string().uuid().parse(formData.get("id"));

  // Tarefas já criadas guardam uma cópia dos dados, então apagar o modelo não
  // apaga histórico: o vínculo em tarefas.modelo_id apenas fica nulo.
  await db.delete(modelosTarefa).where(eq(modelosTarefa.id, id));
  revalidatePath("/catalogo");
}
