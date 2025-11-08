// src/components/ui/common/Modal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<Modal {...defaultProps} />);

    const backdrop = container.querySelector('.bg-black\\/60');
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not close when clicking inside modal content', () => {
    render(<Modal {...defaultProps} />);

    const modalContent = screen.getByText('Modal Content');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders with custom maxWidth', () => {
    const { container } = render(<Modal {...defaultProps} maxWidth="max-w-4xl" />);

    const modalContainer = container.querySelector('.max-w-4xl');
    expect(modalContainer).toBeInTheDocument();
  });

  it('uses default maxWidth when not provided', () => {
    const { container } = render(<Modal {...defaultProps} />);

    const modalContainer = container.querySelector('.max-w-lg');
    expect(modalContainer).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <Modal {...defaultProps}>
        <div data-testid="custom-child">Custom Content</div>
        <button>Action Button</button>
      </Modal>
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(<Modal {...defaultProps} title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('has close button with X icon', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();

    // Check for the X icon (lucide-react renders as svg)
    const icon = closeButton.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});