# 🚀 Primer Promos

O **Primer Promos** é uma plataforma moderna e de alta performance projetada para monitoramento, raspagem (*scraping*) e agregação de promoções e produtos. Desenvolvida utilizando **Next.js**, **Prisma** e **Tailwind CSS v4**, a aplicação integra um pipeline eficiente de coleta de dados (*scraper*) com um banco de dados relacional **PostgreSQL** para fornecer ofertas e especificações detalhadas de produtos em tempo real.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Server-Side:** [Next.js](https://nextjs.org/) (App Router)
- **Banco de Dados & ORM:** [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Gerenciador de Pacotes:** [pnpm](https://pnpm.io/)

---

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (v20 ou superior recomendado)
- [pnpm](https://pnpm.io/)
- Instância do banco de dados **PostgreSQL** (ou serviço como Supabase / Docker)

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no arquivo `.example.env`:

```bash
# Copiar o exemplo de configuração para o ambiente local
cp .example.env .env
```

Abra o arquivo `.env` recém-criado e configure as URLs de conexão com o seu banco de dados:

```env
# Conexão com o banco via transaction-mode pooler (ideal para serverless/Next.js)
DATABASE_URL="postgresql://usuario:senha@host:porta/banco?pgbouncer=true"

# Conexão direta com o banco (necessária para rodar as migrações do Prisma)
DIRECT_URL="postgresql://usuario:senha@host:porta/banco"
```

---

## 🚀 Instalação e Execução

Siga os comandos abaixo no seu terminal para clonar o repositório, instalar as dependências e rodar o projeto:

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/primerpromos.git

# 2. Entrar no diretório do projeto
cd primerpromos

# 3. Instalar as dependências
pnpm install

# 4. Gerar o Prisma Client e aplicar as migrações do banco
pnpm prisma:generate
pnpm prisma:migrate:dev

# 5. Executar o servidor em ambiente de desenvolvimento
pnpm dev
```

Após iniciar o servidor, abra **[http://localhost:3000](http://localhost:3000)** no seu navegador.

---

## 📂 Scripts Disponíveis

No arquivo `package.json` estão disponíveis os seguintes comandos:

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento do Next.js. |
| `pnpm build` | Compila o projeto Next.js para produção. |
| `pnpm start` | Inicia o servidor de produção após o build. |
| `pnpm scraper` | Roda o script de raspagem de promoções (`scripts/scraper.ts`). |
| `pnpm prisma:generate` | Gera os tipos do Prisma Client com base no esquema. |
| `pnpm prisma:migrate:dev` | Roda migrações do Prisma em ambiente de desenvolvimento. |
| `pnpm prisma:studio` | Abre o console administrativo do Prisma no navegador. |
