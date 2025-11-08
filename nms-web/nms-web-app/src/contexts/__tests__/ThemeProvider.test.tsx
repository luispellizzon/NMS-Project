// src/contexts/ThemeProvider.test.tsx
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

// Mock window.matchMedia for next-themes
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('wraps children with NextThemesProvider', () => {
    const { container } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('accepts custom props', () => {
    render(
      <ThemeProvider attribute="data-theme" defaultTheme="dark">
        <div data-testid="custom-theme-child">Custom Theme</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('custom-theme-child')).toBeInTheDocument();
  });
});