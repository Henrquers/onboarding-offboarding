"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./actions";

const inicial: EstadoLogin = {};

export function FormularioLogin() {
  const [estado, acao, enviando] = useActionState(entrar, inicial);

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label className="rotulo" htmlFor="email">
          E-mail
        </label>
        <input
          className="campo"
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="rotulo" htmlFor="senha">
          Senha
        </label>
        <input
          className="campo"
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {estado.erro ? (
        <p className="text-sm atrasada" role="alert">
          {estado.erro}
        </p>
      ) : null}

      <button className="botao botao-primario w-full" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
