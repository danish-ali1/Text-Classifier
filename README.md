# Text Classification API

A small REST API that classifies text into Complaint, Query, Feedback or Other using Google's Gemini model. It returns the category and a confidence score.

Built with Node.js, Express 5, Zod and the `@google/genai` SDK.

## Requirements

- Node.js 22 or higher
- A free Gemini API key from https://aistudio.google.com/apikey

## Setup

```bash
git clone https://github.com/danish-ali1/Text-Classifier
cd text-classification-api
npm install
cp .env.example .env
```

Edit `.env` and set your key:

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API key (required) | none |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.8-flash` |
| `PORT` | Server port | `3000` |

The server validates these at startup and exits with a clear message if the key is missing.

## Run

```bash
npm run dev     # auto-restarts on file changes
npm start       # production-style start
```

## API

### `POST /api/classify`

**Request**

```json
{ "text": "My order arrived late and damaged" }
```

`text` is required: a non-empty string of at most 2000 characters.

**Response `200`**

```json
{ "category": "Complaint", "confidence": 0.9 }
```

**Example**

```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text":"My order arrived late and damaged"}'
```

### `GET /health`

Returns `{ "status": "ok" }`.

### Errors

All errors use the shape `{ "error": "message" }`.

| Status | Cause |
|---|---|
| 400 | Missing, empty or too-long `text`, or malformed JSON |
| 404 | Unknown route |
| 413 | Request body over 10kb |
| 502 | AI request failed or returned an invalid response |
| 503 | AI service rate limited |
| 500 | Unexpected server error |

## Project structure

```
src/
  config/env.js                    env loading and validation
  routes/classify.routes.js        routing
  controllers/classify.controller.js   request validation, response shaping
  services/classifier.service.js   Gemini integration and confidence mapping
  middleware/error.js              404 and centralized error handler
  app.js                           Express app setup
  server.js                        entry point
```

## How AI was used

In the product: each request is sent to Gemini with a system prompt that defines the four categories. The model is constrained with a JSON response schema to return a `category` and a `certainty` level (`high`, `medium` or `low`). Gemini's self-reported numeric confidence is poorly calibrated, so the API maps the certainty level to a number itself:

| Certainty | Confidence |
|---|---|
| high | 0.9 |
| medium | 0.6 |
| low | 0.3 |

Output is re-validated with Zod, temperature is set to 0 for consistent results, and user text is passed separately from the instructions to reduce prompt-injection risk.

**In development:** I used Claude as a pair-programming assistant to plan the structure, review design choices and build the project step by step. I reviewed, ran and tested all code myself.

## Postman

Import `postman/text-classification-api.postman_collection.json` and set the `baseUrl` variable (default `http://localhost:3000`).