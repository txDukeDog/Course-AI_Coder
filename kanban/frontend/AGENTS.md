# Frontend Structure

Next.js 15 app (static export) served by the ASP.NET Core backend from `wwwroot/`.

## Key configuration

- `next.config.ts` — `output: 'export'` produces static files in `out/`
- `tsconfig.json` — `@/*` maps to the project root (`./`)
- `jest.config.js` + `jest.setup.js` — Jest with `next/jest` and `@testing-library/react`

## Directory layout

```
app/
  layout.tsx       root layout, sets full-height flex body
  page.tsx         renders <Board />
  globals.css      Tailwind import + body defaults

components/
  Board.tsx        DndContext, all board state (columns), drag handlers
  Column.tsx       droppable area, inline rename, add-card form toggle
  Card.tsx         draggable card, delete button
  AddCardForm.tsx  controlled form: title + details fields

lib/
  types.ts         Card and Column interfaces
  data.ts          initialColumns — dummy data for 5 columns x 2 cards
  board.ts         moveCard() pure function (also unit-tested in isolation)

__tests__/
  board.test.tsx   7 unit tests covering render, rename, add, delete, moveCard
```

## Color scheme

| Token            | Hex       | Usage                          |
|------------------|-----------|--------------------------------|
| Accent Yellow    | `#ecad0a` | Header border, hover highlight |
| Blue Primary     | `#209dd7` | Card left border, drop target  |
| Purple Secondary | `#753991` | Add card submit button         |
| Dark Navy        | `#032147` | Column headers, card titles    |
| Gray Text        | `#888888` | Details text, secondary labels |

## State management

All board state lives in `Board.tsx` (`useState`). No external state library. When the backend API is integrated (Part 7), replace `initialColumns` with an API fetch and wire each mutation to the corresponding endpoint.

## Drag and drop

Uses `@dnd-kit/core`. Cards are `useDraggable`, columns are `useDroppable`. `DragOverlay` renders a ghost card while dragging. `moveCard()` from `lib/board.ts` handles the state transition on `onDragEnd`.

## Testing

Run with `npm test`. Tests use `@testing-library/react` + `userEvent`. Drag-and-drop is covered by testing `moveCard()` as a pure function; component tests cover rename, add, and delete via simulated clicks.
