// src/components/ui/common/Pagination.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('renders all page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    const currentPageButton = screen.getByText('3').closest('button');
    expect(currentPageButton).toHaveClass('bg-primary');
  });

  it('disables Prev button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByText('Prev').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByText('Next').closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('enables both buttons on middle page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByText('Prev').closest('button');
    const nextButton = screen.getByText('Next').closest('button');

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onPageChange when clicking a page number', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking Next', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByText('Next').closest('button');
    if (nextButton) {
      fireEvent.click(nextButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    }
  });

  it('calls onPageChange when clicking Prev', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByText('Prev').closest('button');
    if (prevButton) {
      fireEvent.click(prevButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    }
  });

  it('does not call onPageChange when Prev is clicked on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByText('Prev').closest('button');
    if (prevButton) {
      fireEvent.click(prevButton);
      expect(mockOnPageChange).not.toHaveBeenCalled();
    }
  });

  it('does not call onPageChange when Next is clicked on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByText('Next').closest('button');
    if (nextButton) {
      fireEvent.click(nextButton);
      expect(mockOnPageChange).not.toHaveBeenCalled();
    }
  });

  it('renders single page correctly', () => {
    render(<Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('1')).toBeInTheDocument();

    const prevButton = screen.getByText('Prev').closest('button');
    const nextButton = screen.getByText('Next').closest('button');

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});