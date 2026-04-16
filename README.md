# SCORES - Front-end Prototype (Next.js + TypeScript + Tailwind)

Protótipo navegável do jogo de gestão de basquete **SCORES**, com foco em telas, navegação, tipagem, arquitetura em camadas e integração preparada para Firebase com fallback local via mocks.

## Como rodar

```bash
npm install
npm run dev
```

Acesse: `http://localhost:3000`

## Rotas principais

- `/` → HomeView
- `/select-team` → SelectTeamView
- `/squad?saveId=save-001` → SquadHomeView
- `/match-board?saveId=save-001` → MatchBoardView
- `/ht-manager?saveId=save-001` → HTManagerBoardView
- `/post-match?saveId=save-001` → PostMatchBoardView
- `/save-board` → SavingBoardView
- `/config` → ConfigView

## Estrutura de pastas

- `app/` → telas e navegação
- `components/` → componentes reutilizáveis
- `types/` → modelagem de dados forte
- `mocks/` → dados fallback para desenvolvimento local
- `repositories/` → leitura de dados (mock/Firebase)
- `services/` → orquestração por fluxo de tela
- `lib/firebase/` → camada de configuração do Firebase

## Collections esperadas no Firebase

Configure as collections abaixo no Firestore (ou adapte para Realtime DB):

1. `leagues`
   - `id, name, country, format, teamCount, season, logoUrl`
2. `teams`
   - `id, leagueId, name, shortName, logoUrl, overall, attackOverall, defenseOverall, physicality, budget, stadiumId, managerDefaultName, reputationBoard, reputationFans, currentLeaguePosition, primaryColor, secondaryColor, visualId, uniformIds, summary`
3. `players`
   - `id, teamId, name, age, position, overall, marketValue, physicalCondition, pace, shooting, passing, dribbling, defending, physical, playstyles, isStarter, isBench`
4. `users`
   - `id, displayName, email, createdAt`
5. `user_saves`
   - `id, userId, leagueId, teamId, managerName, currentRound, currentSeason, createdAt, updatedAt, nextFixtureId, budgetSnapshot, boardReputation, fansReputation`
6. `club_uniforms`
   - `id, teamId, type, primaryColor, secondaryColor, imageUrl`
7. `stadiums`
   - `id, teamId, name, capacity, level, value`
8. `club_visuals`
   - `id, teamId, backgroundType, primaryColor, secondaryColor, accentColor, shapeCss, gradientCss, textureUrl`
9. `fixtures`
   - `id, leagueId, round, date, homeTeamId, awayTeamId, homeScore, awayScore, status, quarter, clock`
10. `standings`
    - `teamId, leagueId, played, wins, losses, pointsFor, pointsAgainst, leaguePoints, position`
11. `league_champions_history`
    - `id, leagueId, season, championTeamId`

## Dependência de collections por tela

- **HomeView**: navegação (sem dependência direta)
- **SelectTeamView**: `leagues`, `teams`
- **SquadHomeView**: `user_saves`, `teams`, `players`, `fixtures`, `club_visuals`, `club_uniforms`, `standings`
- **MatchBoardView**: `user_saves`, `fixtures`, `teams`
- **HTManagerBoardView**: `user_saves`, `players`, `teams`
- **PostMatchBoardView**: `fixtures`, `standings`, `teams`
- **SavingBoardView**: `user_saves`, `teams`, `leagues`
- **ConfigView**: preparado para futura persistência em `users` (ou `user_settings` opcional)

## Troca de mock para Firebase

1. Configure variáveis `.env.local`:

```bash
NEXT_PUBLIC_DATA_SOURCE=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

2. Pontos de integração já preparados:
   - `lib/firebase/config.ts`
   - comentários `TODO` nos arquivos em `repositories/*`

3. Enquanto Firebase não estiver pronto, mantenha:

```bash
NEXT_PUBLIC_DATA_SOURCE=mock
```

Assim a aplicação continua funcional via `mocks/gameData.ts`.

## Motor de Simulação (Scoring Engine)

Novo módulo com responsabilidades separadas:

- `engines/gameSimulationEngine.ts` → loop da partida (4 quarters, 48 ticks/quarter, 15s por tick)
- `engines/possessionEngine.ts` → volume de oportunidades/posses por tick
- `engines/scoringEngine.ts` → attack rating, defense resistance, chance de pontuar e conversão de pontos
- `engines/contextEngine.ts` → fatores contextuais (casa, forma, sorte, fadiga, disciplina, moral, estado do jogo)
- `engines/playstyleEngine.ts` → modificadores condicionais de playstyles
- `types/simulation.ts` → tipos fortes de estado de partida
- `services/simulation/SimulationDemoService.ts` → exemplos executáveis (quarter e jogo completo)

### Fórmulas base implementadas

- `attack_rating` e `defense_resistance` seguindo os pesos solicitados (ajustáveis em `defaultSimulationWeights`).
- `chance_to_score = attack / (attack + defense)`.
- `score_rate = base_rate * possession_factor * (attack/defense) * context_factor`.
- `context_factor` agora incorpora também pressão de tabela, moral do manager, momentum e histórico recente entre equipes.
- `attack_rating` recebe multiplicador de execução tática (`tacticalDiscipline`) para refletir escolhas do usuário.

### Exemplo de quarter completo

A função `runQuarterSimulationExample()` roda exatamente 1 quarter completo (48 ticks) e retorna:

- placar parcial
- posses estimadas
- eficiência ofensiva
- log de eventos de pontuação por tick

A rota `/match-board` já exibe esse exemplo com eventos reais do engine.
