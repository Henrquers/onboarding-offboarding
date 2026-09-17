import Image from "next/image";
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
      <header className="cabecalho">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-4 px-5 py-4">
          <Link href="/" aria-label="Início">
            {/* Versão negativa da marca, como manda o manual para fundo escuro. */}
            <Image
              src="/logo-coletta-rodrigues-negativo.svg"
              alt="Coletta Rodrigues Advogados"
              width={723}
              height={253}
              priority
              className="h-auto w-[150px]"
            />
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--marca-turquesa)]"
                style={{ color: "var(--cabecalho-texto-suave)" }}
              >
                {link.texto}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-3 text-sm">
            <Link
              href="/conta"
              className="hover:text-[var(--marca-turquesa)]"
              style={{ color: "var(--cabecalho-texto)" }}
            >
              {usuario.nome}
              <span
                className="ms-1 text-xs"
                style={{ color: "var(--cabecalho-texto-suave)" }}
              >
                {rotuloPapel[usuario.papel]}
              </span>
            </Link>
            <form action={sair}>
              <button
                className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                style={{
                  borderColor: "var(--cabecalho-texto-suave)",
                  color: "var(--cabecalho-texto)",
                }}
              >
                Sair
              </button>
            </form>
          </div>
        </div>
        <div className="fio-marca" />
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>

      <footer
        className="mx-auto max-w-5xl px-5 pb-8 text-xs"
        style={{ color: "var(--texto-suave)" }}
      >
        Coletta Rodrigues Advogados · uso interno
      </footer>
    </div>
  );
}
