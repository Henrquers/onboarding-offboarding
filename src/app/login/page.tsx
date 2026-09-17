import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { FormularioLogin } from "./formulario";

export default async function PaginaLogin() {
  if (await usuarioAtual()) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="superficie rounded-xl p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Onboarding e Offboarding</h1>
        <p className="mt-1 mb-6 text-sm" style={{ color: "var(--texto-suave)" }}>
          Controle das providências de entrada e saída de colaboradores.
        </p>
        <FormularioLogin />
      </div>
    </main>
  );
}
