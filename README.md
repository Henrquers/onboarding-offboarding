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
em uso, então nenhum vem cadastrado. Na publicação, nasce um único acesso de
administrador a partir das variáveis de ambiente, e os demais são cadastrados
pela tela **Conta**.

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

Dá para fazer tudo pelo navegador, sem terminal. São uns dez minutos.

1. **Banco.** Entre em [neon.tech](https://neon.tech), crie a conta (dá para
   entrar com o GitHub), crie um projeto e copie a *connection string* na opção
   **Pooled connection**.
2. **Deploy.** Entre em [vercel.com](https://vercel.com) com a mesma conta do
   GitHub, clique em **Add New → Project**, escolha este repositório e, antes de
   clicar em *Deploy*, abra **Environment Variables** e preencha:

   | Variável | Valor |
   | --- | --- |
   | `DATABASE_URL` | a string copiada do Neon |
   | `AUTH_SECRET` | qualquer texto aleatório com 32 caracteres ou mais |
   | `ADMIN_NOME` | seu nome |
   | `ADMIN_EMAIL` | o e-mail com que você vai entrar |
   | `ADMIN_SENHA` | uma senha provisória, com 8 caracteres ou mais |

3. **Deploy.** A publicação aplica as migrações, cria os responsáveis e o
   catálogo e abre o seu acesso de administrador. A Vercel devolve uma URL do
   tipo `https://onboarding-offboarding.vercel.app`, que é o endereço do app.
4. **Entre** com o e-mail e a senha provisória, troque a senha na tela **Conta**
   e cadastre ali mesmo os acessos dos sócios e das assistentes.
5. Depois do primeiro acesso, `ADMIN_NOME`, `ADMIN_EMAIL` e `ADMIN_SENHA` podem
   ser apagadas das variáveis da Vercel. Publicações seguintes nunca
   sobrescrevem o acesso de quem já está cadastrado.

## Rodar localmente

```bash
cp .env.example .env    # preencha DATABASE_URL e AUTH_SECRET
npm install
npm run db:preparar
npm run dev
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o app em modo de desenvolvimento. |
| `npm run build` | Build de produção. |
| `npm run typecheck` | Checagem de tipos. |
| `npm run lint` | ESLint. |
| `npm run db:preparar` | Migra o banco, cria o catálogo e abre o primeiro acesso (é o que roda na publicação). |
| `npm run db:generate` | Gera uma migração a partir de `src/db/schema.ts`. |
| `npm run db:migrate` | Aplica as migrações pendentes. |
| `npm run db:seed` | Cria os responsáveis e o catálogo inicial. |
| `npm run db:usuario` | Cria ou atualiza o acesso de uma pessoa pelo terminal. |

## Como o catálogo se relaciona com os processos

Ao abrir um processo, o app **copia** as providências ativas do catálogo para
dentro dele. Editar ou excluir algo no catálogo depois disso não altera
processos já abertos, o que preserva o registro do que foi combinado à época.
