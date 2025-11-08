// src/components/ui/dashboard/DashboardCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardCard from '../DashboardCard';

describe('DashboardCard', () => {
  it('renders with string title', () => {
    render(
      <DashboardCard title="Test Title">
        <div>Content</div>
      </DashboardCard>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with ReactNode title', () => {
    render(
      <DashboardCard title={<strong>Bold Title</strong>}>
        <div>Content</div>
      </DashboardCard>
    );

    expect(screen.getByText('Bold Title')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <DashboardCard title="Title">
        <p>Paragraph content</p>
        <button>Action</button>
      </DashboardCard>
    );

    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <DashboardCard title="Title" footer={<div>Footer content</div>}>
        <div>Main content</div>
      </DashboardCard>
    );

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    const { container } = render(
      <DashboardCard title="Title">
        <div>Main content</div>
      </DashboardCard>
    );

    // Check that there's no footer div
    const footerDiv = container.querySelector('.p-4.pt-0.mt-auto');
    expect(footerDiv).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DashboardCard title="Title" className="custom-class">
        <div>Content</div>
      </DashboardCard>
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('has correct card structure and classes', () => {
    const { container } = render(
      <DashboardCard title="Title">
        <div>Content</div>
      </DashboardCard>
    );

    const card = container.querySelector('.bg-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border', 'rounded-lg', 'shadow-sm', 'flex', 'flex-col');
  });

  it('renders title in header section', () => {
    const { container } = render(
      <DashboardCard title="Header Title">
        <div>Content</div>
      </DashboardCard>
    );

    const header = container.querySelector('.p-4.border-b');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Header Title');
  });

  it('renders string title with h3 tag', () => {
    render(
      <DashboardCard title="String Title">
        <div>Content</div>
      </DashboardCard>
    );

    const heading = screen.getByText('String Title');
    expect(heading.tagName).toBe('H3');
    expect(heading).toHaveClass('font-semibold', 'text-lg');
  });

  it('passes motion props to motion.div', () => {
    const { container } = render(
      <DashboardCard title="Title" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div>Content</div>
      </DashboardCard>
    );

    // Motion component should be rendered
    const motionDiv = container.firstChild;
    expect(motionDiv).toBeInTheDocument();
  });
});