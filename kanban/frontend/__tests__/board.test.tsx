import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Board from '../components/Board';
import { moveCard } from '../lib/board';
import { initialColumns } from '../lib/data';

describe('Board renders initial data', () => {
  it('shows all five column names', () => {
    render(<Board />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders dummy cards in the correct columns', () => {
    render(<Board />);
    expect(screen.getByText('Set up CI/CD pipeline')).toBeInTheDocument();
    expect(screen.getByText('Initial project setup')).toBeInTheDocument();
  });
});

describe('Column rename', () => {
  it('updates the displayed name on Enter', async () => {
    render(<Board />);
    await userEvent.click(screen.getByRole('button', { name: 'Backlog' }));
    const input = screen.getByDisplayValue('Backlog');
    await userEvent.clear(input);
    await userEvent.type(input, 'Inbox');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Backlog' })).not.toBeInTheDocument();
  });
});

describe('Add card', () => {
  it('appends a new card to the column', async () => {
    render(<Board />);
    await userEvent.click(screen.getAllByRole('button', { name: /add card/i })[0]);
    await userEvent.type(screen.getByPlaceholderText('Card title'), 'Brand new task');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Brand new task')).toBeInTheDocument();
  });
});

describe('Delete card', () => {
  it('removes the card from the board', async () => {
    render(<Board />);
    expect(screen.getByText('Set up CI/CD pipeline')).toBeInTheDocument();
    const deleteButtons = screen.getAllByLabelText('Delete card');
    await userEvent.click(deleteButtons[0]);
    expect(screen.queryByText('Set up CI/CD pipeline')).not.toBeInTheDocument();
  });
});

describe('moveCard (state logic)', () => {
  it('moves a card from one column to another', () => {
    const result = moveCard(initialColumns, 'card-1', 'todo');
    const backlog = result.find(c => c.id === 'backlog')!;
    const todo = result.find(c => c.id === 'todo')!;
    expect(backlog.cards.find(c => c.id === 'card-1')).toBeUndefined();
    expect(todo.cards.find(c => c.id === 'card-1')).toBeDefined();
  });

  it('returns columns unchanged when source equals destination', () => {
    const result = moveCard(initialColumns, 'card-1', 'backlog');
    expect(result).toBe(initialColumns);
  });
});
