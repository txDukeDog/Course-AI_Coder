'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '@/lib/types';
import EditCardForm from './EditCardForm';

interface Props {
  card: CardType;
  onDelete: () => void;
  onEdit: (title: string, details: string) => void;
}

export default function Card({ card, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });

  if (editing) {
    return (
      <EditCardForm
        title={card.title}
        details={card.details}
        onSubmit={(title, details) => { onEdit(title, details); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={`group bg-white rounded-lg border border-gray-100 border-l-4 border-l-[#209dd7] p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[#032147] font-medium text-sm leading-snug flex-1">{card.title}</span>
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); setEditing(true); }}
            aria-label="Edit card"
            className="text-[#888888] hover:text-[#209dd7] text-xs cursor-pointer"
          >
            Edit
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(); }}
            aria-label="Delete card"
            className="text-[#888888] hover:text-red-500 text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>
      </div>
      {card.details && (
        <p className="text-[#888888] text-xs mt-1.5 leading-relaxed">{card.details}</p>
      )}
    </div>
  );
}
