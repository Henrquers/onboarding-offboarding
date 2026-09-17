import Link from "next/link";
import { Etiqueta } from "@/components/etiqueta";
import { Progresso } from "@/components/progresso";
import { listarPendencias, listarProcessos } from "@/lib/consultas";
import {
  classeStatusProcesso,
  classeStatusTarefa,
  formatarData,
  rotuloStatusProcesso,
  rotuloStatusTarefa,
  rotuloTipoProcesso,
} from "@/lib/rotulos";

export const dynamic = "force-dynamic";

export default async function Painel() {
  const [todos, pendencias] = await Promise.all([
    listarProcessos(),
    listarPendencias(),
  ]);

  const emAndamento = todos.filter((p) => p.status === "EM_ANDAMENTO");
  const encerrados = todos.filter((p) => p.status !== "EM_ANDAMENTO");

  const hoje = new Date().toISOString().slice(0, 10);
  const atrasadas = pendencias.filter((t) => t.prazo && t.prazo < hoje);

  const porResponsavel = new Map<string, typeof pendencias>();
  for (const tarefa of pendencias) {
    const chave = tarefa.responsavelNome ?? "Sem responsável definido";
    porResponsavel.set(chave, [...(porResponsavel.get(chave) ?? []), tarefa]);
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h1 className="text-lg font-semibold">Processos em andamento</h1>
          <Link href="/processos/novo" className="botao botao-primario">
            Iniciar processo
          </Link>
        </div>

        {emAndamento.length === 0 ? (
          <p className="superficie rounded-lg p-6 text-sm" style={{ color: "var(--texto-suave)" }}>
            Nenhum processo aberto. Comece pelo botão acima: escolha entre
            onboarding e offboarding e o app monta a lista de providências a
            partir do catálogo.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {emAndamento.map((processo) => (
              <li key={processo.id} className="superficie rounded-lg p-4">
                <Link href={`/processos/${processo.id}`} className="block space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{processo.pessoaNome}</span>
                    <Etiqueta classe={classeStatusProcesso[processo.status]}>
                      {rotuloTipoProcesso[processo.tipo]}
                    </Etiqueta>
                  </div>
                  <p className="text-xs" style={{ color: "var(--texto-suave)" }}>
                    {processo.pessoaCargo ?? "Cargo não informado"} ·{" "}
                    {processo.tipo === "ONBOARDING" ? "Entrada" : "Saída"} em{" "}
                    {formatarData(processo.dataReferencia)}
                  </p>
                  <Progresso
                    resolvidas={Number(processo.resolvidas)}
                    total={Number(processo.total)}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">Providências em aberto</h2>
        <p className="mb-4 text-sm" style={{ color: "var(--texto-suave)" }}>
          {pendencias.length} em aberto
          {atrasadas.length > 0 ? `, sendo ${atrasadas.length} fora do prazo` : ""}.
        </p>

        {pendencias.length === 0 ? (
          <p className="superficie rounded-lg p-6 text-sm" style={{ color: "var(--texto-suave)" }}>
            Nada pendente nos processos abertos.
          </p>
        ) : (
          <div className="space-y-4">
            {[...porResponsavel.entries()].map(([responsavel, itens]) => (
              <div key={responsavel} className="superficie rounded-lg">
                <h3 className="border-b px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--borda)" }}>
                  {responsavel}
                  <span className="ms-2 font-normal" style={{ color: "var(--texto-suave)" }}>
                    {itens.length}
                  </span>
                </h3>
                <ul className="divide-y" style={{ borderColor: "var(--borda)" }}>
                  {itens.map((tarefa) => {
                    const atrasada = Boolean(tarefa.prazo && tarefa.prazo < hoje);
                    return (
                      <li key={tarefa.tarefaId} className="px-4 py-2.5 text-sm">
                        <Link
                          href={`/processos/${tarefa.processoId}`}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1"
                        >
                          <Etiqueta classe={classeStatusTarefa[tarefa.status]}>
                            {rotuloStatusTarefa[tarefa.status]}
                          </Etiqueta>
                          <span>{tarefa.titulo}</span>
                          <span className="text-xs" style={{ color: "var(--texto-suave)" }}>
                            {rotuloTipoProcesso[tarefa.processoTipo]} de {tarefa.pessoaNome}
                          </span>
                          {tarefa.prazo ? (
                            <span
                              className={`ms-auto text-xs tabular-nums ${atrasada ? "atrasada" : ""}`}
                              style={atrasada ? undefined : { color: "var(--texto-suave)" }}
                            >
                              {atrasada ? "venceu em " : "até "}
                              {formatarData(tarefa.prazo)}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {encerrados.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Processos encerrados</h2>
          <ul className="superficie divide-y rounded-lg" style={{ borderColor: "var(--borda)" }}>
            {encerrados.map((processo) => (
              <li key={processo.id} className="px-4 py-2.5 text-sm">
                <Link href={`/processos/${processo.id}`} className="flex flex-wrap items-center gap-3">
                  <Etiqueta classe={classeStatusProcesso[processo.status]}>
                    {rotuloStatusProcesso[processo.status]}
                  </Etiqueta>
                  <span>{processo.pessoaNome}</span>
                  <span className="text-xs" style={{ color: "var(--texto-suave)" }}>
                    {rotuloTipoProcesso[processo.tipo]} · aberto em{" "}
                    {formatarData(processo.criadoEm)}
                  </span>
                  <span className="ms-auto text-xs tabular-nums" style={{ color: "var(--texto-suave)" }}>
                    {Number(processo.resolvidas)}/{Number(processo.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
