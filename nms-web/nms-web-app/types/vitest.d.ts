// types/vitest.d.ts
import type { testLogger } from '../tests/utils/logger';

declare global {
  var testLogger: typeof testLogger;
}