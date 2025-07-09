'use strict';

import Fastify from 'fastify';
import mercurius from 'mercurius';
import { graphql } from 'graphql';
import { buildSchema } from './src/schema/schema.js';
import { resolvers } from './src/resolvers/resolvers.js';
import { databaseService } from './src/services/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    })
  }
});

// Register Mercurius GraphQL plugin
await fastify.register(mercurius, {
  schema: buildSchema(),
  resolvers,
  graphiql: process.env.NODE_ENV !== 'production',
  path: '/graphql',
  subscription: false
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return { 
    message: 'CIK GraphQL API',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      health: '/health'
    }
  };
});

// Initialize database connection
try {
  await databaseService.initialize();
  fastify.log.info('Database connection established');
} catch (error) {
  fastify.log.error('Failed to connect to database:', error);
  process.exit(1);
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await databaseService.close();
    fastify.log.info('Database connection closed');
    
    await fastify.close();
    fastify.log.info('Fastify server closed');
    
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
    fastify.log.info(`GraphQL endpoint: http://${host}:${port}/graphql`);
    
    if (process.env.NODE_ENV !== 'production') {
      fastify.log.info(`GraphiQL interface: http://${host}:${port}/graphql`);
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
