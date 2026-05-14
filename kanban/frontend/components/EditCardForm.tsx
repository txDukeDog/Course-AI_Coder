'use client';

import { useState } from 'react';

interface Props {
  title: string;
  details: string;
  onSubmit: (title: string, details: string) => void;
  onCancel: () => void;
}

export default function EditCardForm({ title: initialTitle, details: initialDetails, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [details, setDetails] = useState(initialDetails);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSubmit(t, details.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 border border-[#209dd7] flex flex-col gap-2">
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="text-sm border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-[#209dd7] text-[#032147] bg-white"
      />
      <textarea
        value={details}
        onChange={e => setDetails(e.target.value)}
        rows={2}
        className="text-sm border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-[#209dd7] resize-none text-[#032147] bg-white"
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-[#753991] text-white text-sm rounded px-3 py-1.5 hover:bg-[#5e2d75] transition-colors cursor-pointer">Save</button>
        <button type="button" onClick={onCancel} className="text-[#888888] text-sm px-3 py-1.5 hover:text-[#032147] transition-colors cursor-pointer">Cancel</button>
      </div>
    </form>
  );
}
