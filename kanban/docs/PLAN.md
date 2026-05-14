# Kanban MVP - Implementation Plan

## Overview

10-part plan from scaffolding to AI chat integration. Each part lists substeps as a checklist and defines success criteria. No code is written until the user approves this document. The agent checks off each item as it is completed.

**Stack:** Next.js (static export, client-rendered) + ASP.NET Core Web API + SQLite + Docker. AI calls via OpenRouter using model `openai/gpt-oss-120b`. Container exposed on port **8080**.

---

## Part 1: Plan

- [x] Write detailed plan with substeps, tests, and success criteria for each phase
- [x] User reviews and approves this document

**Success criteria:** User has approved this document and work on Part 2 may begin.

---

## Part 2: Scaffolding

### Substeps
- [x] Create `.gitignore` covering: .NET build artifacts, Node/Next.js (`node_modules`, `.next`, `out`), SQLite (`.db`, `.db-shm`, `.db-wal`), Docker artifacts, `.env`
- [x] Create `backend/` with a minimal ASP.NET Core Web API project (dotnet new webapi, .NET 9)
- [x] Configure backend to serve a static "Hello World" HTML page at `GET /`
- [x] Add `GET /api/health` returning `{ "status": "ok" }`
- [x] Write xUnit test project in `backend/tests/` verifying the health endpoint
- [x] Create `Dockerfile` at project root with multi-stage build:
  - Stage 1 (`build`): .NET 9 SDK — restore, build, publish backend to `/app/publish`
  - Final (`runtime`): .NET 9 ASP.NET runtime — copy published output, expose port 8080
- [x] Create `docker-compose.yml` mapping host port 8080 to container port 8080
- [x] Create `scripts/start.sh` (Mac/Linux): builds image and runs container via docker-compose
- [x] Create `scripts/stop.sh` (Mac/Linux): stops and removes container via docker-compose
- [x] Create `scripts/start.ps1` (Windows): equivalent PowerShell script
- [x] Create `scripts/stop.ps1` (Windows): equivalent PowerShell script

### Tests
- [x] `GET /api/health` returns HTTP 200 with `{ "status": "ok" }`
- [x] `GET /` returns HTTP 200 with HTML content
- [x] xUnit tests pass inside the container build

### Success criteria
- Running `scripts/start` builds the image and starts the container with no errors
- `http://localhost:8080` shows a "Hello World" HTML page
- `http://localhost:8080/api/health` returns `{ "status": "ok" }`
- Running `scripts/stop` cleanly halts and removes the container
- xUnit tests pass

---

## Part 3: Frontend (Kanban UI)

### Substeps
- [x] Create Next.js 15 app in `frontend/` with TypeScript, Tailwind CSS, App Router, configured for static export (`output: 'export'` in `next.config.ts`)
- [x] Create `frontend/AGENTS.md` documenting the frontend structure for future agents
- [x] Implement Kanban board at `/`:
  - [x] 5 columns with default names: Backlog, Todo, In Progress, Review, Done
  - [x] Inline column renaming (click name to edit)
  - [x] Cards display title and details
  - [x] Drag-and-drop cards between columns using `@dnd-kit/core`
  - [x] "Add card" button per column — opens a simple inline form (title + details)
  - [x] Delete card (icon/button on card)
  - [x] Board pre-populated with dummy data on load (at least 2 cards per column)
- [x] Apply the AGENTS.md color scheme throughout:
  - Accent Yellow `#ecad0a`, Blue Primary `#209dd7`, Purple Secondary `#753991`, Dark Navy `#032147`, Gray Text `#888888`
- [x] Set up Jest + React Testing Library for unit tests
- [x] Write unit tests for: initial dummy data render, column rename, add card, delete card, drag-and-drop state update
- [x] Update `Dockerfile` multi-stage build:
  - Stage 1 (`frontend-build`): Node 22 — install deps, run `next build`, output to `frontend/out/`
  - Stage 2 (`build`): .NET 9 SDK — build and publish backend
  - Final (`runtime`): copy backend publish + `frontend/out/` into container
- [x] Configure .NET to serve Next.js static files from `wwwroot/` at `/` with SPA fallback (unknown routes → `index.html`)

### Tests
- [x] Unit: initial dummy data renders correctly (column names, card count)
- [x] Unit: renaming a column updates the displayed name
- [x] Unit: adding a card appends it to the correct column
- [x] Unit: deleting a card removes it from the list
- [x] Unit: moving a card between columns updates column membership
- [x] Integration: `GET /` serves the Next.js app (returns HTML with expected content)

### Success criteria
- `http://localhost:8080` displays the Kanban board with dummy data
- All 5 columns visible; columns rename inline on click
- Cards can be added, deleted, and dragged between columns
- UI matches the AGENTS.md color scheme
- All Jest unit tests pass
- `frontend/AGENTS.md` exists and accurately describes the frontend

---

## Part 4: Fake User Sign-in

### Substeps
- [x] Add `POST /api/auth/login` backend endpoint:
  - Accepts `{ "username": "string", "password": "string" }`
  - Validates against hardcoded credentials (`user` / `password`)
  - Returns a signed JWT on success; 401 on failure
- [x] Add `POST /api/auth/logout` endpoint (client-side token clear; endpoint returns 200)
- [x] Configure JWT bearer authentication middleware in ASP.NET Core
- [x] Create login page at `/login` in Next.js:
  - Username + password fields, submit button
  - Shows error message on invalid credentials
  - Redirects to `/` on success; stores JWT in memory (not localStorage)
- [x] Protect the `/` route: unauthenticated users redirected to `/login`
- [x] Add logout button to the board page; clears token and redirects to `/login`
- [x] Write xUnit tests for login/logout endpoints
- [x] Write Jest tests for the login page component

### Tests
- [x] `POST /api/auth/login` with `user`/`password` returns HTTP 200 with JWT
- [x] `POST /api/auth/login` with bad credentials returns HTTP 401
- [x] Unauthenticated `GET /api/board` returns HTTP 401 (forward-compatibility check)
- [x] Login page shows error on bad credentials (Jest)
- [x] Successful login navigates to board (Jest)

### Success criteria
- Navigating to `http://localhost:8080` redirects to `/login`
- Logging in with `user`/`password` shows the Kanban board
- Invalid credentials display an error on the login page
- Logout returns the user to `/login`
- All xUnit and Jest tests pass

---

## Part 5: Database Modeling

### Substeps
- [ ] Design SQLite schema:
  - `users` (id, username, password_hash)
  - `boards` (id, user_id, name)
  - `columns` (id, board_id, name, position)
  - `cards` (id, column_id, title, details, position)
- [ ] Save DDL as `docs/schema.sql`
- [ ] Save JSON description as `docs/schema.json`
- [ ] Document schema rationale, relationships, and migration approach in `docs/DATABASE.md`
- [ ] Present schema to user for sign-off

### Success criteria
- `docs/schema.sql`, `docs/schema.json`, and `docs/DATABASE.md` exist and are consistent
- User has reviewed and approved the schema before Part 6 begins

---

## Part 6: Backend API

### Substeps
- [ ] Add Entity Framework Core 9 with `Microsoft.EntityFrameworkCore.Sqlite` provider
- [ ] Create EF Core entity models and `DbContext` matching the approved schema
- [ ] Apply migrations automatically at startup; create DB file if it doesn't exist
- [ ] Seed initial data on first run (one board, 5 columns with default names, at least 2 sample cards per column) for the hardcoded user
- [ ] Implement API endpoints (all require valid JWT):
  - `GET /api/board` — return full board for the authenticated user (columns with cards, ordered by position)
  - `PUT /api/columns/{id}` — rename a column `{ "name": "string" }`
  - `POST /api/cards` — create card `{ "columnId": int, "title": "string", "details": "string" }`
  - `PUT /api/cards/{id}` — update card `{ "title": "string", "details": "string", "columnId": int, "position": int }`
  - `DELETE /api/cards/{id}` — delete card
- [ ] Write xUnit integration tests using an in-memory or test SQLite database

### Tests
- [ ] `GET /api/board` returns correct structure with seeded data
- [ ] `PUT /api/columns/{id}` renames the column; verified by subsequent `GET /api/board`
- [ ] `POST /api/cards` creates a card and returns it with an id
- [ ] `PUT /api/cards/{id}` updates title, details, column assignment, and position
- [ ] `DELETE /api/cards/{id}` removes the card; confirmed absent in subsequent `GET /api/board`
- [ ] All endpoints return 401 when called without a valid JWT
- [ ] DB file is created on first run if absent

### Success criteria
- All API endpoints behave correctly per the tests above
- DB is created and seeded automatically on first run
- All xUnit tests pass

---

## Part 7: Frontend + Backend Integration

### Substeps
- [ ] Remove all in-memory dummy data; replace with API-driven state
- [ ] On board mount: `GET /api/board` to load initial state
- [ ] Column rename: `PUT /api/columns/{id}`
- [ ] Add card: `POST /api/cards`
- [ ] Delete card: `DELETE /api/cards/{id}`
- [ ] Move card (drag-and-drop drop): `PUT /api/cards/{id}` with updated `columnId` and `position`
- [ ] Edit card (click card to edit title/details): `PUT /api/cards/{id}`
- [ ] Show a minimal loading state while fetching; show a simple error message on failure
- [ ] Attach JWT to all API requests via an Authorization header
- [ ] Install Playwright; write end-to-end tests

### Tests
- [ ] Playwright: full flow — login → view board → add card → rename column → move card → edit card → delete card → logout
- [ ] Playwright: page reload after mutations preserves state (persistence confirmed)

### Success criteria
- All CRUD operations persist through page reloads
- Playwright end-to-end tests pass
- All existing xUnit and Jest tests continue to pass

---

## Part 8: AI Connectivity

### Substeps
- [ ] Read `OPENROUTER_API_KEY` from environment variable at startup (sourced from `.env` via docker-compose)
- [ ] Add `HttpClient`-based `OpenRouterClient` service to the .NET backend targeting OpenRouter's OpenAI-compatible API endpoint
- [ ] Use model `openai/gpt-oss-120b` for all AI calls
- [ ] Add `POST /api/ai/test` endpoint: sends prompt "What is 2+2? Reply with just the number." to OpenRouter and returns the raw response
- [ ] Write xUnit test (integration, skipped in CI without key) verifying a sensible numeric response

### Tests
- [ ] `POST /api/ai/test` returns HTTP 200 with a response containing "4"
- [ ] API key absence returns HTTP 500 with a clear error message (not a stack trace)

### Success criteria
- `POST /api/ai/test` successfully calls OpenRouter and returns the AI's response
- API key is never hardcoded; loaded from environment
- Test passes when `OPENROUTER_API_KEY` is set

---

## Part 9: AI with Structured Outputs

### Substeps
- [ ] Define C# response model for structured AI output:
  ```
  AiResponse {
    message: string          // AI's reply to the user
    kanban_update: object?   // null if no update; otherwise full updated board state
  }
  ```
- [ ] Build system prompt that includes the full board JSON and instructs the AI to return the structured format
- [ ] Add `POST /api/ai/chat` endpoint:
  - Accepts `{ "message": "string", "history": [{ "role": "user"|"assistant", "content": "string" }] }`
  - Calls OpenRouter with system prompt + history + user message, requesting structured output
  - Parses response; if `kanban_update` is present, applies changes to the database
  - Returns `{ "message": "string", "kanban_update": object | null }`
- [ ] Write xUnit tests for the chat endpoint using a mocked OpenRouter client

### Tests
- [ ] Mock test: response with `kanban_update` applies changes to the DB and returns the update
- [ ] Mock test: response with null `kanban_update` returns just the message; DB unchanged
- [ ] Mock test: conversation history is included in the outgoing AI request
- [ ] Integration test (skipped without key): "Add a card called Integration Test to Backlog" results in a new card in the Backlog column

### Success criteria
- `POST /api/ai/chat` returns structured responses for both update and non-update scenarios
- Kanban updates are persisted to the database when provided
- All tests pass

---

## Part 10: AI Sidebar UI

### Substeps
- [ ] Add a collapsible sidebar panel to the board layout (right side, toggled by a button)
- [ ] Implement chat UI inside the sidebar:
  - Scrollable message history (user and AI messages visually distinguished)
  - Text input and Send button (also submits on Enter)
  - Spinner/loading indicator while awaiting AI response
- [ ] On send: call `POST /api/ai/chat` with the message and accumulated session history
- [ ] If `kanban_update` is not null in the response, re-fetch `GET /api/board` to refresh the UI
- [ ] Style sidebar using the AGENTS.md color scheme; polished and integrated with the board
- [ ] Write Playwright tests for the AI chat flow

### Tests
- [ ] Playwright: open sidebar → type message → send → AI response appears in chat history
- [ ] Playwright: AI-triggered board update causes the board columns/cards to reflect the change
- [ ] Playwright: sidebar collapses and expands correctly

### Success criteria
- AI sidebar is functional and visually polished
- Sending a message that results in a `kanban_update` automatically refreshes the board
- Conversation history accumulates correctly within the session
- All Playwright tests pass
- The full app is functional end-to-end and ready to demo
