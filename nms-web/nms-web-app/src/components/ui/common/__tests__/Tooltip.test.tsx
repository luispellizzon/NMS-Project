// src/components/ui/common/Tooltip.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tooltip from '../Tooltip';

describe('Tooltip', () => {
  it('renders children correctly', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders tooltip content', () => {
    render(
      <Tooltip content="This is a tooltip">
        <span>Target</span>
      </Tooltip>
    );

    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();
  });

  it('tooltip content is initially hidden', () => {
    render(
      <Tooltip content="Hidden tooltip">
        <div>Content</div>
      </Tooltip>
    );

    const tooltipContent = screen.getByText('Hidden tooltip');
    expect(tooltipContent).toHaveClass('opacity-0');
  });

  it('tooltip content has hover class', () => {
    render(
      <Tooltip content="Hover tooltip">
        <div>Content</div>
      </Tooltip>
    );

    const tooltipContent = screen.getByText('Hover tooltip');
    expect(tooltipContent).toHaveClass('group-hover:opacity-100');
  });

  it('renders with correct positioning classes', () => {
    render(
      <Tooltip content="Positioned tooltip">
        <div>Content</div>
      </Tooltip>
    );

    const tooltipContent = screen.getByText('Positioned tooltip');
    expect(tooltipContent).toHaveClass('bottom-full', 'left-1/2', '-translate-x-1/2', 'mb-2');
  });

  it('renders with proper styling classes', () => {
    render(
      <Tooltip content="Styled tooltip">
        <div>Content</div>
      </Tooltip>
    );

    const tooltipContent = screen.getByText('Styled tooltip');
    expect(tooltipContent).toHaveClass(
      'bg-gray-800',
      'text-white',
      'text-xs',
      'rounded-md',
      'px-2',
      'py-1'
    );
  });

  it('renders tooltip arrow', () => {
    const { container } = render(
      <Tooltip content="Tooltip with arrow">
        <div>Content</div>
      </Tooltip>
    );

    const arrow = container.querySelector('.border-t-gray-800');
    expect(arrow).toBeInTheDocument();
  });

  it('wraps children in a group container', () => {
    const { container } = render(
      <Tooltip content="Grouped tooltip">
        <div>Content</div>
      </Tooltip>
    );

    const groupContainer = container.querySelector('.group');
    expect(groupContainer).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Tooltip content="Multiple children">
        <button>Button</button>
        <span>Text</span>
      </Tooltip>
    );

    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});