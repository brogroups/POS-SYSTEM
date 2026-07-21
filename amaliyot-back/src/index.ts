import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import apiRoutes from './routes';
import { connectDB } from './config/db';
import { createServer } from 'http';
import { initSocket } from './config/socket';
import { authMiddleware } from './middleware/auth';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS — production da barcha originlarga ruxsat (frontendni deploy qilgandan so'ng cheklash mumkin)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

// Translate hardcoded branch_id '1' or 1 to valid MongoDB ObjectId
app.use((req: any, res: any, next: any) => {
  if (req.body && (req.body.branch_id === 1 || req.body.branch_id === '1')) {
    req.body.branch_id = '000000000000000000000001';
  }
  if (req.query && (req.query.branch_id === '1')) {
    req.query.branch_id = '000000000000000000000001';
  }
  next();
});

// Swagger sozlamalari (faqat development da yoqiladi)
if (NODE_ENV !== 'production') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Restoran API (PostgreSQL)',
        version: '1.0.0',
        description: 'Restoran boshqaruvi tizimi barcha jadvallari uchun API hujjatlari',
      },
      servers: [{ url: `/api` }],
    },
    apis: ['./src/routes/*.ts', './src/index.ts'], 
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Health check endpoint (Railway monitoring uchun)
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    message: 'Restoran boshqaruvi API ishlamoqda',
    env: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Barcha generated API marshrutlarini /api prefiksi bilan ulash
app.use('/api', apiRoutes);

// Xatoliklarni ushlash
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ichki server xatosi!', message: err.message });
});

const httpServer = createServer(app);
initSocket(httpServer);

// Railway 0.0.0.0 da tinglaydi
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`✅ Server port ${PORT} da ishga tushdi (${NODE_ENV})`);
  if (NODE_ENV !== 'production') {
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
  }
});
