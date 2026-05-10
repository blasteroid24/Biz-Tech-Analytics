import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'

import { env } from './config/env.js'
import { pool } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js'
import { adminInitMiddleware } from './middleware/adminInitMiddleware.js'

import Routes from './routes/api.js'
import adminRoutes from './routes/admin-routes.js'
import workerRoutes from './routes/worker-routes.js'

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express()

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Worker Productivity API',
      version: '1.0.0',
      description: 'AI-powered manufacturing dashboard API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(helmet())
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(morgan('dev'));
app.use(express.json());
app.set('trust proxy', true);
app.use(express.urlencoded({ extended: true }));

app.use("/", Routes)
app.use('/api/admin', adminInitMiddleware, adminRoutes);
app.use('/api/workers', adminInitMiddleware, workerRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const server = app.listen(parseInt(env.PORT), env.HOST, () => (console.log(`App is live at http://${env.HOST + ":" + env.PORT}`)))

const shutdown = async () => {
  console.log('Shutdown signal received...');
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('Postgres pool drained and closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during DB shutdown:', err);
      process.exit(1);
    }
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);