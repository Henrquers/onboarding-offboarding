import type { ModeloTarefa, Responsavel } from "@/db/schema";

type Props = {
  acao: (formData: FormData) => Promise<void>;
  responsaveis: Responsavel[];
  modelo?: ModeloTarefa;
  tipoPadrao?: "ONBOARDING" | "OFFBOARDING";
  textoBotao: string;
  children?: React.ReactNode;
};

export function FormularioModelo({
  acao,
  responsaveis,
  modelo,
  tipoPadrao = "ONBOARDING",
  textoBotao,
  children,
}: Props) {
  const id = modelo?.id ?? "novo";

  return (
    <form action={acao} className="space-y-4">
      {modelo ? <input type="hidden" name="id" value={modelo.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="rotulo" htmlFor={`tipo-${id}`}>
            Tipo
          </label>
          <select
            className="campo"
            id={`tipo-${id}`}
            name="tipo"
            defaultValue={modelo?.tipo ?? tipoPadrao}
          >
            <option value="ONBOARDING">Onboarding</option>
            <option value="OFFBOARDING">Offboarding</option>
          </select>
        </div>

        <div>
          <label className="rotulo" htmlFor={`ordem-${id}`}>
            Ordem
          </label>
          <input
            className="campo"
            id={`ordem-${id}`}
            name="ordem"
            type="number"
            min={0}
            defaultValue={modelo?.ordem ?? 0}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="rotulo" htmlFor={`titulo-${id}`}>
            Providência
          </label>
          <input
            className="campo"
            id={`titulo-${id}`}
            name="titulo"
            defaultValue={modelo?.titulo ?? ""}
            required
          />
        </div>

        <div>
          <label className="rotulo" htmlFor={`sistema-${id}`}>
            Sistema
          </label>
          <input
            className="campo"
            id={`sistema-${id}`}
            name="sistema"
            defaultValue={modelo?.sistema ?? ""}
            placeholder="iManage, Legal Manager, E-mail..."
          />
        </div>

        <div>
          <label className="rotulo" htmlFor={`responsavel-${id}`}>
            A quem pedir
          </label>
          <select
            className="campo"
            id={`responsavel-${id}`}
            name="responsavelId"
            defaultValue={modelo?.responsavelId ?? ""}
          >
            <option value="">Não definido</option>
            {responsaveis.map((responsavel) => (
              <option key={responsavel.id} value={responsavel.id}>
                {responsavel.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="rotulo" htmlFor={`descricao-${id}`}>
            Descrição
          </label>
          <textarea
            className="campo"
            id={`descricao-${id}`}
            name="descricao"
            rows={2}
            defaultValue={modelo?.descricao ?? ""}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="rotulo" htmlFor={`comoPedir-${id}`}>
            Como pedir
          </label>
          <textarea
            className="campo"
            id={`comoPedir-${id}`}
            name="comoPedir"
            rows={2}
            defaultValue={modelo?.comoPedir ?? ""}
            placeholder="O que informar no pedido, por qual canal, o que anexar..."
          />
        </div>

        <div>
          <label className="rotulo" htmlFor={`prazo-${id}`}>
            Prazo (dias a partir da data de referência)
          </label>
          <input
            className="campo"
            id={`prazo-${id}`}
            name="prazoDias"
            type="number"
            min={0}
            defaultValue={modelo?.prazoDias ?? ""}
          />
        </div>

        <div className="flex items-end gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="obrigatoria"
              defaultChecked={modelo?.obrigatoria ?? true}
            />
            Obrigatória
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="ativa" defaultChecked={modelo?.ativa ?? true} />
            Ativa
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="botao botao-primario px-3 py-1.5 text-xs">{textoBotao}</button>
        {children}
      </div>
    </form>
  );
}
