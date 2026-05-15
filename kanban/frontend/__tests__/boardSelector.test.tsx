'use client';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardSelector from '../components/BoardSelector';

const boards = [
  { id: 1, name: 'My Project' },
  { id: 2, name: 'Design' },
  { id: 3, name: 'Operations' },
];

describe('BoardSelector', () => {
  it('opens dropdown and renders board list on click', async () => {
    render(
      <BoardSelector
        boards={boards}
        currentBoardId={1}
        onSelect={jest.fn()}
        onCreate={jest.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Switch board' }));
    expect(screen.getByRole('menuitem', { name: 'My Project' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Design' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Operations' })).toBeInTheDocument();
  });

  it('calls onSelect with the correct id when a board is clicked', async () => {
    const onSelect = jest.fn();
    render(
      <BoardSelector
        boards={boards}
        currentBoardId={1}
        onSelect={onSelect}
        onCreate={jest.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Switch board' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Design' }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('submits new board name and calls onCreate', async () => {
    const onCreate = jest.fn();
    render(
      <BoardSelector
        boards={boards}
        currentBoardId={1}
        onSelect={jest.fn()}
        onCreate={onCreate}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Switch board' }));
    await userEvent.click(screen.getByText('+ New Board'));
    await userEvent.type(screen.getByRole('textbox', { name: 'New board name' }), 'Marketing');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onCreate).toHaveBeenCalledWith('Marketing');
  });

  it('closes dropdown after selecting a board', async () => {
    render(
      <BoardSelector
        boards={boards}
        currentBoardId={1}
        onSelect={jest.fn()}
        onCreate={jest.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Switch board' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Design' }));
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
