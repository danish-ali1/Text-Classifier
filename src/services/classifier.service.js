import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../middlewares/error.js';

export const CATEGORIES = ['Complaint', 'Query', 'Feedback', 'Other'];
const CERTAINTY_LEVELS = ['high', 'medium', 'low'];

// Our own mapping from the model's certainty level to a numeric confidence.
const CONFIDENCE_MAP = { high: 0.9, medium: 0.6, low: 0.3 };

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a text classifier for customer messages.
Classify the user's text into exactly one category:
- Complaint: dissatisfaction, a problem, or a negative experience
- Query: a question or request for information or help
- Feedback: praise, suggestions, or general opinions about a product or service
- Other: anything that fits none of the above
Also rate your certainty in the chosen category:
- high: the text clearly and unambiguously fits one category
- medium: the category is plausible but the text could fit another
- low: the text is ambiguous or you are mostly guessing`;

// Constrains Gemini to return valid JSON in this exact shape.

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, enum: CATEGORIES },
    certainty: { type: Type.STRING, enum: CERTAINTY_LEVELS },
  },
  required: ['category', 'certainty'],
};

// Validate what the model returned, then clamp and round confidence ourselves.
const resultSchema = z
  .object({
    category: z.enum(CATEGORIES),
    certainty: z.enum(CERTAINTY_LEVELS),
  })
  .transform(({ category, certainty }) => ({
    category,
    confidence: CONFIDENCE_MAP[certainty],
  }));

export async function classifyText(text) {
  let response;
  try {
    response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0,
      },
    });
  } catch (err) {
    console.error('Gemini request failed:', err);
    if (err.status === 429) {
      throw new HttpError(503, 'AI service is rate limited, try again shortly');
    }
    throw new HttpError(502, 'AI service request failed');
  }

  try {
    return resultSchema.parse(JSON.parse(response.text));
  } catch (err) {
    console.error('Unexpected AI response:', response.text, err);
    throw new HttpError(502, 'AI service returned an invalid response');
  }
}