# Sistema de Entregas

Sistema simplificado de rastreamento de pedidos de delivery, com:

- **Back-end**: API REST em Java + Spring Boot, com persistência em SQLite, autenticação por token e rate limit.
- **Front-end**: aplicação em React (Vite) + MUI que consome essa API — login/cadastro, listagem de pedidos com status e criação de novos pedidos.

Os dois projetos rodam separados (portas diferentes) e se conectam via HTTP: o front-end é só um cliente da API.

```
Sistema entregas/
├── src/            → back-end (Java/Spring Boot)
├── pedidos.db       → banco SQLite (criado automaticamente)
└── frontend/        → front-end (React + Vite + MUI)
```

---

## Visão geral da integração

- O back-end sobe em `http://localhost:8080`.
- O front-end sobe em `http://localhost:5173` (padrão do Vite) e chama a API através da variável `VITE_API_URL` (arquivo `frontend/.env`), que já vem apontando para `http://localhost:8080`.
- Como as duas aplicações rodam em portas diferentes, o back-end tem uma configuração de **CORS** (`src/main/java/com/entregas/web/WebConfig.java`) liberando explicitamente a origem `http://localhost:5173` para os métodos usados pelo front (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`).
- O fluxo de autenticação é o mesmo descrito na seção do back-end: o front faz login, guarda o `token` retornado (em um cookie no navegador) e manda esse token em `Authorization: Bearer <token>` em toda chamada a `/pedidos/**`.

**Para usar o sistema completo, os dois precisam estar rodando ao mesmo tempo**, cada um no seu terminal.

---

## 1. Back-end (API)

Pré-requisito: Maven configurado no PATH (`mvn -version` deve funcionar).

Na raiz do projeto:

```powershell
mvn spring-boot:run
```

Aguarde aparecer no log algo como `Started SistemaEntregasApplication`. A API sobe em `http://localhost:8080` e cria sozinha o arquivo `pedidos.db` (SQLite) na raiz do projeto na primeira execução.

Deixe esse terminal aberto rodando o servidor.

### Autenticação

Quase todas as rotas exigem login. O fluxo é:

1. Cadastra o usuário em `POST /auth/cadastro`.
2. Faz login em `POST /auth/login`, que devolve um `token`.
3. Envia esse token em todas as chamadas seguintes no header:
   ```
   Authorization: Bearer <token>
   ```
4. Sem esse header (ou com token inválido), qualquer rota que não seja `/auth/**` responde `401`.

O token é gerado em memória e some quando o servidor reinicia — se isso acontecer, é só logar de novo (o front-end detecta o `401` e te leva de volta pra tela de login).

### Rate limit

Todas as rotas têm um limite de **20 requisições por minuto por IP**. Se passar disso, a API responde `429 Too Many Requests` até a janela de 1 minuto renovar.

### CORS

Configurado em `WebConfig.java` para aceitar requisições vindas de `http://localhost:5173` e `http://127.0.0.1:5173` (onde o front-end roda em desenvolvimento). Se o front-end for hospedado em outra origem (ex.: deploy em produção), essa lista precisa ser atualizada.

### Rotas

Todos os exemplos usam `Invoke-RestMethod` do PowerShell (funciona sem os problemas de aspas que o `curl` tem no Windows).

#### 1.1. Cadastrar usuário

`POST /auth/cadastro`

Corpo (JSON):
| Campo | Tipo   | Obrigatório |
|-------|--------|-------------|
| nome  | string | sim         |
| email | string | sim         |
| senha | string | sim         |

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/auth/cadastro" -Method Post -ContentType "application/json" -Body '{"nome":"Lucas","email":"lucas@teste.com","senha":"123456"}'
```

Resposta esperada (`201 Created`):
```json
{ "id": 1, "nome": "Lucas", "email": "lucas@teste.com" }
```

Erros possíveis:
- `400` — faltou nome, email ou senha.
- `409` — já existe um usuário cadastrado com esse email.

#### 1.2. Login

`POST /auth/login`

Corpo (JSON):
| Campo | Tipo   | Obrigatório |
|-------|--------|-------------|
| email | string | sim         |
| senha | string | sim         |

```powershell
$login = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"lucas@teste.com","senha":"123456"}'
$login
$headers = @{ Authorization = "Bearer $($login.token)" }
```

Resposta esperada (`200 OK`):
```json
{ "token": "04211d51-be7e-420c-ad11-b1ce30b19575", "usuario": { "id": 1, "nome": "Lucas", "email": "lucas@teste.com" } }
```

Guarde o token: os exemplos abaixo usam a variável `$headers` criada acima, que já manda o token certo em todas as próximas chamadas.

Erros possíveis:
- `400` — faltou email ou senha.
- `401` — email ou senha incorretos.

#### 1.3. Criar pedido

`POST /pedidos` — **requer token**

Corpo (JSON):
| Campo            | Tipo           | Obrigatório |
|-------------------|----------------|-------------|
| cliente            | string         | sim         |
| itens              | lista de strings | sim (não pode ser vazia) |
| enderecoEntrega    | string         | sim         |

```powershell
$pedido = Invoke-RestMethod -Uri "http://localhost:8080/pedidos" -Method Post -ContentType "application/json" -Headers $headers -Body '{"cliente":"Maria","itens":["Pizza","Refrigerante"],"enderecoEntrega":"Rua A, 123"}'
$pedido
```

Resposta esperada (`201 Created`):
```json
{
  "id": 1,
  "cliente": "Maria",
  "itens": ["Pizza", "Refrigerante"],
  "enderecoEntrega": "Rua A, 123",
  "status": "EM_PREPARO",
  "criadoEm": "2026-08-02T18:37:13.012"
}
```

Todo pedido novo nasce com status `EM_PREPARO`.

Erros possíveis:
- `400` — faltou cliente, itens ou enderecoEntrega.
- `401` — sem token válido.

#### 1.4. Listar todos os pedidos

`GET /pedidos` — **requer token**

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/pedidos" -Headers $headers
```

Resposta esperada (`200 OK`): lista com todos os pedidos cadastrados (igual ao formato do item 1.3, dentro de um array `[...]`).

#### 1.5. Buscar pedido por ID

`GET /pedidos/{id}` — **requer token**

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/pedidos/1" -Headers $headers
```

Resposta esperada (`200 OK`): o pedido com aquele ID (formato do item 1.3).

Erros possíveis:
- `404` — não existe pedido com esse ID.

#### 1.6. Atualizar status do pedido

`PUT /pedidos/{id}/status` — **requer token**

Corpo (JSON):
| Campo  | Tipo   | Obrigatório |
|--------|--------|-------------|
| status | string | sim         |

Valores aceitos para `status`: `RECEBIDO`, `EM_PREPARO`, `SAIU_PARA_ENTREGA`, `ENTREGUE`, `CANCELADO`.

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/pedidos/1/status" -Method Put -ContentType "application/json" -Headers $headers -Body '{"status":"EM_PREPARO"}'
```

Resposta esperada (`200 OK`): o pedido atualizado, com o novo status.

Erros possíveis:
- `400` — valor de status que não existe na lista acima.
- `404` — não existe pedido com esse ID.

#### 1.7. Excluir pedido

`DELETE /pedidos/{id}` — **requer token**

Remove o pedido definitivamente (útil inclusive para descartar pedidos já cancelados).

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/pedidos/1" -Method Delete -Headers $headers
```

Resposta esperada: `204 No Content` (sem corpo).

Erros possíveis:
- `404` — não existe pedido com esse ID.

### Testando os erros esperados

```powershell
# Sem token -> 401
Invoke-RestMethod -Uri "http://localhost:8080/pedidos"

# Pedido inexistente -> 404
Invoke-RestMethod -Uri "http://localhost:8080/pedidos/9999" -Headers $headers

# Status inválido -> 400
Invoke-RestMethod -Uri "http://localhost:8080/pedidos/1/status" -Method Put -ContentType "application/json" -Headers $headers -Body '{"status":"VOANDO"}'

# Email duplicado -> 409
Invoke-RestMethod -Uri "http://localhost:8080/auth/cadastro" -Method Post -ContentType "application/json" -Body '{"nome":"Lucas","email":"lucas@teste.com","senha":"123456"}'
```

Nesses casos o PowerShell mostra o erro em vermelho com o código HTTP (ex.: `401 Unauthorized`) — isso é o esperado, não é bug.

### Resumo das rotas

| Método | Rota                  | Autenticado? | Descrição                        |
|--------|-----------------------|--------------|-----------------------------------|
| POST   | /auth/cadastro         | não          | Cria um novo usuário              |
| POST   | /auth/login            | não          | Faz login e retorna o token       |
| POST   | /pedidos                | sim          | Cria um pedido                    |
| GET    | /pedidos                | sim          | Lista todos os pedidos            |
| GET    | /pedidos/{id}           | sim          | Busca um pedido por ID            |
| PUT    | /pedidos/{id}/status    | sim          | Atualiza o status de um pedido    |
| DELETE | /pedidos/{id}           | sim          | Exclui um pedido                  |

---

## 2. Front-end (interface web)

Aplicação em **React**, criada com **Vite** e usando **MUI (Material-UI)** para os componentes visuais. Fica na pasta `frontend/`.

Pré-requisito: Node.js instalado (`node -v` e `npm -v` devem funcionar).

### Como rodar

Com o back-end já rodando em outro terminal (seção 1), abra um **novo terminal** e rode:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

O Vite sobe o front-end em `http://localhost:5173`. Abra esse endereço no navegador.

Outros comandos úteis:

```powershell
npm run build     # gera a versão de produção em frontend/dist
npm run preview   # serve a build de produção localmente, para conferência
npm run lint      # roda o ESLint
```

### Configuração

A URL da API que o front-end consome vem da variável `VITE_API_URL`, lida do arquivo `frontend/.env`:

```
VITE_API_URL=http://localhost:8080
```

Esse arquivo **não é commitado** (está no `.gitignore`) — o modelo versionado é `frontend/.env.example`. Ao clonar o projeto, copie-o para `.env` (`Copy-Item .env.example .env`) antes do primeiro `npm run dev`. Se o back-end rodar em outra porta/host, ajuste o valor em `.env` (e reinicie `npm run dev`).

### Telas e fluxo

- **`/login`** — autentica com email/senha, chama `POST /auth/login` e guarda o token retornado em um cookie (`se_auth`, válido por 7 dias).
- **`/cadastro`** — cria um novo usuário (`POST /auth/cadastro`) e já faz login em seguida.
- **`/pedidos`** — tela principal, protegida (só acessível logado):
  - lista todos os pedidos (`GET /pedidos`), com cliente, itens, endereço, data de criação e status atual;
  - permite trocar o status de cada pedido direto na listagem (`PUT /pedidos/{id}/status`);
  - permite excluir um pedido (ícone de lixeira em cada card, com confirmação) — útil inclusive para remover pedidos já cancelados (`DELETE /pedidos/{id}`);
  - botão **"Novo pedido"** abre um formulário para criar um pedido (`POST /pedidos`), informando cliente, endereço de entrega e a lista de itens.

Se o token expirar ou for inválido (por exemplo, porque o back-end reiniciou e perdeu os tokens em memória), a próxima chamada à API retorna `401` e o front-end mostra o erro — é só fazer login de novo.

### Tema claro/escuro

O botão de sol/lua (no canto superior direito, em toda tela) alterna entre tema claro e escuro. A escolha é salva em um cookie (`se_theme`, válido por 1 ano) e usada como padrão na próxima visita; se não houver cookie ainda, o front-end parte da preferência do sistema operacional (`prefers-color-scheme`). A paleta de cores do MUI é azul em ambos os modos.

### Cookies usados pelo front-end

| Cookie      | Conteúdo                                | Duração  |
|-------------|------------------------------------------|----------|
| `se_auth`   | `{ token, usuario }` da sessão logada     | 7 dias   |
| `se_theme`  | `"light"` ou `"dark"`                     | 1 ano    |

Nenhum dado é enviado a servidores de terceiros — os cookies só existem no navegador do usuário (`document.cookie`) e são lidos pelo próprio front-end para restaurar sessão e tema entre visitas.

### Estrutura do código

```
frontend/src/
├── api/            → funções que chamam a API (auth.js, pedidos.js) e o client.js base (fetch)
├── components/      → componentes reutilizáveis (Layout, StatusChip, PedidoCard, NovoPedidoDialog, ConfirmarExclusaoDialog, ProtectedRoute, ThemeToggleButton)
├── context/          → AuthContext (sessão logada) e ThemeModeContext (tema claro/escuro)
├── pages/            → telas (LoginPage, CadastroPage, PedidosPage)
├── utils/cookies.js  → helpers para ler/gravar/remover cookies
├── status.js         → labels e cores dos status de pedido usados na UI
├── theme.js          → gera o tema do MUI (paleta azul, claro ou escuro)
└── App.jsx           → rotas da aplicação (react-router-dom)
```

---

## 3. Rodando tudo junto

1. Terminal 1, na raiz do projeto: `mvn spring-boot:run` (API em `http://localhost:8080`).
2. Terminal 2, na pasta `frontend`: `npm run dev` (interface em `http://localhost:5173`).
3. Acesse `http://localhost:5173`, cadastre um usuário, faça login e comece a criar/acompanhar pedidos.
