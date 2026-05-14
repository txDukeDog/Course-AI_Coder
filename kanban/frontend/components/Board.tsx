'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import type { Column as ColumnType, Card as CardType } from '@/lib/types';
import { initialColumns } from '@/lib/data';
import { moveCard } from '@/lib/board';
import Column from './Column';

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  function renameColumn(columnId: string, newName: string) {
    setColumns(cols => cols.map(col =>
      col.id === columnId ? { ...col, name: newName } : col
    ));
  }

  function addCard(columnId: string, title: string, details: string) {
    const newCard: CardType = { id: `card-${Date.now()}`, title, details };
    setColumns(cols => cols.map(col =>
      col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
    ));
  }

  function deleteCard(columnId: string, cardId: string) {
    setColumns(cols => cols.map(col =>
      col.id === columnId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
    ));
  }

  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string;
    const card = columns.flatMap(c => c.cards).find(c => c.id === cardId) ?? null;
    setActiveCard(card);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    setColumns(cols => moveCard(cols, active.id as string, over.id as string));
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="bg-[#032147] px-8 py-4 border-b-4 border-[#ecad0a] flex-shrink-0">
        <h1 className="text-white text-2xl font-bold tracking-tight">My Project</h1>
        <p className="text-[#888888] text-sm mt-0.5">Kanban Board</p>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 h-full">
            {columns.map(column => (
              <Column
                key={column.id}
                column={column}
                onRename={name => renameColumn(column.id, name)}
                onAddCard={(title, details) => addCard(column.id, title, details)}
                onDeleteCard={cardId => deleteCard(column.id, cardId)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="bg-white rounded-lg border border-gray-100 border-l-4 border-l-[#753991] p-3 shadow-xl rotate-2 cursor-grabbing w-72">
                <span className="text-[#032147] font-medium text-sm">{activeCard.title}</span>
                {activeCard.details && (
                  <p className="text-[#888888] text-xs mt-1.5">{activeCard.details}</p>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
