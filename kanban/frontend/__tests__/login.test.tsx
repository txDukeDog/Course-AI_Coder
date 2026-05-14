import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import { AuthProvider } from '../lib/auth';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

global.fetch = jest.fn();

function renderLogin() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

beforeEach(() => jest.clearAllMocks());

describe('Login page', () => {
  it('renders username, password, and submit button', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error message on invalid credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), 'wrong');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid username or password/i)
    );
  });

  it('navigates to board on successful login', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-jwt-token' }),
    });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), 'user');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });
});
