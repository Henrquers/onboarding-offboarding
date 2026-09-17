"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { conferirSenha, criarSessao } from "@/lib/auth";

const esquema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

export type EstadoLogin = { erro?: string };

export async function entrar(
  _estado: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const dados = esquema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, dados.data.email))
    .limit(1);

  // Mensagem única para e-mail inexistente e senha errada, para não revelar
  // quais endereços estão cadastrados.
  const generica = { erro: "E-mail ou senha incorretos." };
  if (!usuario || !usuario.ativo) return generica;

  const senhaConfere = await conferirSenha(dados.data.senha, usuario.senhaHash);
  if (!senhaConfere) return generica;

  await criarSessao(usuario.id);
  redirect(usuario.trocarSenha ? "/conta?trocar=1" : "/");
}
