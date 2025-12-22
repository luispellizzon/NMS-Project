// test/utils/logger.ts 
import fs from 'fs';
import path from 'path';

// --- Conditional File Logging Setup ---
let logStream: fs.WriteStream | null = null;

if (process.env.ENABLE_TEST_LOG_FILE === 'true') {
  const logDir = path.join(process.cwd(), '.logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = `test-run-${new Date().toISOString().replace(/:/g, '-')}.log`;
  logStream = fs.createWriteStream(path.join(logDir, logFile), { flags: 'a' });

  console.log(`[Test Logger] File logging enabled. Outputting to: ${logFile}`);

  process.on('exit', () => {
    if (logStream) {
      logStream.end();
    }
  });
}

// --- Console Logging Setup ---
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LogLevels: { [key in LogLevel]: number } = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel =
  (process.env.TEST_LOG_LEVEL?.toUpperCase() as LogLevel) in LogLevels
    ? LogLevels[process.env.TEST_LOG_LEVEL!.toUpperCase() as LogLevel]
    : LogLevels.INFO;

const serializeArg = (arg: unknown): string => {
  // Specifically handle Error objects for better debugging
  if (arg instanceof Error) {
    return arg.stack || arg.message;
  }
  // Handle objects (but not null) with JSON.stringify
  if (typeof arg === 'object' && arg !== null) {
    return JSON.stringify(arg, null, 2);
  }
  // Coerce all other primitives to string
  return String(arg);
};

function formatMessage(level: LogLevel, isForConsole: boolean, ...args: unknown[]): string {
  const message = args.map(serializeArg).join(' ');

  if (isForConsole) {
    let color = colors.reset;
    switch (level) {
      case 'DEBUG': color = colors.cyan; break;
      case 'INFO': color = colors.green; break;
      case 'WARN': color = colors.yellow; break;
      case 'ERROR': color = colors.red; break;
    }
    return `${new Date().toLocaleTimeString()} [${color}${level}${colors.reset}] ${message}`;
  }
  
  return `${new Date().toISOString()} [${level}] ${message}\n`;
}

const log = (level: LogLevel, ...args: unknown[]) => {
  if (LogLevels[level] >= currentLogLevel) {
    console.log(formatMessage(level, true, ...args));
    
    if (logStream) {
      logStream.write(formatMessage(level, false, ...args));
    }
  }
};

export const testLogger = {
  debug: (...args: unknown[]) => log('DEBUG', ...args),
  info: (...args: unknown[]) => log('INFO', ...args),
  warn: (...args: unknown[]) => log('WARN', ...args),
  error: (...args: unknown[]) => log('ERROR', ...args),
};