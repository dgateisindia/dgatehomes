const healthRepository = require('../repositories/healthRepository');

/**
 * Checks system and database health status.
 * @returns {Promise<{ isHealthy: boolean, response: { status: string, database: string } }>}
 */
async function checkHealth() {
  try {
    const isConnected = await healthRepository.checkDatabaseConnectivity();
    if (isConnected) {
      return {
        isHealthy: true,
        response: {
          status: 'ok',
          database: 'connected',
        },
      };
    }

    return {
      isHealthy: false,
      response: {
        status: 'error',
        database: 'disconnected',
      },
    };
  } catch (error) {
    // Log safe server-side message without leaking connection details in the response
    console.error('Database connectivity check failed:', error.message || error.code || error);
    return {
      isHealthy: false,
      response: {
        status: 'error',
        database: 'disconnected',
      },
    };
  }
}

module.exports = {
  checkHealth,
};
