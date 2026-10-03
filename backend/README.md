# Coding Contest — Backend

Express + MongoDB + Socket.io backend for the Online Coding Contest Platform.

## Setup

```bash
npm install
cp .env.example .env
# edit .env with your secrets
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Start production server |
| `npm run seed:admin` | Seed admin user |
| `npm run seed:problems` | Seed sample problems |

## Environment

See `.env.example`.

## API

Base URL: `http://localhost:5002/api`

Health check: `GET /api/health`

> Keep the frontend `VITE_API_URL` in sync with the backend port defined in `.env`.