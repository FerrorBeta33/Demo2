import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CalculatorPage, { calculate } from './CalculatorPage';

afterEach(() => {
  vi.useRealTimers();
});

describe('calculator requirements', () => {
  it('AC-001: returns 30 for 10 + 20', () => {
    expect(calculate(10, 20, 'add')).toBe(30);
  });

  it('AC-002: displays an error for division by zero', () => {
    render(<CalculatorPage />);

    fireEvent.change(screen.getByLabelText('First number'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'divide' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate result' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Division by zero is not allowed.');
  });

  it('AC-003: prevents submission with an invalid email', () => {
    render(<CalculatorPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form') as HTMLFormElement);

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address before submitting.');
    expect(screen.queryByText('Thanks — your mock submission was successful.')).not.toBeInTheDocument();
  });

  it('AC-004: displays success after a valid mock submission', async () => {
    vi.useFakeTimers();
    render(<CalculatorPage />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '555-0100' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Please follow up.' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form') as HTMLFormElement);

    expect(screen.getByRole('button', { name: 'Sending mock submission…' })).toBeDisabled();
    await vi.advanceTimersByTimeAsync(250);
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Thanks — your mock submission was successful.')
    );
  });
});
