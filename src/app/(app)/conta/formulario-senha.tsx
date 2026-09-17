"use client";

import { useActionState } from "react";
import { trocarSenha, type EstadoSenha } from "./actions";

const inicial: EstadoSenha = {};

export function FormularioSenha() {
  const [estado, acao, enviando] = useActionState(trocarSenha, inicial);

  return (
    <form action={acao} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="rotulo" htmlFor="atual">
            Senha atual
          </label>
          <input
            className="campo"
            id="atual"
            name="atual"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label className="rotulo" htmlFor="nova">
            Nova senha
          </label>
          <input
            className="campo"
            id="nova"
            name="nova"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="rotulo" htmlFor="confirmacao">
            Repita a nova senha
          </label>
          <input
            className="campo"
            id="confirmacao"
            name="confirmacao"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </div>

      {estado.erro ? (
        <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
          {estado.erro}
        </p>
      ) : null}
      {estado.ok ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">
          {estado.ok}
        </p>
      ) : null}

      <button className="botao botao-primario px-3 py-1.5 text-xs" disabled={enviando}>
        {enviando ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
