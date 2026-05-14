'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Column as ColumnType } from '@/lib/types';
import Card from './Card';
import AddCardForm from './AddCardForm';

interface Props {
  column: ColumnType;
  onRename: (name: string) => void;
  onAddCard: (title: string, details: string) => void;
  onDeleteCard: (cardId: number) => void;
  onEditCard: (cardId: number, title: string, details: string) => void;
}

export default function Column({ column, onRename, onAddCard, onDeleteCard, onEditCard }: Props) {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(column.name);
  const [addingCard, setAddingCard] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  function commitRename() {
    const trimmed = nameValue.trim();
    if (trimmed) onRename(trimmed);
    else setNameValue(column.name);
    setEditing(false);
  }

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 max-h-full">
      <div className="bg-[#032147] rounded-t-xl px-4 py-3 flex items-center justify-between gap-2 flex-shrink-0">
        {editing ? (
          <input
            autoFocus
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setNameValue(column.name); setEditing(false); }
            }}
            className="bg-white/10 text-white rounded px-2 py-0.5 text-sm font-semibold w-full outline-none border border-[#ecad0a]"
          />
        ) : (
          <button
            onClick={() => { setNameValue(column.name); setEditing(true); }}
            className="text-white font-semibold text-sm truncate text-left hover:text-[#ecad0a] transition-colors cursor-pointer flex-1"
          >
            {column.name}
          </button>
        )}
        <span className="text-xs text-white/60 bg-white/10 rounded-full px-2 py-0.5 flex-shrink-0">
          {column.cards.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col p-3 gap-2 overflow-y-auto min-h-[120px] transition-colors rounded-b-xl ${isOver ? 'bg-[#209dd7]/10' : ''}`}
      >
        {column.cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onDelete={() => onDeleteCard(card.id)}
            onEdit={(title, details) => onEditCard(card.id, title, details)}
          />
        ))}

        {addingCard ? (
          <AddCardForm
            onSubmit={(title, details) => { onAddCard(title, details); setAddingCard(false); }}
            onCancel={() => setAddingCard(false)}
          />
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="mt-1 text-[#888888] hover:text-[#209dd7] text-sm flex items-center gap-1 transition-colors cursor-pointer w-fit"
          >
            <span className="text-base leading-none font-bold">+</span> Add card
          </button>
        )}
      </div>
    </div>
  );
}
