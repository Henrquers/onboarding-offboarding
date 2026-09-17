import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { usuarios, type Usuario } from "@/db/schema";
import { assinarSessao, verificarSessao, COOKIE_SESSAO } from "./sessao";

const DURACAO_SESSAO_DIAS = 30;

export async function hashSenha(senha: string) {
  return bcrypt.hash(senha, 10);
}

export async function conferirSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

export async function criarSessao(usuarioId: string) {
  const token = await assinarSessao(usuarioId, DURACAO_SESSAO_DIAS);
  const jar = await cookies();
  jar.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_DIAS * 24 * 60 * 60,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE_SESSAO);
}

export async function usuarioAtual(): Promise<Usuario | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (!token) return null;

  const usuarioId = await verificarSessao(token);
  if (!usuarioId) return null;

  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, usuarioId))
    .limit(1);

  if (!usuario || !usuario.ativo) return null;
  return usuario;
}

export async function exigirUsuario(): Promise<Usuario> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/login");
  return usuario;
}

export async function exigirAdmin(): Promise<Usuario> {
  const usuario = await exigirUsuario();
  if (usuario.papel !== "ADMIN") redirect("/");
  return usuario;
}
