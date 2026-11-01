import express from 'express';
import classifyRoutes from './routes/classify.routes.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use("/api/classify",classifyRoutes)

app.use(notFound);
app.use(errorHandler);

export default app;