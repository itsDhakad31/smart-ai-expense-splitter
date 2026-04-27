# Smart Expense Splitter

A beginner-friendly full-stack expense sharing app built with React (Vite) and Node.js (Express).

## Features

- Create a single active group with a name and member list
- Add expenses with equal or custom splits
- Auto-calculate balances after every expense
- Generate a clean settlement summary like "Alice owes Bob Rs 200"
- Show AI-powered categories and spending insights through the backend
- Update the UI instantly after every change without refreshing the page

## Project Structure

```text
client/   React + Vite frontend
server/   Express API backend
README.md Setup, architecture, and deployment notes
```

## Architecture Overview

The app uses a simple client-server flow:

1. The React frontend collects group and expense data from forms.
2. The Express backend stores the active group and expenses in memory.
3. Every time an expense is added, the backend recalculates balances and settlements.
4. AI routes on the backend call OpenAI when an API key is available, then fall back to local logic when it is not.

### Balance Calculation Logic

Each expense affects balances in two steps:

1. The person who paid gets credited for the full amount.
2. Every member who benefited from the expense gets debited for their share.

If Alice pays `Rs 900` for Alice, Bob, and Carol equally:

- Alice: `+900 - 300 = +600`
- Bob: `-300`
- Carol: `-300`

Positive balance means that member should receive money.
Negative balance means that member owes money.

The settlement summary is built by matching debtors with creditors until every balance is settled.

## How To Run Locally

### 1. Install dependencies

Open two terminals or run the commands one after another:

```bash
cd server
npm install
```

```bash
cd client
npm install
```

Use Node.js `18+` so the backend can use the built-in `fetch` API.

### 2. Add environment variables

 In that case:

- Expense categorization falls back to local keyword matching
- Insights fall back to local rule-based summaries

### 3. Start the backend

```bash
cd server
npm run dev
```

### 4. Start the frontend

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## API Endpoints

- `GET /api/health` - health check
- `GET /api/state` - fetch current group, expenses, balances, and settlements
- `POST /api/group` - create or replace the active group
- `POST /api/expenses` - add a new expense
- `POST /api/ai/categorize` - suggest a category from a description
- `POST /api/ai/insights` - generate short spending insights

## Deployment Notes

### Frontend on netlify

- Set the root directory to `client`
- Add `VITE_API_BASE_URL` pointing to your deployed backend URL

### Backend on Render or Railway

- Set the root directory to `server`
- Use `npm start` as the production start command

## Important Limitation

This project uses in-memory storage on the backend, so data resets when the server restarts. That keeps the project simple for learning and demos.
