import express from 'express';
import classifyRoutes from './routes/classify.routes.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use("/api/classify",classifyRoutes)

export default app;