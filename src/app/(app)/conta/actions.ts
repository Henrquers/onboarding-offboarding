"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { conferirSenha, exigirAdmin, exigirUsuario, hashSenha } from "@/lib/auth";

export type EstadoSenha = { erro?: string; ok?: string };

const esquemaSenha = z
  .object({
    atual: z.string().min(1, "Informe a senha atual."),
    nova: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres."),
    confirmacao: z.string(),
  })
  .refine((d) => d.nova === d.confirmacao, {
    message: "A confirmação não confere com a nova senha.",
  });

export async function trocarSenha(
  _estado: EstadoSenha,
  formData: FormData,
): Promise<EstadoSenha> {
  const usuario = await exigirUsuario();

  const dados = esquemaSenha.safeParse({
    atual: formData.get("atual"),
    nova: formData.get("nova"),
    confirmacao: formData.get("confirmacao"),
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (!(await conferirSenha(dados.data.atual, usuario.senhaHash))) {
    return { erro: "A senha atual está incorreta." };
  }

  await db
    .update(usuarios)
    .set({ senhaHash: await hashSenha(dados.data.nova), trocarSenha: false })
    .where(eq(usuarios.id, usuario.id));

  revalidatePath("/conta");
  return { ok: "Senha alterada." };
}

const esquemaUsuario = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  papel: z.enum(["ADMIN", "SOCIO", "ASSISTENTE"]),
  senha: z.string().min(8, "A senha inicial precisa ter ao menos 8 caracteres."),
});

export async function criarUsuario(formData: FormData) {
  await exigirAdmin();

  const dados = esquemaUsuario.parse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    papel: formData.get("papel"),
    senha: formData.get("senha"),
  });

  await db.insert(usuarios).values({
    nome: dados.nome,
    email: dados.email,
    papel: dados.papel,
    senhaHash: await hashSenha(dados.senha),
    trocarSenha: true,
  });

  revalidatePath("/conta");
}

export async function alternarUsuario(formData: FormData) {
  const admin = await exigirAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  if (id === admin.id) return;

  const [alvo] = await db
    .select({ ativo: usuarios.ativo })
    .from(usuarios)
    .where(eq(usuarios.id, id))
    .limit(1);
  if (!alvo) return;

  await db.update(usuarios).set({ ativo: !alvo.ativo }).where(eq(usuarios.id, id));
  revalidatePath("/conta");
}

export async function redefinirSenha(formData: FormData) {
  await exigirAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const senha = z
    .string()
    .min(8, "A senha precisa ter ao menos 8 caracteres.")
    .parse(formData.get("senha"));

  await db
    .update(usuarios)
    .set({ senhaHash: await hashSenha(senha), trocarSenha: true })
    .where(eq(usuarios.id, id));

  revalidatePath("/conta");
}
