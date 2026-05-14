import type { Column } from './types';

export function moveCard(columns: Column[], cardId: number, destColumnId: number): Column[] {
  const sourceCol = columns.find(col => col.cards.some(c => c.id === cardId));
  if (!sourceCol || sourceCol.id === destColumnId) return columns;
  const card = sourceCol.cards.find(c => c.id === cardId)!;
  return columns.map(col => {
    if (col.id === sourceCol.id) return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
    if (col.id === destColumnId) return { ...col, cards: [...col.cards, card] };
    return col;
  });
}
