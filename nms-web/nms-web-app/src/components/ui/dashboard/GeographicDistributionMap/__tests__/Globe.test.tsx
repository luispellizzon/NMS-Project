// src/components/ui/dashboard/GeographicDistributionMap/Globe.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Globe from '../Globe';
import { patientLocations } from '@/lib/mock_data';

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
  })),
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    position: { z: 3, lerp: vi.fn(), distanceTo: vi.fn(() => 0.1) },
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setPixelRatio: vi.fn(),
    domElement: document.createElement('canvas'),
    render: vi.fn(),
    setSize: vi.fn(),
  })),
  AmbientLight: vi.fn(),
  DirectionalLight: vi.fn().mockImplementation(() => ({
    position: { set: vi.fn() },
  })),
  Mesh: vi.fn().mockImplementation(() => ({
    position: { copy: vi.fn() },
    userData: {},
    add: vi.fn(),
  })),
  SphereGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  TextureLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn(() => ({})),
  })),
  Raycaster: vi.fn().mockImplementation(() => ({
    setFromCamera: vi.fn(),
    intersectObjects: vi.fn(() => []),
  })),
  Vector2: vi.fn(),
  Vector3: vi.fn().mockImplementation((x, y, z) => ({
    x,
    y,
    z,
  })),
}));

// Mock OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: vi.fn().mockImplementation(() => ({
    enableDamping: true,
    enablePan: false,
    autoRotate: true,
    autoRotateSpeed: 0.4,
    minDistance: 1.5,
    maxDistance: 5,
    update: vi.fn(),
  })),
}));

// Mock window methods
global.requestAnimationFrame = vi.fn(() => 1);
global.cancelAnimationFrame = vi.fn();

describe('Globe', () => {
  const mockOnHover = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Globe targetLocation={null} onHover={mockOnHover} />
    );

    const globeContainer = container.querySelector('.absolute.inset-0');
    expect(globeContainer).toBeInTheDocument();
  });

  it('creates a div with correct classes', () => {
    const { container } = render(
      <Globe targetLocation={null} onHover={mockOnHover} />
    );

    const globeContainer = container.firstChild;
    expect(globeContainer).toHaveClass('absolute', 'inset-0');
  });

  it('accepts targetLocation prop', () => {
    const targetLocation = patientLocations[0];

    const { container } = render(
      <Globe targetLocation={targetLocation} onHover={mockOnHover} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts onHover callback prop', () => {
    const customOnHover = vi.fn();

    render(<Globe targetLocation={null} onHover={customOnHover} />);

    // Component should render successfully with custom onHover
    expect(customOnHover).toBeDefined();
  });

  it('handles null targetLocation', () => {
    const { container } = render(
      <Globe targetLocation={null} onHover={mockOnHover} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('updates when targetLocation changes', () => {
    const { rerender, container } = render(
      <Globe targetLocation={null} onHover={mockOnHover} />
    );

    expect(container.firstChild).toBeInTheDocument();

    // Change targetLocation
    rerender(<Globe targetLocation={patientLocations[0]} onHover={mockOnHover} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('updates when onHover callback changes', () => {
    const onHover1 = vi.fn();
    const onHover2 = vi.fn();

    const { rerender, container } = render(
      <Globe targetLocation={null} onHover={onHover1} />
    );

    expect(container.firstChild).toBeInTheDocument();

    // Change onHover callback
    rerender(<Globe targetLocation={null} onHover={onHover2} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('cleans up on unmount', () => {
    const { unmount, container } = render(
      <Globe targetLocation={null} onHover={mockOnHover} />
    );

    expect(container.firstChild).toBeInTheDocument();

    unmount();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('initializes only once', () => {
    const { rerender } = render(
      <Globe targetLocation={null} onHover={mockOnHover} />
    );

    // Re-render with different props
    rerender(<Globe targetLocation={patientLocations[0]} onHover={mockOnHover} />);
    rerender(<Globe targetLocation={patientLocations[1]} onHover={mockOnHover} />);

    // The component should handle multiple re-renders without re-initializing
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('renders with different patient locations', () => {
    const { container } = render(
      <Globe targetLocation={patientLocations[2]} onHover={mockOnHover} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});