"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { responsaveis } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth";

const esquema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  tipo: z.enum(["USUARIO", "EXTERNO"]),
  usuarioId: z.string().uuid().nullable(),
  contato: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
  ativo: z.boolean(),
});

function lerFormulario(formData: FormData) {
  const texto = (campo: string) => {
    const valor = formData.get(campo);
    const limpo = typeof valor === "string" ? valor.trim() : "";
    return limpo.length > 0 ? limpo : undefined;
  };

  return esquema.parse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    usuarioId: texto("usuarioId") ?? null,
    contato: texto("contato"),
    observacoes: texto("observacoes"),
    ativo: formData.get("ativo") === "on",
  });
}

export async function criarResponsavel(formData: FormData) {
  await exigirUsuario();
  const dados = lerFormulario(formData);

  await db.insert(responsaveis).values({
    ...dados,
    contato: dados.contato ?? null,
    observacoes: dados.observacoes ?? null,
  });

  revalidatePath("/responsaveis");
  revalidatePath("/catalogo");
}

export async function atualizarResponsavel(formData: FormData) {
  await exigirUsuario();
  const id = z.string().uuid().parse(formData.get("id"));
  const dados = lerFormulario(formData);

  await db
    .update(responsaveis)
    .set({
      ...dados,
      contato: dados.contato ?? null,
      observacoes: dados.observacoes ?? null,
    })
    .where(eq(responsaveis.id, id));

  revalidatePath("/responsaveis");
  revalidatePath("/catalogo");
}
