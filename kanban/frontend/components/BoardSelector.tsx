'use client';

import { useState, useRef, useEffect } from 'react';
import type { BoardSummary } from '@/lib/types';

interface Props {
  boards: BoardSummary[];
  currentBoardId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => void;
}

export default function BoardSelector({ boards, currentBoardId, onSelect, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setNewName('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName('');
    setCreating(false);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Switch board"
        aria-expanded={open}
        className="text-[#ecad0a] hover:text-yellow-300 transition-colors cursor-pointer text-sm px-1"
      >
        &#9662;
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[200px] z-50"
        >
          {boards.map(b => (
            <button
              key={b.id}
              role="menuitem"
              onClick={() => { onSelect(b.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                b.id === currentBoardId ? 'text-[#209dd7] font-medium' : 'text-[#032147]'
              }`}
            >
              {b.name}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            {creating ? (
              <form onSubmit={handleCreate} className="px-3 py-2 flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Board name"
                  aria-label="New board name"
                  className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 text-[#032147] outline-none focus:border-[#209dd7]"
                />
                <button
                  type="submit"
                  className="text-xs bg-[#753991] text-white px-2 py-1 rounded hover:bg-purple-800 cursor-pointer"
                >
                  Add
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full text-left px-4 py-2 text-sm text-[#209dd7] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                + New Board
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
