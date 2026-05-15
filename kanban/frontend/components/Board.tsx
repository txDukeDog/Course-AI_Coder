'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import type { Board as BoardData, BoardSummary, Card as CardType } from '@/lib/types';
import { moveCard } from '@/lib/board';
import { apiFetch } from '@/lib/api';
import Column from './Column';
import BoardSelector from './BoardSelector';

interface Props {
  token: string;
  onLogout: () => void;
}

export default function Board({ token, onLogout }: Props) {
  const [boardList, setBoardList] = useState<BoardSummary[]>([]);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [renamingBoard, setRenamingBoard] = useState(false);
  const [boardNameDraft, setBoardNameDraft] = useState('');

  useEffect(() => {
    initBoards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function initBoards() {
    try {
      const res = await apiFetch(token, '/api/boards');
      const list: BoardSummary[] = await res.json();
      setBoardList(list);
      if (list.length === 0) { setLoading(false); return; }
      const saved = sessionStorage.getItem('kanban_board_id');
      const id = saved && list.some(b => b.id === parseInt(saved))
        ? parseInt(saved)
        : list[0].id;
      await switchBoard(id);
    } catch {
      setError('Failed to load boards. Please refresh.');
      setLoading(false);
    }
  }

  async function switchBoard(id: number) {
    setLoading(true);
    try {
      const res = await apiFetch(token, `/api/boards/${id}`);
      const data: BoardData = await res.json();
      setBoard(data);
      sessionStorage.setItem('kanban_board_id', String(id));
    } catch {
      setError('Failed to load board. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(name: string) {
    try {
      const res = await apiFetch(token, '/api/boards', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const created: BoardSummary = await res.json();
      setBoardList(prev => [...prev, created]);
      await switchBoard(created.id);
    } catch {
      setError('Failed to create board.');
    }
  }

  async function renameBoard(newName: string) {
    if (!board) return;
    const id = board.id;
    const prevName = board.name;
    setBoard(prev => prev && { ...prev, name: newName });
    setBoardList(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
    setRenamingBoard(false);
    try {
      await apiFetch(token, `/api/boards/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
      });
    } catch {
      setBoard(prev => prev && { ...prev, name: prevName });
      setBoardList(prev => prev.map(b => b.id === id ? { ...b, name: prevName } : b));
      setError('Failed to rename board.');
    }
  }

  async function deleteBoard() {
    if (!board) return;
    if (!confirm(`Delete "${board.name}"? This cannot be undone.`)) return;
    const id = board.id;
    try {
      await apiFetch(token, `/api/boards/${id}`, { method: 'DELETE' });
      const remaining = boardList.filter(b => b.id !== id);
      setBoardList(remaining);
      setBoard(null);
      if (remaining.length > 0) await switchBoard(remaining[0].id);
    } catch {
      setError('Failed to delete board.');
    }
  }

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

  function commitBoardRename() {
    const trimmed = boardNameDraft.trim();
    if (trimmed && trimmed !== board?.name) renameBoard(trimmed);
    else setRenamingBoard(false);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f4f8]">
        <p className="text-[#888888]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="bg-[#032147] px-8 py-4 border-b-4 border-[#ecad0a] flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {renamingBoard ? (
            <input
              autoFocus
              value={boardNameDraft}
              onChange={e => setBoardNameDraft(e.target.value)}
              onBlur={commitBoardRename}
              onKeyDown={e => {
                if (e.key === 'Enter') commitBoardRename();
                if (e.key === 'Escape') setRenamingBoard(false);
              }}
              aria-label="Board name"
              className="text-white text-2xl font-bold bg-transparent border-b-2 border-[#ecad0a] outline-none tracking-tight"
            />
          ) : (
            <button
              onClick={() => { setBoardNameDraft(board?.name ?? ''); setRenamingBoard(true); }}
              className="text-white text-2xl font-bold tracking-tight hover:text-white/80 transition-colors cursor-pointer"
            >
              {board?.name ?? 'Boards'}
            </button>
          )}

          <BoardSelector
            boards={boardList}
            currentBoardId={board?.id ?? null}
            onSelect={switchBoard}
            onCreate={createBoard}
          />

          {boardList.length > 0 && board && (
            <button
              onClick={deleteBoard}
              aria-label="Delete board"
              title="Delete this board"
              className="text-white/30 hover:text-red-400 transition-colors cursor-pointer text-xs ml-1"
            >
              &#10005;
            </button>
          )}
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

      {!board ? (
        <div className="flex-1 flex items-center justify-center bg-[#f0f4f8]">
          <div className="text-center">
            <p className="text-[#888888] mb-3">No boards yet.</p>
            <button
              onClick={() => {
                const name = prompt('Board name:');
                if (name?.trim()) createBoard(name.trim());
              }}
              className="bg-[#753991] text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-800 cursor-pointer"
            >
              Create your first board
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-5 h-full">
              {board.columns.map(column => (
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
      )}
    </div>
  );
}
