import Image from "next/image";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { FormularioLogin } from "./formulario";

export default async function PaginaLogin() {
  if (await usuarioAtual()) redirect("/");

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--marca-azul)" }}
    >
      <Image
        src="/logo-coletta-rodrigues-negativo.svg"
        alt="Coletta Rodrigues Advogados"
        width={723}
        height={253}
        priority
        className="mb-8 h-auto w-[240px]"
      />

      <div className="superficie w-full max-w-sm rounded-lg p-8 shadow-lg">
        <h1 className="text-lg font-semibold">Onboarding e Offboarding</h1>
        <p className="mt-1 mb-6 text-sm" style={{ color: "var(--texto-suave)" }}>
          Controle das providências de entrada e saída de colaboradores.
        </p>
        <FormularioLogin />
      </div>

      <p className="mt-8 text-xs" style={{ color: "#b9ccd8" }}>
        Acesso restrito aos sócios e à equipe administrativa.
      </p>
    </main>
  );
}
