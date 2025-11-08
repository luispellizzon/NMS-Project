// src/components/ui/common/FullScreenLoader.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FullScreenLoader from '../FullScreenLoader';

describe('FullScreenLoader', () => {
  it('renders loading text', () => {
    render(<FullScreenLoader />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders loading spinner icon', () => {
    const { container } = render(<FullScreenLoader />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has correct backdrop classes', () => {
    const { container } = render(<FullScreenLoader />);

    const backdrop = container.querySelector('.fixed');
    expect(backdrop).toHaveClass('inset-0', 'z-50', 'backdrop-blur-sm');
  });

  it('centers content', () => {
    const { container } = render(<FullScreenLoader />);

    const backdrop = container.querySelector('.fixed');
    expect(backdrop).toHaveClass('flex', 'items-center', 'justify-center');
  });
});