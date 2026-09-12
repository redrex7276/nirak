import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrations';
import { runSeed } from './db/seed';
import db from './db/database';

import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import freelancerRoutes from './routes/freelancerRoutes';
import smsRoutes from './routes/smsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Run Migrations and Seed if fresh DB
try {
  runMigrations();
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as any;
  if (!userCount || userCount.count === 0) {
    runSeed();
  }
} catch (err) {
  console.error('Database initialization error:', err);
}

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    database: 'sqlite-relational',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Consistent 404 Handler for /api routes
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `The requested API endpoint ${req.method} ${req.path} was not found.`
      }
    });
  }
  next();
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred. Please try again.'
    }
  });
});

// Only listen if not imported by tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Shramik Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;
