import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { rotuloPapel } from "@/lib/rotulos";
import { sair } from "./actions";

const LINKS = [
  { href: "/", texto: "Processos" },
  { href: "/processos/novo", texto: "Novo processo" },
  { href: "/catalogo", texto: "Catálogo" },
  { href: "/responsaveis", texto: "Responsáveis" },
];

export default async function LayoutApp({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const usuario = await exigirUsuario();

  return (
    <div className="min-h-screen">
      <header
        className="superficie border-x-0 border-t-0"
        style={{ background: "var(--superficie)" }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <Link href="/" className="font-semibold">
            Onboarding e Offboarding
          </Link>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:underline"
                style={{ color: "var(--texto-suave)" }}
              >
                {link.texto}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-3 text-sm">
            <Link href="/conta" className="hover:underline">
              {usuario.nome}
              <span className="ms-1" style={{ color: "var(--texto-suave)" }}>
                ({rotuloPapel[usuario.papel]})
              </span>
            </Link>
            <form action={sair}>
              <button className="botao px-2 py-1 text-xs">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
