import { Etiqueta } from "@/components/etiqueta";
import {
  corStatusTarefa,
  formatarData,
  formatarDataHora,
  rotuloStatusTarefa,
} from "@/lib/rotulos";
import type { Tarefa } from "@/db/schema";
import { mudarStatusTarefa, salvarObservacaoTarefa } from "@/app/(app)/processos/actions";

type Props = {
  tarefa: Tarefa;
  responsavelNome: string | null;
  responsavelContato: string | null;
  concluidaPor: string | null;
  editavel: boolean;
};

/** Botões oferecidos em cada status, na ordem em que fazem sentido. */
const TRANSICOES: Record<Tarefa["status"], Array<{ status: Tarefa["status"]; texto: string; primario?: boolean }>> = {
  PENDENTE: [
    { status: "SOLICITADA", texto: "Pedi a providência" },
    { status: "CONCLUIDA", texto: "Concluída", primario: true },
    { status: "NAO_APLICAVEL", texto: "Não se aplica" },
    { status: "BLOQUEADA", texto: "Travou" },
  ],
  SOLICITADA: [
    { status: "CONCLUIDA", texto: "Concluída", primario: true },
    { status: "BLOQUEADA", texto: "Travou" },
    { status: "PENDENTE", texto: "Voltar para pendente" },
  ],
  BLOQUEADA: [
    { status: "CONCLUIDA", texto: "Concluída", primario: true },
    { status: "SOLICITADA", texto: "Voltar para solicitada" },
    { status: "PENDENTE", texto: "Voltar para pendente" },
  ],
  CONCLUIDA: [{ status: "PENDENTE", texto: "Reabrir" }],
  NAO_APLICAVEL: [{ status: "PENDENTE", texto: "Reabrir" }],
};

export function LinhaTarefa({
  tarefa,
  responsavelNome,
  responsavelContato,
  concluidaPor,
  editavel,
}: Props) {
  const hoje = new Date().toISOString().slice(0, 10);
  const atrasada =
    Boolean(tarefa.prazo && tarefa.prazo < hoje) &&
    tarefa.status !== "CONCLUIDA" &&
    tarefa.status !== "NAO_APLICAVEL";

  return (
    <li className="px-4 py-3">
      <details>
        <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-sm marker:content-['']">
          <Etiqueta classe={corStatusTarefa[tarefa.status]}>
            {rotuloStatusTarefa[tarefa.status]}
          </Etiqueta>
          <span className={tarefa.status === "NAO_APLICAVEL" ? "line-through" : ""}>
            {tarefa.titulo}
          </span>
          {tarefa.sistema ? (
            <span className="text-xs" style={{ color: "var(--texto-suave)" }}>
              {tarefa.sistema}
            </span>
          ) : null}
          <span className="ms-auto flex items-center gap-3 text-xs" style={{ color: "var(--texto-suave)" }}>
            <span>{responsavelNome ?? "Sem responsável"}</span>
            {tarefa.prazo ? (
              <span
                className={`tabular-nums ${atrasada ? "font-semibold text-rose-700 dark:text-rose-300" : ""}`}
              >
                {formatarData(tarefa.prazo)}
              </span>
            ) : null}
          </span>
        </summary>

        <div className="mt-3 space-y-3 border-s-2 ps-4 text-sm" style={{ borderColor: "var(--borda)" }}>
          {tarefa.descricao ? <p>{tarefa.descricao}</p> : null}

          {tarefa.comoPedir ? (
            <div>
              <span className="rotulo">Como pedir</span>
              <p>{tarefa.comoPedir}</p>
            </div>
          ) : null}

          <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2" style={{ color: "var(--texto-suave)" }}>
            <div>
              <dt className="inline font-semibold">A quem pedir: </dt>
              <dd className="inline">
                {responsavelNome ?? "não definido"}
                {responsavelContato ? ` (${responsavelContato})` : ""}
              </dd>
            </div>
            {tarefa.solicitadaEm ? (
              <div>
                <dt className="inline font-semibold">Pedida em: </dt>
                <dd className="inline">{formatarDataHora(tarefa.solicitadaEm)}</dd>
              </div>
            ) : null}
            {tarefa.concluidaEm ? (
              <div>
                <dt className="inline font-semibold">Concluída em: </dt>
                <dd className="inline">
                  {formatarDataHora(tarefa.concluidaEm)}
                  {concluidaPor ? ` por ${concluidaPor}` : ""}
                </dd>
              </div>
            ) : null}
          </dl>

          {editavel ? (
            <>
              <form action={salvarObservacaoTarefa} className="space-y-2">
                <input type="hidden" name="tarefaId" value={tarefa.id} />
                <label className="rotulo" htmlFor={`obs-${tarefa.id}`}>
                  Observações
                </label>
                <textarea
                  className="campo"
                  id={`obs-${tarefa.id}`}
                  name="observacoes"
                  rows={2}
                  defaultValue={tarefa.observacoes ?? ""}
                  placeholder="Com quem você falou, número do chamado, o que falta..."
                />
                <button className="botao px-2 py-1 text-xs">Salvar observação</button>
              </form>

              <div className="flex flex-wrap gap-2">
                {TRANSICOES[tarefa.status].map((transicao) => (
                  <form action={mudarStatusTarefa} key={transicao.status}>
                    <input type="hidden" name="tarefaId" value={tarefa.id} />
                    <input type="hidden" name="status" value={transicao.status} />
                    <button
                      className={`botao px-2 py-1 text-xs ${transicao.primario ? "botao-primario" : ""}`}
                    >
                      {transicao.texto}
                    </button>
                  </form>
                ))}
              </div>
            </>
          ) : (
            tarefa.observacoes && <p className="text-xs">{tarefa.observacoes}</p>
          )}
        </div>
      </details>
    </li>
  );
}
