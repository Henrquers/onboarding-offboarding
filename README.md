# Onboarding e Offboarding

Aplicativo interno para centralizar as providências de entrada e saída de
colaboradores do escritório. Quem conduz o processo abre um registro, o app
monta a lista do que precisa ser feito, diz a quem pedir cada coisa e acompanha
o que já foi resolvido.

## O que já está pronto

- Login por e-mail e senha, restrito às pessoas cadastradas.
- Abertura de processos de onboarding e de offboarding, com cópia automática das
  providências do catálogo e cálculo dos prazos a partir da data de entrada ou
  de saída.
- Tela do processo com cada providência, o responsável, o contato dele, o texto
  de "como pedir", campo de observações e os botões de status (pendente,
  solicitada, concluída, travada, não se aplica).
- Painel com os processos abertos, o progresso de cada um e todas as
  providências em aberto agrupadas por responsável, com destaque para as que
  passaram do prazo.
- Providências avulsas, que valem só para um processo.
- Catálogo editável pela interface, para trocar o conteúdo provisório pelas
  listas oficiais sem mexer em código.
- Cadastro de responsáveis (inclusive fornecedores e suporte externo).
- Histórico por processo: quem mudou o quê e quando.
- Administração de usuários: incluir pessoa, redefinir senha, desativar acesso.

## O que ainda falta definir

Os e-mails de login das cinco pessoas serão confirmados na hora de colocar o app
em uso, então nenhum vem cadastrado. Até lá, os acessos se criam um a um pelo
comando `db:usuario` descrito abaixo.

O catálogo que vem no seed é provisório. Ele reúne as providências citadas na
abertura do projeto (e-mail, chaves de e-mail, Legal Manager, iManage, workspace
pessoal, Claude, perfil no site) mais três itens genéricos marcados como "a
confirmar". Quando as listas oficiais chegarem, dá para cadastrá-las direto na
tela **Catálogo**.

Notificação automática por e-mail ficou de fora por decisão do escopo inicial.
As pessoas continuam pedindo as providências pelos canais de hoje e registram no
app o que foi feito.

## Identidade visual

O app segue o manual da marca (abr/2022):

- **Cores.** Azul institucional `#003259` (Pantone 540 C), turquesa `#00B2AD`
  (Pantone 326 C) e cinza `#D6DBDE` (Pantone 538 C).
- **Tipografia.** Montserrat como fonte principal, Arial como apoio.
- **Marca.** Em `public/` estão as três versões usadas pelo app, extraídas do
  manual em vetor: principal, negativa (para o cabeçalho e a tela de login, que
  são azul institucional) e apenas o símbolo, que serve de favicon. As cores da
  marca não são alteradas em nenhuma tela, conforme o manual determina.

## Stack

Next.js 16 (App Router, Server Actions), Postgres com Drizzle ORM, Tailwind CSS
v4, sessão em cookie assinado com JWT. Tudo roda dentro dos planos gratuitos da
Vercel e do Neon.

## Publicar (Vercel + Neon, sem custo)

1. **Banco.** Crie um projeto no [Neon](https://neon.tech) (ou no Supabase) e
   copie a connection string *pooled*.
2. **Deploy.** Importe este repositório na [Vercel](https://vercel.com) e
   configure as variáveis de ambiente:
   - `DATABASE_URL` – a connection string do passo 1.
   - `AUTH_SECRET` – gere com `openssl rand -base64 32`.
3. **Criar as tabelas.** Com as mesmas variáveis num `.env` local:
   ```bash
   npm install
   npm run db:migrate
   ```
4. **Popular.** O seed cria os responsáveis e o catálogo de providências:
   ```bash
   npm run db:seed
   ```
5. **Criar os acessos.** Um comando por pessoa, com o e-mail dela:
   ```bash
   npm run db:usuario -- --nome "Fulana" --email "fulana@exemplo.com" \
     --papel ADMIN --senha "senha-provisoria"
   ```
   Papéis aceitos: `ADMIN`, `SOCIO` e `ASSISTENTE`. Cada pessoa troca a senha no
   primeiro acesso, na tela **Conta**, e quem for `ADMIN` também consegue
   incluir gente nova e redefinir senhas pela própria interface.

## Rodar localmente

```bash
cp .env.example .env    # preencha DATABASE_URL e AUTH_SECRET
npm install
npm run db:migrate
npm run db:seed
npm run db:usuario -- --nome "Teste" --email "teste@exemplo.com" --papel ADMIN --senha "teste1234"
npm run dev
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o app em modo de desenvolvimento. |
| `npm run build` | Build de produção. |
| `npm run typecheck` | Checagem de tipos. |
| `npm run lint` | ESLint. |
| `npm run db:generate` | Gera uma migração a partir de `src/db/schema.ts`. |
| `npm run db:migrate` | Aplica as migrações pendentes. |
| `npm run db:seed` | Cria os responsáveis e o catálogo inicial. |
| `npm run db:usuario` | Cria ou atualiza o acesso de uma pessoa. |

## Como o catálogo se relaciona com os processos

Ao abrir um processo, o app **copia** as providências ativas do catálogo para
dentro dele. Editar ou excluir algo no catálogo depois disso não altera
processos já abertos, o que preserva o registro do que foi combinado à época.
