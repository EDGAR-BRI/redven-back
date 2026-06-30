import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';

// Routes
import authRoutes from './modules/auth/auth.routes';
import sosRoutes from './modules/sos/sos.routes';
import personsRoutes from './modules/persons/persons.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import chatRoutes from './modules/chat/chat.routes';
import resourcesRoutes from './modules/resources/resources.routes';
import reportsRoutes from './modules/reports/reports.routes';
import volunteersRoutes from './modules/volunteers/volunteers.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

// Cron jobs
import { startScrapingCron } from './cron/scrape-persons';
import { startSeismicCron } from './cron/seismic-scan';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/persons', personsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 RedVen API running on port ${env.PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health: http://localhost:${env.PORT}/health`);

  // Start cron jobs in production
  if (env.NODE_ENV === 'production') {
    startScrapingCron();
    startSeismicCron();
  }
});

export default app;
