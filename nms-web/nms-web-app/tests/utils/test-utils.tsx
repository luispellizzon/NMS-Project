// test/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Add custom render function with providers if needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
};

export const mockFirebaseError = (code: string, message: string) => ({
  code,
  message,
  name: 'FirebaseError',
});