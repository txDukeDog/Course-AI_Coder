'use client';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Board from '../components/Board';
import { moveCard } from '../lib/board';
import { initialColumns } from '../lib/data';

const mockBoard = { id: 1, name: 'My Project', columns: initialColumns };

function setupFetch(postCardResponse?: object) {
  global.fetch = jest.fn((url: unknown, opts?: RequestInit) => {
    const u = url as string;
    if (u.endsWith('/api/boards') && (!opts?.method || opts.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, name: 'My Project' }]) });
    }
    if (u.match(/\/api\/boards\/\d+$/) && (!opts?.method || opts.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBoard) });
    }
    if (u.includes('/api/cards') && opts?.method === 'POST') {
      const card = postCardResponse ?? { id: 99, title: 'Brand new task', details: '', position: 2 };
      return Promise.resolve({ ok: true, json: () => Promise.resolve(card) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }) as jest.Mock;
}

beforeEach(() => setupFetch());
afterEach(() => jest.resetAllMocks());

describe('Board renders initial data', () => {
  it('shows all five column names', async () => {
    render(<Board token="test-token" onLogout={jest.fn()} />);
    expect(await screen.findByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders dummy cards in the correct columns', async () => {
    render(<Board token="test-token" onLogout={jest.fn()} />);
    expect(await screen.findByText('Set up CI/CD pipeline')).toBeInTheDocument();
    expect(screen.getByText('Initial project setup')).toBeInTheDocument();
  });
});

describe('Column rename', () => {
  it('updates the displayed name on Enter', async () => {
    render(<Board token="test-token" onLogout={jest.fn()} />);
    await screen.findByText('Backlog');
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
    render(<Board token="test-token" onLogout={jest.fn()} />);
    await screen.findByText('Backlog');
    await userEvent.click(screen.getAllByRole('button', { name: /add card/i })[0]);
    await userEvent.type(screen.getByPlaceholderText('Card title'), 'Brand new task');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('Brand new task')).toBeInTheDocument();
  });
});

describe('Delete card', () => {
  it('removes the card from the board', async () => {
    render(<Board token="test-token" onLogout={jest.fn()} />);
    await screen.findByText('Set up CI/CD pipeline');
    const deleteButtons = screen.getAllByLabelText('Delete card');
    await userEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Set up CI/CD pipeline')).not.toBeInTheDocument();
    });
  });
});

describe('moveCard (state logic)', () => {
  it('moves a card from one column to another', () => {
    const result = moveCard(initialColumns, 1, 2);
    const backlog = result.find(c => c.id === 1)!;
    const todo = result.find(c => c.id === 2)!;
    expect(backlog.cards.find(c => c.id === 1)).toBeUndefined();
    expect(todo.cards.find(c => c.id === 1)).toBeDefined();
  });

  it('returns columns unchanged when source equals destination', () => {
    const result = moveCard(initialColumns, 1, 1);
    expect(result).toBe(initialColumns);
  });
});
