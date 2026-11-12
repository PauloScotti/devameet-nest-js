# Devameet API (NestJS)

API do Devameet, salas de reunião virtuais em que cada participante se move por uma grade 8x8 e conversa por áudio e vídeo (WebRTC). Projeto do curso da Devaria.

- HTTP: cadastro, login, usuário, reuniões e objetos da sala.
- WebSocket (socket.io): entrada na sala, movimento, mudo e sinalização WebRTC.

## Stack

NestJS 11, MongoDB (Mongoose 8), JWT (Passport), argon2, zod (nestjs-zod), Swagger e Scalar, Jest.

## Como rodar

Requisitos: Node 20+ e um MongoDB.

```bash
npm install
```

```bash
cp .env.example .env
```

Preencha o `.env`. `USER_JWT_SECRET_KEY` é obrigatória e precisa ter pelo menos 32 caracteres; sem ela a aplicação não sobe.

```bash
npm run start:dev
```

## Documentação

| Endereço | Conteúdo |
| --- | --- |
| `/docs` | Swagger UI |
| `/docs-json` | Documento OpenAPI |
| `/reference` | Referência Scalar |

As rotas ficam sob `/api`. Fora `POST /api/auth/login` e `POST /api/auth/register`, todas exigem `Authorization: Bearer <token>`.

## WebSocket

| Evento recebido | Dados |
| --- | --- |
| `join` | `link`, `userId` |
| `move` | `link`, `userId`, `x`, `y` (0 a 8), `orientation` |
| `toggl-mute-user` | `link`, `userId`, `muted` |
| `call-user` | `to`, `offer` |
| `make-answer` | `to`, `answer` |

Toda mensagem é validada. Mensagem inválida é descartada e quem enviou recebe `room-error` com o motivo.

## Segurança

- Senhas com argon2id. Senhas gravadas no formato antigo (AES reversível) continuam valendo e são convertidas no primeiro login.
- Senha nova: 8 caracteres ou mais, com maiúscula, minúscula e número ou símbolo.
- Token JWT expira em 7 dias.
- Entrada HTTP e WebSocket validada com zod; campos desconhecidos são descartados.
- Limitação conhecida: o WebSocket não autentica a conexão, o cliente informa o `userId`. Corrigir exige enviar o token no handshake e ajustar os front-ends.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run start:dev` | Sobe em modo de desenvolvimento |
| `npm run build` | Compila para `dist/` |
| `npm run start:prod` | Roda a versão compilada |
| `npm run typecheck` | Checagem de tipos |
| `npm test` | Testes unitários |

## Deploy

O `vercel.json` publica só as rotas HTTP. Funções serverless da Vercel não mantêm conexão WebSocket, então a sala precisa de um host com processo persistente (Render, Railway, Fly.io ou VPS).
