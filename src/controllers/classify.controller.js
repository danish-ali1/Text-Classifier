import { z } from 'zod';
import { classifyText } from '../services/classifier.service.js';

const bodySchema = z.object({
  text: z
    .string({ error: '`text` is required and must be a string' })
    .trim()
    .min(1, '`text` must not be empty')
    .max(2000, '`text` must be at most 2000 characters'),
});

export async function classify(req, res) {
  const parsed = bodySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: parsed.error.issues.map((i) => i.message),
    });
  }

  const result = await classifyText(parsed.data.text);
  res.json(result);
}