import { SignJWT, jwtVerify } from "jose";

export const COOKIE_SESSAO = "sessao";

function segredo() {
  const valor = process.env.AUTH_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "AUTH_SECRET precisa ter pelo menos 32 caracteres. Gere um com: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(valor);
}

export async function assinarSessao(usuarioId: string, dias: number) {
  return new SignJWT({ sub: usuarioId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${dias}d`)
    .sign(segredo());
}

export async function verificarSessao(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, segredo());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
