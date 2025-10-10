// vitest.setup.ts

import dotenv from 'dotenv';
import '@testing-library/jest-dom';
import { testLogger } from './tests/utils/logger';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

globalThis.testLogger = testLogger;