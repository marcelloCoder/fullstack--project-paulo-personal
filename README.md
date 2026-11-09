# Paulo Roberto — personal trainer

Site do personal Paulo Roberto. O visitante conhece o atendimento nos condomínios Sublime, Origem e Seleto. O aluno entra e vê a ficha ativa. O Paulo administra alunos, fichas e treinos.

- Backend: Spring Boot 4.1, Java 21, PostgreSQL
- Frontend: Next.js, TypeScript e Tailwind CSS

## O que precisa estar instalado

- JDK 21
- Maven
- Node.js
- Docker, para o Postgres local

## Variáveis

Copie o exemplo e ajuste os valores. Nada disso fica gravado no código.

```text
DATABASE_URL=jdbc:postgresql://localhost:5433/paulo_personal
DATABASE_USERNAME=paulo
DATABASE_PASSWORD=paulo
JWT_SEGREDO=troque-este-segredo-por-um-texto-longo
ADMIN_EMAIL=paulo@personal.local
ADMIN_PASSWORD=troque-esta-senha
API_URL=http://localhost:8080
```

`JWT_SEGREDO` precisa ter pelo menos 32 caracteres. `ADMIN_EMAIL` e `ADMIN_PASSWORD` criam a conta do Paulo na primeira subida. Se o e-mail já existir, a senha não é trocada.

No PowerShell, na raiz do projeto:

```powershell
Get-Content .env.example | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2]
  }
}
```

Troque a senha e o segredo antes de usar isso fora da sua máquina.

## Subir o banco

Na raiz:

```powershell
docker compose up -d
```

O Postgres do projeto fica na porta **5433** da sua máquina (5432 dentro do container), para não esbarrar em outro Postgres que já use a 5432. O banco local se chama `paulo_personal`, com usuário `paulo` e senha `paulo`.

## Subir a API

O perfil padrão é `dev`. O cookie de sessão não vai marcado como `Secure`, para funcionar em `http://localhost`.

```powershell
cd backend
mvn spring-boot:run
```

A API fica em `http://localhost:8080`. Em produção, use o perfil `prod` e defina também `FRONTEND_ORIGIN` com o endereço público do site:

```powershell
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:FRONTEND_ORIGIN = "https://seu-dominio"
```

## Subir o site

Em outro terminal, ainda com `API_URL` definido:

```powershell
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3000`. O Next encaminha `/api` para a API, e o navegador guarda a sessão num cookie `HttpOnly`.

## Como usar

1. Acesse o site e cadastre um aluno em Cadastro.
2. Entre com `ADMIN_EMAIL` e `ADMIN_PASSWORD` para abrir Alunos.
3. Abra o aluno, grave uma ficha e deixe uma delas ativa.
4. Entre de novo como aluno. A página Minha ficha mostra só essa ficha ativa.

## Testes da API

Com o Docker ligado:

```powershell
cd backend
mvn test
```
