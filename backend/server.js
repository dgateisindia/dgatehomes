const app = require('./src/app');
const config = require('./src/config/env');
const { pool, testConnection } = require('./src/config/db');
const { validateCloudinaryConfig } = require('./src/config/cloudinary');

async function startServer() {
  console.log(`Starting Dgate Homes Backend in ${config.nodeEnv} mode...`);

  // Initial database connectivity check
  try {
    await testConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${config.db.database}`);
  } catch (error) {
    // Log server warning without leaking sensitive credentials
    console.warn(`[Database Warning] Initial database connection check failed: ${error.message || error.code || error}`);
    console.warn(`[Database Warning] Server will start, but database operations may fail until MySQL is accessible.`);
  }

  // Cloudinary media service configuration validation
  validateCloudinaryConfig();

  const server = app.listen(config.port, () => {
    console.log(`[Server] Dgate Homes API listening on port ${config.port}`);
    console.log(`[Server] Health check endpoint: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);

    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await pool.end();
        console.log('[Database] MySQL connection pool closed.');
      } catch (err) {
        console.error('[Database Error] Error while closing MySQL pool:', err.message);
      }
      process.exit(0);
    });

    // Force shutdown after timeout if pending connections hang
    setTimeout(() => {
      console.error('[Server] Force shutdown timeout exceeded. Exiting.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('[Server] Uncaught Exception:', error);
    process.exit(1);
  });
}

startServer();
