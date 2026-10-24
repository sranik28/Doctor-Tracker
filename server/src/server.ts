import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { startKeepAlive } from './utils/keep-alive.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const start = async (): Promise<void> => {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.info(`[server] Listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const keepAliveUrl = env.KEEP_ALIVE_URL ?? env.RENDER_EXTERNAL_URL;
  const stopKeepAlive =
    env.NODE_ENV === 'production' && keepAliveUrl ? startKeepAlive(keepAliveUrl) : undefined;

  let shuttingDown = false;

  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    stopKeepAlive?.();
    console.info(`[server] ${signal} received, shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      console.error('[server] Forced shutdown after timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(() => {
      disconnectDB()
        .then(() => process.exit(0))
        .catch((error: unknown) => {
          console.error('[server] Error during shutdown:', error);
          process.exit(1);
        });
    });
  };

  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled rejection:', reason);
    shutdown('unhandledRejection');
  });
};

void start();
