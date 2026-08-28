# Estuda+ — Plataforma de Estudos

Versão inicial pronta para GitHub, **sem Firebase**. Os dados do estudante ficam no navegador (localStorage) nesta etapa.

## Tecnologias
- React + Vite
- Node.js + Express
- OpenRouter para IA
- Google Drive por link/pasta compartilhada
- localStorage para cronograma, histórico e perfil

## Estrutura
- `client/` — interface
- `server/` — API segura para OpenRouter
- `client/src/services/storage.js` — persistência local
- `client/src/services/api.js` — comunicação com a IA

## Como executar

### 1. Instalar
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configurar OpenRouter
Na pasta `server`, copie `.env.example` para `.env`:

```env
OPENROUTER_API_KEY=SUA_CHAVE
OPENROUTER_MODEL=openai/gpt-4o-mini
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Nunca coloque a chave da OpenRouter no código do frontend ou no GitHub.**

### 3. Rodar
Na raiz:
```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

## Google Drive
A plataforma não possui mais cadastro manual de matérias/cursos. Na aba **Cursos**, o estudante acessa os materiais por uma pasta/link do Google Drive.

O administrador pode definir o link em:
**Administração → Configuração do Google Drive**

## Recursos implementados
- Login local para protótipo
- Dashboard
- Cursos via Google Drive
- IA com interface de chat
- Resumo por tema
- Geração de questões
- Simulados de 60, 80 ou 120 questões
- Escolha de banca: Geral, Cebraspe, IBFC, IBGP, Idecan, FGV, Imeso e outras
- Correção imediata das questões
- Explicação quando acertar ou errar
- Histórico de questões respondidas
- Bloqueio de repetição usando IDs/hashes das questões salvas
- Cronograma com conteúdo, data, horário, duração, observações e conclusão
- Filtros dia/semana/mês
- Desempenho por período
- Área administrativa
- Interface responsiva

## Firebase
O projeto foi propositalmente preparado para funcionar sem Firebase. A camada de armazenamento está isolada em `storage.js`, facilitando substituir localStorage por Firestore posteriormente.
