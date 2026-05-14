'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import type { Board as BoardData, Card as CardType } from '@/lib/types';
import { moveCard } from '@/lib/board';
import { apiFetch } from '@/lib/api';
import Column from './Column';

interface Props {
  token: string;
  onLogout: () => void;
}

export default function Board({ token, onLogout }: Props) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  useEffect(() => {
    apiFetch(token, '/api/board')
      .then(res => res.json())
      .then(data => setBoard(data))
      .catch(() => setError('Failed to load board. Please refresh.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function renameColumn(columnId: number, newName: string) {
    setBoard(prev => prev && {
      ...prev,
      columns: prev.columns.map(col => col.id === columnId ? { ...col, name: newName } : col),
    });
    try {
      await apiFetch(token, `/api/columns/${columnId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
      });
    } catch {
      setError('Failed to rename column.');
    }
  }

  async function addCard(columnId: number, title: string, details: string) {
    try {
      const res = await apiFetch(token, '/api/cards', {
        method: 'POST',
        body: JSON.stringify({ columnId, title, details }),
      });
      const card: CardType = await res.json();
      setBoard(prev => prev && {
        ...prev,
        columns: prev.columns.map(col =>
          col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
        ),
      });
    } catch {
      setError('Failed to add card.');
    }
  }

  async function deleteCard(columnId: number, cardId: number) {
    setBoard(prev => prev && {
      ...prev,
      columns: prev.columns.map(col =>
        col.id === columnId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
      ),
    });
    try {
      await apiFetch(token, `/api/cards/${cardId}`, { method: 'DELETE' });
    } catch {
      setError('Failed to delete card.');
    }
  }

  async function editCard(cardId: number, columnId: number, title: string, details: string) {
    const card = board?.columns.flatMap(c => c.cards).find(c => c.id === cardId);
    if (!card) return;
    setBoard(prev => prev && {
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        cards: col.cards.map(c => c.id === cardId ? { ...c, title, details } : c),
      })),
    });
    try {
      await apiFetch(token, `/api/cards/${cardId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, details, columnId, position: card.position }),
      });
    } catch {
      setError('Failed to update card.');
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const card = board?.columns.flatMap(c => c.cards).find(c => c.id === event.active.id) ?? null;
    setActiveCard(card);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    if (!board || !event.over) return;

    const cardId = event.active.id as number;
    const destColId = event.over.id as number;
    const card = board.columns.flatMap(c => c.cards).find(c => c.id === cardId);
    const sourceCol = board.columns.find(col => col.cards.some(c => c.id === cardId));
    const destCol = board.columns.find(col => col.id === destColId);

    if (!card || !sourceCol || !destCol || sourceCol.id === destColId) return;

    const newPosition = destCol.cards.length;
    setBoard(prev => prev && { ...prev, columns: moveCard(prev.columns, cardId, destColId) });

    try {
      await apiFetch(token, `/api/cards/${cardId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: card.title, details: card.details, columnId: destColId, position: newPosition }),
      });
    } catch {
      setError('Failed to move card.');
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f4f8]">
        <p className="text-[#888888]">Loading board...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="bg-[#032147] px-8 py-4 border-b-4 border-[#ecad0a] flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">{board?.name ?? 'My Project'}</h1>
          <p className="text-[#888888] text-sm mt-0.5">Kanban Board</p>
        </div>
        <button
          onClick={onLogout}
          className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-8 py-2 flex items-center justify-between flex-shrink-0">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none cursor-pointer">&times;</button>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 h-full">
            {(board?.columns ?? []).map(column => (
              <Column
                key={column.id}
                column={column}
                onRename={name => renameColumn(column.id, name)}
                onAddCard={(title, details) => addCard(column.id, title, details)}
                onDeleteCard={cardId => deleteCard(column.id, cardId)}
                onEditCard={(cardId, title, details) => editCard(cardId, column.id, title, details)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="bg-white rounded-lg border-l-4 border-l-[#753991] p-3 shadow-xl rotate-2 cursor-grabbing w-72 ring-1 ring-gray-100">
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
