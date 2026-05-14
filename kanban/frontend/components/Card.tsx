'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '@/lib/types';

interface Props {
  card: CardType;
  onDelete: () => void;
}

export default function Card({ card, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={`group bg-white rounded-lg border border-gray-100 border-l-4 border-l-[#209dd7] p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[#032147] font-medium text-sm leading-snug">{card.title}</span>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete card"
          className="opacity-0 group-hover:opacity-100 text-[#888888] hover:text-red-500 transition-opacity flex-shrink-0 text-xl leading-none cursor-pointer"
        >
          &times;
        </button>
      </div>
      {card.details && (
        <p className="text-[#888888] text-xs mt-1.5 leading-relaxed">{card.details}</p>
      )}
    </div>
  );
}
