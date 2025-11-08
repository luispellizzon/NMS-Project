// src/components/ui/common/Breadcrumbs.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from '../Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders single breadcrumb item', () => {
    const items = [{ label: 'Home' }];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders multiple breadcrumb items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Patients', href: '/patients' },
      { label: 'John Doe' },
    ];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Patients', href: '/patients' },
    ];
    render(<Breadcrumbs items={items} />);

    const homeLink = screen.getByText('Home');
    const patientsLink = screen.getByText('Patients');

    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    expect(patientsLink.closest('a')).toHaveAttribute('href', '/patients');
  });

  it('renders span for items without href', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ];
    render(<Breadcrumbs items={items} />);

    const currentPage = screen.getByText('Current Page');
    expect(currentPage.tagName).toBe('SPAN');
    expect(currentPage).toHaveClass('font-semibold');
  });

  it('renders chevron separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Patients', href: '/patients' },
      { label: 'Detail' },
    ];
    const { container } = render(<Breadcrumbs items={items} />);

    // Should have 2 chevrons for 3 items
    const chevrons = container.querySelectorAll('svg');
    expect(chevrons.length).toBe(2);
  });

  it('does not render chevron before first item', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Patients' },
    ];
    const { container } = render(<Breadcrumbs items={items} />);

    // Get all divs and check that the first one doesn't have a chevron
    const allDivs = container.querySelectorAll('nav > div');
    const firstItem = allDivs[0];
    const chevronInFirst = firstItem?.querySelector('svg');

    // First item should not have a chevron SVG
    expect(chevronInFirst).toBeNull();
  });

  it('has correct aria-label for navigation', () => {
    const items = [{ label: 'Home', href: '/' }];
    render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('renders ReactNode labels', () => {
    const items = [
      { label: <strong>Bold Home</strong>, href: '/' },
      { label: <em>Italic Patients</em> },
    ];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Bold Home')).toBeInTheDocument();
    expect(screen.getByText('Italic Patients')).toBeInTheDocument();
  });

  it('handles empty items array', () => {
    const { container } = render(<Breadcrumbs items={[]} />);

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav?.children.length).toBe(0);
  });
});