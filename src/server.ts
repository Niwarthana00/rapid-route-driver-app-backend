import app from './app';
import { env } from './config/env';
import { initDatabase } from './config/db';

const PORT = parseInt(env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // Attempt database initialization & migrations if postgres is available
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Rapid Route Driver API Server listening on port ${PORT}`);
      console.log(`📡 Base API Endpoint: http://localhost:${PORT}/api/v1/driver`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
