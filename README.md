# Sistema de Entregas — API

API REST em Java + Spring Boot para cadastro/login de usuários e gerenciamento de pedidos, com persistência em SQLite.

## Como rodar

Pré-requisito: Maven configurado no PATH (`mvn -version` deve funcionar).

Dentro da pasta do projeto:

```powershell
mvn spring-boot:run
```
Aguarde aparecer no log algo como `Started SistemaEntregasApplication`. A API sobe em `http://localhost:8080` e cria sozinha o arquivo `pedidos.db` (SQLite) na raiz do projeto na primeira execução.

Deixe esse terminal aberto rodando o servidor e abra **outro terminal** para testar as rotas.

---

## Autenticação

Quase todas as rotas exigem login. O fluxo é:

1. Cadastra o usuário em `POST /auth/cadastro`.
2. Faz login em `POST /auth/login`, que devolve um `token`.
3. Envia esse token em todas as chamadas seguintes no header:
   ```
   Authorization: Bearer <token>
   ```
4. Sem esse header (ou com token inválido), qualquer rota que não seja `/auth/**` responde `401`.

O token é gerado em memória e some quando o servidor reinicia — se isso acontecer, é só logar de novo.

### Rate limit

Todas as rotas têm um limite de **20 requisições por minuto por IP**. Se passar disso, a API responde `429 Too Many Requests` até a janela de 1 minuto renovar.

---

## Rotas

Todos os exemplos usam `Invoke-RestMethod` do PowerShell (funciona sem os problemas de aspas que o `curl` tem no Windows).

### 1. Cadastrar usuário

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

---

### 2. Login

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

---

### 3. Criar pedido

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
  "status": "RECEBIDO",
  "criadoEm": "2026-08-02T18:37:13.012"
}
```

Todo pedido novo nasce com status `RECEBIDO`.

Erros possíveis:
- `400` — faltou cliente, itens ou enderecoEntrega.
- `401` — sem token válido.

---

### 4. Listar todos os pedidos

`GET /pedidos` — **requer token**

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/pedidos" -Headers $headers
```

Resposta esperada (`200 OK`): lista com todos os pedidos cadastrados (igual ao formato do item 3, dentro de um array `[...]`).

---

### 5. Buscar pedido por ID

`GET /pedidos/{id}` — **requer token**

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/pedidos/1" -Headers $headers
```

Resposta esperada (`200 OK`): o pedido com aquele ID (formato do item 3).

Erros possíveis:
- `404` — não existe pedido com esse ID.

---

### 6. Atualizar status do pedido

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

---

## Testando os erros esperados

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

## Resumo das rotas

| Método | Rota                  | Autenticado? | Descrição                        |
|--------|-----------------------|--------------|-----------------------------------|
| POST   | /auth/cadastro         | não          | Cria um novo usuário              |
| POST   | /auth/login            | não          | Faz login e retorna o token       |
| POST   | /pedidos                | sim          | Cria um pedido                    |
| GET    | /pedidos                | sim          | Lista todos os pedidos            |
| GET    | /pedidos/{id}           | sim          | Busca um pedido por ID            |
| PUT    | /pedidos/{id}/status    | sim          | Atualiza o status de um pedido    |
