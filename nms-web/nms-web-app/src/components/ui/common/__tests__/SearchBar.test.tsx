// src/components/ui/common/SearchBar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GenericSearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnClear.mockClear();
  });

  it('renders search input with default placeholder', () => {
    render(<GenericSearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<GenericSearchBar value="" onChange={mockOnChange} placeholder="Search patients..." />);

    const input = screen.getByPlaceholderText('Search patients...');
    expect(input).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    render(<GenericSearchBar value="test query" onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    render(<GenericSearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'new text' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('shows clear button when value is not empty and onClear is provided', () => {
    render(<GenericSearchBar value="test" onChange={mockOnChange} onClear={mockOnClear} />);

    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<GenericSearchBar value="" onChange={mockOnChange} onClear={mockOnClear} />);

    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('does not show clear button when onClear is not provided', () => {
    render(<GenericSearchBar value="test" onChange={mockOnChange} />);

    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(<GenericSearchBar value="test" onChange={mockOnChange} onClear={mockOnClear} />);

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('renders search icon', () => {
    const { container } = render(<GenericSearchBar value="" onChange={mockOnChange} />);

    // Check for search icon (lucide-react renders as svg)
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<GenericSearchBar value="" onChange={mockOnChange} className="custom-class" />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('custom-class');
  });

  it('applies custom iconClassName', () => {
    const { container } = render(
      <GenericSearchBar value="" onChange={mockOnChange} iconClassName="custom-icon-class" />
    );

    const searchIcon = container.querySelector('.custom-icon-class');
    expect(searchIcon).toBeInTheDocument();
  });

  it('has correct input attributes', () => {
    render(<GenericSearchBar value="test" onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('test');
    expect(input).toHaveAttribute('type', 'text');
  });
});